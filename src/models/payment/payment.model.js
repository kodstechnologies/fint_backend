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

    senderBankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
      default: null,
    },

    // ================= RECEIVER =================
    receiverType: {
      type: String,
      enum: ["User", "Venture"],
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "receiverType",
    },

    receiverPhoneNo: {
      type: String,
      required: true,
      trim: true,
    },

    receiverBankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
      required: true,
    },

    // ================= PAYMENT =================
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    module: {
      type: String,
      required: true, // P2P_TRANSFER, USER_TO_VENTURE, etc
    },

    moduleData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    completedVia: {
      type: String,
      enum: ["client", "webhook", "manual"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

//
// ================= INDEXES =================
//

// Fast Razorpay lookups
paymentSchema.index({ razorpay_order_id: 1 });

// Payment history
paymentSchema.index({ senderId: 1, createdAt: -1 });
paymentSchema.index({ receiverId: 1, createdAt: -1 });

// Background jobs / retries
paymentSchema.index({ paymentStatus: 1, fulfillmentStatus: 1 });

//
// ================= SAFETY CHECK =================
//


export default mongoose.model("Payment", paymentSchema);
