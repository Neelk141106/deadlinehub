const dns = require('dns');
const mongoose = require('mongoose');

// Prefer IPv4 lookups first to avoid Windows getaddrinfo IPv6 resolution failures on AWS/Atlas
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Explicit DNS resolvers configured because local Node.js resolver cannot resolve MongoDB Atlas SRV records correctly
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignored if network policies restrict custom DNS servers
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MongoDB connection error: MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
