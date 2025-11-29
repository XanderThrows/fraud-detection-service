import {
  TransactionPredictionRequest,
  TransactionPredictionResponse,
} from '../../types/transaction';

/**
 * Predictive Scam Prevention Module
 * Uses real-time data and AI models to identify high-risk transactions before they occur
 */
export class TransactionAnalyzer {
  // Risk thresholds - Made more sensitive
  private readonly HIGH_AMOUNT_MULTIPLIER = 3; // Amount > 3x average is high risk (lowered from 5x)
  private readonly VERY_HIGH_AMOUNT_MULTIPLIER = 5; // Amount > 5x average is very high risk (lowered from 10x)
  private readonly HIGH_RISK_SCORE_THRESHOLD = 0.6; // Lowered from 0.7
  private readonly SUSPICIOUS_SCORE_THRESHOLD = 0.3; // Lowered from 0.4

  // High-risk transaction types
  private readonly HIGH_RISK_TRANSACTION_TYPES = [
    'wire_transfer',
    'international_transfer',
    'cryptocurrency',
    'money_order',
    'cash_advance',
  ];

  // High-risk locations (can be expanded with actual fraud data)
  private readonly HIGH_RISK_LOCATIONS = [
    'offshore',
    'tax_haven',
    'sanctioned_country',
  ];

  /**
   * Analyzes a transaction and predicts if it's a scam
   */
  public analyzeTransaction(
    request: TransactionPredictionRequest
  ): TransactionPredictionResponse {
    const reasonCodes: string[] = [];
    let riskScore = 0.0;

    // Analyze amount relative to user's average
    const amountRisk = this.analyzeAmount(
      request.amount,
      request.userAverageTransAmount
    );
    if (amountRisk > 0) {
      if (request.amount > request.userAverageTransAmount * this.VERY_HIGH_AMOUNT_MULTIPLIER) {
        reasonCodes.push('VERY_HIGH_AMOUNT');
      } else {
        reasonCodes.push('HIGH_AMOUNT');
      }
      riskScore += amountRisk * 0.32; // Increased from 30% to 32% weight
    }

    // Analyze transaction type
    const transactionTypeRisk = this.analyzeTransactionType(request.transactionType);
    if (transactionTypeRisk > 0) {
      reasonCodes.push('HIGH_RISK_TRANSACTION_TYPE');
      riskScore += transactionTypeRisk * 0.22; // Increased from 20% to 22% weight
    }

    // Analyze location
    const locationRisk = this.analyzeLocation(request.location);
    if (locationRisk > 0) {
      reasonCodes.push('HIGH_RISK_LOCATION');
      riskScore += locationRisk * 0.18; // Increased from 15% to 18% weight
    }

    // Analyze device (new device is suspicious)
    const deviceRisk = this.analyzeDevice(request.deviceId, request.userId);
    if (deviceRisk > 0) {
      reasonCodes.push('NEW_DEVICE');
      riskScore += deviceRisk * 0.18; // Increased from 15% to 18% weight
    }

    // Analyze transaction timing (unusual hours, rapid transactions)
    const timingRisk = this.analyzeTiming(request.timestamp, request.userId);
    if (timingRisk > 0) {
      reasonCodes.push('UNUSUAL_TIMING');
      riskScore += timingRisk * 0.12; // Increased from 10% to 12% weight
    }

    // Analyze recipient account (new recipient is more risky)
    const recipientRisk = this.analyzeRecipient(
      request.recipientAccount,
      request.userId
    );
    if (recipientRisk > 0) {
      reasonCodes.push('NEW_RECIPIENT');
      riskScore += recipientRisk * 0.12; // Increased from 10% to 12% weight
    }

    // Ensure risk score is between 0.00 and 1.00
    riskScore = Math.min(1.0, Math.max(0.0, riskScore));

    // Determine prediction result
    let predictionResult: 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK';
    if (riskScore >= this.HIGH_RISK_SCORE_THRESHOLD) {
      predictionResult = 'HIGH_RISK';
    } else if (riskScore >= this.SUSPICIOUS_SCORE_THRESHOLD) {
      predictionResult = 'SUSPICIOUS';
    } else {
      predictionResult = 'SAFE';
    }

    // Determine recommended action
    const recommendedAction = this.determineAction(riskScore, reasonCodes);

    return {
      transactionId: request.transactionId,
      predictionResult,
      riskScore: Math.round(riskScore * 100) / 100, // Round to 2 decimal places
      recommendedAction,
      reasonCodes,
    };
  }

