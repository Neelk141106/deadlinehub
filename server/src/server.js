require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const deadlineRoutes = require('./routes/deadlineRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to DeadlineHub API'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'DeadlineHub backend is healthy'
  });
});

// Resource Routes
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/announcements', announcementRoutes);

// Port configuration
const PORT = process.env.PORT || 5000;

// Connect to Database and Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
