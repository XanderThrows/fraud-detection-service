import { S3Service } from '../src/services/s3Service';

describe('AWS S3 Connection', () => {
  const requiredEnvVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'S3_BUCKET_NAME',
  ];

  describe('Environment Variables', () => {
    it('should have all required environment variables set', () => {
      const missingVars: string[] = [];

      for (const varName of requiredEnvVars) {
        const value = process.env[varName];
        if (!value || value.includes('your-') || value.includes('here')) {
          missingVars.push(varName);
        }
      }

      if (missingVars.length > 0) {
        console.log('\n⚠️  Missing or placeholder environment variables:');
        missingVars.forEach((varName) => {
          console.log(`   - ${varName}`);
        });
        console.log('\nPlease set all required variables in .env file\n');
      }

      expect(missingVars).toHaveLength(0);
    });

    it('should not have placeholder values for AWS_ACCESS_KEY_ID', () => {
      const accessKey = process.env.AWS_ACCESS_KEY_ID;
      expect(accessKey).toBeDefined();
      expect(accessKey).not.toContain('your-');
      expect(accessKey).not.toContain('here');
      expect(accessKey?.length).toBeGreaterThan(10);
    });

    it('should not have placeholder values for AWS_SECRET_ACCESS_KEY', () => {
      const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
      expect(secretKey).toBeDefined();
      expect(secretKey).not.toContain('your-');
      expect(secretKey).not.toContain('here');
      expect(secretKey?.length).toBeGreaterThan(20);
    });

    it('should have a valid AWS region', () => {
      const region = process.env.AWS_REGION;
      expect(region).toBeDefined();
      expect(region).toMatch(/^[a-z0-9-]+$/);
    });

    it('should have a valid S3 bucket name', () => {
      const bucketName = process.env.S3_BUCKET_NAME;
      expect(bucketName).toBeDefined();
      expect(bucketName).not.toContain('your-');
      expect(bucketName?.length).toBeGreaterThan(3);
    });
  });

  describe('S3 Service Connection', () => {
    let s3Service: S3Service;

    beforeAll(() => {
      s3Service = new S3Service();
    });

    it('should successfully connect to S3 bucket', async () => {
      const isConnected = await s3Service.testConnection();
      
      expect(isConnected).toBe(true);
    }, 10000); // 10 second timeout for network requests

    it('should have correct bucket name configured', () => {
      const bucketName = process.env.S3_BUCKET_NAME;
      expect(bucketName).toBeDefined();
      expect(bucketName).toBeTruthy();
    });

    it('should have correct AWS region configured', () => {
      const region = process.env.AWS_REGION;
      expect(region).toBeDefined();
      expect(region).toBeTruthy();
    });
  });

  describe('S3 Service Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      // Create a service with invalid credentials to test error handling
      const originalAccessKey = process.env.AWS_ACCESS_KEY_ID;
      process.env.AWS_ACCESS_KEY_ID = 'INVALID_KEY';
      
      const invalidService = new S3Service();
      const result = await invalidService.testConnection();
      
      // Restore original key
      process.env.AWS_ACCESS_KEY_ID = originalAccessKey;
      
      // Should return false or throw, not crash
      expect(typeof result).toBe('boolean');
    }, 10000);
  });
});