  /**
   * Analyzes transaction amount relative to user's average
   * Made more sensitive with lower thresholds and higher risk scores
   */
  private analyzeAmount(amount: number, averageAmount: number): number {
    if (averageAmount <= 0) {
      // No average available, treat as medium-high risk
      return 0.65; // Increased from 0.5
    }

    const ratio = amount / averageAmount;

    if (ratio >= this.VERY_HIGH_AMOUNT_MULTIPLIER) {
      // Very high amount - very high risk
      return 0.98; // Increased from 0.95
    } else if (ratio >= this.HIGH_AMOUNT_MULTIPLIER) {
      // High amount - high risk
      return 0.85; // Increased from 0.8
    } else if (ratio >= 2) {
      // Moderately high amount - medium-high risk (lowered threshold from 3x)
      return 0.65; // Increased from 0.5
    } else if (ratio >= 1.5) {
      // Slightly high amount - medium risk (new tier)
      return 0.45;
    } else if (ratio >= 1.2) {
      // Slightly above average - low-medium risk (new tier)
      return 0.25;
    }

    return 0.0;
  }

  /**
   * Analyzes transaction type for risk
   * Made more sensitive with higher risk scores
   */
  private analyzeTransactionType(transactionType: string): number {
    const normalizedType = transactionType.toLowerCase().replace(/[_-]/g, '_');

    if (this.HIGH_RISK_TRANSACTION_TYPES.some((type) =>
      normalizedType.includes(type)
    )) {
      return 0.85; // Increased from 0.7 - High risk transaction type
    }

    // Medium risk types
    if (
      normalizedType.includes('transfer') ||
      normalizedType.includes('payment')
    ) {
      return 0.45; // Increased from 0.3
    }

    // Low-medium risk for any transaction
    if (normalizedType.length > 0) {
      return 0.15; // New tier - all transactions have some base risk
    }

    return 0.0;
  }

  /**
   * Analyzes location for risk
   * Made more sensitive with higher risk scores and additional checks
   */
  private analyzeLocation(location: string): number {
    const normalizedLocation = location.toLowerCase();

    // Check for high-risk location keywords
    if (
      this.HIGH_RISK_LOCATIONS.some((riskLocation) =>
        normalizedLocation.includes(riskLocation)
      )
    ) {
      return 0.9; // Increased from 0.8 - High risk location
    }

    // International transactions are more risky
    if (
      normalizedLocation.includes('international') ||
      normalizedLocation.includes('foreign')
    ) {
      return 0.55; // Increased from 0.4
    }

    // Different country/state is slightly risky (new check)
    if (
      normalizedLocation.includes('country') ||
      normalizedLocation.includes('state') ||
      normalizedLocation.includes('abroad')
    ) {
      return 0.3; // New tier
    }

    return 0.0;
  }

  /**
   * Analyzes device - new devices are suspicious
   * Made more sensitive - assumes more devices are new/suspicious
   * In a real implementation, this would check against a database of known devices
   */
  private analyzeDevice(deviceId: string, userId: string): number {
    // TODO: In production, check against user's device history
    // For now, we'll use a simple heuristic: device IDs starting with "new" or "temp" are suspicious
    if (deviceId.toLowerCase().includes('new') || deviceId.toLowerCase().includes('temp')) {
      return 0.8; // Increased from 0.6
    }

    // Check for suspicious device patterns
    if (
      deviceId.toLowerCase().includes('unknown') ||
      deviceId.toLowerCase().includes('guest') ||
      deviceId.length < 5
    ) {
      return 0.7; // New tier - suspicious device patterns
    }

    // In a real system, you'd query a database:
    // const deviceHistory = await getDeviceHistory(userId);
    // if (!deviceHistory.includes(deviceId)) {
    //   return 0.75; // New device (increased from 0.7)
    // }

    // For demo purposes, we'll be more conservative and assume unknown devices are risky
    // This is a placeholder - in production, use actual device tracking
    // For now, if device doesn't match known patterns, give it a small risk
    if (!deviceId.toLowerCase().includes('device-') && !deviceId.match(/^[a-z0-9-]+$/i)) {
      return 0.4; // New tier - unknown device format
    }

    return 0.0; // Default: assume device is known
  }

