import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../../models/payment/payment.model.js";
import { User } from "../../models/user.model.js";
import { Venture } from "../../models/venture.model.js";
import config from "../../config/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } = config;

// joi validation ==================================



// ================= RAZORPAY INIT =================
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// =================================================
// =============== CREATE ORDER (SEND MONEY) =======
// =================================================
export const createOrder = asyncHandler(async (req, res) => {
  console.log("🚀 createOrder req.body:", req.body);

  const {
    receiverType,
    receiverId,
    amount,
    module,
    moduleData = {},
  } = req.body;

  // ---------- SENDER ----------
  const senderType = req.role === "fint" ? "User" : "Venture";
  const senderId = req.user._id;

  const SenderModel = senderType === "User" ? User : Venture;
  const sender = await SenderModel.findById(senderId).populate("bankAccounts");

  if (!sender) {
    throw new ApiError(404, "Sender not found");
  }

  const senderBankAccount =
    sender.bankAccounts?.find((acc) => acc.isAcive === true) || null;

  // ---------- RECEIVER ----------
  const ReceiverModel = receiverType === "User" ? User : Venture;
  const receiver = await ReceiverModel.findById(receiverId).populate(
    "bankAccounts"
  );

  if (!receiver) {
    throw new ApiError(404, "Receiver not found");
  }

  const receiverBankAccount = receiver.bankAccounts?.find(
    (acc) => acc.isAcive === true
  );

  if (!receiverBankAccount) {
    throw new ApiError(400, "Receiver has no active bank account");
  }

  if (String(senderId) === String(receiverId)) {
    throw new ApiError(400, "Sender and receiver cannot be same");
  }

  // ---------- RAZORPAY ----------
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `txn_${Date.now()}`,
  });

  const payment = await Payment.create({
    senderType,
    senderId,
    senderPhoneNo: sender.phoneNumber,
    senderBankAccount: senderBankAccount?._id || null,

    receiverType,
    receiverId,
    receiverPhoneNo: receiver.phoneNumber,
    receiverBankAccount: receiverBankAccount._id,

    amount,
    module,
    moduleData,

    razorpay_order_id: order.id,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        key: RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        paymentId: payment._id,
      },
      "Order created successfully"
    )
  );
});

// =================================================
// =============== VERIFY PAYMENT ==================
// =================================================
export const verifyPayment = asyncHandler(async (req, res) => {
  // At this point Joi has already validated req.body
  const { orderId, paymentId, signature } = req.body;

  // ---------- FIND PAYMENT ----------
  const payment = await Payment.findOne({
    razorpay_order_id: orderId,
  });

  if (!payment) {
    throw new ApiError(404, "Payment record not found");
  }

  // ---------- VERIFY SIGNATURE ----------
  const payload = `${orderId}|${paymentId}`;

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");

  if (expectedSignature !== signature) {
    payment.paymentStatus = "failed";
    payment.fulfillmentStatus = "failed";
    payment.completedVia = "client";
    await payment.save();

    throw new ApiError(400, "Invalid payment signature");
  }

  // ---------- MARK PAYMENT SUCCESS ----------
  payment.razorpay_payment_id = paymentId;
  payment.razorpay_signature = signature;
  payment.paymentStatus = "captured";
  payment.fulfillmentStatus = "completed";
  payment.completedVia = "client";

  await payment.save();

  // ---------- RESPONSE ----------
  return res.json(
    new ApiResponse(200, payment, "Payment verified successfully")
  );
});

// =================================================
// ================= WEBHOOK =======================
// =================================================
export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    throw new ApiError(400, "Invalid webhook signature");
  }

  const event = req.body.event;
  const paymentEntity = req.body.payload?.payment?.entity;

  if (!paymentEntity) {
    return res.json(new ApiResponse(200, null, "Ignored"));
  }

  if (event === "payment.captured") {
    await Payment.findOneAndUpdate(
      { razorpay_order_id: paymentEntity.order_id },
      {
        razorpay_payment_id: paymentEntity.id,
        paymentStatus: "captured",
        fulfillmentStatus: "completed",
        completedVia: "webhook",
      }
    );
  }

  if (event === "payment.failed") {
    await Payment.findOneAndUpdate(
      { razorpay_order_id: paymentEntity.order_id },
      {
        paymentStatus: "failed",
        completedVia: "webhook",
      }
    );
  }

  return res.json(new ApiResponse(200, null, "Webhook processed"));
});

// =================================================
// =========== CHECK PAYMENT STATUS ================
// =================================================
export const checkPaymentStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({
    razorpay_order_id: req.params.orderId,
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  return res.json(new ApiResponse(200, payment, "Payment status fetched"));
});

// =================================================
// ========= USER / VENTURE PAYMENT HISTORY =========
// =================================================
export const getUserPaymentHistory = asyncHandler(async (req, res) => {
  // eitherAuth must set req.role + req.user / req.venture
  let accountId;

  if (req.role === "fint") {
    // Logged in as User
    if (!req.user?._id) {
      throw new ApiError(401, "Unauthorized user");
    }
    accountId = req.user._id;
  } else if (req.role === "venture") {
    // Logged in as Venture
    if (!req.venture?._id) {
      throw new ApiError(401, "Unauthorized venture");
    }
    accountId = req.venture._id;
  } else {
    throw new ApiError(401, "Invalid role");
  }

  // Fetch all payments where this account is sender OR receiver
  const payments = await Payment.find({
    $or: [
      { senderId: accountId },
      { receiverId: accountId },
    ],
  }).sort({ createdAt: -1 });

  return res.json(
    new ApiResponse(
      200,
      payments,
      "Payment history fetched successfully"
    )
  );
});
