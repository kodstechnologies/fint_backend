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
// const initiatePayment = asyncHandler(async (req, res) => {
//     const senderId = req.user._id;

//     const senderDetails = await User.findById(senderId).populate({
//         path: "bankAccounts",
//         match: { isActive: true },
//     });
//     console.log("🚀 ~ senderDetails:", senderDetails)
//     const senderBankAccount = senderDetails.bankAccounts[0];
//     console.log("🚀 ~ senderBankAccount:", senderBankAccount)
//     const {
//         amount,
//         receiverId,
//         module = "P2P_TRANSFER",
//         expenseId,
//         moduleData = {},
//     } = req.body;
//     console.log("🚀 ~ req.body:", req.body)
//     const modelType = await User.findById(receiverId);
//     console.log("🚀 ~ modelType:", modelType)
//     const Model = modelType ? User : Venture;
//     console.log("🚀 ~ Model:", Model)
//     let receiverDetails = null;
//     const receiverBankAccount = receiverDetails.bankAccounts[0];
//     if (receiverBankAccount) {
//         receiverDetails = await User.findOne({
//             bankAccounts: receiverBankAccount._id,
//         });
//     }
//     console.log("🚀 ~ receiverDetails:", receiverDetails)
//     // ================= VALIDATION =================
//     if (!amount || amount <= 0) {
//         throw new ApiError(400, "Invalid amount");
//     }
//     if (!receiverId) {
//         throw new ApiError(400, "Receiver is required");
//     }
//     if (senderId.toString() === receiverId) {
//         throw new ApiError(400, "You cannot send money to yourself");
//     }
//     // if (!senderBankAccount) {
//     //     throw new ApiError(400, "Sender bank account not found");
//     // }
//     if (!receiverBankAccount) {
//         throw new ApiError(400, "Receiver bank account not found");
//     }
//     // ================= CREATE RAZORPAY ORDER =================
//     const razorpayOrder = await createRazorpayOrder({
//         userId: senderId,
//         amount,
//         module,
//     });

//     // ================= SAVE PAYMENT =================
//     const payment = await Payment.create({
//         // senderType: "User",
//         // senderId,
//         // senderPhoneNo: senderDetails.phoneNumber,
//         // senderAccountHolderName: senderBankAccount.accountHolderName,
//         // senderBankAccountNumber: senderBankAccount.bankAccountNumber,
//         // senderIfscCode: senderBankAccount.ifscCode,
//         // senderAccountType: senderBankAccount.accountType,
//         // ===== SENDER =====
//         senderType: "User",
//         senderId: senderId ?? "",
//         senderName: senderDetails?.name ?? "",
//         senderPhoneNo: senderDetails?.phoneNumber ?? "",
//         senderAccountHolderName: senderBankAccount?.accountHolderName ?? "",
//         senderBankAccountNumber: senderBankAccount?.bankAccountNumber ?? "",
//         senderIfscCode: senderBankAccount?.ifscCode ?? "",
//         senderAccountType: senderBankAccount?.accountType ?? "",

//         // ===== RECEIVER =====
//         // receiverType: "User",
//         receiverType: Model === User ? "User" : "Venture",
//         receiverId,
//         receiverName:
//             receiverDetails?.firstName ||
//             receiverDetails?.name ||
//             "",
//         receiverPhoneNo: receiverDetails.phoneNumber,
//         receiverAccountHolderName: receiverBankAccount.accountHolderName,
//         receiverBankAccountNumber: receiverBankAccount.bankAccountNumber,
//         receiverIfscCode: receiverBankAccount.ifscCode,
//         receiverAccountType: receiverBankAccount.accountType,

//         // ===== PAYMENT =====
//         amount,
//         module,
//         moduleData,
//         paymentMethod: "qr",
//         expenseId,
//         razorpay_order_id: razorpayOrder.id,
//         paymentStatus: "pending",
//         fulfillmentStatus: "pending",
//     });

