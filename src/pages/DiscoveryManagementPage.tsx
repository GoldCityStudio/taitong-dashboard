import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Tabs,
  Tab,
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
  CircularProgress,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Park as AttractionIcon,
  Event as EventIcon,
  ViewList as AllIcon
} from '@mui/icons-material';

// Mock data interfaces
interface Attraction {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: 'ride' | 'show' | 'dining' | 'shopping' | 'experience';
  isActive: boolean;
  details?: string;
}

interface Event {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  category: 'seasonal' | 'concert' | 'special' | 'daily';
  isActive: boolean;
}

// Combined interface for the "All" tab
interface DiscoveryItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: 'attraction' | 'event';
  category: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  originalId: string;
}

// API URL
const API_URL = 'https://api.taitongecopark.com/api/discovery';

// Type definition for tab value
type TabValue = 0 | 1 | 2;

const DiscoveryManagementPage: React.FC = () => {
  // Set tab value to 0 to show "All" tab by default
  const [tabValue, setTabValue] = useState<TabValue>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for data
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [allItems, setAllItems] = useState<DiscoveryItem[]>([]);

  // Dialog states
  const [openAttractionDialog, setOpenAttractionDialog] = useState(false);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAttractionId, setCurrentAttractionId] = useState<string | null>(null);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  // State for form
  const [attractionForm, setAttractionForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    category: 'ride',
    details: ''
  });

  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    startDate: '',
    endDate: '',
    category: 'seasonal'
  });

  // Alert states
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  // Fetch data on component mount
  useEffect(() => {
    console.log('Component mounted - fetching data immediately');
    fetchData();
    // Force initial tab to be 'All'
    setTabValue(0);
  }, []);

  // Update combined items whenever attractions or events change
  useEffect(() => {
    console.log('Updating allItems array - attractions:', attractions.length, 'events:', events.length);
    
    // Combine attractions and events into a single array
    const attractionItems: DiscoveryItem[] = attractions.map(attraction => ({
      id: `attraction-${attraction.id}`,
      name: attraction.name,
      description: attraction.description,
      imageUrl: attraction.imageUrl,
      type: 'attraction',
      category: attraction.category,
      isActive: attraction.isActive,
      originalId: attraction.id
    }));

    const eventItems: DiscoveryItem[] = events.map(event => ({
      id: `event-${event.id}`,
      name: event.name,
      description: event.description,
      imageUrl: event.imageUrl,
      type: 'event',
      category: event.category,
      isActive: event.isActive,
      startDate: event.startDate,
      endDate: event.endDate,
      originalId: event.id
    }));

    const combinedItems = [...attractionItems, ...eventItems];
    console.log('Setting allItems with', combinedItems.length, 'total items');
    setAllItems(combinedItems);
  }, [attractions, events]);

  const fetchData = async () => {
    console.log('Starting data fetch');
    setLoading(true);
    try {
      // Fetch real data from the API
      const response = await fetch(`${API_URL}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform the data to match our internal format
      const discoveryItems = data.data.map((item: any) => ({
        id: item.id,
        name: item.title,
        description: item.description,
        imageUrl: item.image,
        type: 'attraction',
        category: item.category,
        isActive: item.isActive,
        details: item.details,
        originalId: item.id
      }));
      
      // Set the attractions and all items
      setAttractions(discoveryItems);
      
      // For demo, we'll use empty events
      setEvents([]);
      
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching discovery data:', error);
      setError('Failed to load discovery data. Please try again later.');
      setLoading(false);
      
      // Fallback to demo data if API fetch fails
      const attractionsData = [
        {
          id: '1',
          name: 'Space Mountain',
          description: 'An exciting space-themed roller coaster in the dark',
          imageUrl: 'https://via.placeholder.com/300x200?text=Space+Mountain',
          category: 'ride' as 'ride',
          isActive: true
        },
        {
          id: '2',
          name: 'Jungle Cruise',
          description: 'A scenic boat ride through an exotic jungle',
          imageUrl: 'https://via.placeholder.com/300x200?text=Jungle+Cruise',
          category: 'experience' as 'experience',
          isActive: true
        },
        {
          id: '3',
          name: 'Main Street Restaurant',
          description: 'Classic dining experience with theme park favorites',
          imageUrl: 'https://via.placeholder.com/300x200?text=Restaurant',
          category: 'dining' as 'dining',
          isActive: true
        }
      ];
      
      setAttractions(attractionsData);
      setEvents([]);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    setTabValue(newValue);
  };

  // Attraction Dialog Handlers
  const handleOpenAttractionDialog = (attraction?: Attraction) => {
    if (attraction) {
      setAttractionForm({
        name: attraction.name,
        description: attraction.description,
        imageUrl: attraction.imageUrl,
        category: attraction.category,
        details: attraction.details || ''
      });
      setCurrentAttractionId(attraction.id);
      setIsEditing(true);
    } else {
      setAttractionForm({
        name: '',
        description: '',
        imageUrl: '',
        category: 'ride',
        details: ''
      });
      setCurrentAttractionId(null);
      setIsEditing(false);
    }
    setOpenAttractionDialog(true);
  };

  const handleCloseAttractionDialog = () => {
    setOpenAttractionDialog(false);
  };

  // Event Dialog Handlers
  const handleOpenEventDialog = (event?: Event) => {
    if (event) {
      setEventForm({
        name: event.name,
        description: event.description,
        imageUrl: event.imageUrl,
        startDate: event.startDate,
        endDate: event.endDate,
        category: event.category
      });
      setCurrentEventId(event.id);
      setIsEditing(true);
    } else {
      setEventForm({
        name: '',
        description: '',
        imageUrl: '',
        startDate: '',
        endDate: '',
        category: 'seasonal'
      });
      setCurrentEventId(null);
      setIsEditing(false);
    }
    setOpenEventDialog(true);
  };

  const handleCloseEventDialog = () => {
    setOpenEventDialog(false);
  };

  // Form change handlers
  const handleAttractionFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAttractionForm({
      ...attractionForm,
      [name]: value
    });
  };

  const handleAttractionSelectChange = (e: any) => {
    const { name, value } = e.target;
    setAttractionForm({
      ...attractionForm,
      [name]: value
    });
  };

  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEventForm({
      ...eventForm,
      [name]: value
    });
  };

  const handleEventSelectChange = (e: any) => {
    const { name, value } = e.target;
    setEventForm({
      ...eventForm,
      [name]: value
    });
  };

  // CRUD operations
  const handleSaveAttraction = async () => {
    // Validation
    if (!attractionForm.name || !attractionForm.description || !attractionForm.imageUrl) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Prepare the data for the API
      const discoveryData = {
        title: attractionForm.name,
        description: attractionForm.description,
        details: attractionForm.details || 'No additional details provided.',
        image: attractionForm.imageUrl,
        category: attractionForm.category,
        isActive: true
      };
      
      let response;
      let successMessage;
      
      if (isEditing && currentAttractionId) {
        // Update existing discovery
        response = await fetch(`${API_URL}/${currentAttractionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(discoveryData),
        });
        successMessage = 'Discovery updated successfully';
      } else {
        // Create new discovery
        response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(discoveryData),
        });
        successMessage = 'Discovery created successfully';
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Close dialog and reset form
      handleCloseAttractionDialog();
      
      // Refresh data
      fetchData();
      
      // Show success message
      setError(null);
      setAlertMessage(successMessage);
      setOpenAlert(true);
      setAlertSeverity('success');
    } catch (error) {
      console.error('Error saving discovery:', error);
      setError('Failed to save discovery. Please try again.');
      setAlertMessage('Failed to save discovery');
      setOpenAlert(true);
      setAlertSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = () => {
    if (isEditing && currentEventId) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === currentEventId
          ? {
              ...event,
              name: eventForm.name,
              description: eventForm.description,
              imageUrl: eventForm.imageUrl,
              startDate: eventForm.startDate,
              endDate: eventForm.endDate,
              category: eventForm.category as any
            }
          : event
      ));
    } else {
      // Add new event
      const newEvent: Event = {
        id: (events.length + 1).toString(),
        name: eventForm.name,
        description: eventForm.description,
        imageUrl: eventForm.imageUrl,
        startDate: eventForm.startDate,
        endDate: eventForm.endDate,
        category: eventForm.category as any,
        isActive: true
      };
      setEvents([...events, newEvent]);
    }
    setOpenEventDialog(false);
  };

  const handleDeleteAttraction = (id: string) => {
    setAttractions(attractions.filter(attraction => attraction.id !== id));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
  };

  // Helper functions
  const getAttractionCategoryColor = (category: string) => {
    switch (category) {
      case 'ride': return 'primary';
      case 'show': return 'secondary';
      case 'dining': return 'success';
      case 'shopping': return 'warning';
      case 'experience': return 'info';
      default: return 'default';
    }
  };

  const getEventCategoryColor = (category: string) => {
    switch (category) {
      case 'seasonal': return 'primary';
      case 'concert': return 'secondary';
      case 'special': return 'warning';
      case 'daily': return 'success';
      default: return 'default';
    }
  };

  const handleCloseAlert = () => {
    setError(null);
  };

  // Get category color for any item
  const getCategoryColor = (type: 'attraction' | 'event', category: string) => {
    if (type === 'attraction') {
      return getAttractionCategoryColor(category);
    } else {
      return getEventCategoryColor(category);
    }
  };

  const handleEditItem = (item: DiscoveryItem) => {
    if (item.type === 'attraction') {
      const attraction = attractions.find(a => a.id === item.originalId);
      if (attraction) {
        handleOpenAttractionDialog(attraction);
      }
    } else {
      const event = events.find(e => e.id === item.originalId);
      if (event) {
        handleOpenEventDialog(event);
      }
    }
  };

  const handleDeleteItem = async (item: DiscoveryItem) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );
    
    if (confirmDelete) {
      setLoading(true);
      
      try {
        const response = await fetch(`${API_URL}/${item.originalId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Refresh data
        fetchData();
        
        // Show success message
        setAlertMessage('Item deleted successfully');
        setOpenAlert(true);
        setAlertSeverity('success');
      } catch (error) {
        console.error('Error deleting item:', error);
        setAlertMessage('Failed to delete item');
        setOpenAlert(true);
        setAlertSeverity('error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Discovery Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage attractions and events for the theme park app
        </Typography>
      </Box>

      {/* Error alert */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Alert for success/error messages */}
      <Snackbar 
        open={openAlert} 
        autoHideDuration={6000} 
        onClose={() => setOpenAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenAlert(false)} 
          severity={alertSeverity}
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All" icon={<AllIcon />} iconPosition="start" />
          <Tab label="Attractions" icon={<AttractionIcon />} iconPosition="start" />
          <Tab label="Events" icon={<EventIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {tabValue === 0 && (
          <Box>
            <Button 
              variant="outlined"
              startIcon={<AttractionIcon />} 
              onClick={() => handleOpenAttractionDialog()}
              color="primary"
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Add Attraction
            </Button>
            <Button 
              variant="contained" 
              startIcon={<EventIcon />} 
              onClick={() => handleOpenEventDialog()}
              color="primary"
              disabled={loading}
            >
              Add Event
            </Button>
          </Box>
        )}
        {tabValue === 1 && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenAttractionDialog()}
            color="primary"
            disabled={loading}
          >
            Add Attraction
          </Button>
        )}
        {tabValue === 2 && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenEventDialog()}
            color="primary"
            disabled={loading}
          >
            Add Event
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50%' }}>
          <CircularProgress />
        </Box>
      ) : (
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {/* All Items Tab */}
        {tabValue === 0 && (
            <TableContainer component={Paper} sx={{ height: '100%', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)' }}>
            <Table stickyHeader>
              <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allItems.length === 0 ? (
                <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="h6" color="textSecondary">
                          No items found
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Add attractions or events to get started!
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    allItems.map((item) => (
                      <TableRow key={item.id} sx={{ 
                        '&:hover': { 
                          backgroundColor: '#f9f9f9' 
                        },
                        color: 'rgba(0, 0, 0, 0.87)', 
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                      }}>
                        <TableCell sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>{item.name}</TableCell>
                        <TableCell sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>{item.description}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.type === 'attraction' ? 'Attraction' : 'Event'} 
                            color={item.type === 'attraction' ? 'primary' : 'secondary'}
                            size="small" 
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.category.toUpperCase()} 
                            color={getCategoryColor(item.type, item.category) as any} 
                            size="small" 
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.isActive ? 'Active' : 'Inactive'} 
                            color={item.isActive ? 'success' : 'error'} 
                            size="small" 
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleEditItem(item)} size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteItem(item)} size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Attractions Tab */}
          {tabValue === 1 && (
            <TableContainer component={Paper} sx={{ height: '100%', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {attractions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="h6" color="textSecondary">
                          No attractions found
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Add some attractions to get started!
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    attractions.map((attraction) => (
                      <TableRow key={attraction.id} sx={{ 
                        '&:hover': { 
                          backgroundColor: '#f9f9f9' 
                        },
                        color: 'rgba(0, 0, 0, 0.87)', 
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                      }}>
                        <TableCell sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>{attraction.name}</TableCell>
                        <TableCell sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>{attraction.description}</TableCell>
                    <TableCell>
                      <Chip 
                        label={attraction.category.toUpperCase()} 
                        color={getAttractionCategoryColor(attraction.category) as any} 
                        size="small" 
                            sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={attraction.isActive ? 'Active' : 'Inactive'} 
                        color={attraction.isActive ? 'success' : 'error'} 
                        size="small" 
                            sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                          <IconButton onClick={() => handleOpenAttractionDialog(attraction)} size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteAttraction(attraction.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                    ))
                  )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

          {/* Events Tab */}
          {tabValue === 2 && (
            <TableContainer component={Paper} sx={{ height: '100%', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)' }}>
            <Table stickyHeader>
              <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Date Range</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="h6" color="textSecondary">
                          No events found
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Add some events to get started!
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow key={event.id} sx={{ 
                        '&:hover': { 
                          backgroundColor: '#f9f9f9' 
                        },
                        color: 'rgba(0, 0, 0, 0.87)', 
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                      }}>
                        <TableCell sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>{event.name}</TableCell>
                        <TableCell sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>{event.description}</TableCell>
                        <TableCell sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>{`${event.startDate} to ${event.endDate}`}</TableCell>
                    <TableCell>
                      <Chip 
                        label={event.category.toUpperCase()} 
                        color={getEventCategoryColor(event.category) as any} 
                        size="small" 
                            sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={event.isActive ? 'Active' : 'Inactive'} 
                        color={event.isActive ? 'success' : 'error'} 
                        size="small" 
                            sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                          <IconButton onClick={() => handleOpenEventDialog(event)} size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteEvent(event.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                    ))
                  )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      )}

      {/* Attraction Dialog */}
      <Dialog open={openAttractionDialog} onClose={handleCloseAttractionDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Attraction' : 'Add New Attraction'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              name="name"
              label="Attraction Name"
              fullWidth
              value={attractionForm.name}
              onChange={handleAttractionFormChange}
              required
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={attractionForm.description}
              onChange={handleAttractionFormChange}
              required
            />
            <TextField
              name="details"
              label="Detailed Description"
              fullWidth
              multiline
              rows={4}
              value={attractionForm.details}
              onChange={handleAttractionFormChange}
              helperText="Provide comprehensive details about this attraction"
            />
            <TextField
              name="imageUrl"
              label="Image URL"
              fullWidth
              value={attractionForm.imageUrl}
              onChange={handleAttractionFormChange}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={attractionForm.category}
                label="Category"
                onChange={handleAttractionSelectChange}
              >
                <MenuItem value="ride">Ride</MenuItem>
                <MenuItem value="show">Show</MenuItem>
                <MenuItem value="dining">Dining</MenuItem>
                <MenuItem value="shopping">Shopping</MenuItem>
                <MenuItem value="experience">Experience</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAttractionDialog}>Cancel</Button>
          <Button onClick={handleSaveAttraction} variant="contained">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Dialog */}
      <Dialog open={openEventDialog} onClose={handleCloseEventDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              name="name"
              label="Event Name"
              fullWidth
              value={eventForm.name}
              onChange={handleEventFormChange}
              required
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={eventForm.description}
              onChange={handleEventFormChange}
              required
            />
            <TextField
              name="imageUrl"
              label="Image URL"
              fullWidth
              value={eventForm.imageUrl}
              onChange={handleEventFormChange}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="startDate"
                label="Start Date"
                type="date"
                fullWidth
                value={eventForm.startDate}
                onChange={handleEventFormChange}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                name="endDate"
                label="End Date"
                type="date"
                fullWidth
                value={eventForm.endDate}
                onChange={handleEventFormChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={eventForm.category}
                label="Category"
                onChange={handleEventSelectChange}
              >
                <MenuItem value="seasonal">Seasonal</MenuItem>
                <MenuItem value="concert">Concert</MenuItem>
                <MenuItem value="special">Special</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEventDialog}>Cancel</Button>
          <Button onClick={handleSaveEvent} variant="contained">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DiscoveryManagementPage; 