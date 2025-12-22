# Fraud Detection Service

A comprehensive fraud detection microservice designed for banking applications, featuring human-intent detection, predictive scam prevention, and cross-banking fraud sharing capabilities.

## Features

### Human-Intent Detection
Analyzes user behavior patterns like typing speed, mouse movements, and hesitation to determine whether an action is being performed by the legitimate user or under coercion/manipulation.

### Predictive Scam Prevention
Uses real-time data and AI models to identify high-risk transactions before they occur. Can automatically warn users, delay suspicious transfers, or require additional verification, preventing fraud rather than reacting after the fact.

### Cross-Banking Fraud Sharing
Allows multiple banks to share anonymized fraud intelligence like known fraudster devices, accounts, or transaction patterns without exposing personal customer data. Helps detect fraud schemes that span multiple institutions. Integrated with AWS S3 for persistent storage and centralized fraud intelligence sharing.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The service will start on `http://localhost:3000` by default.

## API Documentation (Swagger)

The service includes comprehensive Swagger/OpenAPI documentation that provides interactive API exploration and testing capabilities.

### Accessing Swagger UI

Once the server is running, access the Swagger documentation at:

```
http://localhost:3000/api-docs
```

### Features

- **Interactive API Explorer**: Test all endpoints directly from the browser
- **Request/Response Schemas**: View detailed schemas for all request and response bodies
- **Try It Out**: Execute API calls with sample data
- **Complete Documentation**: All endpoints, parameters, and responses are documented

### API Endpoints Documented

The Swagger documentation includes:

- **Health Endpoints**: Service health checks
- **Behavior Analysis**: Human-intent detection endpoints
- **Transaction Prediction**: Predictive scam prevention endpoints
- **Fraud Sharing**: Cross-banking fraud sharing endpoints

### Swagger Specification

The Swagger specification follows OpenAPI 3.0.0 standard and includes:

- Complete request/response schemas
- Parameter validation rules
- Error response documentation
- Example values for all fields
- Tag-based organization

## Health

The service provides health check endpoints to monitor service status and availability.

### Health Check Endpoint

#### GET /health

