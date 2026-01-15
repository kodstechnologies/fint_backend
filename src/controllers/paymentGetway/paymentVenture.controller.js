import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../../models/payment/payment.model.js";
import { User } from "../../models/user.model.js";
import { Venture } from "../../models/venture.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { createRazorpayOrder } from "../../utils/razorpay/createRazorpayOrder.js";
import config from "../../config/index.js";
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } = config;

const electronicChanges = asyncHandler(async (req, res) => {
  // ✅ SENDER = VENTURE
  const senderId = req.venture._id;

  const senderDetails = await Venture.findById(senderId).populate({
    path: "bankAccounts",
    match: { isAcive: true },
  });

  const senderBankAccount = senderDetails.bankAccounts?.[0];
  if (!senderBankAccount) {
    throw new ApiError(400, "Venture bank account not found");
  }

  const { amount, module = "VENTURE_QR", moduleData = {} } = req.body;

  if (!amount || amount <= 0) {
    throw new ApiError(400, "Invalid amount");
  }

  // ================= CREATE RAZORPAY ORDER =================
  const razorpayOrder = await createRazorpayOrder({
    userId: senderId,
    amount,
    module,
  });

  // ================= SAVE PAYMENT =================
  const payment = await Payment.create({
    // ===== SENDER (VENTURE) =====
    senderType: "Venture",
    senderId,
    senderPhoneNo: senderDetails.phoneNumber,
    senderAccountHolderName: senderBankAccount.accountHolderName,
    senderBankAccountNumber: senderBankAccount.bankAccountNumber,
    senderIfscCode: senderBankAccount.ifscCode,
    senderAccountType: senderBankAccount.accountType,

    // ===== RECEIVER (NOT FIXED) =====
    receiverType: null,
    receiverId: null,

    // ===== PAYMENT =====
    amount,
    module,
    moduleData,
    paymentMethod: "eChanges",
    razorpay_order_id: razorpayOrder.id,
    paymentStatus: "pending",
    fulfillmentStatus: "awaiting_payer",
  });

  res.status(200).json({
    success: true,
    message: "Venture payment QR generated",
    razorpayOrderId: razorpayOrder.id,
    paymentId: payment._id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    razorpayKeyId: RAZORPAY_KEY_ID,
  });
});

const verifyPaymentForVenture = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing Razorpay payment details");
  }

  const payment = await Payment.findOne({
    razorpay_order_id,
    paymentStatus: "pending",
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found or already verified");
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    payment.paymentStatus = "failed";
    payment.fulfillmentStatus = "failed";
    await payment.save();
    throw new ApiError(400, "Invalid Razorpay signature");
  }

  // ✅ Payment verified successfully
  payment.razorpay_payment_id = razorpay_payment_id;
  payment.paymentMethod = "eChanges";
  payment.paymentStatus = "captured";
  payment.fulfillmentStatus = "awaiting_receiver";
  payment.completedVia = "razorpay";

  await payment.save();

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    paymentId: payment._id,
  });
});

const getVentureHistory = asyncHandler(async (req, res) => {
  // ================= VENTURE ONLY =================
  if (!req.venture) {
    throw new ApiError(401, "Unauthorized");
  }

  const ventureId = req.venture._id;

  // ================= FETCH PAYMENTS =================
  const payments = await Payment.find({
    fulfillmentStatus: "completed",
    $or: [
      { senderId: ventureId },
      { receiverId: ventureId },
    ],
  })
    .sort({ createdAt: -1 })
    .select(`
      senderId senderAccountHolderName senderPhoneNo
      receiverId receiverAccountHolderName receiverPhoneNo
      amount paymentMethod paymentStatus createdAt
    `);

  // ================= FORMAT HISTORY =================
  const history = payments.map((p) => {
    const isDebited = p.senderId?.toString() === ventureId.toString();

    // ---------- eChanges logic ----------
    let eChangesStatus = null;
    if (p.paymentMethod === "eChanges") {
      eChangesStatus = p.receiverId ? "USED" : "NOT_USED";
    }

    return {
      type: isDebited ? "DEBITED" : "CREDITED",
      amount: p.amount,

      paymentMethod: p.paymentMethod,
      paymentStatus: p.paymentStatus, // ✅ ADDED

      eChangesStatus, // null for non-eChanges

      from: isDebited
        ? "Venture"
        : p.senderAccountHolderName || p.senderPhoneNo,

      to: isDebited
        ? p.receiverAccountHolderName || p.receiverPhoneNo || "Not Assigned"
        : "Venture",

      date: p.createdAt,
    };
  });

  // ================= RESPONSE =================
  res.status(200).json({
    success: true,
    count: history.length,
    data: history,
  });
});




export {
  electronicChanges,
  verifyPaymentForVenture,
  getVentureHistory
}