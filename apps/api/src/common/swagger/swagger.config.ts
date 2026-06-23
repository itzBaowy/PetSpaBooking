// Cấu hình Swagger (Tài liệu API)
import dotenv from 'dotenv';
dotenv.config();
const mode = process.env.NODE_ENV;
export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PetSpa Booking API',
      version: '1.0.0',
      description: 'Document API for the PetSpa Booking application',
    },
    servers: [
      mode === 'development'
        ? { url: 'http://localhost:5500', description: 'Development server' }
        : { url: 'https://petspa-booking.onrender.com', description: 'Production server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token to authenticate',
        },
      },
      schemas: {
        // ── Request schemas ──────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['userName', 'email', 'password', 'phone'],
          properties: {
            userName: { type: 'string', example: 'johndoe' },
            email:    { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', minLength: 6, example: 'secret123' },
            phone:    { type: 'string', example: '0901234567' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['userName', 'password'],
          properties: {
            userName: { type: 'string', example: 'johndoe' },
            password: { type: 'string', format: 'password', example: 'secret123' },
          },
        },

        // ── Response schemas ─────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            status:     { type: 'string', example: 'success' },
            statusCode: { type: 'integer', example: 200 },
            message:    { type: 'string', example: 'Operation successful' },
            data:       { type: 'object', nullable: true },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status:     { type: 'string', example: 'error' },
            statusCode: { type: 'integer', example: 400 },
            message:    { type: 'string', example: 'Something went wrong' },
          },
        },
        TokenResponse: {
          type: 'object',
          properties: {
            accessToken:  { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        UserInfo: {
          type: 'object',
          properties: {
            id:        { type: 'string', example: 'cuid_abc123' },
            userName:  { type: 'string', example: 'johndoe' },
            email:     { type: 'string', format: 'email', example: 'john@example.com' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
          },
        },
      },
    },
  },
  // Đường dẫn đến các file chứa comment @swagger
  apis: ['./src/routers/*.ts'],
}