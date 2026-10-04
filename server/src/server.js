require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const deadlineRoutes = require('./routes/deadlineRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// Native HTTP server — required for Socket.IO
const httpServer = http.createServer(app);

// Disable x-powered-by header
app.disable('x-powered-by');

// Security HTTP Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Safer CORS Configuration allowing frontend origin
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (such as mobile apps, curl, or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError('Not allowed by CORS policy', 403));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// JSON Body Parser with Request Size Limit (100kb)
app.use(express.json({ limit: '100kb' }));

// Socket.IO — attached to HTTP server with matching CORS policy
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Socket.IO connection lifecycle
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} — reason: ${reason}`);
  });
});

// Expose io instance for use in route handlers if needed in future experiments
app.set('io', io);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to DeadlineHub API',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'DeadlineHub backend is healthy',
  });
});

// Resource Routes
app.use('/api/auth', authRoutes);
app.use('/api/deadlines', authMiddleware, deadlineRoutes);
app.use('/api/announcements', authMiddleware, announcementRoutes);

// 404 Handler for Unmatched Routes
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Port configuration
const PORT = process.env.PORT || 5000;

// Connect to Database and Start Server
const startServer = async () => {
  await connectDB();
  // Listen on httpServer (not app.listen) so Socket.IO shares the port
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`[Socket.IO] WebSocket server ready on port ${PORT}`);
  });
};

startServer();

