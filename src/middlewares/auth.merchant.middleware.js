import jwt from 'jsonwebtoken';
import { Merchant } from '../models/merchant.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// ✅ Verify Access Token from `Authorization: Bearer <token>`
export const merchantverifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    throw new ApiError(401, "Access token missing");
  }

  try {
    console.log(process.env.ACCESS_TOKEN_SECRET, "ACCESS_TOKEN_SECRET 🔑");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decoded",decoded);
    

    const merchant = await Merchant.findById(decoded._id).select("-refreshToken");
    console.log("merchant",merchant);
    
    if (!merchant) {
      throw new ApiError(404, "Merchant not found");
    }

    req.merchant = merchant;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    throw new ApiError(401, "Invalid or expired access token");
  }
});


export const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken =
  req.cookies?.refreshToken || req.header("x-refresh-token");
  console.log("🚀 ~ verifyRefreshToken ~ refreshToken:", refreshToken)

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log("🚀 ~ verifyRefreshToken ~ decoded:", decoded)
    const merchant = await Merchant.findById(decoded._id);
    console.log("🚀 ~ verifyRefreshToken ~ merchant:", merchant)

    if (!merchant || merchant.refreshToken !== refreshToken) {
      throw new ApiError(403, "Invalid refresh token");
    }

    req.merchant = merchant; // attach merchant for next handler
    next();
  } catch (err) {
    throw new ApiError(401, "Refresh token expired or invalid");
  }
});
