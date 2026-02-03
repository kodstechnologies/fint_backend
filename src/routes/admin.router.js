import { Router } from "express";
// import  {verifyJWT}  from "../middlewares/auth.middleware.js";

// Import controller functions (make sure these are defined in the correct files)
import { login_Admin, forgotPasswordAdmin, resetPasswordAdmin, refreshAccessTokenAdmin, logoutAdmin } from "../controllers/adminController/auth.controller.js";
import { dashboardAdmin, getAdminAdvertisements, getAdminCoupons, getAdminPayments, getAdminProfile, getEChangeRequests, getExpenseTrackerData, getPetInsuranceRequests, getRedDropRequests, getUserList, sendNoteficationToUser, sendNoteficationToVenture, updateAdminProfile } from "../controllers/adminController/dashboard.controller.js";
import { adminverifyJWT, verifyAdminRefreshToken } from "../middlewares/auth.admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
// import { customerCartController } from "../controllers/notefication/notefication.controller.js";

const router = Router();

// notefication 
// router.post("/notify/:subCategoryId/user/:userId", customerCartController.addNotify);

/* --------------------- 🔐 Auth Routes --------------------- */
router.post("/login", login_Admin);
router.post("/forgot-password", adminverifyJWT, forgotPasswordAdmin);
router.post("/refresh-token", verifyAdminRefreshToken, refreshAccessTokenAdmin);
router.post("/logout", adminverifyJWT, logoutAdmin);
router.post("/reset-password", adminverifyJWT, resetPasswordAdmin);

/* --------------------- 📊 Dashboard --------------------- */
router.get("/dashboard", adminverifyJWT, dashboardAdmin);

/* --------------------- 👤 Profile --------------------- */
router.get("/profile", adminverifyJWT, getAdminProfile);
router.patch(
    "/editProfile",
    adminverifyJWT,
    upload.single("avatar"), // 👈 must be HERE
    updateAdminProfile
);

/* --------------------- 🔔 notefication --------------------- */

router.post("/sendUserNotefication", sendNoteficationToUser);
router.post("/sendVentureNotefication", sendNoteficationToVenture);

/* --------------------- 💳 Payment --------------------- */
router.get("/payments", adminverifyJWT, getAdminPayments);

/* --------------------- 🔁 E-Change Requests --------------------- */
router.get("/echange", adminverifyJWT, getEChangeRequests);

/* --------------------- 🎟️ Coupons --------------------- */
router.get("/coupons", adminverifyJWT, getAdminCoupons);

/* --------------------- 📢 Advertisements --------------------- */
router.get("/advertisements", adminverifyJWT, getAdminAdvertisements);

/* --------------------- 🩸 Red Drop --------------------- */
router.get("/red-drop", adminverifyJWT, getRedDropRequests);

/* --------------------- 🐶 Pet Insurance --------------------- */
router.get("/pet-insurance", adminverifyJWT, getPetInsuranceRequests);

/* --------------------- 👥 User Management --------------------- */
router.get("/users", adminverifyJWT, getUserList);

/* --------------------- 💰 Expense Tracker --------------------- */
router.get("/expense-tracker", adminverifyJWT, getExpenseTrackerData);

export default router;
