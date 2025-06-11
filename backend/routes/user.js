const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
const passesPath = path.join(__dirname, '../public/data/passes.json');
const ticketsPath = path.join(__dirname, '../public/data/tickets.json');

// Path to your test data JSON file
const usersFile = path.join(__dirname, '../data/users.json');

// Helper to read/write users data
function readUsers() {
  return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}
function writeUsers(data) {
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
}

console.log('User router loaded');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function getUserFromFirestore(uid) {
  const doc = await admin.firestore().collection('users').doc(uid).get();
  if (!doc.exists) return null;
  const data = doc.data();
  // Map Firestore fields to backend user fields
  return {
    name: data.displayName || data.name || '',
    points: data.points || 0,
    isVIP: data.isVIP || false,
    status: data.status || 'standard',
    coupons: [],
    stickers: {},
    lastScans: data.lastScans || {},
  };
}

// Auto-migrate coupons to tickets.json on server start or user route hit
require('../migrate_coupons');

// GET /api/user/:userId/summary
router.get('/:userId/summary', async (req, res) => {
  const users = readUsers();
  let user = users[req.params.userId];
  if (!user) {
    user = await getUserFromFirestore(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    users[req.params.userId] = user;
    writeUsers(users);
  }
  
  // Use the stored points value
  const points = user.points || 0;
  const isVIP = points >= 100;
  
  res.json({
    points,
    isVIP,
    coupons: user.coupons || [],
  });
});

// POST /api/user/:userId/coupons
router.post('/:userId/coupons', (req, res) => {
  const { type } = req.body;
  if (!type) return res.status(400).json({ error: 'Coupon type required' });
  const users = readUsers();
  const user = users[req.params.userId];
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  // Initialize coupons array if it doesn't exist
  user.coupons = user.coupons || [];
  
  // Check if user already has a coupon of this type
  const existingCoupon = user.coupons.find(c => c.type === type);
  if (existingCoupon) {
    console.log(`User ${req.params.userId} already has coupon of type ${type}`);
    return res.json({
      success: true,
      coupon: existingCoupon,
      points: user.points || 0,
      isVIP: (user.points || 0) >= 100,
      message: 'Coupon already exists'
    });
  }

  // Create and add new coupon
  const newCoupon = {
    id: (user.coupons.length + 1).toString(),
    type,
    used: false,
  };
  user.coupons.push(newCoupon);
  
  // Update points and VIP status
  user.points = (user.points || 0) + 10;
  user.isVIP = user.points >= 100;
  user.status = user.isVIP ? 'vip' : 'standard';
  
  writeUsers(users);
  
  // Also add the coupon to tickets.json for staff check-in
  let ticketsData = { data: [] };
  if (fs.existsSync(ticketsPath)) {
    ticketsData = JSON.parse(fs.readFileSync(ticketsPath, 'utf8'));
  }
  ticketsData.data.push({
    id: newCoupon.id,
    type: newCoupon.type,
    isUsed: newCoupon.used,
    userId: req.params.userId,
    // Add more fields if needed
  });
  fs.writeFileSync(ticketsPath, JSON.stringify(ticketsData, null, 2));
  
  console.log(`Added new coupon of type ${type} for user ${req.params.userId}`);
  res.json({
    success: true,
    coupon: newCoupon,
    points: user.points,
    isVIP: user.isVIP,
  });
});

// GET /api/user/:userId/stickers
router.get('/:userId/stickers', async (req, res) => {
  console.log(`Fetching stickers for user: ${req.params.userId}`);
  try {
  const users = readUsers();
  let user = users[req.params.userId];
  if (!user) {
    user = await getUserFromFirestore(req.params.userId);
      if (!user) {
        console.log(`User not found: ${req.params.userId}`);
        return res.status(404).json({ error: 'User not found' });
      }
    users[req.params.userId] = user;
    writeUsers(users);
  }
    
    const stickers = user.stickers || {};
    console.log(`Stickers for user ${req.params.userId}:`, stickers);
    res.json(stickers);
  } catch (error) {
    console.error('Error fetching stickers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stickers',
      message: error.message 
    });
  }
});

