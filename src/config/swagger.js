import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Amrutam Telemedicine API',
      version: '1.0.0',
      description: 'API documentation for Amrutam Telemedicine Platform',
      contact: {
        name: 'Amrutam Team',
        email: 'support@amrutam.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.amrutam.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6aab7dd6f0932c42ed011557' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@gmail.com' },
            phone: { type: 'string', example: '9876543210' },
            role: { type: 'string', enum: ['PATIENT', 'DOCTOR', 'ADMIN'] },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Doctor: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { $ref: '#/components/schemas/User' },
            specialization: { type: 'string', example: 'General Physician' },
            qualification: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  degree: { type: 'string', example: 'MBBS' },
                  institution: { type: 'string', example: 'Medical College' },
                  yearOfCompletion: { type: 'number', example: 2020 }
                }
              }
            },
            experience: { type: 'number', example: 5 },
            consultationFee: { type: 'number', example: 500 },
            rating: { type: 'number', example: 4.5 },
            languages: { type: 'array', items: { type: 'string' } },
            isVerified: { type: 'boolean' },
            isAvailable: { type: 'boolean' }
          }
        },
        Consultation: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            patientId: { $ref: '#/components/schemas/User' },
            doctorId: { $ref: '#/components/schemas/User' },
            type: { type: 'string', enum: ['VIDEO', 'AUDIO', 'CHAT'] },
            status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
            scheduledAt: { type: 'string', format: 'date-time' },
            duration: { type: 'number', example: 30 },
            consultationFee: { type: 'number', example: 500 },
            prescription: { type: 'array', items: { type: 'object' } }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Error message' }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/modules/**/*.routes.js', './src/modules/**/*.controller.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;