import multer from "multer";

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

    return res.status(500).json({
        success: false,
        message: err.message || "Something went wrong",
        data: null,
        errors: [],
    });
};
