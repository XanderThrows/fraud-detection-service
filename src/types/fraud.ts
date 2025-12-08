export interface FraudSubmissionRequest {
  bankId: string;
  deviceIdHash: string;
  accountIdHash: string;
  transactionPatternHash: string;
  fraudType: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface FraudSubmissionResponse {
  success: boolean;
  message: string;
  fraudId?: string;
}

export interface FraudQueryRequest {
  deviceIdHash?: string;
  accountIdHash?: string;
  transactionPatternHash?: string;
}

export interface FraudQueryResponse {
  found: boolean;
  matches: {
    deviceIdHash?: boolean;
    accountIdHash?: boolean;
    transactionPatternHash?: boolean;
  };
  fraudRecords?: FraudRecord[];
}

export interface FraudRecord {
  fraudId: string;
  bankId: string;
  deviceIdHash: string;
  accountIdHash: string;
  transactionPatternHash: string;
  fraudType: string;
  timestamp: string;
  severity: string;
  submittedAt: string;
}

export interface FraudAnalyticsResponse {
  lastAttemptedFraud: string;
  mostCommonFraud: string;
  lastFraudulentDeviceID: string;
  totalFraudRecords?: number;
  fraudByType?: Record<string, number>;
  fraudBySeverity?: Record<string, number>;
}