  /**
   * Analyzes transaction timing for unusual patterns
   * Made more sensitive with expanded time windows and higher risk scores
   */
  private analyzeTiming(timestamp: string, userId: string): number {
    try {
      const transactionDate = new Date(timestamp);
      const hour = transactionDate.getUTCHours();

      // Transactions outside business hours (1 AM - 7 AM UTC) are more suspicious (expanded window)
      if (hour >= 1 && hour < 7) {
        return 0.65; // Increased from 0.5 - Unusual timing
      }

      // Very late night (10 PM - 1 AM) is also suspicious (expanded window)
      if (hour >= 22 || hour < 1) {
        return 0.45; // Increased from 0.3
      }

      // Early morning (7 AM - 9 AM) is slightly suspicious (new tier)
      if (hour >= 7 && hour < 9) {
        return 0.3; // New tier
      }

      // Weekend transactions are slightly more risky (new check)
      const dayOfWeek = transactionDate.getUTCDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return 0.25; // New tier - weekend transactions
      }

      // TODO: In production, check against user's typical transaction times
      // const userTypicalHours = await getUserTypicalTransactionHours(userId);
      // if (!userTypicalHours.includes(hour)) {
      //   return 0.5; // Increased from 0.4
      // }
    } catch (error) {
      // Invalid timestamp
      return 0.35; // Increased from 0.2
    }

    return 0.0;
  }

  /**
   * Analyzes recipient account - new recipients are more risky
   * Made more sensitive with more suspicious patterns and higher risk scores
   */
  private analyzeRecipient(recipientAccount: string, userId: string): number {
    // TODO: In production, check against user's recipient history
    // const recipientHistory = await getRecipientHistory(userId);
    // if (!recipientHistory.includes(recipientAccount)) {
    //   return 0.75; // Increased from 0.6 - New recipient
    // }

    // For demo purposes, we'll use a simple heuristic
    // Recipient accounts with suspicious patterns
    if (
      recipientAccount.length < 5 ||
      recipientAccount.toLowerCase().includes('temp') ||
      recipientAccount.toLowerCase().includes('test')
    ) {
      return 0.85; // Increased from 0.7 - Suspicious recipient account
    }

    // Additional suspicious patterns (new checks)
    if (
      recipientAccount.toLowerCase().includes('unknown') ||
      recipientAccount.toLowerCase().includes('new') ||
      recipientAccount.match(/^[0-9]{4,}$/) // All numeric accounts are suspicious
    ) {
      return 0.6; // New tier - suspicious patterns
    }

    // Short account numbers are slightly risky (new check)
    if (recipientAccount.length < 8) {
      return 0.35; // New tier
    }

    return 0.0; // Default: assume recipient is known
  }

  /**
   * Determines the recommended action based on risk score and reason codes
   * Made more sensitive - more aggressive blocking and flagging
   */
  private determineAction(
    riskScore: number,
    reasonCodes: string[]
  ): 'APPROVE' | 'FLAG_FOR_REVIEW' | 'DELAY_AND_MFA' | 'BLOCK' {
    // Block if very high risk or multiple critical flags (lowered thresholds)
    if (
      riskScore >= 0.85 || // Lowered from 0.9
      (riskScore >= 0.7 && // Lowered from 0.8
        (reasonCodes.includes('VERY_HIGH_AMOUNT') ||
          reasonCodes.includes('HIGH_RISK_LOCATION'))) ||
      reasonCodes.length >= 4 // New check - 4+ flags = block
    ) {
      return 'BLOCK';
    }

    // Delay and require MFA for high risk (lowered thresholds)
    if (
      riskScore >= this.HIGH_RISK_SCORE_THRESHOLD ||
      (riskScore >= 0.5 && // Lowered from 0.6
        (reasonCodes.includes('HIGH_AMOUNT') ||
          reasonCodes.includes('NEW_DEVICE') ||
          reasonCodes.includes('HIGH_RISK_TRANSACTION_TYPE'))) ||
      reasonCodes.length >= 3 // New check - 3+ flags = delay and MFA
    ) {
      return 'DELAY_AND_MFA';
    }

    // Flag for review if suspicious (lowered thresholds)
    if (
      riskScore >= this.SUSPICIOUS_SCORE_THRESHOLD ||
      reasonCodes.length >= 2 ||
      riskScore >= 0.25 // New check - even low-medium risk gets flagged
    ) {
      return 'FLAG_FOR_REVIEW';
    }

    // Approve if low risk
    return 'APPROVE';
  }
}

