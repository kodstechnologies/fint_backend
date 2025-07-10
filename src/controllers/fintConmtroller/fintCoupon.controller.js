
import Joi from "joi";
import Coupon from "../../models/coupon/coupon.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import mongoose from "mongoose";

// ✅ 1. Joi schema for coupon validation
const couponSchema = Joi.object({
  couponTitle: Joi.string().trim().required().messages({
    "string.empty": "Coupon title is required",
  }),
  logo: Joi.string().uri().optional().allow(null, "").messages({
    "string.uri": "Logo must be a valid URL",
  }),
  offerTitle: Joi.string().trim().required().messages({
    "string.empty": "Offer title is required",
  }),
  offerDescription: Joi.string().trim().required().messages({
    "string.empty": "Offer description is required",
  }),
  termsAndConditions: Joi.string().trim().required().messages({
    "string.empty": "Terms & Conditions are required",
  }),
  expiryDate: Joi.date().required().messages({
    "date.base": "Expiry date must be a valid date",
    "any.required": "Expiry date is required",
  }),
  offerDetails: Joi.string().optional().allow(""),
  aboutCompany: Joi.string().optional().allow(""),
  claimPercentage: Joi.number().min(0).max(100).optional().messages({
    "number.base": "Claim percentage must be a number",
    "number.min": "Claim percentage cannot be less than 0",
    "number.max": "Claim percentage cannot exceed 100",
  }),
  createdByVenture: Joi.string().required().messages({
    "string.empty": "CreatedBy Venture ID is required",
  }),
});

// ✅ 2. Controller to handle creation
export const createCoupon = asyncHandler(async (req, res) => {
  console.log("📥 req.body:", req.body);
  console.log("📁 req.file:", req.file);

  // 1. Handle logo path (if file uploaded)
  const logoUrl = req.file ? req.file.path || req.file.location : null;

  // 2. Combine body + file data
  const formData = {
    ...req.body,
    logo: logoUrl,
  };

  // 3. Joi Validation
  const { error, value } = couponSchema.validate(formData, { abortEarly: false });

  if (error) {
    throw new ApiError(
      400,
      "Validation error",
      error.details.map((err) => err.message)
    );
  }

  // 4. Save new coupon
  const newCoupon = new Coupon(value);
  const savedCoupon = await newCoupon.save();

  res
    .status(201)
    .json(new ApiResponse(201, savedCoupon, "Coupon created successfully"));
});

export const displayCoupons = asyncHandler(async (req, res) => {
  try {
    // 1. Auto-expire any outdated coupons (optional, but useful)
    const now = new Date();
    await Coupon.updateMany(
      { expiryDate: { $lte: now }, status: "active" },
      { $set: { status: "expired" } }
    );

    // 2. Fetch all coupons, sorted by newest first
    const couponsRaw = await Coupon.find().sort({ createdAt: -1 });

    // 3. Format for frontend (optional)
    const coupons = couponsRaw.map((coupon) => ({
      id: coupon._id,
      title: coupon.couponTitle,
      logo: coupon.logo,
      offerTitle: coupon.offerTitle,
      offerDescription: coupon.offerDescription,
      expiryDate: coupon.expiryDate,
      status: coupon.status,
      claimPercentage: coupon.claimPercentage,
      viewCount: coupon.viewCount,
      createdAt: coupon.createdAt,
    }));

    // 4. Group by status
    const statusCounts = await Coupon.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusSummary = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // 5. Return response
    res.status(200).json(
      new ApiResponse(200, {
        couponCount: coupons.length,
        statusSummary, // { active: X, expired: Y, ... }
        coupons,
      }, "Coupons fetched successfully.")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to fetch coupons", [error.message]);
  }
});


export const displayDeletedCoupons = asyncHandler(async (req, res) => {
  // 1. Fetch coupons with status "deleted"
  const deletedCoupons = await Coupon.find({ status: "deleted" }).sort({ createdAt: -1 });

  // 2. Format response (optional - customize fields)
  const coupons = deletedCoupons.map(coupon => ({
    id: coupon._id,
    title: coupon.couponTitle,
    logo: coupon.logo,
    offerTitle: coupon.offerTitle,
    offerDescription: coupon.offerDescription,
    expiryDate: coupon.expiryDate,
    claimPercentage: coupon.claimPercentage,
    viewCount: coupon.viewCount,
    createdAt: coupon.createdAt,
    status: coupon.status
  }));

  // 3. Respond
  res.status(200).json(
    new ApiResponse(200, {
      count: coupons.length,
      coupons,
    }, "Deleted coupons fetched successfully.")
  );
});

export const displayExpiredCoupons = asyncHandler(async (req, res) => {
  // 1. Find coupons with status "expired"
  const expiredCoupons = await Coupon.find({ status: "expired" }).sort({ createdAt: -1 });

  // 2. Format response data if needed
  const coupons = expiredCoupons.map(coupon => ({
    id: coupon._id,
    title: coupon.couponTitle,
    logo: coupon.logo,
    offerTitle: coupon.offerTitle,
    offerDescription: coupon.offerDescription,
    expiryDate: coupon.expiryDate,
    claimPercentage: coupon.claimPercentage,
    viewCount: coupon.viewCount,
    createdAt: coupon.createdAt,
    status: coupon.status
  }));

  // 3. Send response
  res.status(200).json(
    new ApiResponse(200, {
      count: coupons.length,
      coupons,
    }, "Expired coupons fetched successfully.")
  );
});

export const getUserCouponsById = () =>{

}

export const getVentureCouponsById = asyncHandler(async (req, res) => {
    console.log("venture details");
    
  const { id } = req.params;
  console.log("🚀 ~ getVentureCouponsById ~ id:", id)

  // ✅ Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Venture ID");
  }

  // ✅ Fetch all coupons created by the given venture
  const coupons = await Coupon.find({ createdByVenture: id }).sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, coupons, `Coupons created by Venture ${id} fetched successfully`)
  );
});
export const rejectCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Find the coupon
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  // 2. Update status to "rejected"
  coupon.status = "rejected";
  await coupon.save();

  // 3. Send response
  res.status(200).json(
    new ApiResponse(200, coupon, "Coupon status updated to 'rejected'")
  );
});
export const deleteCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Find the coupon by ID
  const coupon = await Coupon.findById(id);

  // 2. Handle not found
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  // 3. Update status to "deleted"
  coupon.status = "deleted";
  await coupon.save();

  // 4. Respond
  res.status(200).json(
    new ApiResponse(200, coupon, "Coupon status updated to 'deleted'")
  );
});

