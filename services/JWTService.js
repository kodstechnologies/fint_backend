import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../src/config/index.js";
import RefreshToken from "../src/models/authModel/token.model.js";
import { ApiError } from "../src/utils/ApiError.js";
import jwt from 'jsonwebtoken';

export default class JWTService {
  static signAccessToken(payload, expiryTime = "1m") {
    console.log(ACCESS_TOKEN_SECRET ,"ACCESS_TOKEN_SECRET");
    
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: expiryTime });
  }

  static signRefreshToken(payload, expiryTime = "1m") {
    console.log(REFRESH_TOKEN_SECRET ,"REFRESH_TOKEN_SECRET");
    
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