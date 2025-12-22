import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import behaviorRoutes from './routes/behavior.routes';
import transactionRoutes from './routes/transaction.routes';
import fraudRoutes from './routes/fraud.routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Fraud Detection Service API Documentation',
}));

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
      {
        method: 'POST',
        path: '/fraud/submit',
        description: 'Submits new fraud data to the shared database',
        requestBody: {
          bankId: 'string (required)',
          deviceIdHash: 'string (required)',
          accountIdHash: 'string (required)',
          transactionPatternHash: 'string (required)',
          fraudType: 'string (required)',
          timestamp: 'string (required) - ISO 8601 format',
          severity: 'low | medium | high | critical (required)',
        },
        response: {
          success: 'boolean',
          message: 'string',
          fraudId: 'string (optional)',
        },
      },
      {
        method: 'POST',
        path: '/fraud/query',
        description: 'Checks if device, account, or transaction pattern is associated with fraud',
        requestBody: {
          deviceIdHash: 'string (optional)',
          accountIdHash: 'string (optional)',
          transactionPatternHash: 'string (optional)',
        },
        response: {
          found: 'boolean',
          matches: {
            deviceIdHash: 'boolean',
            accountIdHash: 'boolean',
            transactionPatternHash: 'boolean',
          },
          fraudRecords: 'FraudRecord[] (optional)',
        },
      },
      {
        method: 'GET',
        path: '/fraud/analytics',
        description: 'Returns fraud analytics and statistics',
        response: {
          lastAttemptedFraud: 'string',
          mostCommonFraud: 'string',
          lastFraudulentDeviceID: 'string',
          totalFraudRecords: 'number (optional)',
          fraudByType: 'Record<string, number> (optional)',
          fraudBySeverity: 'Record<string, number> (optional)',
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
app.use('/fraud', fraudRoutes);

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
  console.log(`📚 Swagger API documentation: http://localhost:${PORT}/api-docs`);
  console.log(`📋 API endpoints list: http://localhost:${PORT}/getAll`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Behavior analysis: http://localhost:${PORT}/behavior/analyze`);
  console.log(`💰 Transaction prediction: http://localhost:${PORT}/transactions/predict`);
  console.log(`🏦 Fraud sharing: http://localhost:${PORT}/fraud/submit`);
  console.log(`🔎 Fraud query: http://localhost:${PORT}/fraud/query`);
  console.log(`📈 Fraud analytics: http://localhost:${PORT}/fraud/analytics`);
});

export default app;

