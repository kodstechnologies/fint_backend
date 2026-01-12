import jwt from 'jsonwebtoken';
import { Venture } from '../models/venture.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// ✅ Verify Access Token from `Authorization: Bearer <token>`
// export const ventureVentureverifyJWT = asyncHandler(async (req, res, next) => {
//   const authHeader = req.header("Authorization");
//   console.log("🚀 ~ authHeader:", authHeader)
//   const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
//   console.log("🚀 ~ token:", token)

//   if (!token) {
//     throw new ApiError(401, "Access token missing");
//   }

//   try {
//     console.log(process.env.ACCESS_TOKEN_SECRET, "ACCESS_TOKEN_SECRET 🔑");

//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     console.log("decoded", decoded);


//     const venture = await Venture.findById(decoded._id).select("-refreshToken");
//     console.log("venture", venture);

//     if (!venture) {
//       throw new ApiError(404, "Venture not found");
//     }

//     req.venture = venture;
//     req.role = "venture";
//     next();
//   } catch (error) {
//     console.error("JWT Error:", error.message);
//     throw new ApiError(401, "Invalid or expired access token");
//   }
// });

export const ventureVentureverifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("🚀 authHeader:", authHeader);

  if (!authHeader) {
    throw new ApiError(401, "Access token missing");
  }

  // 🔹 Extract token safely
  let token = authHeader;

  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  // Remove < > if present (Postman mistake)
  token = token.replace(/^<|>$/g, "").trim();

  console.log("🚀 token:", token);

  if (!token) {
    throw new ApiError(401, "Access token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decoded:", decoded);

    // 🔹 FIX: use decoded.id (not _id)
    const ventureId = decoded.id || decoded._id;

    const venture = await Venture.findById(ventureId).select("-refreshToken");
    console.log("venture:", venture);

    if (!venture) {
      throw new ApiError(404, "Venture not found");
    }

    req.venture = venture;
    req.role = "venture";
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    throw new ApiError(401, "Invalid or expired access token");
  }
});


// export const ventureVerifyRefreshToken = asyncHandler(async (req, res, next) => {
//   const refreshToken =
//     req.cookies?.refreshToken || req.header("x-refresh-token");
//   console.log("🚀 ~ verifyRefreshToken ~ refreshToken:", refreshToken)

//   if (!refreshToken) {
//     throw new ApiError(401, "Refresh token missing");
//   }

//   try {
//     console.log(process.env.REFRESH_TOKEN_SECRET, "process.env.REFRESH_TOKEN_SECRET");

//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
//     console.log("🚀 ~ verifyRefreshToken ~ decoded:", decoded)
//     const venture = await Venture.findById(decoded._id);
//     console.log("🚀 ~ verifyRefreshToken ~ venture:", venture)

//     if (!venture || venture.refreshToken !== refreshToken) {
//       throw new ApiError(403, "Invalid refresh token");
//     }

//     req.venture = venture; // attach venture for next handler
//     next();
//   } catch (err) {
//     throw new ApiError(401, "Refresh token expired or invalid");
//   }
// });

export const ventureVerifyRefreshToken = asyncHandler(
  async (req, res, next) => {
    const refreshToken =
      req.cookies?.refreshToken || req.header("x-refresh-token");

    console.log("🚀 refreshToken:", refreshToken);

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }

    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      console.log("🚀 decoded:", decoded);
    } catch (err) {
      // ❗ Only JWT errors come here
      throw new ApiError(401, "Refresh token expired or invalid");
    }

    // 🔍 Venture lookup
    const venture = await Venture.findById(decoded._id);
    console.log("🚀 venture:", venture);

    if (!venture) {
      throw new ApiError(
        403,
        "This refresh token does not belong to a venture"
      );
    }

    // 🔐 Token must match DB
    if (venture.refreshToken !== refreshToken) {
      throw new ApiError(401, "Refresh token mismatch");
    }

    req.venture = venture;
    next();
  }
);
