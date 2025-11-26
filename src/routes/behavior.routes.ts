import express, { Request, Response } from 'express';
import { BehaviorAnalyzer } from '../modules/human-intent-detection/behaviorAnalyzer';
import { BehaviorAnalysisRequest } from '../types/behavior';

const router = express.Router();
const behaviorAnalyzer = new BehaviorAnalyzer();

/**
 * POST /behavior/analyze
 * Analyzes user behavior patterns to detect potential fraud or coercion
 */
router.post('/analyze', (req: Request, res: Response) => {
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