// POST /api/user/:userId/stickers
router.post('/:userId/stickers', async (req, res) => {
  const users = readUsers();
  let user = users[req.params.userId];
  if (!user) {
    user = await getUserFromFirestore(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
    users[req.params.userId] = user;
    writeUsers(users);
  }
  const { type } = req.body;
  if (![
    'grass_ski',
    'family_bike',
    'fishing_game',
    'kids_car',
    'indoor_play',
    'feed_animals',
    'feed_fish',
    'diy_2',
    'diy_3',
    'diy_4',
    'vege_1',
    'vege_2'
  ].includes(type)) {
    return res.status(400).json({ error: 'Invalid sticker type' });
  }
  user.stickers = user.stickers || {};
  user.stickers[type] = (user.stickers[type] || 0) + 1;
  writeUsers(users);
  res.json({ success: true, stickers: user.stickers });
});

// Helper function to ensure passes file exists
function ensurePassesFile() {
  if (!fs.existsSync(passesPath)) {
    fs.writeFileSync(passesPath, JSON.stringify({ data: [] }, null, 2));
  }
}

// Helper function to mark old passes as expired
function markOldPassesAsExpired() {
  ensurePassesFile();
  const passesData = JSON.parse(fs.readFileSync(passesPath, 'utf8'));
  const today = new Date().toISOString().slice(0, 10);
  
  let modified = false;
  passesData.data.forEach(pass => {
    // If pass has never been used (no firstUseDate), it's still valid
    if (!pass.firstUseDate) {
      pass.expired = false;
      return;
    }
    
    // Calculate expiration date (day after first use)
    const expirationDate = new Date(pass.firstUseDate);
    expirationDate.setDate(expirationDate.getDate() + 1);
    const expirationDateStr = expirationDate.toISOString().slice(0, 10);
    
    // Mark as expired if we're past the expiration date
    if (expirationDateStr <= today && !pass.expired) {
      pass.expired = true;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(passesPath, JSON.stringify(passesData, null, 2));
  }
}

// Get user's passes
router.get('/:userId/passes', (req, res) => {
  ensurePassesFile();
  markOldPassesAsExpired(); // Mark old passes as expired before returning
  const passesData = JSON.parse(fs.readFileSync(passesPath, 'utf8'));
  const userPasses = passesData.data.filter(p => p.userId === req.params.userId);
  
  // Calculate total valid credits
  const totalCredits = userPasses.reduce((sum, pass) => {
    // A pass is valid if:
    // 1. It has never been used (no firstUseDate)
    // 2. It has been used but is within 24 hours of first use
    // 3. It has remaining credits
    const isValid = !pass.firstUseDate || 
      (new Date().getTime() - new Date(pass.firstUseDate).getTime() < 24 * 60 * 60 * 1000);
    
    if (isValid && pass.remaining > 0) {
      return sum + pass.remaining;
    }
    return sum;
  }, 0);
  
  res.json({ 
    passes: userPasses,
    totalCredits: totalCredits
  });
});

// Use pass slots for a mission
router.post('/:userId/use_pass', (req, res) => {
  ensurePassesFile();
  const { count } = req.body; // 格數
  const passesData = JSON.parse(fs.readFileSync(passesPath, 'utf8'));
  const today = new Date().toISOString().slice(0, 10);
  
  // Find a valid pass with enough slots
  const pass = passesData.data.find(p => {
    // A pass is valid if:
    // 1. It has never been used (no firstUseDate)
    // 2. It has been used but is within 24 hours of first use
    const isValid = !p.firstUseDate || 
      (new Date().getTime() - new Date(p.firstUseDate).getTime() < 24 * 60 * 60 * 1000);
    
    return p.userId === req.params.userId && 
           isValid && 
           p.remaining >= count;
  });
  
  if (!pass) return res.status(400).json({ error: '無可用套票或格數不足，請購買新套票' });
  
  // If this is the first time using the pass, set the first use date
  if (!pass.firstUseDate) {
    pass.firstUseDate = today;
  }
  
  pass.remaining -= count;
  // Only mark as expired if remaining is 0 AND it's been more than 24 hours since first use
  if (pass.remaining <= 0) {
    const timeSinceFirstUse = new Date().getTime() - new Date(pass.firstUseDate).getTime();
    pass.expired = timeSinceFirstUse >= 24 * 60 * 60 * 1000;
  }
  
  fs.writeFileSync(passesPath, JSON.stringify(passesData, null, 2));
  res.json({ 
    success: true, 
    remaining: pass.remaining,
    firstUseDate: pass.firstUseDate
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Get referral count
router.get('/:userId/referral-count', (req, res) => {
  const users = readUsers();
  const user = users[req.params.userId];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ referralCount: user.referralCount || 0 });
});

router.get('/test', (req, res) => res.json({ ok: true }));

// POST /api/user/create
router.post('/create', async (req, res) => {
  try {
    const { userId, name, email } = req.body;
    if (!userId || !name) {
      return res.status(400).json({ error: 'User ID and name are required' });
    }

    const users = readUsers();
    
    // Check if user already exists
    if (users[userId]) {
      return res.status(200).json({ message: 'User already exists', user: users[userId] });
    }

    // Create new user record
    const newUser = {
      name,
      email: email || '',
      points: 0,
      isVIP: false,
      status: 'standard',
      coupons: [],
      stickers: {},
      lastScans: {},
      referralCount: 0
    };

    // Save to users.json
    users[userId] = newUser;
    writeUsers(users);

    console.log(`Created new user: ${userId}`);
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

module.exports = router; 