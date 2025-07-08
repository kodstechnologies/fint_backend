// src/models/insurance.model.js

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const petSchema = new mongoose.Schema({
  petId: {
    type: String,
    unique: true,
    default: uuidv4,
  },
  petName: {
    type: String,
    default: null,
    trim: true,
  },
  petBreed: {
    type: String,
    default: null,
    trim: true,
  },
  petAge: {
    type: String,
    default: null,
    trim: true,
  },
  petAddress: {
    type: String,
    default: null,
    trim: true,
  },
    petNoseImg: {
    type: String,
    default: null,
    trim: true,
  },
}, { _id: false });

const InsuranceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    // unique: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  pinCode: {
    type: String,
    required: true,
    trim: true,
  },
  parentAge: {
    type: String,
    default: null,
  },
  pets: {
    type: [petSchema],
    default: [],
  },
}, {
  timestamps: true,
  collection: 'insurances', // optionally rename collection to "insurances"
});

// 🔐 Pre-save hook for hashing password and generating petId
InsuranceSchema.pre('save', async function (next) {
  const insurance = this;

  // Hash password if modified
  if (insurance.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    insurance.password = await bcrypt.hash(insurance.password, salt);
  }

  // Ensure each pet has a petId
  if (insurance.pets && Array.isArray(insurance.pets)) {
    insurance.pets.forEach((pet) => {
      if (!pet.petId) {
        pet.petId = uuidv4();
      }
    });
  }

  next();
});

export const Insurance = mongoose.model('Insurance', InsuranceSchema);
