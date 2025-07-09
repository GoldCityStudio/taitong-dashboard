const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const dataPath = path.join(__dirname, '../public/data/forum_posts.json');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/forum');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'forum-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Initialize multer with configuration
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Ensure data file exists
const ensureDataFile = () => {
  if (!fs.existsSync(dataPath)) {
    const initialData = { data: [] };
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
  }
};

// GET /api/forum - fetch all posts
router.get('/', (req, res) => {
  ensureDataFile();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json({ success: true, data: data.data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error reading posts', error: error.message });
  }
});

// POST /api/forum - add a new post
router.post('/', upload.single('image'), (req, res) => {
  ensureDataFile();
  try {
    const { title, content, author, userId } = req.body;
    if (!title || !content || !author || !userId) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const post = {
      id: Date.now().toString(),
      title,
      content,
      author,
      userId,
      imageUrl: req.file ? `/uploads/forum/${req.file.filename}` : null,
      timestamp: new Date().toISOString(),
    };
    
    data.data.unshift(post); // Add to start of array
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding post', error: error.message });
  }
});

// PUT /api/forum/:id - update a post
router.put('/:id', upload.single('image'), (req, res) => {
  ensureDataFile();
  try {
    const { title, content, userId } = req.body;
    if (!title || !content || !userId) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const postIndex = data.data.findIndex(p => p.id === req.params.id);
    
    if (postIndex === -1) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Check if user owns the post
    if (data.data[postIndex].userId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post.' });
    }

    // If there's a new file uploaded, and the old file was a local upload
    if (req.file && data.data[postIndex].imageUrl && data.data[postIndex].imageUrl.startsWith('/uploads/forum/')) {
      // Delete the old file
      try {
        const oldFilePath = path.join(__dirname, '..', 'public', data.data[postIndex].imageUrl);
        fs.unlinkSync(oldFilePath);
      } catch (err) {
        console.error('Failed to delete old file:', err);
        // Continue even if deletion fails
      }
    }

    // Update post
    data.data[postIndex] = {
      ...data.data[postIndex],
      title,
      content,
      imageUrl: req.file ? `/uploads/forum/${req.file.filename}` : data.data[postIndex].imageUrl,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ success: true, data: data.data[postIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating post', error: error.message });
  }
});

// DELETE /api/forum/:id - delete a post by id
router.delete('/:id', (req, res) => {
  ensureDataFile();
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required.' });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const postIndex = data.data.findIndex(p => p.id === req.params.id);
    
    if (postIndex === -1) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Allow admin to delete any post
    if (data.data[postIndex].userId !== userId && userId !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post.' });
    }
    
    // If the post has an image, delete it
    if (data.data[postIndex].imageUrl && data.data[postIndex].imageUrl.startsWith('/uploads/forum/')) {
      try {
        const filePath = path.join(__dirname, '..', 'public', data.data[postIndex].imageUrl);
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to delete file:', err);
        // Continue even if deletion fails
      }
    }
    
    const deleted = data.data.splice(postIndex, 1);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    res.json({ success: true, data: deleted[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting post', error: error.message });
  }
});

module.exports = router; 