import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    couponTitle: {
      type: String,
      required: [true, "Coupon title is required"],
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    offerTitle: {
      type: String,
      required: [true, "Offer title is required"],
      trim: true,
    },
    offerDescription: {
      type: String,
      required: [true, "Offer description is required"],
      trim: true,
    },
    termsAndConditions: {
      type: String,
      required: [true, "Terms and conditions are required"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
      index: true,
    },
    offerDetails: {
      type: String,
      default: "",
    },
    aboutCompany: {
      type: String,
      default: "",
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "expired", "deleted", "rejected", "claimed"],
      default: "active",
      index: true,
    },
    // claimPercentage: {
    //   type: Number,
    //   default: 0,
    //   min: 0,
    //   max: 100,
    // },

    // 🎯 Venture who created the coupon
    createdByVenture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venture",
      required: [true, "Created by Venture ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Automatically expire coupon if expiryDate passed
couponSchema.pre("save", function (next) {
  const now = new Date();
  if (this.expiryDate <= now && this.status === "active") {
    this.status = "expired";
  }
  next();
});

const Coupon = mongoose.model("Coupon", couponSchema, "coupons");

export default Coupon;
