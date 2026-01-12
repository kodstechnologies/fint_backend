



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


const gotQrAmount = asyncHandler(async (req, res) => {
    const { razorpay_order_id } = req.body;

    if (!razorpay_order_id) {
        throw new ApiError(400, "Razorpay order ID is required");
    }

    const payment = await Payment.findOne({
        razorpay_order_id,
        paymentStatus: "captured",
        receiverId: null,
    });

    if (!payment) {
        throw new ApiError(404, "Payment not found or already claimed");
    }

    let receiverType;
    let receiverDetails;

    if (req.user) {
        receiverType = "User";
        receiverDetails = await User.findById(req.user._id).populate({
            path: "bankAccounts",
            match: { isAcive: true },
        });
    } else if (req.venture) {
        receiverType = "Venture";
        receiverDetails = await Venture.findById(req.venture._id).populate({
            path: "bankAccounts",
            match: { isAcive: true },
        });
    } else {
        throw new ApiError(401, "Invalid receiver token");
    }

    payment.receiverType = receiverType;
    payment.receiverId = receiverDetails._id;
    payment.receiverPhoneNo = receiverDetails.phoneNumber;

    const bank = receiverDetails.bankAccounts?.[0];
    if (bank) {
        payment.receiverAccountHolderName = bank.accountHolderName;
        payment.receiverBankAccountNumber = bank.bankAccountNumber;
        payment.receiverIfscCode = bank.ifscCode;
        payment.receiverAccountType = bank.accountType;
    }

    payment.fulfillmentStatus = "completed";
    payment.completedVia = "qr";

    await payment.save();

    res.status(200).json({
        success: true,
        message: "QR payment received successfully",
        paymentId: payment._id,
        receiverType,
    });
});


export {
    gotQrAmount
}