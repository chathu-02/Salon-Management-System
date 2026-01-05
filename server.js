const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const serviceRoutes = require('./routes/services');


const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
// Allow flexible CORS during development; prefer explicit CLIENT_URL in production
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
if (process.env.NODE_ENV === 'development' || !process.env.CLIENT_URL) {
  // allow any origin when developing locally to avoid proxy/CORS issues
  app.use(cors({ origin: true, credentials: true }));
} else {
  app.use(cors({ origin: clientUrl, credentials: true }));
}

// Quick request logger for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Handle preflight for common endpoints
app.options('*', cors());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
const verifyingPaymentRoutes = require('./routes/verifying-payment');

// Serve static files
// Serve uploaded staff images under /Images/staffs for easier manual placement
app.use('/uploads', express.static('uploads'));
app.use('/uploads/products', express.static('uploads/products'));
app.use('/Images/staffs', express.static('uploads/staff'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/products', require('./routes/products'));
app.use('/api/verifying-payments', require('./routes/verifyingpayment'));
app.use('/api/verifying-payment', verifyingPaymentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/refunds', require('./routes/refunds'));


// Simple health endpoint for quick checks
app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Diagnostic endpoint: list collections, counts and one sample document per collection
app.get('/api/services-summary', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const result = [];

    for (const c of collections) {
      try {
        if (c.name.startsWith('system.')) continue;
        const col = db.collection(c.name);
        const count = await col.countDocuments();
        const sample = await col.findOne({});
        result.push({ collection: c.name, count, sample });
      } catch (e) {
        // ignore errors for individual collections
      }
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('services-summary error:', err);
    return res.status(500).json({ success: false, message: 'Failed to read collections', error: err.message });
  }
});

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Salon Management System API is running!' });
});

// List registered (direct) routes for debugging
app.get('/_routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(layer => {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      routes.push(`${methods} ${layer.route.path}`);
    }
  });
  res.json({ routes });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// 404 handler with extra diagnostics
app.use((req, res) => {
  console.warn(`[404] No route matched: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found', path: req.originalUrl, method: req.method });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
