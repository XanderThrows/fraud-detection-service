import {
  FraudSubmissionRequest,
  FraudSubmissionResponse,
  FraudQueryRequest,
  FraudQueryResponse,
  FraudRecord,
  FraudAnalyticsResponse,
} from '../../types/fraud';
import { S3Service } from '../../services/s3Service';

/**
 * Cross-Banking Fraud Sharing Service
 * Allows multiple banks to share anonymized fraud intelligence
 * without exposing personal customer data
 * Connected to S3 bucket for persistent storage
 */
export class FraudService {
  // In-memory storage (synced with S3)
  private fraudRecords: FraudRecord[] = [];
  private s3Service: S3Service;
  private s3SyncInProgress: boolean = false;

  constructor() {
    this.s3Service = new S3Service();
    // Load records from S3 on initialization
    this.loadFromS3().catch((error) => {
      console.error('Error loading fraud records from S3 on initialization:', error);
    });
  }

  /**
   * Submits new fraud data to the database
   */
  public async submitFraud(
    request: FraudSubmissionRequest
  ): Promise<FraudSubmissionResponse> {
    try {
      // Validate request
      if (
        !request.bankId ||
        !request.deviceIdHash ||
        !request.accountIdHash ||
        !request.transactionPatternHash ||
        !request.fraudType ||
        !request.timestamp ||
        !request.severity
      ) {
        return {
          success: false,
          message: 'Missing required fields',
        };
      }

      // Generate unique fraud ID
      const fraudId = `fraud-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create fraud record
      const fraudRecord: FraudRecord = {
        fraudId,
        bankId: request.bankId,
        deviceIdHash: request.deviceIdHash,
        accountIdHash: request.accountIdHash,
        transactionPatternHash: request.transactionPatternHash,
        fraudType: request.fraudType,
        timestamp: request.timestamp,
        severity: request.severity,
        submittedAt: new Date().toISOString(),
      };

      // Store fraud record in memory
      this.fraudRecords.push(fraudRecord);

      // Also save to S3 bucket
      try {
        await this.s3Service.uploadFraudRecord(fraudId, fraudRecord);
      } catch (error) {
        console.error('Error saving fraud record to S3:', error);
        // Continue even if S3 save fails
      }

      return {
        success: true,
        message: 'Fraud data submitted successfully',
        fraudId,
      };
    } catch (error) {
      console.error('Error submitting fraud data:', error);
      return {
        success: false,
        message: 'Failed to submit fraud data',
      };
    }
  }

  /**
   * Checks if device, account, or transaction pattern is associated with fraud
   */
  public async queryFraud(request: FraudQueryRequest): Promise<FraudQueryResponse> {
    // Sync with S3 before querying to get latest records
    await this.syncWithS3();
    try {
      const matches = {
        deviceIdHash: false,
        accountIdHash: false,
        transactionPatternHash: false,
      };

      const matchingRecords: FraudRecord[] = [];

      // Check if any of the provided hashes match fraud records
      for (const record of this.fraudRecords) {
        let recordMatches = false;

        if (
          request.deviceIdHash &&
          record.deviceIdHash === request.deviceIdHash
        ) {
          matches.deviceIdHash = true;
          recordMatches = true;
        }

        if (
          request.accountIdHash &&
          record.accountIdHash === request.accountIdHash
        ) {
          matches.accountIdHash = true;
          recordMatches = true;
        }

        if (
          request.transactionPatternHash &&
          record.transactionPatternHash === request.transactionPatternHash
        ) {
          matches.transactionPatternHash = true;
          recordMatches = true;
        }

        if (recordMatches) {
          matchingRecords.push(record);
        }
      }

      const found =
        matches.deviceIdHash ||
        matches.accountIdHash ||
        matches.transactionPatternHash;

      return {
        found,
        matches,
        fraudRecords: found ? matchingRecords : undefined,
      };
    } catch (error) {
      console.error('Error querying fraud data:', error);
      return {
        found: false,
        matches: {
          deviceIdHash: false,
          accountIdHash: false,
          transactionPatternHash: false,
        },
      };
    }
  }

  /**
   * Gets fraud analytics
   */
  public async getAnalytics(): Promise<FraudAnalyticsResponse> {
    // Sync with S3 before getting analytics to include latest records
    await this.syncWithS3();
    try {
      if (this.fraudRecords.length === 0) {
        return {
          lastAttemptedFraud: 'N/A',
          mostCommonFraud: 'N/A',
          lastFraudulentDeviceID: 'N/A',
          totalFraudRecords: 0,
          fraudByType: {},
          fraudBySeverity: {},
        };
      }

      // Sort records by timestamp (most recent first)
      const sortedRecords = [...this.fraudRecords].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Get most recent fraud
      const lastRecord = sortedRecords[0];
      const lastAttemptedFraud = new Date(lastRecord.timestamp)
        .toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        });

      // Calculate most common fraud type
      const fraudTypeCounts: Record<string, number> = {};
      for (const record of this.fraudRecords) {
        fraudTypeCounts[record.fraudType] =
          (fraudTypeCounts[record.fraudType] || 0) + 1;
      }

      const mostCommonFraud =
        Object.entries(fraudTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        'N/A';

      // Get last fraudulent device ID
      const lastFraudulentDeviceID = lastRecord.deviceIdHash;

      // Calculate fraud by severity
      const fraudBySeverity: Record<string, number> = {};
      for (const record of this.fraudRecords) {
        fraudBySeverity[record.severity] =
          (fraudBySeverity[record.severity] || 0) + 1;
      }

      return {
        lastAttemptedFraud,
        mostCommonFraud,
        lastFraudulentDeviceID,
        totalFraudRecords: this.fraudRecords.length,
        fraudByType: fraudTypeCounts,
        fraudBySeverity,
      };
    } catch (error) {
      console.error('Error getting fraud analytics:', error);
      return {
        lastAttemptedFraud: 'N/A',
        mostCommonFraud: 'N/A',
        lastFraudulentDeviceID: 'N/A',
      };
    }
  }

  /**
   * Get all fraud records (for internal use)
   */
  public async getAllRecords(): Promise<FraudRecord[]> {
    // Sync with S3 before returning records
    await this.syncWithS3();
    return [...this.fraudRecords];
  }

  /**
   * Load fraud records from S3 bucket
   */
  private async loadFromS3(): Promise<void> {
    try {
      const records = await this.s3Service.listFraudRecords(1000); // Load up to 1000 records
      if (records && records.length > 0) {
        // Merge with existing records, avoiding duplicates
        const existingIds = new Set(this.fraudRecords.map(r => r.fraudId));
        const newRecords = records.filter(r => !existingIds.has(r.fraudId));
        this.fraudRecords.push(...newRecords);
        console.log(`Loaded ${newRecords.length} fraud records from S3`);
      }
    } catch (error) {
      console.error('Error loading fraud records from S3:', error);
    }
  }

  /**
   * Sync fraud records with S3 bucket
   */
  private async syncWithS3(): Promise<void> {
    // Prevent concurrent sync operations
    if (this.s3SyncInProgress) {
      return;
    }

    this.s3SyncInProgress = true;
    try {
      await this.loadFromS3();
    } finally {
      this.s3SyncInProgress = false;
    }
  }
}