//     // ================= RESPONSE =================
//     res.status(200).json({
//         success: true,
//         message: "Payment initiated",
//         razorpayOrderId: razorpayOrder.id,
//         paymentId: payment._id,
//         amount: razorpayOrder.amount, // paise
//         currency: razorpayOrder.currency,
//         razorpayKeyId: RAZORPAY_KEY_ID,
//     });
// });

const initiatePayment = asyncHandler(async (req, res) => {
    // ================= SENDER (OPTIONAL) =================
    let senderId = null;
    let senderDetails = null;
    let senderBankAccount = null;

    if (req.user?._id) {
        senderId = req.user._id;

        senderDetails = await User.findById(senderId).populate({
            path: "bankAccounts",
            match: { isActive: true },
        });

        senderBankAccount = senderDetails?.bankAccounts?.[0] || null;
    }

    // ================= BODY =================
    const {
        amount,
        receiverId,
        module = "P2P_TRANSFER",
        expenseId,
        moduleData = {},
    } = req.body;

    // ================= VALIDATION =================
    if (!amount || amount <= 0) {
        throw new ApiError(400, "Invalid amount");
    }

    if (!receiverId) {
        throw new ApiError(400, "Receiver is required");
    }

    // ================= FIND RECEIVER (REQUIRED) =================
    let receiverDetails = await User.findById(receiverId).populate({
        path: "bankAccounts",
        match: { isActive: true },
    });

    let receiverType = "User";

    if (!receiverDetails) {
        receiverDetails = await Venture.findById(receiverId).populate({
            path: "bankAccounts",
            match: { isActive: true },
        });
        receiverType = "Venture";
    }

    if (!receiverDetails) {
        throw new ApiError(404, "Receiver not found");
    }

    const receiverBankAccount = receiverDetails.bankAccounts?.[0];

    if (!receiverBankAccount) {
        throw new ApiError(400, "Receiver bank account not found");
    }

    // ================= SELF TRANSFER CHECK =================
    if (senderId && senderId.toString() === receiverId.toString()) {
        throw new ApiError(400, "You cannot send money to yourself");
    }

    // ================= CREATE RAZORPAY ORDER =================
    const razorpayOrder = await createRazorpayOrder({
        userId: senderId, // can be null
        amount,
        module,
    });

    // ================= SAVE PAYMENT =================
    const payment = await Payment.create({
        // ===== SENDER (OPTIONAL) =====
        senderType: senderDetails ? "User" : null,
        senderId: senderId ?? null,
        senderName: senderDetails?.name ?? "",
        senderPhoneNo: senderDetails?.phoneNumber ?? "",
        senderAccountHolderName: senderBankAccount?.accountHolderName ?? "",
        senderBankAccountNumber: senderBankAccount?.bankAccountNumber ?? "",
        senderIfscCode: senderBankAccount?.ifscCode ?? "",
        senderAccountType: senderBankAccount?.accountType ?? "",

        // ===== RECEIVER (REQUIRED) =====
        receiverType,
        receiverId,
        receiverName: receiverDetails?.name ?? "",
        receiverPhoneNo: receiverDetails?.phoneNumber ?? "",
        receiverAccountHolderName: receiverBankAccount.accountHolderName,
        receiverBankAccountNumber: receiverBankAccount.bankAccountNumber,
        receiverIfscCode: receiverBankAccount.ifscCode,
        receiverAccountType: receiverBankAccount.accountType,

        // ===== PAYMENT =====
        amount,
        module,
        moduleData,
        paymentMethod: "qr",
        expenseId: expenseId ?? null,
        razorpay_order_id: razorpayOrder.id,
        paymentStatus: "pending",
        fulfillmentStatus: "pending",
    });

    // ================= RESPONSE =================
    res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        razorpayOrderId: razorpayOrder.id,
        paymentId: payment._id,
        amount: razorpayOrder.amount,
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
        notificationType: "payment",
        data: {
            amount: payment.amount.toString(),
            transactionType: "DEBIT",
            source: "razorpay",
            paymentId: payment._id.toString(),
            role: "sender",
        },
    });

    // 2️⃣ Receiver → CREDIT (only if receiver exists)
    if (payment.receiverId && payment.receiverType) {
        await sendNotificationByType({
            id: payment.receiverId,
            type: payment.receiverType, // "User" | "Venture"
            title: "Payment Received",
            body: `${payment.senderAccountHolderName} sent you ₹${payment.amount} 💰`,
            notificationType: "payment",
            data: {
                amount: payment.amount.toString(),
                transactionType: "CREDIT",
                source: "razorpay",
                paymentId: payment._id.toString(),
                role: "receiver",
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
    // ================= SENDER (USER - REQUIRED) =================
    const senderId = req.user?._id;
    if (!senderId) {
        throw new ApiError(401, "Unauthorized");
    }

    const senderDetails = await User.findById(senderId).populate({
        path: "bankAccounts",
        match: { isActive: true },
    });

    if (!senderDetails) {
        throw new ApiError(404, "Sender not found");
    }

    const senderBankAccount = senderDetails.bankAccounts?.[0] || null;

    // ================= BODY =================
    const {
        amount,
        phoneNumber,
        module = "PHONE",
        moduleData = {},
    } = req.body;

    // ================= VALIDATION =================
    if (!amount || amount <= 0) {
        throw new ApiError(400, "Invalid amount");
    }

    if (!phoneNumber) {
        throw new ApiError(400, "Phone number is required");
    }

    // ================= SELF TRANSFER CHECK =================
    if (phoneNumber === senderDetails.phoneNumber) {
        throw new ApiError(400, "You cannot send money to yourself");
    }

    // ================= FIND RECEIVER (VENTURE → USER) =================
    let receiverDetails = await Venture.findOne({ phoneNumber }).populate({
        path: "bankAccounts",
        match: { isActive: true },
    });

    let receiverType = "Venture";

    if (!receiverDetails) {
        receiverDetails = await User.findOne({ phoneNumber }).populate({
            path: "bankAccounts",
            match: { isActive: true },
        });
        receiverType = "User";
    }

    if (!receiverDetails) {
        throw new ApiError(400, "Only Fint users are allowed");
    }

    const receiverId = receiverDetails._id;
    const receiverBankAccount = receiverDetails.bankAccounts?.[0];

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
        senderName: senderDetails?.name ?? "",
        senderPhoneNo: senderDetails?.phoneNumber ?? "",
        senderAccountHolderName: senderBankAccount?.accountHolderName ?? "",
        senderBankAccountNumber: senderBankAccount?.bankAccountNumber ?? "",
        senderIfscCode: senderBankAccount?.ifscCode ?? "",
        senderAccountType: senderBankAccount?.accountType ?? "",

        // ===== RECEIVER =====
        receiverType, // "Venture" or "User"
        receiverId,
        receiverName: receiverDetails?.name ?? "",
        receiverPhoneNo: receiverDetails?.phoneNumber ?? "",
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
        message: "Payment initiated successfully",
        razorpayOrderId: razorpayOrder.id,
        paymentId: payment._id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        razorpayKeyId: RAZORPAY_KEY_ID,
    });
});

