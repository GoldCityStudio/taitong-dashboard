const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../public/data/tickets.json');
const packagesPath = path.join(__dirname, '../public/data/ticket_packages.json');
const passesPath = path.join(__dirname, '../public/data/passes.json');
const entranceRecordsPath = path.join(__dirname, '../public/data/entrance_records.json');

// Ensure data files exist
const ensureDataFiles = () => {
  if (!fs.existsSync(dataPath)) {
    const initialData = { data: [] };
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
  }
  
  if (!fs.existsSync(packagesPath)) {
    const initialPackages = { data: [] };
    fs.mkdirSync(path.dirname(packagesPath), { recursive: true });
    fs.writeFileSync(packagesPath, JSON.stringify(initialPackages, null, 2));
  }
};

function ensurePassesFile() {
  if (!fs.existsSync(passesPath)) {
    fs.mkdirSync(path.dirname(passesPath), { recursive: true });
    fs.writeFileSync(passesPath, JSON.stringify({ data: [] }, null, 2));
  }
}

// Ensure entrance records file exists
function ensureEntranceRecordsFile() {
  if (!fs.existsSync(entranceRecordsPath)) {
    fs.mkdirSync(path.dirname(entranceRecordsPath), { recursive: true });
    fs.writeFileSync(entranceRecordsPath, JSON.stringify({ data: [] }, null, 2));
  }
}

// Get recent entrance records
router.get('/entrance-records', (req, res) => {
  ensureEntranceRecordsFile();
  try {
    const records = JSON.parse(fs.readFileSync(entranceRecordsPath, 'utf8'));
    // Return the most recent 50 records, newest first
    const recent = records.data.slice(-50).reverse();
    res.json({ data: recent });
  } catch (error) {
    res.status(500).json({ message: 'Error reading entrance records', error: error.message });
  }
});

// Get all tickets
router.get('/', (req, res) => {
  ensureDataFiles();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json({ message: 'Get all tickets', data: data.data });
  } catch (error) {
    res.status(500).json({ message: 'Error reading tickets data', error: error.message });
  }
});

// Get ticket packages
router.get('/packages', (req, res) => {
  ensureDataFiles();
  try {
    const packages = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));
    res.json({ message: 'Get all ticket packages', data: packages.data });
  } catch (error) {
    res.status(500).json({ message: 'Error reading ticket packages', error: error.message });
  }
});

// Get ticket by ID
router.get('/:id', (req, res) => {
  ensureDataFiles();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const ticket = data.data.find(t => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }
  res.json({ message: `Get ticket with ID: ${req.params.id}`, data: ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error reading ticket data', error: error.message });
  }
});

// Get tickets for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const tickets = await readTickets();
    const userTickets = tickets.filter(ticket => ticket.userId === userId);
    res.json(userTickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ error: 'Failed to fetch user tickets' });
  }
});

// Get passes for a user
router.get('/user/:userId/passes', (req, res) => {
  ensurePassesFile();
  try {
    const passesData = JSON.parse(fs.readFileSync(passesPath, 'utf8'));
    const userPasses = passesData.data.filter(p => p.userId === req.params.userId);
    res.json({ message: `Get passes for user ID: ${req.params.userId}`, data: userPasses });
  } catch (error) {
    res.status(500).json({ message: 'Error reading user passes', error: error.message });
  }
});

// Create new ticket
router.post('/', (req, res) => {
  ensureDataFiles();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const newTicket = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
    
    data.data.push(newTicket);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
  res.status(201).json({ message: 'Create new ticket', data: newTicket });
  } catch (error) {
    res.status(500).json({ message: 'Error creating ticket', error: error.message });
  }
});

