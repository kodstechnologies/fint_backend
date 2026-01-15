import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { Admin } from "../../models/admin.model.js";
import Advertisement from "../../models/advertisement/advertisement.model.js";
import { Insurance } from "../../models/pet/insurance.model.js";
import { putObject } from "../../utils/aws/putObject.js";
import Payment from "../../models/payment/payment.model.js";


export const dashboardAdmin = () => {

}


export const updateAdminProfile = asyncHandler(async (req, res) => {
  if (!req.admin) {
    throw new ApiError(401, "Unauthorized");
  }

  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  const allowedFields = [
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "pinCode",
    "bloodGroup",
  ];

  const updateData = {};

  // 🚫 Block manual / base64 avatar updates
  if ("avatar" in req.body) {
    delete req.body.avatar;
  }

  // ✅ Copy allowed fields
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  // 🖼️ Avatar upload
  if (req.file) {
    const fileName = `admins/${req.admin._id}/${Date.now()}-${req.file.originalname}`;
    const { url } = await putObject(req.file, fileName);
    updateData.avatar = url;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const updatedAdmin = await Admin.findByIdAndUpdate(
    req.admin._id,
    updateData,
    { new: true, runValidators: true }
  ).select("-password -__v");

  return res.status(200).json(
    new ApiResponse(200, updatedAdmin, "Profile updated successfully")
  );
});



export const getAdminProfile = asyncHandler(async (req, res) => {
  console.log("Authenticated admin:", req.admin);
  if (!req.admin) {
    throw new ApiError(401, "Unauthorized");
  }

  const { password, __v, ...safeAdmin } = req.admin.toObject(); // Convert Mongoose doc to plain object

  return res
    .status(200)
    .json(new ApiResponse(200, safeAdmin, "Admin profile fetched successfully"));
});


export const getEChangeRequests = async (req, res) => {
  try {
    const payments = await Payment.find({
      paymentMethod: "eChanges",
    })
      .populate({
        path: "receiverId",
        select: "firstName lastName name phoneNumber",
      })
      .sort({ createdAt: -1 });

    const formatted = payments.map((p) => {
      // 🔹 Receiver name fallback logic
      const receiverName =
        p.receiverAccountHolderName ||
        p.receiverId?.name ||
        `${p.receiverId?.firstName || ""} ${p.receiverId?.lastName || ""}`.trim() ||
        "N/A";

      return {
        _id: p._id,

        // 💰 Payment info
        amount: p.amount,
        paymentStatus: p.paymentStatus,
        fulfillmentStatus: p.fulfillmentStatus,
        paymentMethod: p.paymentMethod,
        createdAt: p.createdAt,

        // 🧑‍💼 Sender details
        sender: {
          name: p.senderAccountHolderName,
          phoneNo: p.senderPhoneNo,
          bankAccountNumber: p.senderBankAccountNumber,
          ifscCode: p.senderIfscCode,
          accountType: p.senderAccountType,
        },

        // 🧑 Receiver details (FULL & SAFE)
        receiver: {
          id: p.receiverId?._id || null,
          name: receiverName,
          phoneNo: p.receiverPhoneNo || p.receiverId?.phoneNumber || null,
          bankAccountNumber: p.receiverBankAccountNumber || null,
          ifscCode: p.receiverIfscCode || null,
          accountType: p.receiverAccountType || null,
        },
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("getEChangeRequests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch eChanges requests",
    });
  }
};


export const getAdminCoupons = () => {

}
export const getAdminPayments = () => {

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

export const getRedDropRequests = () => {

}
// ✅ GET all pet insurance requests
export const getPetInsuranceRequests = asyncHandler(async (req, res) => {
  const allRequests = await Insurance.find().sort({ createdAt: -1 }); // latest first

  res.status(200).json(
    new ApiResponse(200, allRequests, "Fetched all pet insurance requests")
  );
});
export const getUserList = () => {

}
export const getExpenseTrackerData = () => {

}
