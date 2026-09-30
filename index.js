import config from "./src/config/index.js";
const { PORT, CORS_ORIGIN, NODE_ENV } = config;

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import connectDB from "./src/database/index.js";
import mainRouter from "./src/routes/index.js";
import { errorHandler } from "./src/middlewares/errorHandler.middleware.js";
import redis from "./src/config/redis.js";
import { setupSwagger } from "./src/config/swagger.js";

const app = express();



/* ===============================
   BASIC MIDDLEWARE
================================ */
app.use(morgan("combined"));
const allowedOrigins = [
  ...(CORS_ORIGIN ? CORS_ORIGIN.split(",") : []),
  `http://localhost:${PORT || 8000}`,
  "http://localhost:7000",
];
// console.log("🚀 Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server / Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
   SWAGGER DOCUMENTATION
================================ */
setupSwagger(app);

/* ===============================
   ROUTES
================================ */
app.use("/", mainRouter);

/* ===============================
   TEST ROUTE
================================ */
app.get("/test", (req, res) => {
  res.send(`Backend is working!! URL : ${allowedOrigins}`);

});

app.use(errorHandler);

// /* ===============================
//    SERVER
// ================================ */
// if (NODE_ENV !== "vercel") {
//   connectDB()
//     .then(() => {
//       app.listen(PORT || 8000, () => {
//         console.log(`Server is running at port: ${PORT || 8080}`);
//       });
//     })
//     .catch((err) => {
//       console.error("MONGO DB connection failed !!!", err);
//     });
// }



/* ===============================
   SERVER START (FIXED)
================================ */
const startServer = async () => {
  try {
    if (NODE_ENV !== "vercel") {
      await connectDB();
      console.log("✅ MongoDB connected");
    }

    await redis.connect();
    console.log("✅ Redis connected");

    app.listen(PORT || 8000, () => {
      console.log(`🚀 Server running on port ${PORT || 8000}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();