export interface TransactionPredictionRequest {
  transactionId: string;
  userId: string;
  amount: number;
  currency: string;
  recipientAccount: string;
  userAverageTransAmount: number;
  transactionType: string;
  location: string;
  timestamp: string;
  deviceId: string;
}

export interface TransactionPredictionResponse {
  transactionId: string;
  predictionResult: 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK';
  riskScore: number; // Overall Transaction Risk Score (0.00 to 1.00)
  recommendedAction: 'APPROVE' | 'FLAG_FOR_REVIEW' | 'DELAY_AND_MFA' | 'BLOCK';
  reasonCodes: string[];
}






