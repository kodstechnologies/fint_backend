// src/middlewares/auth.middleware.js

import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// ✅ Verify Access Token from `Authorization: Bearer <token>`
export const userverifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    throw new ApiError(401, "Access token missing");
  }

  try {
    console.log(process.env.ACCESS_TOKEN_SECRET, "ACCESS_TOKEN_SECRET 🔑");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decoded",decoded);
    

    const user = await User.findById(decoded._id).select("-refreshToken");
    console.log("user",user);
    
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    throw new ApiError(401, "Invalid or expired access token");
  }
});