Returns the health status of the service. This endpoint can be used by monitoring systems, load balancers, and orchestration platforms to verify service availability.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "service": "fraud-detection-service",
  "timestamp": "2025-11-19T17:30:00.000Z"
}
```

**Response Codes:**
- `200 OK`: Service is healthy and operational

**Response Fields:**
- `status` (string): Current health status - always "healthy" when service is running
- `service` (string): Service identifier
- `timestamp` (string): ISO 8601 timestamp of the health check

**Usage:**
- Monitoring and alerting systems can poll this endpoint periodically
- Load balancers can use this endpoint for health checks
- Container orchestration platforms (Kubernetes, Docker Swarm) can use this for liveness/readiness probes

**Example:**
```bash
curl http://localhost:3000/health
```

### API Discovery Endpoint

#### GET /getAll

Returns a comprehensive list of all available API endpoints in the service. This endpoint provides an overview of the service capabilities and can be used for API discovery and documentation.

**Endpoint:** `GET /getAll`

**Response:**
```json
{
  "service": "fraud-detection-service",
  "version": "1.0.0",
  "description": "Fraud detection microservice with human-intent detection, predictive scam prevention, and cross-banking fraud sharing",
  "endpoints": [
    {
      "method": "GET",
      "path": "/getAll",
      "description": "Get all available API endpoints"
    },
    {
      "method": "GET",
      "path": "/health",
      "description": "Health check endpoint to verify service status"
    },
    {
      "method": "POST",
      "path": "/behavior/analyze",
      "description": "Analyze user behavior patterns to detect potential fraud or coercion",
      "requestBody": {
        "userId": "string (required)",
        "sessionId": "string (required)",
        "typingSpeed": "number (required) - characters per minute",
        "mouseMovement": "number (required) - distance in pixels",
        "clickPattern": "number[] (required) - milliseconds between clicks",
        "navigationTime": "number (required) - seconds spent on sensitive page",
        "pagesVisited": "string[] (required) - list of pages visited"
      },
      "response": {
        "sessionId": "string",
        "intentRiskScore": "number (0.00-1.00)",
        "behaviorFlags": "string[]"
      }
    }
  ],
  "timestamp": "2025-11-19T17:30:00.000Z"
}
```

**Response Codes:**
- `200 OK`: API listing retrieved successfully

**Response Fields:**
- `service` (string): Service identifier
- `version` (string): Service version number
- `description` (string): Brief description of the service
- `endpoints` (array): List of all available API endpoints with their methods, paths, descriptions, and schema information
- `timestamp` (string): ISO 8601 timestamp of the response

**Usage:**
- API discovery and documentation
- Service introspection
- Development and testing tools
- API gateway integration

**Example:**
```bash
curl http://localhost:3000/getAll
```

## API Documentation

### Human-Intent Detection

#### POST /behavior/analyze

Analyzes user behavior patterns to detect potential fraud or coercion.

**Request Body:**
```json
{
  "userId": "12345",
  "sessionId": "abcde-67890",
  "typingSpeed": 250,
  "mouseMovement": 1200,
  "clickPattern": [200, 180, 300],
  "navigationTime": 45,
  "pagesVisited": ["login", "transfer", "confirmation"]
}
```

**Response:**
```json
{
  "sessionId": "abcde-67890",
  "intentRiskScore": 0.87,
  "behaviorFlags": ["typing_slow", "long_navigation_time"]
}
```

**Response Codes:**
- `200 OK`: Analysis completed successfully
- `400 Bad Request`: Invalid request data
- `500 Internal Server Error`: Server error during analysis

**Field Descriptions:**
- `userId` (string, required): Unique identifier for the user
- `sessionId` (string, required): Unique identifier for the session
- `typingSpeed` (number, required): Typing speed in characters per minute
- `mouseMovement` (number, required): Total mouse movement distance in pixels
- `clickPattern` (array of numbers, required): Time intervals between clicks in milliseconds
- `navigationTime` (number, required): Time spent on sensitive pages in seconds
- `pagesVisited` (array of strings, required): List of pages visited in the session

**Risk Score:**
The `intentRiskScore` ranges from 0.00 (low risk) to 1.00 (high risk) and is calculated based on:
- Typing speed patterns (25% weight)
- Mouse movement patterns (20% weight)
- Click pattern regularity (20% weight)
- Navigation time on sensitive pages (25% weight)
- Page visit sequence (10% weight)

**Behavior Flags:**
Possible flags include:
- `typing_slow`: Typing speed is below normal threshold
- `unusual_mouse_pattern`: Mouse movement patterns are abnormal
- `irregular_click_timing`: Click intervals show high variance
- `long_navigation_time`: Extended time spent on sensitive pages
- `unusual_page_sequence`: Page navigation sequence is suspicious

### How Human-Intent Detection Works

The Human-Intent Detection module analyzes user behavior patterns to determine if actions are being performed by the legitimate user or under coercion/manipulation. This is particularly valuable because it can detect fraud attempts even when login credentials are correct.

#### Overview

The system uses a multi-factor behavioral analysis approach that examines five key behavioral indicators. Each indicator is analyzed independently, assigned a risk score, and then combined using weighted calculations to produce an overall `intentRiskScore` ranging from 0.00 (low risk) to 1.00 (high risk).

#### Behavioral Indicators

##### 1. Typing Speed Analysis (25% weight)

**Purpose:** Detects unusual typing patterns that may indicate coercion, hesitation, or automation.

**How it works:**
- **Normal range:** 150-400 characters per minute (CPM)
- **Slow typing (< 150 CPM):** 
  - Very slow (< 150 CPM): Risk score 0.8 (high risk)
  - Moderately slow (150-180 CPM): Risk score 0.5 (medium risk)
  - *Rationale:* Slow typing may indicate the user is being coerced, reading instructions from someone else, or hesitating due to uncertainty
- **Fast typing (> 400 CPM):**
  - Risk score 0.3 (low-medium risk)
  - *Rationale:* Unusually fast typing might indicate automation or bot activity

**Example:**
- User typing at 120 CPM → Flag: `typing_slow`, contributes 0.8 × 0.25 = 0.20 to overall risk score

##### 2. Mouse Movement Analysis (20% weight)

**Purpose:** Identifies abnormal mouse movement patterns that suggest manipulation or automation.

**How it works:**
- **Normal range:** 500-3000 pixels of total movement
- **Low movement (< 500 pixels):**
  - Risk score 0.6 (medium-high risk)
  - *Rationale:* Very little mouse movement might indicate keyboard-only navigation (unusual for web banking) or automated scripts
- **Excessive movement (> 3000 pixels):**
  - Risk score 0.4 (medium risk)
  - *Rationale:* Excessive mouse movement may indicate hesitation, confusion, or the user being guided by someone else

**Example:**
- User with only 300 pixels of mouse movement → Flag: `unusual_mouse_pattern`, contributes 0.6 × 0.20 = 0.12 to overall risk score

##### 3. Click Pattern Analysis (20% weight)

**Purpose:** Detects irregular click timing that may indicate hesitation, coercion, or uncertainty.

**How it works:**
- Calculates the standard deviation of time intervals between clicks
- **Normal variance:** < 200 milliseconds standard deviation
- **High variance (> 200ms):**
  - Risk score 0.7 (high risk)
  - *Rationale:* Irregular click timing suggests the user is hesitating, being instructed, or uncertain about actions
- **Moderate variance (140-200ms):**
  - Risk score 0.4 (medium risk)

**Example:**
- Click pattern: [200, 180, 300, 50, 400] milliseconds
- Mean: 226ms, Standard Deviation: 130ms → Moderate risk
- Click pattern: [100, 500, 50, 600, 200] milliseconds
- Mean: 290ms, Standard Deviation: 240ms → Flag: `irregular_click_timing`, contributes 0.7 × 0.20 = 0.14 to overall risk score

##### 4. Navigation Time Analysis (25% weight)

**Purpose:** Identifies extended time spent on sensitive pages, which may indicate coercion or hesitation.

**How it works:**
- Monitors time spent on sensitive pages: `transfer`, `confirmation`, `payment`, `withdrawal`
- **Normal threshold:** < 30 seconds on sensitive pages
- **Extended time (> 30 seconds):**
  - 30-60 seconds: Risk score 0.6 (medium-high risk)
  - > 60 seconds: Risk score 0.9 (very high risk)
  - *Rationale:* Legitimate users typically complete sensitive actions quickly. Extended time may indicate:
    - User is being coerced or reading instructions
    - User is hesitating due to uncertainty
    - User is being manipulated into making a transaction

**Example:**
- User spends 45 seconds on transfer confirmation page → Flag: `long_navigation_time`, contributes 0.6 × 0.25 = 0.15 to overall risk score

##### 5. Page Visit Sequence Analysis (10% weight)

**Purpose:** Detects unusual navigation patterns that bypass normal security flows.

**How it works:**
- Validates logical page sequences
- **Suspicious patterns:**
  - Reaching confirmation page without visiting transfer page: Risk score 0.5
  - Accessing sensitive pages (transfer/confirmation) without login: Risk score 0.8 (very high risk)
  - *Rationale:* Legitimate users follow expected navigation flows. Skipping steps may indicate:
    - Session hijacking
    - Direct URL manipulation
    - Automated fraud attempts

**Example:**
- Pages visited: `["login", "confirmation"]` (skipped transfer) → Flag: `unusual_page_sequence`, contributes 0.5 × 0.10 = 0.05 to overall risk score

#### Risk Score Calculation

The final `intentRiskScore` is calculated by:

1. **Individual Analysis:** Each behavioral indicator is analyzed independently
2. **Weighted Combination:** Risk scores are multiplied by their respective weights:
   - Typing Speed: 25%
   - Mouse Movement: 20%
   - Click Pattern: 20%
   - Navigation Time: 25%
   - Page Sequence: 10%
3. **Normalization:** Final score is clamped between 0.00 and 1.00
4. **Rounding:** Score is rounded to 2 decimal places

**Example Calculation:**
```
Typing Speed Risk: 0.8 × 0.25 = 0.20
Mouse Movement Risk: 0.6 × 0.20 = 0.12
Click Pattern Risk: 0.7 × 0.20 = 0.14
Navigation Time Risk: 0.6 × 0.25 = 0.15
Page Sequence Risk: 0.5 × 0.10 = 0.05
─────────────────────────────────────
Total Risk Score: 0.66
```

#### Interpreting Results

**Risk Score Ranges:**
- **0.00 - 0.30:** Low risk - Normal user behavior
- **0.31 - 0.60:** Medium risk - Some anomalies detected, may require additional verification
- **0.61 - 0.80:** High risk - Significant behavioral anomalies, recommend additional security measures
- **0.81 - 1.00:** Very high risk - Strong indicators of coercion or fraud, consider blocking or requiring manual review

**Behavior Flags:**
Flags provide context about which specific behaviors triggered the risk assessment. Multiple flags increase confidence in the risk assessment.

#### Use Cases

1. **Account Takeover Prevention:** Detect when a legitimate user's account is being used by someone else
2. **Coercion Detection:** Identify when users are being forced to perform transactions
3. **Social Engineering Prevention:** Catch scams where users are manipulated into transferring money
4. **Automated Fraud Detection:** Identify bot activity or automated scripts

#### Integration Recommendations

- **Low Risk (0.00-0.30):** Allow transaction to proceed normally
- **Medium Risk (0.31-0.60):** Require additional verification (e.g., SMS code, security question)
- **High Risk (0.61-0.80):** Delay transaction and require multi-factor authentication
- **Very High Risk (0.81-1.00):** Block transaction and flag for manual review

### Predictive Scam Prevention

#### POST /transactions/predict

Predicts if a transaction is a scam by evaluating amount, type, location, device, timing, and recipient patterns. This endpoint analyzes transactions in real-time before they are processed, allowing for proactive fraud prevention.

**Request Body:**
```json
{
  "transactionId": "tx-98765",
  "userId": "12345",
  "amount": 5000,
  "currency": "USD",
  "recipientAccount": "987654321",
  "userAverageTransAmount": 200,
  "transactionType": "wire_transfer",
  "location": "New York, USA",
  "timestamp": "2025-11-19T17:30:00Z",
  "deviceId": "device-456"
}
```

**Response:**
```json
{
  "transactionId": "tx-98765",
  "predictionResult": "SUSPICIOUS",
  "riskScore": 0.92,
  "recommendedAction": "DELAY_AND_MFA",
  "reasonCodes": ["HIGH_AMOUNT", "NEW_DEVICE", "HIGH_RISK_TRANSACTION_TYPE"]
}
```

**Response Codes:**
- `200 OK`: Analysis completed successfully
- `400 Bad Request`: Invalid request data
- `500 Internal Server Error`: Server error during analysis

**Field Descriptions:**
- `transactionId` (string, required): Unique identifier for the transaction
- `userId` (string, required): Unique identifier for the user
- `amount` (number, required): Transaction amount
- `currency` (string, required): Currency code (e.g., "USD", "EUR")
- `recipientAccount` (string, required): Recipient account identifier
- `userAverageTransAmount` (number, required): User's average transaction amount for comparison
- `transactionType` (string, required): Type of transaction (e.g., "wire_transfer", "payment", "transfer")
- `location` (string, required): Transaction location or destination
- `timestamp` (string, required): Transaction timestamp in ISO 8601 format
- `deviceId` (string, required): Device identifier used for the transaction

**Prediction Results:**
- `SAFE`: Low risk transaction, can proceed normally
- `SUSPICIOUS`: Medium risk, requires review or additional verification
- `HIGH_RISK`: High risk transaction, should be delayed or blocked

**Recommended Actions:**
- `APPROVE`: Transaction is safe to proceed
- `FLAG_FOR_REVIEW`: Transaction should be reviewed by fraud team
- `DELAY_AND_MFA`: Delay transaction and require multi-factor authentication
- `BLOCK`: Block transaction immediately

**Reason Codes:**
Possible reason codes include:
- `HIGH_AMOUNT`: Transaction amount is significantly higher than user's average
- `VERY_HIGH_AMOUNT`: Transaction amount is extremely high (10x+ average)
- `HIGH_RISK_TRANSACTION_TYPE`: Transaction type is inherently risky (wire transfer, international, etc.)
- `HIGH_RISK_LOCATION`: Transaction destination is in a high-risk location
- `NEW_DEVICE`: Transaction is from a device not previously used by the user
- `NEW_RECIPIENT`: Recipient account has not been used by this user before
- `UNUSUAL_TIMING`: Transaction occurs at unusual hours or times

**Risk Score:**
The `riskScore` ranges from 0.00 (low risk) to 1.00 (high risk) and is calculated based on:
- Transaction amount relative to user average (30% weight)
- Transaction type risk (20% weight)
- Location risk (15% weight)
- Device history (15% weight)
- Transaction timing (10% weight)
- Recipient history (10% weight)

### How Predictive Scam Prevention Works

The Predictive Scam Prevention module uses a multi-factor risk assessment approach to evaluate transactions before they are processed. This proactive approach helps prevent fraud rather than reacting after the fact.

#### Overview

The system analyzes six key factors to determine transaction risk:
1. **Amount Analysis**: Compares transaction amount to user's historical average
2. **Transaction Type**: Evaluates the inherent risk of the transaction type
3. **Location Analysis**: Checks if the destination is in a high-risk location
4. **Device Analysis**: Verifies if the device has been used by the user before
5. **Timing Analysis**: Detects unusual transaction times
6. **Recipient Analysis**: Checks if the recipient is known to the user

#### Risk Factors

##### 1. Amount Analysis (30% weight)

**Purpose:** Detects transactions that are significantly larger than the user's typical transaction size.

**How it works:**
- Compares transaction amount to `userAverageTransAmount`
- **Very High Risk (10x+ average):** Risk score 0.95
- **High Risk (5x-10x average):** Risk score 0.8
- **Medium Risk (3x-5x average):** Risk score 0.5
- **Low-Medium Risk (2x-3x average):** Risk score 0.3

**Example:**
- User average: $200
- Transaction: $5,000 (25x average) → Very high risk
- Transaction: $1,000 (5x average) → High risk

##### 2. Transaction Type Analysis (20% weight)

**Purpose:** Identifies inherently risky transaction types.

**High-Risk Types:**
- Wire transfers
- International transfers
- Cryptocurrency transactions
- Money orders
- Cash advances

**Risk Scoring:**
- High-risk types: 0.7 risk score
- Medium-risk types (transfers, payments): 0.3 risk score
- Standard transactions: 0.0 risk score

##### 3. Location Analysis (15% weight)

**Purpose:** Detects transactions to high-risk locations.

**High-Risk Locations:**
- Offshore locations
- Tax havens
- Sanctioned countries
- International/foreign destinations (medium risk)

**Risk Scoring:**
- High-risk locations: 0.8 risk score
- International locations: 0.4 risk score
- Standard locations: 0.0 risk score

##### 4. Device Analysis (15% weight)

**Purpose:** Identifies transactions from new or unknown devices.

**How it works:**
- Checks if device has been used by the user before
- New devices are more likely to be fraudulent
- In production, this would query a device history database

**Risk Scoring:**
- New device: 0.7 risk score
- Known device: 0.0 risk score

##### 5. Timing Analysis (10% weight)

**Purpose:** Detects transactions at unusual times.

**How it works:**
- Analyzes transaction timestamp
- Transactions outside business hours (2 AM - 6 AM UTC) are more suspicious
- Very late night transactions (11 PM - 2 AM) are slightly suspicious
- In production, would compare to user's typical transaction times

**Risk Scoring:**
- Unusual hours (2-6 AM): 0.5 risk score
- Late night (11 PM-2 AM): 0.3 risk score
- Normal hours: 0.0 risk score

##### 6. Recipient Analysis (10% weight)

**Purpose:** Identifies transactions to new or suspicious recipients.

**How it works:**
- Checks if recipient has been used by the user before
- Suspicious recipient patterns (temp accounts, test accounts) are flagged
- In production, would query recipient history database

**Risk Scoring:**
- Suspicious recipient: 0.7 risk score
- New recipient: 0.6 risk score
- Known recipient: 0.0 risk score

#### Action Determination

The system determines the recommended action based on risk score and reason codes:

- **BLOCK** (Risk ≥ 0.9 or Risk ≥ 0.8 with critical flags):
  - Very high risk transactions
  - High risk with very high amount or high-risk location

- **DELAY_AND_MFA** (Risk ≥ 0.7 or Risk ≥ 0.6 with high-risk factors):
  - High risk transactions
  - Medium-high risk with high amount, new device, or high-risk transaction type

- **FLAG_FOR_REVIEW** (Risk ≥ 0.4 or multiple reason codes):
  - Suspicious transactions
  - Multiple risk factors present

- **APPROVE** (Risk < 0.4):
  - Low risk transactions
  - Normal transaction patterns

#### Integration Recommendations

- **APPROVE**: Process transaction immediately
- **FLAG_FOR_REVIEW**: Queue for manual review, allow user to proceed with warning
- **DELAY_AND_MFA**: Hold transaction, require additional authentication (SMS, email, security questions)
- **BLOCK**: Reject transaction, notify user and fraud team

### Cross-Banking Fraud Sharing

#### POST /fraud/submit

Submits new fraud data to the shared database. Banks can contribute anonymized fraud intelligence without exposing personal customer data.

**Request Body:**
```json
{
  "bankId": "BankA",
  "deviceIdHash": "devicehash456",
  "accountIdHash": "accounthash789",
  "transactionPatternHash": "patternhash123",
  "fraudType": "account_takeover",
  "timestamp": "2025-11-19T17:30:00Z",
  "severity": "high"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fraud data submitted successfully",
  "fraudId": "fraud-1734652800000-abc123xyz"
}
```

**Response Codes:**
- `201 Created`: Fraud data submitted successfully
- `400 Bad Request`: Invalid request data or missing required fields
- `500 Internal Server Error`: Server error during submission

**Field Descriptions:**
- `bankId` (string, required): Identifier for the bank submitting the fraud data
- `deviceIdHash` (string, required): Hashed device identifier (anonymized)
- `accountIdHash` (string, required): Hashed account identifier (anonymized)
- `transactionPatternHash` (string, required): Hashed transaction pattern (anonymized)
- `fraudType` (string, required): Type of fraud detected (e.g., "account_takeover", "phishing", "card_fraud")
- `timestamp` (string, required): When the fraud occurred (ISO 8601 format)
- `severity` (string, required): Severity level - one of: "low", "medium", "high", "critical"

#### POST /fraud/query

Checks if a device, account, or transaction pattern is already associated with fraudulent activity across all participating banks.

**Request Body:**
```json
{
  "deviceIdHash": "devicehash456",
  "accountIdHash": "accounthash789",
  "transactionPatternHash": "patternhash123"
}
```

**Note:** At least one of the hash fields must be provided.

**Response:**
```json
{
  "found": true,
  "matches": {
    "deviceIdHash": true,
    "accountIdHash": false,
    "transactionPatternHash": true
  },
  "fraudRecords": [
    {
      "fraudId": "fraud-1734652800000-abc123xyz",
      "bankId": "BankA",
      "deviceIdHash": "devicehash456",
      "accountIdHash": "accounthash789",
      "transactionPatternHash": "patternhash123",
      "fraudType": "account_takeover",
      "timestamp": "2025-11-19T17:30:00Z",
      "severity": "high",
      "submittedAt": "2025-11-19T18:00:00Z"
    }
  ]
}
```

**Response Codes:**
- `200 OK`: Query completed successfully
- `400 Bad Request`: No hash fields provided
- `500 Internal Server Error`: Server error during query

**Response Fields:**
- `found` (boolean): Whether any matches were found
- `matches` (object): Indicates which hash fields matched
- `fraudRecords` (array, optional): Array of matching fraud records (only present if found is true)

#### GET /fraud/analytics

Returns fraud analytics and statistics from the shared fraud database.

**Response:**
```json
{
  "lastAttemptedFraud": "11/22/2025",
  "mostCommonFraud": "account_takeover",
  "lastFraudulentDeviceID": "devicehash456",
  "totalFraudRecords": 150,
  "fraudByType": {
    "account_takeover": 45,
    "phishing": 30,
    "card_fraud": 25,
    "identity_theft": 20,
    "money_laundering": 15,
    "other": 15
  },
  "fraudBySeverity": {
    "critical": 10,
    "high": 50,
    "medium": 60,
    "low": 30
  }
}
```

**Response Codes:**
- `200 OK`: Analytics retrieved successfully
- `500 Internal Server Error`: Server error during retrieval

**Response Fields:**
- `lastAttemptedFraud` (string): Date of the most recent fraud attempt (MM/DD/YYYY format)
- `mostCommonFraud` (string): Most frequently reported fraud type
- `lastFraudulentDeviceID` (string): Device ID hash from the most recent fraud record
- `totalFraudRecords` (number, optional): Total number of fraud records in the database
- `fraudByType` (object, optional): Count of fraud records by type
- `fraudBySeverity` (object, optional): Count of fraud records by severity level

### How Cross-Banking Fraud Sharing Works

The Cross-Banking Fraud Sharing module enables banks to collaborate in fraud prevention by sharing anonymized intelligence without exposing customer data.

#### Overview

The system uses hashed identifiers to maintain privacy while allowing banks to:
1. **Submit Fraud Data**: Share anonymized fraud intelligence
2. **Query Fraud Database**: Check if devices, accounts, or patterns are known fraud indicators
3. **View Analytics**: Get insights into fraud trends across all participating banks

#### Privacy and Anonymization

- **Hashed Identifiers**: All sensitive data (devices, accounts, patterns) are hashed before storage
- **No Personal Data**: Only anonymized hashes are shared, never actual customer information
- **Bank Identification**: Banks are identified by ID, but customer data remains private

#### Use Cases

1. **Multi-Bank Fraud Detection**: Detect fraud schemes that span multiple institutions
2. **Early Warning System**: Get alerts when known fraud indicators appear
3. **Pattern Recognition**: Identify fraud patterns that affect multiple banks
4. **Collaborative Defense**: Strengthen fraud prevention through shared intelligence

#### Integration Recommendations

- **Before Processing Transactions**: Query the fraud database to check for known fraud indicators
- **After Detecting Fraud**: Submit fraud data to help other banks prevent similar attacks
- **Regular Monitoring**: Use analytics to understand fraud trends and adjust prevention strategies
- **Real-time Alerts**: Integrate query results into transaction processing workflows

## AWS S3 Bucket Integration

The fraud detection service integrates with AWS S3 for persistent storage of fraud records. This enables centralized fraud intelligence sharing across multiple banks and provides durable storage for fraud data.

### Overview

The S3 integration automatically saves fraud records detected by the human-intent detection and predictive scam prevention modules to an S3 bucket. The cross-banking fraud sharing service reads from this bucket to provide a unified view of all fraud records across participating banks.

### APIs Connected to S3 Bucket

#### 1. POST /behavior/analyze

**Connection Type:** Automatic Upload (Write)

**When Data is Uploaded:**
- Automatically uploads fraud records to S3 when `intentRiskScore >= 0.7` (high risk threshold)
- Upload happens asynchronously after the analysis response is returned to the client
- Non-blocking: API response is not delayed if S3 upload fails

**How Data is Uploaded:**
1. Behavior analysis is performed and returns an `intentRiskScore`
2. If the score indicates fraud (≥ 0.7), the system:
   - Converts behavior data to a standardized `FraudRecord` format
   - Hashes sensitive data (userId, sessionId, behavior patterns) using SHA-256
   - Determines severity level based on risk score
   - Uploads the record to S3 at path: `fraud-records/{year}/{month}/fraud-{fraudId}.json`
   - Sets fraud type to `'human_intent_fraud'`

**Example Flow:**
```json
// Request to /behavior/analyze
{
  "userId": "user123",
  "sessionId": "session456",
  "typingSpeed": 120,
  "mouseMovement": 300,
  "clickPattern": [200, 500, 100],
  "navigationTime": 60,
  "pagesVisited": ["login", "transfer", "confirmation"]
}

