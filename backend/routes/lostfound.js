const express = require('express');
const router = express.Router();

// Get all lost and found items
router.get('/', (req, res) => {
  res.json({ message: 'Get all lost and found items', data: [] });
});

// Get item by ID
router.get('/:id', (req, res) => {
  res.json({ message: `Get lost and found item with ID: ${req.params.id}`, data: {} });
});

// Create new lost and found item
router.post('/', (req, res) => {
  res.json({ message: 'Create new lost and found item', data: req.body });
});

// Update lost and found item
router.put('/:id', (req, res) => {
  res.json({ message: `Update lost and found item with ID: ${req.params.id}`, data: req.body });
});

// Delete lost and found item
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete lost and found item with ID: ${req.params.id}` });
});

// Mark item as claimed
router.put('/:id/claim', (req, res) => {
  res.json({ message: `Mark lost and found item with ID: ${req.params.id} as claimed`, data: req.body });
});

module.exports = router; 