import { Router } from "express";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { userverifyJWT } from "../../middlewares/auth.user.middleware.js";
import { ventureVentureverifyJWT } from "../../middlewares/auth.venture.middleware.js";
import { eitherAuth } from "../../middlewares/auth.either.middleware.js";
// import {
//     initiatePaymentSchema,
//     electronicChangesSchema,
// } from "../../validations/payment.routes.js";

import { displayUnusedEChanges, electronicChanges, verifyPaymentForVenture } from "../../controllers/paymentGetway/paymentVenture.controller.js"


import { electronicChangesSchema, initiatePaymentSchema, initiatePaymentSchemaByBankAccount, initiatePaymentSchemaByPhone } from "../../validations/payment.routes.js";
import { getBalance, initiatePayment, payToSelf, sendByBank, sendByPhone, verifyPayment } from "../../controllers/paymentGetway/payment.controller.js";
import { gotQrAmount, paymentWebhook } from "../../controllers/paymentGetway/phonepe.controller.js";

const router = Router();

// ================= WEBHOOK =================
// ⚠️ NO AUTH MIDDLEWARE HERE
router.post(
    "/webhook/payment",
    paymentWebhook
);


// ================= USER =================
router.post(
    "/initiate",
    userverifyJWT,
    validateBody(initiatePaymentSchema),
    initiatePayment
);

router.post("/verify", userverifyJWT, verifyPayment);
router.post("/send/phone", userverifyJWT, validateBody(initiatePaymentSchemaByPhone), sendByPhone);
router.post("/send/bank", userverifyJWT, validateBody(initiatePaymentSchemaByBankAccount), sendByBank);
router.post(
    "/send/self",
    userverifyJWT,
    validateBody(initiatePaymentSchemaByBankAccount),
    payToSelf
);



router.get("/wallet/balance", userverifyJWT, getBalance);

// ================= VENTURE =================
router.post(
    "/e-change",
    ventureVentureverifyJWT,
    validateBody(electronicChangesSchema),
    electronicChanges
);
router.post("/verify-e-change", ventureVentureverifyJWT, verifyPaymentForVenture);
router.get("/unused", ventureVentureverifyJWT, displayUnusedEChanges);
// ================= USER / VENTURE =================
router.post("/qr/verify", eitherAuth, gotQrAmount);


export default router;
