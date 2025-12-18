// // src/models/user.model.js

// import mongoose from 'mongoose';
// import jwt from 'jsonwebtoken';

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     avatar: {
//       type: String,
//       trim: true,
//       default: "",
//     },
//     phoneNumber: {
//       type: String,
//       required: true,
//       trim: true,
//       unique: true,
//     },
//     bloodGroup: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     beADonor: {
//       type: Boolean,
//       default: false
//     },
//     email: {
//       type: String,
//       // required: true,
//       trim: true,
//       lowercase: true,
//     },
//     pinCode: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     refreshToken: {
//       type: String,
//       default: null,
//     },
//     firebaseTokens: {
//       type: [String], // Array of strings
//       default: [],
//     },
//     upiId: {
//       type: String,
//       default: null,
//     },
//     BankAccounts:[
//       {re}
//     ],
//   },
//   {
//     timestamps: true,
//     collection: 'users',
//   }
// );

// // 🔑 Generate Access Token
// userSchema.methods.generateAccessToken = function () {
//   return jwt.sign(
//     {
//       id: this._id, // or _id if you want
//       email: this.email,
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     {
//       expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
//     }
//   );
// };

// // 🔄 Generate Refresh Token
// userSchema.methods.generateRefreshToken = function () {
//   return jwt.sign(
//     {
//       id: this._id, // or _id
//     },
//     process.env.REFRESH_TOKEN_SECRET,
//     {
//       expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d',
//     }
//   );
// };

// export const User = mongoose.model('User', userSchema);


import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
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

    bloodGroup: {
      type: String,
      required: true,
      trim: true,
    },

    beADonor: {
      type: Boolean,
      default: false,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    pinCode: {
      type: String,
      required: true,
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

    upiId: {
      type: String,
      default: null,
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
    collection: 'users',
  }
);

// 🔑 Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d' }
  );
};

// 🔄 Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d' }
  );
};

export const User = mongoose.model('User', userSchema);