// const sendByPhone = asyncHandler(async (req, res) => {
//     const senderId = req.user._id;
//     console.log("🚀 ~ senderId:", senderId)
//     const senderDetails = await User.findById(senderId).populate({
//         path: "bankAccounts",
//         match: { isActive: true },
//     });
//     const senderBankAccount = senderDetails.bankAccounts[0];
//     const {
//         amount,
//         phoneNumber,
//         module = "PHONE",
//         moduleData = {},
//     } = req.body;
//     console.log("🚀 ~ req.body:", req.body)
//     const receiverId = await Venture.findOne({ phoneNumber });
//     console.log("🚀 ~ receiverId:", receiverId)
//     const receiverDetails = await Venture.findById(receiverId).populate({
//         path: "bankAccounts",
//         match: { isActive: true },
//     });
//     console.log("🚀 ~ receiverDetails:", receiverDetails)
//     if (phoneNumber == senderDetails.phoneNumber) {
//         const isventure = await User.findOne({ phoneNumber });
//         console.log("🚀 ~ isventure:", isventure)
//         if (!isventure) {
//             throw new ApiError(400, "You cannot send money to yourself");
//         }
//     }
//     // ❌ Not a Fint user
//     if (!receiverDetails) {
//         throw new ApiError(400, "Only Fint users are allowed");
//     }
//     const receiverBankAccount = receiverDetails.bankAccounts[0];
//     console.log("🚀 ~ receiverBankAccount:", receiverBankAccount)
//     // ================= VALIDATION =================
//     if (!amount || amount <= 0) {
//         throw new ApiError(400, "Invalid amount");
//     }
//     if (!receiverId) {
//         throw new ApiError(400, "Receiver is required");
//     }
//     if (senderId.toString() === receiverId) {
//         throw new ApiError(400, "You cannot send money to yourself");
//     }
//     // if (!senderBankAccount) {
//     //     throw new ApiError(400, "Sender bank account not found");
//     // }
//     if (!receiverBankAccount) {
//         throw new ApiError(400, "Receiver bank account not found");
//     }
//     // ================= CREATE RAZORPAY ORDER =================
//     const razorpayOrder = await createRazorpayOrder({
//         userId: senderId,
//         amount,
//         module,
//     });

