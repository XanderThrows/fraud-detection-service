import express, { Request, Response } from 'express';
import { TransactionAnalyzer } from '../modules/predictive-scam-prevention/transactionAnalyzer';
import { TransactionPredictionRequest } from '../types/transaction';

const router = express.Router();
const transactionAnalyzer = new TransactionAnalyzer();

/**
 * POST /transactions/predict
 * Predicts if a transaction is a scam by evaluating amount, type, location, etc.
 */
router.post('/predict', (req: Request, res: Response) => {
  try {
    // Validate request body
    const request: TransactionPredictionRequest = req.body;

    // Basic validation
    if (!request.transactionId || !request.userId) {
      return res.status(400).json({
        error: 'Missing required fields: transactionId and userId are required',
      });
    }

    if (
      typeof request.amount !== 'number' ||
      typeof request.userAverageTransAmount !== 'number'
    ) {
      return res.status(400).json({
        error: 'Invalid data types: amount and userAverageTransAmount must be numbers',
      });
    }

    if (request.amount < 0 || request.userAverageTransAmount < 0) {
      return res.status(400).json({
        error: 'Amount values cannot be negative',
      });
    }

    if (!request.currency || !request.transactionType || !request.location) {
      return res.status(400).json({
        error: 'Missing required fields: currency, transactionType, and location are required',
      });
    }

    // Analyze transaction
    const result = transactionAnalyzer.analyzeTransaction(request);

    // Return response
    res.status(200).json(result);
  } catch (error) {
    console.error('Error analyzing transaction:', error);
    res.status(500).json({
      error: 'Internal server error while analyzing transaction',
    });
  }
});

export default router;



