import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { login } from "../controllers/adminController/auth.controller.js";
const router = Router();

// // auth 
// router.route("/login").post( login_Admin);
// router.route("/forgotpassword").post( forgotpassword_Admin);
// router.route("/resetpassword").post( resetpassword_Admin);
// router.route("/refresh-token").post( refreshAccessToken_Admin);
// router.route("/logout").post(verifyJWT, logout_Admin);

// // DashBoard 
// router.route("/dashboard").post( dashboard_Admin);

// // profile 
// router.route("/displayProfile").get( displayProfile_Admin);
// router.route("/displayProfile/:id").patch( updateProfile_Admin);

// // payment 
// router.route("/displayPayment").get( displayPayment_Admin);

// // e-change
// router.route("/displayEChange").get( displayEChange_Admin);

// // coupons
// router.route("/displayCoupons").get( displayCoupons_Admin);

// // Advertisement
// router.route("/displayAds").get( displayAds_Admin);

// // RedDrop 
// router.route("/displayRedDrop").get( displayredDrop_Admin);

// //Pet Insurance
// router.route("/displayPetInsurance").get( displayPetInsurance_Admin);

// // Users List Management
// router.route("/displayUserListMAnagement").get( displayUserListMAnagement_Admin);

// // Expense Tracker
// router.route("/displayExpenseTracker").get( displayExpenseTracker_Admin);

router.route("/test").get((req, res) => {
  res.status(200).json({ message: "admin Server is running" });
});

export default router;
