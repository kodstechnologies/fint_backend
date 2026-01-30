import mongoose from "mongoose";
import Payment from "../../models/payment/payment.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import {
    getPagination,
    getPaginationResponse,
} from "../../utils/pagination.js";
import { utcToIST } from "../../utils/time/utcToIST.js";
import { User } from "../../models/user.model.js";


export const getHistory = asyncHandler(async (req, res) => {
    console.log("fdmnkn");

    const userId = req.user._id;
    console.log("🚀 ~ userId:", userId)
    const { page, limit, skip } = getPagination(req);
    const { date, month, name } = req.query;
    console.log("🚀 ~ req.query:", req.query)
    const userData = await User.findById(userId)
    console.log("🚀 ~ userData:", userData.name)
    const userName = userData.name;
    // ================= HELPERS =================
    const isValidDate = (d) =>
        d instanceof Date && !isNaN(d.getTime());

    // ================= BASE FILTER =================
    const filter = {
        $or: [{ senderId: userId }, { receiverId: userId }],
    };

    // ================= DATE FILTER (YYYY-MM-DD) =================
    if (date) {
        const parsedDate = new Date(date);

        if (isValidDate(parsedDate)) {
            const start = new Date(parsedDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(parsedDate);
            end.setHours(23, 59, 59, 999);

            filter.createdAt = { $gte: start, $lte: end };
        }
        // ❌ invalid or empty date → ignored
    }

    // ================= MONTH FILTER (January-2026) =================
    else if (month) {
        const [monthName, yearStr] = month.split("-");
        const year = Number(yearStr);

        if (!monthName || isNaN(year)) {
            throw new ApiError(400, "Invalid month format. Use January-2026");
        }

        const parsedMonth = new Date(`${monthName} 1, ${year}`);
        if (!isValidDate(parsedMonth)) {
            throw new ApiError(400, "Invalid month name");
        }

        const monthIndex = parsedMonth.getMonth();

        const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
        const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

        filter.createdAt = { $gte: start, $lte: end };
    }


    // ================= NAME FILTER =================
    if (
        typeof name === "string" &&
        name.trim() !== "" &&
        name !== userName
    ) {
        filter.$and = [
            {
                $or: [
                    { senderName: { $regex: name.trim(), $options: "i" } },
                    { receiverName: { $regex: name.trim(), $options: "i" } },
                ],
            },
            {
                $or: [{ senderId: userId }, { receiverId: userId }],
            },
        ];

        delete filter.$or;
    }


    // ================= QUERY =================
    const historyRaw = await Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Payment.countDocuments(filter);

    // ================= RESPONSE =================
    const history = historyRaw.map((item) => {
        const isCredited =
            item.receiverId?.toString() === userId.toString();

        return {
            type: isCredited ? "credited" : "debited",
            amount: item.amount ?? 0,
            paymentMethod: item.paymentMethod ?? null,
            paymentStatus: item.paymentStatus ?? "unknown",
            from: isCredited ? item.senderName : "You",
            to: isCredited ? "You" : item.receiverName,
            date: item.createdAt,
        };
    });

    // ================= FINAL RESPONSE =================
    res.status(200).json({
        success: true,
        meta: {
            totalcount: total,
            currentpage: page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
        data: history,
    });
});

// export const getVentureHistory = asyncHandler(async (req, res) => {
//     const ventureId = req.venture._id;
//     const { page, limit, skip } = getPagination(req);
//     const { date, month, name } = req.query;

//     /* ================= UTIL ================= */
//     const isValidDate = (d) => d instanceof Date && !isNaN(d.getTime());

//     /* ================= BASE FILTER ================= */
//     let filter = {
//         $or: [{ senderId: ventureId }, { receiverId: ventureId }],
//     };

//     /* ================= DATE FILTER ================= */
//     if (date) {
//         const parsedDate = new Date(date);
//         if (!isValidDate(parsedDate)) {
//             throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
//         }

//         filter.createdAt = {
//             $gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
//             $lte: new Date(parsedDate.setHours(23, 59, 59, 999)),
//         };
//     }

//     /* ================= MONTH FILTER ================= */
//     else if (month) {
//         const [monthName, yearStr] = month.split("-");
//         const year = Number(yearStr);
//         const parsedMonth = new Date(`${monthName} 1, ${year}`);

//         if (!monthName || isNaN(year) || !isValidDate(parsedMonth)) {
//             throw new ApiError(400, "Invalid month format. Use January-2026");
//         }

//         const monthIndex = parsedMonth.getMonth();

//         filter.createdAt = {
//             $gte: new Date(year, monthIndex, 1),
//             $lte: new Date(year, monthIndex + 1, 0, 23, 59, 59, 999),
//         };
//     }

//     /* ================= NAME FILTER ================= */
//     console.log(`🚀 ~ typeof name === "string" && name.trim():`, typeof name === "string" && name.trim())
//     if (typeof name === "string" && name.trim()) {
//         const search = name.trim();

//         filter = {
//             $and: [
//                 {
//                     $or: [
//                         { senderName: { $regex: `^${search}`, $options: "i" } },
//                         { receiverName: { $regex: `^${search}`, $options: "i" } },
//                     ],
//                 },
//                 {
//                     $or: [{ senderId: ventureId }, { receiverId: ventureId }],
//                 },
//             ],
//         };
//     }

//     /* ================= QUERY ================= */
//     const [historyRaw, total] = await Promise.all([
//         Payment.find(filter)
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(limit),
//         Payment.countDocuments(filter),
//     ]);

//     /* ================= RESPONSE FORMAT ================= */
//     const getDisplayName = (name, phone) =>
//         name?.trim() || phone?.trim() || "Unknown";

//     const history = historyRaw.map((item) => {
//         const isCredited =
//             item.receiverId?.toString() === ventureId.toString();

//         return {
//             type: isCredited ? "credited" : "debited",
//             amount: item.amount,
//             paymentMethod: item.paymentMethod || "general",
//             paymentStatus: item.paymentStatus,
//             fulfillmentStatus: item.fulfillmentStatus,

//             from: isCredited
//                 ? getDisplayName(item.senderName, item.senderPhoneNo)
//                 : "You",

//             to: isCredited
//                 ? "You"
//                 : getDisplayName(item.receiverName, item.receiverPhoneNo),

//             date: item.createdAt,
//         };
//     });

//     /* ================= RESPONSE ================= */
//     res.status(200).json({
//         success: true,
//         meta: {
//             totalCount: total,
//             currentPage: page,
//             limit,
//             totalPages: Math.ceil(total / limit),
//         },
//         data: history,
//     });
// });


export const getVentureHistory = asyncHandler(async (req, res) => {
    const ventureId = req.venture._id;
    const { page, limit, skip } = getPagination(req);
    const { date, month, name } = req.query;

    /* ================= UTIL ================= */
    const isValidDate = (d) => d instanceof Date && !isNaN(d.getTime());

    /* ================= BASE FILTER ================= */
    let filter = {
        receiverId: { $ne: null }, // ✅ KEY FIX
        $or: [
            { senderId: ventureId },
            { receiverId: ventureId },
        ],
    };

    /* ================= DATE FILTER ================= */
    if (date) {
        const parsedDate = new Date(date);
        if (!isValidDate(parsedDate)) {
            throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
        }

        filter.createdAt = {
            $gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
            $lte: new Date(parsedDate.setHours(23, 59, 59, 999)),
        };
    }

    /* ================= MONTH FILTER ================= */
    else if (month) {
        const [monthName, yearStr] = month.split("-");
        const year = Number(yearStr);
        const parsedMonth = new Date(`${monthName} 1, ${year}`);

        if (!monthName || isNaN(year) || !isValidDate(parsedMonth)) {
            throw new ApiError(400, "Invalid month format. Use January-2026");
        }

        const m = parsedMonth.getMonth();
        filter.createdAt = {
            $gte: new Date(year, m, 1),
            $lte: new Date(year, m + 1, 0, 23, 59, 59, 999),
        };
    }

    /* ================= NAME FILTER ================= */
    if (typeof name === "string" && name.trim()) {
        const search = name.trim();

        filter.$and = [
            {
                $or: [
                    { senderName: { $regex: `^${search}`, $options: "i" } },
                    { receiverName: { $regex: `^${search}`, $options: "i" } },
                ],
            },
        ];
    }

    /* ================= QUERY ================= */
    const [historyRaw, total] = await Promise.all([
        Payment.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Payment.countDocuments(filter),
    ]);

    /* ================= RESPONSE FORMAT ================= */
    const getDisplayName = (name, phone) =>
        name?.trim() || phone?.trim();

    const history = historyRaw.map((item) => {
        const isCredited =
            item.receiverId?.toString() === ventureId.toString();

        return {
            type: isCredited ? "credited" : "debited",
            amount: item.amount,
            paymentMethod: item.paymentMethod || "general",
            paymentStatus: item.paymentStatus,
            fulfillmentStatus: item.fulfillmentStatus,
            from: isCredited
                ? getDisplayName(item.senderName, item.senderPhoneNo)
                : "You",
            to: isCredited
                ? "You"
                : getDisplayName(item.receiverName, item.receiverPhoneNo),
            date: item.createdAt,
        };
    });

    /* ================= RESPONSE ================= */
    res.status(200).json({
        success: true,
        meta: {
            totalCount: total,
            currentPage: page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
        data: history,
    });
});


