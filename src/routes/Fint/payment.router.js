import { Router } from "express";
import {
  initiatePayment,
  verifyPayment,
  checkWalletBalance,
  transferToPhoneNumber,
  transferToBankAccount,
} from "../../controllers/payment.controller.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js"; // Protects user routes

const router = Router();

/**
 * @route   POST /api/payment/initiate
 * @desc    Create Razorpay order to add money to wallet
 * @access  Protected
 */
router.post("/initiate", verifyJWT, initiatePayment);

/**
 * @route   POST /api/payment/verify
 * @desc    Verify Razorpay payment signature and credit wallet
 * @access  Protected
 */
router.post("/verify", verifyJWT, verifyPayment);

/**
 * @route   GET /api/payment/wallet-balance
 * @desc    Get current user's wallet balance
 * @access  Protected
 */
router.get("/wallet-balance", verifyJWT, checkWalletBalance);

/**
 * @route   POST /api/payment/transfer/phone
 * @desc    Transfer money to another user using phone number
 * @access  Protected
 */
router.post("/transfer/phone", verifyJWT, transferToPhoneNumber);

/**
 * @route   POST /api/payment/transfer/bank
 * @desc    Send money to a bank account using Razorpay Payout API
 * @access  Protected
 */
router.post("/transfer/bank", verifyJWT, transferToBankAccount);

export default router;
