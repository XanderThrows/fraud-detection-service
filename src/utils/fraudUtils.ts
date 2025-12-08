import { createHash } from 'crypto';
import { FraudRecord } from '../types/fraud';
import { BehaviorAnalysisRequest, BehaviorAnalysisResponse } from '../types/behavior';
import { TransactionPredictionRequest, TransactionPredictionResponse } from '../types/transaction';

/**
 * Creates a SHA-256 hash of the input string
 */
function hashString(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Converts behavior analysis data to a FraudRecord
 */
export function behaviorToFraudRecord(
  request: BehaviorAnalysisRequest,
  response: BehaviorAnalysisResponse,
  bankId: string = 'default-bank'
): FraudRecord {
  const fraudId = `fraud-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create hashes from available data
  const deviceIdHash = hashString(request.sessionId); // Using sessionId as device identifier
  const accountIdHash = hashString(request.userId);
  const transactionPatternHash = hashString(
    JSON.stringify({
      typingSpeed: request.typingSpeed,
      mouseMovement: request.mouseMovement,
      clickPattern: request.clickPattern,
      pagesVisited: request.pagesVisited,
    })
  );

  // Determine severity based on risk score
  let severity: 'low' | 'medium' | 'high' | 'critical';
  if (response.intentRiskScore >= 0.8) {
    severity = 'critical';
  } else if (response.intentRiskScore >= 0.6) {
    severity = 'high';
  } else if (response.intentRiskScore >= 0.4) {
    severity = 'medium';
  } else {
    severity = 'low';
  }

  return {
    fraudId,
    bankId,
    deviceIdHash,
    accountIdHash,
    transactionPatternHash,
    fraudType: 'human_intent_fraud',
    timestamp: new Date().toISOString(),
    severity,
    submittedAt: new Date().toISOString(),
  };
}

/**
 * Converts transaction prediction data to a FraudRecord
 */
export function transactionToFraudRecord(
  request: TransactionPredictionRequest,
  response: TransactionPredictionResponse,
  bankId: string = 'default-bank'
): FraudRecord {
  const fraudId = `fraud-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create hashes from available data
  const deviceIdHash = hashString(request.deviceId);
  const accountIdHash = hashString(request.userId);
  const transactionPatternHash = hashString(
    JSON.stringify({
      transactionType: request.transactionType,
      amount: request.amount,
      location: request.location,
      recipientAccount: request.recipientAccount,
    })
  );

  // Determine severity based on prediction result and risk score
  let severity: 'low' | 'medium' | 'high' | 'critical';
  if (response.predictionResult === 'HIGH_RISK') {
    if (response.riskScore >= 0.8) {
      severity = 'critical';
    } else {
      severity = 'high';
    }
  } else if (response.predictionResult === 'SUSPICIOUS') {
    if (response.riskScore >= 0.5) {
      severity = 'high';
    } else {
      severity = 'medium';
    }
  } else {
    severity = 'low';
  }

  return {
    fraudId,
    bankId,
    deviceIdHash,
    accountIdHash,
    transactionPatternHash,
    fraudType: 'predictive_scam',
    timestamp: request.timestamp,
    severity,
    submittedAt: new Date().toISOString(),
  };
}

/**
 * Checks if behavior analysis indicates fraud
 */
export function isBehaviorFraud(response: BehaviorAnalysisResponse): boolean {
  // Consider fraud if intentRiskScore >= 0.7 (high risk threshold)
  return response.intentRiskScore >= 0.7;
}

/**
 * Checks if transaction prediction indicates fraud
 */
export function isTransactionFraud(response: TransactionPredictionResponse): boolean {
  // Consider fraud if HIGH_RISK or SUSPICIOUS
  return response.predictionResult === 'HIGH_RISK' || response.predictionResult === 'SUSPICIOUS';
}

