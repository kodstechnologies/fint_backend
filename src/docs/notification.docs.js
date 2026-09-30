export const notificationDocs = {
  "/fint/notefication/fint-user": {
    get: {
      tags: ["Notifications"],
      summary: "Get notifications for user",
      description: "Fetches recent in-app notifications (past 10 days) delivered to the authenticated user.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      responses: {
        200: {
          description: "Notifications fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Notification" },
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
  "/fint/notefication/fint-venture": {
    get: {
      tags: ["Notifications"],
      summary: "Get notifications for venture",
      description: "Fetches recent in-app push and transaction notifications for the authenticated venture.",
      security: [
        { bearerAuth: [] },
      ],
      responses: {
        200: {
          description: "Notifications fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Notification" },
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
