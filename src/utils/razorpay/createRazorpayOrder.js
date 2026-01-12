import Razorpay from "razorpay";
import config from "../../config/index.js";

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } = config;

// ================= RAZORPAY INIT =================
const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async ({
    userId,
    amount,
    module,
    currency = "INR",
}) => {
    const receipt = `${module.slice(0, 3)}_${userId
        .toString()
        .slice(-6)}_${Date.now()}`;

    return await razorpayInstance.orders.create({
        amount: Math.round(amount * 100), // paise
        currency,
        receipt,
        notes: {
            userId: userId.toString(),
            module,
        },
    });
};