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
    validity: {
      type: Date,
      required: true,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    viewers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-set isExpired
  advSchema.pre("save", function (next) {
    const now = new Date();

    // Set isExpired based on current time and validity
    this.isExpired = this.validity <= now;

    // Optional log
    if (this.isNew) {
      console.log("📢 New advertisement is being saved:", this.title);
    }

    next();
  });

const Advertisement = mongoose.model("Advertisement", advSchema);

export default Advertisement;
