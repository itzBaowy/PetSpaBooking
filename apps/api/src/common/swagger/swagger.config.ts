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
        : { url:  process.env.API_URL, description: 'Production server' }
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
            id:        { type: 'string', example: '507f1f77bcf86cd799439011' },
            userName:  { type: 'string', example: 'johndoe' },
            email:     { type: 'string', format: 'email', example: 'john@example.com' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
          },
        },

        // ── User CRUD schemas ────────────────────────────────────────────────
        UserObject: {
          type: 'object',
          properties: {
            id:        { type: 'string', example: '507f1f77bcf86cd799439011' },
            userName:  { type: 'string', example: 'johndoe' },
            email:     { type: 'string', format: 'email', example: 'john@example.com' },
            phone:     { type: 'string', nullable: true, example: '0901234567' },
            fullName:  { type: 'string', nullable: true, example: 'John Doe' },
            avatar:    { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
            role:      { type: 'string', enum: ['CUSTOMER', 'ADMIN', 'PROVIDER'], example: 'CUSTOMER' },
            status:    { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'BANNED'], example: 'ACTIVE' },
            createAt:  { type: 'string', format: 'date-time', example: '2026-01-01T00:00:00.000Z' },
            updateAt:  { type: 'string', format: 'date-time', example: '2026-06-01T00:00:00.000Z' },
          },
        },

        UserListResponse: {
          type: 'object',
          properties: {
            page:      { type: 'integer', example: 1 },
            pageSize:  { type: 'integer', example: 10 },
            totalItem: { type: 'integer', example: 50 },
            totalPage: { type: 'integer', example: 5 },
            items: {
              type: 'array',
              items: { '$ref': '#/components/schemas/UserObject' },
            },
          },
        },

        CreateUserRequest: {
          type: 'object',
          required: ['userName', 'email', 'phone'],
          properties: {
            userName: { type: 'string', example: 'johndoe' },
            email:    { type: 'string', format: 'email', example: 'john@example.com' },
            phone:    { type: 'string', example: '0901234567' },
            fullName: { type: 'string', example: 'John Doe' },
            avatar:   { type: 'string', example: 'https://example.com/avatar.jpg' },
            role:     { type: 'string', enum: ['CUSTOMER', 'ADMIN', 'PROVIDER'], example: 'CUSTOMER' },
            status:   { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
          },
        },

        UpdateUserRequest: {
          type: 'object',
          description: 'Admin can update all fields. Regular user can only update fullName, avatar, phone.',
          properties: {
            fullName: { type: 'string', example: 'Jane Doe' },
            avatar:   { type: 'string', example: 'https://example.com/avatar.jpg' },
            phone:    { type: 'string', example: '0909876543' },
            email:    { type: 'string', format: 'email', description: 'Admin only', example: 'newemail@example.com' },
            userName: { type: 'string', description: 'Admin only', example: 'newusername' },
            role:     { type: 'string', enum: ['CUSTOMER', 'ADMIN', 'PROVIDER'], description: 'Admin only', example: 'PROVIDER' },
            status:   { type: 'string', enum: ['ACTIVE', 'INACTIVE'], description: 'Admin only', example: 'INACTIVE' },
          },
        },

        UpdateRoleRequest: {
          type: 'object',
          required: ['role'],
          properties: {
            role: {
              type: 'string',
              enum: ['CUSTOMER', 'ADMIN', 'PROVIDER'],
              example: 'PROVIDER',
              description: 'New role to assign to the user',
            },
          },
        },
      },
    },
  },
  // Đường dẫn đến các file chứa comment @swagger
  apis: ['./src/routers/*.ts'],
}