//     // ================= SAVE PAYMENT =================
//     const payment = await Payment.create({
//         // ===== SENDER =====
//         // senderType: "User",
//         // senderId,
//         // senderPhoneNo: senderDetails.phoneNumber,
//         // senderAccountHolderName: senderBankAccount.accountHolderName,
//         // senderBankAccountNumber: senderBankAccount.bankAccountNumber,
//         // senderIfscCode: senderBankAccount.ifscCode,
//         // senderAccountType: senderBankAccount.accountType,
//         senderType: "User",
//         senderId: senderId ?? "",
//         senderName: senderDetails?.name ?? "",
//         senderPhoneNo: senderDetails?.phoneNumber ?? "",
//         senderAccountHolderName: senderBankAccount?.accountHolderName ?? "",
//         senderBankAccountNumber: senderBankAccount?.bankAccountNumber ?? "",
//         senderIfscCode: senderBankAccount?.ifscCode ?? "",
//         senderAccountType: senderBankAccount?.accountType ?? "",

//         // ===== RECEIVER =====
//         receiverType: "User",
//         receiverId,
//         receiverName:
//             receiverDetails?.firstName ||
//             receiverDetails?.name ||
//             "",
//         receiverPhoneNo: receiverDetails.phoneNumber,
//         receiverAccountHolderName: receiverBankAccount.accountHolderName,
//         receiverBankAccountNumber: receiverBankAccount.bankAccountNumber,
//         receiverIfscCode: receiverBankAccount.ifscCode,
//         receiverAccountType: receiverBankAccount.accountType,

//         // ===== PAYMENT =====
//         amount,
//         module,
//         moduleData,
//         paymentMethod: "phone",
//         razorpay_order_id: razorpayOrder.id,
//         paymentStatus: "pending",
//         fulfillmentStatus: "pending",
//     });

//     // ================= RESPONSE =================
//     res.status(200).json({
//         success: true,
//         message: "Payment initiated",
//         razorpayOrderId: razorpayOrder.id,
//         paymentId: payment._id,
//         amount: razorpayOrder.amount, // paise
//         currency: razorpayOrder.currency,
//         razorpayKeyId: RAZORPAY_KEY_ID,
//     });
// });
// const sendByBank = asyncHandler(async (req, res) => {
//     const senderId = req.user._id;

