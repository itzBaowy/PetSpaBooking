// Cấu hình Swagger (Tài liệu API)
import dotenv from "dotenv";
dotenv.config();
const mode = process.env.NODE_ENV;
export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PetSpa Booking API",
      version: "1.0.0",
      description: "Document API for the PetSpa Booking application",
    },
    servers: [
      mode === "development"
        ? { url: "http://localhost:5500", description: "Development server" }
        : { url: process.env.API_URL, description: "Production server" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token to authenticate",
        },
      },
      responses: {
        Success: {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        Created: {
          description: "Resource created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        NoContent: {
          description: "No content",
        },
        BadRequest: {
          description: "Bad request",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        Unauthorized: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        Forbidden: {
          description: "Forbidden",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        NotFound: {
          description: "Not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        Token: {
          description: "Authentication tokens",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TokenResponse" },
            },
          },
        },
      },
      schemas: {
        // ── Request schemas ──────────────────────────────────────────
        RegisterRequest: {
          type: "object",
          required: ["userName", "email", "password", "phone"],
          properties: {
            userName: { type: "string", example: "johndoe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 6,
              example: "Test@123",
            },
            phone: { type: "string", example: "0901234567" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["userName", "password"],
          properties: {
            userName: { type: "string", example: "johndoe" },
            password: {
              type: "string",
              format: "password",
              example: "Test@123",
            },
          },
        },

        // ── Response schemas ─────────────────────────────────────────
        SuccessResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            statusCode: { type: "integer", example: 200 },
            message: { type: "string", example: "Operation successful" },
            data: { type: "object", nullable: true },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            statusCode: { type: "integer", example: 400 },
            message: { type: "string", example: "Something went wrong" },
          },
        },
        TokenResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        UserInfo: {
          type: "object",
          properties: {
            id: { type: "string", example: "507f1f77bcf86cd799439011" },
            userName: { type: "string", example: "johndoe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            role: {
              type: "string",
              enum: ["CUSTOMER", "PROVIDER", "ADMIN"],
              example: "CUSTOMER",
            },
            status: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE", "BANNED"],
              example: "ACTIVE",
            },
            providerProfileId: { type: "string", nullable: true },
            providerStatus: {
              type: "string",
              nullable: true,
              enum: [
                "PENDING_VERIFICATION",
                "VERIFIED",
                "REJECTED",
                "SUSPENDED",
              ],
            },
            providerVerificationStatus: {
              type: "string",
              nullable: true,
              enum: [
                "PENDING_VERIFICATION",
                "VERIFIED",
                "REJECTED",
                "SUSPENDED",
              ],
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-01T00:00:00.000Z",
            },
          },
        },

        // ── User CRUD schemas ────────────────────────────────────────────────
        UserObject: {
          type: "object",
          properties: {
            id: { type: "string", example: "507f1f77bcf86cd799439011" },
            userName: { type: "string", example: "johndoe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            phone: { type: "string", nullable: true, example: "0901234567" },
            fullName: { type: "string", nullable: true, example: "John Doe" },
            avatar: {
              type: "string",
              nullable: true,
              example: "https://example.com/avatar.jpg",
            },
            role: {
              type: "string",
              enum: ["CUSTOMER", "ADMIN", "PROVIDER"],
              example: "CUSTOMER",
            },
            status: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE", "BANNED"],
              example: "ACTIVE",
            },
            createAt: {
              type: "string",
              format: "date-time",
              example: "2026-01-01T00:00:00.000Z",
            },
            updateAt: {
              type: "string",
              format: "date-time",
              example: "2026-06-01T00:00:00.000Z",
            },
          },
        },

        UserListResponse: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            pageSize: { type: "integer", example: 10 },
            totalItem: { type: "integer", example: 50 },
            totalPage: { type: "integer", example: 5 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/UserObject" },
            },
          },
        },

        CreateUserRequest: {
          type: "object",
          required: ["userName", "email", "phone"],
          properties: {
            userName: { type: "string", example: "johndoe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            phone: { type: "string", example: "0901234567" },
            fullName: { type: "string", example: "John Doe" },
            avatar: {
              type: "string",
              example: "https://example.com/avatar.jpg",
            },
            role: {
              type: "string",
              enum: ["CUSTOMER", "ADMIN", "PROVIDER"],
              example: "CUSTOMER",
            },
            status: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE"],
              example: "ACTIVE",
            },
          },
        },

        UpdateUserRequest: {
          type: "object",
          description:
            "Admin can update all fields. Regular user can only update fullName, avatar, phone.",
          properties: {
            fullName: { type: "string", example: "Jane Doe" },
            avatar: {
              type: "string",
              example: "https://example.com/avatar.jpg",
            },
            phone: { type: "string", example: "0909876543" },
            email: {
              type: "string",
              format: "email",
              description: "Admin only",
              example: "newemail@example.com",
            },
            userName: {
              type: "string",
              description: "Admin only",
              example: "newusername",
            },
            role: {
              type: "string",
              enum: ["CUSTOMER", "ADMIN", "PROVIDER"],
              description: "Admin only",
              example: "PROVIDER",
            },
            status: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE"],
              description: "Admin only",
              example: "INACTIVE",
            },
          },
        },

        UpdateRoleRequest: {
          type: "object",
          required: ["role"],
          properties: {
            role: {
              type: "string",
              enum: ["CUSTOMER", "ADMIN", "PROVIDER"],
              example: "PROVIDER",
              description: "New role to assign to the user",
            },
          },
        },

        // ── Provider schemas ──────────────────────────────────────────────────
        ProviderObject: {
          type: "object",
          properties: {
            id: { type: "string", example: "507f1f77bcf86cd799439011" },
            userId: { type: "string", example: "507f1f77bcf86cd799439012" },
            businessName: { type: "string", example: "Happy Pet Spa" },
            slug: { type: "string", example: "happy-pet-spa" },
            description: {
              type: "string",
              nullable: true,
              example: "Professional pet grooming",
            },
            avatarUrl: {
              type: "string",
              nullable: true,
              example: "https://res.cloudinary.com/.../avatar.jpg",
            },
            coverImageUrl: {
              type: "string",
              nullable: true,
              example: "https://res.cloudinary.com/.../cover.jpg",
            },
            phone: { type: "string", nullable: true, example: "0901234567" },
            email: {
              type: "string",
              nullable: true,
              example: "shop@example.com",
            },
            address: {
              type: "string",
              nullable: true,
              example: "123 Nguyen Trai, Q5, HCM",
            },
            lat: { type: "number", nullable: true, example: 10.762622 },
            lng: { type: "number", nullable: true, example: 106.660172 },
            providerStatus: {
              type: "string",
              enum: [
                "PENDING_VERIFICATION",
                "VERIFIED",
                "REJECTED",
                "SUSPENDED",
              ],
              example: "PENDING_VERIFICATION",
            },
            depositStatus: {
              type: "string",
              enum: ["NOT_PAID", "ACTIVE", "LOW_BALANCE", "RESTRICTED"],
              example: "NOT_PAID",
            },
            depositBalance: { type: "number", example: 0 },
            walletBalance: { type: "number", example: 0 },
            cancellationRate: { type: "number", example: 0 },
            adminNote: { type: "string", nullable: true, example: null },
            createAt: { type: "string", format: "date-time" },
            updateAt: { type: "string", format: "date-time" },
          },
        },

        ProviderDocumentObject: {
          type: "object",
          properties: {
            id: { type: "string", example: "507f1f77bcf86cd799439013" },
            providerId: { type: "string", example: "507f1f77bcf86cd799439011" },
            documentType: {
              type: "string",
              enum: [
                "business_license",
                "id_card_front",
                "id_card_back",
                "tax_code",
                "other",
              ],
              example: "business_license",
            },
            imageUrl: {
              type: "string",
              example: "https://res.cloudinary.com/.../doc.jpg",
            },
            status: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
              example: "PENDING",
            },
            adminNote: { type: "string", nullable: true, example: null },
            createAt: { type: "string", format: "date-time" },
            updateAt: { type: "string", format: "date-time" },
          },
        },

        ProviderDetailObject: {
          allOf: [
            { $ref: "#/components/schemas/ProviderObject" },
            {
              type: "object",
              properties: {
                documents: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/ProviderDocumentObject",
                  },
                },
              },
            },
          ],
        },

        ProviderListResponse: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            pageSize: { type: "integer", example: 10 },
            totalItem: { type: "integer", example: 20 },
            totalPage: { type: "integer", example: 2 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/ProviderObject" },
            },
          },
        },

        RegisterProviderRequest: {
          type: "object",
          required: ["businessName"],
          properties: {
            businessName: { type: "string", example: "Happy Pet Spa" },
            description: {
              type: "string",
              example: "Professional pet grooming and spa service",
            },
            phone: { type: "string", example: "0901234567" },
            email: {
              type: "string",
              format: "email",
              example: "shop@example.com",
            },
            address: { type: "string", example: "123 Nguyen Trai, Q5, HCM" },
            lat: { type: "number", example: 10.762622 },
            lng: { type: "number", example: 106.660172 },
          },
        },

        UpdateProviderRequest: {
          type: "object",
          properties: {
            businessName: { type: "string", example: "Happy Pet Spa Updated" },
            description: { type: "string", example: "Updated description" },
            avatarUrl: {
              type: "string",
              example: "https://res.cloudinary.com/.../avatar.jpg",
            },
            coverImageUrl: {
              type: "string",
              example: "https://res.cloudinary.com/.../cover.jpg",
            },
            phone: { type: "string", example: "0901234567" },
            email: { type: "string", example: "new@example.com" },
            address: { type: "string", example: "456 Le Van Sy, Q3, HCM" },
            lat: { type: "number", example: 10.762622 },
            lng: { type: "number", example: 106.660172 },
          },
        },

        UploadDocumentRequest: {
          type: "object",
          required: ["documentType", "imageUrl"],
          properties: {
            documentType: {
              type: "string",
              enum: [
                "business_license",
                "id_card_front",
                "id_card_back",
                "tax_code",
                "other",
              ],
              example: "business_license",
            },
            imageUrl: {
              type: "string",
              example: "https://res.cloudinary.com/.../doc.jpg",
              description: "Cloudinary URL after frontend upload",
            },
          },
        },

        RejectProviderRequest: {
          type: "object",
          required: ["reason"],
          properties: {
            reason: {
              type: "string",
              example: "Documents are not clear or incomplete",
            },
          },
        },

        SuspendProviderRequest: {
          type: "object",
          properties: {
            reason: { type: "string", example: "Violation of platform terms" },
          },
        },

        // ── Service schemas ───────────────────────────────────────────────────
        ServiceObject: {
          type: "object",
          properties: {
            id: { type: "string", example: "507f1f77bcf86cd799439020" },
            providerId: { type: "string", example: "507f1f77bcf86cd799439011" },
            name: { type: "string", example: "Dog Grooming Basic" },
            description: {
              type: "string",
              nullable: true,
              example: "Full bath, blow-dry, and nail trim",
            },
            price: {
              type: "number",
              example: 150000,
              description: "Price in VND",
            },
            duration: {
              type: "integer",
              example: 60,
              description: "Duration in minutes",
            },
            category: {
              type: "string",
              enum: [
                "GROOMING",
                "SPA",
                "BOARDING",
                "TRAINING",
                "VETERINARY",
                "OTHER",
              ],
              example: "GROOMING",
            },
            imageUrls: {
              type: "array",
              items: { type: "string" },
              example: ["https://res.cloudinary.com/.../img1.jpg"],
            },
            isActive: {
              type: "boolean",
              example: true,
              description: "Provider can toggle visibility",
            },
            isHiddenByAdmin: {
              type: "boolean",
              example: false,
              apis: ["./src/routers/**/*.ts"],
            },
            createAt: {
              type: "string",
              format: "date-time",
              example: "2026-01-01T00:00:00.000Z",
            },
            updateAt: {
              type: "string",
              format: "date-time",
              example: "2026-06-01T00:00:00.000Z",
            },
          },
        },

        ServiceListResponse: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            pageSize: { type: "integer", example: 10 },
            totalItem: { type: "integer", example: 25 },
            totalPage: { type: "integer", example: 3 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/ServiceObject" },
            },
          },
        },

        MobileServiceListResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            statusCode: { type: "integer", example: 200 },
            message: {
              type: "string",
              example: "Services retrieved successfully",
            },
            data: {
              type: "object",
              properties: {
                data: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ServiceObject" },
                },
                page: { type: "integer", example: 1 },
                pageSize: { type: "integer", example: 10 },
                total: { type: "integer", example: 2 },
              },
            },
          },
        },

        MobileReviewObject: {
          type: "object",
          properties: {
            id: { type: "string", example: "6a45eb081d12ce5956ed842d" },
            rating: { type: "integer", example: 5 },
            comment: {
              type: "string",
              nullable: true,
              example:
                "Dịch vụ rất chuyên nghiệp, thú cưng của tôi rất hài lòng.",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-07-02T04:37:28.894Z",
            },
            user: {
              type: "object",
              properties: {
                id: { type: "string", example: "6a45eb081d12ce5956ed83f9" },
                name: {
                  type: "string",
                  nullable: true,
                  example: "Customer Test",
                },
                avatarUrl: { type: "string", nullable: true, example: null },
              },
            },
          },
        },

        MobileReviewListResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            statusCode: { type: "integer", example: 200 },
            message: {
              type: "string",
              example: "Reviews retrieved successfully",
            },
            data: {
              type: "object",
              properties: {
                responseReviews: {
                  type: "array",
                  items: { $ref: "#/components/schemas/MobileReviewObject" },
                },
                page: { type: "integer", example: 1 },
                pageSize: { type: "integer", example: 10 },
                total: { type: "integer", example: 1 },
              },
            },
          },
        },

        MobileProviderPreviewService: {
          type: "object",
          properties: {
            id: { type: "string", example: "6a45f65e91355e58db8f3585" },
            name: { type: "string", example: "PetLink Verified Spa - Tắm & làm đẹp" },
            price: { type: "number", example: 250000 },
            durationMinutes: { type: "integer", example: 60 },
            thumbnailUrl: { type: "string", example: "/brand/petlink-logo.png" },
            description: { type: "string", nullable: true, example: "Dịch vụ tắm, cắt tỉa lông và chăm sóc da cho thú cưng." },
          },
        },

        MobileProviderItem: {
          type: "object",
          properties: {
            id: { type: "string", example: "6a45f5a9de179b6c853f2170" },
            slug: { type: "string", example: "petlink-verified-spa" },
            businessName: { type: "string", example: "PetLink Verified Spa" },
            description: { type: "string", example: "Hồ sơ dữ liệu mẫu dùng để kiểm tra luồng đăng nhập và hiển thị dịch vụ thật." },
            avatarUrl: { type: "string", example: "/brand/petlink-logo.png" },
            coverImageUrl: { type: "string", example: "/brand/petlink-logo.png" },
            isVerified: { type: "boolean", example: false },
            status: { type: "string", example: "VERIFIED" },
            location: {
              type: "object",
              properties: {
                address: { type: "string", example: "123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh" },
                ward: { type: "string", example: "Phường Bến Nghé" },
                district: { type: "string", example: "Quận 1" },
                province: { type: "string", example: "TP. Hồ Chí Minh" },
                coordinates: {
                  type: "object",
                  properties: {
                    lat: { type: "number", example: 10.7769 },
                    lng: { type: "number", example: 106.7009 },
                  },
                },
                distanceKm: { type: "number", example: 0 },
              },
            },
            rating: {
              type: "object",
              properties: {
                average: { type: "number", example: 5 },
                totalReviews: { type: "integer", example: 1 },
              },
            },
            services: {
              type: "object",
              properties: {
                total: { type: "integer", example: 2 },
                categories: {
                  type: "array",
                  items: { type: "string" },
                  example: ["GROOMING", "VETERINARY"],
                },
                priceRange: {
                  type: "object",
                  properties: {
                    min: { type: "number", example: 180000 },
                    max: { type: "number", example: 250000 },
                    currency: { type: "string", example: "VND" },
                  },
                },
                preview: {
                  type: "array",
                  items: { $ref: "#/components/schemas/MobileProviderPreviewService" },
                },
              },
            },
            availability: {
              type: "object",
              properties: {
                isOpenNow: { type: "boolean", example: true },
                todayOpeningHours: {
                  type: "object",
                  properties: {
                    open: { type: "string", example: "08:00" },
                    close: { type: "string", example: "18:00" },
                  },
                },
              },
            },
            paymentMethods: {
              type: "object",
              properties: {
                online: { type: "boolean", example: true },
                cash: { type: "boolean", example: true },
              },
            },
            createdAt: { type: "string", format: "date-time", example: "2026-07-02T05:22:49.693Z" },
          },
        },

        MobileProviderDetailResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            statusCode: { type: "integer", example: 200 },
            message: { type: "string", example: "Provider information retrieved successfully" },
            data: { $ref: "#/components/schemas/MobileProviderItem" },
          },
        },

        CreateServiceRequest: {
          type: "object",
          required: ["name", "price", "duration"],
          properties: {
            name: { type: "string", example: "Dog Grooming Basic" },
            description: {
              type: "string",
              example: "Full bath, blow-dry, and nail trim",
            },
            price: {
              type: "number",
              minimum: 0,
              example: 150000,
              description: "Price in VND (non-negative)",
            },
            duration: {
              type: "integer",
              minimum: 1,
              example: 60,
              description: "Duration in minutes (positive)",
            },
            category: {
              type: "string",
              enum: [
                "GROOMING",
                "SPA",
                "BOARDING",
                "TRAINING",
                "VETERINARY",
                "OTHER",
              ],
              example: "GROOMING",
              description: "Defaults to OTHER if omitted",
            },
            imageUrls: {
              type: "array",
              items: { type: "string" },
              example: ["https://res.cloudinary.com/.../img1.jpg"],
              description: "Cloudinary URLs uploaded by frontend",
            },
          },
        },

        UpdateServiceRequest: {
          type: "object",
          description:
            "All fields are optional. Only provided fields will be updated.",
          properties: {
            name: { type: "string", example: "Dog Grooming Premium" },
            description: { type: "string", example: "Updated description" },
            price: { type: "number", minimum: 0, example: 200000 },
            duration: { type: "integer", minimum: 1, example: 90 },
            category: {
              type: "string",
              enum: [
                "GROOMING",
                "SPA",
                "BOARDING",
                "TRAINING",
                "VETERINARY",
                "OTHER",
              ],
              example: "SPA",
            },
            imageUrls: {
              type: "array",
              items: { type: "string" },
              example: ["https://res.cloudinary.com/.../new.jpg"],
            },
          },
        },
      },
    },
  },
  // Đường dẫn đến các file chứa comment @swagger
  apis: ["./src/routers/*.ts", "./src/routers/*/*.ts", "./src/routers/**/*.ts"],
};
