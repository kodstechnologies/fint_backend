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

const resetPasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required().label("Old Password"),
  newPassword: Joi.string().min(6).required().label("New Password"),
});

// Admin login controller
export const login_Admin = asyncHandler(async (req, res) => {
  // Validate input
  // console.log("Login request body:", req.body);

  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    throw new ApiError(400, 'Validation failed', errors);
  }

  const { email, password } = req.body;

  // Find admin by email
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new ApiError(404, 'Admin not found');
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate tokens using model methods
  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();

  // ✅ Save refreshToken in DB
  admin.refreshToken = refreshToken;
  await admin.save();

  // Set HTTP-only cookies
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    maxAge: 1 * 60 * 60 * 1000, // 1 hour
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Success response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: admin._id,
          email: admin.email,
          name: `${admin.firstName} ${admin.lastName}`,
          accessToken,
          refreshToken,
        },
      },
      'Login successful'
    )
  );
});


export const forgotPasswordAdmin = () => {

}
export const resetPasswordAdmin = asyncHandler(async (req, res) => {
  // Validate request body
  const { error } = resetPasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  const { oldPassword, newPassword } = req.body;

  const adminId = req.admin?._id;

  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const isMatch = await bcrypt.compare(oldPassword, admin.password);
  if (!isMatch) {
    throw new ApiError(401, "Old password is incorrect");
  }

  admin.password = newPassword; // Will trigger pre-save hook to hash
  await admin.save();

  return res.status(200).json(
    new ApiResponse(200, null, "Password updated successfully")
  );
});
export const refreshAccessTokenAdmin = asyncHandler(async (req, res) => {
  const admin = req.admin;

  if (!admin) {
    throw new ApiError(401, "Unauthorized");
  }

  const newAccessToken = admin.generateAccessToken();

  // Set new access token as cookie
  res.cookie('access_token', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    maxAge: 1 * 60 * 60 * 1000, // 1 hour
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken: newAccessToken,
        user: {
          id: admin._id,
          email: admin.email,
          name: `${admin.firstName} ${admin.lastName}`
        }
      },
      "New access token issued"
    )
  );
});

export const logoutAdmin = asyncHandler(async (req, res) => {
  const token = req.cookies?.refresh_token || req.header("x-refresh-token");

  if (!token) {
    throw new ApiError(400, "No refresh token provided");
  }

  try {
    // Decode token to find admin
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const admin = await Admin.findById(decoded._id);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    // Clear the refreshToken in DB
    admin.refreshToken = null;
    await admin.save();

    // Clear cookies
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    });

    return res.status(200).json(
      new ApiResponse(200, null, "Logout successful")
    );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});