// Purchase tickets and/or passes
router.post('/purchase', (req, res) => {
  ensureDataFiles();
  ensurePassesFile();
  try {
    const { tickets: ticketsToPurchase, visitorName, userId = 'guest-' + Date.now() } = req.body;
    if (!Array.isArray(ticketsToPurchase) || ticketsToPurchase.length === 0) {
      return res.status(400).json({ message: 'No tickets provided for purchase' });
    }
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const passesData = JSON.parse(fs.readFileSync(passesPath, 'utf8'));
    const newTickets = [];
    const newPasses = [];
    const today = new Date().toISOString().slice(0, 10);
    ticketsToPurchase.forEach((ticket, index) => {
      if (ticket.type === 'pass') {
        // Add a pass for the user
        const pass = {
          id: `pass_${Date.now()}_${index}`,
          userId: userId,
          date: today,
          remaining: 4,
          expired: false,
          firstUseDate: null,
          purchaseDate: new Date().toISOString(),
        };
        passesData.data.push(pass);
        newPasses.push(pass);
      } else {
        // Add a normal ticket
        const validDate = new Date();
        validDate.setDate(validDate.getDate() + 30);
        const newTicket = {
          id: `${Date.now()}-${index}`,
          packageId: ticket.packageId,
          packageName: ticket.packageName,
           type: ticket.type,
          price: ticket.price,
          visitorName: visitorName || 'Guest',
          userId: userId,
          validDate: validDate.toISOString(),
          isUsed: false,
          purchaseDate: new Date().toISOString(),
        };
        data.data.push(newTicket);
        newTickets.push(newTicket);
      }
    });
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    fs.writeFileSync(passesPath, JSON.stringify(passesData, null, 2));
    res.status(201).json({
      message: 'Tickets and passes purchased successfully',
      data: {
        tickets: newTickets,
        passes: newPasses,
        total: newTickets.reduce((sum, ticket) => sum + ticket.price, 0) + newPasses.length * 80
      }
    });
  } catch (error) {
    console.error('Error purchasing tickets/passes:', error);
    res.status(500).json({ message: 'Error processing purchase', error: error.message });
  }
});

// Update ticket
router.put('/:id', (req, res) => {
  ensureDataFiles();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const index = data.data.findIndex(t => t.id === req.params.id);
    
  if (index === -1) {
    return res.status(404).json({ message: 'Ticket not found' });
  }
  
    data.data[index] = {
      ...data.data[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ message: `Update ticket with ID: ${req.params.id}`, data: data.data[index] });
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket', error: error.message });
  }
});

// Mark ticket as used
router.put('/:id/use', (req, res) => {
  ensureDataFiles();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const index = data.data.findIndex(t => t.id === req.params.id);
    
  if (index === -1) {
    return res.status(404).json({ message: 'Ticket not found' });
  }
  
    if (data.data[index].isUsed) {
    return res.status(400).json({ message: 'Ticket has already been used' });
  }
  
    data.data[index] = {
      ...data.data[index],
    isUsed: true,
    usedAt: new Date().toISOString()
  };
  
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ message: `Ticket ${req.params.id} marked as used`, data: data.data[index] });
  } catch (error) {
    res.status(500).json({ message: 'Error marking ticket as used', error: error.message });
  }
});

// Delete ticket
router.delete('/:id', (req, res) => {
  ensureDataFiles();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const index = data.data.findIndex(t => t.id === req.params.id);
    
  if (index === -1) {
    return res.status(404).json({ message: 'Ticket not found' });
  }
  
    const deletedTicket = data.data[index];
    data.data.splice(index, 1);
  
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  res.json({ message: `Delete ticket with ID: ${req.params.id}`, data: deletedTicket });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ticket', error: error.message });
  }
});

// Generate QR code for ticket
router.get('/:id/qrcode', (req, res) => {
  ensureDataFiles();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const ticket = data.data.find(t => t.id === req.params.id);
    
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }
  
  // In a real implementation, this would generate a QR code
  const qrData = {
    ticketId: ticket.id,
    visitorName: ticket.visitorName,
    packageName: ticket.packageName,
    type: ticket.type,
    validDate: ticket.validDate,
      isUsed: ticket.isUsed,
      // Include expiry date and pass type if available
      expiryDate: ticket.expiryDate,
      passType: ticket.passType
  };
  
  res.json({ 
    message: `Generate QR code for ticket ID: ${req.params.id}`,
    data: {
      qrValue: JSON.stringify(qrData),
      ticket: ticket
    }
  });
  } catch (error) {
    res.status(500).json({ message: 'Error generating QR code', error: error.message });
  }
});

