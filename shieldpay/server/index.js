import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import analyzeRoutes from './routes/analyze.js';
import bankingRoutes from './routes/banking.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting: 20 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'error',
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', process.env.CLIENT_URL].filter(Boolean)
}));
app.use(express.json());
app.use(limiter);

// Routes
app.use('/api/v1/analyze', analyzeRoutes);
app.use('/api/v1/banking', bankingRoutes);
app.use('/api/v1/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong on our end.'
  });
});

app.listen(PORT, () => {
  console.log(`ShieldPay Server running on port ${PORT}`);
});
