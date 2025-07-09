import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardMedia,
  CardContent,
  Divider,
  SelectChangeEvent,
  useTheme,
  alpha,
  InputAdornment,
  Menu,
  Tooltip,
  Fade,
  Zoom,
  Container,
  Stack,
  Grid
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Visibility, 
  Close, 
  Search, 
  FilterList, 
  CheckCircle, 
  RemoveCircle, 
  Image, 
  Link as LinkIcon 
} from '@mui/icons-material';

interface DiscoveryItem {
  id: string;
  title: string;
  description: string;
  details: string;
  image: string;
  category: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const initialFormState: DiscoveryItem = {
  id: '',
  title: '',
  description: '',
  details: '',
  image: '',
  category: 'General',
  isActive: true
};

const categories = [
  'General',
  'Wildlife',
  'Farming',
  'Activities',
  'Nature',
  'Education',
  'Food',
  'History'
];

const DiscoveryPage: React.FC = () => {
  const theme = useTheme();
  const [discoveries, setDiscoveries] = useState<DiscoveryItem[]>([]);
  const [displayedDiscoveries, setDisplayedDiscoveries] = useState<DiscoveryItem[]>([]);
  const [formData, setFormData] = useState<DiscoveryItem>(initialFormState);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    fetchDiscoveries();
  }, []);

  useEffect(() => {
    filterDiscoveries();
  }, [discoveries, searchTerm, filterCategory, filterStatus]);

  const filterDiscoveries = () => {
    let filtered = [...discoveries];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(item => item.isActive === isActive);
    }
    
    setDisplayedDiscoveries(filtered);
  };

  const fetchDiscoveries = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/discovery');
      const data = await response.json();
      setDiscoveries(data.data || []);
    } catch (error) {
      console.error('Error fetching discoveries:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load discoveries',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string | boolean>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.image) {
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
        ? `http://localhost:4000/api/discovery/${formData.id}`
        : 'http://localhost:4000/api/discovery';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save discovery');
      }

      await fetchDiscoveries();
      setDialogOpen(false);
      resetForm();
      setSnackbar({
        open: true,
        message: `Discovery ${isEditing ? 'updated' : 'added'} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving discovery:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${isEditing ? 'update' : 'add'} discovery`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (discovery: DiscoveryItem) => {
    setFormData(discovery);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this discovery?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/discovery/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete discovery');
      }

      await fetchDiscoveries();
      setSnackbar({
        open: true,
        message: 'Discovery deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting discovery:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete discovery',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (discovery: DiscoveryItem) => {
    setFormData(discovery);
    setPreviewOpen(true);
  };

  const handleOpenFilterMenu = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilterMenu = () => {
    setFilterAnchorEl(null);
  };

  const isFilterActive = filterCategory !== 'all' || filterStatus !== 'all';

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Box mb={4} sx={{ position: 'relative' }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            borderRadius: 2,
            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)})`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
            <Visibility sx={{ fontSize: 180 }} />
          </Box>
          <Typography variant="h4" component="h1" fontWeight="bold" mb={1}>
            Discovery Management
          </Typography>
          <Typography variant="subtitle1">
            Create and manage discovery items to showcase in the park app
          </Typography>
        </Paper>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            placeholder="Search discoveries..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant={isFilterActive ? "contained" : "outlined"}
            color="primary"
            startIcon={<FilterList />}
            onClick={handleOpenFilterMenu}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Filter
            {isFilterActive && (
              <Chip
                label={
                  (filterCategory !== 'all' ? 1 : 0) + 
                  (filterStatus !== 'all' ? 1 : 0)
                }
                size="small"
                color="secondary"
                sx={{ ml: 1, height: 20, width: 20, '& .MuiChip-label': { p: 0 } }}
              />
            )}
          </Button>
          
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleCloseFilterMenu}
            TransitionComponent={Fade}
            PaperProps={{
              elevation: 3,
              sx: { width: 250, p: 1, borderRadius: 2 }
            }}
          >
            <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
              Filter by Category
            </Typography>
            <FormControl fullWidth size="small" sx={{ px: 2, mb: 2 }}>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                displayEmpty
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
              Filter by Status
            </Typography>
            <FormControl fullWidth size="small" sx={{ px: 2, mb: 1 }}>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                displayEmpty
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            
            <Box display="flex" justifyContent="flex-end" sx={{ px: 2, pt: 1 }}>
              <Button 
                size="small" 
                onClick={() => {
                  setFilterCategory('all');
                  setFilterStatus('all');
                }}
                disabled={!isFilterActive}
              >
                Clear Filters
              </Button>
            </Box>
          </Menu>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          sx={{ borderRadius: 2, px: 2 }}
        >
          Add Discovery
        </Button>
      </Box>

      <Paper 
        sx={{ 
          width: '100%', 
          overflow: 'hidden', 
          mb: 3, 
          borderRadius: 2,
          boxShadow: theme.shadows[2]
        }}
      >
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader size="small" sx={{ '& .MuiTableCell-root': { padding: '6px 16px' } }}>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    backgroundColor: theme.palette.grey[50], 
                    fontWeight: 'bold',
                    py: 1
                  }}
                >
                  Title
                </TableCell>
                <TableCell 
                  sx={{ 
                    backgroundColor: theme.palette.grey[50], 
                    fontWeight: 'bold',
                    py: 1
                  }}
                >
                  Category
                </TableCell>
                <TableCell 
                  sx={{ 
                    backgroundColor: theme.palette.grey[50], 
                    fontWeight: 'bold',
                    width: '35%',
                    py: 1
                  }}
                >
                  Description
                </TableCell>
                <TableCell 
                  sx={{ 
                    backgroundColor: theme.palette.grey[50], 
                    fontWeight: 'bold',
                    py: 1
                  }}
                >
                  Status
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    backgroundColor: theme.palette.grey[50], 
                    fontWeight: 'bold',
                    py: 1
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && displayedDiscoveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : displayedDiscoveries.length > 0 ? (
                displayedDiscoveries.map((discovery) => (
                  <TableRow 
                    key={discovery.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'all 0.2s',
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.light, 0.05) }
                    }}
                  >
                    <TableCell sx={{ py: 0.5 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          component="img"
                          src={discovery.image}
                          alt={discovery.title}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            objectFit: 'cover',
                            border: `1px solid ${theme.palette.divider}`
                          }}
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.src = 'https://via.placeholder.com/40?text=IMG';
                          }}
                        />
                        <Typography fontWeight="medium" fontSize="0.875rem">
                          {discovery.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Chip 
                        label={discovery.category} 
                        color="primary" 
                        variant="outlined" 
                        size="small" 
                        sx={{ fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 0.5, maxWidth: 300 }}>
                      <Typography 
                        noWrap 
                        title={discovery.description}
                        sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}
                      >
                        {discovery.description}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Chip
                        icon={discovery.isActive ? <CheckCircle fontSize="small" /> : <RemoveCircle fontSize="small" />}
                        label={discovery.isActive ? 'Active' : 'Inactive'}
                        color={discovery.isActive ? 'success' : 'default'}
                        size="small"
                        variant={discovery.isActive ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 0.5 }}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Preview" arrow>
                          <IconButton 
                            onClick={() => handlePreview(discovery)} 
                            size="small"
                            color="info"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit" arrow>
                          <IconButton 
                            onClick={() => handleEdit(discovery)} 
                            size="small"
                            color="primary"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                          <IconButton 
                            onClick={() => handleDelete(discovery.id)} 
                            size="small"
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No discoveries found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {searchTerm || isFilterActive ? 
                        "Try changing your search or filter criteria" : 
                        "Add some discoveries to get started!"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        fullWidth 
        maxWidth="md"
        TransitionComponent={Zoom}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: isEditing ? theme.palette.primary.light : theme.palette.primary.main,
          color: 'white',
          pb: 1
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            {isEditing ? <Edit /> : <Add />}
            <Typography variant="h6">
              {isEditing ? 'Edit Discovery Item' : 'Add New Discovery Item'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 100%', maxWidth: { xs: '100%', md: '48%' } }}>
              <TextField
                fullWidth
                margin="normal"
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Visibility fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                margin="normal"
                label="Image URL"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                required
                helperText="Enter a valid image URL"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl component="fieldset" margin="normal">
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <Select
                  name="isActive"
                  value={formData.isActive ? "true" : "false"}
                  onChange={handleSelectChange}
                  size="small"
                  variant="outlined"
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 100%', maxWidth: { xs: '100%', md: '48%' } }}>
              <TextField
                fullWidth
                margin="normal"
                label="Short Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                multiline
                rows={2}
                inputProps={{ maxLength: 120 }}
                helperText={`${formData.description.length}/120 characters`}
                variant="outlined"
              />
              <TextField
                fullWidth
                margin="normal"
                label="Detailed Information"
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                multiline
                rows={8}
                required
                variant="outlined"
              />
            </Box>
            <Box sx={{ flex: '1 1 100%', width: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Preview
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                p: 2, 
                bgcolor: alpha(theme.palette.primary.light, 0.05),
                borderRadius: 2,
                border: '1px dashed',
                borderColor: theme.palette.divider
              }}>
                {formData.image ? (
                  <Card sx={{ maxWidth: 300, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={formData.image}
                      alt={formData.title}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x180?text=Invalid+Image+URL';
                      }}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        {formData.title || 'Title'}
                      </Typography>
                      <Chip 
                        label={formData.category || 'Category'} 
                        size="small" 
                        color="primary" 
                        sx={{ mb: 1 }} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        {formData.description || 'Short description will appear here'}
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 4,
                      color: theme.palette.text.disabled
                    }}
                  >
                    <Image sx={{ fontSize: 40, mb: 2, opacity: 0.7 }} />
                    <Typography>
                      Enter image URL to see preview
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            color="inherit"
            startIcon={<Close />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? undefined : isEditing ? <Edit /> : <Add />}
          >
            {loading ? <CircularProgress size={24} /> : isEditing ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: { borderRadius: 2, overflow: 'hidden' }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Box
            component="img"
            src={formData.image}
            alt={formData.title}
            sx={{
              width: '100%',
              height: 250,
              objectFit: 'cover',
            }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = 'https://via.placeholder.com/800x250?text=Image+Not+Available';
            }}
          />
          
          {/* Gradient overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
            }}
          />
          
          {/* Close button */}
          <IconButton 
            onClick={() => setPreviewOpen(false)}
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.3)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.5)',
              }
            }}
          >
            <Close />
          </IconButton>
          
          {/* Title overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 3,
              color: 'white',
            }}
          >
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {formData.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip 
                label={formData.category} 
                color="primary" 
                size="small" 
                sx={{ bgcolor: 'white', color: theme.palette.primary.main }}
              />
              <Chip
                label={formData.isActive ? 'Active' : 'Inactive'}
                color={formData.isActive ? 'success' : 'default'}
                size="small"
                sx={{ bgcolor: formData.isActive ? theme.palette.success.main : 'rgba(255,255,255,0.3)' }}
              />
            </Box>
          </Box>
        </Box>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {formData.description}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" color="primary" gutterBottom>
                Details
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {formData.details}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            variant="contained"
            color="primary"
            onClick={() => {
              setPreviewOpen(false);
              handleEdit(formData);
            }}
            startIcon={<Edit />}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DiscoveryPage; 