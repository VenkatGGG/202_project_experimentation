const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Path for the log file in the backend root directory
const logFilePath = path.join(__dirname, '..', 'backend.log');

// Create a write stream for logging (append mode)
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Save original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Override console.log
console.log = (...args) => {
  const message = args.map(arg => typeof arg === 'object' ? util.inspect(arg, { depth: null }) : arg).join(' ');
  logStream.write(`[LOG ${new Date().toISOString()}]: ${message}\n`);
  originalConsoleLog.apply(console, args); // Also log to original console if possible (e.g., if run directly)
};

// Override console.error
console.error = (...args) => {
  const message = args.map(arg => arg instanceof Error ? arg.stack : (typeof arg === 'object' ? util.inspect(arg, { depth: null }) : arg)).join(' ');
  logStream.write(`[ERROR ${new Date().toISOString()}]: ${message}\n`);
  originalConsoleError.apply(console, args); // Also log to original console
};

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Optionally, exit after logging critical error - but be cautious with auto-exit
  // process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('Logging initialized. Output will be directed to backend.log');

const app = express();

// Middleware
// Place CORS middleware before express.json()
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200 // Handles OPTIONS preflight and is good for legacy browsers
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const restaurantRoutes = require('./routes/restaurants');
// const dashboardRoutes = require('./routes/dashboardRoutes'); 
const notificationRoutes = require('./routes/notificationRoutes'); 
const bookingRoutes = require('./routes/bookings');

app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/restaurants', restaurantRoutes); 
// app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes); 
app.use('/api/bookings', bookingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