// Create or update a ticket package
router.post('/packages', (req, res) => {
  ensureDataFiles();
  try {
    const { id, name, description, type, price, iconName, colorCode, isActive } = req.body;
    const packages = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));
    
    // If id is provided, update existing package
    if (id) {
      const packageIndex = packages.data.findIndex(p => p.id === id);
      if (packageIndex === -1) {
        return res.status(404).json({ message: 'Package not found' });
      }
      
      packages.data[packageIndex] = {
        ...packages.data[packageIndex],
        name: name || packages.data[packageIndex].name,
        description: description || packages.data[packageIndex].description,
        type: type || packages.data[packageIndex].type,
        price: price !== undefined ? price : packages.data[packageIndex].price,
        iconName: iconName || packages.data[packageIndex].iconName,
        colorCode: colorCode || packages.data[packageIndex].colorCode,
        isActive: isActive !== undefined ? isActive : packages.data[packageIndex].isActive,
        updatedAt: new Date().toISOString()
      };
      
      fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2));
      return res.json({ message: 'Package updated successfully', data: packages.data[packageIndex] });
    }
    
    // Create new package
    const newPackage = {
      id: Date.now().toString(),
      name,
      description,
      type,
      price,
      iconName: iconName || 'confirmation_num',
      colorCode: colorCode || '#1976D2',
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString()
    };
    
    packages.data.push(newPackage);
    fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2));
    
    res.status(201).json({ message: 'Package created successfully', data: newPackage });
  } catch (error) {
    res.status(500).json({ message: 'Error creating/updating package', error: error.message });
  }
});

// Delete a ticket package
router.delete('/packages/:id', (req, res) => {
  ensureDataFiles();
  try {
    const packages = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));
    const index = packages.data.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    const deletedPackage = packages.data[index];
    packages.data.splice(index, 1);
    
    fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2));
    res.json({ message: `Delete package with ID: ${req.params.id}`, data: deletedPackage });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting package', error: error.message });
  }
});

// Sync pass from pass management to ticket packages
router.post('/sync-pass', (req, res) => {
  ensureDataFiles();
  try {
    const { pass } = req.body;
    
    if (!pass) {
      return res.status(400).json({ message: 'No pass data provided' });
    }
    
    // Read current packages
    const packages = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));
    
    // Map pass duration to package type
    let packageType = 'Monthly'; // default
    if (pass.duration === 'day') packageType = 'Daily';
    else if (pass.duration === 'week') packageType = 'Weekly';
    else if (pass.duration === 'month') packageType = 'Monthly';
    else if (pass.duration === 'year') packageType = 'Yearly';
    
    // Map pass type to icon and color
    let iconName = 'confirmation_num';
    let colorCode = '#1976D2';
    
    if (pass.type === 'standard') {
      iconName = packageType === 'Yearly' ? 'confirmation_num' : 'confirmation_num_outlined';
      colorCode = packageType === 'Yearly' ? '#3F51B5' : '#1976D2';
    } else if (pass.type === 'vip') {
      iconName = packageType === 'Yearly' ? 'stars' : 'stars_outlined';
      colorCode = packageType === 'Yearly' ? '#FF5722' : '#FF9800';
    } else if (pass.type === 'family') {
      iconName = 'family_restroom';
      colorCode = packageType === 'Yearly' ? '#2E7D32' : '#4CAF50';
    }
    
    // Check if a similar package already exists
    const existingIndex = packages.data.findIndex(
      p => p.name === pass.name && p.type === packageType
    );
    
    if (existingIndex !== -1) {
      // Update existing package
      packages.data[existingIndex] = {
        ...packages.data[existingIndex],
        description: pass.description,
        price: Math.round(pass.price),
        iconName,
        colorCode,
        isActive: pass.isActive
      };
      
      fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2));
      return res.json({ 
        message: 'Package updated via sync', 
        data: packages.data[existingIndex] 
      });
    }
    
    // Create new package
    const newPackage = {
      id: Date.now().toString(),
      name: pass.name,
      description: pass.description,
      type: packageType,
      price: Math.round(pass.price),
      iconName,
      colorCode,
      isActive: pass.isActive,
      createdAt: new Date().toISOString()
    };
    
    packages.data.push(newPackage);
    fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2));
    
    res.status(201).json({ 
      message: 'Package created via sync', 
      data: newPackage 
    });
    
  } catch (error) {
    console.error('Error syncing pass:', error);
    res.status(500).json({ message: 'Error processing sync request', error: error.message });
  }
});

