const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'banner-' + uniqueSuffix + ext);
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

// In-memory storage for banners (in a real app, this would be a database)
let banners = [
  {
    id: '1',
    title: 'Summer Festival',
    imageUrl: 'https://example.com/summer-banner.jpg',
    linkUrl: '/events/summer-festival',
    section: 'home',
    priority: 1,
    isActive: true
  },
  {
    id: '2',
    title: 'VIP Pass Offer',
    imageUrl: 'https://example.com/vip-pass.jpg',
    linkUrl: '/passes/vip',
    section: 'pass',
    priority: 1,
    isActive: true
  },
  {
    id: '3',
    title: 'New Attraction Opening',
    imageUrl: 'https://example.com/new-attraction.jpg',
    linkUrl: '/attractions/new',
    section: 'discovery',
    priority: 1,
    isActive: true
  },
  {
    id: '4',
    title: 'Souvenir Sale',
    imageUrl: 'https://example.com/souvenir-sale.jpg',
    linkUrl: '/shop/sale',
    section: 'souvenir',
    priority: 1,
    isActive: true
  },
  {
    id: '5',
    title: 'Eco Conservation Day',
    imageUrl: 'https://example.com/eco-day.jpg',
    linkUrl: '/ecoforum/conservation-day',
    section: 'ecoforum',
    priority: 1,
    isActive: true
  }
];

// Get all banners
router.get('/', (req, res) => {
  const section = req.query.section;
  if (section) {
    const filteredBanners = banners.filter(banner => banner.section === section && banner.isActive);
    return res.json({ message: `Get banners for section: ${section}`, data: filteredBanners });
  }
  res.json({ message: 'Get all banners', data: banners });
});

// Get active banners
router.get('/active', (req, res) => {
  const activeBanners = banners.filter(banner => banner.isActive);
  res.json({ message: 'Get active banners', data: activeBanners });
});

// Get banner by ID
router.get('/:id', (req, res) => {
  const banner = banners.find(b => b.id === req.params.id);
  if (!banner) {
    return res.status(404).json({ message: 'Banner not found' });
  }
  res.json({ message: `Get banner with ID: ${req.params.id}`, data: banner });
});

// Create new banner with image upload
router.post('/', upload.single('image'), (req, res) => {
  try {
    const { title, linkUrl, section, priority, isActive } = req.body;
    
    let imageUrl;
    
    if (req.file) {
      // If an image was uploaded, use the file path
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      // If an imageUrl was provided in the request body, use that
      imageUrl = req.body.imageUrl;
    } else {
      // If no image was provided, return an error
      return res.status(400).json({ message: 'Image is required' });
    }
    
    const newBanner = {
      id: Date.now().toString(),
      title,
      imageUrl,
      linkUrl,
      section,
      priority: parseInt(priority, 10) || 1,
      isActive: isActive === 'true' || isActive === true
    };
    
    banners.push(newBanner);
    res.status(201).json({ message: 'Create new banner', data: newBanner });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ message: 'Error creating banner', error: error.message });
  }
});

// Update banner with image upload
router.put('/:id', upload.single('image'), (req, res) => {
  try {
    const index = banners.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    const oldBanner = banners[index];
    
    // If there's a new file uploaded, and the old file was a local upload
    if (req.file && oldBanner.imageUrl.startsWith('/uploads/')) {
      // Delete the old file (optional)
      try {
        const oldFilePath = path.join(__dirname, '..', 'public', oldBanner.imageUrl);
        fs.unlinkSync(oldFilePath);
      } catch (err) {
        console.error('Failed to delete old file:', err);
        // Continue even if deletion fails
      }
    }
    
    let imageUrl = oldBanner.imageUrl;
    
    if (req.file) {
      // If a new image was uploaded, use the new file path
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      // If a new imageUrl was provided in the request body, use that
      imageUrl = req.body.imageUrl;
    }
    
    banners[index] = {
      ...oldBanner,
      title: req.body.title || oldBanner.title,
      imageUrl: imageUrl,
      linkUrl: req.body.linkUrl || oldBanner.linkUrl,
      section: req.body.section || oldBanner.section,
      priority: req.body.priority ? parseInt(req.body.priority, 10) : oldBanner.priority,
      isActive: req.body.isActive !== undefined ? 
        (req.body.isActive === 'true' || req.body.isActive === true) : 
        oldBanner.isActive
    };
    
    res.json({ message: `Update banner with ID: ${req.params.id}`, data: banners[index] });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Error updating banner', error: error.message });
  }
});

// Delete banner
router.delete('/:id', (req, res) => {
  const index = banners.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Banner not found' });
  }
  
  const deletedBanner = banners[index];
  
  // If the banner has a local image, delete the file
  if (deletedBanner.imageUrl.startsWith('/uploads/')) {
    try {
      const filePath = path.join(__dirname, '..', 'public', deletedBanner.imageUrl);
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Failed to delete file:', err);
      // Continue even if deletion fails
    }
  }
  
  banners.splice(index, 1);
  
  res.json({ message: `Delete banner with ID: ${req.params.id}`, data: deletedBanner });
});

module.exports = router; 