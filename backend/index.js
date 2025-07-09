require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;
const os = require('os');

// Import routes
const attractionsRoutes = require('./routes/attractions');
const eventsRoutes = require('./routes/events');
const newsRoutes = require('./routes/news');
const ticketsRoutes = require('./routes/tickets');
const galleryRoutes = require('./routes/gallery');
const mapRoutes = require('./routes/map');
const lostFoundRoutes = require('./routes/lostfound');
const qrcodeRoutes = require('./routes/qrcode');
const bannerRoutes = require('./routes/banner');
const discoveryRoutes = require('./routes/discovery');
const souvenirRoutes = require('./routes/souvenir');
const visitorsRoutes = require('./routes/visitors');
const forumRoutes = require('./routes/forum');
const userRouter = require('./routes/user');
const notificationsRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payment');
const highlightsRoutes = require('./routes/highlights');
const missionsRoutes = require('./routes/missions');

// Basic error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Configure CORS
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Welcome route
app.get('/', (req, res) => {
  res.send('Dashboard backend running!');
});

// Mount routes with /api prefix
app.use('/api/attractions', attractionsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/lostfound', lostFoundRoutes);
app.use('/api/qrcode', qrcodeRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/souvenir', souvenirRoutes);
app.use('/api/visitors', visitorsRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/user', userRouter);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/highlights', highlightsRoutes);
app.use('/api/missions', missionsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ 
    status: 'ok', 
    message: 'Backend is running!',
    timestamp: new Date().toISOString(),
    ip: req.ip
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ error: 'Not Found' });
});

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}`);
  console.log(`LAN URL:   http://${localIp}:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

