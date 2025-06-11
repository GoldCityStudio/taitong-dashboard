const fs = require('fs');
const path = require('path');
const usersFile = path.join(__dirname, 'data/users.json');
const ticketsPath = path.join(__dirname, '../public/data/tickets.json');

const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
let ticketsData = { data: [] };
if (fs.existsSync(ticketsPath)) {
  ticketsData = JSON.parse(fs.readFileSync(ticketsPath, 'utf8'));
}

// Helper to check if a coupon is already in tickets.json
function isInTickets(id) {
  return ticketsData.data.some(t => t.id === id);
}

// For each user, add their coupons to tickets.json if not already present
Object.entries(users).forEach(([userId, user]) => {
  if (user.coupons && Array.isArray(user.coupons)) {
    user.coupons.forEach(coupon => {
      if (!isInTickets(coupon.id)) {
        ticketsData.data.push({
          id: coupon.id,
          type: coupon.type,
          isUsed: coupon.used || false,
          userId: userId
        });
        console.log(`Added coupon id ${coupon.id} for user ${userId} to tickets.json`);
      }
    });
  }
});

fs.writeFileSync(ticketsPath, JSON.stringify(ticketsData, null, 2));
console.log('Migration complete.'); 