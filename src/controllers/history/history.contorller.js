import mongoose from "mongoose";
import Payment from "../../models/payment/payment.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import {
    getPagination,
    getPaginationResponse,
} from "../../utils/pagination.js";
import { utcToIST } from "../../utils/time/utcToIST.js";


export const getHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page, limit, skip } = getPagination(req);
    const { date, month, name } = req.query;

    const filter = {
        $or: [{ senderId: userId }, { receiverId: userId }],
    };

    const now = new Date();

    // ================= DATE FILTER =================
    if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        filter.createdAt = { $gte: start, $lte: end };
    }
    else if (month) {
        const year = now.getFullYear();
        const monthIndex = Number(month) - 1;

        const start = new Date(year, monthIndex, 1);
        const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

        filter.createdAt = { $gte: start, $lte: end };
    }

    // ================= NAME FILTER (FIXED) =================
    if (name) {
        filter.$and = [
            {
                $or: [
                    { senderName: { $regex: name, $options: "i" } },
                    { receiverName: { $regex: name, $options: "i" } }
                ]
            },
            {
                $or: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            }
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
            date: item.createdAt.toISOString(),
        };
    });

    res.status(200).json({
        success: true,
        count: total,
        data: history,
    });
});


export const getVentureHistory = asyncHandler(async (req, res) => {
    // ================= VENTURE ONLY =================
    if (!req.venture) {
        throw new ApiError(401, "Unauthorized");
    }

    const ventureId = req.venture._id;

    // ================= FETCH PAYMENTS =================
    const payments = await Payment.find({
        fulfillmentStatus: "completed",
        $or: [
            { senderId: ventureId },
            { receiverId: ventureId },
        ],
    })
        .sort({ createdAt: -1 })
        .select(`
      senderId senderAccountHolderName senderPhoneNo
      receiverId receiverAccountHolderName receiverPhoneNo
      amount paymentMethod paymentStatus createdAt
    `);

    // ================= FORMAT HISTORY =================
    const history = payments.map((p) => {
        const isDebited = p.senderId?.toString() === ventureId.toString();

        // ---------- eChanges logic ----------
        let eChangesStatus = null;
        if (p.paymentMethod === "eChanges") {
            eChangesStatus = p.receiverId ? "USED" : "NOT_USED";
        }

        return {
            type: isDebited ? "DEBITED" : "CREDITED",
            amount: p.amount,

            paymentMethod: p.paymentMethod,
            paymentStatus: p.paymentStatus, // ✅ ADDED

            eChangesStatus, // null for non-eChanges

            from: isDebited
                ? "Venture"
                : p.senderAccountHolderName || p.senderPhoneNo,

            to: isDebited
                ? p.receiverAccountHolderName || p.receiverPhoneNo || "Not Assigned"
                : "Venture",

            date: p.createdAt,
        };
    });

    // ================= RESPONSE =================
    res.status(200).json({
        success: true,
        count: history.length,
        data: history,
    });
});

