import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({

  identifier: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
});

// ➕ Automatically set expiresAt = 5 minutes from createdAt
otpSchema.pre("save", function (next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  }
  next();
});

// 🧼 Auto-delete expired OTP using TTL index
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpModel = mongoose.model("Otp", otpSchema);

export default OtpModel;
