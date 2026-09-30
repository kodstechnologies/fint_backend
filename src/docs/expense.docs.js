export const expenseDocs = {
  "/fint/expense": {
    get: {
      tags: ["Expense Tracker"],
      summary: "Get all expense category names",
      description: "Returns all configured expense categories, ordered numerically. Accessible by authenticated users and admins.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
        { userCookieAuth: [] },
      ],
      responses: {
        200: {
          description: "Expenses fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Expense" },
                  },
                  message: { type: "string", example: "Expenses fetched successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
    post: {
      tags: ["Expense Tracker"],
      summary: "Add new expense category (Admin)",
      description: "Creates a new expense tracking category name. Maximum of 12 categories allowed on the platform.",
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
              required: ["name"],
              properties: {
                name: { type: "string", example: "Groceries & Food", description: "Unique category name" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Expense category added successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 201 },
                  data: { $ref: "#/components/schemas/Expense" },
                  message: { type: "string", example: "Expense name added successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        400: {
          description: "Validation error or category limit reached (max 12)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "Maximum 12 expense names allowed", errors: [] },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        409: {
          description: "Expense category already exists",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "Expense name already exists", errors: [] },
            },
          },
        },
      },
    },
  },
  "/fint/expense/{id}": {
    patch: {
      tags: ["Expense Tracker"],
      summary: "Edit expense category (Admin)",
      description: "Modifies an existing expense category name.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Expense category ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345689" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "Dining & Groceries" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Expense name updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { $ref: "#/components/schemas/Expense" },
                  message: { type: "string", example: "Expense name updated successfully" },
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        404: { $ref: "#/components/responses/NotFoundError" },
        409: {
          description: "Duplicate expense name",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, message: "Expense name already exists", errors: [] },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Expense Tracker"],
      summary: "Delete expense category (Admin)",
      description: "Deletes an expense category by ID.",
      security: [
        { bearerAuth: [] },
        { adminCookieAuth: [] },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Expense category ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345689" },
        },
      ],
      responses: {
        200: {
          description: "Expense deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: { type: "null", example: null },
                  message: { type: "string", example: "Expense deleted successfully" },
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
};
