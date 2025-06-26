import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

// === Controllers: Fint ===
import {
  signUp_Fint,
  login_Fint,
  checkOTP_Fint,
  forgotPassword_Fint,
  coupons_Fint,
} from "../../controllers/fintConmtroller/fintAuth.controller.js";

// === Controllers: Ventures ===
import {
  signUp_Ventures,
  login_Ventures,
  checkOTP_Ventures,
  forgotPassword_Ventures,
  coupons_Ventures,
} from "../../controllers/fintConmtroller/venturesAuth.controller.js";

const router = Router();

/* ===================================
   🔐 FINT AUTH ROUTES
=================================== */
router.post("/fint/sign-up", signUp_Fint);
router.post("/fint/login", login_Fint);
router.post("/fint/check-otp", checkOTP_Fint);
router.post("/fint/forgot-password", forgotPassword_Fint);
router.get("/fint/profile", verifyJWT, coupons_Fint);

/* ===================================
   🔐 VENTURES AUTH ROUTES
=================================== */
router.post("/ventures/sign-up", signUp_Ventures);
router.post("/ventures/login", login_Ventures);
router.post("/ventures/check-otp", checkOTP_Ventures);
router.post("/ventures/forgot-password", forgotPassword_Ventures);
router.get("/ventures/profile", verifyJWT, coupons_Ventures);

export default router;
