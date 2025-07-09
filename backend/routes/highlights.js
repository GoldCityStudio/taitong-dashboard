const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_FILE = path.join(__dirname, '../data/highlights.json');

// Helper to read highlights
function readHighlights() {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// Helper to write highlights
function writeHighlights(highlights) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(highlights, null, 2), 'utf8');
}

// GET all highlights
router.get('/', (req, res) => {
  const highlights = readHighlights();
  res.json({ data: highlights });
});

// GET a single highlight by id
router.get('/:id', (req, res) => {
  const highlights = readHighlights();
  const highlight = highlights.find(h => String(h.id) === String(req.params.id));
  if (!highlight) return res.status(404).json({ error: 'Highlight not found' });
  res.json({ data: highlight });
});

// CREATE a new highlight
router.post('/', (req, res) => {
  const highlights = readHighlights();
  const newId = highlights.length > 0 ? Math.max(...highlights.map(h => h.id)) + 1 : 1;
  const newHighlight = { id: newId, ...req.body };
  highlights.push(newHighlight);
  writeHighlights(highlights);
  res.status(201).json({ data: newHighlight });
});

// UPDATE a highlight
router.put('/:id', (req, res) => {
  const highlights = readHighlights();
  const idx = highlights.findIndex(h => String(h.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Highlight not found' });
  highlights[idx] = { ...highlights[idx], ...req.body, id: highlights[idx].id };
  writeHighlights(highlights);
  res.json({ data: highlights[idx] });
});

// DELETE a highlight
router.delete('/:id', (req, res) => {
  let highlights = readHighlights();
  const idx = highlights.findIndex(h => String(h.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Highlight not found' });
  const deleted = highlights[idx];
  highlights.splice(idx, 1);
  writeHighlights(highlights);
  res.json({ data: deleted });
});

module.exports = router; 