const express = require('express');
const router = express.Router();

// Get all location QR codes
router.get('/', (req, res) => {
  res.json({ 
    message: 'Get all location QR codes', 
    data: [
      { id: '1', name: 'Main Entrance', location: 'Front Gate', type: 'entrance' },
      { id: '2', name: 'Rollercoaster Zone', location: 'Thrill Rides Area', type: 'attraction' },
      { id: '3', name: 'Water World', location: 'Water Park Area', type: 'attraction' },
      { id: '4', name: 'Food Court', location: 'Central Plaza', type: 'service' },
      { id: '5', name: 'Gift Shop', location: 'Exit Area', type: 'shopping' }
    ] 
  });
});

// Get QR code by ID
router.get('/:id', (req, res) => {
  res.json({ 
    message: `Get QR code with ID: ${req.params.id}`, 
    data: { 
      id: req.params.id, 
      name: 'Sample Location', 
      location: 'Sample Area', 
      type: 'attraction',
      qrValue: `https://themepark.example.com/location/${req.params.id}`
    } 
  });
});

// Create new QR code
router.post('/', (req, res) => {
  res.json({ 
    message: 'Create new QR code', 
    data: {
      id: Date.now().toString(),
      ...req.body,
      qrValue: `https://themepark.example.com/location/${Date.now()}`
    } 
  });
});

// Update QR code
router.put('/:id', (req, res) => {
  res.json({ 
    message: `Update QR code with ID: ${req.params.id}`, 
    data: {
      id: req.params.id,
      ...req.body
    } 
  });
});

// Delete QR code
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete QR code with ID: ${req.params.id}` });
});

module.exports = router; 