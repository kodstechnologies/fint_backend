import jwt from 'jsonwebtoken';
import { Admin } from '../models/admin.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// ✅ Verify Access Token from `Authorization: Bearer <token>`
export const adminverifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    throw new ApiError(401, "Access token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("✅ Decoded JWT:", decoded);

    const admin = await Admin.findById(decoded._id).select("-refreshToken");
    console.log("✅ Authenticated Admin:", admin);

    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    req.admin = admin; // attach to request
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    throw new ApiError(401, "Invalid or expired access token");
  }
});


// export const verifyAdminRefreshToken = asyncHandler(async (req, res, next) => {
//   const refreshToken =
//   req.cookies?.refreshToken || req.header("x-refresh-token");
//   console.log("🚀 ~ verifyRefreshToken ~ refreshToken:", refreshToken)

//   if (!refreshToken) {
//     throw new ApiError(401, "Refresh token missing");
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
//     console.log("🚀 ~ verifyRefreshToken ~ decoded:", decoded)
//     const admin = await Admin.findById(decoded._id);
//     console.log("🚀 ~ verifyRefreshToken ~ admin:", admin)

//     if (!admin || admin.refreshToken !== refreshToken) {
//       throw new ApiError(403, "Invalid refresh token");
//     }

//     req.admin = admin; // attach admin for next handler
//     next();
//   } catch (err) {
//     throw new ApiError(401, "Refresh token expired or invalid");
//   }
// });

export const verifyAdminRefreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies?.refresh_token || req.header("x-refresh-token");

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const admin = await Admin.findById(decoded._id);

    if (!admin) {
      throw new ApiError(403, "Invalid refresh token");
    }

    req.admin = admin;
    next();
  } catch (err) {
    throw new ApiError(401, "Refresh token expired or invalid");
  }
});
