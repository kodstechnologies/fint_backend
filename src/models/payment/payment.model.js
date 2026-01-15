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
      enum: ["qr","phone", "self", "bank", "eChanges"],
      default: null,
    },

    // ================= RAZORPAY =================
    razorpay_order_id: {
      type: String,
      required: true,
      index: true, // ✅ safer than unique
    },

    razorpay_payment_id: {
      type: String,
      default: null,
    },

    // ================= STATUS =================
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    fulfillmentStatus: {
      type: String,
      enum: [
        "pending",            // record created
        "awaiting_payer",     // QR created
        "awaiting_receiver",  // payment verified, receiver not attached
        "completed",          // receiver attached
        "failed",
      ],
      default: "pending",
    },

    completedVia: {
      type: String,
      enum: ["razorpay", "qr", "webhook", "manual"],
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
