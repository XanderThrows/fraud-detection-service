# AWS S3 Setup Guide for Fraud Detection Service

This guide will help you set up an AWS S3 bucket to store fraud data and analytics for the fraud detection service.

## Prerequisites

- AWS Account
- AWS CLI installed and configured (optional, but recommended)
- Node.js project with fraud detection service

## Step 1: Create S3 Bucket via AWS Console

1. **Log in to AWS Console**
   - Go to https://console.aws.amazon.com/
   - Sign in to your AWS account

2. **Navigate to S3**
   - Search for "S3" in the services search bar
   - Click on "S3" service

3. **Create Bucket**
   - Click "Create bucket" button
   - **Bucket name**: `fraud-detection-service-data` (must be globally unique)
   - **AWS Region**: Choose your preferred region (e.g., `us-east-1`)
   - **Object Ownership**: ACLs disabled (recommended)
   - **Block Public Access**: Keep all settings enabled (for security)
   - **Bucket Versioning**: Enable (optional, for data recovery)
   - **Default encryption**: Enable (SSE-S3 or SSE-KMS)
   - Click "Create bucket"

## Step 2: Create IAM User and Access Keys

1. **Navigate to IAM**
   - Search for "IAM" in AWS Console
   - Click on "IAM" service

2. **Create User**
   - Click "Users" in the left sidebar
   - Click "Create user"
   - **User name**: `fraud-detection-service-user`
   - Click "Next"

3. **Attach Policies**
   - Select "Attach policies directly"
   - Search for and select: `AmazonS3FullAccess` (or create a custom policy with minimal permissions)
   - Click "Next" then "Create user"

4. **Create Access Keys**
   - Click on the created user
   - Go to "Security credentials" tab
   - Click "Create access key"
   - Select "Application running outside AWS"
   - Click "Next" then "Create access key"
   - **IMPORTANT**: Save the Access Key ID and Secret Access Key securely
   - You won't be able to see the secret key again!

## Step 3: Create Custom IAM Policy (Recommended for Production)

For better security, create a custom policy with minimal required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::fraud-detection-service-data",
        "arn:aws:s3:::fraud-detection-service-data/*"
      ]
    }
  ]
}
```

## Step 4: Install AWS SDK

In your project directory, install the AWS SDK:

```bash
npm install @aws-sdk/client-s3
```

## Step 5: Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file** and replace the placeholder values with your actual AWS credentials:

```env
PORT=3000
NODE_ENV=development

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-actual-access-key-id
AWS_SECRET_ACCESS_KEY=your-actual-secret-access-key
S3_BUCKET_NAME=fraud-detection-service-data
```

**Security Note**: 
- Never commit `.env` file to git. It's already in `.gitignore`.
- The `env.example` file is safe to commit as it contains no real credentials.
- For production, consider using AWS Secrets Manager or environment variables set by your hosting provider.

## Step 6: Bucket Structure

Recommended folder structure in your S3 bucket:

```
fraud-detection-service-data/
├── fraud-records/
│   └── [year]/
│       └── [month]/
│           └── fraud-[timestamp].json
├── analytics/
│   └── daily/
│       └── analytics-[date].json
└── backups/
    └── [timestamp]/
```

## Step 7: Test Connection

You can test the connection using AWS CLI:

```bash
aws s3 ls s3://fraud-detection-service-data/
```

Or use the test script provided in the project.

## Security Best Practices

1. **Never commit credentials** - Use environment variables or AWS Secrets Manager
2. **Use IAM roles** - If running on EC2, use IAM roles instead of access keys
3. **Enable encryption** - Always enable server-side encryption
4. **Set up bucket policies** - Restrict access to specific IPs if needed
5. **Enable versioning** - For data recovery and audit trails
6. **Enable logging** - Track access to your bucket
7. **Use least privilege** - Only grant necessary permissions

## Troubleshooting

### Access Denied Error
- Check IAM user permissions
- Verify bucket name is correct
- Ensure access keys are valid

### Bucket Not Found
- Verify bucket name (must be globally unique)
- Check AWS region matches your configuration

### Connection Timeout
- Check network connectivity
- Verify AWS region is accessible
- Check security group rules if using VPC

## Next Steps

After setting up the bucket, you can:
1. Integrate S3 storage into the fraud service (see `src/services/s3Service.ts`)
2. Update fraud service to use S3 instead of in-memory storage
3. Set up automated backups
4. Configure lifecycle policies for data retention

