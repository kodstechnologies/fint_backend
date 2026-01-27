import { Router } from "express";
import { userverifyJWT } from "../../middlewares/auth.user.middleware.js";
import { ventureVentureverifyJWT } from "../../middlewares/auth.venture.middleware.js";
import { getHistory, getVentureHistory } from "../../controllers/history/history.contorller.js";

const router = Router();

// user ==================
router.get("/userTransation", userverifyJWT, getHistory);
// venture ==================
router.get("/ventureTransation", ventureVentureverifyJWT, getVentureHistory);

export default router;
