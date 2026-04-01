const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Incident Service API',
      version: '1.0.0',
      description: 'Incident Management Service for Ghana Emergency Platform - Create and manage emergency incidents, assign responders',
      contact: {
        name: 'Ghana Emergency Platform',
        email: 'support@emergency.dev'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3002}`,
        description: 'Local Development'
      },
      {
        url: 'https://national-emergency-platform-incident.onrender.com',
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
        Incident: {
          type: 'object',
          required: ['incident_id', 'incident_type', 'status', 'latitude', 'longitude'],
          properties: {
            incident_id: {
              type: 'string',
              example: 'INC-2024-00001'
            },
            citizen_name: {
              type: 'string',
              example: 'Ama Boateng'
            },
            citizen_phone: {
              type: 'string',
              example: '+233501234567'
            },
            incident_type: {
              type: 'string',
              enum: ['MEDICAL_EMERGENCY', 'FIRE', 'CRIME', 'ACCIDENT', 'OTHER']
            },
            status: {
              type: 'string',
              enum: ['CREATED', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED']
            },
            latitude: {
              type: 'number',
              format: 'double',
              example: 5.6037
            },
            longitude: {
              type: 'number',
              format: 'double',
              example: -0.1870
            },
            location_description: {
              type: 'string'
            },
            notes: {
              type: 'string'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Responder: {
          type: 'object',
          required: ['responder_id', 'name', 'responder_type'],
          properties: {
            responder_id: {
              type: 'string',
              example: 'RESP-001'
            },
            name: {
              type: 'string',
              example: 'Kwasi Mensah'
            },
            responder_type: {
              type: 'string',
              enum: ['MEDICAL_TEAM', 'FIREFIGHTER', 'POLICE_OFFICER']
            },
            latitude: {
              type: 'number',
              format: 'double'
            },
            longitude: {
              type: 'number',
              format: 'double'
            },
            is_available: {
              type: 'boolean'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
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
        name: 'Incidents',
        description: 'Emergency incident management'
      },
      {
        name: 'Responders',
        description: 'Emergency responder management'
      },
      {
        name: 'Health',
        description: 'Service health checks'
      }
    ]
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
