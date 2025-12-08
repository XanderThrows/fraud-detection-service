import express, { Request, Response } from 'express';
import { BehaviorAnalyzer } from '../modules/human-intent-detection/behaviorAnalyzer';
import { BehaviorAnalysisRequest } from '../types/behavior';
import { S3Service } from '../services/s3Service';
import { behaviorToFraudRecord, isBehaviorFraud } from '../utils/fraudUtils';

const router = express.Router();
const behaviorAnalyzer = new BehaviorAnalyzer();
const s3Service = new S3Service();

/**
 * POST /behavior/analyze
 * Analyzes user behavior patterns to detect potential fraud or coercion
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const request: BehaviorAnalysisRequest = req.body;

    // Basic validation
    if (!request.userId || !request.sessionId) {
      return res.status(400).json({
        error: 'Missing required fields: userId and sessionId are required',
      });
    }

    if (
      typeof request.typingSpeed !== 'number' ||
      typeof request.mouseMovement !== 'number' ||
      typeof request.navigationTime !== 'number'
    ) {
      return res.status(400).json({
        error: 'Invalid data types: typingSpeed, mouseMovement, and navigationTime must be numbers',
      });
    }

    if (!Array.isArray(request.clickPattern) || !Array.isArray(request.pagesVisited)) {
      return res.status(400).json({
        error: 'Invalid data types: clickPattern and pagesVisited must be arrays',
      });
    }

    // Analyze behavior
    const result = behaviorAnalyzer.analyzeBehavior(request);

    // If fraud is detected, save to S3 bucket
    if (isBehaviorFraud(result)) {
      try {
        const fraudRecord = behaviorToFraudRecord(request, result, process.env.BANK_ID || 'default-bank');
        await s3Service.uploadFraudRecord(fraudRecord.fraudId, fraudRecord);
        console.log(`Fraud detected from behavior analysis - saved to S3: ${fraudRecord.fraudId}`);
      } catch (error) {
        console.error('Error saving fraud record to S3:', error);
        // Continue even if S3 save fails - don't block the response
      }
    }

    // Return response
    res.status(200).json(result);
  } catch (error) {
    console.error('Error analyzing behavior:', error);
    res.status(500).json({
      error: 'Internal server error while analyzing behavior',
    });
  }
});

export default router;

