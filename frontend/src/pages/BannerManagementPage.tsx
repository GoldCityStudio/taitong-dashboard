import React, { useState, useEffect, useRef } from 'react';
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
  Card,
  CardMedia,
  CardContent,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ViewCarousel as BannerIcon,
  Upload as UploadIcon,
  Image as ImageIcon
} from '@mui/icons-material';

// API URL
const API_URL = 'http://localhost:4000/api/banner';

// Banner interface
interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  section: 'home' | 'pass' | 'discovery' | 'souvenir' | 'ecoforum';
  priority: number;
  isActive: boolean;
}

const BannerManagementPage: React.FC = () => {
  // State
  const [banners, setBanners] = useState<Banner[]>([]);
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useUrlInput, setUseUrlInput] = useState(true);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    section: 'home',
    priority: 1,
    isActive: true
  });

  // Fetch banners from API
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setBanners(data.data || []);
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError('Failed to load banners. Using demo data.');
      // Fallback to demo data if API fails
      setBanners([
        {
          id: '1',
          title: 'Welcome to the Theme Park',
          imageUrl: 'https://via.placeholder.com/1200x675?text=Theme+Park+Banner',
          linkUrl: '/attractions',
          section: 'home',
          priority: 1,
          isActive: true
        },
        {
          id: '2',
          title: 'New Rides for 2023',
          imageUrl: 'https://via.placeholder.com/1200x675?text=New+Rides+Banner',
          linkUrl: '/discovery',
          section: 'discovery',
          priority: 1,
          isActive: true
        },
        {
          id: '3',
          title: 'Special Summer Passes',
          imageUrl: 'https://via.placeholder.com/1200x675?text=Summer+Passes+Banner',
          linkUrl: '/passes',
          section: 'pass',
          priority: 1,
          isActive: true
        },
        {
          id: '4',
          title: 'Exclusive Merchandise',
          imageUrl: 'https://via.placeholder.com/1200x675?text=Merchandise+Banner',
          linkUrl: '/souvenirs',
          section: 'souvenir',
          priority: 1,
          isActive: true
        },
        {
          id: '5',
          title: 'Environmental Initiatives',
          imageUrl: 'https://via.placeholder.com/1200x675?text=Eco+Forum+Banner',
          linkUrl: '/ecoforum',
          section: 'ecoforum',
          priority: 1,
          isActive: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setFormData({
      title: '',
      imageUrl: '',
      linkUrl: '',
      section: 'home',
      priority: 1,
      isActive: true
    });
    setImageFile(null);
    setImagePreview(null);
    setUseUrlInput(true);
    setIsEditing(false);
    setOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      section: banner.section,
      priority: banner.priority,
      isActive: banner.isActive
    });
    setCurrentBanner(banner);
    setImageFile(null);
    setImagePreview(banner.imageUrl.startsWith('http') 
      ? banner.imageUrl 
      : `http://localhost:4000${banner.imageUrl}`
    );
    setUseUrlInput(true);
    setIsEditing(true);
    setOpen(true);
  };

  const handlePreview = (banner: Banner) => {
    setCurrentBanner(banner);
    setPreviewOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value, 10)
    });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Remove from state
      setBanners(banners.filter(banner => banner.id !== id));
      setSuccess('Banner deleted successfully');
    } catch (err) {
      console.error('Error deleting banner:', err);
      setError('Failed to delete banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear the URL input when a file is selected
      setFormData({
        ...formData,
        imageUrl: ''
      });
      setUseUrlInput(false);
    }
  };

  const handleSwitchToUrl = () => {
    setUseUrlInput(true);
    setImageFile(null);
    setImagePreview(null);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSwitchToFile = () => {
    setUseUrlInput(false);
    setFormData({
      ...formData,
      imageUrl: ''
    });
    
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Create FormData object for file upload
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('linkUrl', formData.linkUrl);
      formDataObj.append('section', formData.section);
      formDataObj.append('priority', formData.priority.toString());
      formDataObj.append('isActive', formData.isActive.toString());
      
      // If using URL input, add imageUrl to FormData
      if (useUrlInput && formData.imageUrl) {
        formDataObj.append('imageUrl', formData.imageUrl);
      }
      
      // If using file upload, add the file to FormData
      if (imageFile) {
        formDataObj.append('image', imageFile);
      }
      
      // If neither URL nor file is provided, show error
      if (!useUrlInput && !imageFile && !formData.imageUrl) {
        setError('Please provide an image URL or upload a file');
        setLoading(false);
        return;
      }
      
      const url = isEditing && currentBanner 
        ? `${API_URL}/${currentBanner.id}` 
        : API_URL;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        body: formDataObj, // FormData handles the Content-Type header automatically
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (isEditing && currentBanner) {
        // Update in state
        setBanners(banners.map(banner => 
          banner.id === currentBanner.id ? result.data : banner
        ));
        setSuccess('Banner updated successfully');
      } else {
        // Add to state
        setBanners([...banners, result.data]);
        setSuccess('Banner added successfully');
      }
      
      setOpen(false);
    } catch (err) {
      console.error('Error saving banner:', err);
      setError('Failed to save banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'home': return 'primary';
      case 'pass': return 'secondary';
      case 'discovery': return 'info';
      case 'souvenir': return 'warning';
      case 'ecoforum': return 'success';
      default: return 'default';
    }
  };

  const getSectionLabel = (section: string) => {
    switch (section) {
      case 'home': return 'Home Page';
      case 'pass': return 'Pass Section';
      case 'discovery': return 'Discovery Section';
      case 'souvenir': return 'Souvenir Section';
      case 'ecoforum': return 'Eco Forum Section';
      default: return section;
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  // Format image URL for display
  const getFormattedImageUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url;
    } else {
      return `http://localhost:4000${url}`;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Banner Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage banner images for different sections of the theme park app
        </Typography>
      </Box>

      {/* Success and Error alerts */}
      <Snackbar
        open={!!success || !!error}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {success ? (
          <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        ) : (
          <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleClickOpen}
          color="primary"
          disabled={loading}
        >
          Add New Banner
        </Button>
      </Box>

      {loading && banners.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50%' }}>
          <CircularProgress />
        </Box>
      ) : (
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TableContainer component={Paper} sx={{ height: '100%' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="textSecondary">
                        No banners found
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Add a new banner to get started!
                      </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <Box
                        component="img"
                        sx={{
                          height: 60,
                          width: 100,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                        alt={banner.title}
                        src={getFormattedImageUrl(banner.imageUrl)}
                      />
                    </TableCell>
                    <TableCell>{banner.title}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getSectionLabel(banner.section)} 
                        color={getSectionColor(banner.section) as any} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{banner.priority}</TableCell>
                    <TableCell>
                      <Chip 
                        label={banner.isActive ? 'Active' : 'Inactive'} 
                        color={banner.isActive ? 'success' : 'error'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                        <IconButton onClick={() => handlePreview(banner)} size="small">
                        <ViewIcon />
                      </IconButton>
                        <IconButton onClick={() => handleEdit(banner)} size="small">
                        <EditIcon />
                      </IconButton>
                        <IconButton onClick={() => handleDelete(banner.id)} size="small" color="error">
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

      {/* Dialog for adding/editing banners */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              name="title"
              label="Banner Title"
              fullWidth
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
            
            {/* Image Upload Section */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Banner Image
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Recommended image dimensions: 1200×675px (16:9 ratio) for optimal display on all devices. 
                Images should be less than 5MB.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Button
                  variant={useUrlInput ? "contained" : "outlined"}
                  onClick={handleSwitchToUrl}
                  sx={{ mr: 1 }}
                  disabled={loading}
                >
                  Image URL
                </Button>
                <Button
                  variant={!useUrlInput ? "contained" : "outlined"}
                  onClick={handleSwitchToFile}
                  disabled={loading}
                >
                  Upload File
                </Button>
              </Box>
              
              {useUrlInput ? (
                <TextField
                  name="imageUrl"
                  label="Image URL"
                  fullWidth
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  required
                  helperText="Enter a URL for the banner image"
                  disabled={loading}
                />
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    disabled={loading}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    Select Image File
                  </Button>
                  {imageFile && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected file: {imageFile.name}
                    </Typography>
                  )}
                </Box>
              )}
              
              {/* Image Preview */}
              {(imagePreview || (!useUrlInput && formData.imageUrl)) && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Preview
                  </Typography>
                  <Box
                    component="img"
                    sx={{
                      maxHeight: 200,
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: 1
                    }}
                    alt="Image Preview"
                    src={imagePreview || getFormattedImageUrl(formData.imageUrl)}
                  />
                </Box>
              )}
            </Box>
            
            <TextField
              name="linkUrl"
              label="Link URL"
              fullWidth
              value={formData.linkUrl}
              onChange={handleInputChange}
              required
              helperText="Path or URL that the banner should link to"
              disabled={loading}
            />
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Section</InputLabel>
              <Select
                name="section"
                value={formData.section}
                label="Section"
                onChange={handleSelectChange}
              >
                <MenuItem value="home">Home Page</MenuItem>
                <MenuItem value="pass">Pass Section</MenuItem>
                <MenuItem value="discovery">Discovery Section</MenuItem>
                <MenuItem value="souvenir">Souvenir Section</MenuItem>
                <MenuItem value="ecoforum">Eco Forum Section</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="priority"
              label="Priority"
              type="number"
              fullWidth
              value={formData.priority}
              onChange={handleNumberChange}
              helperText="Lower numbers appear first (1 is highest priority)"
              inputProps={{ min: 1 }}
              disabled={loading}
            />
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Status</InputLabel>
              <Select
                name="isActive"
                value={formData.isActive}
                label="Status"
                onChange={handleSelectChange}
              >
                <MenuItem value={"true"}>Active</MenuItem>
                <MenuItem value={"false"}>Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={loading || !formData.title || (!formData.imageUrl && !imageFile) || !formData.linkUrl}
          >
            {loading ? <CircularProgress size={24} /> : (isEditing ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Banner Preview Dialog */}
      <Dialog open={previewOpen} onClose={handlePreviewClose} maxWidth="lg">
        <DialogTitle>Banner Preview</DialogTitle>
        <DialogContent>
          {currentBanner && (
            <Box>
              <Card>
                <CardMedia
                  component="img"
                  height="300"
                  image={getFormattedImageUrl(currentBanner.imageUrl)}
                  alt={currentBanner.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>{currentBanner.title}</Typography>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
                        Section:
                      </Typography>
                      <Chip 
                        label={getSectionLabel(currentBanner.section)} 
                        color={getSectionColor(currentBanner.section) as any} 
                        size="small" 
                      />
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
                        Link:
                      </Typography>
                      <Typography variant="body2">
                        {currentBanner.linkUrl}
                  </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
                        Priority:
                  </Typography>
                      <Typography variant="body2">
                        {currentBanner.priority}
                  </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
                        Status:
                  </Typography>
                      <Chip 
                        label={currentBanner.isActive ? 'Active' : 'Inactive'} 
                        color={currentBanner.isActive ? 'success' : 'error'} 
                        size="small" 
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreviewClose}>Close</Button>
          <Button 
            onClick={() => {
              handlePreviewClose();
              handleEdit(currentBanner!);
            }} 
            variant="contained"
            disabled={loading}
          >
            Edit This Banner
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BannerManagementPage; 