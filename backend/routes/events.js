const express = require('express');
const router = express.Router();

// Get all events
router.get('/', (req, res) => {
  res.json({ message: 'Get all events', data: [] });
});

// Get event by ID
router.get('/:id', (req, res) => {
  res.json({ message: `Get event with ID: ${req.params.id}`, data: {} });
});

// Create new event
router.post('/', (req, res) => {
  res.json({ message: 'Create new event', data: req.body });
});

// Update event
router.put('/:id', (req, res) => {
  res.json({ message: `Update event with ID: ${req.params.id}`, data: req.body });
});

// Delete event
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete event with ID: ${req.params.id}` });
});

module.exports = router; 