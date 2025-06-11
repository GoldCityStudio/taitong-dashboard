const express = require('express');
const router = express.Router();

// Get all attractions
router.get('/', (req, res) => {
  res.json({ message: 'Get all attractions', data: [] });
});

// Get attraction by ID
router.get('/:id', (req, res) => {
  res.json({ message: `Get attraction with ID: ${req.params.id}`, data: {} });
});

// Create new attraction
router.post('/', (req, res) => {
  res.json({ message: 'Create new attraction', data: req.body });
});

// Update attraction
router.put('/:id', (req, res) => {
  res.json({ message: `Update attraction with ID: ${req.params.id}`, data: req.body });
});

// Delete attraction
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete attraction with ID: ${req.params.id}` });
});

module.exports = router; 