// Get all passes
router.get('/passes', (req, res) => {
  ensureDataFiles();
  try {
    const packages = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));
    res.json({ message: 'Get all passes', data: packages.data });
  } catch (error) {
    res.status(500).json({ message: 'Error reading passes', error: error.message });
  }
});

// Create new pass
router.post('/passes', (req, res) => {
  ensureDataFiles();
  try {
    const packages = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));
    const newPass = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    packages.data.push(newPass);
    fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2));
    
    res.status(201).json({ message: 'Pass created successfully', data: newPass });
  } catch (error) {
    res.status(500).json({ message: 'Error creating pass', error: error.message });
  }
});

// Update pass
router.put('/passes/:id', (req, res) => {
  ensureDataFiles();
  try {
    const packages = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));
    const index = packages.data.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Pass not found' });
    }
    
    packages.data[index] = {
      ...packages.data[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2));
    res.json({ message: 'Pass updated successfully', data: packages.data[index] });
  } catch (error) {
    res.status(500).json({ message: 'Error updating pass', error: error.message });
  }
});

// Delete pass
router.delete('/passes/:id', (req, res) => {
  ensureDataFiles();
  try {
    const packages = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));
    const index = packages.data.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Pass not found' });
    }
    
    const deletedPass = packages.data[index];
    packages.data.splice(index, 1);
    
    fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2));
    res.json({ message: 'Pass deleted successfully', data: deletedPass });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting pass', error: error.message });
  }
});

// Check-in a ticket
router.post('/:id/check-in', (req, res) => {
  ensureDataFiles();
  ensureEntranceRecordsFile();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const ticket = data.data.find(t => t.id === req.params.id);

    if (!ticket) {
      console.log('Check-in failed: Ticket not found:', req.params.id);
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // --- COUPON LOGIC FIRST ---
    if (ticket.type && ticket.type.startsWith('discount')) {
      if (ticket.isUsed) {
        return res.status(400).json({ message: 'Coupon already used' });
      }
      ticket.isUsed = true;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return res.json({ message: 'Coupon redeemed successfully' });
    }

    // --- TICKET LOGIC ---
    // Only block if ticket is expired
    const now = new Date();
    const expiry = new Date(ticket.validDate || ticket.expiryDate);
    if (now > expiry) {
      console.log('Check-in failed: Ticket expired:', ticket.id);
      return res.status(400).json({ message: 'Ticket expired' });
    }

    // Always allow check-in, always write entrance record
    console.log('Allowing check-in for ticket:', ticket.id);

    // Optionally, only set isUsed for non-entrance tickets
    const ENTRANCE_TYPES = ['門票', 'ticket', 'admission', 'entrance'];
    const ticketType = (ticket.type || '').trim().toLowerCase();
    if (!ENTRANCE_TYPES.includes(ticketType)) {
      ticket.isUsed = true;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      console.log('Non-entrance ticket, set isUsed');
    }

    // Store entrance record
    console.log('Adding entrance record for ticket:', ticket.id);
    const records = fs.existsSync(entranceRecordsPath)
      ? JSON.parse(fs.readFileSync(entranceRecordsPath, 'utf8'))
      : { data: [] };
    records.data.push({
      ticketId: ticket.id,
      visitorName: ticket.visitorName,
      packageName: ticket.packageName,
      type: ticket.type,
      price: ticket.price,
      purchaseDate: ticket.purchaseDate,
      validDate: ticket.validDate,
      checkInTime: new Date().toISOString()
    });
    fs.writeFileSync(entranceRecordsPath, JSON.stringify(records, null, 2));
    console.log('Entrance record written for ticket:', ticket.id);
    
    res.json({ message: 'Check-in successful' });
  } catch (error) {
    console.error('Error checking in ticket:', error);
    res.status(500).json({ message: 'Error checking in ticket', error: error.message });
  }
});

const readTickets = () => {
  ensureDataFiles();
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  return data.data;
};

module.exports = router; 