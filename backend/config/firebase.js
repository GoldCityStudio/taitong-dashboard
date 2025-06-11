const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
try {
  // Check if already initialized
  if (!admin.apps.length) {
    const serviceAccount = require('../serviceAccountKey.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log('Firebase Admin SDK initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

module.exports = admin; 