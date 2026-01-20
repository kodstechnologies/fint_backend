import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../../models/payment/payment.model.js";
import { User } from "../../models/user.model.js";
import { Venture } from "../../models/venture.model.js";
import config from "../../config/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { createRazorpayOrder } from "../../utils/razorpay/createRazorpayOrder.js";
import { BankAccount } from "../../models/BankAccount.model.js";
import { sendNotificationByType } from "../../utils/firebase/NoteficastionUtil.js";

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } = config;

// =================================================
// =============== initiatePayment =======
// =================================================
const initiatePayment = asyncHandler(async (req, res) => {
    const senderId = req.user._id;

    const senderDetails = await User.findById(senderId).populate({
        path: "bankAccounts",
        match: { isAcive: true },
    });
    const senderBankAccount = senderDetails.bankAccounts[0];
    console.log("🚀 ~ senderBankAccount:", senderBankAccount)
    const {
        amount,
        receiverId,
        module = "P2P_TRANSFER",
        moduleData = {},
    } = req.body;
    console.log("🚀 ~ req.body:", req.body)
    const modelType = await User.findById(receiverId);
    console.log("🚀 ~ modelType:", modelType)
    const Model = modelType ? User : Venture;
    console.log("🚀 ~ Model:", Model)
    const receiverDetails = await Model.findById(receiverId).populate({
        path: "bankAccounts",
        match: { isAcive: true },
    });
    console.log("🚀 ~ receiverDetails:", receiverDetails)
    const receiverBankAccount = receiverDetails.bankAccounts[0];
    // ================= VALIDATION =================
    if (!amount || amount <= 0) {
        throw new ApiError(400, "Invalid amount");
    }
    if (!receiverId) {
        throw new ApiError(400, "Receiver is required");
    }
    if (senderId.toString() === receiverId) {
        throw new ApiError(400, "You cannot send money to yourself");
    }
    if (!senderBankAccount) {
        throw new ApiError(400, "Sender bank account not found");
    }
    if (!receiverBankAccount) {
        throw new ApiError(400, "Receiver bank account not found");
    }
    // ================= CREATE RAZORPAY ORDER =================
    const razorpayOrder = await createRazorpayOrder({
        userId: senderId,
        amount,
        module,
    });

    // ================= SAVE PAYMENT =================
    const payment = await Payment.create({
        // ===== SENDER =====
        senderType: "User",
        senderId,
        senderPhoneNo: senderDetails.phoneNumber,
        senderAccountHolderName: senderBankAccount.accountHolderName,
        senderBankAccountNumber: senderBankAccount.bankAccountNumber,
        senderIfscCode: senderBankAccount.ifscCode,
        senderAccountType: senderBankAccount.accountType,

        // ===== RECEIVER =====
        // receiverType: "User",
        receiverType: Model === User ? "User" : "Venture",
        receiverId,
        receiverPhoneNo: receiverDetails.phoneNumber,
        receiverAccountHolderName: receiverBankAccount.accountHolderName,
        receiverBankAccountNumber: receiverBankAccount.bankAccountNumber,
        receiverIfscCode: receiverBankAccount.ifscCode,
        receiverAccountType: receiverBankAccount.accountType,

        // ===== PAYMENT =====
        amount,
        module,
        moduleData,
        paymentMethod: "qr",
        razorpay_order_id: razorpayOrder.id,
        paymentStatus: "pending",
        fulfillmentStatus: "pending",
    });

    // ================= RESPONSE =================
    res.status(200).json({
        success: true,
        message: "Payment initiated",
        razorpayOrderId: razorpayOrder.id,
        paymentId: payment._id,
        amount: razorpayOrder.amount, // paise
        currency: razorpayOrder.currency,
        razorpayKeyId: RAZORPAY_KEY_ID,
    });
});
const verifyPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = req.body;

    // ================= VALIDATION =================
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ApiError(400, "Missing Razorpay payment details");
    }

    // ================= FIND PAYMENT =================
    const payment = await Payment.findOne({
        razorpay_order_id,
        paymentStatus: "pending",
    });
    console.log("🚀 ~ payment:", payment.senderAccountHolderName)
    console.log("🚀 ~ payment:", payment.receiverAccountHolderName)

    if (!payment) {
        throw new ApiError(404, "Payment record not found");
    }

    // ================= VERIFY SIGNATURE =================
    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
    if (generatedSignature !== razorpay_signature) {
        // ❌ Signature mismatch
        payment.paymentStatus = "failed";
        await payment.save();
        throw new ApiError(400, "Payment verification failed");
    }

    // ================= UPDATE PAYMENT =================
    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    payment.paymentStatus = "success";
    payment.fulfillmentStatus = "completed";
    payment.paidAt = new Date();
    await payment.save();

    // ================= SEND NOTIFICATIONS =================

    // 1️⃣ Sender → DEBIT
    await sendNotificationByType({
        id: payment.senderId,
        type: payment.senderType, // "User" | "Venture"
        title: "Payment Successful",
        body: `You’ve sent ₹${payment.amount} to ${payment.receiverAccountHolderName} successfully 💸`,
        data: {
            amount: payment.amount.toString(),
            transactionType: "DEBIT",
            source: "razorpay",
            paymentId: payment._id.toString(),
            role: "sender",
            notificationType: "payment"
        },
    });

    // 2️⃣ Receiver → CREDIT (only if receiver exists)
    if (payment.receiverId && payment.receiverType) {
        await sendNotificationByType({
            id: payment.receiverId,
            type: payment.receiverType, // "User" | "Venture"
            title: "Payment Received",
            body: `${payment.senderAccountHolderName} sent you ₹${payment.amount} 💰`,
            data: {
                amount: payment.amount.toString(),
                transactionType: "CREDIT",
                source: "razorpay",
                paymentId: payment._id.toString(),
                role: "receiver",
                notificationType: "payment"
            },
        });
    }


    // ================= RESPONSE =================
    res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        paymentId: payment._id,
    });
});
const sendByPhone = asyncHandler(async (req, res) => {
    const senderId = req.user._id;
    console.log("🚀 ~ senderId:", senderId)
    const senderDetails = await User.findById(senderId).populate({
        path: "bankAccounts",
        match: { isAcive: true },
    });
    const senderBankAccount = senderDetails.bankAccounts[0];
    const {
        amount,
        phoneNumber,
        module = "PHONE",
        moduleData = {},
    } = req.body;
    console.log("🚀 ~ req.body:", req.body)
    const receiverId = await User.findOne({ phoneNumber });
    console.log("🚀 ~ receiverId:", receiverId)
    const receiverDetails = await User.findById(receiverId).populate({
        path: "bankAccounts",
        match: { isAcive: true },
    });
    const receiverBankAccount = receiverDetails.bankAccounts[0];
    // ================= VALIDATION =================
    if (!amount || amount <= 0) {
        throw new ApiError(400, "Invalid amount");
    }
    if (!receiverId) {
        throw new ApiError(400, "Receiver is required");
    }
    if (senderId.toString() === receiverId) {
        throw new ApiError(400, "You cannot send money to yourself");
    }
    if (!senderBankAccount) {
        throw new ApiError(400, "Sender bank account not found");
    }
    if (!receiverBankAccount) {
        throw new ApiError(400, "Receiver bank account not found");
    }
    // ================= CREATE RAZORPAY ORDER =================
    const razorpayOrder = await createRazorpayOrder({
        userId: senderId,
        amount,
        module,
    });

    // ================= SAVE PAYMENT =================
    const payment = await Payment.create({
        // ===== SENDER =====
        senderType: "User",
        senderId,
        senderPhoneNo: senderDetails.phoneNumber,
        senderAccountHolderName: senderBankAccount.accountHolderName,
        senderBankAccountNumber: senderBankAccount.bankAccountNumber,
        senderIfscCode: senderBankAccount.ifscCode,
        senderAccountType: senderBankAccount.accountType,

        // ===== RECEIVER =====
        receiverType: "User",
        receiverId,
        receiverPhoneNo: receiverDetails.phoneNumber,
        receiverAccountHolderName: receiverBankAccount.accountHolderName,
        receiverBankAccountNumber: receiverBankAccount.bankAccountNumber,
        receiverIfscCode: receiverBankAccount.ifscCode,
        receiverAccountType: receiverBankAccount.accountType,

        // ===== PAYMENT =====
        amount,
        module,
        moduleData,
        paymentMethod: "phone",
        razorpay_order_id: razorpayOrder.id,
        paymentStatus: "pending",
        fulfillmentStatus: "pending",
    });

    // ================= RESPONSE =================
    res.status(200).json({
        success: true,
        message: "Payment initiated",
        razorpayOrderId: razorpayOrder.id,
        paymentId: payment._id,
        amount: razorpayOrder.amount, // paise
        currency: razorpayOrder.currency,
        razorpayKeyId: RAZORPAY_KEY_ID,
    });
});
const sendByBank = asyncHandler(async (req, res) => {
    const senderId = req.user._id;

    // ================= FETCH SENDER =================
    const senderDetails = await User.findById(senderId).populate({
        path: "bankAccounts",
        match: { isAcive: true },
    });
    console.log("🚀 ~ senderDetails:", senderDetails)

    if (!senderDetails) {
        throw new ApiError(404, "Sender not found");
    }

    const senderBankAccount = senderDetails.bankAccounts?.[0];
    console.log("🚀 ~ senderBankAccount:", senderBankAccount)
    if (!senderBankAccount) {
        throw new ApiError(400, "Sender active bank account not found");
    }

    // ================= BODY =================
    const {
        amount,
        accountHolderName,
        bankAccountNumber,
        ifscCode,
        accountType,
        module = "BANKACCOUNT",
        moduleData = {},
    } = req.body;

    // ================= VALIDATION =================
    if (!amount || amount <= 0) {
        throw new ApiError(400, "Invalid amount");
    }

    if (
        !accountHolderName ||
        !bankAccountNumber ||
        !ifscCode ||
        !accountType
    ) {
        throw new ApiError(400, "Receiver bank details are required");
    }

    // ================= FIND RECEIVER BANK =================
    const receiverBankAccount = await BankAccount.findOne({
        accountHolderName: accountHolderName,
        bankAccountNumber: bankAccountNumber,
        ifscCode: ifscCode,
        accountType: accountType,
        isAcive: true,
    });
    console.log("🚀 ~ receiverBankAccount:", receiverBankAccount)

    if (!receiverBankAccount) {
        throw new ApiError(404, "Receiver bank account not found");
    }

    // ================= FIND RECEIVER USER =================
    const receiverDetails = await User.findOne({
        bankAccounts: receiverBankAccount._id,
    })
    console.log("🚀 ~ receiverDetails:", receiverDetails)

    if (!receiverDetails) {
        throw new ApiError(404, "Receiver user not found");
    }

    if (senderId.toString() === receiverDetails._id.toString()) {
        throw new ApiError(400, "You cannot send money to yourself");
    }

    // ================= CREATE RAZORPAY ORDER =================
    const razorpayOrder = await createRazorpayOrder({
        userId: senderId,
        amount,
        module,
    });

    // ================= SAVE PAYMENT =================
    const payment = await Payment.create({
        // ===== SENDER =====
        senderType: "User",
        senderId,
        senderPhoneNo: senderDetails.phoneNumber,
        senderAccountHolderName: senderBankAccount.accountHolderName,
        senderBankAccountNumber: senderBankAccount.bankAccountNumber,
        senderIfscCode: senderBankAccount.ifscCode,
        senderAccountType: senderBankAccount.accountType,

        // ===== RECEIVER =====
        receiverType: "User",
        receiverId: receiverDetails._id,
        receiverPhoneNo: receiverDetails.phoneNumber,
        receiverAccountHolderName: receiverBankAccount.accountHolderName,
        receiverBankAccountNumber: receiverBankAccount.bankAccountNumber,
        receiverIfscCode: receiverBankAccount.ifscCode,
        receiverAccountType: receiverBankAccount.accountType,

        // ===== PAYMENT =====
        amount,
        module,
        moduleData,
        paymentMethod: "bank",
        razorpay_order_id: razorpayOrder.id,
        paymentStatus: "pending",
        fulfillmentStatus: "awaiting_payer",
    });

    // ================= RESPONSE =================
    res.status(200).json({
        success: true,
        message: "Bank transfer initiated successfully",
        razorpayOrderId: razorpayOrder.id,
        paymentId: payment._id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        razorpayKeyId: RAZORPAY_KEY_ID,
    });
});
const payToSelf = asyncHandler(async (req, res) => {
    const senderId = req.user._id;

    // ================= FETCH SENDER =================
    const senderDetails = await User.findById(senderId).populate({
        path: "bankAccounts",
        match: { isAcive: true },
    });
    console.log("🚀 ~ senderDetails:", senderDetails)

    if (!senderDetails) {
        throw new ApiError(404, "Sender not found");
    }

    const senderBankAccount = senderDetails.bankAccounts?.[0];
    console.log("🚀 ~ senderBankAccount:", senderBankAccount)
    if (!senderBankAccount) {
        throw new ApiError(400, "Sender active bank account not found");
    }

    // ================= BODY =================
    const {
        amount,
        accountHolderName,
        bankAccountNumber,
        ifscCode,
        accountType,
        module = "BANKACCOUNT",
        moduleData = {},
    } = req.body;

    // ================= VALIDATION =================
    if (!amount || amount <= 0) {
        throw new ApiError(400, "Invalid amount");
    }

    if (
        !accountHolderName ||
        !bankAccountNumber ||
        !ifscCode ||
        !accountType
    ) {
        throw new ApiError(400, "Receiver bank details are required");
    }

    // ================= FIND RECEIVER BANK =================
    const receiverBankAccount = await BankAccount.findOne({
        accountHolderName: accountHolderName,
        bankAccountNumber: bankAccountNumber,
        ifscCode: ifscCode,
        accountType: accountType
    });
    console.log("🚀 ~ receiverBankAccount:", receiverBankAccount)

    if (!receiverBankAccount) {
        throw new ApiError(404, "Receiver bank account not found");
    }

    // ================= FIND RECEIVER USER =================
    const receiverDetails = await User.findOne({
        bankAccounts: receiverBankAccount._id,
    })
    console.log("🚀 ~ receiverDetails:", receiverDetails)

    if (!receiverDetails) {
        throw new ApiError(404, "Receiver user not found");
    }

    // ================= CREATE RAZORPAY ORDER =================
    const razorpayOrder = await createRazorpayOrder({
        userId: senderId,
        amount,
        module,
    });

    // check sender and receiver is is same or not  ===================

    console.log("🚀 ~ receiverDetails._id:", receiverDetails._id)
    console.log("🚀 ~ senderId:", senderId)
    if (senderId.toString() !== receiverDetails._id.toString()) {
        throw new ApiError(
            400,
            "You can transfer money only to your own bank account"
        );
    }


    // ================= SAVE PAYMENT =================
    const payment = await Payment.create({
        // ===== SENDER =====
        senderType: "User",
        senderId,
        senderPhoneNo: senderDetails.phoneNumber,
        senderAccountHolderName: senderBankAccount.accountHolderName,
        senderBankAccountNumber: senderBankAccount.bankAccountNumber,
        senderIfscCode: senderBankAccount.ifscCode,
        senderAccountType: senderBankAccount.accountType,

        // ===== RECEIVER =====
        receiverType: "User",
        receiverId: receiverDetails._id,
        receiverPhoneNo: receiverDetails.phoneNumber,
        receiverAccountHolderName: receiverBankAccount.accountHolderName,
        receiverBankAccountNumber: receiverBankAccount.bankAccountNumber,
        receiverIfscCode: receiverBankAccount.ifscCode,
        receiverAccountType: receiverBankAccount.accountType,

        // ===== PAYMENT =====
        amount,
        module,
        moduleData,
        paymentMethod: "self",
        razorpay_order_id: razorpayOrder.id,
        paymentStatus: "pending",
        fulfillmentStatus: "awaiting_payer",
    });

    // ================= RESPONSE =================
    res.status(200).json({
        success: true,
        message: "Bank transfer initiated successfully",
        razorpayOrderId: razorpayOrder.id,
        paymentId: payment._id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        razorpayKeyId: RAZORPAY_KEY_ID,
    });
});

