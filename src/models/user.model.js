// src/models/user.model.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      required: true,
      trim: true,
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
    email: {
      type: String,
      required: true,
      // unique: true,
      trim: true,
      lowercase: true,
    },
    pinCode: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'users', // 👈 explicitly sets collection name to 'users'
  }
);

export const User = mongoose.model('User', userSchema);
