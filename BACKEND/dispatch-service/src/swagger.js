const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dispatch Service API',
      version: '1.0.0',
      description: 'Vehicle Dispatch and Tracking Service for Ghana Emergency Platform - Manage vehicles and real-time GPS tracking',
      contact: {
        name: 'Ghana Emergency Platform',
        email: 'support@emergency.dev'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3003}`,
        description: 'Local Development'
      },
      {
        url: 'https://national-emergency-platform-dispatch.onrender.com',
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
        Vehicle: {
          type: 'object',
          required: ['vehicle_id', 'responder_id', 'responder_type'],
          properties: {
            vehicle_id: {
              type: 'string',
              example: 'VEH-001'
            },
            responder_id: {
              type: 'string',
              example: 'RESP-001'
            },
            responder_type: {
              type: 'string',
              enum: ['AMBULANCE', 'FIRE_TRUCK', 'POLICE_CAR']
            },
            driver_user_id: {
              type: 'string',
              format: 'uuid'
            },
            status: {
              type: 'string',
              enum: ['AVAILABLE', 'DISPATCHED', 'ON_SCENE', 'RETURNING']
            },
            current_location: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number',
                  format: 'double'
                },
                longitude: {
                  type: 'number',
                  format: 'double'
                },
                speed_kmh: {
                  type: 'number'
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time'
                }
              }
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        LocationHistory: {
          type: 'object',
          properties: {
            location_id: {
              type: 'string'
            },
            vehicle_id: {
              type: 'string'
            },
            latitude: {
              type: 'number',
              format: 'double'
            },
            longitude: {
              type: 'number',
              format: 'double'
            },
            speed_kmh: {
              type: 'number'
            },
            timestamp: {
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
        name: 'Vehicles',
        description: 'Emergency vehicle management'
      },
      {
        name: 'Location',
        description: 'Real-time GPS tracking'
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
