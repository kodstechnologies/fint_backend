export const petInsuranceDocs = {
  "/fint/petInsurance/plans/{id}": {
    get: {
      tags: ["Pet Insurance"],
      summary: "Get specific insurance plan details",
      description: "Returns the terms, coverage, and premium details of an insurance plan by ID.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Insurance plan ID",
          schema: { type: "string", example: "plan_basic_canine_01" },
        },
      ],
      responses: {
        200: {
          description: "Plan details fetched",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/fint/petInsurance/apply": {
    post: {
      tags: ["Pet Insurance"],
      summary: "Apply for pet insurance policy",
      description: "Submits an insurance application for a pet, including owner details, pet details (breed, age, address), and unique pet nose biometric image via `multipart/form-data`.",
      security: [
        { bearerAuth: [] },
        { userCookieAuth: [] },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: [
                "name",
                "email",
                "password",
                "phoneNumber",
                "address",
                "parentAge",
                "pinCode",
                "petName",
                "petBreed",
                "petAge",
                "petAddress",
              ],
              properties: {
                petNoseImg: {
                  type: "string",
                  format: "binary",
                  description: "Pet nose print photo (biometric ID)",
                },
                name: { type: "string", minLength: 2, maxLength: 50, example: "Ananya Roy" },
                email: { type: "string", format: "email", example: "ananya@example.com" },
                password: { type: "string", format: "password", minLength: 6, example: "Secret@123" },
                phoneNumber: { type: "string", pattern: "^\\d{10}$", example: "9876543212" },
                address: { type: "string", example: "Flat 4B, Green Glen Layout, Bengaluru" },
                parentAge: { type: "integer", minimum: 18, maximum: 110, example: 29 },
                pinCode: { type: "string", pattern: "^\\d{6}$", example: "560103" },
                petName: { type: "string", example: "Bruno" },
                petBreed: { type: "string", example: "Golden Retriever" },
                petAge: { type: "number", minimum: 0, maximum: 50, example: 3 },
                petAddress: { type: "string", example: "Flat 4B, Green Glen Layout, Bengaluru" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Insurance application submitted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusCode: { type: "integer", example: 200 },
                  data: {
                    type: "object",
                    properties: {
                      savedUser: { $ref: "#/components/schemas/InsuranceApplication" },
                    },
                  },
                  message: { type: "string", example: "Insurance application submitted successfully" },
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
  "/fint/petInsurance/renew": {
    post: {
      tags: ["Pet Insurance"],
      summary: "Renew existing insurance policy",
      description: "Initiates renewal for an existing pet insurance policy.",
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                policyId: { type: "string", example: "pol_98234728" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Policy renewal initiated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/fint/petInsurance/applications/{id}/approve": {
    patch: {
      tags: ["Pet Insurance"],
      summary: "Approve pet insurance application (Admin)",
      description: "Approves a submitted pet insurance application by ID.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Insurance application ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345688" },
        },
      ],
      responses: {
        200: {
          description: "Application approved",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/fint/petInsurance/applications/{id}/reject": {
    delete: {
      tags: ["Pet Insurance"],
      summary: "Reject pet insurance application (Admin)",
      description: "Rejects and closes a pet insurance application by ID.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Insurance application ObjectId",
          schema: { type: "string", example: "660c1b2f4f1a2b0012345688" },
        },
      ],
      responses: {
        200: {
          description: "Application rejected",
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
