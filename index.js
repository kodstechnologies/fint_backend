// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import connectDB from './src/database/index.js';
import mainRouter from './src/routes/index.js'; // Centralized router
import errorHandler from './src/middlewares/errorHandler.js';

// import connectDB from './src/database/index.js';
const app = express();

// Middleware setup
app.use(morgan('combined'));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
// const allowedOrigin = process.env.CORS_ORIGIN;

// app.use(
//   cors({
//     origin: allowedOrigin,        // ✅ MUST be explicit
//     credentials: true,            // ✅ Allow cookies
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Debug middleware for request body
app.use((req, res, next) => {
  console.log('Request Body:', req.body);
  next();
});

// Routes
app.use('/', mainRouter);

// Test route
app.get('/test', (req, res) => {
  res.json({ message: '2-7 Test endpoint is working!' });
});

// Error handler middleware
app.use(errorHandler);

// Connect to the database and start the server
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running at port: ${process.env.PORT ?? 8000}`);
    });
  })
  .catch((err) => {
    console.log('MONGO DB connection failed !!!', err);
  });
