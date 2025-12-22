import { ApiError } from "../utils/ApiError.js";

export const validateBody = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            }));

            return next(new ApiError(400, "Validation failed", errors));
        }

        req.body = value; // sanitized body
        next();
    };
};
