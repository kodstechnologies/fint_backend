// src/models/merchant.model.js

import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema(
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
    collection: 'merchants', // 👈 ensures it saves in the 'merchants' collection
  }
);

export const Merchant = mongoose.model('Merchant', merchantSchema);
