import express, { Request, Response } from 'express';
import { TransactionAnalyzer } from '../modules/predictive-scam-prevention/transactionAnalyzer';
import { TransactionPredictionRequest } from '../types/transaction';
import { S3Service } from '../services/s3Service';
import { transactionToFraudRecord, isTransactionFraud } from '../utils/fraudUtils';

const router = express.Router();
const transactionAnalyzer = new TransactionAnalyzer();
const s3Service = new S3Service();

/**
 * POST /transactions/predict
 * Predicts if a transaction is a scam by evaluating amount, type, location, etc.
 */
router.post('/predict', async (req: Request, res: Response) => {
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

    // If fraud is detected, save to S3 bucket
    if (isTransactionFraud(result)) {
      try {
        const fraudRecord = transactionToFraudRecord(request, result, process.env.BANK_ID || 'default-bank');
        await s3Service.uploadFraudRecord(fraudRecord.fraudId, fraudRecord);
        console.log(`Fraud detected from transaction analysis - saved to S3: ${fraudRecord.fraudId}`);
      } catch (error) {
        console.error('Error saving fraud record to S3:', error);
        // Continue even if S3 save fails - don't block the response
      }
    }

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