//     // ================= FETCH SENDER =================
//     const senderDetails = await User.findById(senderId).populate({
//         path: "bankAccounts",
//         match: { isActive: true },
//     });
//     console.log("🚀 ~ senderDetails:", senderDetails)

//     if (!senderDetails) {
//         throw new ApiError(404, "Sender not found");
//     }

//     const senderBankAccount = senderDetails.bankAccounts?.[0];
//     console.log("🚀 ~ senderBankAccount:", senderBankAccount)
//     if (!senderBankAccount) {
//         throw new ApiError(400, "Sender active bank account not found");
//     }

//     // ================= BODY =================
//     const {
//         amount,
//         accountHolderName,
//         bankAccountNumber,
//         ifscCode,
//         accountType,
//         module = "BANKACCOUNT",
//         moduleData = {},
//     } = req.body;

//     // ================= VALIDATION =================
//     if (!amount || amount <= 0) {
//         throw new ApiError(400, "Invalid amount");
//     }

//     if (
//         !accountHolderName ||
//         !bankAccountNumber ||
//         !ifscCode ||
//         !accountType
//     ) {
//         throw new ApiError(400, "Receiver bank details are required");
//     }

//     // ================= FIND RECEIVER BANK =================
//     const receiverBankAccount = await BankAccount.findOne({
//         accountHolderName: accountHolderName,
//         bankAccountNumber: bankAccountNumber,
//         ifscCode: ifscCode,
//         accountType: accountType,
//         isActive: true,
//     });
//     console.log("🚀 ~ receiverBankAccount:", receiverBankAccount)

//     // if (!receiverBankAccount) {
//     //     throw new ApiError(404, "Receiver bank account not found");
//     // }

//     // ================= FIND RECEIVER USER =================
//     let receiverDetails = null;

//     if (receiverBankAccount) {
//         receiverDetails = await User.findOne({
//             bankAccounts: receiverBankAccount._id,
//         });
//     }

//     console.log("🚀 ~ receiverDetails:", receiverDetails);


//     if (
//         receiverDetails &&
//         senderId.toString() === receiverDetails._id.toString()
//     ) {
//         throw new ApiError(400, "You cannot send money to yourself");
//     }


//     // ================= CREATE RAZORPAY ORDER =================
//     const razorpayOrder = await createRazorpayOrder({
//         userId: senderId,
//         amount,
//         module,
//     });

//     // ================= SAVE PAYMENT =================
//     const payment = await Payment.create({
//         // ===== SENDER =====

//         senderType: "User",
//         senderId: senderId ?? "",
//         senderName: senderDetails?.name ?? "",
//         senderPhoneNo: senderDetails?.phoneNumber ?? "",
//         senderAccountHolderName: senderBankAccount?.accountHolderName ?? "",
//         senderBankAccountNumber: senderBankAccount?.bankAccountNumber ?? "",
//         senderIfscCode: senderBankAccount?.ifscCode ?? "",
//         senderAccountType: senderBankAccount?.accountType ?? "",

//         // ===== RECEIVER =====

//         // ===== RECEIVER =====
//         receiverType: receiverDetails ? "User" : null,
//         receiverId: receiverDetails?._id ?? null,

//         receiverName:
//             receiverDetails?.firstName ||
//             receiverDetails?.name ||
//             accountHolderName,

//         receiverPhoneNo: receiverDetails?.phoneNumber ?? null,

//         receiverAccountHolderName:
//             receiverBankAccount?.accountHolderName ?? accountHolderName,

//         receiverBankAccountNumber:
//             receiverBankAccount?.bankAccountNumber ?? bankAccountNumber,

//         receiverIfscCode:
//             receiverBankAccount?.ifscCode ?? ifscCode,

//         receiverAccountType:
//             receiverBankAccount?.accountType ?? accountType,

