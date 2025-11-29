import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import behaviorRoutes from './routes/behavior.routes';
import transactionRoutes from './routes/transaction.routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint - API documentation
app.get('/getAll', (req, res) => {
  res.status(200).json({
    service: 'fraud-detection-service',
    version: '1.0.0',
    description: 'Fraud detection microservice with human-intent detection, predictive scam prevention, and cross-banking fraud sharing',
    endpoints: [
      {
        method: 'GET',
        path: '/getAll',
        description: 'Get all available API endpoints',
      },
      {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint to verify service status',
      },
      {
        method: 'POST',
        path: '/behavior/analyze',
        description: 'Analyze user behavior patterns to detect potential fraud or coercion',
        requestBody: {
          userId: 'string (required)',
          sessionId: 'string (required)',
          typingSpeed: 'number (required) - characters per minute',
          mouseMovement: 'number (required) - distance in pixels',
          clickPattern: 'number[] (required) - milliseconds between clicks',
          navigationTime: 'number (required) - seconds spent on sensitive page',
          pagesVisited: 'string[] (required) - list of pages visited',
        },
        response: {
          sessionId: 'string',
          intentRiskScore: 'number (0.00-1.00)',
          behaviorFlags: 'string[]',
        },
      },
      {
        method: 'POST',
        path: '/transactions/predict',
        description: 'Predicts if a transaction is a scam by evaluating amount, type, location, etc.',
        requestBody: {
          transactionId: 'string (required)',
          userId: 'string (required)',
          amount: 'number (required)',
          currency: 'string (required)',
          recipientAccount: 'string (required)',
          userAverageTransAmount: 'number (required)',
          transactionType: 'string (required)',
          location: 'string (required)',
          timestamp: 'string (required) - ISO 8601 format',
          deviceId: 'string (required)',
        },
        response: {
          transactionId: 'string',
          predictionResult: 'SAFE | SUSPICIOUS | HIGH_RISK',
          riskScore: 'number (0.00-1.00)',
          recommendedAction: 'APPROVE | FLAG_FOR_REVIEW | DELAY_AND_MFA | BLOCK',
          reasonCodes: 'string[]',
        },
      },
    ],
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'fraud-detection-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/behavior', behaviorRoutes);
app.use('/transactions', transactionRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Fraud Detection Service running on port ${PORT}`);
  console.log(`📋 API documentation: http://localhost:${PORT}/getAll`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Behavior analysis: http://localhost:${PORT}/behavior/analyze`);
  console.log(`💰 Transaction prediction: http://localhost:${PORT}/transactions/predict`);
});

export default app;

