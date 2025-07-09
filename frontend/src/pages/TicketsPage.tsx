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
  InputAdornment,
  MenuItem,
  ListSubheader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EventNote as EventIcon,
  Person as PersonIcon,
  ConfirmationNumber as TicketIcon,
  CalendarToday as DayPassIcon,
  CardMembership as StandardPassIcon,
  Stars as VipPassIcon,
  Today as MonthlyIcon,
  DateRange as YearlyIcon,
  Edit as EditIcon
} from '@mui/icons-material';

interface Ticket {
  id: string;
  visitorName: string;
  ticketType: string;
  passType?: 'day' | 'standard' | 'vip';
  passDuration?: 'daily' | 'monthly' | 'yearly';
  price: number;
  date: string;
  isUsed: boolean;
  qrValue?: string;
  expiryDate: string;
  packageName: string;
  type: string;
  validDate: string;
}

const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([
    { 
      id: '1001', 
      visitorName: 'John Smith', 
      ticketType: 'Adult Day Pass', 
      price: 49.99, 
      date: '2023-06-15', 
      isUsed: false,
      expiryDate: '2023-06-30',
      packageName: 'Adult Day Pass',
      type: 'Adult Day Pass',
      validDate: '2023-06-15'
    },
    { 
      id: '1002', 
      visitorName: 'Emma Johnson', 
      ticketType: 'Child Day Pass', 
      price: 29.99, 
      date: '2023-06-15', 
      isUsed: false,
      expiryDate: '2023-06-30',
      packageName: 'Child Day Pass',
      type: 'Child Day Pass',
      validDate: '2023-06-15'
    },
    { 
      id: '1003', 
      visitorName: 'Michael Brown', 
      ticketType: 'Family Pass', 
      price: 129.99, 
      date: '2023-06-16', 
      isUsed: true,
      expiryDate: '2023-06-30',
      packageName: 'Family Pass',
      type: 'Family Pass',
      validDate: '2023-06-16'
    },
  ]);

  const [newTicket, setNewTicket] = useState<Omit<Ticket, 'id' | 'isUsed' | 'expiryDate' | 'packageName' | 'type' | 'validDate'>>({
    visitorName: '',
    ticketType: 'Adult Day Pass',
    passType: 'day',
    passDuration: 'daily',
    price: 49.99,
    date: new Date().toISOString().split('T')[0],
  });

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [manualPrice, setManualPrice] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const [newPrice, setNewPrice] = useState('');

  const [loading, setLoading] = useState(false);

  const ticketTypes = [
    // Single day passes
    { name: 'Adult Day Pass', price: 49.99, type: 'day', description: 'One-day entry for adults' },
    { name: 'Child Day Pass', price: 29.99, type: 'day', description: 'One-day entry for children under 12' },
    { name: 'Senior Day Pass', price: 39.99, type: 'day', description: 'One-day entry for seniors 65+' },
    { name: 'Family Day Pass', price: 129.99, type: 'day', description: 'One-day entry for 2 adults and 2 children' },
    
    // Standard passes
    { name: 'Standard Monthly Pass', price: 99.99, type: 'standard', duration: 'monthly', description: 'Unlimited entry for one month' },
    { name: 'Standard Yearly Pass', price: 899.99, type: 'standard', duration: 'yearly', description: 'Unlimited entry for one year' },
    
    // VIP passes
    { name: 'VIP Monthly Pass', price: 199.99, type: 'vip', duration: 'monthly', description: 'Unlimited entry and exclusive perks for one month' },
    { name: 'VIP Yearly Pass', price: 1799.99, type: 'vip', duration: 'yearly', description: 'Unlimited entry and exclusive perks for one year' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTicket(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    if (name === 'ticketType' && !manualPrice) {
      const selectedType = ticketTypes.find(type => type.name === value);
      setNewTicket(prev => ({ 
        ...prev, 
        [name]: value,
        price: selectedType ? selectedType.price : prev.price
      }));
    } else {
      setNewTicket(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(e.target.value);
    if (!isNaN(newPrice)) {
      setNewTicket(prev => ({ ...prev, price: newPrice }));
    }
  };

  const toggleManualPrice = () => {
    setManualPrice(!manualPrice);
  };

  const handleAddTicket = () => {
    const newId = Math.floor(1000 + Math.random() * 9000).toString();
    const selectedTicketDetails = getTicketDetails(newTicket.ticketType);
    
    const newTicketWithId = { 
      ...newTicket, 
      id: newId,
      passType: selectedTicketDetails.type as 'day' | 'standard' | 'vip',
      passDuration: selectedTicketDetails.duration ? 
        selectedTicketDetails.duration as 'daily' | 'monthly' | 'yearly' : 
        'daily',
      isUsed: false,
      expiryDate: new Date(newTicket.date).toISOString().split('T')[0],
      packageName: newTicket.ticketType,
      type: newTicket.ticketType,
      validDate: newTicket.date
    };
    
    setTickets(prev => [...prev, newTicketWithId]);
    setNewTicket({
      visitorName: '',
      ticketType: 'Adult Day Pass',
      passType: 'day',
      passDuration: 'daily',
      price: 49.99,
      date: new Date().toISOString().split('T')[0],
    });
  };

  const markTicketAsUsed = (id: string) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === id ? { ...ticket, isUsed: true } : ticket
      )
    );
    
    if (selectedTicket?.id === id) {
      setSelectedTicket({ ...selectedTicket, isUsed: true });
    }
  };

  const generateQrCodeValue = (ticket: Ticket) => {
    const qrData = {
      ticketId: ticket.id,
      visitorName: ticket.visitorName,
      packageName: ticket.packageName,
      type: ticket.type,
      validDate: ticket.validDate,
      isUsed: ticket.isUsed,
      expiryDate: ticket.expiryDate,
      passType: ticket.passType
    };
    return JSON.stringify(qrData);
  };

  const handlePrintTicket = (ticket: Ticket) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const ticketDetails = getTicketDetails(ticket.ticketType);
      const isPassTicket = ticket.passType === 'standard' || ticket.passType === 'vip';
      const borderColor = ticket.passType === 'vip' ? '#805ad5' : ticket.passType === 'standard' ? '#4fd1c5' : '#333';
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Ticket - ${ticket.visitorName}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .container { margin: 0 auto; max-width: 500px; border: 2px dashed ${borderColor}; padding: 20px; }
              h1 { font-size: 24px; margin-bottom: 5px; }
              h2 { font-size: 18px; color: #666; margin-bottom: 20px; }
              .qr-code { margin: 20px 0; }
              .ticket-details { margin-top: 20px; text-align: left; }
              .ticket-details table { width: 100%; }
              .ticket-details td { padding: 5px 0; }
              .ticket-details td:first-child { font-weight: bold; width: 40%; }
              .footer { margin-top: 30px; font-size: 12px; color: #999; }
              .price { font-size: 22px; font-weight: bold; color: #000; margin: 15px 0; }
              .instructions { margin-top: 20px; text-align: left; font-size: 14px; }
              .benefits { margin-top: 15px; text-align: left; background-color: #f9f9f9; padding: 10px; border-radius: 5px; }
              .benefits-title { font-weight: bold; margin-bottom: 10px; }
              .benefit-item { margin-bottom: 5px; }
              .pass-type { display: inline-block; padding: 5px 10px; font-weight: bold; border-radius: 4px; margin-top: 10px; }
              .vip-pass { background-color: #805ad5; color: white; }
              .standard-pass { background-color: #4fd1c5; color: white; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Theme Park Ticket</h1>
              <h2>${ticket.ticketType}</h2>
              
              ${ticket.passType === 'vip' ? 
                '<div class="pass-type vip-pass">VIP ACCESS</div>' : 
                ticket.passType === 'standard' ? 
                '<div class="pass-type standard-pass">STANDARD PASS</div>' : ''}
              
              <h2 style="color: ${ticket.passType === 'vip' ? '#ba68c8' : '#42a5f5'}; font-size: 28px; margin: 10px 0;">
                HKD ${ticket.price.toFixed(2)}
                ${isCustomPrice(ticket) ? '<span style="background-color: #29b6f6; color: white; font-size: 12px; padding: 3px 8px; border-radius: 12px; margin-left: 8px; vertical-align: middle;">CUSTOM PRICE</span>' : ''}
              </h2>
              
              <div class="qr-code">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateQrCodeValue(ticket))}" alt="QR Code" />
              </div>
              
              <div class="ticket-details">
                <table>
                  <tr>
                    <td>Visitor Name:</td>
                    <td>${ticket.visitorName}</td>
                  </tr>
                  <tr>
                    <td>Ticket ID:</td>
                    <td>${ticket.id}</td>
                  </tr>
                  <tr>
                    <td>Valid Date:</td>
                    <td>${ticket.date}${(ticket.passDuration === 'monthly' || ticket.passDuration === 'yearly') ? 
                      ` + ${ticket.passDuration === 'monthly' ? '1 month' : '1 year'}` : ''}</td>
                  </tr>
                  <tr>
                    <td>Status:</td>
                    <td>${ticket.isUsed ? '<span style="color: red">Used</span>' : '<span style="color: green">Valid</span>'}</td>
                  </tr>
                </table>
              </div>
              
              ${ticketDetails.description ? 
                `<p style="font-style: italic;">${ticketDetails.description}</p>` : ''}
              
              ${isPassTicket ? `
                <div class="benefits">
                  <div class="benefits-title">Pass Benefits:</div>
                  <div class="benefit-item">✓ Unlimited park entry</div>
                  ${ticket.passType === 'standard' ? `
                    <div class="benefit-item">✓ 10% discount on food and merchandise</div>
                    <div class="benefit-item">✓ Free parking</div>
                  ` : ''}
                  ${ticket.passType === 'vip' ? `
                    <div class="benefit-item">✓ 25% discount on food and merchandise</div>
                    <div class="benefit-item">✓ Free premium parking</div>
                    <div class="benefit-item">✓ Priority access to all attractions</div>
                    <div class="benefit-item">✓ Exclusive VIP lounge access</div>
                  ` : ''}
                </div>
              ` : ''}
              
              <div class="instructions">
                <p><strong>Instructions:</strong></p>
                <ol>
                  <li>Present this ticket at the park entrance.</li>
                  <li>The QR code will be scanned for verification.</li>
                  <li>${isPassTicket ? 'Bring photo ID for membership verification.' : 'This ticket is valid only for the date shown above.'}</li>
                  <li>No refunds or exchanges are permitted.</li>
                </ol>
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

  const getTicketGroups = () => {
    const dayPasses = ticketTypes.filter(ticket => ticket.type === 'day');
    const standardPasses = ticketTypes.filter(ticket => ticket.type === 'standard');
    const vipPasses = ticketTypes.filter(ticket => ticket.type === 'vip');
    
    return { dayPasses, standardPasses, vipPasses };
  };

  const getTicketDetails = (ticketType: string) => {
    return ticketTypes.find(type => type.name === ticketType) || ticketTypes[0];
  };

  const getPassTypeIcon = (passType?: 'day' | 'standard' | 'vip') => {
    switch (passType) {
      case 'standard':
        return <StandardPassIcon />;
      case 'vip':
        return <VipPassIcon color="secondary" />;
      default:
        return <DayPassIcon />;
    }
  };

  const getPassDurationIcon = (passDuration?: 'daily' | 'monthly' | 'yearly') => {
    switch (passDuration) {
      case 'monthly':
        return <MonthlyIcon />;
      case 'yearly':
        return <YearlyIcon />;
      default:
        return <EventIcon />;
    }
  };

  const getTicketDescription = (ticket: Ticket) => {
    const ticketDetails = getTicketDetails(ticket.ticketType);
    return ticketDetails.description || '';
  };

  const isCustomPrice = (ticket: Ticket): boolean => {
    const standardTicket = ticketTypes.find(t => t.name === ticket.ticketType);
    return standardTicket ? Math.abs(standardTicket.price - ticket.price) > 0.01 : false;
  };

  const handleEditPrice = (ticket: Ticket) => {
    setTicketToEdit(ticket);
    setNewPrice(ticket.price.toString());
    setEditDialogOpen(true);
  };

  const handleSavePrice = async () => {
    // Price validation
    if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) <= 0) {
      // Instead of using toast.error
      console.error('Please enter a valid price');
      return;
    }

    if (ticketToEdit) {
      setLoading(true);
      
      try {
        // Instead of using api.put
        // Simulate an API call with setTimeout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update ticket in the local state
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketToEdit.id 
              ? { ...ticket, price: Number(newPrice) } 
              : ticket
          )
        );
        
        // Instead of using toast.success
        console.log('Ticket price updated successfully');
        handleCloseEditDialog();
      } catch (error) {
        // Instead of using toast.error
        console.error('Failed to update ticket price');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setNewPrice('');
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Ticket Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create, manage, and print entrance tickets with QR codes
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
        <Box sx={{ width: { xs: '100%', lg: '60%' } }}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Create New Ticket
              </Typography>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Visitor Name"
                  name="visitorName"
                  variant="outlined"
                  value={newTicket.visitorName}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel id="ticket-type-label">Ticket Type</InputLabel>
                  <Select
                    labelId="ticket-type-label"
                    name="ticketType"
                    value={newTicket.ticketType}
                    onChange={handleSelectChange}
                    label="Ticket Type"
                    startAdornment={
                      <InputAdornment position="start">
                        <TicketIcon color="primary" />
                      </InputAdornment>
                    }
                  >
                    <ListSubheader>Day Passes</ListSubheader>
                    {getTicketGroups().dayPasses.map(type => (
                      <MenuItem key={type.name} value={type.name}>
                        {type.name} - HKD {type.price.toFixed(2)}
                      </MenuItem>
                    ))}
                    
                    <ListSubheader>Standard Passes</ListSubheader>
                    {getTicketGroups().standardPasses.map(type => (
                      <MenuItem key={type.name} value={type.name}>
                        {type.name} - HKD {type.price.toFixed(2)}
                      </MenuItem>
                    ))}
                    
                    <ListSubheader>VIP Passes</ListSubheader>
                    {getTicketGroups().vipPasses.map(type => (
                      <MenuItem key={type.name} value={type.name}>
                        {type.name} - HKD {type.price.toFixed(2)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <FormControl fullWidth>
                    <TextField
                      label="Price"
                      name="price"
                      type="number"
                      value={newTicket.price}
                      onChange={handlePriceChange}
                      disabled={!manualPrice}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">HKD </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        step: "0.01",
                        min: "0"
                      }}
                    />
                  </FormControl>
                  <Button 
                    variant={manualPrice ? "contained" : "outlined"}
                    color={manualPrice ? "secondary" : "primary"}
                    onClick={toggleManualPrice}
                    sx={{ ml: 2, height: '56px', minWidth: '160px' }}
                  >
                    {manualPrice ? "Auto Price" : "Manual Price"}
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  label="Valid Date"
                  name="date"
                  type="date"
                  value={newTicket.date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddTicket}
                disabled={!newTicket.visitorName}
                fullWidth
              >
                Create Ticket
              </Button>
            </CardActions>
          </Card>

          <Typography variant="h6" gutterBottom>
            Ticket List
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Visitor</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>{ticket.visitorName}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getPassTypeIcon(ticket.passType)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {ticket.passType === 'vip' ? 'VIP' : ticket.passType === 'standard' ? 'Standard' : 'Day Pass'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getPassDurationIcon(ticket.passDuration)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {ticket.passDuration === 'yearly' ? 'Yearly' : 
                           ticket.passDuration === 'monthly' ? 'Monthly' : 'Daily'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2">
                          HKD {ticket.price.toFixed(2)}
                        </Typography>
                        {isCustomPrice(ticket) && (
                          <Chip 
                            label="Custom" 
                            size="small" 
                            color="info" 
                            sx={{ ml: 1, height: '18px', fontSize: '0.6rem' }} 
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{ticket.date}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={ticket.isUsed ? "Used" : "Valid"}
                        color={ticket.isUsed ? "error" : "success"}
                        size="small"
                        icon={ticket.isUsed ? <CancelIcon /> : <CheckCircleIcon />}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={() => setSelectedTicket(ticket)}
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      {!ticket.isUsed && (
                        <Button
                          size="small"
                          color="secondary"
                          onClick={() => markTicketAsUsed(ticket.id)}
                        >
                          Mark Used
                        </Button>
                      )}
                      <IconButton onClick={(e) => {
                        e.stopPropagation();
                        handleEditPrice(ticket);
                      }} size="small" title="Edit price">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {tickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      No tickets found. Create a new ticket to see it here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ width: { xs: '100%', lg: '40%' } }}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Ticket Preview
              </Typography>

              {selectedTicket ? (
                <>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      width: '100%', 
                      p: 3, 
                      border: selectedTicket?.passType === 'vip' ? '2px dashed gold' : 
                             selectedTicket?.passType === 'standard' ? '2px dashed #4fd1c5' : 
                             '2px dashed rgba(0, 0, 0, 0.2)',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      mb: 3
                    }}
                  >
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      Theme Park Ticket
                    </Typography>
                    
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      {selectedTicket && getPassTypeIcon(selectedTicket.passType)}
                      <Typography variant="subtitle1" color="text.secondary">
                        {selectedTicket?.ticketType}
                      </Typography>
                    </Stack>
                    
                    {selectedTicket?.passType === 'vip' && (
                      <Chip
                        icon={<VipPassIcon />}
                        label="VIP ACCESS"
                        color="secondary"
                        sx={{ mb: 2, fontWeight: 'bold' }}
                      />
                    )}
                    
                    <Typography 
                      variant="h4" 
                      color={isCustomPrice(selectedTicket) ? "secondary" : "primary"} 
                      sx={{ fontWeight: 'bold', my: 2 }}
                    >
                      HKD {selectedTicket?.price.toFixed(2)}
                      {isCustomPrice(selectedTicket) && (
                        <Chip 
                          label="Custom Price" 
                          size="small" 
                          color="info" 
                          sx={{ ml: 1, verticalAlign: 'middle', height: '20px', fontSize: '0.7rem' }} 
                        />
                      )}
                    </Typography>
                    
                    {selectedTicket && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                        {getTicketDescription(selectedTicket)}
                      </Typography>
                    )}
                    
                    <Box sx={{ my: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: '8px' }}>
                      <QRCode 
                        value={selectedTicket ? generateQrCodeValue(selectedTicket) : ''} 
                        size={150} 
                      />
                    </Box>
                    
                    <Divider sx={{ width: '100%', my: 2 }} />
                    
                    <Stack spacing={1} alignItems="flex-start" sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', width: '40%' }}>
                          Visitor:
                        </Typography>
                        <Typography variant="body2">
                          {selectedTicket?.visitorName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', width: '40%' }}>
                          Ticket ID:
                        </Typography>
                        <Typography variant="body2">
                          {selectedTicket?.id}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', width: '40%' }}>
                          Valid Date:
                        </Typography>
                        <Typography variant="body2">
                          {selectedTicket?.date}
                          {(selectedTicket?.passDuration === 'monthly' || selectedTicket?.passDuration === 'yearly') && 
                            ` + ${selectedTicket.passDuration === 'monthly' ? '1 month' : '1 year'}`}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', width: '40%' }}>
                          Status:
                        </Typography>
                        <Chip
                          label={selectedTicket?.isUsed ? "Used" : "Valid"}
                          color={selectedTicket?.isUsed ? "error" : "success"}
                          size="small"
                          icon={selectedTicket?.isUsed ? <CancelIcon /> : <CheckCircleIcon />}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                  
                  {selectedTicket?.passType !== 'day' && (
                    <>
                      <Divider sx={{ width: '100%', my: 2 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Pass Benefits:
                      </Typography>
                      <Box sx={{ width: '100%', bgcolor: '#f9f9f9', p: 2, borderRadius: '8px' }}>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              Unlimited park entry
                            </Typography>
                          </Box>
                          {selectedTicket.passType === 'standard' && (
                            <>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  10% discount on food and merchandise
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  Free parking
                                </Typography>
                              </Box>
                            </>
                          )}
                          {selectedTicket.passType === 'vip' && (
                            <>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  25% discount on food and merchandise
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  Free premium parking
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  Priority access to all attractions
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  Exclusive VIP lounge access
                                </Typography>
                              </Box>
                            </>
                          )}
                        </Stack>
                      </Box>
                    </>
                  )}
                  
                  <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PrintIcon />}
                      onClick={() => handlePrintTicket(selectedTicket)}
                      fullWidth
                    >
                      Print Ticket
                    </Button>
                    
                    {!selectedTicket.isUsed && (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => markTicketAsUsed(selectedTicket.id)}
                        fullWidth
                      >
                        Mark as Used
                      </Button>
                    )}
                  </Stack>
                </>
              ) : (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                  <TicketIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Select a ticket to preview and print
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Edit Price Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Ticket Price</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">HKD </InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSavePrice} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketsPage; 