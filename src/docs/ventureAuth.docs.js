export const ventureAuthDocs = {
  "/fint/auth/ventures/sign-up": {
    post: {
      tags: ["Venture - Authentication"],
      summary: "Venture business sign up",
      description: "Registers a new partner venture profile with business contact information.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["firstName", "lastName", "phoneNumber"],
              properties: {
                firstName: {
                  type: "string",
                  minLength: 2,
                  maxLength: 50,
                  example: "Apex",
                  description: "Venture/Company primary contact first name",
                },
                lastName: {
                  type: "string",
                  minLength: 2,
                  maxLength: 50,
                  example: "Ventures",
                  description: "Venture/Company primary contact last name",
                },
                phoneNumber: {
                  type: "string",
                  pattern: "^[6-9]\\d{9}$",
                  example: "9876543211",
                  description: "10-digit Indian mobile number",
                },
                email: {
                  type: "string",
                  format: "email",
                  example: "contact@apexventures.com",
                  description: "Official business email address (optional)",
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
          description: "Venture registered successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "object",
                    properties: {
                      createVenture: { $ref: "#/components/schemas/VentureProfile" },
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
  "/fint/auth/ventures/login": {
    post: {
      tags: ["Venture - Authentication"],
      summary: "Venture login (Send OTP)",
      description: "Initiates venture business login by generating and dispatching a 4-digit SMS OTP.",
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
                  example: "9876543211",
                  description: "10-digit registered Indian mobile number",
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
                      phoneNumber: { type: "string", example: "9876543211" },
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
      },
    },
  },
  "/fint/auth/ventures/check-otp": {
    post: {
      tags: ["Venture - Authentication"],
      summary: "Verify venture OTP and login",
      description: "Validates the 4-digit OTP and issues JWT access and refresh tokens for the venture.",
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
                  example: "9876543211",
                  description: "10-digit mobile number",
                },
                otp: {
                  type: "string",
                  pattern: "^\\d{4}$",
                  example: "1234",
                  description: "4-digit OTP (Bypass: '1234')",
                },
                firebaseToken: {
                  type: "string",
                  example: "fcm_venture_token_123",
                  description: "FCM device notification token",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "OTP verified. Tokens generated.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/VentureProfile" },
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
        400: { $ref: "#/components/responses/ValidationError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
  "/fint/auth/ventures/profile": {
    get: {
      tags: ["Venture - Authentication"],
      summary: "Get current venture profile",
      description: "Retrieves the authenticated venture's details and registered bank accounts.",
      security: [
        { bearerAuth: [] },
      ],
      responses: {
        200: {
          description: "Venture profile retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { $ref: "#/components/schemas/VentureProfile" },
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
  "/fint/auth/ventures/update-profile": {
    patch: {
      tags: ["Venture - Authentication"],
      summary: "Update venture profile",
      description: "Updates venture contact details and optionally uploads a venture logo/avatar image via multipart/form-data.",
      security: [
        { bearerAuth: [] },
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
                  description: "Venture profile or company logo image (JPG, PNG, WEBP, max 5MB)",
                },
                firstName: { type: "string", example: "Apex" },
                lastName: { type: "string", example: "Ventures" },
                phoneNumber: { type: "string", example: "9876543211" },
                bloodGroup: { type: "string", example: "B+" },
                beADonor: { type: "boolean", example: false },
                email: { type: "string", format: "email", example: "contact@apexventures.com" },
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
                  data: { $ref: "#/components/schemas/VentureProfile" },
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
  "/fint/auth/ventures/renew-access-token": {
    get: {
      tags: ["Venture - Authentication"],
      summary: "Renew venture access token",
      description: "Issues a new JWT access token for the venture using a valid refresh token provided via cookie or header.",
      parameters: [
        {
          name: "x-refresh-token",
          in: "header",
          required: false,
          description: "Venture refresh token if not provided in cookie",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Access token renewed successfully",
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
                      user: { $ref: "#/components/schemas/VentureProfile" },
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
          description: "Invalid refresh token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "This refresh token does not belong to a venture", errors: [] },
            },
          },
        },
      },
    },
  },
  "/fint/auth/ventures/logout": {
    post: {
      tags: ["Venture - Authentication"],
      summary: "Venture logout",
      description: "Logs out the authenticated venture and clears token sessions.",
      parameters: [
        {
          name: "x-refresh-token",
          in: "header",
          required: false,
          description: "Venture refresh token",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Logged out successfully",
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
  "/fint/auth/ventures/delete-account": {
    delete: {
      tags: ["Venture - Authentication"],
      summary: "Delete venture account",
      description: "Permanently deletes the authenticated venture account and all associated bank details.",
      security: [
        { bearerAuth: [] },
      ],
      responses: {
        200: {
          description: "Venture account deleted successfully",
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
  "/fint/auth/ventures/add-bank-account": {
    post: {
      tags: ["Venture - Bank Accounts"],
      summary: "Add bank account for venture",
      description: "Links a business bank account to the authenticated venture.",
      security: [
        { bearerAuth: [] },
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
                accountHolderName: { type: "string", example: "APEX VENTURES PVT LTD" },
                bankAccountNumber: { type: "string", example: "987654321098" },
                ifscCode: { type: "string", example: "ICIC0005678" },
                bankId: { type: "string", example: "660c1b2f4f1a2b0012345682", description: "ObjectId from Bank collection" },
                cardTypeId: { type: "string", example: "660c1b2f4f1a2b0012345683", description: "ObjectId from CardType collection" },
                accountType: { type: "string", enum: ["Savings", "Current"], example: "Current" },
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
  "/fint/auth/ventures/get-bank-accounts": {
    get: {
      tags: ["Venture - Bank Accounts"],
      summary: "Get all venture bank accounts",
      description: "Fetches all bank accounts linked to the authenticated venture.",
      security: [
        { bearerAuth: [] },
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
  "/fint/auth/ventures/get-single-bank-accounts/{bankAccountId}": {
    get: {
      tags: ["Venture - Bank Accounts"],
      summary: "Get single venture bank account",
      description: "Fetches specific bank account details for the authenticated venture.",
      security: [
        { bearerAuth: [] },
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
  "/fint/auth/ventures/update-bank-account/{bankAccountId}": {
    patch: {
      tags: ["Venture - Bank Accounts"],
      summary: "Update venture bank account",
      description: "Updates venture bank account details.",
      security: [
        { bearerAuth: [] },
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
                accountHolderName: { type: "string", example: "APEX VENTURES PVT LTD" },
                bankAccountNumber: { type: "string", example: "987654321098" },
                ifscCode: { type: "string", example: "ICIC0005678" },
                bankName: { type: "string", example: "ICICI Bank" },
                accountType: { type: "string", enum: ["Savings", "Current"], example: "Current" },
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
  "/fint/auth/ventures/delete-bank-account/{bankAccountId}": {
    delete: {
      tags: ["Venture - Bank Accounts"],
      summary: "Delete venture bank account",
      description: "Deletes a bank account linked to the authenticated venture.",
      security: [
        { bearerAuth: [] },
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
