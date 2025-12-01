import express, { Request, Response } from 'express';
import { FraudService } from '../modules/cross-banking-fraud-sharing/fraudService';
import {
  FraudSubmissionRequest,
  FraudQueryRequest,
} from '../types/fraud';

const router = express.Router();
const fraudService = new FraudService();

/**
 * POST /fraud/submit
 * Submits new fraud data to the database
 */
router.post('/submit', (req: Request, res: Response) => {
  try {
    const request: FraudSubmissionRequest = req.body;

    // Validate required fields
    if (
      !request.bankId ||
      !request.deviceIdHash ||
      !request.accountIdHash ||
      !request.transactionPatternHash ||
      !request.fraudType ||
      !request.timestamp ||
      !request.severity
    ) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: [
          'bankId',
          'deviceIdHash',
          'accountIdHash',
          'transactionPatternHash',
          'fraudType',
          'timestamp',
          'severity',
        ],
      });
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(request.severity)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid severity. Must be one of: low, medium, high, critical',
      });
    }

    // Submit fraud data
    const result = fraudService.submitFraud(request);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in fraud submission:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while submitting fraud data',
    });
  }
});

/**
 * POST /fraud/query
 * Checks if device, account, or transaction pattern is associated with fraud
 */
router.post('/query', (req: Request, res: Response) => {
  try {
    const request: FraudQueryRequest = req.body;

    // Validate that at least one hash is provided
    if (
      !request.deviceIdHash &&
      !request.accountIdHash &&
      !request.transactionPatternHash
    ) {
      return res.status(400).json({
        error: 'At least one of deviceIdHash, accountIdHash, or transactionPatternHash must be provided',
      });
    }

    // Query fraud data
    const result = fraudService.queryFraud(request);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in fraud query:', error);
    res.status(500).json({
      error: 'Internal server error while querying fraud data',
    });
  }
});

/**
 * GET /fraud/analytics
 * Returns fraud analytics and statistics
 */
router.get('/analytics', (req: Request, res: Response) => {
  try {
    const analytics = fraudService.getAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error getting fraud analytics:', error);
    res.status(500).json({
      error: 'Internal server error while retrieving fraud analytics',
    });
  }
});

export default router;

