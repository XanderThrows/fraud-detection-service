import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

/**
 * AWS S3 Service for storing fraud data
 */
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || 'fraud-detection-service-data';
    
    const credentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined;
    
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      ...(credentials && { credentials }),
    });
  }

  /**
   * Upload fraud record to S3
   */
  async uploadFraudRecord(fraudId: string, data: any): Promise<boolean> {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      const key = `fraud-records/${year}/${month}/fraud-${fraudId}.json`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: JSON.stringify(data, null, 2),
        ContentType: 'application/json',
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Error uploading fraud record to S3:', error);
      return false;
    }
  }

  /**
   * Get fraud record from S3
   */
  async getFraudRecord(fraudId: string): Promise<any | null> {
    try {
      // Search for the fraud record (may need to list and filter)
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: 'fraud-records/',
      });

      const listResponse = await this.s3Client.send(listCommand);
      
      if (!listResponse.Contents) {
        return null;
      }

      // Find the record with matching fraudId
      const matchingKey = listResponse.Contents.find(
        (obj) => obj.Key?.includes(`fraud-${fraudId}.json`)
      )?.Key;

      if (!matchingKey) {
        return null;
      }

      const getCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: matchingKey,
      });

      const response = await this.s3Client.send(getCommand);
      
      if (response.Body instanceof Readable) {
        const chunks: Uint8Array[] = [];
        for await (const chunk of response.Body) {
          chunks.push(chunk);
        }
        const bodyString = Buffer.concat(chunks).toString('utf-8');
        return JSON.parse(bodyString);
      }

      return null;
    } catch (error) {
      console.error('Error getting fraud record from S3:', error);
      return null;
    }
  }

  /**
   * List all fraud records
   */
  async listFraudRecords(limit: number = 100): Promise<any[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: 'fraud-records/',
        MaxKeys: limit,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Contents) {
        return [];
      }

      const records: any[] = [];
      
      for (const obj of response.Contents) {
        if (obj.Key) {
          const getCommand = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: obj.Key,
          });

          const getResponse = await this.s3Client.send(getCommand);
          
          if (getResponse.Body instanceof Readable) {
            const chunks: Uint8Array[] = [];
            for await (const chunk of getResponse.Body) {
              chunks.push(chunk);
            }
            const bodyString = Buffer.concat(chunks).toString('utf-8');
            records.push(JSON.parse(bodyString));
          }
        }
      }

      return records;
    } catch (error) {
      console.error('Error listing fraud records from S3:', error);
      return [];
    }
  }

  /**
   * Save analytics to S3
   */
  async saveAnalytics(analytics: any): Promise<boolean> {
    try {
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const key = `analytics/daily/analytics-${date}.json`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: JSON.stringify(analytics, null, 2),
        ContentType: 'application/json',
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Error saving analytics to S3:', error);
      return false;
    }
  }

  /**
   * Get analytics from S3
   */
  async getAnalytics(date?: string): Promise<any | null> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const key = `analytics/daily/analytics-${targetDate}.json`;
      
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (response.Body instanceof Readable) {
        const chunks: Uint8Array[] = [];
        for await (const chunk of response.Body) {
          chunks.push(chunk);
        }
        const bodyString = Buffer.concat(chunks).toString('utf-8');
        return JSON.parse(bodyString);
      }

      return null;
    } catch (error) {
      console.error('Error getting analytics from S3:', error);
      return null;
    }
  }

  /**
   * Delete fraud record from S3
   */
  async deleteFraudRecord(fraudId: string): Promise<boolean> {
    try {
      // First, find the record
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: 'fraud-records/',
      });

      const listResponse = await this.s3Client.send(listCommand);
      
      if (!listResponse.Contents) {
        return false;
      }

      const matchingKey = listResponse.Contents.find(
        (obj) => obj.Key?.includes(`fraud-${fraudId}.json`)
      )?.Key;

      if (!matchingKey) {
        return false;
      }

      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: matchingKey,
      });

      await this.s3Client.send(deleteCommand);
      return true;
    } catch (error) {
      console.error('Error deleting fraud record from S3:', error);
      return false;
    }
  }

  /**
   * Test S3 connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error('S3 connection test failed:', error);
      return false;
    }
  }
}
