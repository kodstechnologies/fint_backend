export const bankDocs = {
  "/fint/bank": {
    get: {
      tags: ["Banks & Cards"],
      summary: "Get all banks and card types",
      description: "Returns lists of all supported banks and card payment network types (Visa, MasterCard, RuPay, AmericanExpress).",
      responses: {
        200: {
          description: "Banks and card types fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Banks and card types fetched successfully" },
                  banks: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Bank" },
                  },
                  cardTypes: {
                    type: "array",
                    items: { $ref: "#/components/schemas/CardType" },
                  },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Banks & Cards"],
      summary: "Create bank entry",
      description: "Registers a new bank with its official logo uploaded to AWS S3. Content-Type must be `multipart/form-data` with image key `img`.",
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["bankName", "img"],
              properties: {
                img: {
                  type: "string",
                  format: "binary",
                  description: "Bank logo image file",
                },
                bankName: { type: "string", example: "State Bank of India" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Bank created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 201 },
                  data: { $ref: "#/components/schemas/Bank" },
                  message: { type: "string", example: "Bank created successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        409: {
          description: "Bank already exists",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "Bank already exists", errors: [] },
            },
          },
        },
      },
    },
  },
  "/fint/bank/CardType": {
    post: {
      tags: ["Banks & Cards"],
      summary: "Create card network type",
      description: "Registers a card network type (Visa, MasterCard, RuPay, AmericanExpress) with logo image uploaded to AWS S3.",
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["name", "image"],
              properties: {
                image: {
                  type: "string",
                  format: "binary",
                  description: "Card type badge/logo file",
                },
                name: {
                  type: "string",
                  enum: ["Visa", "MasterCard", "RuPay", "AmericanExpress"],
                  example: "Visa",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Card type created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Card type created successfully" },
                  data: { $ref: "#/components/schemas/CardType" },
                },
              },
            },
          },
        },
        400: {
          description: "Missing required fields",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Card type name is required" },
                },
              },
            },
          },
        },
        409: {
          description: "Card type already exists",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Card type already exists" },
                },
              },
            },
          },
        },
      },
    },
  },
  "/fint/bank/{bankId}": {
    get: {
      tags: ["Banks & Cards"],
      summary: "Get bank by ID",
      description: "Retrieves details of a specific bank by its ObjectId.",
      parameters: [
        {
          name: "bankId",
          in: "path",
          required: true,
          description: "Bank ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345682" },
        },
      ],
      responses: {
        200: {
          description: "Bank fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { $ref: "#/components/schemas/Bank" },
                  message: { type: "string", example: "Bank fetched successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
    patch: {
      tags: ["Banks & Cards"],
      summary: "Update bank",
      description: "Updates an existing bank's name and/or logo image.",
      parameters: [
        {
          name: "bankId",
          in: "path",
          required: true,
          description: "Bank ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345682" },
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
                bankName: { type: "string", example: "State Bank of India Updated" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Bank updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { $ref: "#/components/schemas/Bank" },
                  message: { type: "string", example: "Bank updated successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
    delete: {
      tags: ["Banks & Cards"],
      summary: "Delete bank",
      description: "Deletes a bank record from the system.",
      parameters: [
        {
          name: "bankId",
          in: "path",
          required: true,
          description: "Bank ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345682" },
        },
      ],
      responses: {
        200: {
          description: "Bank deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { type: "object" },
                  message: { type: "string", example: "Bank deleted successfully" },
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