// Response (intentRiskScore: 0.87 - triggers S3 upload)
{
  "sessionId": "session456",
  "intentRiskScore": 0.87,
  "behaviorFlags": ["typing_slow", "long_navigation_time"]
}

// Automatically uploaded to S3 as:
// fraud-records/2025/01/fraud-1736284800000-abc123.json
{
  "fraudId": "fraud-1736284800000-abc123",
  "bankId": "default-bank",
  "deviceIdHash": "sha256_hash_of_sessionId",
  "accountIdHash": "sha256_hash_of_userId",
  "transactionPatternHash": "sha256_hash_of_behavior_pattern",
  "fraudType": "human_intent_fraud",
  "timestamp": "2025-01-07T12:00:00.000Z",
  "severity": "critical",
  "submittedAt": "2025-01-07T12:00:00.000Z"
}
```

#### 2. POST /transactions/predict

**Connection Type:** Automatic Upload (Write)

**When Data is Uploaded:**
- Automatically uploads fraud records to S3 when `predictionResult` is `'HIGH_RISK'` or `'SUSPICIOUS'`
- Upload happens asynchronously after the prediction response is returned to the client
- Non-blocking: API response is not delayed if S3 upload fails

**How Data is Uploaded:**
1. Transaction analysis is performed and returns a `predictionResult` and `riskScore`
2. If the result indicates fraud (`HIGH_RISK` or `SUSPICIOUS`), the system:
   - Converts transaction data to a standardized `FraudRecord` format
   - Hashes sensitive data (deviceId, userId, transaction details) using SHA-256
   - Determines severity level based on prediction result and risk score
   - Uploads the record to S3 at path: `fraud-records/{year}/{month}/fraud-{fraudId}.json`
   - Sets fraud type to `'predictive_scam'`

**Example Flow:**
```json
// Request to /transactions/predict
{
  "transactionId": "txn789",
  "userId": "user123",
  "amount": 50000,
  "currency": "USD",
  "recipientAccount": "acc999",
  "userAverageTransAmount": 500,
  "transactionType": "wire_transfer",
  "location": "offshore",
  "timestamp": "2025-01-07T12:00:00.000Z",
  "deviceId": "device-xyz"
}

