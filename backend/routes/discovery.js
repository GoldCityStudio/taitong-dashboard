const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../public/data/discovery.json');

// Ensure data file exists
const ensureDataFile = () => {
  if (!fs.existsSync(dataPath)) {
    const initialData = { data: [] };
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
  }
};

// Get all discovery items
router.get('/', (req, res) => {
  ensureDataFile();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error reading discovery data', error: error.message });
  }
});

// Add new discovery item
router.post('/', (req, res) => {
  ensureDataFile();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const newDiscovery = {
      id: Date.now().toString(),
      title: req.body.title,
      description: req.body.description,
      details: req.body.details,
      image: req.body.image,
      category: req.body.category || 'General',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      createdAt: new Date().toISOString()
    };
    
    data.data.push(newDiscovery);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    res.status(201).json({ message: 'Discovery item added successfully', data: newDiscovery });
  } catch (error) {
    res.status(500).json({ message: 'Error adding discovery item', error: error.message });
  }
});

// Update discovery item
router.put('/:id', (req, res) => {
  ensureDataFile();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const index = data.data.findIndex(item => item.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Discovery item not found' });
    }
    
    const updatedDiscovery = {
      ...data.data[index],
      title: req.body.title || data.data[index].title,
      description: req.body.description || data.data[index].description,
      details: req.body.details || data.data[index].details,
      image: req.body.image || data.data[index].image,
      category: req.body.category || data.data[index].category,
      isActive: req.body.isActive !== undefined ? req.body.isActive : data.data[index].isActive,
      updatedAt: new Date().toISOString()
    };
    
    data.data[index] = updatedDiscovery;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    res.json({ message: 'Discovery item updated successfully', data: updatedDiscovery });
  } catch (error) {
    res.status(500).json({ message: 'Error updating discovery item', error: error.message });
  }
});

// Delete discovery item
router.delete('/:id', (req, res) => {
  ensureDataFile();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const filteredData = data.data.filter(item => item.id !== req.params.id);
    
    if (filteredData.length === data.data.length) {
      return res.status(404).json({ message: 'Discovery item not found' });
    }
    
    data.data = filteredData;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    res.json({ message: 'Discovery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting discovery item', error: error.message });
  }
});

module.exports = router; 