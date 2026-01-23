import multer from "multer";
import { MAX_FILE_SIZE } from "./multer.middleware.js";

export const errorHandler = (err, req, res, next) => {
  // File size error
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
        data: null,
        errors: [],
      });
    }

    // File type error
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Only image files are allowed",
        data: null,
        errors: [],
      });
    }
  }

  // Other errors
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong",
      data: null,
      errors: [],
    });
  }

  next();
};
