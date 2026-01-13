// // Load environment variables
// import dotenv from 'dotenv';
// dotenv.config({ path: './.env' });

// import express from 'express';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import morgan from 'morgan';
// import connectDB from './src/database/index.js';
// import mainRouter from './src/routes/index.js'; // Centralized router
// import errorHandler from './src/middlewares/errorHandler.js';
// import { notefication } from './src/controllers/notefication/notefication.controller.js';

// // import connectDB from './src/database/index.js';
// const app = express();

// // Middleware setup
// app.use(morgan('combined'));
// // app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
// const allowedOrigin = process.env.CORS_ORIGIN;
// console.log("🚀 ~ allowedOrigin:", allowedOrigin)
// app.use(
//   cors({
//     origin: allowedOrigin === "*" ? true : allowedOrigin,
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Debug middleware for request body
// app.use((req, res, next) => {
//   console.log('Request Body:', req.body);
//   next();
// });

// // Routes
// app.use('/', mainRouter);



// // Test route

// app.get("/test", (req, res) => {
//   res.send(`Backend is working!! 19-12-2025 , URL : ${allowedOrigin}`);
// });
// // Error handler middleware
// app.use(errorHandler);

// if (process.env.NODE_ENV !== 'vercel') {
//   connectDB()
//     .then(() => {
//       app.listen(process.env.PORT || 4000, () => {
//         console.log(`Server is running at port: ${process.env.PORT ?? 8000}`);
//       });
//     })
//     .catch((err) => {
//       console.error('MONGO DB connection failed !!!', err);
//     });
// }


// Load environment variables
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import connectDB from "./src/database/index.js";
import mainRouter from "./src/routes/index.js";
import errorHandler from "./src/middlewares/errorHandler.js";

const app = express();

/* ===============================
   BASIC MIDDLEWARE
================================ */
app.use(morgan("combined"));

const allowedOrigin = process.env.CORS_ORIGIN;
console.log("🚀 ~ allowedOrigin:", allowedOrigin);

app.use(
  cors({
    origin: allowedOrigin === "*" ? true : allowedOrigin,
    credentials: true,
  })
);

app.use(cookieParser());

/* ===============================
   🔥 SMART BODY PARSER (FIX)
================================ */
app.use((req, res, next) => {
  const contentType = req.headers["content-type"] || "";

  // ⛔ Skip JSON parsing for file uploads
  if (contentType.includes("multipart/form-data")) {
    return next();
  }

  express.json({ limit: "10mb" })(req, res, next);
});

app.use(express.urlencoded({ limit: "10mb", extended: true }));

/* ===============================
   ROUTES
================================ */
app.use("/", mainRouter);

/* ===============================
   TEST ROUTE
================================ */
app.get("/test", (req, res) => {
  res.send(`Backend is working!! URL : ${allowedOrigin}`);
});

/* ===============================
   ERROR HANDLER
================================ */
app.use(errorHandler);

/* ===============================
   SERVER
================================ */
if (process.env.NODE_ENV !== "vercel") {
  connectDB()
    .then(() => {
      app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT || 8000}`);
      });
    })
    .catch((err) => {
      console.error("MONGO DB connection failed !!!", err);
    });
}
