import { Router } from "express";
import { applyForBlood } from "../../controllers/fintConmtroller/redDrop.controller";

const router = Router();

/**
 * @route   POST /apply
 * @desc    Apply for an insurance plan
 * @access  Protected
 */
router.post("/apply", applyForBlood);

export default router;