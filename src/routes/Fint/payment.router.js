import { Router } from "express";
import {
  initiatePayment,
  verifyPayment,
  checkWalletBalance,
  transferToPhoneNumber,
  transferToBankAccount,
} from "../../controllers/fintConmtroller/payment.controller.js";
import { userverifyJWT } from "../../middlewares/auth.user.middleware.js";
import { checkPaymentStatus, createPayment } from "../../controllers/paymentGetway/phonepe.controller.js";

// import { verifyJWT } from "../../middlewares/auth.middleware.js"; // Protects user routes

const router = Router();

router.post("/create-payment", createPayment);
router.get("/payment-status/:transactionId", checkPaymentStatus);


router.post("/initiate-payment", userverifyJWT, initiatePayment);
router.post("/check-status/:transactionId", userverifyJWT, verifyPayment);
router.get("/wallet-balance", userverifyJWT, checkWalletBalance);

/**
 * @route   POST /api/payment/transfer/phone
 * @desc    Transfer money to another user using phone number
 * @access  Protected
 */
// router.post("/transfer/phone", verifyJWT, transferToPhoneNumber);

/**
 * @route   POST /api/payment/transfer/bank
 * @desc    Send money to a bank account using Razorpay Payout API
 * @access  Protected
 */
// router.post("/transfer/bank", verifyJWT, transferToBankAccount);

export default router;
