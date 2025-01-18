const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const checkRole = require('../middlewares/rbac');
const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const user = new User({ fullname: { firstname, lastname }, email, password: await bcrypt.hash(password, 10) });

  try {
    await user.save();
    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).send('Error registering user');
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(400).send('Invalid credentials');
  }

  const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.status(200).json({ user, token });
});

// Protected route
router.get('/profile', checkRole(['user', 'admin']), async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json(user);
});

// Admin-only route
router.get('/admin', checkRole(['admin']), (req, res) => {
  res.status(200).send('Admin access granted');
});

module.exports = router;
