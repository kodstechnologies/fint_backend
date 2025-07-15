// export const initiatePayment = () =>{

import Payment from "../../models/payment/payment.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

    
// }
// export const verifyPayment = () =>{

// }
// export const checkWalletBalance = () =>{

// }
// export const transferToPhoneNumber = () =>{

// }
// export const transferToBankAccount = () =>{

// }


export const createPayment = asyncHandler(async (req, res) => {
  const { product, amount } = req.body;

  if (!product || !amount) {
    throw new ApiError(400, 'Product and amount are required');
  }

  const newPayment = new Payment({
    product,
    amount,
    userId: req.user._id, // from authMiddleware
    // status: 'success', // or set to 'pending' if applicable
  });

  const savedPayment = await newPayment.save();

  return res
    .status(201)
    .json(new ApiResponse(201, savedPayment, 'Payment record created successfully'));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  console.log("🚀 ~ updateStatus ~ paymentId:", req.params)
  console.log("🚀 ~ updateStatus ~ paymentId:", paymentId)
  const { status } = req.body;

  // Validate status
  const allowedStatuses = ['success', 'failed', 'pending'];
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Allowed: ${allowedStatuses.join(', ')}`);
  }

  // Find payment and ensure the logged-in user owns it
  const payment = await Payment.findById(paymentId);
  console.log("🚀 ~ updateStatus ~ payment:", payment)

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  if (payment.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized to update this payment');
  }

  // Update status
  payment.status = status;
  await payment.save();

  res
    .status(200)
    .json(new ApiResponse(200, payment, 'Payment status updated successfully'));
});