// Response (HIGH_RISK - triggers S3 upload)
{
  "transactionId": "txn789",
  "predictionResult": "HIGH_RISK",
  "riskScore": 0.85,
  "recommendedAction": "BLOCK",
  "reasonCodes": ["VERY_HIGH_AMOUNT", "HIGH_RISK_TRANSACTION_TYPE", "HIGH_RISK_LOCATION"]
}

// Automatically uploaded to S3 as:
// fraud-records/2025/01/fraud-1736284800000-def456.json
{
  "fraudId": "fraud-1736284800000-def456",
  "bankId": "default-bank",
  "deviceIdHash": "sha256_hash_of_deviceId",
  "accountIdHash": "sha256_hash_of_userId",
  "transactionPatternHash": "sha256_hash_of_transaction_pattern",
  "fraudType": "predictive_scam",
  "timestamp": "2025-01-07T12:00:00.000Z",
  "severity": "critical",
  "submittedAt": "2025-01-07T12:00:00.000Z"
}
```

#### 3. POST /fraud/submit

**Connection Type:** Manual Upload (Write)

**When Data is Uploaded:**
- Uploads fraud records to S3 when explicitly submitted via the API
- Upload happens synchronously as part of the submission process
- Both saves to in-memory storage and S3 bucket

**How Data is Uploaded:**
1. Client submits fraud data with required fields (bankId, hashed identifiers, fraudType, etc.)
2. System generates a unique `fraudId`
3. Creates a `FraudRecord` from the submitted data
4. Saves to both in-memory storage and S3 bucket
5. Returns success response with the generated `fraudId`

#### 4. POST /fraud/query

**Connection Type:** Automatic Sync (Read)

**When Data is Read:**
- Automatically syncs with S3 bucket before performing the query
- Ensures queries include the latest fraud records from all banks
- Sync happens automatically on each query request

**How Data is Read:**
1. Before querying, the system syncs with S3 to load latest records
2. Merges S3 records with in-memory cache (avoids duplicates)
3. Performs query against the combined dataset
4. Returns matching fraud records if found

#### 5. GET /fraud/analytics

**Connection Type:** Automatic Sync (Read)

**When Data is Read:**
- Automatically syncs with S3 bucket before generating analytics
- Ensures analytics include the latest fraud records from all banks
- Sync happens automatically on each analytics request

**How Data is Read:**
1. Before generating analytics, the system syncs with S3 to load latest records
2. Merges S3 records with in-memory cache
3. Calculates analytics from the combined dataset
4. Returns comprehensive fraud statistics

### S3 Bucket Structure

Fraud records are organized in the S3 bucket with the following structure:

```
fraud-detection-service-data/
├── fraud-records/
│   ├── 2025/
│   │   ├── 01/
│   │   │   ├── fraud-1736284800000-abc123.json
│   │   │   ├── fraud-1736284801000-def456.json
│   │   │   └── fraud-1736284802000-ghi789.json
│   │   ├── 02/
│   │   │   └── fraud-1738963200000-jkl012.json
│   │   └── ...
│   └── ...
└── analytics/
    └── daily/
        ├── analytics-2025-01-07.json
        └── analytics-2025-01-08.json
