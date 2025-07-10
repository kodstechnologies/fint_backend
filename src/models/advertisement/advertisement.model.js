// import mongoose from "mongoose";

// const advSchema = new mongoose.Schema(
//   {
//     img: {
//       type: String,
//       default: null,
//     },
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     validity: {
//       type: Date,
//       required: true,
//       index: true, // for quick expiry checks
//     },
//     status: {
//       type: String,
//       enum: ["active", "expired", "deleted"],
//       default: "active",
//       index: true,
//     },
//     views: {
//       type: Number,
//       default: 0,
//     },
//     viewers: [
//       {
//         userId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User",
//         },
//         viewedAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//     isExpired: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Auto-set isExpired before save
// advSchema.pre("save", function (next) {
//   this.isExpired = this.validity <= new Date();

//   if (this.isExpired && this.status === "active") {
//     this.status = "expired";
//   }

//   if (this.isNew) {
//     console.log("📢 New advertisement is being saved:", this.title);
//   }

//   next();
// });

// // Optional: Also auto-expire on find
// advSchema.pre("find", function (next) {
//   const now = new Date();
//   this.updateMany(
//     { validity: { $lte: now }, status: "active" },
//     { $set: { status: "expired", isExpired: true } }
//   );
//   next();
// });

// const Advertisement = mongoose.model("Advertisement", advSchema);

// export default Advertisement;

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
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "deleted"],
      default: "active",
      index: true,
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
    isExpired: {
      type: Boolean,
      default: false,
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

// ❌ REMOVE this: It’s incorrect and may block queries
// advSchema.pre("find", function (next) {
//   const now = new Date();
//   this.updateMany(
//     { validity: { $lte: now }, status: "active" },
//     { $set: { status: "expired", isExpired: true } }
//   );
//   next();
// });

const Advertisement = mongoose.model("Advertisement", advSchema, "advertisements");

export default Advertisement;
