import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../src/config/index.js";
import { Admin } from "../src/models/admin.model.js";
import { Merchant } from "../src/models/merchant.model.js";
import {User} from "../src/models/user.model.js";
import { ApiError } from "../src/utils/ApiError.js";
import jwt from 'jsonwebtoken';

export default class JWTService {
  static signAccessToken(payload, expiryTime = "1d") {
    console.log(ACCESS_TOKEN_SECRET ,"ACCESS_TOKEN_SECRET");
    
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: expiryTime });
  }

  static signRefreshToken(payload, expiryTime = "30d") {
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

static async storeMerchantRefreshToken(token, userId) {
  try {
    const user = await Merchant.findById(userId);
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

static async deleteMerchantRefreshToken(token) {
  try {
    const user = await Merchant.findOne({ refreshToken: token });
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