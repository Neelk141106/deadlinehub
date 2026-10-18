require('dotenv').config();
const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const deadlineRoutes = require('./routes/deadlineRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const joinRequestRoutes = require('./routes/joinRequestRoutes');
const { checkUpcomingDeadlineReminders } = require('./services/notificationService');
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

// Dynamic CORS Configuration allowing local development origins and configured frontend URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  // Match localhost or 127.0.0.1 on any port during development
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin)) return true;
  return allowedOrigins.includes(origin);
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (such as mobile apps, curl, or server-to-server) or matched origins
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new AppError('Not allowed by CORS policy', 403));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// JSON Body Parser with Request Size Limit (100kb)
app.use(express.json({ limit: '100kb' }));

// Socket.IO — attached to HTTP server with matching CORS policy
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

const jwt = require('jsonwebtoken');
const Class = require('./models/Class');

// Socket.IO connection lifecycle & room authorization
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Authenticate socket and automatically join authorized rooms
  socket.on('authenticate', async (data) => {
    try {
      const token = data?.token || socket.handshake?.auth?.token;
      if (!token) return;

      const secret = process.env.JWT_SECRET;
      if (!secret) return;

      const decoded = jwt.verify(token, secret);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;

      // Join personal user room
      socket.join(`user:${decoded.id}`);

      // Auto-join authorized class rooms
      if (decoded.role === 'teacher') {
        const ownedClasses = await Class.find({ teacherId: decoded.id }).select('_id');
        ownedClasses.forEach((cls) => {
          socket.join(`class:${cls._id.toString()}`);
        });
      } else {
        const joinedClasses = await Class.find({ students: decoded.id }).select('_id');
        joinedClasses.forEach((cls) => {
          socket.join(`class:${cls._id.toString()}`);
        });
      }

      socket.emit('authenticated', { success: true, role: decoded.role });
    } catch (err) {
      console.warn(`[Socket.IO] Authentication failed for ${socket.id}:`, err.message);
      socket.emit('auth_error', { message: 'Authentication failed' });
    }
  });

  // Explicit authorized room join request
  socket.on('join:class', async ({ classId }) => {
    try {
      if (!socket.userId) {
        return socket.emit('error', { message: 'Authentication required to join class rooms' });
      }

      let isAuthorized = false;
      if (socket.userRole === 'teacher') {
        isAuthorized = await Class.exists({ _id: classId, teacherId: socket.userId });
      } else {
        isAuthorized = await Class.exists({ _id: classId, students: socket.userId });
      }

      if (isAuthorized) {
        socket.join(`class:${classId}`);
        socket.emit('joined:class', { classId, success: true });
      } else {
        socket.emit('error', { message: 'Forbidden: you are not a member of this class' });
      }
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} — reason: ${reason}`);
  });
});

// Expose io instance for use in route handlers
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
app.use('/api/classes', authMiddleware, classRoutes);
app.use('/api/deadlines', authMiddleware, deadlineRoutes);
app.use('/api/announcements', authMiddleware, announcementRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/join-requests', authMiddleware, joinRequestRoutes);

// 404 Handler for Unmatched Routes
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Port configuration
const PORT = process.env.PORT || 5000;

let reminderInterval = null;

// Graceful EADDRINUSE and startup error handling
httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[Server Error] Port ${PORT} is already in use by another process.`);
    console.error(`[Server Error] Please stop any existing instance running on port ${PORT} or configure a different PORT.\n`);
    process.exit(1);
  } else {
    console.error('\n[Server Error] Server failed to start:', err.message, '\n');
    process.exit(1);
  }
});

// Graceful process termination
const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }
  httpServer.close(async () => {
    console.log('[Server] HTTP and WebSocket server closed.');
    try {
      await mongoose.connection.close();
      console.log('[Server] MongoDB connection closed.');
    } catch (err) {
      console.error('[Server] Error closing database connection:', err.message);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

// Connect to Database and Start Server
const startServer = async () => {
  await connectDB();
  // Listen on httpServer (not app.listen) so Socket.IO shares the port
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`[Socket.IO] WebSocket server ready on port ${PORT}`);

    // Initial check for upcoming 24h deadline reminders
    checkUpcomingDeadlineReminders(io).catch((err) => {
      console.error('[NotificationService] Initial reminder check error:', err.message);
    });

    // Run scheduled reminder check every 5 minutes
    const REMINDER_INTERVAL_MS = 5 * 60 * 1000;
    reminderInterval = setInterval(() => {
      checkUpcomingDeadlineReminders(io).catch((err) => {
        console.error('[NotificationService] Periodic reminder check error:', err.message);
      });
    }, REMINDER_INTERVAL_MS);

    // unref allows clean process exit if all other events complete
    if (reminderInterval.unref) {
      reminderInterval.unref();
    }
  });
};

startServer();

