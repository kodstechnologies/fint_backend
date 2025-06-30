// import jwt from "jsonwebtoken";

// const {
//   ACCESS_TOKEN_SECRET,
//   REFRESH_TOKEN_SECRET,
// } = require("../config/index");
// const RefreshToken = require("../models/token");

// class JWTService {
//   // sign access token
//   static signAccessToken(payload, expiryTime) {
//     return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: expiryTime });
//   }

//   // sign refresh token
//   static signRefreshToken(payload, expiryTime) {
//     return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: expiryTime });
//   }

//   // verify access token
//   static verifyAccessToken(token) {
//     return jwt.verify(token, ACCESS_TOKEN_SECRET);
//   }

//   // verify refresh token
//   static verifyRefreshToken(token) {
//     return jwt.verify(token, REFRESH_TOKEN_SECRET);
//   }
//   // store refresh token
//   static async storeRefreshToken(token, userId) {
//     try {
//       const newToken = new RefreshToken({
//         token: token,
//         userId: userId,
//       });

//       //   store in db
//       await newToken.save();
//     } catch (error) {
//       console.log(error);
//     }
//   }
// }
// module.exports = JWTService;


 // src/services/JWTService.js
// src/services/JWTService.import jwt from "jsonwebtoken";import jwt from "jsonwebtoken"; // Ensure this import is correct
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../src/config/index.js";
import RefreshToken from "../src/models/authModel/token.model.js";
import { ApiError } from "../src/utils/ApiError.js";
import jwt from 'jsonwebtoken';

export default class JWTService {
  static signAccessToken(payload, expiryTime = "1m") {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: expiryTime });
  }

  static signRefreshToken(payload, expiryTime = "3m") {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: expiryTime });
  }

  static verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  }

  static verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  }

  static async storeRefreshToken(token, userId) {
    try {
      const newToken = new RefreshToken({ token, userId });
      await newToken.save();
      return { success: true };
    } catch (error) {
      console.error("Error storing refresh token:", error);
      throw new ApiError(500, "Failed to store refresh token");
    }
  }

  static async deleteRefreshToken(token) {
    try {
      await RefreshToken.deleteOne({ token });
      return { success: true };
    } catch (error) {
      console.error("Error deleting refresh token:", error);
      throw new ApiError(500, "Failed to delete refresh token");
    }
  }
}