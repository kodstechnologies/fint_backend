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
    console.log("🚀 ~ userName:", userName)
    console.log("🚀 ~ name:", name)
    console.log("🚀 ~ name !== userName:", name !== userName)
    if ( name !== userName) {

    console.log("nggnfnr");
    
        filter.$and = [
            {
                $or: [
                    { senderName: { $regex: name, $options: "i" } },
                    { receiverName: { $regex: name, $options: "i" } },
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

export const getVentureHistory = asyncHandler(async (req, res) => {
    if (!req.venture) {
        throw new ApiError(401, "Unauthorized");
    }

    const ventureId = req.venture._id;
    console.log("🚀 ~ ventureId:", ventureId)
    const { page, limit, skip } = getPagination(req);
    const { date, month, name } = req.query;
    console.log("🚀 ~ date, month, name:", date, month, name)

    const isValidDate = (d) =>
        d instanceof Date && !isNaN(d.getTime());

    // ================= BASE FILTER =================
    const filter = {
        fulfillmentStatus: "completed",
        $or: [
            { senderId: ventureId },
            { receiverId: ventureId },
        ],
    };

    // ================= DATE FILTER =================
    if (date) {
        const parsedDate = new Date(date);
        if (isValidDate(parsedDate)) {
            const start = new Date(parsedDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(parsedDate);
            end.setHours(23, 59, 59, 999);

            filter.createdAt = { $gte: start, $lte: end };
        }
    }

    // ================= MONTH FILTER =================
    else if (month) {
        const [monthName, yearStr] = month.split("-");
        const year = Number(yearStr);

        const parsedMonth = new Date(`${monthName} 1, ${year}`);
        if (!monthName || isNaN(year) || !isValidDate(parsedMonth)) {
            throw new ApiError(400, "Invalid month format. Use January-2026");
        }

        const monthIndex = parsedMonth.getMonth();

        const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
        const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

        filter.createdAt = { $gte: start, $lte: end };
    }

    // ================= NAME FILTER (SENDER + RECEIVER) =================
    if (name) {
        filter.$and = [
            {
                $or: [
                    { senderName: { $regex: name, $options: "i" } },
                    { receiverName: { $regex: name, $options: "i" } },
                ],
            },
            {
                $or: [
                    { senderId: ventureId },
                    { receiverId: ventureId },
                ],
            },
        ];

        delete filter.$or;
    }

    // ================= TOTAL =================
    const total = await Payment.countDocuments(filter);

    // ================= FETCH =================
    const payments = await Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(`
            senderId senderName senderAccountHolderName senderPhoneNo
            receiverId receiverName receiverAccountHolderName receiverPhoneNo
            amount paymentMethod paymentStatus createdAt
        `);

    // ================= FORMAT =================
    const history = payments.map((p) => {
        console.log("🚀 ~ p:", p)
        const isDebited = p.senderId?.toString() === ventureId.toString();

        let eChangesStatus = null;
        if (p.paymentMethod === "eChanges") {
            eChangesStatus = p.receiverId ? "USED" : "NOT_USED";
        }

        return {
            type: isDebited ? "DEBITED" : "CREDITED",
            amount: p.amount,
            paymentMethod: p.paymentMethod,
            paymentStatus: p.paymentStatus,
            eChangesStatus,

            // ✅ CLEAR NAME DISPLAY
            senderName:
                p.senderName ||
                p.senderAccountHolderName ||
                p.senderPhoneNo ||
                "Unknown",

            receiverName:
                p.receiverName ||
                p.receiverAccountHolderName ||
                p.receiverPhoneNo ||
                "Not Assigned",

            from: isDebited
                ? "Venture"
                : (p.senderName || p.senderAccountHolderName || p.senderPhoneNo),

            to: isDebited
                ? (p.receiverName || p.receiverAccountHolderName || p.receiverPhoneNo || "Not Assigned")
                : "Venture",

            date: utcToIST(p.createdAt),
        };
    });

    // ================= RESPONSE =================
    res.status(200).json({
        success: true,
        meta: {
            totalRecords: total,
            currentPage: page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
        },
        data: history,
    });
});
