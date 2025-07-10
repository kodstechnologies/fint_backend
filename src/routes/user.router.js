import { Router } from "express";
import authRoutes from "./Fint/auth.router.js"; // adjust path
import payment from "./Fint/payment.router.js"; // adjust path
import adv from "./Fint/adv.router.js"; // adjust path
import petInsurance from "./Fint/petInsurance.router.js"; // adjust path
import coupons from "./Fint/coupons.router.js"; // adjust path
import redDrop from "./Fint/auth.router.js"; // adjust path
import history from "./Fint/auth.router.js"; // adjust path

const router = Router();

router.use("/auth", authRoutes);
router.use("/payment", payment);
router.use("/adv", adv);
router.use("/petInsurance", petInsurance);
router.use("/coupons", coupons);
router.use("/redDrop", redDrop);
router.use("/history", history);

export default router;
