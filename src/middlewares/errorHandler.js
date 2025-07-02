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
import { ApiError } from "../utils/ApiError.js"; // make sure path is correct

const errorHandler = (error, req, res, next) => {
  console.error("🔥 Unhandled error:", error);

  let status = 500;
  let data = {
    success: false,
    message: "Internal Server Error",
    data: null,
    errors: [],
  };

  // Joi validation error
  if (error instanceof Joi.ValidationError) {
    status = 400;
    data.message = error.message;
    data.errors = error.details.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return res.status(status).json(data);
  }

  // Custom ApiError (e.g., access token expired)
  if (error instanceof ApiError) {
    status = error.statusCode || 500;
    data.message = error.message;
    data.errors = error.errors || [];
    data.data = error.data || null;
    return res.status(status).json(data);
  }

  // Fallback for unknown error
  if (error.status) status = error.status;
  if (error.message) data.message = error.message;

  return res.status(status).json(data);
};

export default errorHandler;