//         // ===== PAYMENT =====
//         amount,
//         module,
//         moduleData,
//         paymentMethod: "bank",
//         razorpay_order_id: razorpayOrder.id,
//         paymentStatus: "pending",
//         fulfillmentStatus: "awaiting_payer",
//     });

//     // ================= RESPONSE =================
//     res.status(200).json({
//         success: true,
//         message: "Bank transfer initiated successfully",
//         razorpayOrderId: razorpayOrder.id,
//         paymentId: payment._id,
//         amount: razorpayOrder.amount,
//         currency: razorpayOrder.currency,
//         razorpayKeyId: RAZORPAY_KEY_ID,
//     });
// });

const sendByBank = asyncHandler(async (req, res) => {
    // ================= SENDER =================
    const senderId = req.user?._id;
    if (!senderId) {
        throw new ApiError(401, "Unauthorized");
    }

    const senderDetails = await User.findById(senderId).populate({
        path: "bankAccounts",
        match: { isActive: true },
    });

    if (!senderDetails) {
        throw new ApiError(404, "Sender not found");
    }

    // ✅ sender bank is OPTIONAL
    const senderBankAccount = senderDetails.bankAccounts?.[0] || null;

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

    if (!accountHolderName || !bankAccountNumber || !ifscCode || !accountType) {
        throw new ApiError(400, "Receiver bank details are required");
    }

    // ================= FIND RECEIVER BANK (OPTIONAL) =================
    const receiverBankAccount = await BankAccount.findOne({
        accountHolderName,
        bankAccountNumber,
        ifscCode,
        accountType,
        isActive: true,
    });

    // ================= FIND RECEIVER USER (OPTIONAL) =================
    let receiverDetails = null;

    if (receiverBankAccount) {
        receiverDetails = await User.findOne({
            bankAccounts: receiverBankAccount._id,
        });
    }

    // ================= SELF TRANSFER CHECK =================
    if (
        receiverDetails &&
        senderId.toString() === receiverDetails._id.toString()
    ) {
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
        // ===== SENDER (BANK OPTIONAL) =====
        senderType: "User",
        senderId,
        senderName: senderDetails?.name ?? "",
        senderPhoneNo: senderDetails?.phoneNumber ?? "",
        senderAccountHolderName: senderBankAccount?.accountHolderName ?? "",
        senderBankAccountNumber: senderBankAccount?.bankAccountNumber ?? "",
        senderIfscCode: senderBankAccount?.ifscCode ?? "",
        senderAccountType: senderBankAccount?.accountType ?? "",

        // ===== RECEIVER (BANK REQUIRED VIA INPUT) =====
        receiverType: receiverDetails ? "User" : null,
        receiverId: receiverDetails?._id ?? null,

        receiverName:
            receiverDetails?.firstName ||
            receiverDetails?.name ||
            accountHolderName,

        receiverPhoneNo: receiverDetails?.phoneNumber ?? null,

        receiverAccountHolderName:
            receiverBankAccount?.accountHolderName ?? accountHolderName,

        receiverBankAccountNumber:
            receiverBankAccount?.bankAccountNumber ?? bankAccountNumber,

        receiverIfscCode: receiverBankAccount?.ifscCode ?? ifscCode,

        receiverAccountType: receiverBankAccount?.accountType ?? accountType,

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
        match: { isActive: true },
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
        senderName: senderName ?? "",
        senderPhoneNo: senderDetails.phoneNumber,
        senderAccountHolderName: senderBankAccount.accountHolderName,
        senderBankAccountNumber: senderBankAccount.bankAccountNumber,
        senderIfscCode: senderBankAccount.ifscCode,
        senderAccountType: senderBankAccount.accountType,

        // ===== RECEIVER =====
        receiverType: "User",
        receiverId: receiverDetails._id,
        receiverName:
            receiverDetails?.firstName ||
            receiverDetails?.name ||
            "",
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

const getBalance = asyncHandler(async (req, res) => { })

export { initiatePayment, verifyPayment, sendByPhone, sendByBank, payToSelf, getBalance }