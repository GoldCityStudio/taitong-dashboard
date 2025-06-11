const express = require('express');
const router = express.Router();

// Get map data
router.get('/', (req, res) => {
  res.json({ message: 'Get park map data', data: {} });
});

// Update map data
router.put('/', (req, res) => {
  res.json({ message: 'Update park map data', data: req.body });
});

// Get POI (Points of Interest)
router.get('/poi', (req, res) => {
  res.json({ message: 'Get all points of interest on the map', data: [] });
});

// Add POI
router.post('/poi', (req, res) => {
  res.json({ message: 'Add new point of interest', data: req.body });
});

// Update POI
router.put('/poi/:id', (req, res) => {
  res.json({ message: `Update POI with ID: ${req.params.id}`, data: req.body });
});

// Delete POI
router.delete('/poi/:id', (req, res) => {
  res.json({ message: `Delete POI with ID: ${req.params.id}` });
});

module.exports = router; 