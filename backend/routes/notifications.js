const express = require('express');
const fs = require('fs');
const path = require('path');
const admin = require('../config/firebase');
const router = express.Router();

// Use absolute paths for data files
const dataPath = path.join(__dirname, '..', 'public', 'data', 'notifications.json');
const tokensPath = path.join(__dirname, '..', 'public', 'data', 'fcm_tokens.json');

console.log('Data path:', dataPath);
console.log('Tokens path:', tokensPath);

// Ensure data files exist
function ensureDataFiles() {
  try {
    const dataDir = path.dirname(dataPath);
    if (!fs.existsSync(dataDir)) {
      console.log('Creating data directory:', dataDir);
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(dataPath)) {
      console.log('Creating notifications file');
      fs.writeFileSync(dataPath, JSON.stringify({ data: [] }));
    }

    if (!fs.existsSync(tokensPath)) {
      console.log('Creating tokens file');
      fs.writeFileSync(tokensPath, JSON.stringify({ tokens: [] }));
    }
  } catch (error) {
    console.error('Error ensuring data files:', error);
    throw error;
  }
}

// Initialize data files
try {
  ensureDataFiles();
} catch (error) {
  console.error('Failed to initialize data files:', error);
}

// Get all notifications
router.get('/', (req, res) => {
  try {
    console.log('GET / - Fetching all notifications');
    ensureDataFiles();
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log('Found notifications:', data.data.length);
    res.json(data.data);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Create a new notification
router.post('/', async (req, res) => {
  try {
    const { title, content, type } = req.body;
    
    if (!title || !content || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('POST / - Received notification creation request:', { title, content, type });

    const notifications = await readNotificationsFile();
    const newNotification = {
      id: Date.now().toString(),
      title,
      content,
      type,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    console.log('Creating new notification:', newNotification);
    notifications.push(newNotification);
    await writeNotificationsFile(notifications);
    console.log('Notification saved successfully');

    // Send push notification but don't wait for it
    sendPushNotification(newNotification).catch(error => {
      console.error('Error sending push notification:', error);
    });

    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Register FCM token
router.post('/register-token', (req, res) => {
  ensureDataFiles();
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
    if (!tokensData.tokens.includes(token)) {
      tokensData.tokens.push(token);
      fs.writeFileSync(tokensPath, JSON.stringify(tokensData, null, 2));
    }

    res.status(200).json({ message: 'Token registered successfully' });
  } catch (error) {
    console.error('Error registering token:', error);
    res.status(500).json({ error: 'Failed to register token' });
  }
});

// Unregister FCM token
router.post('/unregister-token', (req, res) => {
  ensureDataFiles();
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
    tokensData.tokens = tokensData.tokens.filter(t => t !== token);
    fs.writeFileSync(tokensPath, JSON.stringify(tokensData, null, 2));

    res.status(200).json({ message: 'Token unregistered successfully' });
  } catch (error) {
    console.error('Error unregistering token:', error);
    res.status(500).json({ error: 'Failed to unregister token' });
  }
});

// Update a notification
router.put('/:id', (req, res) => {
  try {
    console.log('Received notification update request:', { id: req.params.id, body: req.body });
    ensureDataFiles();
    const { id } = req.params;
    const { title, content, type } = req.body;

    if (!title || !content || !type) {
      console.log('Missing required fields:', { title, content, type });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const index = data.data.findIndex(item => item.id === id);

    if (index === -1) {
      console.log('Notification not found:', id);
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updatedNotification = {
      ...data.data[index],
      title,
      content,
      type,
      updatedAt: new Date().toISOString()
    };

    console.log('Updating notification:', updatedNotification);
    data.data[index] = updatedNotification;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('Notification updated successfully');

    res.json(updatedNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Delete a notification
router.delete('/:id', (req, res) => {
  try {
    console.log('Received notification deletion request:', req.params.id);
    ensureDataFiles();
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const filteredData = data.data.filter(item => item.id !== id);

    if (filteredData.length === data.data.length) {
      console.log('Notification not found:', id);
      return res.status(404).json({ error: 'Notification not found' });
    }

    data.data = filteredData;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('Notification deleted successfully');

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Toggle notification status
router.patch('/:id/toggle', (req, res) => {
  try {
    console.log('Received notification toggle request:', req.params.id);
    ensureDataFiles();
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const index = data.data.findIndex(item => item.id === id);

    if (index === -1) {
      console.log('Notification not found:', id);
      return res.status(404).json({ error: 'Notification not found' });
    }

    data.data[index].isActive = !data.data[index].isActive;
    data.data[index].updatedAt = new Date().toISOString();
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('Notification status toggled successfully');

    res.json(data.data[index]);
  } catch (error) {
    console.error('Error toggling notification status:', error);
    res.status(500).json({ error: 'Failed to toggle notification status' });
  }
});

// Helper function to get FCM tokens
async function getFCMTokens() {
  try {
    const tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
    return tokensData.tokens || [];
  } catch (error) {
    console.error('Error reading FCM tokens:', error);
    return [];
  }
}

// Helper function to send push notifications
async function sendPushNotification(notification) {
  try {
    const tokens = await getFCMTokens();
    if (!tokens || tokens.length === 0) {
      console.log('No FCM tokens found, skipping push notification');
      return;
    }

    console.log('Sending push notification to tokens:', tokens);
    
    const message = {
      notification: {
        title: notification.title,
        body: notification.content
      },
      data: {
        type: notification.type,
        id: notification.id
      },
      tokens: tokens
    };

    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log('Push notification sent successfully:', response);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        console.log('Failed tokens:', failedTokens);
        
        // Remove failed tokens
        if (failedTokens.length > 0) {
          const tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
          tokensData.tokens = tokensData.tokens.filter(token => !failedTokens.includes(token));
          fs.writeFileSync(tokensPath, JSON.stringify(tokensData, null, 2));
          console.log('Removed failed tokens');
        }
      }
    } catch (fcmError) {
      console.error('FCM error:', fcmError);
      // Don't throw the error, just log it and continue
    }
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    // Don't throw the error, just log it and continue
  }
}

module.exports = router; 