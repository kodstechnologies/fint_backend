// import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../src/config/index.js";
import { Admin } from "../src/models/admin.model.js";
import { Venture } from "../src/models/venture.model.js"
import { User } from "../src/models/user.model.js";
import { ApiError } from "../src/utils/ApiError.js";
import jwt from 'jsonwebtoken';
import config from "../src/config/index.js";

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = config;

export default class JWTService {
  static signAccessToken(payload, expiryTime = "1d") {
    console.log(ACCESS_TOKEN_SECRET, "ACCESS_TOKEN_SECRET");

    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: expiryTime });
  }

  static signRefreshToken(payload, expiryTime = "30d") {
    console.log(REFRESH_TOKEN_SECRET, "REFRESH_TOKEN_SECRET");

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
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      user.refreshToken = token;
      await user.save();

      return { success: true };
    } catch (error) {
      console.error("Error storing refresh token:", error);
      throw new ApiError(500, "Failed to store refresh token");
    }
  }

  static async deleteRefreshToken(token) {
    try {
      const user = await User.findOne({ refreshToken: token });
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      user.refreshToken = null;
      await user.save();

      return { success: true };
    } catch (error) {
      console.error("Error deleting refresh token:", error);
      throw new ApiError(500, "Failed to delete refresh token");
    }
  }

  static async storeVentureRefreshToken(token, ventureId) {
    console.log(token, "token 😁", ventureId);

    try {
      const venture = await Venture.findById(ventureId);
      if (!venture) {
        throw new ApiError(404, "Venture not found");
      }

      venture.refreshToken = token;
      await venture.save();

      return { success: true };
    } catch (error) {
      console.error("Error storing refresh token:", error);
      throw new ApiError(500, "Failed to store refresh token");
    }
  }

  static async deleteVentureRefreshToken(token) {
    try {
      const venture = await Venture.findOne({ refreshToken: token });
      if (!venture) {
        throw new ApiError(404, "Venture not found");
      }

      venture.refreshToken = null;
      await venture.save();

      return { success: true };
    } catch (error) {
      console.error("Error deleting refresh token:", error);
      throw new ApiError(500, "Failed to delete refresh token");
    }
  }

  static async storeAdminRefreshToken(token, userId) {
    try {
      const user = await Admin.findById(userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      user.refreshToken = token;
      await user.save();

      return { success: true };
    } catch (error) {
      console.error("Error storing refresh token:", error);
      throw new ApiError(500, "Failed to store refresh token");
    }
  }

  static async deleteAdminRefreshToken(token) {
    try {
      const user = await Admin.findOne({ refreshToken: token });
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      user.refreshToken = null;
      await user.save();

      return { success: true };
    } catch (error) {
      console.error("Error deleting refresh token:", error);
      throw new ApiError(500, "Failed to delete refresh token");
    }
  }


}