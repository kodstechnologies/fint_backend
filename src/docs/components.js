export const components = {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Enter your JWT token in the format: Bearer <token>",
    },
    adminCookieAuth: {
      type: "apiKey",
      in: "cookie",
      name: "access_token",
      description: "Admin access token stored in HTTP-only cookie `access_token`",
    },
    userCookieAuth: {
      type: "apiKey",
      in: "cookie",
      name: "accessToken",
      description: "User access token stored in cookie `accessToken`",
    },
    ventureRefreshTokenCookie: {
      type: "apiKey",
      in: "cookie",
      name: "refreshToken",
      description: "Venture/User refresh token stored in cookie `refreshToken` or header `x-refresh-token`",
    },
    adminRefreshTokenCookie: {
      type: "apiKey",
      in: "cookie",
      name: "refresh_token",
      description: "Admin refresh token stored in cookie `refresh_token`",
    },
  },
  schemas: {
    ApiResponse: {
      type: "object",
      properties: {
        statusCode: { type: "integer", example: 200 },
        data: { type: "object", nullable: true },
        message: { type: "string", example: "Operation completed successfully" },
        success: { type: "boolean", example: true },
      },
    },
    ApiError: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        message: { type: "string", example: "Validation failed or resource not found" },
        errors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              field: { type: "string", example: "phoneNumber" },
              message: { type: "string", example: "Phone number is required" },
            },
          },
        },
      },
    },
    Pagination: {
      type: "object",
      properties: {
        totalRecords: { type: "integer", example: 50 },
        totalPages: { type: "integer", example: 5 },
        currentPage: { type: "integer", example: 1 },
        limit: { type: "integer", example: 10 },
        hasNextPage: { type: "boolean", example: true },
        hasPrevPage: { type: "boolean", example: false },
      },
    },
    AdminProfile: {
      type: "object",
      properties: {
        _id: { type: "string", example: "660c1b2f4f1a2b0012345678" },
        firstName: { type: "string", example: "Admin" },
        lastName: { type: "string", example: "User" },
        email: { type: "string", format: "email", example: "admin@fint.com" },
        phoneNumber: { type: "string", example: "9876543210" },
        bloodGroup: { type: "string", example: "O+" },
        pinCode: { type: "string", example: "560001" },
        avatar: { type: "string", example: "https://s3.amazonaws.com/bucket/admins/avatar.jpg" },
        address: { type: "string", example: "123 Financial District" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    UserProfile: {
      type: "object",
      properties: {
        _id: { type: "string", example: "660c1b2f4f1a2b0012345679" },
        name: { type: "string", example: "Rahul Sharma" },
        phoneNumber: { type: "string", example: "9876543210" },
        bloodGroup: {
          type: "string",
          enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
          example: "O+",
        },
        beADonor: { type: "boolean", example: false },
        email: { type: "string", format: "email", example: "rahul@example.com" },
        pinCode: { type: "string", example: "560001" },
        avatar: { type: "string", example: "https://s3.amazonaws.com/bucket/users/avatar.jpg" },
        upiId: { type: "string", nullable: true, example: "rahul@upi" },
        bankAccounts: {
          type: "array",
          items: { $ref: "#/components/schemas/BankAccount" },
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    VentureProfile: {
      type: "object",
      properties: {
        _id: { type: "string", example: "660c1b2f4f1a2b0012345680" },
        firstName: { type: "string", example: "Apex" },
        lastName: { type: "string", example: "Ventures" },
        phoneNumber: { type: "string", example: "9876543211" },
        email: { type: "string", format: "email", example: "contact@apexventures.com" },
        pinCode: { type: "string", example: "560001" },
        avatar: { type: "string", example: "https://s3.amazonaws.com/bucket/ventures/avatar.jpg" },
        bankAccounts: {
          type: "array",
          items: { $ref: "#/components/schemas/BankAccount" },
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    BankAccount: {
      type: "object",
      properties: {
        _id: { type: "string", example: "660c1b2f4f1a2b0012345681" },
        accountHolderName: { type: "string", example: "RAHUL SHARMA" },
        bankAccountNumber: { type: "string", example: "XXXXXX1234" },
        ifscCode: { type: "string", example: "HDFC0001234" },
        bankId: {
          type: "object",
          properties: {
            _id: { type: "string", example: "660c1b2f4f1a2b0012345682" },
            bankName: { type: "string", example: "HDFC Bank" },
            bankImage: { type: "string", example: "https://s3.amazonaws.com/bucket/banks/hdfc.png" },
          },
        },
        cardTypeId: {
          type: "object",
          properties: {
            _id: { type: "string", example: "660c1b2f4f1a2b0012345683" },
            name: { type: "string", example: "Visa" },
            image: { type: "string", example: "https://s3.amazonaws.com/bucket/cardTypes/visa.png" },
          },
        },
        accountType: {
          type: "string",
          enum: ["Savings", "Current"],
          example: "Savings",
        },
        isActive: { type: "boolean", example: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    Bank: {
      type: "object",
      properties: {
        _id: { type: "string", example: "660c1b2f4f1a2b0012345682" },
        bankName: { type: "string", example: "State Bank of India" },
        bankImage: { type: "string", example: "https://s3.amazonaws.com/bucket/banks/sbi.png" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    CardType: {
      type: "object",
      properties: {
        _id: { type: "string", example: "660c1b2f4f1a2b0012345683" },
        name: {
          type: "string",
          enum: ["Visa", "MasterCard", "RuPay", "AmericanExpress"],
          example: "Visa",
        },
        image: { type: "string", example: "https://s3.amazonaws.com/bucket/cardTypes/visa.png" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    Payment: {
      type: "object",
      properties: {
        _id: { type: "string", example: "660c1b2f4f1a2b0012345684" },
        senderType: { type: "string", enum: ["User", "Venture"], example: "User" },
        senderId: { type: "string", example: "660c1b2f4f1a2b0012345679" },
        senderName: { type: "string", example: "Rahul Sharma" },
        senderPhoneNo: { type: "string", example: "9876543210" },
        senderAccountHolderName: { type: "string", example: "RAHUL SHARMA" },
        senderBankAccountNumber: { type: "string", example: "XXXXXX1234" },
        senderIfscCode: { type: "string", example: "HDFC0001234" },
        senderAccountType: { type: "string", example: "Savings" },
        receiverType: { type: "string", enum: ["User", "Venture"], nullable: true, example: "Venture" },
        receiverId: { type: "string", nullable: true, example: "660c1b2f4f1a2b0012345680" },
        receiverName: { type: "string", nullable: true, example: "Apex Ventures" },
        receiverPhoneNo: { type: "string", nullable: true, example: "9876543211" },
        receiverAccountHolderName: { type: "string", nullable: true, example: "APEX VENTURES PVT LTD" },
        receiverBankAccountNumber: { type: "string", nullable: true, example: "XXXXXX5678" },
        receiverIfscCode: { type: "string", nullable: true, example: "ICIC0005678" },
        receiverAccountType: { type: "string", nullable: true, example: "Current" },
        amount: { type: "number", example: 500 },
        module: { type: "string", example: "GENERAL" },
        moduleData: { type: "object" },
        paymentMethod: {
          type: "string",
          enum: ["qr", "phone", "self", "bank", "eChanges"],
          example: "phone",
        },
        expenseId: { type: "string", nullable: true, example: "660c1b2f4f1a2b0012345685" },
        razorpay_order_id: { type: "string", example: "order_PRc1J0kABC123" },
        razorpay_payment_id: { type: "string", nullable: true, example: "pay_PRc1J0kDEF456" },
        paymentStatus: {
          type: "string",
          enum: ["pending", "success", "failed"],
          example: "success",
        },
        fulfillmentStatus: {
          type: "string",
          enum: ["pending", "awaiting_payer", "awaiting_receiver", "completed", "failed"],
          example: "completed",
        },
        completedVia: {
          type: "string",
          enum: ["razorpay", "qr", "webhook", "manual"],
          nullable: true,
          example: "razorpay",
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    Coupon: {
      type: "object",
      properties: {
        _id: { type: "string", example: "660c1b2f4f1a2b0012345686" },
        couponTitle: { type: "string", example: "Summer Splash 20% OFF" },
        img: { type: "string", nullable: true, example: "https://s3.amazonaws.com/bucket/coupons/promo.jpg" },
        offerTitle: { type: "string", example: "Flat 20% Discount" },
        offerDescription: { type: "string", example: "Get 20% off on your next purchase over ₹500" },
        termsAndConditions: { type: "string", example: "Valid till stock lasts. One coupon per user." },
        expiryDate: { type: "string", format: "date-time", example: "2026-12-31T23:59:59.000Z" },
        offerDetails: { type: "string", example: "Applicable on retail and cafe outlets." },
        aboutCompany: { type: "string", example: "Leading lifestyle chain in India." },
        viewCount: { type: "integer", example: 120 },
        status: {
          type: "string",
          enum: ["active", "expired", "revoked"],
          example: "active",
        },
        createdBy: { type: "string", example: "660c1b2f4f1a2b0012345680" },
        usedUsers: {
          type: "array",
          items: { type: "string" },
          example: ["660c1b2f4f1a2b0012345679"],
        },
        revokedAt: { type: "string", format: "date-time", nullable: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    Advertisement: {
      type: "object",
      properties: {
        _id: { type: "string", example: "660c1b2f4f1a2b0012345687" },
        title: { type: "string", example: "Grow Your Savings With Fint" },
        description: { type: "string", example: "Get up to 7% returns with smart investment tools." },
        img: { type: "string", nullable: true, example: "https://s3.amazonaws.com/bucket/ads/banner.jpg" },
        status: { type: "string", enum: ["active", "expired"], example: "active" },
        count: { type: "integer", example: 1000 },
        views: { type: "integer", example: 245 },
        createdBy: { type: "string", example: "660c1b2f4f1a2b0012345680" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    InsuranceApplication: {
      type: "object",
      properties: {
        _id: { type: "string", example: "660c1b2f4f1a2b0012345688" },
        name: { type: "string", example: "Ananya Roy" },
        email: { type: "string", format: "email", example: "ananya@example.com" },
        phoneNumber: { type: "string", example: "9876543212" },
        address: { type: "string", example: "Flat 4B, Green Glen Layout, Bengaluru" },
        parentAge: { type: "integer", example: 29 },
        pinCode: { type: "string", example: "560103" },
        pets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              petId: { type: "string", example: "b2d2f78e-6701-49b8-a734-7c98f98ec411" },
              petName: { type: "string", example: "Bruno" },
              petBreed: { type: "string", example: "Golden Retriever" },
              petAge: { type: "string", example: "3" },
              petAddress: { type: "string", example: "Flat 4B, Green Glen Layout, Bengaluru" },
              petNoseImg: { type: "string", nullable: true, example: "https://s3.amazonaws.com/bucket/pets/nose.jpg" },
            },
          },
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    Expense: {
      type: "object",
      properties: {
        _id: { type: "string", example: "660c1b2f4f1a2b0012345689" },
        name: { type: "string", example: "Groceries & Food" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    Notification: {
      type: "object",
      properties: {
        _id: { type: "string", example: "660c1b2f4f1a2b0012345690" },
        title: { type: "string", example: "Payment Received" },
        body: { type: "string", example: "You received ₹500 from Rahul Sharma" },
        link: { type: "string", nullable: true, example: "/transactions" },
        img: { type: "string", nullable: true, example: "https://s3.amazonaws.com/bucket/notifications/icon.png" },
        model: { type: "string", enum: ["User", "Venture"], example: "User" },
        notificationType: {
          type: "string",
          enum: ["general", "payment", "blood", "insurance", "advertisement", "coupon", "eChanges"],
          example: "payment",
        },
        receiverId: { type: "string", example: "660c1b2f4f1a2b0012345679" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  },
  responses: {
    UnauthorizedError: {
      description: "Access token missing, invalid, or expired",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
          example: {
            success: false,
            message: "Access token missing",
            errors: [],
          },
        },
      },
    },
    ForbiddenError: {
      description: "Insufficient permissions or ownership mismatch",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
          example: {
            success: false,
            message: "You are not authorized to perform this action",
            errors: [],
          },
        },
      },
    },
    NotFoundError: {
      description: "Requested resource was not found",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
          example: {
            success: false,
            message: "Resource not found",
            errors: [],
          },
        },
      },
    },
    ValidationError: {
      description: "Validation failed on request body, query, or parameters",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
          example: {
            success: false,
            message: "Validation failed",
            errors: [
              {
                field: "phoneNumber",
                message: "Phone number must be a valid 10-digit Indian mobile number",
              },
            ],
          },
        },
      },
    },
    InternalServerError: {
      description: "Internal server error occurred",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
          example: {
            success: false,
            message: "Something went wrong",
            errors: [],
          },
        },
      },
    },
  },
};
