export const systemDocs = {
  "/test": {
    get: {
      tags: ["System & Health"],
      summary: "Health and backend connectivity test",
      description: "Quick health-check endpoint to verify that the Express server is up and running and responding to requests.",
      responses: {
        200: {
          description: "Backend server is healthy and running",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                example: "Backend is working!! URL : http://localhost:3000,http://localhost:5173",
              },
            },
          },
        },
      },
    },
  },
};
