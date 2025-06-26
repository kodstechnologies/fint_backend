import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../../models/admin.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

// Joi validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).required(),
});

// Admin login controller
export const login_Admin = asyncHandler(async (req, res) => {
  // Validate input
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  const { email, password } = req.body;

  // Check admin existence
  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Set cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // Respond with success
  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        user: {
          id: admin._id,
          email: admin.email,
          username: admin.username || admin.name || admin.email,
        },
      }, "Login successful")
    );
});


