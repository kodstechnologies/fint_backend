// import Joi from "joi";

// const errorHandler = (error, req, res, next) => {
//   console.error("Unhandled error:", error);

//   let status = 500;
//   let data = {
//     message: "Internal Server Error",
//   };

//   if (error instanceof Joi.ValidationError) {
//     status = 400;
//     data.message = error.message;
//     console.error("Joi Validation Error:", error.details);
//     return res.status(status).json(data);
//   }

//   if (error.status) {
//     status = error.status;
//   }
//   if (error.message) {
//     data.message = error.message;
//   }

//   return res.status(status).json(data);
// };

// export default errorHandler;
import Joi from "joi";
import { ApiError } from "../utils/ApiError.js"; // adjust the path

const errorHandler = (error, req, res, next) => {
  console.error("🔥 Unhandled error:", error);

  let status = 500;
  let data = {
    success: false,
    message: "Internal Server Error",
    data: null,
    errors: [],
  };

  // ✅ Handle Joi validation errors
  if (error instanceof Joi.ValidationError) {
    status = 400;
    data.message = error.message;
    data.errors = error.details.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return res.status(status).json(data);
  }

  // ✅ Handle custom ApiError (like token expired, unauthorized, etc.)
  if (error instanceof ApiError) {
    status = error.statusCode || 500;
    data.message = error.message;
    data.errors = error.errors || [];
    data.data = error.data || null;
    return res.status(status).json(data);
  }

  // ✅ Fallback for unknown errors
  if (error.statusCode) status = error.statusCode;
  if (error.message) data.message = error.message;

  return res.status(status).json(data);
};

export default errorHandler;
