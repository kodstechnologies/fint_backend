import { Router } from "express";
import { getTransactionHistory } from "../../controllers/fintConmtroller/history.controller.js"; // Adjust the path if needed
// import { verifyJWT } from "../middlewares/auth.middleware.js"; // Protect the route

const router = Router();

/**
 * @route   GET /transactions/history
 * @desc    Get user's transaction history
 * @access  Protected
 */
// router.get("/transactions/history", verifyJWT, getTransactionHistory);

export default router;
