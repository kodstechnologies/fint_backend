import mongoose from "mongoose";

const advSchema = new mongoose.Schema(
  {
    img: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "revoked"],
      // enum: ["active", "expired", "deleted"],
      default: "active",
      index: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },

    // ✅ New field: Venture who created this ad
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venture", // match model name
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Automatically mark as expired before saving
advSchema.pre("save", function (next) {
  const now = new Date();
  this.isExpired = this.validity <= now;

  if (this.isExpired && this.status === "active") {
    this.status = "expired";
  }

  next();
});

const Advertisement = mongoose.model("Advertisement", advSchema, "advertisements");

export default Advertisement;
