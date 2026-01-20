import Payment from "../../models/payment/payment.model.js";
import { User } from "../../models/user.model.js";
import { Venture } from "../../models/venture.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import config from "../../config/index.js";
import crypto from "crypto";
const { PAYMENT_WEBHOOK_SECRET } = config;

const gotQrAmount = asyncHandler(async (req, res) => {
    const { razorpay_order_id } = req.body;
    console.log("🚀 ~ razorpay_order_id:", razorpay_order_id)

    if (!razorpay_order_id) {
        throw new ApiError(400, "Razorpay order ID is required");
    }

    const payment = await Payment.findOne({
        razorpay_order_id,
        paymentStatus: "success",
        receiverId: null,
    });
    console.log("🚀 ~ payment:", payment)

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


const paymentWebhook = async (req, res) => {
    try {
        const secret = PAYMENT_WEBHOOK_SECRET;
        console.log("🚀 ~ paymentWebhook ~ secret: 😁😁😁😁😁😁😁😁😁😁😁😁😁😁😁😁😁😁😁😁😁", secret)

        // 🔐 1️⃣ Verify Razorpay signature
        const razorpaySignature = req.headers["x-razorpay-signature"];
        console.log("🚀 ~ paymentWebhook ~ razorpaySignature:", razorpaySignature)

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(req.body)
            .digest("hex");
        console.log("🚀 ~ paymentWebhook ~ expectedSignature:", expectedSignature)

        if (razorpaySignature !== expectedSignature) {
            return res.status(400).send("Invalid webhook signature");
        }

        // 2️⃣ Parse payload
        const event = JSON.parse(req.body.toString());
        console.log("🚀 ~ paymentWebhook ~ event:", event)

        const eventType = event.event;
        console.log("🚀 ~ paymentWebhook ~ eventType:", eventType)
        const paymentEntity = event.payload?.payment?.entity;

        if (!paymentEntity) {
            return res.status(200).json({ message: "No payment entity" });
        }

        const razorpay_payment_id = paymentEntity.id;
        const razorpay_order_id = paymentEntity.order_id;
        const amount = paymentEntity.amount / 100; // paise → rupees
        const status = paymentEntity.status; // captured | failed

        // 3️⃣ Find payment record
        const payment = await Payment.findOne({ razorpay_order_id });

        if (!payment) {
            return res.status(200).json({ message: "Payment record not found" });
        }

        // 4️⃣ Idempotency check
        if (payment.paymentStatus === "success") {
            return res.status(200).json({ message: "Already processed" });
        }

        // 5️⃣ Handle success
        if (eventType === "payment.captured" && status === "captured") {
            payment.razorpay_payment_id = razorpay_payment_id;
            payment.paymentStatus = "success";
            payment.fulfillmentStatus = "completed";
            payment.completedVia = "webhook";
            await payment.save();

            // 💰 Credit receiver wallet
            if (payment.receiverId && payment.receiverType) {
                await Wallet.updateOne(
                    {
                        ownerId: payment.receiverId,
                        ownerType: payment.receiverType,
                    },
                    { $inc: { balance: amount } }
                );

                // 🔔 Notify receiver
                await sendNotificationByType({
                    id: payment.receiverId,
                    type: payment.receiverType,
                    title: "Payment Received 💰",
                    body: `₹${amount} credited to your wallet`,
                    notificationType: "payment"
                });
            }
        }

        // 6️⃣ Handle failure
        if (eventType === "payment.failed") {
            payment.paymentStatus = "failed";
            payment.fulfillmentStatus = "failed";
            payment.completedVia = "webhook";
            await payment.save();
            // 🔔 Notify sender (THIS IS THE RIGHT PLACE)
            await sendNotificationByType({
                id: payment.senderId,
                type: payment.senderType, // "User"
                title: "Payment Failed ❌",
                body: `Payment of ₹${payment.amount} to ${payment.receiverAccountHolderName} could not be completed.`,
                notificationType: "payment"
            });
        }

        // ✅ Must always return 200
        return res.status(200).json({ received: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        return res.status(500).send("Webhook processing failed");
    }
};
export {
    gotQrAmount,
    paymentWebhook
}