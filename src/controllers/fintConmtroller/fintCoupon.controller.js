
import Joi from "joi";
import Coupon from "../../models/coupon/coupon.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import mongoose from "mongoose";
import { putObject } from "../../utils/aws/putObject.js"
import { User } from "../../models/user.model.js";

// ✅ 1. Joi schema for coupon validation
const couponSchema = Joi.object({
  couponTitle: Joi.string().trim().required(),
  img: Joi.string().uri().optional().allow(null, ""),
  offerTitle: Joi.string().trim().required(),
  offerDescription: Joi.string().trim().required(),
  termsAndConditions: Joi.string().trim().required(),
  expiryDate: Joi.date().required(),
  offerDetails: Joi.string().optional().allow(""),
  aboutCompany: Joi.string().optional().allow(""),
  claimPercentage: Joi.number().min(0).max(100).optional(),
  createdBy: Joi.string().optional(), // ✅ make optional
}).unknown(true); // ✅ Allow extra fields like createdBy


const editCouponSchema = Joi.object({
  couponTitle: Joi.string().min(3).optional(),
  couponCode: Joi.string().alphanum().min(3).optional(),
  discountType: Joi.string().optional(),
  discountValue: Joi.number().min(0).optional(),
  expiryDate: Joi.date().optional(),

  img: Joi.string().optional().allow(null, ""),

  // ✅ Add the following fields
  offerTitle: Joi.string().optional(),
  offerDescription: Joi.string().optional(),
  termsAndConditions: Joi.string().optional(),
  offerDetails: Joi.string().optional(),
  aboutCompany: Joi.string().optional(),
});


// ✅ 2. Controller to handle creation
export const createCoupon = asyncHandler(async (req, res) => {
  if (!req.venture) {
    throw new ApiError(401, "Unauthorized");
  }
  console.log(req.file, "-----------------");

  const ventureId = req.venture._id;
  console.log("🚀 ~ ventureId:", ventureId)
  let imgUrl = null;

  // ✅ UPLOAD IMAGE TO AWS S3
  if (req.file) {
    const fileName = `coupons/${ventureId}/${Date.now()}-${req.file.originalname}`;
    const { url } = await putObject(req.file, fileName);
    imgUrl = url;
  }

  const formData = {
    ...req.body,
    img: imgUrl, // ✅ S3 URL stored
    createdBy: ventureId.toString(),
  };

  const { error, value } = couponSchema.validate(formData, {
    abortEarly: false,
  });

  if (error) {
    throw new ApiError(
      400,
      "Validation error",
      error.details.map((err) => err.message)
    );
  }

  const savedCoupon = await Coupon.create(value);

  res.status(201).json(
    new ApiResponse(201, savedCoupon, "Coupon created successfully")
  );
});

export const getVentureCouponsById = asyncHandler(async (req, res) => {
  console.log("🔐 Venture details from token middleware");

  const ventureId = req.venture?._id;
  console.log("🚀 ~ getVentureCouponsById ~ ventureId:", ventureId);

  if (!mongoose.Types.ObjectId.isValid(ventureId)) {
    throw new ApiError(400, "Invalid Venture ID");
  }

  // ✅ Fetch all coupons created by this venture
  const coupons = await Coupon.find({ createdBy: ventureId }).sort({ createdAt: -1 });

  // ✅ Count by status
  const statusCounts = {
    active: 0,
    expired: 0,
    deleted: 0,
    rejected: 0,
    claimed: 0
  };

  coupons.forEach((coupon) => {
    const status = coupon.status;
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
  });

  // ✅ Response
  res.status(200).json(
    new ApiResponse(
      200,
      {
        total: coupons.length,
        statusCounts,
        coupons,
      },
      `Coupons created by Venture ${ventureId} fetched successfully`
    )
  );
});
// export const editCoupon = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   console.log("🚀 ~ req.params:", req.params)

//   const existingCoupon = await Coupon.findById(id);
//   if (!existingCoupon) {
//     throw new ApiError(404, "Coupon not found");
//   }
//   console.log("file", req.file);


//   // 🖼️ Handle img update (optional)
//   const imgUrl = req.file ? req.file.path || req.file.location : existingCoupon.img;
//   console.log("🚀 ~ imgUrl:", imgUrl)
//   console.log("🚀 ~ imgUrl:", imgUrl)
//   console.log("🚀 ~ imgUrl:", imgUrl)

//   // Combine fields from request
//   const updatedData = {
//     ...req.body,
//     img: imgUrl,
//   };

//   // Joi Validation
//   const { error, value } = editCouponSchema.validate(updatedData, { abortEarly: false });

//   if (error) {
//     throw new ApiError(
//       400,
//       "Validation failed",
//       error.details.map((err) => err.message)
//     );
//   }

//   // Perform the update
//   const updatedCoupon = await Coupon.findByIdAndUpdate(id, value, {
//     new: true,
//     runValidators: true,
//   });

