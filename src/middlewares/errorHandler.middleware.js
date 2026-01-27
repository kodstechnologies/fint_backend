import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
    console.error("❌ ERROR:", err);

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                success: false,
                message: "File size must be less than 5 MB",
                data: null,
                errors: [],
            });
        }
    }

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
        });
    }

    return res.status(500).json({
        success: false,
        message: err.message || "Something went wrong",
        data: null,
        errors: [],
    });
};
