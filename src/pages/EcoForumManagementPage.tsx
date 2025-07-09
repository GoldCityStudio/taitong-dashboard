import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Spa as EcoIcon
} from '@mui/icons-material';

// API URL
const API_URL = 'https://api.taitongecopark.com/api/forum';

// Data interface
interface EcoPost {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  author: string;
  date: string;
  category: string;
  isPublished: boolean;
}

const EcoForumManagementPage: React.FC = () => {
  const [ecoPosts, setEcoPosts] = useState<EcoPost[]>([]);
  const [open, setOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<EcoPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    author: '',
    date: '',
    category: 'conservation',
    isPublished: true
  });

  // Fetch posts from backend
  const fetchEcoPosts = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setEcoPosts(data.data.map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          imageUrl: post.imageUrl || '',
          author: post.author,
          date: post.timestamp ? post.timestamp.split('T')[0] : '',
          category: post.category || 'conservation',
          isPublished: true // or use a real field if available
        })));
      }
    } catch (error) {
      console.error('Error fetching eco forum posts:', error);
    }
  };

  useEffect(() => {
    fetchEcoPosts();
  }, []);

  const handleClickOpen = () => {
    setFormData({
      title: '',
      content: '',
      imageUrl: '',
      author: '',
      date: new Date().toISOString().split('T')[0],
      category: 'conservation',
      isPublished: true
    });
    setIsEditing(false);
    setOpen(true);
  };

  const handleEdit = (post: EcoPost) => {
    setFormData({
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      author: post.author,
      date: post.date,
      category: post.category,
      isPublished: post.isPublished
    });
    setCurrentPost(post);
    setIsEditing(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Delete post from backend
  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'admin' }) });
      await fetchEcoPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Add or update post in backend
  const handleSave = async () => {
    try {
      if (isEditing && currentPost) {
        // Update existing post
        await fetch(`${API_URL}/${currentPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            userId: 'admin' // Replace with real user ID if needed
          })
        });
      } else {
        // Add new post
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            userId: 'admin' // Replace with real user ID if needed
          })
        });
      }
      setOpen(false);
      await fetchEcoPosts();
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'conservation': return 'success';
      case 'sustainability': return 'primary';
      case 'recycling': return 'info';
      case 'education': return 'warning';
      case 'events': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Eco Forum Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage eco-friendly content and initiatives for the theme park app
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleClickOpen}
          color="primary"
        >
          Add New Post
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TableContainer component={Paper} sx={{ height: '100%' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Content Preview</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ecoPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.content.length > 50 ? `${post.content.substring(0, 50)}...` : post.content}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>{post.date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={post.category.toUpperCase()} 
                      color={getCategoryColor(post.category) as any} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={post.isPublished ? 'Published' : 'Draft'} 
                      color={post.isPublished ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(post)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => { console.log('Delete clicked', post.id); setDeleteId(post.id); }} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Dialog for adding/editing posts */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Post' : 'Add New Post'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              name="title"
              label="Post Title"
              fullWidth
              value={formData.title}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="content"
              label="Content"
              fullWidth
              multiline
              rows={5}
              value={formData.content}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="imageUrl"
              label="Image URL"
              fullWidth
              value={formData.imageUrl}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="author"
              label="Author"
              fullWidth
              value={formData.author}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="date"
              label="Date"
              type="date"
              fullWidth
              value={formData.date}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                label="Category"
                onChange={handleSelectChange}
              >
                <MenuItem value="conservation">Conservation</MenuItem>
                <MenuItem value="sustainability">Sustainability</MenuItem>
                <MenuItem value="recycling">Recycling</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="events">Events</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="isPublished"
                value={formData.isPublished}
                label="Status"
                onChange={handleSelectChange}
              >
                <MenuItem value="true">Published</MenuItem>
                <MenuItem value="false">Draft</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this post?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            onClick={async () => {
              if (deleteId) {
                await handleDelete(deleteId);
              }
              setDeleteId(null);
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={false}
        autoHideDuration={3000}
        onClose={() => {}}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => {}} severity="success" sx={{ width: '100%' }}>
          Post deleted successfully
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EcoForumManagementPage;