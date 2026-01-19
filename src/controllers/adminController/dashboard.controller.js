import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { Admin } from "../../models/admin.model.js";
import Advertisement from "../../models/advertisement/advertisement.model.js";
import { Insurance } from "../../models/pet/insurance.model.js";
import { putObject } from "../../utils/aws/putObject.js";
import Payment from "../../models/payment/payment.model.js";

import Coupon from "../../models/coupon/coupon.model.js";
import { getPagination, getPaginationResponse } from "../../utils/pagination.js";


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
    const { date } = req.query;

    let startUTC, endUTC;

    if (date) {
      const [year, month, day] = date.split("-").map(Number);
      startUTC = new Date(Date.UTC(year, month - 1, day, -5, -30, 0));
      endUTC = new Date(Date.UTC(year, month - 1, day + 1, -5, -30, 0));
    } else {
      const nowIST = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );

      const year = nowIST.getFullYear();
      const month = nowIST.getMonth();
      const day = nowIST.getDate();

      startUTC = new Date(Date.UTC(year, month, day, -5, -30, 0));
      endUTC = new Date(Date.UTC(year, month, day + 1, -5, -30, 0));
    }

    const payments = await Payment.find({
      paymentMethod: "eChanges",
      createdAt: { $gte: startUTC, $lt: endUTC },
    })
      .populate({
        path: "receiverId",
        select: "firstName lastName name phoneNumber",
      })
      .sort({ createdAt: -1 });

    const data = payments.map((p) => {
      // 🔹 Receiver name fallback
      const receiverName =
        p.receiverAccountHolderName ||
        p.receiverId?.name ||
        `${p.receiverId?.firstName || ""} ${p.receiverId?.lastName || ""}`.trim() ||
        "N/A";

      return {
        _id: p._id,
        amount: p.amount,
        paymentStatus: p.paymentStatus,
        fulfillmentStatus: p.fulfillmentStatus,
        createdAt: p.createdAt,

        // 🧑‍💼 Sender (FULL)
        sender: {
          name: p.senderAccountHolderName,
          phoneNo: p.senderPhoneNo,
          bankAccountNumber: p.senderBankAccountNumber,
          ifscCode: p.senderIfscCode,
          accountType: p.senderAccountType,
        },

        // 🧑 Receiver (FULL – SAME AS SENDER)
        receiver: {
          name: receiverName,
          phoneNo: p.receiverPhoneNo || p.receiverId?.phoneNumber || null,
          bankAccountNumber: p.receiverBankAccountNumber || null,
          ifscCode: p.receiverIfscCode || null,
          accountType: p.receiverAccountType || null,
          receiverId: p.receiverId?._id || null,
        },
      };
    });

    res.status(200).json({
      success: true,
      timezone: "IST",
      dateUsed: date || "today",
      totalRecords: data.length,
      data,
    });
  } catch (error) {
    console.error("getEChangeRequests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch eChanges requests",
    });
  }
};


