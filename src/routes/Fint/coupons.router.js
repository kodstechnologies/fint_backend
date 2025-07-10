import { Router } from "express";
import {
  createCoupon,
  // getUserCouponsById,
  getVentureCouponsById,
  rejectCouponById,
  deleteCouponById,
  displayCoupons,
  displayDeletedCoupons,
  displayExpiredCoupons
} from "../../controllers/fintConmtroller/fintCoupon.controller.js"; // Update path as needed
import { upload } from "../../middlewares/multer.middleware.js";

const router = Router();

/**
 * @route   POST /create
 * @desc    Create (sign up) a new Fint user
 */
router.post("/create",upload.single("logo"), createCoupon);
router.get("/display-all-coupons", displayCoupons);
router.get("/deleted-coupons", displayDeletedCoupons);
router.get("/expired-coupons", displayExpiredCoupons);

/**
 * @route   GET /coupons/user/:id
 * @desc    Get coupons for a specific user
 */
// router.get("/coupons/user/:id", getUserCouponsById);

/**
 * @route   GET /coupons/venture/:id
 * @desc    Get coupons for a specific venture
 */
router.get("/venture/:id", getVentureCouponsById);

/**
 * @route   DELETE /reject/coupons/:id
 * @desc    Reject a coupon by its ID
 */
router.delete("/reject/:id", rejectCouponById);

/**
 * @route   DELETE /delete/coupons/:id
 * @desc    Delete a coupon by its ID
 */
router.delete("/delete/:id", deleteCouponById);

export default router;
