const mongoose = require('mongoose');
const logger = require('./logger');

async function connectDB() {
  let uri = process.env.MONGODB_URI;
  
  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI environment variable is required in production');
    }
    uri = 'mongodb://localhost:27017/menuchat';
  }
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
    });
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error('MongoDB connection error:', err.message);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Database connection failed: ${err.message}. Check MONGODB_URI env var.`);
    }
    throw err;
  }

  mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
}

module.exports = { connectDB };
