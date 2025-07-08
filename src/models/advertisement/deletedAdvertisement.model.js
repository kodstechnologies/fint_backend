import mongoose from "mongoose";

const deletedAdvSchema = new mongoose.Schema(
  {
    img: {
      type: String,
      // optional or required based on how you use it
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

const DelAdvertisement = mongoose.model("DelAdvertisement", deletedAdvSchema);

export default DelAdvertisement;
