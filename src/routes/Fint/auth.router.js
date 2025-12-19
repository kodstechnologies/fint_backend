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
  deleteAccount_Fint,
  CreateBankAccount_Fint,
  GetBankAccounts_Fint,
  UpdateBankAccount_Fint,
  DeleteBankAccount_Fint,
  Get_Single_BankAccount_Fint,
} from "../../controllers/fintConmtroller/fintAuth.controller.js";

// === Controllers: Ventures ===
import {
  signUp_Ventures,
  login_Ventures,
  checkOTP_Ventures,
  profile_Ventures,
  renewAccessToken_Ventures,
  logoutVenture,
  editProfile_Ventures,
  deleteAccount_Ventures,
  CreateBankAccount_ventures,
  GetBankAccounts_ventures,
  Get_Single_BankAccount_ventures,
  UpdateBankAccount_ventures,
  DeleteBankAccount_ventures,
} from "../../controllers/fintConmtroller/venturesAuth.controller.js";
import { userverifyJWT, verifyRefreshToken } from "../../middlewares/auth.user.middleware.js";
import { ventureVentureverifyJWT, ventureVerifyRefreshToken } from "../../middlewares/auth.venture.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { BankAccount } from "../../models/BankAccount.model.js";

const router = Router();

/* ===================================
   🔐 FINT AUTH ROUTES
=================================== */
router.post("/fint/sign-up", signUp_Fint);
router.post("/fint/login", login_Fint);
router.post("/fint/check-otp", checkOTP_Fint);
router.get("/fint/profile", userverifyJWT, profile_Fint);
router.patch("/fint/update-profile", userverifyJWT, upload.single("avatar"), editProfile_Fint);
router.get("/fint/renew-access-token", verifyRefreshToken, renewAccessToken_Fint);
router.post("/fint/logout", userverifyJWT, logoutUser);
router.delete("/fint/delete-account", userverifyJWT, deleteAccount_Fint);

// ===================== BankAccount APIs =====================

// 1️⃣ POST – Add Bank Account
router.post(
  "/fint/add-bank-account", userverifyJWT,
  CreateBankAccount_Fint
);
// 2️⃣ GET – Get All Bank Accounts
router.get(
  "/fint/get-bank-accounts", userverifyJWT,
  GetBankAccounts_Fint
);
router.get(
  "/fint/get-single-bank-accounts/:bankAccountId", userverifyJWT,
  Get_Single_BankAccount_Fint
);

// 3️⃣ PATCH – Update Bank Account
router.patch(
  "/fint/update-bank-account/:bankAccountId",
  userverifyJWT,
  UpdateBankAccount_Fint
);

// 4️⃣ DELETE – Delete Bank Account
router.delete(
  "/fint/delete-bank-account/:bankAccountId",
  userverifyJWT,
  DeleteBankAccount_Fint
);


/* ===================================
   🔐 VENTURES AUTH ROUTES
=================================== */
router.post("/ventures/sign-up", signUp_Ventures);
router.post("/ventures/login", login_Ventures);
router.post("/ventures/check-otp", checkOTP_Ventures);
router.get("/ventures/profile", ventureVentureverifyJWT, profile_Ventures);
router.patch("/ventures/update-profile", ventureVentureverifyJWT, upload.single("avatar"), editProfile_Ventures);
router.get("/ventures/renew-access-token", ventureVerifyRefreshToken, renewAccessToken_Ventures);
router.post("/ventures/logout", ventureVerifyRefreshToken, logoutVenture);
router.delete("/ventures/delete-account", ventureVentureverifyJWT, deleteAccount_Ventures);

// ===================== BankAccount APIs =====================

// 1️⃣ POST – Add Bank Account
router.post(
  "/ventures/add-bank-account", ventureVentureverifyJWT,
  CreateBankAccount_ventures
);

// 2️⃣ GET – Get All Bank Accounts
router.get(
  "/ventures/get-bank-accounts", ventureVentureverifyJWT,
  GetBankAccounts_ventures
);
router.get(
  "/ventures/get-single-bank-accounts/:bankAccountId", ventureVentureverifyJWT,
  Get_Single_BankAccount_ventures
);

// 3️⃣ PATCH – Update Bank Account
router.patch(
  "/ventures/update-bank-account/:bankAccountId",
  ventureVentureverifyJWT,
  UpdateBankAccount_ventures
);

// 4️⃣ DELETE – Delete Bank Account
router.delete(
  "/ventures/delete-bank-account/:bankAccountId",
  ventureVentureverifyJWT,
  DeleteBankAccount_ventures
);

export default router;