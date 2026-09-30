export const historyDocs = {
  "/fint/history/userTransation": {
    get: {
      tags: ["History"],
      summary: "Get user transaction history",
      description: "Returns paginated list of incoming (credited) and outgoing (debited) payment transactions for the authenticated user, with optional date (`YYYY-MM-DD`), month (`Month-YYYY`), or recipient name filters.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
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
          description: "Items per page (default 10)",
          schema: { type: "integer", default: 10, minimum: 1 },
        },
        {
          name: "date",
          in: "query",
          required: false,
          description: "Filter transactions for specific date (`YYYY-MM-DD`)",
          schema: { type: "string", format: "date", example: "2026-09-30" },
        },
        {
          name: "month",
          in: "query",
          required: false,
          description: "Filter by month and year format: `Month-YYYY` (e.g. `January-2026`)",
          schema: { type: "string", example: "September-2026" },
        },
        {
          name: "name",
          in: "query",
          required: false,
          description: "Filter by sender or receiver name",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Transactions retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  pagination: { $ref: "#/components/schemas/Pagination" },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["credited", "debited"], example: "debited" },
                        amount: { type: "number", example: 250 },
                        paymentMethod: { type: "string", example: "phone" },
                        paymentStatus: { type: "string", example: "success" },
                        fulfillmentStatus: { type: "string", example: "completed" },
                        from: { type: "string", example: "You" },
                        to: { type: "string", example: "Apex Ventures" },
                        date: { type: "string", format: "date-time" },
                      },
                    },
                  },
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
  "/fint/history/ventureTransation": {
    get: {
      tags: ["History"],
      summary: "Get venture transaction history",
      description: "Returns paginated list of received payments and settlements for the authenticated partner venture.",
      security: [
        { bearerAuth: [] },
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
          description: "Items per page (default 10)",
          schema: { type: "integer", default: 10, minimum: 1 },
        },
        {
          name: "date",
          in: "query",
          required: false,
          description: "Filter by specific date (`YYYY-MM-DD`)",
          schema: { type: "string", format: "date", example: "2026-09-30" },
        },
        {
          name: "month",
          in: "query",
          required: false,
          description: "Filter by month: `Month-YYYY` (e.g. `September-2026`)",
          schema: { type: "string", example: "September-2026" },
        },
        {
          name: "name",
          in: "query",
          required: false,
          description: "Filter by customer/sender name",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Venture transactions retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  pagination: { $ref: "#/components/schemas/Pagination" },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["credited", "debited"], example: "credited" },
                        amount: { type: "number", example: 500 },
                        paymentMethod: { type: "string", example: "eChanges" },
                        paymentStatus: { type: "string", example: "success" },
                        fulfillmentStatus: { type: "string", example: "completed" },
                        from: { type: "string", example: "Rahul Sharma" },
                        to: { type: "string", example: "You" },
                        date: { type: "string", format: "date-time" },
                      },
                    },
                  },
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
};
