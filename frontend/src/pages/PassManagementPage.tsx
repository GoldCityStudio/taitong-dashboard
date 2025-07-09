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
  CircularProgress,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ConfirmationNumber as PassIcon,
  Sync as SyncIcon
} from '@mui/icons-material';

// Mock data interface
interface Pass {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'standard' | 'vip' | 'family' | 'special';
  duration: 'day' | 'week' | 'month' | 'year';
  isActive: boolean;
}

// API URL
const API_URL = 'http://localhost:4000/api/tickets';

const PassManagementPage: React.FC = () => {
  // State for passes
  const [passes, setPasses] = useState<Pass[]>([]);
  const [open, setOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState<Pass | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    type: 'standard',
    duration: 'day'
  });

  // Fetch passes on component mount
  useEffect(() => {
    fetchPasses();
  }, []);

  // Function to fetch passes from the backend
  const fetchPasses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/packages`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setPasses(data.data || []);
    } catch (err) {
      console.error('Error fetching passes:', err);
      setError('Failed to load passes');
      setPasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      type: 'standard',
      duration: 'day'
    });
    setIsEditing(false);
    setOpen(true);
  };

  const handleEdit = (pass: Pass) => {
    setFormData({
      name: pass.name,
      description: pass.description,
      price: pass.price.toString(),
      type: pass.type,
      duration: pass.duration
    });
    setCurrentPass(pass);
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

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      setError('Please fill out all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        type: formData.type as any,
        duration: formData.duration as any,
        isActive: true,
        iconName: 'confirmation_num',
        colorCode: '#1976D2'
      };
      
      if (isEditing && currentPass) {
        // Update existing pass
        const url = `${API_URL}/packages/${currentPass.id}`;
        const response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Failed to update pass. Status: ${response.status}`);
        }

        const result = await response.json();
        
        // Optimistic update in state
        setPasses(passes.map(pass => 
          pass.id === currentPass.id ? result.data || {
            ...currentPass,
            ...payload
          } : pass
        ));
        
        setSyncSuccess(`Pass "${payload.name}" updated successfully`);
      } else {
        // Add new pass
        const response = await fetch(`${API_URL}/packages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Failed to add pass. Status: ${response.status}`);
        }

        const result = await response.json();
        
        // Add to state
        setPasses([...passes, result.data || {
          id: (passes.length + 1).toString(),
          ...payload
        }]);
        
        setSyncSuccess(`Pass "${payload.name}" added successfully`);
      }
      
      setOpen(false);
    } catch (err) {
      console.error('Error saving pass:', err);
      setError(`Failed to save pass: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Sync a pass with ticket packages
  const syncPassWithTicketPackages = async (pass: Pass) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/sync-pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to sync pass. Status: ${response.status}`);
      }
      
      const result = await response.json();
      setSyncSuccess(`Pass "${pass.name}" synced successfully with ticket packages`);
    } catch (err) {
      console.error('Error syncing pass:', err);
      setError(`Failed to sync pass: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Sync all passes with ticket packages
  const syncAllPasses = async () => {
    try {
      setLoading(true);
      
      // Sync each pass sequentially
      for (const pass of passes) {
        await syncPassWithTicketPackages(pass);
      }
      
      setSyncSuccess('All passes synced successfully with ticket packages');
    } catch (err) {
      console.error('Error syncing all passes:', err);
      setError(`Failed to sync all passes: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const getPassTypeColor = (type: string) => {
    switch (type) {
      case 'standard': return 'primary';
      case 'vip': return 'secondary';
      case 'family': return 'success';
      case 'special': return 'warning';
      default: return 'default';
    }
  };

  const getPassDurationLabel = (duration: string) => {
    switch (duration) {
      case 'day': return 'Daily';
      case 'week': return 'Weekly';
      case 'month': return 'Monthly';
      case 'year': return 'Annual';
      default: return duration;
    }
  };
  
  const handleCloseAlert = () => {
    setSyncSuccess(null);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pass?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/packages/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete pass. Status: ${response.status}`);
      }
      
      // Remove from state
      setPasses(passes.filter(pass => pass.id !== id));
      setSyncSuccess('Pass deleted successfully');
    } catch (err) {
      console.error('Error deleting pass:', err);
      setError(`Failed to delete pass: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pass Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create and manage passes for the theme park app
        </Typography>
      </Box>
      
      {/* Success and Error alerts */}
      <Snackbar
        open={!!syncSuccess || !!error}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {syncSuccess ? (
          <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
            {syncSuccess}
          </Alert>
        ) : (
          <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}
      </Snackbar>
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<SyncIcon />} 
          onClick={syncAllPasses}
          color="primary"
          disabled={loading}
        >
          Sync All Passes
        </Button>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleClickOpen}
          color="primary"
          disabled={loading}
        >
          Add New Pass
        </Button>
      </Box>

      {loading && passes.length === 0 ? (
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
                <TableCell>Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {passes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="textSecondary">
                        No passes found
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Add some passes to get started!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  passes.map((pass) => (
                <TableRow key={pass.id}>
                  <TableCell>{pass.name}</TableCell>
                  <TableCell>{pass.description}</TableCell>
                  <TableCell>${pass.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={pass.type.charAt(0).toUpperCase() + pass.type.slice(1)} 
                      color={getPassTypeColor(pass.type) as any} 
                      size="small" 
                    />
                  </TableCell>
                      <TableCell>
                        <Chip 
                          label={getPassDurationLabel(pass.duration)} 
                          variant="outlined"
                          size="small" 
                        />
                      </TableCell>
                  <TableCell>
                    <Chip 
                      label={pass.isActive ? 'Active' : 'Inactive'} 
                      color={pass.isActive ? 'success' : 'error'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                        <IconButton onClick={() => handleEdit(pass)} size="small">
                      <EditIcon />
                    </IconButton>
                        <IconButton onClick={() => handleDelete(pass.id)} size="small" color="error">
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

      {/* Dialog for adding/editing passes */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Pass' : 'Add New Pass'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              name="name"
              label="Pass Name"
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
              name="price"
              label="Price"
              type="number"
              fullWidth
              value={formData.price}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: <Box component="span" sx={{ mr: 0.5 }}>$</Box>,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Type"
                onChange={handleSelectChange}
              >
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="vip">VIP</MenuItem>
                <MenuItem value="family">Family</MenuItem>
                <MenuItem value="special">Special</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Duration</InputLabel>
              <Select
                name="duration"
                value={formData.duration}
                label="Duration"
                onChange={handleSelectChange}
              >
                <MenuItem value="day">Daily</MenuItem>
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
                <MenuItem value="year">Annual</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={loading || !formData.name || !formData.price}
          >
            {loading ? <CircularProgress size={24} /> : (isEditing ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PassManagementPage; 