```

**File Naming Convention:**
- Fraud records: `fraud-{timestamp}-{randomId}.json`
- Organized by year and month for efficient querying
- Each file contains a single fraud record in JSON format

### Data Flow Diagram

```
┌─────────────────────────┐
│ POST /behavior/analyze  │
│ (intentRiskScore >= 0.7)│
└───────────┬─────────────┘
            │
            ▼
    ┌───────────────┐
    │ Convert to    │
    │ FraudRecord   │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐      ┌──────────────────┐
    │  S3Service    │─────▶│   S3 Bucket      │
    │ uploadRecord  │      │ fraud-records/   │
    └───────────────┘      │ YYYY/MM/         │
                           └────────┬─────────┘
                                    │
┌─────────────────────────┐         │
│ POST /transactions/     │         │
│ predict                 │         │
│ (HIGH_RISK/SUSPICIOUS)  │         │
└───────────┬─────────────┘         │
            │                       │
            ▼                       │
    ┌───────────────┐               │
    │ Convert to    │               │
    │ FraudRecord   │               │
    └───────┬───────┘               │
            │                       │
            └───────────┬───────────┘
                        │
                        ▼
                ┌───────────────┐
                │ FraudService  │
                │ (syncs from   │
                │  S3 on query) │
                └───────┬───────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ POST /fraud/ │ │ POST /fraud/ │ │ GET /fraud/  │
