const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'Authentication Service for Ghana Emergency Platform - User registration, login, and token management',
      contact: {
        name: 'Ghana Emergency Platform',
        email: 'support@emergency.dev'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: 'Local Development'
      },
      {
        url: 'https://national-emergency-platform-auth.onrender.com',
        description: 'Production'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['user_id', 'name', 'email', 'role'],
          properties: {
            user_id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000'
            },
            name: {
              type: 'string',
              example: 'John Mensah'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            role: {
              type: 'string',
              enum: ['CITIZEN', 'RESPONDER', 'HOSPITAL_ADMIN', 'FIRE_ADMIN', 'POLICE_ADMIN', 'SYSTEM_ADMIN'],
              example: 'CITIZEN'
            },
            is_active: {
              type: 'boolean'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        AuthTokenResponse: {
          type: 'object',
          properties: {
            access_token: {
              type: 'string',
              description: 'JWT access token (expires in 1 hour)'
            },
            refresh_token: {
              type: 'string',
              description: 'JWT refresh token (expires in 7 days)'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string'
            },
            code: {
              type: 'string'
            },
            details: {
              type: 'object'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and token management'
      },
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Health',
        description: 'Service health checks'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/server.js']
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
