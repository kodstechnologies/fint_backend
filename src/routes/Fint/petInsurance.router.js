import { Router } from "express";
import {
  getInsurancePlanById,
  applyForInsurance,
  renewInsurance,
  approveInsuranceApplication,
  rejectInsuranceApplication,
} from "../../controllers/fintConmtroller/insurance.controller.js"; // Update path as needed
import { userverifyJWT } from "../../middlewares/auth.user.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";

const router = Router();

/**
 * @route   GET /plans/:id
 * @desc    Get a specific insurance plan by ID
 * @access  Public or Protected (based on your logic)
 */
router.get("/plans/:id", getInsurancePlanById);

/**
 * @route   PATCH /applications/:id/approve
 * @desc    Approve an insurance application
 * @access  Admin
 */
router.patch("/applications/:id/approve", approveInsuranceApplication);

/**
 * @route   POST /apply
 * @desc    Apply for an insurance plan
 * @access  Protected
 */
router.post("/apply",userverifyJWT, upload.single('petNoseImg') , applyForInsurance);

/**
 * @route   POST /renew
 * @desc    Renew an existing insurance policy
 * @access  Protected
 */
router.post("/renew", renewInsurance);

/**
 * @route   DELETE /applications/:id/reject
 * @desc    Reject an insurance application
 * @access  Admin
 */
router.delete("/applications/:id/reject", rejectInsuranceApplication);

export default router;
