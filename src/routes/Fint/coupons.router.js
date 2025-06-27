import { Router } from "express";
import {
  createCoupon,
  getUserCouponsById,
  getVentureCouponsById,
  rejectCouponById,
  deleteCouponById
} from "../../controllers/fintConmtroller/fintCoupon.controller"; // Update path as needed

const router = Router();

/**
 * @route   POST /create
 * @desc    Create (sign up) a new Fint user
 */
router.post("/create", createCoupon);

/**
 * @route   GET /coupons/user/:id
 * @desc    Get coupons for a specific user
 */
router.get("/coupons/user/:id", getUserCouponsById);

/**
 * @route   GET /coupons/venture/:id
 * @desc    Get coupons for a specific venture
 */
router.get("/coupons/venture/:id", getVentureCouponsById);

/**
 * @route   DELETE /reject/coupons/:id
 * @desc    Reject a coupon by its ID
 */
router.delete("/reject/coupons/:id", rejectCouponById);

/**
 * @route   DELETE /delete/coupons/:id
 * @desc    Delete a coupon by its ID
 */
router.delete("/delete/coupons/:id", deleteCouponById);

export default router;
