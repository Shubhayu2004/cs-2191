// Script to clear users and committees in CS_2191, and ensure only one admin user can exist
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcrypt');

const User = require('../models/user.model');
const Committee = require('../models/committee.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/CS_2191';

async function resetDB() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Delete all users and committees
    await User.deleteMany({});
    await Committee.deleteMany({});
    console.log('Deleted all users and committees from CS_2191');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@cs2191.com' });
    if (!existingAdmin) {
      // Hash the new admin password before saving
      const hashedPassword = await bcrypt.hash('admin_0_password', 10);
      const adminUser = new User({
        fullname: { firstname: 'Admin', lastname: 'User' },
        email: 'admin@cs2191.com',
        password: hashedPassword,
        status: 'admin',
      });
      await adminUser.save();
      console.log('Inserted single admin user.');
    } else {
      console.log('Admin user already exists, skipping insertion.');
    }

    console.log('DB reset complete. You can now add new users and committees as needed.');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting DB:', err);
    process.exit(1);
  }
}

resetDB();
