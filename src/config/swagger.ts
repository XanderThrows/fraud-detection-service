import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Fraud Detection Service API',
    version: '1.0.0',
    description: 'A comprehensive fraud detection microservice designed for banking applications, featuring human-intent detection, predictive scam prevention, and cross-banking fraud sharing capabilities.',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Behavior',
      description: 'Human-intent detection and behavior analysis endpoints',
    },
    {
      name: 'Transactions',
      description: 'Predictive scam prevention and transaction analysis endpoints',
    },
    {
      name: 'Fraud',
      description: 'Cross-banking fraud sharing and query endpoints',
    },
  ],
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
          message: {
            type: 'string',
            description: 'Detailed error message',
          },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'healthy',
          },
          service: {
            type: 'string',
            example: 'fraud-detection-service',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-11-19T17:30:00.000Z',
          },
        },
      },
      BehaviorAnalysisRequest: {
        type: 'object',
        required: ['userId', 'sessionId', 'typingSpeed', 'mouseMovement', 'clickPattern', 'navigationTime', 'pagesVisited'],
        properties: {
          userId: {
            type: 'string',
            description: 'Unique identifier for the user',
            example: 'user-12345',
          },
          sessionId: {
            type: 'string',
            description: 'Unique identifier for the session',
            example: 'session-abc123',
          },
          typingSpeed: {
            type: 'number',
            description: 'Typing speed in characters per minute',
            example: 45,
          },
          mouseMovement: {
            type: 'number',
            description: 'Total mouse movement distance in pixels',
            example: 1250,
          },
          clickPattern: {
            type: 'array',
            items: {
              type: 'number',
            },
            description: 'Array of milliseconds between clicks',
            example: [200, 150, 300, 100],
          },
          navigationTime: {
            type: 'number',
            description: 'Time spent on sensitive page in seconds',
            example: 12.5,
          },
          pagesVisited: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'List of pages visited during the session',
            example: ['/dashboard', '/transfer', '/confirm'],
          },
        },
      },
      BehaviorAnalysisResponse: {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            example: 'session-abc123',
          },
          intentRiskScore: {
            type: 'number',
            format: 'float',
            minimum: 0,
            maximum: 1,
            description: 'Risk score from 0.00 (low risk) to 1.00 (high risk)',
            example: 0.75,
          },
          behaviorFlags: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Contextual flags indicating suspicious behavior patterns',
            example: ['UNUSUAL_TYPING_SPEED', 'EXCESSIVE_HESITATION'],
          },
        },
      },
      TransactionPredictionRequest: {
        type: 'object',
        required: [
          'transactionId',
          'userId',
          'amount',
          'currency',
          'recipientAccount',
          'userAverageTransAmount',
          'transactionType',
          'location',
          'timestamp',
          'deviceId',
        ],
        properties: {
          transactionId: {
            type: 'string',
            description: 'Unique identifier for the transaction',
            example: 'txn-789012',
          },
          userId: {
            type: 'string',
            description: 'Unique identifier for the user',
            example: 'user-12345',
          },
          amount: {
            type: 'number',
            format: 'float',
            description: 'Transaction amount',
            example: 5000.00,
          },
          currency: {
            type: 'string',
            description: 'Currency code (ISO 4217)',
            example: 'USD',
          },
          recipientAccount: {
            type: 'string',
            description: 'Recipient account identifier',
            example: 'acc-98765',
          },
          userAverageTransAmount: {
            type: 'number',
            format: 'float',
            description: 'User\'s average transaction amount',
            example: 250.00,
          },
          transactionType: {
            type: 'string',
            description: 'Type of transaction',
            example: 'wire_transfer',
          },
          location: {
            type: 'string',
            description: 'Transaction location or IP geolocation',
            example: 'New York, US',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Transaction timestamp in ISO 8601 format',
            example: '2025-11-19T17:30:00.000Z',
          },
          deviceId: {
            type: 'string',
            description: 'Device identifier',
            example: 'device-xyz789',
          },
        },
      },
      TransactionPredictionResponse: {
        type: 'object',
        properties: {
          transactionId: {
            type: 'string',
            example: 'txn-789012',
          },
          predictionResult: {
            type: 'string',
            enum: ['SAFE', 'SUSPICIOUS', 'HIGH_RISK'],
            description: 'Overall prediction result',
            example: 'HIGH_RISK',
          },
          riskScore: {
            type: 'number',
            format: 'float',
            minimum: 0,
            maximum: 1,
            description: 'Overall transaction risk score (0.00 to 1.00)',
            example: 0.85,
          },
          recommendedAction: {
            type: 'string',
            enum: ['APPROVE', 'FLAG_FOR_REVIEW', 'DELAY_AND_MFA', 'BLOCK'],
            description: 'Recommended action based on risk assessment',
            example: 'DELAY_AND_MFA',
          },
          reasonCodes: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'List of reason codes explaining the risk assessment',
            example: ['AMOUNT_ANOMALY', 'UNUSUAL_LOCATION', 'DEVICE_MISMATCH'],
          },
        },
      },
      FraudSubmissionRequest: {
        type: 'object',
        required: [
          'bankId',
          'deviceIdHash',
          'accountIdHash',
          'transactionPatternHash',
          'fraudType',
          'timestamp',
          'severity',
        ],
        properties: {
          bankId: {
            type: 'string',
            description: 'Identifier of the bank submitting the fraud data',
            example: 'bank-001',
          },
          deviceIdHash: {
            type: 'string',
            description: 'Hashed device identifier associated with fraud',
            example: 'a1b2c3d4e5f6...',
          },
          accountIdHash: {
            type: 'string',
            description: 'Hashed account identifier associated with fraud',
            example: 'f6e5d4c3b2a1...',
          },
          transactionPatternHash: {
            type: 'string',
            description: 'Hashed transaction pattern associated with fraud',
            example: '1a2b3c4d5e6f...',
          },
          fraudType: {
            type: 'string',
            description: 'Type of fraud detected',
            example: 'phishing',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when fraud occurred (ISO 8601 format)',
            example: '2025-11-19T17:30:00.000Z',
          },
          severity: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Severity level of the fraud',
            example: 'high',
          },
        },
      },
      FraudSubmissionResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Fraud record submitted successfully',
          },
          fraudId: {
            type: 'string',
            description: 'Unique identifier for the submitted fraud record',
            example: 'fraud-12345',
          },
        },
      },
      FraudQueryRequest: {
        type: 'object',
        properties: {
          deviceIdHash: {
            type: 'string',
            description: 'Hashed device identifier to query',
            example: 'a1b2c3d4e5f6...',
          },
          accountIdHash: {
            type: 'string',
            description: 'Hashed account identifier to query',
            example: 'f6e5d4c3b2a1...',
          },
          transactionPatternHash: {
            type: 'string',
            description: 'Hashed transaction pattern to query',
            example: '1a2b3c4d5e6f...',
          },
        },
      },
      FraudRecord: {
        type: 'object',
        properties: {
          fraudId: {
            type: 'string',
            example: 'fraud-12345',
          },
          bankId: {
            type: 'string',
            example: 'bank-001',
          },
          deviceIdHash: {
            type: 'string',
            example: 'a1b2c3d4e5f6...',
          },
          accountIdHash: {
            type: 'string',
            example: 'f6e5d4c3b2a1...',
          },
          transactionPatternHash: {
            type: 'string',
            example: '1a2b3c4d5e6f...',
          },
          fraudType: {
            type: 'string',
            example: 'phishing',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-11-19T17:30:00.000Z',
          },
          severity: {
            type: 'string',
            example: 'high',
          },
          submittedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-11-19T17:35:00.000Z',
          },
        },
      },
      FraudQueryResponse: {
        type: 'object',
        properties: {
          found: {
            type: 'boolean',
            description: 'Whether any fraud records were found',
            example: true,
          },
          matches: {
            type: 'object',
            properties: {
              deviceIdHash: {
                type: 'boolean',
                example: true,
              },
              accountIdHash: {
                type: 'boolean',
                example: false,
              },
              transactionPatternHash: {
                type: 'boolean',
                example: true,
              },
            },
          },
          fraudRecords: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/FraudRecord',
            },
            description: 'Array of matching fraud records',
          },
        },
      },
      FraudAnalyticsResponse: {
        type: 'object',
        properties: {
          lastAttemptedFraud: {
            type: 'string',
            description: 'Timestamp of the last attempted fraud',
            example: '2025-11-19T17:30:00.000Z',
          },
          mostCommonFraud: {
            type: 'string',
            description: 'Most common type of fraud',
            example: 'phishing',
          },
          lastFraudulentDeviceID: {
            type: 'string',
            description: 'Last fraudulent device ID hash',
            example: 'a1b2c3d4e5f6...',
          },
          totalFraudRecords: {
            type: 'number',
            description: 'Total number of fraud records',
            example: 150,
          },
          fraudByType: {
            type: 'object',
            additionalProperties: {
              type: 'number',
            },
            description: 'Count of fraud records by type',
            example: {
              phishing: 50,
              identity_theft: 30,
              account_takeover: 70,
            },
          },
          fraudBySeverity: {
            type: 'object',
            additionalProperties: {
              type: 'number',
            },
            description: 'Count of fraud records by severity',
            example: {
              low: 20,
              medium: 40,
              high: 60,
              critical: 30,
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        description: 'Returns the health status of the service. This endpoint can be used by monitoring systems, load balancers, and orchestration platforms to verify service availability.',
        responses: {
          '200': {
            description: 'Service is healthy and operational',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
    '/behavior/analyze': {
      post: {
        tags: ['Behavior'],
        summary: 'Analyze user behavior patterns',
        description: 'Analyzes user behavior patterns like typing speed, mouse movements, and hesitation to determine whether an action is being performed by the legitimate user or under coercion/manipulation.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BehaviorAnalysisRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Behavior analysis completed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/BehaviorAnalysisResponse',
                },
              },
            },
          },
          '400': {
            description: 'Bad request - missing or invalid fields',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/transactions/predict': {
      post: {
        tags: ['Transactions'],
        summary: 'Predict transaction risk',
        description: 'Predicts if a transaction is a scam by evaluating amount, type, location, and other factors. Uses real-time data and AI models to identify high-risk transactions before they occur.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TransactionPredictionRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Transaction prediction completed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TransactionPredictionResponse',
                },
              },
            },
          },
          '400': {
            description: 'Bad request - missing or invalid fields',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/fraud/submit': {
      post: {
        tags: ['Fraud'],
        summary: 'Submit fraud data',
        description: 'Submits new fraud data to the shared database. Allows multiple banks to share anonymized fraud intelligence like known fraudster devices, accounts, or transaction patterns without exposing personal customer data.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/FraudSubmissionRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Fraud record submitted successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/FraudSubmissionResponse',
                },
              },
            },
          },
          '400': {
            description: 'Bad request - missing or invalid fields',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/fraud/query': {
      post: {
        tags: ['Fraud'],
        summary: 'Query fraud database',
        description: 'Checks if device, account, or transaction pattern is associated with fraud. Helps detect fraud schemes that span multiple institutions.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/FraudQueryRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Query completed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/FraudQueryResponse',
                },
              },
            },
          },
          '400': {
            description: 'Bad request - at least one hash must be provided',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/fraud/analytics': {
      get: {
        tags: ['Fraud'],
        summary: 'Get fraud analytics',
        description: 'Returns fraud analytics and statistics including last attempted fraud, most common fraud types, and aggregated data.',
        responses: {
          '200': {
            description: 'Analytics retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/FraudAnalyticsResponse',
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/index.ts'], // Paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJsdoc(options);
