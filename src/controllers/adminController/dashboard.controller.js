import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { Admin } from "../../models/admin.model.js";
import Advertisement from "../../models/advertisement/advertisement.model.js";


export const dashboardAdmin = () =>{

}

export const updateAdminProfile = asyncHandler(async (req, res) => {
  console.log("Incoming body:", req.body);
  console.log("Authenticated admin:", req.admin);

  if (!req.admin) {
    console.error("❌ Admin not authenticated");
    throw new ApiError(401, "Unauthorized");
  }

  const allowedFields = [
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "pinCode",
    "bloodGroup"
  ];

  const updateData = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      updateData[key] = req.body[key];
    }
  }

  console.log("Fields to update:", updateData);

  const updatedAdmin = await Admin.findByIdAndUpdate(
    req.admin._id,
    updateData,
    { new: true, runValidators: true }
  ).select("-password -__v");

  if (!updatedAdmin) {
    console.error("❌ Admin not found");
    throw new ApiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedAdmin, "Profile updated successfully"));
});


export const getAdminProfile = asyncHandler(async (req, res) => {
  if (!req.admin) {
    throw new ApiError(401, "Unauthorized");
  }

  const { password, __v, ...safeAdmin } = req.admin.toObject(); // Convert Mongoose doc to plain object

  return res
    .status(200)
    .json(new ApiResponse(200, safeAdmin, "Admin profile fetched successfully"));
});

export const getEChangeRequests = () =>{

}
export const getAdminCoupons = () =>{

}
export const getAdminPayments = () =>{

}

// @desc    Get all advertisement details with count and status summary
// @route   GET /admin/advertisements
// @access  Admin
export const getAdminAdvertisements = asyncHandler(async (req, res) => {
  try {
    // 1. Fetch all advertisements (full details)
    const allAds = await Advertisement.find().sort({ createdAt: -1 });

    // 2. Count by status
    const statusCounts = await Advertisement.aggregate([
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

    // 3. Total ad count
    const adCount = allAds.length;

    // 4. Response
    res.status(200).json({
      message: "All advertisements fetched successfully.",
      adCount,
      advertisements: allAds, // full data
      statusSummary,
    });
  } catch (error) {
    console.error("❌ Error in getAdminAdvertisements:", error);
    res.status(500).json({
      message: "Failed to fetch advertisements.",
      error: error.message,
    });
  }
});

export const getRedDropRequests = () =>{

}
export const getPetInsuranceRequests = () =>{

}
export const getUserList = () =>{

}
export const getExpenseTrackerData = () =>{

}
