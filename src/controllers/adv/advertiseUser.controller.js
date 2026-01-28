import mongoose from "mongoose";
import redis from "../../config/redis.js";
import Advertisement from "../../models/advertisement/advertisement.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const displayUserAdvertisement = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const userCreatedAt = new Date(req.user.createdAt);

    const redisKey = `user:${userId}:seen_ads`;

    // 1️⃣ Get already seen ads
    const seenAds = await redis.sMembers(redisKey);
    const seenObjectIds = seenAds.map((id) => new mongoose.Types.ObjectId(id));

    // 2️⃣ Mongo match condition
    const matchCondition = {
        _id: { $nin: seenObjectIds },
        $expr: { $lt: ["$views", "$count"] }, // views < count
        $or: [
            { status: "active" },
            {
                status: "revoked",
                revokedAt: { $gt: userCreatedAt },
            },
        ],
    };

    // 3️⃣ Fetch one random ad
    const ads = await Advertisement.aggregate([
        { $match: matchCondition },
        { $sample: { size: 1 } },
        {
            $project: {
                img: 1,
                title: 1,
                description: 1,
            },
        },
    ]);

    // 4️⃣ No ad found
    if (!ads.length) {
        return res
            .status(200)
            .json(new ApiResponse(200, null, "No advertisements available"));
    }

    const ad = ads[0];

    // 5️⃣ Increase views
    await Advertisement.findByIdAndUpdate(ad._id, {
        $inc: { views: 1 },
    });

    // 6️⃣ Mark ad as seen (Redis)
    await redis.sAdd(redisKey, ad._id.toString());
    await redis.expire(redisKey, 60 * 60 * 24 * 30); // 30 days

    // 7️⃣ Remove internal fields from response
    const { _id, ...responseAd } = ad;

    return res
        .status(200)
        .json(new ApiResponse(200, responseAd, "Advertisement fetched successfully"));
});
