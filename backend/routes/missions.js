const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_FILE = path.join(__dirname, '../data/missions.json');

// GET all missions
router.get('/', (req, res) => {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  const missions = JSON.parse(data);
  res.json({ data: missions });
});

module.exports = router; 