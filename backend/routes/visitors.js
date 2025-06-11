const express = require('express');
const router = express.Router();

// Firestore setup
const admin = require('firebase-admin');
if (!admin.apps.length) {
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

// GET /api/visitors - List all visitors
router.get('/', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const visitors = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(visitors);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ error: 'Failed to fetch visitors' });
  }
});

module.exports = router; 