import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { Admin } from "../../models/admin.model.js";
import Advertisement from "../../models/advertisement/advertisement.model.js";
import { Insurance } from "../../models/pet/insurance.model.js";
import { putObject } from "../../utils/aws/putObject.js";
import Payment from "../../models/payment/payment.model.js";
import Notification from "../../models/coupon/coupon.model.js"
import Coupon from "../../models/coupon/coupon.model.js";
import { getPagination, getPaginationResponse } from "../../utils/pagination.js";
import { User } from "../../models/user.model.js";
import { Venture } from "../../models/venture.model.js";
import mongoose from "mongoose";
/**
 * ===============================
 * 📊 ADMIN DASHBOARD CONTROLLER
 * ===============================
 */

export const dashboardAdmin = async (req, res) => {
  try {
    const now = new Date();

    /* =====================================================
       DATE HELPERS
    ===================================================== */
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    /* =====================================================
       1️⃣ USERS & VENTURES (TOTAL + LATEST)
    ===================================================== */
    const totalUsers = await User.countDocuments();
    const totalVentures = await Venture.countDocuments();

    const latestUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const latestVentures = await Venture.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    /* =====================================================
       2️⃣ PAYMENTS – LAST 3 MONTHS (MONTH WISE)
    ===================================================== */
    const last3MonthsPayments = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: threeMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    /* =====================================================
       3️⃣ RECENT PAYMENTS TABLE (LAST 5)
    ===================================================== */
    const recentPayments = await Payment.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("senderName receiverName amount createdAt");

    const recentPaymentTable = recentPayments.map((p) => ({
      debitedTo: p.senderName || "-",
      creditedTo: p.receiverName || "-",
      balance: p.amount,
      paymentDate: p.createdAt,
    }));

    /* =====================================================
       4️⃣ ADVERTISEMENTS – ACTIVE vs EXPIRED
    ===================================================== */
    const advertisementStats = await Advertisement.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    /* =====================================================
       5️⃣ INSURANCE – TOTAL / COMPLETED / PENDING
    ===================================================== */
    const insuranceTotal = await Insurance.countDocuments();

    const insuranceCompleted = await Insurance.countDocuments({
      "pets.0": { $exists: true },
    });

    const insurancePending = insuranceTotal - insuranceCompleted;

    /* =====================================================
       6️⃣ INSURANCE TABLE (DUMMY DATA)
    ===================================================== */
    const insuranceTable = [
      { applyDate: "2025-06-23", petName: "Buddy", parentName: "John Doe" },
      { applyDate: "2025-06-24", petName: "Whiskers", parentName: "Jane Smith" },
      { applyDate: "2025-06-25", petName: "Coco", parentName: "Alice Johnson" },
      { applyDate: "2025-06-26", petName: "Simba", parentName: "Bob Brown" },
      { applyDate: "2025-06-27", petName: "Luna", parentName: "Eve Davis" },
    ];

    /* =====================================================
       7️⃣ FINAL RESPONSE
    ===================================================== */
    res.status(200).json({
      success: true,
      message: "Admin dashboard data fetched successfully",
      data: {
        users: {
          total: totalUsers,
          latest: latestUsers, // last 7 days
        },
        ventures: {
          total: totalVentures,
          latest: latestVentures, // last 7 days
        },
        payments: {
          last3Months: last3MonthsPayments,
          recentTransactions: recentPaymentTable,
        },
        advertisements: advertisementStats,
        insurance: {
          total: insuranceTotal,
          completed: insuranceCompleted,
          pending: insurancePending,
          table: insuranceTable,
        },
      },
    });
  } catch (error) {
    console.error("❌ Admin Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};


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

// export const getEChangeRequests = async (req, res) => {
//   try {
//     const { date } = req.query;

//     let startUTC, endUTC;

//     if (date) {
//       const [year, month, day] = date.split("-").map(Number);
//       startUTC = new Date(Date.UTC(year, month - 1, day, -5, -30, 0));
//       endUTC = new Date(Date.UTC(year, month - 1, day + 1, -5, -30, 0));
//     } else {
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
//       paymentMethod: "eChanges",
//       createdAt: { $gte: startUTC, $lt: endUTC },
//     })
//       .populate({
//         path: "receiverId",
//         select: "firstName lastName name phoneNumber",
//       })
//       .sort({ createdAt: -1 });

//     const data = payments.map((p) => {
//       // 🔹 Receiver name fallback
//       const receiverName =
//         p.receiverAccountHolderName ||
//         p.receiverId?.name ||
//         `${p.receiverId?.firstName || ""} ${p.receiverId?.lastName || ""}`.trim() ||
//         "N/A";

//       return {
//         _id: p._id,
//         amount: p.amount,
//         paymentStatus: p.paymentStatus,
//         fulfillmentStatus: p.fulfillmentStatus,
//         createdAt: p.createdAt,

//         // 🧑‍💼 Sender (FULL)
//         sender: {
//           name: p.senderAccountHolderName,
//           phoneNo: p.senderPhoneNo,
//           bankAccountNumber: p.senderBankAccountNumber,
//           ifscCode: p.senderIfscCode,
//           accountType: p.senderAccountType,
//         },

//         // 🧑 Receiver (FULL – SAME AS SENDER)
//         receiver: {
//           name: receiverName,
//           phoneNo: p.receiverPhoneNo || p.receiverId?.phoneNumber || null,
//           bankAccountNumber: p.receiverBankAccountNumber || null,
//           ifscCode: p.receiverIfscCode || null,
//           accountType: p.receiverAccountType || null,
//           receiverId: p.receiverId?._id || null,
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
//     console.error("getEChangeRequests error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch eChanges requests",
//     });
//   }
// };

export const getEChangeRequests = async (req, res) => {
  try {
    const { date, page = 1, limit = 10, search, type } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    let startUTC, endUTC;

    // ================= DATE FILTER (IST → UTC) =================
    if (date) {
      const [year, month, day] = date.split("-").map(Number);
      startUTC = new Date(Date.UTC(year, month - 1, day, -5, -30, 0));
      endUTC = new Date(Date.UTC(year, month - 1, day + 1, -5, -30, 0));
    } else {
      const nowIST = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );

      startUTC = new Date(
        Date.UTC(
          nowIST.getFullYear(),
          nowIST.getMonth(),
          nowIST.getDate(),
          -5,
          -30,
          0
        )
      );

      endUTC = new Date(
        Date.UTC(
          nowIST.getFullYear(),
          nowIST.getMonth(),
          nowIST.getDate() + 1,
          -5,
          -30,
          0
        )
      );
    }

    // ================= SEARCH FILTER =================
    let searchFilter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      searchFilter = {
        $or: [
          { senderAccountHolderName: regex },
          { receiverName: regex },
          { receiverAccountHolderName: regex },
        ],
      };
    }

    // ================= TYPE FILTER (used / unused) =================
    let typeFilter = {};
    if (type === "used") {
      typeFilter = { receiverId: { $ne: null } };
    } else if (type === "unused") {
      typeFilter = { receiverId: null };
    }

    // ================= BASE FILTER =================
    const baseFilter = {
      paymentMethod: "eChanges",
      createdAt: { $gte: startUTC, $lt: endUTC },
      ...searchFilter,
      ...typeFilter,
    };

    // ================= COUNTS (ALWAYS FULL DAY) =================
    const countBaseFilter = {
      paymentMethod: "eChanges",
      createdAt: { $gte: startUTC, $lt: endUTC },
      ...searchFilter,
    };

    const [totalRecords, usedCount, unusedCount] = await Promise.all([
      Payment.countDocuments(baseFilter),
      Payment.countDocuments({ ...countBaseFilter, receiverId: { $ne: null } }),
      Payment.countDocuments({ ...countBaseFilter, receiverId: null }),
    ]);

    // ================= FETCH DATA =================
    const payments = await Payment.find(baseFilter)
      .populate({
        path: "receiverId",
        select: "firstName lastName name phoneNumber",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // ================= FORMAT RESPONSE =================
    const data = payments.map((p) => {
      const receiverName =
        p.receiverAccountHolderName ||
        p.receiverName ||
        p.receiverId?.name ||
        `${p.receiverId?.firstName || ""} ${p.receiverId?.lastName || ""}`.trim() ||
        "N/A";

      return {
        _id: p._id,
        amount: p.amount,
        paymentStatus: p.paymentStatus,
        fulfillmentStatus: p.fulfillmentStatus,
        status: p.receiverId ? "used" : "unused",
        createdAt: p.createdAt,

        sender: {
          name: p.senderAccountHolderName,
          phoneNo: p.senderPhoneNo,
          bankAccountNumber: p.senderBankAccountNumber,
          ifscCode: p.senderIfscCode,
          accountType: p.senderAccountType,
        },

        receiver: {
          receiverId: p.receiverId?._id || null,
          name: receiverName,
          phoneNo: p.receiverPhoneNo || p.receiverId?.phoneNumber || null,
          bankAccountNumber: p.receiverBankAccountNumber,
          ifscCode: p.receiverIfscCode,
          accountType: p.receiverAccountType,
        },
      };
    });

    // ================= RESPONSE =================
    res.status(200).json({
      success: true,
      timezone: "IST",
      dateUsed: date || "today",

      summary: {
        usedCoupons: usedCount,
        unusedCoupons: unusedCount,
      },

      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
      },

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


// export const getAdminCoupons = async (req, res) => {
//   try {
//     // 🔹 Pagination
//     const { page, limit, skip } = getPagination(req);

//     // 🔹 Fetch coupons + total count
//     const [coupons, total] = await Promise.all([
//       Coupon.find({})
//         .populate({
//           path: "createdBy",
//           select: "firstName lastName email phoneNumber",
//         })
//         .populate({
//           path: "usedUsers",
//           select: "firstName lastName name email phoneNumber",
//         })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),

//       Coupon.countDocuments({}),
//     ]);

//     // 🔹 Format response
//     const data = coupons.map((coupon) => ({
//       _id: coupon._id,
//       couponTitle: coupon.couponTitle,
//       offerTitle: coupon.offerTitle,
//       offerDescription: coupon.offerDescription,
//       termsAndConditions: coupon.termsAndConditions,
//       expiryDate: coupon.expiryDate,
//       status: coupon.status,

//       // ✅ CALCULATED VIEW COUNT
//       viewCount: coupon.usedUsers?.length || 0,

//       img: coupon.img,

//       createdBy: {
//         id: coupon.createdBy?._id || null,
//         name: coupon.createdBy
//           ? `${coupon.createdBy.firstName} ${coupon.createdBy.lastName}`.trim()
//           : "N/A",
//         email: coupon.createdBy?.email || null,
//         phoneNo: coupon.createdBy?.phoneNumber || null,
//       },

//       usedUsers: {
//         count: coupon.usedUsers?.length || 0,
//         users: coupon.usedUsers || [],
//       },

//       createdAt: coupon.createdAt,
//       updatedAt: coupon.updatedAt,
//     }));


//     // 🔹 Final response
//     res.status(200).json(
//       getPaginationResponse({
//         total,
//         page,
//         limit,
//         data,
//       })
//     );
//   } catch (error) {
//     console.error("❌ getAdminCoupons error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch coupons",
//     });
//   }
// };


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

export const getAdminCoupons = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const filter = {}; // or { status: "ACTIVE" }

    const [coupons, total, statusSummary] = await Promise.all([
      Coupon.find(filter)
        .populate({
          path: "createdBy",
          select: "firstName lastName email phoneNumber",
        })
        .populate({
          path: "usedUsers",
          select: "firstName lastName name email phoneNumber",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Coupon.countDocuments(filter),

      Coupon.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalCoupons = statusSummary.reduce(
      (sum, item) => sum + item.count,
      0
    );

    const statusStats = statusSummary.map((item) => ({
      status: item._id,
      count: item.count,
      percentage: Number(((item.count / totalCoupons) * 100).toFixed(1)),
    }));

    const data = coupons.map((coupon) => ({
      _id: coupon._id,
      couponTitle: coupon.couponTitle,
      offerTitle: coupon.offerTitle,
      offerDescription: coupon.offerDescription,
      termsAndConditions: coupon.termsAndConditions,
      expiryDate: coupon.expiryDate,
      status: coupon.status,
      viewCount: coupon.usedUsers?.length || 0,
      img: coupon.img,
      createdBy: {
        id: coupon.createdBy?._id || null,
        name: coupon.createdBy
          ? `${coupon.createdBy.firstName} ${coupon.createdBy.lastName}`.trim()
          : "N/A",
        email: coupon.createdBy?.email || null,
        phoneNo: coupon.createdBy?.phoneNumber || null,
      },
      usedUsers: {
        count: coupon.usedUsers?.length || 0,
        users: coupon.usedUsers || [],
      },
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    }));

    res.status(200).json({
      success: true,
      summary: statusStats,
      ...getPaginationResponse({
        total,
        page,
        limit,
        data,
      }),
    });
  } catch (error) {
    console.error("❌ getAdminCoupons error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};


/* =====================================================
   🔧 HELPER: FORMAT PAYMENT BASED ON paymentMethod
===================================================== */
const formatPaymentForAdmin = (p) => {
  const getPersonName = (id, accountHolderName) => {
    if (accountHolderName) return accountHolderName;
    if (id?.name) return id.name;

    const fullName = [id?.firstName, id?.lastName]
      .filter(Boolean)
      .join(" ");
    if (fullName) return fullName;

    if (id?.companyName) return id.companyName;

    return "N/A";
  };

  return {
    _id: p._id,

    /* ================= PAYMENT ================= */
    amount: p.amount,
    paymentMethod: p.paymentMethod,
    paymentStatus: p.paymentStatus,
    fulfillmentStatus: p.fulfillmentStatus,
    completedVia: p.completedVia,

    module: p.module,
    moduleData: p.moduleData,

    razorpay: {
      orderId: p.razorpay_order_id || null,
      paymentId: p.razorpay_payment_id || null,
    },

    createdAt: p.createdAt,

    /* ================= SENDER ================= */
    sender: {
      type: p.senderType,
      id: p.senderId?._id || null,
      name: getPersonName(p.senderId, p.senderAccountHolderName),
      phoneNo: p.senderPhoneNo || null,
      accountHolderName: p.senderAccountHolderName || null,
      bankAccountNumber: p.senderBankAccountNumber || null,
      ifscCode: p.senderIfscCode || null,
      accountType: p.senderAccountType || null,
    },

    /* ================= RECEIVER ================= */
    receiver: {
      type: p.receiverType,
      id: p.receiverId?._id || null,
      name: getPersonName(p.receiverId, p.receiverAccountHolderName),
      phoneNo: p.receiverPhoneNo || null,
      accountHolderName: p.receiverAccountHolderName || null,
      bankAccountNumber: p.receiverBankAccountNumber || null,
      ifscCode: p.receiverIfscCode || null,
      accountType: p.receiverAccountType || null,
    },
  };
};

/* =====================================================
   🧠 HELPER: GET DAY NAME (IST)
===================================================== */
const getDayNameFromDate = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00+05:30`);
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

/* =====================================================
   ✅ GET ADMIN PAYMENTS
===================================================== */
export const getAdminPayments = async (req, res) => {
  try {
    const { date } = req.query;

    /* ===============================
       📅 IST DATE RANGE
    =============================== */
    let startUTC, endUTC;

    if (date) {
      const [year, month, day] = date.split("-").map(Number);
      startUTC = new Date(Date.UTC(year, month - 1, day, -5, -30, 0));
      endUTC = new Date(Date.UTC(year, month - 1, day + 1, -5, -30, 0));
    } else {
      const nowIST = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );

      startUTC = new Date(
        Date.UTC(
          nowIST.getFullYear(),
          nowIST.getMonth(),
          nowIST.getDate(),
          -5,
          -30,
          0
        )
      );

      endUTC = new Date(
        Date.UTC(
          nowIST.getFullYear(),
          nowIST.getMonth(),
          nowIST.getDate() + 1,
          -5,
          -30,
          0
        )
      );
    }

    /* ===============================
       🔹 FETCH PAYMENTS
    =============================== */
    const payments = await Payment.find({
      paymentMethod: { $ne: "eChanges" },
      createdAt: { $gte: startUTC, $lt: endUTC },
    })
      .populate("senderId", "firstName lastName name companyName phoneNumber")
      .populate("receiverId", "firstName lastName name companyName phoneNumber")
      .sort({ createdAt: -1 });

    const data = payments.map(formatPaymentForAdmin);

    /* ===============================
       📊 LAST 7 DAYS (IST)
    =============================== */
    const todayIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    todayIST.setHours(0, 0, 0, 0);

    const sevenDaysAgoIST = new Date(todayIST);
    sevenDaysAgoIST.setDate(todayIST.getDate() - 6);

    const sevenDaysUTC = new Date(
      sevenDaysAgoIST.getTime() - 5.5 * 60 * 60 * 1000
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
              date: { $add: ["$createdAt", 19800000] },
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
       🧮 FORMAT LAST 7 DAYS
    =============================== */
    const STATUS_KEYS = ["pending", "success", "failed"];
    const last7DaysSummary = {};
    const last7DaysTotals = { pending: 0, success: 0, failed: 0 };

    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayIST);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      last7DaysSummary[key] = { pending: 0, success: 0, failed: 0 };
    }

    agg.forEach((day) => {
      if (!last7DaysSummary[day._id]) {
        last7DaysSummary[day._id] = {
          pending: 0,
          success: 0,
          failed: 0,
        };
      }

      day.statuses.forEach((s) => {
        const status = s.status?.toLowerCase();
        if (STATUS_KEYS.includes(status)) {
          last7DaysSummary[day._id][status] = s.count;
          last7DaysTotals[status] += s.count;
        }
      });
    });

    /* ===============================
       📦 FINAL DISPLAY FORMAT (WITH DAY)
    =============================== */
    const last7DaysDisplay = Object.keys(last7DaysSummary).map((date) => ({
      date,
      day: getDayNameFromDate(date),
      ...last7DaysSummary[date],
    }));

    /* ===============================
       ✅ RESPONSE
    =============================== */
    res.status(200).json({
      success: true,
      timezone: "IST",
      dateUsed: date || "today",
      todayCount: data.length,
      data,
      last7DaysSummary: last7DaysDisplay,
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
    // 🔹 Pagination
    const { page, limit, skip } = getPagination(req);

    // 🔹 Fetch data in parallel
    const [
      advertisements,
      total,
      statusCounts,
      totalViewsAgg,
    ] = await Promise.all([
      // Paginated ads
      Advertisement.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      // Total ads count
      Advertisement.countDocuments(),

      // Status-wise count
      Advertisement.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Total views (calculated)
      Advertisement.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
          },
        },
      ]),
    ]);

    // 🔹 Status summary
    const statusSummary = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // 🔹 Total views
    const totalViews = totalViewsAgg[0]?.totalViews || 0;

    // 🔹 Meta data
    const meta = {
      totalAdvertisements: total,
      totalViews,
      statusSummary,
    };

    // 🔹 Final response
    res.status(200).json({
      success: true,

      // ✅ META DATA
      meta,

      // ✅ PAGINATION
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },

      // ✅ DATA
      data: advertisements,
    });
  } catch (error) {
    console.error("❌ Error in getAdminAdvertisements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch advertisements",
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

export const getUserList = asyncHandler(async (req, res) => {
  // ================= QUERY PARAMS =================
  const { type } = req.query; // user | venture | undefined
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  // ================= DATE CALCULATION =================
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  // ================= FETCH DATA =================
  const [users, ventures] = await Promise.all([
    User.find({})
      .select("name phoneNumber email pinCode createdAt")
      .sort({ createdAt: -1 }),

    Venture.find({})
      .select("firstName lastName phoneNumber email pinCode createdAt")
      .sort({ createdAt: -1 }),
  ]);

  // ================= FORMAT USERS =================
  const formattedUsers = users.map((u) => ({
    id: u._id,
    type: "user",
    name: u.name,
    phoneNumber: u.phoneNumber,
    email: u.email || null,
    pinCode: u.pinCode || null,
    createdAt: u.createdAt,
  }));

  // ================= FORMAT VENTURES =================
  const formattedVentures = ventures.map((v) => ({
    id: v._id,
    type: "venture",
    name: `${v.firstName} ${v.lastName}`.trim(),
    phoneNumber: v.phoneNumber,
    email: v.email || null,
    pinCode: v.pinCode || null,
    createdAt: v.createdAt,
  }));

  // ================= LAST 6 MONTHS STATS =================
  const generateLast6Months = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth() + 1}`,
        label: d.toLocaleString("en-IN", { month: "short", year: "numeric" }),
        userCount: 0,
        ventureCount: 0,
      });
    }
    return months;
  };

  const monthlyStats = generateLast6Months();

  users.forEach((u) => {
    if (u.createdAt >= sixMonthsAgo) {
      const key = `${u.createdAt.getFullYear()}-${u.createdAt.getMonth() + 1}`;
      const month = monthlyStats.find((m) => m.key === key);
      if (month) month.userCount += 1;
    }
  });

  ventures.forEach((v) => {
    if (v.createdAt >= sixMonthsAgo) {
      const key = `${v.createdAt.getFullYear()}-${v.createdAt.getMonth() + 1}`;
      const month = monthlyStats.find((m) => m.key === key);
      if (month) month.ventureCount += 1;
    }
  });

  // ================= TOTAL COUNTS =================
  const last6MonthUserCount = monthlyStats.reduce(
    (sum, m) => sum + m.userCount,
    0
  );

  const last6MonthVentureCount = monthlyStats.reduce(
    (sum, m) => sum + m.ventureCount,
    0
  );

  // ================= TYPE-BASED DATA =================
  let combinedData = [];

  if (type === "user") {
    combinedData = formattedUsers;
  } else if (type === "venture") {
    combinedData = formattedVentures;
  } else {
    combinedData = [...formattedUsers, ...formattedVentures];
  }

  // ================= PAGINATION =================
  const totalRecords = combinedData.length;
  const paginatedData = combinedData.slice(skip, skip + limit);

  // ================= RESPONSE =================
  res.status(200).json({
    success: true,

    summary: {
      totalUsers: users.length,
      totalVentures: ventures.length,
      usersLast6Months: last6MonthUserCount,
      venturesLast6Months: last6MonthVentureCount,
    },

    last6MonthsBreakdown: monthlyStats.map((m) => ({
      month: m.label,
      users: m.userCount,
      ventures: m.ventureCount,
    })),

    pagination: {
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      limit,
      hasNextPage: page * limit < totalRecords,
      hasPrevPage: page > 1,
    },

    data: paginatedData,
  });
});


// export const getExpenseTrackerData = async (req, res) => {
//   try {
//     const {
//       startDate,
//       endDate,
//       expenseId,
//       userName, // ✅ renamed
//       page = 1,
//       limit = 10,
//     } = req.query;
//     console.log("🚀 ~ getExpenseTrackerData ~ req.query:", req.query)

//     const pageNumber = Number(page);
//     const pageSize = Number(limit);
//     const skip = (pageNumber - 1) * pageSize;

//     /* ================= BASE MATCH ================= */
//     const matchStage = {
//       senderType: "User",
//       expenseId: { $exists: true, $ne: null },
//       fulfillmentStatus: "completed",
//     };

//     /* ================= DATE FILTER ================= */
//     if (startDate && endDate) {
//       matchStage.createdAt = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     } else if (startDate) {
//       const start = new Date(startDate);
//       const end = new Date(startDate);
//       end.setHours(23, 59, 59, 999);

//       matchStage.createdAt = { $gte: start, $lte: end };
//     }

//     /* ================= EXPENSE FILTER ================= */
//     if (expenseId) {
//       matchStage.expenseId = expenseId;
//     }

//     /* ================= MAIN PIPELINE ================= */
//     const dataPipeline = [
//       { $match: matchStage },

//       /* ===== USER LOOKUP ===== */
//       {
//         $lookup: {
//           from: "users",
//           localField: "senderId",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       { $unwind: "$user" },

//       /* ===== USER NAME SEARCH ===== */
//       ...(userName
//         ? [
//           {
//             $match: {
//               "user.name": { $regex: userName, $options: "i" },
//             },
//           },
//         ]
//         : []),

//       /* ===== EXPENSE LOOKUP ===== */
//       {
//         $lookup: {
//           from: "expenses",
//           localField: "expenseId",
//           foreignField: "_id",
//           as: "expense",
//         },
//       },
//       { $unwind: "$expense" },

//       /* ===== SORT ===== */
//       { $sort: { createdAt: -1 } },

//       /* ===== PAGINATION ===== */
//       { $skip: skip },
//       { $limit: pageSize },

//       /* ===== FINAL RESPONSE ===== */
//       {
//         $project: {
//           _id: 1,
//           amount: 1,
//           module: 1,
//           paymentMethod: 1,
//           paymentStatus: 1,
//           fulfillmentStatus: 1,
//           createdAt: 1,

//           user: {
//             _id: "$user._id",
//             name: "$user.name",
//             email: "$user.email",
//             phoneNumber: "$user.phoneNumber",
//           },

//           expense: {
//             _id: "$expense._id",
//             name: "$expense.name",
//             description: "$expense.description",
//             category: "$expense.category",
//             totalAmount: "$expense.totalAmount",
//             createdAt: "$expense.createdAt",
//           },
//         },
//       },
//     ];

//     /* ================= COUNT PIPELINE ================= */
//     const countPipeline = [
//       { $match: matchStage },

//       {
//         $lookup: {
//           from: "users",
//           localField: "senderId",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       { $unwind: "$user" },

//       ...(userName
//         ? [
//           {
//             $match: {
//               "user.name": { $regex: userName, $options: "i" },
//             },
//           },
//         ]
//         : []),

//       { $count: "total" },
//     ];

//     const [payments, countResult] = await Promise.all([
//       Payment.aggregate(dataPipeline),
//       Payment.aggregate(countPipeline),
//     ]);

//     const totalCount = countResult[0]?.total || 0;
//     const totalPages = Math.ceil(totalCount / pageSize);

//     res.status(200).json({
//       success: true,
//       page: pageNumber,
//       limit: pageSize,
//       totalCount,
//       totalPages,
//       count: payments.length,
//       data: payments,
//     });
//   } catch (error) {
//     console.error("getExpenseTrackerData error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch expense tracker data",
//     });
//   }
// };



// notefication ===========================================================

export const getExpenseTrackerData = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      expenseId,
      userName,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNumber - 1) * pageSize;

    /* ================= BASE MATCH ================= */
    const matchStage = {
      senderType: "User",
      expenseId: { $exists: true, $ne: null },
      fulfillmentStatus: "completed",
    };

    /* ================= DATE FILTER ================= */
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      const start = new Date(startDate);
      const end = new Date(startDate);
      end.setHours(23, 59, 59, 999);
      matchStage.createdAt = { $gte: start, $lte: end };
    }

    /* ================= EXPENSE FILTER ================= */
    if (expenseId) {
      matchStage.expenseId = new mongoose.Types.ObjectId(expenseId);
    }

    /* ================= COMMON PIPELINE ================= */
    const commonPipeline = [
      { $match: matchStage },

      /* USER LOOKUP */
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      /* USER NAME FILTER */
      ...(userName
        ? [
          {
            $match: {
              "user.name": { $regex: userName, $options: "i" },
            },
          },
        ]
        : []),

      /* EXPENSE LOOKUP */
      {
        $lookup: {
          from: "expenses",
          localField: "expenseId",
          foreignField: "_id",
          as: "expense",
        },
      },
      { $unwind: "$expense" },
    ];

    /* ================= DATA PIPELINE ================= */
    const dataPipeline = [
      ...commonPipeline,

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: pageSize },

      {
        $project: {
          _id: 1,
          amount: 1,
          module: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          fulfillmentStatus: 1,
          createdAt: 1,

          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            phoneNumber: "$user.phoneNumber",
          },

          expense: {
            _id: "$expense._id",
            name: "$expense.name",
            description: "$expense.description",
            category: "$expense.category",
            totalAmount: "$expense.totalAmount",
            createdAt: "$expense.createdAt",
          },
        },
      },
    ];

    /* ================= COUNT PIPELINE ================= */
    const countPipeline = [
      ...commonPipeline,
      { $count: "total" },
    ];

    const [payments, countResult] = await Promise.all([
      Payment.aggregate(dataPipeline),
      Payment.aggregate(countPipeline),
    ]);

    const totalCount = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(200).json({
      success: true,
      page: pageNumber,
      limit: pageSize,
      totalCount,
      totalPages,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("❌ getExpenseTrackerData error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expense tracker data",
    });
  }
};


export const sendNoteficationToUser = () => {

}
export const sendNoteficationToVenture = () => {

}