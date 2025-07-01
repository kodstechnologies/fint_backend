// // import { ApiError } from "../utils/ApiError.js";
// // import { asyncHandler } from "../utils/asyncHandler.js";
// // import jwt from "jsonwebtoken"
// // import { User } from "../models/user.model.js";

// // export const verifyJWT = asyncHandler(async (req, res, next) => {
// //   try {
// //     const accessToken =
// //       req.cookies?.accessToken ||
// //       req.header("Authorization")?.replace("Bearer ", "");
// //     console.log("🚀 ~ verifyJWT ~ accessToken:", accessToken)
// //     if (!accessToken) {
// //       throw new ApiError(401, "Unauthorized request");
// //     }
// //     console.log("🚀 ~ verifyJWT ~ process.env.ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET)
// //     let decodedToken;
// //     try {
// //       console.log("🚀 ~ verifyJWT ~ accessToken:", accessToken)
// //       decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
// //       console.log("🚀 ~ verifyJWT ~ decodedToken:", decodedToken)
// //     } catch (error) {
// //       if (error.name === "TokenExpiredError") {
// //         // Access token expired. Attempt to refresh.
// //         const refreshToken = req.cookies?.refreshToken;
// //         console.log("🚀 ~ verifyJWT ~ refreshToken:", refreshToken)
// //         if (!refreshToken) {
// //           throw new ApiError(401, "Session expired. Please log in again.");
// //         }

// //         const decodedRefreshToken = jwt.verify(
// //           refreshToken,
// //           process.env.REFRESH_TOKEN_SECRET
// //         );
// //         console.log("🚀 ~ verifyJWT ~ decodedRefreshToken:", decodedRefreshToken)

// //         const user = await User.findById(decodedRefreshToken._id);
// //         if (!user || user.refreshToken !== refreshToken) {
// //           throw new ApiError(401, "Invalid refresh token");
// //         }

// //         // Generate new tokens
// //         const newAccessToken = user.generateAccessToken();
// //         const newRefreshToken = user.generateRefreshToken();

// //         // Save new refresh token in the database
// //         user.refreshToken = newRefreshToken;
// //         await user.save();

// //         // Set new tokens in cookies
// //         res.cookie("accessToken", newAccessToken, {
// //           // httpOnly: true,
// //           // secure: process.env.NODE_ENV === "production",
// //           path: '/',
// //           secure: false, // Disable Secure for local development
// //           sameSite: 'Strict',
// //         });
// //         res.cookie("refreshToken", newRefreshToken, {
// //           // httpOnly: true,
// //           // secure: process.env.NODE_ENV === "production",
// //           path: '/',
// //           secure: false, // Disable Secure for local development
// //           sameSite: 'Strict',
// //         });

// //         decodedToken = jwt.verify(newAccessToken, process.env.ACCESS_TOKEN_SECRET);
// //         console.log("🚀 ~ verifyJWT ~ decodedToken:", decodedToken)
// //       } else {
// //         throw new ApiError(401, "Invalid access token");
// //       }
// //     }

// //     req.user = await User.findById(decodedToken._id).select("-password -refreshToken");
// //     next();
// //   } catch (error) {
// //     throw new ApiError(401, error.message || "Unauthorized");
// //   }
// // });


// // // src/middlewares/auth.middleware.js

// // src/middlewares/auth.middleware.jsimport { ApiError } from "../utils/ApiError.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import JWTService from "../../services/JWTService.js";
// import { User } from "../models/user.model.js";
// import RefreshToken from "../models/authModel/token.model.js";
// import { ApiError } from "../utils/ApiError.js";

// export const verifyJWT = asyncHandler(async (req, res, next) => {
//   const accessToken =
//     req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

//   if (!accessToken) {
//     throw new ApiError(401, "Unauthorized request: No token found");
//   }

//   let decodedToken;
//   try {
//     decodedToken = JWTService.verifyAccessToken(accessToken);
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       const refreshToken = req.cookies?.refreshToken;
//       if (!refreshToken) {
//         throw new ApiError(401, "Session expired. Please log in again.");
//       }

//       let decodedRefreshToken;
//       try {
//         decodedRefreshToken = JWTService.verifyRefreshToken(refreshToken);
//         const storedToken = await RefreshToken.findOne({
//           token: refreshToken,
//           userId: decodedRefreshToken._id,
//         });
//         if (!storedToken) {
//           throw new ApiError(401, "Invalid or revoked refresh token");
//         }
//       } catch {
//         throw new ApiError(401, "Invalid refresh token");
//       }

//       const user = await User.findById(decodedRefreshToken._id);
//       if (!user) {
//         throw new ApiError(401, "User not found");
//       }

//       // Generate and store new tokens
//       const newAccessToken = user.generateAccessToken();
//       const newRefreshToken = user.generateRefreshToken();
//       await JWTService.storeRefreshToken(newRefreshToken, user._id);
//       user.refreshToken = newRefreshToken;
//       await user.save();

//       // Set cookies
//       const isProd = process.env.NODE_ENV === "production";
//       res.cookie("accessToken", newAccessToken, {
//         httpOnly: true,
//         secure: isProd,
//         sameSite: "Strict",
//         path: "/",
//       });
//       res.cookie("refreshToken", newRefreshToken, {
//         httpOnly: true,
//         secure: isProd,
//         sameSite: "Strict",
//         path: "/",
//       });

//       decodedToken = JWTService.verifyAccessToken(newAccessToken);
//     } else {
//       throw new ApiError(401, "Invalid access token");
//     }
//   }

//   const user = await User.findById(decodedToken._id).select("-password -refreshToken");
//   if (!user) throw new ApiError(401, "User not found");

//   req.user = user;
//   next();
// });