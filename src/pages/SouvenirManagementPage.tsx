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
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingBag as SouvenirIcon
} from '@mui/icons-material';

// Souvenir data interface
interface Souvenir {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'clothing' | 'toys' | 'collectibles' | 'food' | 'accessories' | 'other';
  inStock: boolean;
  details?: string;
  createdAt?: string;
  updatedAt?: string;
}

const SouvenirManagementPage: React.FC = () => {
  // State for souvenirs
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [currentSouvenir, setCurrentSouvenir] = useState<Souvenir | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'clothing',
    inStock: true,
    details: ''
  });

  // Fetch souvenirs on component mount
  useEffect(() => {
    fetchSouvenirs();
  }, []);

  // Function to fetch souvenirs from the backend
  const fetchSouvenirs = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.taitongecopark.com/api/souvenir');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setSouvenirs(data.data || []);
    } catch (error) {
      console.error('Error fetching souvenirs:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load souvenirs. Using demo data.',
        severity: 'error'
      });
      // Fallback to demo data if API fails
      setSouvenirs([
        {
          id: '1',
          name: 'Theme Park T-Shirt',
          description: 'Comfortable cotton t-shirt with park logo',
          price: 24.99,
          imageUrl: 'https://via.placeholder.com/150?text=T-Shirt',
          category: 'clothing',
          inStock: true,
          details: 'Available in multiple sizes and colors. 100% cotton.'
        },
        {
          id: '2',
          name: 'Plush Mascot',
          description: 'Soft plush toy of our park mascot',
          price: 19.99,
          imageUrl: 'https://via.placeholder.com/150?text=Plush+Toy',
          category: 'toys',
          inStock: true,
          details: 'Child-safe materials. Recommended for ages 3+.'
        },
        {
          id: '3',
          name: 'Collectible Keychain',
          description: 'Metal keychain with park attractions',
          price: 9.99,
          imageUrl: 'https://via.placeholder.com/150?text=Keychain',
          category: 'collectibles',
          inStock: true,
          details: 'Die-cast metal with enamel finish.'
        },
        {
          id: '4',
          name: 'Park Map Poster',
          description: 'Detailed poster of the park map',
          price: 14.99,
          imageUrl: 'https://via.placeholder.com/150?text=Map+Poster',
          category: 'accessories',
          inStock: false,
          details: 'Size: 24"x36", printed on high-quality paper.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      category: 'clothing',
      inStock: true,
      details: ''
    });
    setIsEditing(false);
    setOpen(true);
  };

  const handleEdit = (souvenir: Souvenir) => {
    setFormData({
      name: souvenir.name,
      description: souvenir.description,
      price: souvenir.price.toString(),
      imageUrl: souvenir.imageUrl,
      category: souvenir.category,
      inStock: souvenir.inStock,
      details: souvenir.details || ''
    });
    setCurrentSouvenir(souvenir);
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
      [name]: value === "true" ? true : value === "false" ? false : value
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this souvenir?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api.taitongecopark.com/api/souvenir/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete souvenir');
      }

      await fetchSouvenirs();
      setSnackbar({
        open: true,
        message: 'Souvenir deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting souvenir:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete souvenir',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.imageUrl) {
      setSnackbar({
        open: true,
        message: 'Please fill out all required fields',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const url = isEditing
        ? `https://api.taitongecopark.com/api/souvenir/${currentSouvenir?.id}`
        : 'https://api.taitongecopark.com/api/souvenir';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl,
        category: formData.category,
        inStock: formData.inStock,
        details: formData.details
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'save'} souvenir`);
      }

      await fetchSouvenirs();
      setOpen(false);
      setSnackbar({
        open: true,
        message: `Souvenir ${isEditing ? 'updated' : 'added'} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving souvenir:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${isEditing ? 'update' : 'add'} souvenir`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'clothing': return 'primary';
      case 'toys': return 'secondary';
      case 'collectibles': return 'success';
      case 'food': return 'warning';
      case 'accessories': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Souvenir Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage souvenir items for the theme park app
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleClickOpen}
          color="primary"
          disabled={loading}
        >
          Add New Souvenir
        </Button>
      </Box>

      {loading && souvenirs.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50%' }}>
          <CircularProgress />
        </Box>
      ) : (
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <TableContainer component={Paper} sx={{ height: '100%', maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {souvenirs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="textSecondary">
                        No souvenirs found
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Add some souvenirs to get started!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  souvenirs.map((souvenir) => (
                <TableRow key={souvenir.id}>
                  <TableCell>{souvenir.name}</TableCell>
                  <TableCell>{souvenir.description}</TableCell>
                  <TableCell>${souvenir.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={souvenir.category.toUpperCase()} 
                      color={getCategoryColor(souvenir.category) as any} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={souvenir.inStock ? 'In Stock' : 'Out of Stock'} 
                      color={souvenir.inStock ? 'success' : 'error'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(souvenir)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(souvenir.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                  ))
                )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      )}

      {/* Dialog for adding/editing souvenirs */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Souvenir' : 'Add New Souvenir'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              name="name"
              label="Souvenir Name"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="details"
              label="Detailed Information"
              fullWidth
              multiline
              rows={4}
              value={formData.details}
              onChange={handleInputChange}
              helperText="Additional details about the souvenir"
            />
            <TextField
              name="price"
              label="Price ($)"
              fullWidth
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: <Box component="span" sx={{ mr: 0.5 }}>$</Box>,
              }}
            />
            <TextField
              name="imageUrl"
              label="Image URL"
              fullWidth
              value={formData.imageUrl}
              onChange={handleInputChange}
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
                <MenuItem value="clothing">Clothing</MenuItem>
                <MenuItem value="toys">Toys</MenuItem>
                <MenuItem value="collectibles">Collectibles</MenuItem>
                <MenuItem value="food">Food</MenuItem>
                <MenuItem value="accessories">Accessories</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Stock Status</InputLabel>
              <Select
                name="inStock"
                value={formData.inStock.toString()}
                label="Stock Status"
                onChange={handleSelectChange}
              >
                <MenuItem value="true">In Stock</MenuItem>
                <MenuItem value="false">Out of Stock</MenuItem>
              </Select>
            </FormControl>

            {/* Image preview */}
            {formData.imageUrl && (
              <Box sx={{ textAlign: 'center', border: '1px solid #eee', borderRadius: '8px', p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Image Preview</Typography>
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    borderRadius: '8px'
                  }} 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x150?text=Invalid+Image+URL';
                  }}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SouvenirManagementPage; 