│ submit       │ │ query        │ │ analytics    │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Configuration

The S3 integration requires the following environment variables:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
S3_BUCKET_NAME=fraud-detection-service-data
BANK_ID=your-bank-id  # Optional, defaults to 'default-bank'
```

### Key Features

- **Automatic Persistence**: Fraud detected by either module is automatically saved to S3
- **Cross-Bank Sharing**: All banks can read from the same S3 bucket for shared intelligence
- **Data Privacy**: Sensitive data is hashed (SHA-256) before storage
- **Non-Blocking**: S3 uploads don't delay API responses
- **Automatic Sync**: FraudService automatically syncs with S3 before queries/analytics
- **Error Handling**: System continues operation even if S3 operations fail
- **Organized Storage**: Records are organized by date for efficient querying

### Privacy and Security

- **Hashed Identifiers**: All sensitive data (device IDs, account IDs, transaction patterns) are hashed using SHA-256 before storage
- **No Personal Data**: Only anonymized hashes are stored, never actual customer information
- **Environment Variables**: AWS credentials are stored in environment variables, not in code
- **Secure Storage**: S3 bucket should be configured with appropriate access controls and encryption

## Project Structure

```
fraud-detection-service/
├── src/
│   ├── modules/
│   │   ├── human-intent-detection/
│   │   │   └── behaviorAnalyzer.ts
│   │   ├── predictive-scam-prevention/
│   │   │   └── transactionAnalyzer.ts
│   │   └── cross-banking-fraud-sharing/
│   │       └── fraudService.ts
│   ├── routes/
│   │   ├── behavior.routes.ts
│   │   ├── transaction.routes.ts
│   │   └── fraud.routes.ts
│   ├── services/
│   │   └── s3Service.ts
│   ├── types/
│   │   ├── behavior.ts
│   │   ├── transaction.ts
│   │   └── fraud.ts
│   └── index.ts
├── __tests__/
│   └── s3-connection.test.ts
├── dist/                 
├── package.json
├── tsconfig.json
├── jest.config.js
├── jest.setup.js
├── env.example
└── README.md
```

## Development

### Running in Development Mode
```bash
npm run dev
```

This will start the server with auto-reload on file changes.

### Building for Production
```bash
npm run build
```

## Testing

The project uses [Jest](https://jestjs.io/) for testing with TypeScript support via `ts-jest`.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (automatically re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run a specific test file
npm test -- s3-connection
```