export const getAdminCoupons = async (req, res) => {
  try {
    // 🔹 Pagination only (NO DATE FILTER)
    const { page, limit, skip } = getPagination(req);

    const [coupons, total] = await Promise.all([
      Coupon.find({}) // 👈 fetch ALL coupons
        .populate({
          path: "createdBy",
          select: "companyName name email phoneNumber",
        })
        .populate({
          path: "usedUsers",
          select: "firstName lastName name email phoneNumber",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Coupon.countDocuments({}),
    ]);

    const data = coupons.map((coupon) => ({
      _id: coupon._id,
      couponTitle: coupon.couponTitle,
      offerTitle: coupon.offerTitle,
      offerDescription: coupon.offerDescription,
      termsAndConditions: coupon.termsAndConditions,
      expiryDate: coupon.expiryDate,
      status: coupon.status,
      viewCount: coupon.viewCount,
      img: coupon.img,

      createdBy: {
        id: coupon.createdBy?._id || null,
        name:
          coupon.createdBy?.companyName ||
          coupon.createdBy?.name ||
          "N/A",
        email: coupon.createdBy?.email || null,
        phoneNo: coupon.createdBy?.phoneNumber || null,
      },

      usedUsers: {
        count: coupon.usedUsers.length,
        users: coupon.usedUsers.map((user) => ({
          id: user._id,
          name:
            user.name ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: user.email || null,
          phoneNo: user.phoneNumber || null,
        })),
      },

      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    }));

    res.status(200).json(
      getPaginationResponse({
        total,
        page,
        limit,
        data,
      })
    );
  } catch (error) {
    console.error("getAdminCoupons error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

// export const getAdminPayments = async (req, res) => {
//   try {
//     const { date } = req.query;

//     let startUTC, endUTC;

//     if (date) {
//       // 📅 Selected date (YYYY-MM-DD) in IST
//       const [year, month, day] = date.split("-").map(Number);

//       startUTC = new Date(Date.UTC(year, month - 1, day, -5, -30, 0));
//       endUTC = new Date(Date.UTC(year, month - 1, day + 1, -5, -30, 0));
//     } else {
//       // 📅 TODAY in IST
//       const nowIST = new Date(
//         new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
//       );

//       const year = nowIST.getFullYear();
//       const month = nowIST.getMonth();
//       const day = nowIST.getDate();

//       startUTC = new Date(Date.UTC(year, month, day, -5, -30, 0));
//       endUTC = new Date(Date.UTC(year, month, day + 1, -5, -30, 0));
//     }

//     const payments = await Payment.find({
//       paymentMethod: { $ne: "eChanges" }, // ❌ exclude eChanges
//       createdAt: {
//         $gte: startUTC,
//         $lt: endUTC,
//       },
//     })
//       .populate({
//         path: "senderId",
//         select: "firstName lastName name email phoneNumber companyName",
//       })
//       .populate({
//         path: "receiverId",
//         select: "firstName lastName name email phoneNumber companyName",
//       })
//       .sort({ createdAt: -1 });

//     const data = payments.map((p) => {
//       const senderName =
//         p.senderAccountHolderName ||
//         p.senderId?.name ||
//         `${p.senderId?.firstName || ""} ${p.senderId?.lastName || ""}`.trim() ||
//         p.senderId?.companyName ||
//         "N/A";

//       const receiverName =
//         p.receiverAccountHolderName ||
//         p.receiverId?.name ||
//         `${p.receiverId?.firstName || ""} ${p.receiverId?.lastName || ""}`.trim() ||
//         p.receiverId?.companyName ||
//         "N/A";

//       return {
//         _id: p._id,

//         // 💰 Payment info
//         amount: p.amount,
//         paymentMethod: p.paymentMethod,
//         paymentStatus: p.paymentStatus,
//         fulfillmentStatus: p.fulfillmentStatus,
//         completedVia: p.completedVia,
//         module: p.module,
//         createdAt: p.createdAt,

//         // 🧑‍💼 Sender (FULL)
//         sender: {
//           id: p.senderId?._id || null,
//           type: p.senderType,
//           name: senderName,
//           phoneNo: p.senderPhoneNo,
//           bankAccountNumber: p.senderBankAccountNumber,
//           ifscCode: p.senderIfscCode,
//           accountType: p.senderAccountType,
//         },

//         // 🧑 Receiver (FULL)
//         receiver: {
//           id: p.receiverId?._id || null,
//           type: p.receiverType,
//           name: receiverName,
//           phoneNo: p.receiverPhoneNo || null,
//           bankAccountNumber: p.receiverBankAccountNumber || null,
//           ifscCode: p.receiverIfscCode || null,
//           accountType: p.receiverAccountType || null,
//         },
//       };
//     });

//     res.status(200).json({
//       success: true,
//       timezone: "IST",
//       dateUsed: date || "today",
//       totalRecords: data.length,
//       data,
//     });
//   } catch (error) {
//     console.error("getAdminPayments error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch payments",
//     });
//   }
// };


// @desc    Get all advertisement details with count and status summary
// @route   GET /admin/advertisements
// @access  Admin

// export const getAdminPayments = async (req, res) => {
//   try {
//     const { date } = req.query;

//     /* ===============================
//        📅 IST DATE RANGE (TODAY / GIVEN)
//     =============================== */
//     let startUTC, endUTC;

//     if (date) {
//       // YYYY-MM-DD (IST)
//       const [year, month, day] = date.split("-").map(Number);
//       startUTC = new Date(Date.UTC(year, month - 1, day, -5, -30, 0));
//       endUTC = new Date(Date.UTC(year, month - 1, day + 1, -5, -30, 0));
//     } else {
//       // TODAY in IST
//       const nowIST = new Date(
//         new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
//       );

//       const year = nowIST.getFullYear();
//       const month = nowIST.getMonth();
//       const day = nowIST.getDate();

//       startUTC = new Date(Date.UTC(year, month, day, -5, -30, 0));
//       endUTC = new Date(Date.UTC(year, month, day + 1, -5, -30, 0));
//     }

//     /* ===============================
//        🔹 TODAY / SELECTED DAY PAYMENTS
//     =============================== */
//     const payments = await Payment.find({
//       paymentMethod: { $ne: "eChanges" }, // ❌ exclude eChanges
//       createdAt: { $gte: startUTC, $lt: endUTC },
//     })
//       .populate("senderId", "firstName lastName name companyName phoneNumber")
//       .populate("receiverId", "firstName lastName name companyName phoneNumber")
//       .sort({ createdAt: -1 });

//     const data = payments.map((p) => {
//       const senderName =
//         p.senderAccountHolderName ||
//         p.senderId?.name ||
//         `${p.senderId?.firstName || ""} ${p.senderId?.lastName || ""}`.trim() ||
//         p.senderId?.companyName ||
//         "N/A";

//       const receiverName =
//         p.receiverAccountHolderName ||
//         p.receiverId?.name ||
//         `${p.receiverId?.firstName || ""} ${p.receiverId?.lastName || ""}`.trim() ||
//         p.receiverId?.companyName ||
//         "N/A";

//       return {
//         _id: p._id,

//         // 💰 Payment
//         amount: p.amount,
//         paymentMethod: p.paymentMethod,
//         paymentStatus: p.paymentStatus,
//         fulfillmentStatus: p.fulfillmentStatus,
//         completedVia: p.completedVia,
//         module: p.module,
//         createdAt: p.createdAt,

//         // 🧑 Sender
//         sender: {
//           name: senderName,
//           phoneNo: p.senderPhoneNo,
//           bankAccountNumber: p.senderBankAccountNumber,
//           ifscCode: p.senderIfscCode,
//           accountType: p.senderAccountType,
//         },

//         // 🧑 Receiver
//         receiver: {
//           name: receiverName,
//           phoneNo: p.receiverPhoneNo || null,
//           bankAccountNumber: p.receiverBankAccountNumber || null,
//           ifscCode: p.receiverIfscCode || null,
//           accountType: p.receiverAccountType || null,
//         },
//       };
//     });

//     /* ===============================
//        📊 LAST 7 DAYS (IST) SUMMARY
//     =============================== */
//     const nowIST = new Date(
//       new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
//     );
//     nowIST.setHours(0, 0, 0, 0);
//     nowIST.setDate(nowIST.getDate() - 6);

//     const sevenDaysUTC = new Date(
//       nowIST.getTime() - 5.5 * 60 * 60 * 1000
//     );

//     const agg = await Payment.aggregate([
//       {
//         $match: {
//           paymentMethod: { $ne: "eChanges" },
//           createdAt: { $gte: sevenDaysUTC },
//         },
//       },
//       {
//         $addFields: {
//           istDate: {
//             $dateToString: {
//               format: "%Y-%m-%d",
//               date: { $add: ["$createdAt", 19800000] }, // +5:30 IST
//             },
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { date: "$istDate", status: "$paymentStatus" },
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $group: {
//           _id: "$_id.date",
//           statuses: {
//             $push: { status: "$_id.status", count: "$count" },
//           },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     /* ===============================
//        🧮 FORMAT 7-DAY DATA
//     =============================== */
//     const last7DaysSummary = {};
//     const last7DaysTotals = {
//       pending: 0,
//       success: 0,
//       failed: 0,
//     };

//     agg.forEach((day) => {
//       last7DaysSummary[day._id] = {
//         pending: 0,
//         success: 0,
//         failed: 0,
//       };

//       day.statuses.forEach((s) => {
//         last7DaysSummary[day._id][s.status] = s.count;
//         last7DaysTotals[s.status] += s.count;
//       });
//     });

//     /* ===============================
//        ✅ RESPONSE
//     =============================== */
//     res.status(200).json({
//       success: true,
//       timezone: "IST",
//       dateUsed: date || "today",

//       todayCount: data.length,
//       data,

//       last7DaysSummary, // 📅 day-wise
//       last7DaysTotals,  // 📊 total pending / success / failed
//     });
//   } catch (error) {
//     console.error("getAdminPayments error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch payments",
//     });
//   }
// };

export const getAdminPayments = async (req, res) => {
  try {
    const { date } = req.query;

    /* ===============================
       📅 IST DATE RANGE (TODAY / GIVEN)
    =============================== */
    let startUTC, endUTC;

    if (date) {
      // YYYY-MM-DD (IST)
      const [year, month, day] = date.split("-").map(Number);
      startUTC = new Date(Date.UTC(year, month - 1, day, -5, -30, 0));
      endUTC = new Date(Date.UTC(year, month - 1, day + 1, -5, -30, 0));
    } else {
      // TODAY in IST
      const nowIST = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );

      const year = nowIST.getFullYear();
      const month = nowIST.getMonth();
      const day = nowIST.getDate();

      startUTC = new Date(Date.UTC(year, month, day, -5, -30, 0));
      endUTC = new Date(Date.UTC(year, month, day + 1, -5, -30, 0));
    }

    /* ===============================
       🔹 TODAY / SELECTED DAY PAYMENTS
    =============================== */
    const payments = await Payment.find({
      paymentMethod: { $ne: "eChanges" },
      createdAt: { $gte: startUTC, $lt: endUTC },
    })
      .populate("senderId", "firstName lastName name companyName phoneNumber")
      .populate("receiverId", "firstName lastName name companyName phoneNumber")
      .sort({ createdAt: -1 });

    const data = payments.map((p) => {
      const senderName =
        p.senderAccountHolderName ||
        p.senderId?.name ||
        `${p.senderId?.firstName || ""} ${p.senderId?.lastName || ""}`.trim() ||
        p.senderId?.companyName ||
        "N/A";

      const receiverName =
        p.receiverAccountHolderName ||
        p.receiverId?.name ||
        `${p.receiverId?.firstName || ""} ${p.receiverId?.lastName || ""}`.trim() ||
        p.receiverId?.companyName ||
        "N/A";

      return {
        _id: p._id,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        paymentStatus: p.paymentStatus,
        fulfillmentStatus: p.fulfillmentStatus,
        completedVia: p.completedVia,
        module: p.module,
        createdAt: p.createdAt,

        sender: {
          name: senderName,
          phoneNo: p.senderPhoneNo,
          bankAccountNumber: p.senderBankAccountNumber,
          ifscCode: p.senderIfscCode,
          accountType: p.senderAccountType,
        },

        receiver: {
          name: receiverName,
          phoneNo: p.receiverPhoneNo || null,
          bankAccountNumber: p.receiverBankAccountNumber || null,
          ifscCode: p.receiverIfscCode || null,
          accountType: p.receiverAccountType || null,
        },
      };
    });

    /* ===============================
       📊 LAST 7 DAYS (IST) AGGREGATION
    =============================== */
    const nowIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    nowIST.setHours(0, 0, 0, 0);
    nowIST.setDate(nowIST.getDate() - 6);

    const sevenDaysUTC = new Date(
      nowIST.getTime() - 5.5 * 60 * 60 * 1000
    );

    const agg = await Payment.aggregate([
      {
        $match: {
          paymentMethod: { $ne: "eChanges" },
          createdAt: { $gte: sevenDaysUTC },
        },
      },
      {
        $addFields: {
          istDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $add: ["$createdAt", 19800000] }, // +5:30 IST
            },
          },
        },
      },
      {
        $group: {
          _id: { date: "$istDate", status: "$paymentStatus" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          statuses: {
            $push: { status: "$_id.status", count: "$count" },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    /* ===============================
       🧮 FORMAT LAST 7 DAYS (FIXED)
    =============================== */
    const STATUS_KEYS = ["pending", "success", "failed"];

    const last7DaysSummary = {};
    const last7DaysTotals = {
      pending: 0,
      success: 0,
      failed: 0,
    };

    // Generate last 7 IST dates
    const last7Dates = [];
    const todayIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    todayIST.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayIST);
      d.setDate(d.getDate() - i);
      last7Dates.push(d.toISOString().slice(0, 10));
    }

    // Initialize all days + statuses = 0
    last7Dates.forEach((date) => {
      last7DaysSummary[date] = {
        pending: 0,
        success: 0,
        failed: 0,
      };
    });

    // Fill real data
    agg.forEach((day) => {
      day.statuses.forEach((s) => {
        if (
          last7DaysSummary[day._id] &&
          STATUS_KEYS.includes(s.status)
        ) {
          last7DaysSummary[day._id][s.status] = s.count;
          last7DaysTotals[s.status] += s.count;
        }
      });
    });

    /* ===============================
       ✅ RESPONSE
    =============================== */
    res.status(200).json({
      success: true,
      timezone: "IST",
      dateUsed: date || "today",

      todayCount: data.length,
      data,

      last7DaysSummary,
      last7DaysTotals,
    });
  } catch (error) {
    console.error("getAdminPayments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};


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