// const getHistory = asyncHandler(async (req, res) => {
//     // ================= USER ONLY =================
//     if (!req.user) {
//         throw new ApiError(401, "Unauthorized");
//     }

//     const userId = req.user._id;
//     console.log("🚀 ~ userId:", userId)

//     // ================= FETCH COMPLETED PAYMENTS =================
//     const history = await Payment.find({
//         fulfillmentStatus: "completed",
//         senderType: "User",
//         senderId: userId,
//     })
//         .sort({ createdAt: -1 })
//     console.log("🚀 ~ history:", history)
//     // .select(
//     //     "-senderBankAccountNumber -receiverBankAccountNumber -razorpay_payment_id"
//     // );

//     // ================= RESPONSE =================
//     res.status(200).json({
//         success: true,
//         count: history.length,
//         data: history,
//     });
// });
const getHistory = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;

    // ================= FETCH PAYMENTS =================
    const payments = await Payment.find({
        fulfillmentStatus: "completed",
        $or: [
            { senderId: userId },
            { receiverId: userId },
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
        const isDebited = p.senderId?.toString() === userId.toString();

        return {
            type: isDebited ? "DEBITED" : "CREDITED",
            amount: p.amount,

            paymentMethod: p.paymentMethod,
            paymentStatus: p.paymentStatus, // ✅ ADDED

            from: isDebited
                ? "You"
                : p.senderAccountHolderName || p.senderPhoneNo,

            to: isDebited
                ? p.receiverAccountHolderName || p.receiverPhoneNo || "Not Assigned"
                : "You",

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



const getBalance = asyncHandler(async (req, res) => { })

export { initiatePayment, verifyPayment, sendByPhone, sendByBank, payToSelf, getHistory, getBalance }