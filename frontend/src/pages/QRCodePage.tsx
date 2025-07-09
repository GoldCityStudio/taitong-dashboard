import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import {
  Typography,
  Box,
  Button,
  Stack,
  Card,
  CardContent,
  CardActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  LinearProgress
} from '@mui/material';
import {
  Print as PrintIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  QrCode as QrCodeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

interface LocationQRCode {
  id: string;
  name: string;
  location: string;
  type: string;
  qrValue?: string;
}

const QRCodePage: React.FC = () => {
  const [locations, setLocations] = useState<LocationQRCode[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationQRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState<Omit<LocationQRCode, 'id'>>({
    name: '',
    location: '',
    type: 'attraction'
  });

  // Update the QR code options state to match the available props
  const [qrOptions, setQrOptions] = useState({
    size: 200,
    bgColor: '#FFFFFF',
    fgColor: '#000000',
    level: 'M' as 'L' | 'M' | 'Q' | 'H'
  });

  // Fetch locations with QR codes
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/api/qrcode');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setLocations(data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to fetch locations. Please try again later.');
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLocation(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setNewLocation(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLocation = async () => {
    try {
      setError(null);
      setSuccess(null);
      setOperationLoading(true);
      const response = await fetch('http://localhost:4000/api/qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLocation),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Add the new location with ID from the server
      setLocations(prev => [...prev, result.data]);
      setNewLocation({ name: '', location: '', type: 'attraction' });
      setOperationLoading(false);
      setSuccess(`Successfully added ${result.data.name} to locations`);
      
      // Auto-select the newly created location
      setSelectedLocation(result.data);
      
    } catch (err) {
      console.error('Error adding location:', err);
      setError('Failed to add location. Please try again.');
      setOperationLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      setError(null);
      setSuccess(null);
      setOperationLoading(true);
      
      // Find the location name before deleting it
      const locationToDelete = locations.find(loc => loc.id === id);
      const locationName = locationToDelete?.name || 'Location';
      
      const response = await fetch(`http://localhost:4000/api/qrcode/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Remove the deleted location from state
      setLocations(prev => prev.filter(location => location.id !== id));
      if (selectedLocation?.id === id) {
        setSelectedLocation(null);
      }
      setOperationLoading(false);
      setSuccess(`Successfully deleted ${locationName}`);
      
    } catch (err) {
      console.error('Error deleting location:', err);
      setError('Failed to delete location. Please try again.');
      setOperationLoading(false);
    }
  };

  const generateQrCodeValue = (location: LocationQRCode) => {
    // Use the qrValue from the API if it exists, otherwise generate one
    if (location.qrValue) {
      return location.qrValue;
    }
    
    // Create a URL with query parameters for more data
    const baseUrl = 'https://themepark.example.com/location';
    const params = new URLSearchParams({
      id: location.id,
      name: encodeURIComponent(location.name),
      type: location.type
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  const handlePrint = (location: LocationQRCode) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrOptions.size}x${qrOptions.size}&data=${encodeURIComponent(generateQrCodeValue(location))}&bgcolor=${qrOptions.bgColor.substring(1)}&color=${qrOptions.fgColor.substring(1)}&format=svg`;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${location.name}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .container { margin: 0 auto; max-width: 500px; }
              h1 { font-size: 24px; margin-bottom: 10px; }
              h2 { font-size: 18px; color: #666; margin-bottom: 20px; }
              .qr-code { margin: 20px 0; }
              .details { margin-top: 30px; text-align: left; }
              .footer { margin-top: 50px; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${location.name}</h1>
              <h2>${location.location}</h2>
              <div class="qr-code">
                <img src="${qrUrl}" alt="QR Code" />
              </div>
              <div class="details">
                <p><strong>ID:</strong> ${location.id}</p>
                <p><strong>Type:</strong> ${location.type}</p>
                <p><strong>URL:</strong> ${generateQrCodeValue(location)}</p>
              </div>
              <div class="footer">
                <p>Generated on ${new Date().toLocaleString()}</p>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'entrance': return 'primary';
      case 'attraction': return 'secondary';
      case 'service': return 'success';
      case 'shopping': return 'info';
      case 'food': return 'warning';
      case 'restroom': return 'error';
      default: return 'default';
    }
  };

  // Add a function to get details of a specific location
  const handleViewLocation = async (id: string) => {
    try {
      setError(null);
      setOperationLoading(true);
      
      // Check if location is already in local state before making API call
      const existingLocation = locations.find(loc => loc.id === id);
      if (existingLocation) {
        setSelectedLocation(existingLocation);
        setOperationLoading(false);
        return;
      }
      
      // If not in local state, fetch from API
      const response = await fetch(`http://localhost:4000/api/qrcode/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      setSelectedLocation(result.data);
      setOperationLoading(false);
      
    } catch (err) {
      console.error('Error fetching location details:', err);
      setError('Failed to load location details');
      setOperationLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          QR Code Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Generate and print QR codes for park locations
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {operationLoading && (
        <LinearProgress sx={{ mb: 2 }} />
      )}

      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={4} 
        sx={{ width: '100%' }}
      >
        <Box sx={{ width: { xs: '100%', md: '60%' } }}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add New Location
              </Typography>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Location Name"
                    name="name"
                    variant="outlined"
                    value={newLocation.name}
                    onChange={handleInputChange}
                    disabled={operationLoading}
                  />
                  <TextField
                    fullWidth
                    label="Area/Zone"
                    name="location"
                    variant="outlined"
                    value={newLocation.location}
                    onChange={handleInputChange}
                    disabled={operationLoading}
                  />
                </Stack>
                <FormControl fullWidth disabled={operationLoading}>
                  <InputLabel id="location-type-label">Location Type</InputLabel>
                  <Select
                    labelId="location-type-label"
                    name="type"
                    value={newLocation.type}
                    onChange={handleSelectChange}
                    label="Location Type"
                  >
                    <MenuItem value="entrance">Entrance</MenuItem>
                    <MenuItem value="attraction">Attraction</MenuItem>
                    <MenuItem value="service">Service</MenuItem>
                    <MenuItem value="shopping">Shopping</MenuItem>
                    <MenuItem value="food">Food & Beverage</MenuItem>
                    <MenuItem value="restroom">Restroom</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddLocation}
                disabled={!newLocation.name || !newLocation.location || operationLoading}
                color="primary"
              >
                {operationLoading ? 'Adding...' : 'Add Location'}
              </Button>
            </CardActions>
          </Card>

          <Typography variant="h6" gutterBottom>
            Park Locations
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locations.map((location) => (
                  <TableRow 
                    key={location.id} 
                    hover
                    onClick={() => handleViewLocation(location.id)}
                    sx={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedLocation?.id === location.id ? 'rgba(25, 118, 210, 0.08)' : 'inherit'
                    }}
                  >
                    <TableCell>{location.name}</TableCell>
                    <TableCell>{location.location}</TableCell>
                    <TableCell>
                      <Chip 
                        label={location.type.charAt(0).toUpperCase() + location.type.slice(1)} 
                        size="small"
                        color={getLocationTypeColor(location.type) as any}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<QrCodeIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewLocation(location.id);
                        }}
                        sx={{ mr: 1 }}
                        disabled={operationLoading}
                      >
                        View QR
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLocation(location.id);
                        }}
                        disabled={operationLoading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {locations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      No locations found. Add a new location to generate QR codes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '40%' } }}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4 }}>
              <Typography variant="h6" gutterBottom>
                QR Code Preview
              </Typography>
              
              {selectedLocation ? (
                <>
                  <Box sx={{ width: '100%', mb: 3 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                      {selectedLocation.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <LocationIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        {selectedLocation.location}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Chip 
                        label={selectedLocation.type.charAt(0).toUpperCase() + selectedLocation.type.slice(1)} 
                        color={getLocationTypeColor(selectedLocation.type) as any}
                      />
                    </Box>
                  </Box>
                  
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 3, 
                      backgroundColor: 'white', 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3
                    }}
                  >
                    <QRCode 
                      value={generateQrCodeValue(selectedLocation)} 
                      size={qrOptions.size} 
                      bgColor={qrOptions.bgColor}
                      fgColor={qrOptions.fgColor}
                      level={qrOptions.level}
                    />
                    
                    <Box sx={{ mt: 3, width: '100%' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        QR Code Options
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Quality</InputLabel>
                            <Select
                              value={qrOptions.level}
                              onChange={(e) => setQrOptions({...qrOptions, level: e.target.value as 'L' | 'M' | 'Q' | 'H'})}
                              label="Quality"
                            >
                              <MenuItem value="L">Low</MenuItem>
                              <MenuItem value="M">Medium</MenuItem>
                              <MenuItem value="Q">High</MenuItem>
                              <MenuItem value="H">Very High</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Size</InputLabel>
                            <Select
                              value={qrOptions.size.toString()}
                              onChange={(e) => setQrOptions({...qrOptions, size: Number(e.target.value)})}
                              label="Size"
                            >
                              <MenuItem value="150">Small</MenuItem>
                              <MenuItem value="200">Medium</MenuItem>
                              <MenuItem value="250">Large</MenuItem>
                              <MenuItem value="300">X-Large</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    URL: {generateQrCodeValue(selectedLocation)}
                  </Typography>
                  
                  <Divider sx={{ width: '100%', mb: 3 }} />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PrintIcon />}
                    onClick={() => handlePrint(selectedLocation)}
                    fullWidth
                  >
                    Print QR Code
                  </Button>
                </>
              ) : (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                  <QrCodeIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Select a location to preview and print its QR code
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
};

export default QRCodePage; 