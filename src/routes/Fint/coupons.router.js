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
import { ventureVentureverifyJWT } from "../../middlewares/auth.venture.middleware.js";
import { userverifyJWT } from "../../middlewares/auth.user.middleware.js";

const router = Router();

/**
 * @route   POST /create
 * @desc    Create (sign up) a new Fint user
 */

router.get("/display-all-coupons", displayCoupons);



// fint venture coupons related apis 
router.post("/create",ventureVentureverifyJWT,upload.single("logo"), createCoupon);
router.get("/deleted-coupons",ventureVentureverifyJWT, displayDeletedCoupons);
router.get("/venture/:id",ventureVentureverifyJWT, getVentureCouponsById);
router.get("/expired-coupons/:id", ventureVentureverifyJWT,displayVentureExpiredCoupons);
router.get("/ventue-display-all-coupons",ventureVentureverifyJWT, displayCoupons);


// fint user coupons related apis  
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
