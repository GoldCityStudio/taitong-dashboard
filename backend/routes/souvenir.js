const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../public/data/souvenirs.json');

// Ensure data file exists
const ensureDataFile = () => {
  if (!fs.existsSync(dataPath)) {
    const initialData = { data: [] };
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
  }
};

// Get all souvenirs
router.get('/', (req, res) => {
  ensureDataFile();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error reading souvenirs data', error: error.message });
  }
});

// Add new souvenir
router.post('/', (req, res) => {
  ensureDataFile();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const newSouvenir = {
      id: Date.now().toString(),
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      imageUrl: req.body.imageUrl,
      category: req.body.category || 'other',
      inStock: req.body.inStock !== undefined ? req.body.inStock : true,
      details: req.body.details || '',
      createdAt: new Date().toISOString()
    };
    
    data.data.push(newSouvenir);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    res.status(201).json({ message: 'Souvenir item added successfully', data: newSouvenir });
  } catch (error) {
    res.status(500).json({ message: 'Error adding souvenir item', error: error.message });
  }
});

// Update souvenir
router.put('/:id', (req, res) => {
  ensureDataFile();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const index = data.data.findIndex(item => item.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Souvenir item not found' });
    }
    
    const updatedSouvenir = {
      ...data.data[index],
      name: req.body.name || data.data[index].name,
      description: req.body.description || data.data[index].description,
      price: req.body.price !== undefined ? req.body.price : data.data[index].price,
      imageUrl: req.body.imageUrl || data.data[index].imageUrl,
      category: req.body.category || data.data[index].category,
      inStock: req.body.inStock !== undefined ? req.body.inStock : data.data[index].inStock,
      details: req.body.details || data.data[index].details,
      updatedAt: new Date().toISOString()
    };
    
    data.data[index] = updatedSouvenir;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    res.json({ message: 'Souvenir item updated successfully', data: updatedSouvenir });
  } catch (error) {
    res.status(500).json({ message: 'Error updating souvenir item', error: error.message });
  }
});

// Delete souvenir
router.delete('/:id', (req, res) => {
  ensureDataFile();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const filteredData = data.data.filter(item => item.id !== req.params.id);
    
    if (filteredData.length === data.data.length) {
      return res.status(404).json({ message: 'Souvenir item not found' });
    }
    
    data.data = filteredData;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    res.json({ message: 'Souvenir item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting souvenir item', error: error.message });
  }
});

module.exports = router; 