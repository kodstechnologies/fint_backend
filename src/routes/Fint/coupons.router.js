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
  displayActiveCoupons,
  editCoupon,
  approveOrRejectCoupon
} from "../../controllers/fintConmtroller/fintCoupon.controller.js"; // Update path as needed
import { upload } from "../../middlewares/multer.middleware.js";
import { ventureVentureverifyJWT } from "../../middlewares/auth.venture.middleware.js";
import { userverifyJWT } from "../../middlewares/auth.user.middleware.js";

const router = Router();


router.get("/display-all-coupons", displayCoupons);

// fint venture coupons related apis 
router.get("/venture-coupons", ventureVentureverifyJWT, getVentureCouponsById);
// router.post("/create",ventureVentureverifyJWT,upload.single("img"), createCoupon);
router.post(
  "/create",
  ventureVentureverifyJWT,
  upload.single("img"), // 👈 must be "img"
  createCoupon
);

router.patch("/edit/:id", ventureVentureverifyJWT, upload.single("img"), editCoupon);
router.delete("/delete/:id", ventureVentureverifyJWT, deleteCouponById);
router.get("/deleted-coupons", ventureVentureverifyJWT, displayDeletedCoupons);
router.get("/expired-coupons/:id", ventureVentureverifyJWT, displayVentureExpiredCoupons);
router.get("/ventue-display-all-coupons", ventureVentureverifyJWT, displayCoupons);
// aprove coupon for user  ============
router.post("/approve", ventureVentureverifyJWT, approveOrRejectCoupon);


// fint user coupons related apis  
router.get("/active-coupons", userverifyJWT, displayActiveCoupons);
router.get("/expired-coupons", userverifyJWT, displayExpiredCoupons);
router.get("/display-coupons-details/:id", userverifyJWT, displayCouponDetails);
router.get("/user-display-all-coupons", userverifyJWT, displayCoupons);


router.delete("/reject/:id", rejectCouponById);


export default router;
