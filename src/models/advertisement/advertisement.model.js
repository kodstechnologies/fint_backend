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

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venture",
      required: true,
    },
  },
  { timestamps: true }
);

/* ===============================
   🔥 VIEW TRACK + AUTO EXPIRE
================================ */

advSchema.pre("save", function (next) {
  if (this.isModified("views")) {
    // ✅ Add ONE timestamp per save
    this.viewHistory.push({ viewedAt: Date.now() });
  }

  // ✅ Auto-expire (unchanged logic)
  if (
    (this.isModified("views") || this.isModified("count")) &&
    this.views >= this.count &&
    this.status !== "expired"
  ) {
    this.status = "expired";
  }

  next();
});

const Advertisement = mongoose.model(
  "Advertisement",
  advSchema,
  "advertisements"
);

export default Advertisement;
