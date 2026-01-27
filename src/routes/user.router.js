import { Router } from "express";
import authRoutes from "./Fint/auth.router.js"; // adjust path
import payment from "./Fint/payment.router.js"; // adjust path
import adv from "./Fint/adv.router.js"; // adjust path
import petInsurance from "./Fint/petInsurance.router.js"; // adjust path
import coupons from "./Fint/coupons.router.js"; // adjust path
import redDrop from "./Fint/auth.router.js"; // adjust path
import history from "./Fint/history.router.js"; // adjust path
import notefication from "./Fint/notefication.router.js";
import expense from "./Fint/expense.router.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/payment", payment);
router.use("/adv", adv);
router.use("/petInsurance", petInsurance);
router.use("/coupons", coupons);
router.use("/redDrop", redDrop);
router.use("/history", history);
router.use("/notefication", notefication);
router.use("/expense", expense);


export default router;
