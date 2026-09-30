export const advDocs = {
  "/fint/adv/add": {
    post: {
      tags: ["Advertisements"],
      summary: "Create advertisement (Venture)",
      description: "Creates a new venture promotional advertisement with title, description, target view count, and uploaded banner image. Content-Type must be `multipart/form-data`.",
      security: [
        { bearerAuth: [] },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["title", "description"],
              properties: {
                img: {
                  type: "string",
                  format: "binary",
                  description: "Banner image file (JPG, PNG, WEBP)",
                },
                title: { type: "string", example: "Mega Discount Season" },
                description: { type: "string", example: "Visit our store today and save up to 40%." },
                count: { type: "integer", example: 500, description: "Maximum target impressions before auto-expiry" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Advertisement created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 201 },
                  data: { $ref: "#/components/schemas/Advertisement" },
                  message: { type: "string", example: "Advertisement created successfully." },
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
  "/fint/adv/{id}": {
    patch: {
      tags: ["Advertisements"],
      summary: "Update advertisement (Venture)",
      description: "Updates an existing advertisement owned by the authenticated venture. Allows updating title, description, impression target count, and banner image.",
      security: [
        { bearerAuth: [] },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Mongoose ObjectId of the advertisement",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345687" },
        },
      ],
      requestBody: {
        required: false,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                img: {
                  type: "string",
                  format: "binary",
                  description: "New banner image (optional)",
                },
                title: { type: "string", example: "Updated Super Sale Promo" },
                description: { type: "string", example: "Enjoy extended weekend discounts." },
                count: { type: "integer", example: 1000 },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Advertisement updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { $ref: "#/components/schemas/Advertisement" },
                  message: { type: "string", example: "Advertisement updated successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
    delete: {
      tags: ["Advertisements"],
      summary: "Delete advertisement (Venture)",
      description: "Deletes or soft-deletes an advertisement belonging to the authenticated venture.",
      security: [
        { bearerAuth: [] },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ObjectId of the advertisement",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345687" },
        },
      ],
      responses: {
        200: {
          description: "Advertisement deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { type: "null", example: null },
                  message: { type: "string", example: "Advertisement deleted successfully" },
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
  "/fint/adv": {
    get: {
      tags: ["Advertisements"],
      summary: "Get all advertisements for logged-in venture",
      description: "Returns all advertisements created by the authenticated venture.",
      security: [
        { bearerAuth: [] },
      ],
      responses: {
        200: {
          description: "Advertisements fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Advertisement" },
                  },
                  message: { type: "string", example: "Advertisements fetched successfully" },
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
  "/fint/adv/single-venture-analytics": {
    get: {
      tags: ["Advertisements"],
      summary: "Get single venture advertisement analytics",
      description: "Returns performance analytics including 30-day daily view trends and impression statistics for the venture's advertisements.",
      security: [
        { bearerAuth: [] },
      ],
      responses: {
        200: {
          description: "Venture advertisement analytics fetched",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  total: { type: "integer", example: 12 },
                  data: {
                    type: "array",
                    items: {
                      allOf: [
                        { $ref: "#/components/schemas/Advertisement" },
                        {
                          type: "object",
                          properties: {
                            dailyViews: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  date: { type: "string", example: "2026-09-28" },
                                  views: { type: "integer", example: 45 },
                                },
                              },
                            },
                          },
                        },
                      ],
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
  "/fint/adv/single-venture-details": {
    get: {
      tags: ["Advertisements"],
      summary: "Get venture advertisement details",
      description: "Returns comprehensive details for a specific advertisement by ID query parameter.",
      security: [
        { bearerAuth: [] },
      ],
      parameters: [
        {
          name: "id",
          in: "query",
          required: true,
          description: "Advertisement ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345687" },
        },
      ],
      responses: {
        200: {
          description: "Advertisement details fetched",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { $ref: "#/components/schemas/Advertisement" },
                  message: { type: "string", example: "Advertisement details fetched" },
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
  "/fint/adv/revoke/{id}": {
    post: {
      tags: ["Advertisements"],
      summary: "Revoke advertisement (Venture)",
      description: "Marks an advertisement as revoked, stopping it from being served to users.",
      security: [
        { bearerAuth: [] },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Advertisement ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345687" },
        },
      ],
      responses: {
        200: {
          description: "Advertisement revoked successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { $ref: "#/components/schemas/Advertisement" },
                  message: { type: "string", example: "Advertisement revoked successfully" },
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
  "/fint/adv/available": {
    get: {
      tags: ["Advertisements"],
      summary: "Get available active advertisements",
      description: "Fetches all public active advertisements currently eligible for display.",
      responses: {
        200: {
          description: "Active advertisements fetched",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Advertisement" },
                  },
                  message: { type: "string", example: "Active advertisements fetched successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
      },
    },
  },
  "/fint/adv/deleted": {
    get: {
      tags: ["Advertisements"],
      summary: "Get deleted advertisements",
      description: "Fetches all advertisements with deleted status.",
      responses: {
        200: {
          description: "Deleted advertisements fetched",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Advertisement" },
                  },
                  message: { type: "string", example: "Deleted advertisements fetched" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
      },
    },
  },
  "/fint/adv/expired": {
    get: {
      tags: ["Advertisements"],
      summary: "Get expired advertisements",
      description: "Fetches all advertisements that have exceeded their impression count or expiry date.",
      responses: {
        200: {
          description: "Expired advertisements fetched",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Advertisement" },
                  },
                  message: { type: "string", example: "Expired advertisements fetched" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
      },
    },
  },
  "/fint/adv/analytics": {
    get: {
      tags: ["Advertisements"],
      summary: "Get overall advertisement analytics",
      description: "Returns aggregate performance data across all promotional advertisements.",
      responses: {
        200: {
          description: "Analytics fetched",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { type: "object" },
                  message: { type: "string", example: "Analytics fetched successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
      },
    },
  },
  "/fint/adv/display": {
    get: {
      tags: ["Advertisements"],
      summary: "Display targeted advertisement for user",
      description: "Delivers an unseen active advertisement to the authenticated user using Redis set tracking and increments the impression count.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      responses: {
        200: {
          description: "Advertisement retrieved for display",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "object",
                    properties: {
                      _id: { type: "string", example: "660c1b2f4f1a2b0012345687" },
                      title: { type: "string", example: "Grow Your Savings With Fint" },
                      description: { type: "string", example: "Get high yield returns." },
                      img: { type: "string", example: "https://s3.amazonaws.com/bucket/ads/banner.jpg" },
                    },
                  },
                  message: { type: "string", example: "Advertisement fetched successfully" },
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
};
