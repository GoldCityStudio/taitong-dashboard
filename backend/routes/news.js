const express = require('express');
const router = express.Router();

// Get all news
router.get('/', (req, res) => {
  res.json({ message: 'Get all news', data: [] });
});

// Get news by ID
router.get('/:id', (req, res) => {
  res.json({ message: `Get news with ID: ${req.params.id}`, data: {} });
});

// Create new news
router.post('/', (req, res) => {
  res.json({ message: 'Create new news article', data: req.body });
});

// Update news
router.put('/:id', (req, res) => {
  res.json({ message: `Update news with ID: ${req.params.id}`, data: req.body });
});

// Delete news
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete news with ID: ${req.params.id}` });
});

module.exports = router; 