const dns = require('dns');
const mongoose = require('mongoose');

// Explicit DNS resolvers configured because local Node.js resolver cannot resolve MongoDB Atlas SRV records correctly
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
