export const redDropDocs = {
  "/fint/redDrop/apply": {
    post: {
      tags: ["Red Drop - Blood Donation"],
      summary: "Apply for blood assistance",
      description: "Endpoint to submit an application or emergency request for blood donation through the Red Drop network.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                patientName: { type: "string", example: "Patient Name" },
                bloodGroup: {
                  type: "string",
                  enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
                  example: "O+",
                },
                unitsNeeded: { type: "integer", example: 2 },
                hospitalName: { type: "string", example: "City Hospital, Ward 3" },
                contactNumber: { type: "string", example: "9876543210" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Blood request application submitted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
};