//   res
//     .status(200)
//     .json(new ApiResponse(200, updatedCoupon, "Coupon updated successfully"));
// });
export const editCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.venture) {
    throw new ApiError(401, "Unauthorized");
  }

  const existingCoupon = await Coupon.findById(id);
  if (!existingCoupon) {
    throw new ApiError(404, "Coupon not found");
  }

  let imgUrl = existingCoupon.img;

  // ✅ Upload new image to S3 if provided
  if (req.file) {
    const ventureId = req.venture._id;
    const fileName = `coupons/${ventureId}/${Date.now()}-${req.file.originalname}`;
    const { url } = await putObject(req.file, fileName);
    imgUrl = url;
  }

  // Merge request data
  const updatedData = {
    ...req.body,
    img: imgUrl,
  };

  // ✅ Joi validation
  const { error, value } = editCouponSchema.validate(updatedData, {
    abortEarly: false,
  });

  if (error) {
    throw new ApiError(
      400,
      "Validation failed",
      error.details.map((err) => err.message)
    );
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(id, value, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(
    new ApiResponse(200, updatedCoupon, "Coupon updated successfully")
  );
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
      img: coupon.img,
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

export const couponDetails = asyncHandler(async (req, res) => {
  const { userId, couponId } = req.body;

  // ================= FIND USER =================
  const userDetails = await User.findById(userId).select(
    "name phoneNumber email"
  );

  if (!userDetails) {
    throw new ApiError(404, "User not found");
  }

  // ================= FIND COUPON =================
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  // ================= CHECK EXPIRY (READ ONLY) =================
  let couponStatus = coupon.status;
  if (coupon.expiryDate < new Date() && coupon.status === "active") {
    couponStatus = "expired"; // ⚠️ not saving, just display
  }

  // ================= RESPONSE =================
  res.status(200).json({
    success: true,
    data: {
      user: userDetails,
      coupon: {
        ...coupon.toObject(),
        status: couponStatus,
      },
    },
  });
});


export const approveOrRejectCoupon = asyncHandler(async (req, res) => {
  // ================= AUTH =================
  const { approve, userId, couponId } = req.body;
  console.log("🚀 ~ req.body:", req.body)

  if (typeof approve !== "boolean") {
    throw new ApiError(400, "approve must be true or false");
  }

  // ================= FIND COUPON =================
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  // ================= CHECK EXPIRY =================
  if (coupon.expiryDate < new Date()) {
    coupon.status = "expired";
    await coupon.save();
    throw new ApiError(400, "Coupon expired");
  }

  // ================= APPROVE =================
  if (approve === true) {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      {
        $addToSet: { usedUsers: userId }, // ✅ prevents duplicates
        status: "claimed",
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Coupon approved and user added",
      data: updatedCoupon,
    });
  }

  // ================= REJECT =================
  coupon.status = "rejected";
  await coupon.save();

  res.status(200).json({
    success: true,
    message: "Coupon rejected",
  });
});

// ==========================================================================================
// user 
// ==========================================================================================

export const displayDeletedCoupons = asyncHandler(async (req, res) => {
  // 1. Fetch coupons with status "deleted"
  const deletedCoupons = await Coupon.find({ status: "deleted" }).sort({ createdAt: -1 });

  // 2. Format response (optional - customize fields)
  const coupons = deletedCoupons.map(coupon => ({
    id: coupon._id,
    title: coupon.couponTitle,
    img: coupon.img,
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

export const displayVentureExpiredCoupons = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Venture ID");
  }

  // ✅ Find all expired coupons for that venture
  const expiredCoupons = await Coupon.find({
    createdByVenture: id,
    status: "expired",
  }).sort({ expiryDate: -1 });

  // ✅ Return response
  res.status(200).json(
    new ApiResponse(200, expiredCoupons, "Expired coupons fetched successfully.")
  );
});

export const displayActiveCoupons = asyncHandler(async (req, res) => {
  // 1. Find coupons with status "active"
  const activeCoupons = await Coupon.find({ status: "active" }).sort({ createdAt: -1 });

  // 2. Format response data
  const coupons = activeCoupons.map(coupon => ({
    id: coupon._id,
    title: coupon.couponTitle,
    img: coupon.img,
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
    }, "Active coupons fetched successfully.")
  );
});

export const displayExpiredCoupons = asyncHandler(async (req, res) => {
  // 1. Find coupons with status "expired"
  const expiredCoupons = await Coupon.find({ status: "expired" }).sort({ createdAt: -1 });

  // 2. Format response data if needed
  const coupons = expiredCoupons.map(coupon => ({
    id: coupon._id,
    title: coupon.couponTitle,
    img: coupon.img,
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

export const getUserCouponsById = () => {

}
export const displayCouponDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    console.error("❌ Error fetching coupon details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
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
    new ApiResponse(200, coupon, "The selected coupon has been deleted.")
  );
});

