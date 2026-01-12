// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema(
//   {
//     // ================= SENDER =================
//     senderType: {
//       type: String,
//       enum: ["User", "Venture"],
//       required: true,
//     },

//     senderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       refPath: "senderType",
//     },

//     senderPhoneNo: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     // =============== sender bank ================
//     senderAccountHolderName: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     senderBankAccountNumber: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     senderIfscCode: {
//       type: String,
//       required: true,
//       trim: true,
//       uppercase: true,
//     },

//     senderAccountType: {
//       type: String,
//       required: true,
//       enum: ["Savings", "Current"],
//     },

//     // ================= RECEIVER =================
//     receiverType: {
//       type: String,
//       enum: ["User", "Venture"],
//       // required: true,
//     },

//     receiverId: {
//       type: mongoose.Schema.Types.ObjectId,
//       // required: true,
//       refPath: "receiverType",
//     },

//     receiverPhoneNo: {
//       type: String,
//       // required: true,
//       trim: true,
//     },

//     // ================ receiver bankaccount ==========================
//     receiverAccountHolderName: {
//       type: String,
//       // required: true,
//       trim: true,
//     },

//     receiverBankAccountNumber: {
//       type: String,
//       // required: true,
//       trim: true,
//     },

//     receiverIfscCode: {
//       type: String,
//       // required: true,
//       trim: true,
//       uppercase: true,
//     },

//     receiverAccountType: {
//       type: String,
//       // required: true,
//       enum: ["Savings", "Current"],
//     },

//     // ================= PAYMENT TYPE =================
//     paymentMethod: {
//       type: String,
//       enum: ["upi", "card", "netbanking"],
//       default: null, // will be updated after success
//     },

//     // ================= PAYMENT =================
//     amount: {
//       type: Number,
//       required: true,
//       min: 1,
//     },

//     module: {
//       type: String,
//       required: true, // P2P_TRANSFER, USER_TO_VENTURE, etc
//     },

//     moduleData: {
//       type: mongoose.Schema.Types.Mixed,
//       default: {},
//     },

//     // ================= RAZORPAY =================
//     razorpay_order_id: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     razorpay_payment_id: {
//       type: String,
//       default: null,
//     },



//     // ================= STATUS =================
//     paymentStatus: {
//       type: String,
//       enum: ["pending", "captured", "failed"],
//       default: "pending",
//     },

//     fulfillmentStatus: {
//       type: String,
//       enum: ["pending", "completed", "failed"],
//       default: "pending",
//     },

//     completedVia: {
//       type: String,
//       enum: ["client", "webhook", "manual"],
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// //
// // ================= INDEXES =================
// //

// // Fast Razorpay lookups
// paymentSchema.index({ razorpay_order_id: 1 });

// // Payment history
// paymentSchema.index({ senderId: 1, createdAt: -1 });
// paymentSchema.index({ receiverId: 1, createdAt: -1 });

// // Background jobs / retries
// paymentSchema.index({ paymentStatus: 1, fulfillmentStatus: 1 });

// //
// // ================= SAFETY CHECK =================
// //


// export default mongoose.model("Payment", paymentSchema);


import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // ================= SENDER =================
    senderType: {
      type: String,
      enum: ["User", "Venture"],
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderType",
    },

    senderPhoneNo: {
      type: String,
      required: true,
      trim: true,
    },

    senderAccountHolderName: {
      type: String,
      required: true,
      trim: true,
    },

    senderBankAccountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    senderIfscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    senderAccountType: {
      type: String,
      enum: ["Savings", "Current"],
      required: true,
    },

    // ================= RECEIVER =================
    receiverType: {
      type: String,
      enum: ["User", "Venture"],
      default: null,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "receiverType",
      default: null,
    },

    receiverPhoneNo: {
      type: String,
      trim: true,
      default: null,
    },

    receiverAccountHolderName: {
      type: String,
      trim: true,
      default: null,
    },

    receiverBankAccountNumber: {
      type: String,
      trim: true,
      default: null,
    },

    receiverIfscCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    receiverAccountType: {
      type: String,
      enum: ["Savings", "Current"],
      default: null,
    },

    // ================= PAYMENT =================
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    module: {
      type: String,
      required: true,
    },

    moduleData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking"],
      default: null,
    },

    // ================= RAZORPAY =================
    razorpay_order_id: {
      type: String,
      required: true,
      unique: true,
    },

    razorpay_payment_id: {
      type: String,
      default: null,
    },

    // ================= STATUS =================
    paymentStatus: {
      type: String,
      enum: ["pending", "captured", "failed"],
      default: "pending",
    },

    fulfillmentStatus: {
      type: String,
      enum: [
        "pending",        // created
        "awaiting_payer", // QR created, waiting for user
        "completed",      // payment done
        "failed",         // failed
      ],
      default: "pending",
    },

    completedVia: {
      type: String,
      enum: ["client", "webhook", "manual"],
      default: null,
    },
  },
  { timestamps: true }
);

// ================= INDEXES =================
paymentSchema.index({ razorpay_order_id: 1 });
paymentSchema.index({ senderId: 1, createdAt: -1 });
paymentSchema.index({ receiverId: 1, createdAt: -1 });
paymentSchema.index({ paymentStatus: 1, fulfillmentStatus: 1 });

export default mongoose.model("Payment", paymentSchema);
