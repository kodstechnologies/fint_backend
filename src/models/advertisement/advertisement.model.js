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
      enum: ["active", "expired"],
      // enum: ["active","revoked",, "expired", "deleted"],
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
    revokedAt: {
      type: Date,
      default: null,
      index: true,
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
/* ===============================
   🔥 AUTO-EXPIRE LOGIC
================================ */
advSchema.pre("save", function (next) {
  // Only check if views or count changed
  if (this.isModified("views") || this.isModified("count")) {
    if (this.views >= this.count && this.status !== "expired") {
      this.status = "expired";

      // set revokedAt only once
      if (!this.revokedAt) {
        this.revokedAt = new Date();
      }
    }
  }

  next();
});


const Advertisement = mongoose.model("Advertisement", advSchema, "advertisements");

export default Advertisement;
