import multer from "multer";
import { MAX_FILE_SIZE } from "./upload.js";

export const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            const sizeInMB = MAX_FILE_SIZE / (1024 * 1024);

            return res.status(400).json({
                success: false,
                message: `File size must not be more than ${sizeInMB} MB`,
            });
        }

        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    next();
};
