import { Router } from "express";
// import { checkPaymentStatus, createOrder, getUserPaymentHistory, handleWebhook, verifyPayment } from "../../controllers/paymentGetway/phonepe.controller.js";
import { eitherAuth } from "../../middlewares/auth.either.middleware.js";
import { initiatePaymentSchema } from "../../validations/payment.routes.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { getBalance, getHistory, initiatePayment, verifyPayment, sendByBank, sendByPhone } from "../../controllers/paymentGetway/payment.controller.js";
import { userverifyJWT } from "../../middlewares/auth.user.middleware.js";
const router = Router();

// router.post("/create-order", eitherAuth, validateBody(createOrderSchema), createOrder);
// router.post("/verify", eitherAuth, validateBody(verifyPaymentSchema), verifyPayment);
// router.post("/webhook", handleWebhook);
// router.get("/check/:orderId", eitherAuth, checkPaymentStatus);
// router.get("/history", eitherAuth, getUserPaymentHistory);

// ========================== fint  ===============================
router.post("/initiate", userverifyJWT, validateBody(initiatePaymentSchema), initiatePayment);
router.post("/verify", userverifyJWT, verifyPayment);

router.post("/send/phone", userverifyJWT, sendByPhone);
router.post("/send/bank", userverifyJWT, sendByBank);

router.get("/history", userverifyJWT, getHistory);
router.get("/wallet/balance", userverifyJWT, getBalance);

// ========================== fint venture  ===============================

export default router;
