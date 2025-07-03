import { Router } from "express";
// === Controllers: Fint ===
import {
  signUp_Fint,
  login_Fint,
  checkOTP_Fint,
  profile_Fint,
  renewAccessToken_Fint,
  logoutUser,
  editProfile_Fint,
} from "../../controllers/fintConmtroller/fintAuth.controller.js";

// === Controllers: Ventures ===
import {
  signUp_Ventures,
  login_Ventures,
  checkOTP_Ventures,
  profile_Ventures,
  renewAccessToken_Ventures,
  logoutVenture,
} from "../../controllers/fintConmtroller/venturesAuth.controller.js";
import { userverifyJWT, verifyRefreshToken } from "../../middlewares/auth.user.middleware.js";
import { ventureVentureverifyJWT, ventureVerifyRefreshToken } from "../../middlewares/auth.venture.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";

const router = Router();

/* ===================================
   🔐 FINT AUTH ROUTES
=================================== */
router.post("/fint/sign-up", signUp_Fint);
router.post("/fint/login", login_Fint);
router.post("/fint/check-otp", checkOTP_Fint);
router.get("/fint/profile",userverifyJWT, profile_Fint);
router.patch("/fint/update-profile",userverifyJWT, upload.single("avatar") ,editProfile_Fint);
router.get("/fint/renew-access-token", verifyRefreshToken, renewAccessToken_Fint);
router.post("/fint/logout", userverifyJWT, logoutUser);

/* ===================================
   🔐 VENTURES AUTH ROUTES
=================================== */
router.post("/ventures/sign-up", signUp_Ventures);
router.post("/ventures/login", login_Ventures);
router.post("/ventures/check-otp", checkOTP_Ventures);
router.get("/ventures/profile", ventureVentureverifyJWT, profile_Ventures);
router.get("/ventures/renew-access-token", ventureVerifyRefreshToken, renewAccessToken_Ventures);
router.get("/ventures/logout", userverifyJWT, logoutVenture);

export default router;
