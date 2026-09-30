export const adminDocs = {
  "/admin/login": {
    post: {
      tags: ["Admin - Authentication"],
      summary: "Admin login",
      description: "Authenticates an administrator using email and password, setting access and refresh token cookies and returning admin profile with tokens.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "admin@fint.com",
                  description: "Admin registered email address",
                },
                password: {
                  type: "string",
                  format: "password",
                  minLength: 6,
                  example: "Admin@123456",
                  description: "Admin password (minimum 6 characters)",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "660c1b2f4f1a2b0012345678" },
                          email: { type: "string", example: "admin@fint.com" },
                          name: { type: "string", example: "Admin User" },
                          accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                          refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                        },
                      },
                    },
                  },
                  message: { type: "string", example: "Login successful" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: {
          description: "Invalid credentials",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "Invalid credentials", errors: [] },
            },
          },
        },
        404: {
          description: "Admin not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "Admin not found", errors: [] },
            },
          },
        },
      },
    },
  },
  "/admin/forgot-password": {
    post: {
      tags: ["Admin - Authentication"],
      summary: "Admin forgot password (Initiate reset)",
      description: "Endpoint to initiate admin password recovery.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
      ],
      responses: {
        200: {
          description: "Request processed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
  "/admin/refresh-token": {
    post: {
      tags: ["Admin - Authentication"],
      summary: "Refresh admin access token",
      description: "Generates a new access token using the admin refresh token stored in the `refresh_token` HTTP cookie.",
      security: [
        { adminRefreshTokenCookie: [] },
      ],
      responses: {
        200: {
          description: "New access token issued",
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
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "660c1b2f4f1a2b0012345678" },
                          email: { type: "string", example: "admin@fint.com" },
                          name: { type: "string", example: "Admin User" },
                        },
                      },
                    },
                  },
                  message: { type: "string", example: "New access token issued" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: {
          description: "Refresh token missing or invalid",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "Refresh token missing", errors: [] },
            },
          },
        },
      },
    },
  },
  "/admin/logout": {
    post: {
      tags: ["Admin - Authentication"],
      summary: "Admin logout",
      description: "Invalidates the admin session, clears the refresh token in the database, and clears authentication cookies.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
      ],
      parameters: [
        {
          name: "x-refresh-token",
          in: "header",
          required: false,
          description: "Admin refresh token if not provided via cookie",
          schema: { type: "string" },
        },
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
                  message: { type: "string", example: "Logout successful" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        400: {
          description: "No refresh token provided",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "No refresh token provided", errors: [] },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
  "/admin/reset-password": {
    post: {
      tags: ["Admin - Authentication"],
      summary: "Reset admin password",
      description: "Allows an authenticated administrator to update their password after verifying their old password.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["oldPassword", "newPassword"],
              properties: {
                oldPassword: {
                  type: "string",
                  format: "password",
                  minLength: 6,
                  example: "OldPass@123",
                  description: "Current admin password",
                },
                newPassword: {
                  type: "string",
                  format: "password",
                  minLength: 6,
                  example: "NewSecurePass@456",
                  description: "New desired admin password (min 6 characters)",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Password updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { type: "null", example: null },
                  message: { type: "string", example: "Password updated successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: {
          description: "Old password is incorrect or unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "Old password is incorrect", errors: [] },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
  "/admin/dashboard": {
    get: {
      tags: ["Admin - Dashboard & Analytics"],
      summary: "Get admin dashboard statistics",
      description: "Returns aggregated high-level business metrics including total users, total ventures, recent signups in the last 7 days, and monthly payment aggregates for the past 3 months.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
      ],
      responses: {
        200: {
          description: "Dashboard stats fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      users: {
                        type: "object",
                        properties: {
                          total: { type: "integer", example: 1250 },
                          last7Days: { type: "integer", example: 45 },
                        },
                      },
                      ventures: {
                        type: "object",
                        properties: {
                          total: { type: "integer", example: 85 },
                          last7Days: { type: "integer", example: 4 },
                        },
                      },
                      payments: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            month: { type: "string", example: "2026-08" },
                            totalAmount: { type: "number", example: 125000 },
                            totalTransactions: { type: "integer", example: 340 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
  "/admin/profile": {
    get: {
      tags: ["Admin - Profile"],
      summary: "Get admin profile",
      description: "Returns the authenticated administrator's profile information (password and sensitive tokens are excluded).",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
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
                  data: { $ref: "#/components/schemas/AdminProfile" },
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
  "/admin/editProfile": {
    patch: {
      tags: ["Admin - Profile"],
      summary: "Update admin profile",
      description: "Updates administrator profile details and optionally uploads a new avatar image to AWS S3. Content-Type must be `multipart/form-data`.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
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
                  description: "Admin avatar image file (JPG, PNG, WEBP, max 5MB)",
                },
                firstName: { type: "string", example: "Admin" },
                lastName: { type: "string", example: "Manager" },
                email: { type: "string", format: "email", example: "admin@fint.com" },
                phoneNumber: { type: "string", example: "9876543210" },
                pinCode: { type: "string", example: "560001" },
                bloodGroup: { type: "string", example: "O+" },
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
                  data: { $ref: "#/components/schemas/AdminProfile" },
                  message: { type: "string", example: "Profile updated successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
  "/admin/sendUserNotefication": {
    post: {
      tags: ["Admin - Notifications"],
      summary: "Send notification to users",
      description: "Triggers a push notification broadcast to users.",
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string", example: "System Maintenance Notice" },
                body: { type: "string", example: "Scheduled maintenance tonight at 12 AM." },
                userId: { type: "string", example: "660c1b2f4f1a2b0012345679" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Notification broadcast completed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/admin/sendVentureNotefication": {
    post: {
      tags: ["Admin - Notifications"],
      summary: "Send notification to ventures",
      description: "Triggers a push notification broadcast to partner ventures.",
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string", example: "New Feature for Ventures" },
                body: { type: "string", example: "Check out your new analytics dashboard." },
                ventureId: { type: "string", example: "660c1b2f4f1a2b0012345680" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Notification broadcast completed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/admin/payments": {
    get: {
      tags: ["Admin - Dashboard & Analytics"],
      summary: "Get payment transactions for admin",
      description: "Fetches general payment transactions with populated sender and receiver details, filtering by specific IST date, and provides a 7-day transaction trend aggregation.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
      ],
      parameters: [
        {
          name: "date",
          in: "query",
          required: false,
          description: "Filter payments by date in format `YYYY-MM-DD` (Defaults to today in IST)",
          schema: { type: "string", format: "date", example: "2026-09-30" },
        },
      ],
      responses: {
        200: {
          description: "Payments fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Payment" },
                  },
                  dailyTrends: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string", example: "2026-09-29" },
                        totalAmount: { type: "number", example: 4500 },
                        count: { type: "integer", example: 12 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
  "/admin/echange": {
    get: {
      tags: ["Admin - Dashboard & Analytics"],
      summary: "Get electronic change requests",
      description: "Fetches paginated list of E-Change (electronic change) payment requests with date filtering and search.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
      ],
      parameters: [
        {
          name: "date",
          in: "query",
          required: false,
          description: "Date filter in `YYYY-MM-DD` format (IST timezone)",
          schema: { type: "string", format: "date", example: "2026-09-30" },
        },
        {
          name: "page",
          in: "query",
          required: false,
          description: "Page number (default 1)",
          schema: { type: "integer", default: 1, minimum: 1 },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Number of records per page (default 10)",
          schema: { type: "integer", default: 10, minimum: 1 },
        },
        {
          name: "search",
          in: "query",
          required: false,
          description: "Search keyword matching sender or receiver",
          schema: { type: "string" },
        },
        {
          name: "type",
          in: "query",
          required: false,
          description: "Filter by status or fulfillment type",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "E-change requests fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  pagination: { $ref: "#/components/schemas/Pagination" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Payment" },
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
  "/admin/coupons": {
    get: {
      tags: ["Admin - Dashboard & Analytics"],
      summary: "Get coupons list for admin",
      description: "Returns paginated list of all created coupons with creator venture and user redemption details, along with status aggregations.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
      ],
      parameters: [
        {
          name: "page",
          in: "query",
          required: false,
          description: "Page number (default 1)",
          schema: { type: "integer", default: 1, minimum: 1 },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Records per page (default 10)",
          schema: { type: "integer", default: 10, minimum: 1 },
        },
      ],
      responses: {
        200: {
          description: "Coupons fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  pagination: { $ref: "#/components/schemas/Pagination" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Coupon" },
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
  "/admin/advertisements": {
    get: {
      tags: ["Admin - Dashboard & Analytics"],
      summary: "Get advertisements for admin",
      description: "Returns paginated list of advertisements, overall counts, status summary, and calculated total impression views.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
      ],
      parameters: [
        {
          name: "page",
          in: "query",
          required: false,
          description: "Page number (default 1)",
          schema: { type: "integer", default: 1, minimum: 1 },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Records per page (default 10)",
          schema: { type: "integer", default: 10, minimum: 1 },
        },
      ],
      responses: {
        200: {
          description: "Advertisements fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  pagination: { $ref: "#/components/schemas/Pagination" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Advertisement" },
                  },
                  statusSummary: { type: "object" },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
  "/admin/red-drop": {
    get: {
      tags: ["Admin - Dashboard & Analytics"],
      summary: "Get Red Drop blood donation requests",
      description: "Fetches blood donation requests for admin dashboard review.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
      ],
      responses: {
        200: {
          description: "Red Drop requests retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
  "/admin/pet-insurance": {
    get: {
      tags: ["Admin - Dashboard & Analytics"],
      summary: "Get pet insurance applications",
      description: "Fetches all registered pet insurance applications sorted by newest first.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
      ],
      responses: {
        200: {
          description: "Fetched all pet insurance requests",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/InsuranceApplication" },
                  },
                  message: { type: "string", example: "Fetched all pet insurance requests" },
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
  "/admin/users": {
    get: {
      tags: ["Admin - Dashboard & Analytics"],
      summary: "Get user and venture accounts list",
      description: "Returns paginated users and partner ventures with populated bank account information and optional date filtering.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
      ],
      parameters: [
        {
          name: "type",
          in: "query",
          required: false,
          description: "Filter by account type: `user` or `venture`",
          schema: { type: "string", enum: ["user", "venture"] },
        },
        {
          name: "date",
          in: "query",
          required: false,
          description: "Filter accounts created on specific date (`YYYY-MM-DD`)",
          schema: { type: "string", format: "date", example: "2026-09-30" },
        },
        {
          name: "page",
          in: "query",
          required: false,
          description: "Page number (default 1)",
          schema: { type: "integer", default: 1, minimum: 1 },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Page size (default 10)",
          schema: { type: "integer", default: 10, minimum: 1 },
        },
      ],
      responses: {
        200: {
          description: "Users and ventures list fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      users: {
                        type: "array",
                        items: { $ref: "#/components/schemas/UserProfile" },
                      },
                      ventures: {
                        type: "array",
                        items: { $ref: "#/components/schemas/VentureProfile" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
  "/admin/expense-tracker": {
    get: {
      tags: ["Admin - Dashboard & Analytics"],
      summary: "Get expense tracker data",
      description: "Fetches aggregated and paginated payment records associated with categorized expenses.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
      ],
      parameters: [
        {
          name: "startDate",
          in: "query",
          required: false,
          description: "Start date filter (e.g. `2026-09-01`)",
          schema: { type: "string", format: "date", example: "2026-09-01" },
        },
        {
          name: "endDate",
          in: "query",
          required: false,
          description: "End date filter (e.g. `2026-09-30`)",
          schema: { type: "string", format: "date", example: "2026-09-30" },
        },
        {
          name: "expenseId",
          in: "query",
          required: false,
          description: "Mongoose ObjectId of the expense category",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345689" },
        },
        {
          name: "userName",
          in: "query",
          required: false,
          description: "Filter by user name",
          schema: { type: "string" },
        },
        {
          name: "page",
          in: "query",
          required: false,
          description: "Page number (default 1)",
          schema: { type: "integer", default: 1 },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Records per page (default 10)",
          schema: { type: "integer", default: 10 },
        },
      ],
      responses: {
        200: {
          description: "Expense tracker data fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Payment" },
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
};
