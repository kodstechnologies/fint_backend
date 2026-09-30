export const userAuthDocs = {
  "/fint/auth/fint/sign-up": {
    post: {
      tags: ["User - Authentication"],
      summary: "User sign up",
      description: "Registers a new user account with phone number, name, blood group, email, and pincode.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "phoneNumber", "bloodGroup"],
              properties: {
                name: {
                  type: "string",
                  minLength: 2,
                  maxLength: 50,
                  example: "Rahul Sharma",
                  description: "Full name of the user",
                },
                phoneNumber: {
                  type: "string",
                  pattern: "^\\d{10}$",
                  example: "9876543210",
                  description: "10-digit Indian mobile number",
                },
                bloodGroup: {
                  type: "string",
                  enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
                  example: "O+",
                  description: "Blood group",
                },
                email: {
                  type: "string",
                  format: "email",
                  example: "rahul@example.com",
                  description: "User email address (optional)",
                },
                pinCode: {
                  type: "string",
                  pattern: "^\\d{6}$",
                  example: "560001",
                  description: "6-digit Indian PIN code (optional)",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Sign up successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "object",
                    properties: {
                      createUser: { $ref: "#/components/schemas/UserProfile" },
                    },
                  },
                  message: { type: "string", example: "Sign up successful" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
      },
    },
  },
  "/fint/auth/fint/login": {
    post: {
      tags: ["User - Authentication"],
      summary: "User login (Send OTP)",
      description: "Initiates user login by generating a 4-digit OTP and sending it via SMS provider.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["phoneNumber"],
              properties: {
                phoneNumber: {
                  type: "string",
                  pattern: "^[6-9]\\d{9}$",
                  example: "9876543210",
                  description: "10-digit Indian mobile number starting with 6-9",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "OTP sent successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "object",
                    properties: {
                      phoneNumber: { type: "string", example: "9876543210" },
                    },
                  },
                  message: { type: "string", example: "OTP sent successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        404: {
          description: "Phone number not registered",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "Phone not exists", errors: [] },
            },
          },
        },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
  "/fint/auth/fint/check-otp": {
    post: {
      tags: ["User - Authentication"],
      summary: "Verify user OTP and login",
      description: "Verifies the 4-digit SMS OTP, updates optional Firebase notification token, and issues JWT access and refresh tokens.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["identifier", "otp"],
              properties: {
                identifier: {
                  type: "string",
                  pattern: "^[6-9]\\d{9}$",
                  example: "9876543210",
                  description: "10-digit Indian mobile number",
                },
                otp: {
                  type: "string",
                  pattern: "^\\d{4}$",
                  example: "1234",
                  description: "4-digit OTP received via SMS (Testing bypass: '1234')",
                },
                firebaseToken: {
                  type: "string",
                  example: "fcm_token_sample_string_123",
                  description: "FCM device push notification token (optional)",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "OTP verified successfully. Tokens issued.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/UserProfile" },
                      accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                      refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                    },
                  },
                  message: { type: "string", example: "OTP verified successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid or expired OTP",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "Invalid OTP", errors: [] },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
  "/fint/auth/fint/profile": {
    get: {
      tags: ["User - Authentication"],
      summary: "Get current user profile",
      description: "Returns the authenticated user's profile and active bank account details.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      responses: {
        200: {
          description: "Profile fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { $ref: "#/components/schemas/UserProfile" },
                  message: { type: "string", example: "Profile fetched successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
  "/fint/auth/fint/update-profile": {
    patch: {
      tags: ["User - Authentication"],
      summary: "Update user profile",
      description: "Updates user profile information such as name, blood donor status, pin code, or email, with optional avatar image upload via multipart/form-data.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                avatar: {
                  type: "string",
                  format: "binary",
                  description: "Profile avatar image (JPG, PNG, WEBP, max 5MB)",
                },
                name: { type: "string", example: "Rahul Sharma" },
                phoneNumber: { type: "string", example: "9876543210" },
                bloodGroup: {
                  type: "string",
                  enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
                  example: "O+",
                },
                beADonor: { type: "boolean", example: true, description: "Willingness to be a Red Drop blood donor" },
                email: { type: "string", format: "email", example: "rahul@example.com" },
                pinCode: { type: "string", example: "560001" },
                firebaseToken: { type: "string", example: "fcm_token_sample" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Profile updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { $ref: "#/components/schemas/UserProfile" },
                  message: { type: "string", example: "Profile updated successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
  "/fint/auth/fint/renew-access-token": {
    get: {
      tags: ["User - Authentication"],
      summary: "Renew user access token",
      description: "Issues a new JWT access token using the valid user refresh token provided via cookie `refreshToken` or header `x-refresh-token`.",
      parameters: [
        {
          name: "x-refresh-token",
          in: "header",
          required: false,
          description: "User refresh token if not provided in cookie",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "New access token generated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "object",
                    properties: {
                      accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                      user: { $ref: "#/components/schemas/UserProfile" },
                    },
                  },
                  message: { type: "string", example: "Access token renewed successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: {
          description: "Session expired or invalid refresh token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "Session Expired. Login Again", errors: [] },
            },
          },
        },
      },
    },
  },
  "/fint/auth/fint/logout": {
    post: {
      tags: ["User - Authentication"],
      summary: "User logout",
      description: "Logs out the authenticated user by invalidating the refresh token and clearing cookie sessions.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      responses: {
        200: {
          description: "Logout successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { type: "null", example: null },
                  message: { type: "string", example: "Logged out successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
  "/fint/auth/fint/delete-account": {
    delete: {
      tags: ["User - Authentication"],
      summary: "Delete user account",
      description: "Permanently deletes the authenticated user's account and associated bank accounts from the system.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      responses: {
        200: {
          description: "Account deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { type: "null", example: null },
                  message: { type: "string", example: "Account deleted successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
  "/fint/auth/fint/add-bank-account": {
    post: {
      tags: ["User - Bank Accounts"],
      summary: "Add bank account for user",
      description: "Links a new bank account to the authenticated user. If this is the user's first account, it is automatically marked active.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: [
                "accountHolderName",
                "bankAccountNumber",
                "ifscCode",
                "bankId",
                "cardTypeId",
                "accountType",
              ],
              properties: {
                accountHolderName: { type: "string", example: "Rahul Sharma" },
                bankAccountNumber: { type: "string", example: "123456789012" },
                ifscCode: { type: "string", example: "HDFC0001234" },
                bankId: { type: "string", example: "660c1b2f4f1a2b0012345682", description: "ObjectId from Bank collection" },
                cardTypeId: { type: "string", example: "660c1b2f4f1a2b0012345683", description: "ObjectId from CardType collection" },
                accountType: { type: "string", enum: ["Savings", "Current"], example: "Savings" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Bank account created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 201 },
                  data: { $ref: "#/components/schemas/BankAccount" },
                  message: { type: "string", example: "Bank account created successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        409: {
          description: "Bank account already exists",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "Bank account already exists", errors: [] },
            },
          },
        },
      },
    },
  },
  "/fint/auth/fint/get-bank-accounts": {
    get: {
      tags: ["User - Bank Accounts"],
      summary: "Get all user bank accounts",
      description: "Retrieves all bank accounts linked to the authenticated user with masked account numbers.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      responses: {
        200: {
          description: "Bank accounts fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "object",
                    properties: {
                      bankAccounts: {
                        type: "array",
                        items: { $ref: "#/components/schemas/BankAccount" },
                      },
                    },
                  },
                  message: { type: "string", example: "Bank accounts fetched successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
  "/fint/auth/fint/get-single-bank-accounts/{bankAccountId}": {
    get: {
      tags: ["User - Bank Accounts"],
      summary: "Get single bank account by ID",
      description: "Retrieves specific bank account details for the authenticated user by bank account ObjectId.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      parameters: [
        {
          name: "bankAccountId",
          in: "path",
          required: true,
          description: "ObjectId of the bank account",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345681" },
        },
      ],
      responses: {
        200: {
          description: "Bank account fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "object",
                    properties: {
                      bankAccount: { $ref: "#/components/schemas/BankAccount" },
                    },
                  },
                  message: { type: "string", example: "Bank account fetched successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
  "/fint/auth/fint/update-bank-account/{bankAccountId}": {
    patch: {
      tags: ["User - Bank Accounts"],
      summary: "Update user bank account",
      description: "Updates bank account details such as account holder name or active status.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      parameters: [
        {
          name: "bankAccountId",
          in: "path",
          required: true,
          description: "ObjectId of the bank account",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345681" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                accountHolderName: { type: "string", example: "Rahul Sharma" },
                bankAccountNumber: { type: "string", example: "123456789012" },
                ifscCode: { type: "string", example: "HDFC0001234" },
                bankName: { type: "string", example: "HDFC Bank" },
                accountType: { type: "string", enum: ["Savings", "Current"], example: "Savings" },
                isAcive: { type: "boolean", example: true },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Bank account updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { $ref: "#/components/schemas/BankAccount" },
                  message: { type: "string", example: "Bank account updated successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
  "/fint/auth/fint/delete-bank-account/{bankAccountId}": {
    delete: {
      tags: ["User - Bank Accounts"],
      summary: "Delete user bank account",
      description: "Removes a bank account from the user's registered bank accounts.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      parameters: [
        {
          name: "bankAccountId",
          in: "path",
          required: true,
          description: "ObjectId of the bank account to delete",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345681" },
        },
      ],
      responses: {
        200: {
          description: "Bank account deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { type: "null", example: null },
                  message: { type: "string", example: "Bank account deleted successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
};
