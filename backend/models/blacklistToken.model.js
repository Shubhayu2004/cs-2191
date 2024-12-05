const mongoose = require('mongoose');

const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '24h', // TTL index: automatically remove documents after 24 hours
  },
});

// Create an index on the token field for faster lookups
blacklistedTokenSchema.index({ token: 1 });

const BlacklistedToken = mongoose.model('BlacklistedToken', blacklistedTokenSchema);

module.exports = BlacklistedToken;