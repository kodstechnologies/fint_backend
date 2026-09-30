export const couponDocs = {
  "/fint/coupons/display-all-coupons": {
    get: {
      tags: ["Coupons"],
      summary: "Display all coupons (Public)",
      description: "Returns all active, unexpired coupons available on the platform.",
      responses: {
        200: {
          description: "All coupons fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Coupon" },
                  },
                  message: { type: "string", example: "Coupons fetched successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
      },
    },
  },
  "/fint/coupons/venture-coupons": {
    get: {
      tags: ["Coupons"],
      summary: "Get coupons created by logged-in venture",
      description: "Returns all coupons created by the authenticated venture.",
      security: [
        { bearerAuth: [] },
      ],
      responses: {
        200: {
          description: "Venture coupons fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Coupon" },
                  },
                  message: { type: "string", example: "Coupons fetched successfully" },
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
  "/fint/coupons/venture-coupons-analytics": {
    get: {
      tags: ["Coupons"],
      summary: "Get venture coupons analytics",
      description: "Provides performance metrics, impression numbers, and usage statistics for coupons belonging to the authenticated venture.",
      security: [
        { bearerAuth: [] },
      ],
      responses: {
        200: {
          description: "Coupon analytics fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { type: "object" },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
  "/fint/coupons/create": {
    post: {
      tags: ["Coupons"],
      summary: "Create new coupon (Venture)",
      description: "Creates a new discount or offer coupon with details, terms, expiration date, and optional banner image. Content-Type must be `multipart/form-data` with image key `img`.",
      security: [
        { bearerAuth: [] },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: [
                "couponTitle",
                "offerTitle",
                "offerDescription",
                "termsAndConditions",
                "expiryDate",
              ],
              properties: {
                img: {
                  type: "string",
                  format: "binary",
                  description: "Coupon promotional image file",
                },
                couponTitle: { type: "string", example: "Flat 25% Off" },
                offerTitle: { type: "string", example: "Weekend Special Deal" },
                offerDescription: { type: "string", example: "Get 25% discount on billing above ₹1000" },
                termsAndConditions: { type: "string", example: "Valid once per customer. Cannot be combined." },
                expiryDate: { type: "string", format: "date-time", example: "2026-12-31T23:59:59.000Z" },
                offerDetails: { type: "string", example: "Valid across all participating stores." },
                aboutCompany: { type: "string", example: "Apex Retail Pvt Ltd" },
                claimPercentage: { type: "number", minimum: 0, maximum: 100, example: 25 },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Coupon created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 201 },
                  data: { $ref: "#/components/schemas/Coupon" },
                  message: { type: "string", example: "Coupon created successfully" },
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
  "/fint/coupons/edit/{id}": {
    patch: {
      tags: ["Coupons"],
      summary: "Edit coupon (Venture)",
      description: "Updates an existing coupon owned by the authenticated venture.",
      security: [
        { bearerAuth: [] },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Coupon ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345686" },
        },
      ],
      requestBody: {
        required: false,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                img: { type: "string", format: "binary" },
                couponTitle: { type: "string", example: "Updated Coupon Title" },
                offerTitle: { type: "string", example: "Updated Offer" },
                offerDescription: { type: "string", example: "Updated Description" },
                termsAndConditions: { type: "string", example: "Updated Terms" },
                expiryDate: { type: "string", format: "date-time", example: "2026-12-31T23:59:59.000Z" },
                offerDetails: { type: "string" },
                aboutCompany: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Coupon updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { $ref: "#/components/schemas/Coupon" },
                  message: { type: "string", example: "Coupon updated successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
  "/fint/coupons/delete/{id}": {
    delete: {
      tags: ["Coupons"],
      summary: "Delete coupon (Venture)",
      description: "Deletes a coupon belonging to the authenticated venture.",
      security: [
        { bearerAuth: [] },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Coupon ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345686" },
        },
      ],
      responses: {
        200: {
          description: "Coupon deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { type: "null", example: null },
                  message: { type: "string", example: "Coupon deleted successfully" },
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
  "/fint/coupons/deleted-coupons": {
    get: {
      tags: ["Coupons"],
      summary: "Get deleted coupons (Venture)",
      description: "Returns deleted coupons list for the authenticated venture.",
      security: [
        { bearerAuth: [] },
      ],
      responses: {
        200: {
          description: "Deleted coupons fetched",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Coupon" },
                  },
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
  "/fint/coupons/expired-coupons/{id}": {
    get: {
      tags: ["Coupons"],
      summary: "Get expired coupons for a venture by ID",
      description: "Fetches expired coupons for a specific venture ID.",
      security: [
        { bearerAuth: [] },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Venture ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345680" },
        },
      ],
      responses: {
        200: {
          description: "Expired coupons fetched",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Coupon" },
                  },
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
  "/fint/coupons/revoke/{couponId}": {
    post: {
      tags: ["Coupons"],
      summary: "Revoke coupon (Venture)",
      description: "Revokes a coupon so that users can no longer redeem it.",
      security: [
        { bearerAuth: [] },
      ],
      parameters: [
        {
          name: "couponId",
          in: "path",
          required: true,
          description: "Coupon ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345686" },
        },
      ],
      responses: {
        200: {
          description: "Coupon revoked successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Coupon revoked successfully" },
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
  "/fint/coupons/approve-coupon-details": {
    post: {
      tags: ["Coupons"],
      summary: "Preview coupon and user details for redemption",
      description: "Allows a venture to preview user details and coupon details before approving redemption at checkout.",
      security: [
        { bearerAuth: [] },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["userId", "couponId"],
              properties: {
                userId: { type: "string", example: "660c1b2f4f1a2b0012345679" },
                couponId: { type: "string", example: "660c1b2f4f1a2b0012345686" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Details fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/UserProfile" },
                      coupon: { $ref: "#/components/schemas/Coupon" },
                    },
                  },
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
  "/fint/coupons/approve": {
    post: {
      tags: ["Coupons"],
      summary: "Approve or reject coupon redemption (Venture)",
      description: "Approves or rejects a customer's coupon redemption at checkout. If approved, adds the user to `usedUsers` to prevent re-use.",
      security: [
        { bearerAuth: [] },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["approve", "userId", "couponId"],
              properties: {
                approve: { type: "boolean", example: true },
                userId: { type: "string", example: "660c1b2f4f1a2b0012345679" },
                couponId: { type: "string", example: "660c1b2f4f1a2b0012345686" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Coupon redemption decision processed",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Coupon approved successfully" },
                },
              },
            },
          },
        },
        400: {
          description: "Coupon already used or expired",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "Coupon already used by this user", errors: [] },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
  "/fint/coupons/active-coupons": {
    get: {
      tags: ["Coupons"],
      summary: "Get active coupons for user",
      description: "Returns active, non-expired coupons available for the logged-in user to claim.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      responses: {
        200: {
          description: "Active coupons fetched",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Coupon" },
                  },
                  message: { type: "string", example: "Active coupons fetched" },
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
  "/fint/coupons/expired-coupons": {
    get: {
      tags: ["Coupons"],
      summary: "Get expired coupons for user",
      description: "Returns expired coupons for user history.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      responses: {
        200: {
          description: "Expired coupons fetched",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Coupon" },
                  },
                  message: { type: "string", example: "Expired coupons fetched" },
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
  "/fint/coupons/display-coupons-details/{id}": {
    get: {
      tags: ["Coupons"],
      summary: "Get coupon details by ID",
      description: "Returns single coupon details for user view and increments the view counter.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Coupon ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345686" },
        },
      ],
      responses: {
        200: {
          description: "Coupon details fetched",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { $ref: "#/components/schemas/Coupon" },
                  message: { type: "string", example: "Coupon details fetched" },
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
  "/fint/coupons/user-display-all-coupons": {
    get: {
      tags: ["Coupons"],
      summary: "Display all coupons for user",
      description: "Returns all eligible platform coupons for authenticated user.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      responses: {
        200: {
          description: "Coupons list fetched",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Coupon" },
                  },
                  message: { type: "string", example: "Coupons fetched successfully" },
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
  "/fint/coupons/reject/{id}": {
    delete: {
      tags: ["Coupons"],
      summary: "Reject coupon by ID",
      description: "Marks a coupon application or request as rejected.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Coupon ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345686" },
        },
      ],
      responses: {
        200: {
          description: "Coupon rejected successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { type: "null", example: null },
                  message: { type: "string", example: "Coupon rejected" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
};
