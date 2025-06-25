import { Router } from "express";
import { login_User } from "../../controllers/auth.controller.js"; // make sure this is imported
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// ✅ Login route
router.post("/login", login_User);

// 🛑 Uncomment and use when needed
// router.post("/logout", verifyJWT, logoutUser);
// router.post("/refresh-token", refreshAccessToken);

// ✅ Test route to confirm server status
router.get("/test", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

export default router;
