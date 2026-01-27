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

    const filter = {};

    // ===== DEFAULT TODAY =====
    if (!req.query.date && !req.query.month) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        filter.createdAt = { $gte: start, $lte: end };
    }

    const historyRaw = await Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Payment.countDocuments(filter);

    // ================= TRANSFORM RESPONSE =================
    const history = historyRaw.map((item) => {
        const isCredited =
            item.receiverId &&
            item.receiverId.toString() === userId.toString();

        return {
            senderName: item.senderName || null,
            receiverName: item.receiverName || null,

            date: utcToIST(item.createdAt),

            type: isCredited ? "credited" : "debited",

            creditedAmount: isCredited ? item.amount : 0,
            debitedAmount: !isCredited ? item.amount : 0,
        };
    });

    res.status(200).json(
        getPaginationResponse({
            total,
            page,
            limit,
            data: history,
        })
    );
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

