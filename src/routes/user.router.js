import { Router } from "express";
import authRoutes from "./Fint/auth.router.js"; // adjust path
import payment from "./Fint/payment.router.js"; // adjust path
import adv from "./Fint/adv.router.js"; // adjust path
import petInsurance from "./Fint/petInsurance.router.js"; // adjust path
import coupons from "./Fint/auth.router.js"; // adjust path
import redDrop from "./Fint/auth.router.js"; // adjust path
import history from "./Fint/auth.router.js"; // adjust path

const router = Router();

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/payment", payment);
app.use("/adv", adv);
app.use("/petInsurance", petInsurance);
app.use("/coupons", coupons);
app.use("/redDrop", redDrop);
app.use("/history", history);

export default router;
