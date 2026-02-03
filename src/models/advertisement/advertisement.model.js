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
//     status: {
//       type: String,
//       enum: ["active", "expired"],
//       default: "active",
//       index: true,
//     },
//     count: {
//       type: Number,
//       default: 0,
//     },
//     views: {
//       type: Number,
//       default: 0,
//     },
//     // ✅ New field: Venture who created this ad
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Venture", // match model name
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
// /* ===============================
//    🔥 AUTO-EXPIRE LOGIC
// ================================ */
// advSchema.pre("save", function (next) {
//   // Only check if views or count changed
//   if (this.isModified("views") || this.isModified("count")) {
//     if (this.views >= this.count && this.status !== "expired") {
//       this.status = "expired";

//     }
//   }

//   next();
// });


// const Advertisement = mongoose.model("Advertisement", advSchema, "advertisements");

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
    status: {
      type: String,
      enum: ["active", "expired"],
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

    // ✅ View history
    viewHistory: [
      {
        viewedAt: {
          type: Date,
        },
      },
    ],

    // ✅ Venture who created this ad
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venture",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ===============================
   🔥 AUTO-EXPIRE + VIEW TRACK
================================ */

// store previous views before update
advSchema.pre("init", function (doc) {
  this.$locals = { prevViews: doc.views };
});

advSchema.pre("save", function (next) {
  // ✅ Save Date.now() when views increase
  if (this.isModified("views")) {
    const prevViews = this.$locals?.prevViews || 0;

    if (this.views > prevViews) {
      const diff = this.views - prevViews;

      for (let i = 0; i < diff; i++) {
        this.viewHistory.push({
          viewedAt: Date.now(), // ✅ EXACT moment view increased
        });
      }
    }
  }

  // 🔥 Existing auto-expire logic (UNCHANGED)
  if (this.isModified("views") || this.isModified("count")) {
    if (this.views >= this.count && this.status !== "expired") {
      this.status = "expired";
    }
  }

  next();
});

const Advertisement = mongoose.model(
  "Advertisement",
  advSchema,
  "advertisements"
);

export default Advertisement;
