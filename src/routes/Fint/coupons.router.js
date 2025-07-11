import { Router } from "express";
import {
  createCoupon,
  // getUserCouponsById,
  getVentureCouponsById,
  rejectCouponById,
  deleteCouponById,
  displayCoupons,
  displayDeletedCoupons,
  displayExpiredCoupons,
  displayVentureExpiredCoupons,
  displayCouponDetails,
  displayActiveCoupons
} from "../../controllers/fintConmtroller/fintCoupon.controller.js"; // Update path as needed
import { upload } from "../../middlewares/multer.middleware.js";
import { ventureVerifyRefreshToken } from "../../middlewares/auth.venture.middleware.js";
import { userverifyJWT } from "../../middlewares/auth.user.middleware.js";

const router = Router();

/**
 * @route   POST /create
 * @desc    Create (sign up) a new Fint user
 */
router.post("/create",ventureVerifyRefreshToken,upload.single("logo"), createCoupon);
router.get("/display-all-coupons", displayCoupons);

router.get("/deleted-coupons",ventureVerifyRefreshToken, displayDeletedCoupons);


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
router.get("/expired-coupons/:id", displayVentureExpiredCoupons);


router.get("/active-coupons",userverifyJWT, displayActiveCoupons);
router.get("/expired-coupons",userverifyJWT, displayExpiredCoupons);
router.get("/display-coupons-details/:id",userverifyJWT, displayCouponDetails);
router.get("/user-display-all-coupons",userverifyJWT, displayCoupons);

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