### Test Structure

Tests are located in the `__tests__` directory:

```
__tests__/
└── s3-connection.test.ts    # AWS S3 connection and configuration tests
```

### Available Tests

#### S3 Connection Tests (`__tests__/s3-connection.test.ts`)

Tests for AWS S3 integration:

- **Environment Variables Validation**: Verifies all required AWS credentials are set
- **S3 Connection Test**: Tests connection to the configured S3 bucket
- **Error Handling**: Tests graceful error handling for invalid credentials

**Prerequisites for S3 Tests:**
- AWS credentials must be configured in `.env` file
- S3 bucket must exist and be accessible
- IAM user must have appropriate S3 permissions

**Required Environment Variables:**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
S3_BUCKET_NAME=your-bucket-name
```

### Writing Tests

To add new tests:

1. Create test files in the `__tests__` directory
2. Use the `.test.ts` or `.spec.ts` extension
3. Follow Jest conventions:

```typescript
import { YourService } from '../src/services/yourService';

describe('YourService', () => {
  it('should do something', () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Test Configuration

Jest configuration is in `jest.config.js`:
- TypeScript support via `ts-jest`
- Environment variables loaded via `jest.setup.js`
- Coverage collection from `src/` directory

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development

# AWS S3 Configuration (required for S3 tests and functionality)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
S3_BUCKET_NAME=your-bucket-name
```

See `env.example` for a complete template. Copy it to `.env` and fill in your values:

```bash
cp env.example .env
```

## Future Enhancements

- Real-time fraud alerts and notifications
- Machine learning models for fraud pattern detection
- Advanced analytics and reporting dashboards
- S3 bucket versioning and lifecycle policies for fraud record retention
- Enhanced query capabilities with S3 Select for efficient data retrieval

## License

MIT

