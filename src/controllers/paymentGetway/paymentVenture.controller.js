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
import { sendNotificationByType } from "../../utils/firebase/NoteficastionUtil.js";
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } = config;

const electronicChanges = asyncHandler(async (req, res) => {
  // ✅ SENDER = VENTURE
  const senderId = req.venture._id;

  const senderDetails = await Venture.findById(senderId).populate({
    path: "bankAccounts",
    match: { isAcive: true },
  });
  console.log("🚀 ~ senderDetails:", senderDetails)

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
    // senderType: "Venture",
    // senderId,
    // senderPhoneNo: senderDetails.phoneNumber,
    // senderAccountHolderName: senderBankAccount.accountHolderName,
    // senderBankAccountNumber: senderBankAccount.bankAccountNumber,
    // senderIfscCode: senderBankAccount.ifscCode,
    // senderAccountType: senderBankAccount.accountType,
    senderType: "Venture",
    senderId: senderId ?? "",
    senderName: senderDetails?.firstName ?? "",
    senderPhoneNo: senderDetails?.phoneNumber ?? "",
    senderAccountHolderName: senderBankAccount?.accountHolderName ?? "",
    senderBankAccountNumber: senderBankAccount?.bankAccountNumber ?? "",
    senderIfscCode: senderBankAccount?.ifscCode ?? "",
    senderAccountType: senderBankAccount?.accountType ?? "",

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
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
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
  payment.paymentStatus = "success";
  payment.fulfillmentStatus = "awaiting_receiver";
  payment.completedVia = "razorpay";

  await payment.save();

  // =================================================

  //create all eChanges
  await sendNotificationByType({
    id: payment.senderId,
    type: "Venture", // "User" | "Venture"
    title: "Coupon Created 🎟️",
    body: `Your coupon worth ₹${payment.amount} has been created successfully 🎉`,
    notificationType: "eChanges",
    data: {
      amount: payment.amount.toString(),
      transactionType: "COUPON_CREATED",
      source: "eChanges",
      paymentId: payment._id.toString(),
      role: "creator",
    },
  });


  // =================================================

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    paymentId: payment._id,
  });
});


export {
  electronicChanges,
  verifyPaymentForVenture,
}