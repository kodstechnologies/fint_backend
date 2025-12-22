import { Router } from "express";
import { checkPaymentStatus, createOrder, getUserPaymentHistory, handleWebhook, verifyPayment } from "../../controllers/paymentGetway/phonepe.controller.js";
import { eitherAuth } from "../../middlewares/auth.either.middleware.js";
import { createOrderSchema, verifyPaymentSchema } from "../../validations/payment.routes.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
const router = Router();

router.post("/create-order", eitherAuth, validateBody(createOrderSchema), createOrder);
router.post("/verify", eitherAuth, validateBody(verifyPaymentSchema), verifyPayment);
router.post("/webhook", handleWebhook);
router.get("/check/:orderId", eitherAuth, checkPaymentStatus);
router.get("/history", eitherAuth, getUserPaymentHistory);

export default router;
