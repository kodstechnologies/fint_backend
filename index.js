import config from "./src/config/index.js";
const { PORT, CORS_ORIGIN, NODE_ENV } = config;

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import connectDB from "./src/database/index.js";
import mainRouter from "./src/routes/index.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

const app = express();

// ✅ MUST BE LAST
app.use(errorHandler);

/* ===============================
   BASIC MIDDLEWARE
================================ */
app.use(morgan("combined"));
const allowedOrigins = CORS_ORIGIN.split(",");
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
   ROUTES
================================ */
app.use("/", mainRouter);

/* ===============================
   TEST ROUTE
================================ */
app.get("/test", (req, res) => {
  res.send(`Backend is working!! URL : ${allowedOrigins}`);

});

/* ===============================
   ERROR HANDLER
================================ */
app.use(errorHandler);

/* ===============================
   SERVER
================================ */
if (NODE_ENV !== "vercel") {
  connectDB()
    .then(() => {
      app.listen(PORT || 8000, () => {
        console.log(`Server is running at port: ${PORT || 8080}`);
      });
    })
    .catch((err) => {
      console.error("MONGO DB connection failed !!!", err);
    });
}
