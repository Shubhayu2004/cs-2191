// Migration script to add userId fields to all committees for chairman, convener, and members
// Run with: node backend/scripts/migrate_committee_userids.js

const mongoose = require('mongoose');
const Committee = require('../models/committee.model');
const User = require('../models/user.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/YOUR_DB_NAME';

async function getUserIdByEmail(email) {
  if (!email) return null;
  const user = await User.findOne({ email });
  return user ? user._id : null;
}

async function migrate() {
  await mongoose.connect(MONGO_URI);
  const committees = await Committee.find();
  let updated = 0;

  for (const committee of committees) {
    let changed = false;
    // Chairman
    if (committee.chairman && !committee.chairman.userId) {
      const userId = await getUserIdByEmail(committee.chairman.email);
      if (userId) {
        committee.chairman.userId = userId;
        changed = true;
      }
    }
    // Convener
    if (committee.convener && !committee.convener.userId) {
      const userId = await getUserIdByEmail(committee.convener.email);
      if (userId) {
        committee.convener.userId = userId;
        changed = true;
      }
    }
    // Members
    for (const member of committee.members) {
      if (!member.userId) {
        const userId = await getUserIdByEmail(member.email);
        if (userId) {
          member.userId = userId;
          changed = true;
        }
      }
    }
    if (changed) {
      await committee.save();
      updated++;
      console.log(`Updated committee ${committee._id}`);
    }
  }
  console.log(`Migration complete. Updated ${updated} committees.`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
