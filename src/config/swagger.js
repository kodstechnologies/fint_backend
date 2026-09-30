import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import config from "./index.js";

import { components } from "../docs/components.js";
import { systemDocs } from "../docs/system.docs.js";
import { adminDocs } from "../docs/admin.docs.js";
import { userAuthDocs } from "../docs/userAuth.docs.js";
import { ventureAuthDocs } from "../docs/ventureAuth.docs.js";
import { paymentDocs } from "../docs/payment.docs.js";
import { advDocs } from "../docs/adv.docs.js";
import { couponDocs } from "../docs/coupons.docs.js";
import { petInsuranceDocs } from "../docs/petInsurance.docs.js";
import { historyDocs } from "../docs/history.docs.js";
import { notificationDocs } from "../docs/notification.docs.js";
import { expenseDocs } from "../docs/expense.docs.js";
import { bankDocs } from "../docs/bank.docs.js";
import { redDropDocs } from "../docs/redDrop.docs.js";

const { PORT = 8000 } = config;

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Fint Backend API",
    version: "1.0.0",
    description:
      "Comprehensive, production-ready OpenAPI 3.0 documentation for the entire Fint backend platform. Covers Admin operations, User and Venture authentication, Bank accounts, Payment processing (PhonePe, Razorpay & Webhooks), Advertisements, Coupons, Pet Insurance, Expense Tracking, and Push Notifications.",
    license: {
      name: "ISC",
    },
    contact: {
      name: "Fint Technologies Support",
      email: "support@fint.com",
    },
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: "Local Development Server",
    },
    {
      url: "http://localhost:7000",
      description: "Alternative Local Port 7000",
    },
    {
      url: "https://api.fint.com",
      description: "Production Server",
    },
  ],
  tags: [
    { name: "System & Health", description: "Health check and server status endpoints" },
    { name: "Admin - Authentication", description: "Administrator login, password management, and JWT session handling" },
    { name: "Admin - Dashboard & Analytics", description: "High-level metrics, transactions, coupon redemptions, and user reports" },
    { name: "Admin - Profile", description: "Administrator profile details and avatar management" },
    { name: "Admin - Notifications", description: "Administrator push notification broadcasts" },
    { name: "User - Authentication", description: "Fint customer onboarding, OTP verification, JWT sessions, and profile" },
    { name: "User - Bank Accounts", description: "Bank accounts linking, retrieval, updates, and deletion for users" },
    { name: "Venture - Authentication", description: "Merchant/Venture partner signup, OTP authentication, and profile" },
    { name: "Venture - Bank Accounts", description: "Merchant bank account registration and management" },
    { name: "Payments", description: "Razorpay payment orders, QR code payments, P2P phone/bank transfers, wallet balance" },
    { name: "Payments - Webhooks", description: "Razorpay automated payment event webhooks" },
    { name: "Advertisements", description: "Promotional campaigns, impression metrics, active ads, and user display rotation" },
    { name: "Coupons", description: "Discount offers creation, venture approval, customer redemption, and analytics" },
    { name: "Pet Insurance", description: "Pet insurance plans, applications with biometric nose print upload, and renewals" },
    { name: "History", description: "User and venture transaction logs with date and month filtering" },
    { name: "Notifications", description: "In-app notifications history for users and ventures" },
    { name: "Expense Tracker", description: "Expense category definitions and expenditure tracking" },
    { name: "Banks & Cards", description: "Supported banking institutions and card network badges" },
    { name: "Red Drop - Blood Donation", description: "Red Drop community blood donor requests" },
  ],
  components,
  paths: {
    ...systemDocs,
    ...adminDocs,
    ...userAuthDocs,
    ...ventureAuthDocs,
    ...paymentDocs,
    ...advDocs,
    ...couponDocs,
    ...petInsuranceDocs,
    ...historyDocs,
    ...notificationDocs,
    ...expenseDocs,
    ...bankDocs,
    ...redDropDocs,
  },
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ["./src/routes/**/*.js"], // Also scan for any future route JSDoc annotations
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const setupSwagger = (app) => {
  // Expose Swagger UI at /api-docs
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Fint API Documentation",
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );

  // Expose OpenAPI specification in JSON format at /api-docs.json
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(`📄 Swagger UI available at: http://localhost:${PORT}/api-docs`);
  console.log(`📄 OpenAPI JSON available at: http://localhost:${PORT}/api-docs.json`);
};

export default setupSwagger;
