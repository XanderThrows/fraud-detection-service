# Fraud Detection Service

A comprehensive fraud detection microservice designed for banking applications, featuring human-intent detection, predictive scam prevention, and cross-banking fraud sharing capabilities.

## Features

### Human-Intent Detection (Implemented)
Analyzes user behavior patterns like typing speed, mouse movements, and hesitation to determine whether an action is being performed by the legitimate user or under coercion/manipulation.

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

## Project Structure

```
fraud-detection-service/
├── src/
│   ├── modules/
│   │   └── human-intent-detection/
│   │       └── behaviorAnalyzer.ts
│   ├── routes/
│   │   └── behavior.routes.ts
│   ├── types/
│   │   └── behavior.ts
│   └── index.ts
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
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

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

## Future Modules

- **Predictive Scam Prevention**: Real-time transaction risk assessment
- **Cross-Banking Fraud Sharing**: Anonymized fraud intelligence sharing between banks

## License

MIT

