const express = require('express');
const router = express.Router();

// Get all gallery images
router.get('/', (req, res) => {
  res.json({ message: 'Get all gallery images', data: [] });
});

// Get image by ID
router.get('/:id', (req, res) => {
  res.json({ message: `Get image with ID: ${req.params.id}`, data: {} });
});

// Upload new image
router.post('/', (req, res) => {
  res.json({ message: 'Upload new image', data: req.body });
});

// Update image metadata
router.put('/:id', (req, res) => {
  res.json({ message: `Update image with ID: ${req.params.id}`, data: req.body });
});

// Delete image
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete image with ID: ${req.params.id}` });
});

module.exports = router; 