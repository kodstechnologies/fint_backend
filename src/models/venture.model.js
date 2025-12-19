import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const ventureSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
      default: "",
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      // required: true,
      trim: true,
      lowercase: true,
    },
    pinCode: {
      type: String,
      required: false,
      trim: true,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    firebaseTokens: {
      type: [String],
      default: [],
    },
    // ✅ FIXED: Bank account references
    bankAccounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BankAccount",
      },
    ],
  },
  {
    timestamps: true,
    collection: 'ventures',
  }
);

// 🔑 Generate Access Token
ventureSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h',
    }
  );
};

// 🔄 Generate Refresh Token
ventureSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    }
  );
};

export const Venture = mongoose.model('Venture', ventureSchema);
