const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Analytics Service API',
      version: '1.0.0',
      description: 'Real-time Analytics and Reporting Service for Ghana Emergency Platform - Performance metrics and operational insights',
      contact: {
        name: 'Ghana Emergency Platform',
        email: 'support@emergency.dev'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3004}`,
        description: 'Local Development'
      },
      {
        url: 'https://national-emergency-platform-analytics.onrender.com',
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
        ResponseTimes: {
          type: 'object',
          properties: {
            average_response_time_seconds: {
              type: 'number',
              example: 480
            },
            median_response_time_seconds: {
              type: 'number',
              example: 450
            },
            fastest_response_seconds: {
              type: 'number',
              example: 120
            },
            slowest_response_seconds: {
              type: 'number',
              example: 1200
            },
            incident_count: {
              type: 'integer',
              example: 45
            },
            period: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  format: 'date-time'
                },
                to: {
                  type: 'string',
                  format: 'date-time'
                }
              }
            }
          }
        },
        IncidentsByRegion: {
          type: 'object',
          properties: {
            region: {
              type: 'string',
              example: 'Greater Accra'
            },
            incident_count: {
              type: 'integer',
              example: 35
            },
            incident_breakdown: {
              type: 'object',
              properties: {
                medical_emergencies: {
                  type: 'integer'
                },
                fire_incidents: {
                  type: 'integer'
                },
                crime_incidents: {
                  type: 'integer'
                },
                accidents: {
                  type: 'integer'
                }
              }
            }
          }
        },
        ResourceUtilization: {
          type: 'object',
          properties: {
            total_vehicles: {
              type: 'integer',
              example: 50
            },
            vehicles_in_use: {
              type: 'integer',
              example: 18
            },
            utilization_percentage: {
              type: 'number',
              example: 36.0
            }
          }
        },
        DailySummary: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date'
            },
            total_incidents: {
              type: 'integer'
            },
            resolved_incidents: {
              type: 'integer'
            },
            resolution_rate_percentage: {
              type: 'number'
            },
            average_resolution_time_minutes: {
              type: 'number'
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
        name: 'Analytics',
        description: 'Real-time analytics and metrics'
      },
      {
        name: 'Reports',
        description: 'Operational reports'
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
