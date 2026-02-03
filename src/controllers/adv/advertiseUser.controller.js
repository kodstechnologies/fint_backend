import mongoose from "mongoose";
import redis from "../../config/redis.js";
import Advertisement from "../../models/advertisement/advertisement.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// export const displayUserAdvertisement = asyncHandler(async (req, res) => {
//     const userId = req.user._id.toString();
//     const redisKey = `user:${userId}:seen_ads`;

//     // 1️⃣ Get ads already seen by user
//     let seenAds = await redis.sMembers(redisKey);
//     seenAds = seenAds.map((id) => new mongoose.Types.ObjectId(id));

//     // 2️⃣ Count eligible ads
//     const totalEligibleAds = await Advertisement.countDocuments({
//         status: "active",
//         $expr: { $lt: ["$views", "$count"] },
//     });

//     // 3️⃣ Reset if user has seen all
//     if (seenAds.length >= totalEligibleAds && totalEligibleAds > 0) {
//         await redis.del(redisKey);
//         seenAds = [];
//     }

//     // 4️⃣ Get one random ad
//     const ads = await Advertisement.aggregate([
//         {
//             $match: {
//                 status: "active",
//                 _id: { $nin: seenAds },
//                 $expr: { $lt: ["$views", "$count"] },
//             },
//         },
//         { $sample: { size: 1 } },
//         {
//             $project: {
//                 img: 1,
//                 title: 1,
//                 description: 1,
//             },
//         },
//     ]);

//     if (!ads.length) {
//         return res
//             .status(200)
//             .json(new ApiResponse(200, null, "No advertisements available"));
//     }

//     const ad = ads[0];

//     // 5️⃣ Increase views (SAFE)
//     const updatedAd = await Advertisement.findByIdAndUpdate(
//         ad._id,
//         { $inc: { views: 1 } },
//         { new: true }
//     );

//     // 6️⃣ Expire if limit reached
//     if (updatedAd.views >= updatedAd.count) {
//         await Advertisement.findByIdAndUpdate(ad._id, {
//             status: "expired",
//             revokedAt: new Date(),
//         });
//     }

//     // 7️⃣ Save to Redis
//     await redis.sAdd(redisKey, ad._id.toString());
//     await redis.expire(redisKey, 60 * 60 * 24 * 30);

//     // 8️⃣ Response
//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             {
//                 img: ad.img,
//                 title: ad.title,
//                 description: ad.description,
//             },
//             "Advertisement fetched successfully"
//         )
//     );
// });

// export const displayUserAdvertisement = asyncHandler(async (req, res) => {
//   const userId = req.user._id.toString();
//   const redisKey = `user:${userId}:seen_ads`;

//   // 1️⃣ Get ads already seen by user
//   let seenAds = await redis.sMembers(redisKey);
//   seenAds = seenAds.map((id) => new mongoose.Types.ObjectId(id));

//   // 2️⃣ Count eligible ads
//   const totalEligibleAds = await Advertisement.countDocuments({
//     status: "active",
//     $expr: { $lt: ["$views", "$count"] },
//   });

//   // 3️⃣ Reset if user has seen all ads
//   if (seenAds.length >= totalEligibleAds && totalEligibleAds > 0) {
//     await redis.del(redisKey);
//     seenAds = [];
//   }

//   // 4️⃣ Get one random eligible ad
//   const ads = await Advertisement.aggregate([
//     {
//       $match: {
//         status: "active",
//         _id: { $nin: seenAds },
//         $expr: { $lt: ["$views", "$count"] },
//       },
//     },
//     { $sample: { size: 1 } },
//     {
//       $project: {
//         img: 1,
//         title: 1,
//         description: 1,
//       },
//     },
//   ]);

//   if (!ads.length) {
//     return res.status(200).json(
//       new ApiResponse(200, null, "No advertisements available")
//     );
//   }

//   const ad = ads[0];

//   // 5️⃣ Increment views + save viewHistory + auto-expire (ATOMIC)
//   const updatedAd = await Advertisement.findOneAndUpdate(
//     {
//       _id: ad._id,
//       status: "active",
//       $expr: { $lt: ["$views", "$count"] },
//     },
//     {
//       $inc: { views: 1 },
//       $push: { viewHistory: { viewedAt: Date.now() } },
//       $set: {
//         status: {
//           $cond: [
//             { $gte: [{ $add: ["$views", 1] }, "$count"] },
//             "expired",
//             "active",
//           ],
//         },
//       },
//     },
//     { new: true }
//   );

//   // Safety check (very rare edge case)
//   if (!updatedAd) {
//     return res
//       .status(200)
//       .json(new ApiResponse(200, null, "Advertisement expired"));
//   }

//   // 6️⃣ Save ad as seen for user in Redis
//   await redis.sAdd(redisKey, ad._id.toString());
//   await redis.expire(redisKey, 60 * 60 * 24 * 30); // 30 days

//   // 7️⃣ Response
//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         img: ad.img,
//         title: ad.title,
//         description: ad.description,
//       },
//       "Advertisement fetched successfully"
//     )
//   );
// });


// export const displayUserAdvertisement = asyncHandler(async (req, res) => {
//     const userId = req.user._id.toString();
//     const redisKey = `user:${userId}:seen_ads`;

//     // 1️⃣ Get ads already seen by user
//     let seenAds = await redis.sMembers(redisKey);
//     seenAds = seenAds.map((id) => new mongoose.Types.ObjectId(id));

//     // 2️⃣ Count eligible ads
//     const totalEligibleAds = await Advertisement.countDocuments({
//         status: "active",
//         $expr: { $lt: ["$views", "$count"] },
//     });

//     // 3️⃣ Reset if user has seen all
//     if (seenAds.length >= totalEligibleAds && totalEligibleAds > 0) {
//         await redis.del(redisKey);
//         seenAds = [];
//     }

//     // 4️⃣ Get one random ad
//     const ads = await Advertisement.aggregate([
//         {
//             $match: {
//                 status: "active",
//                 _id: { $nin: seenAds },
//                 $expr: { $lt: ["$views", "$count"] },
//             },
//         },
//         { $sample: { size: 1 } },
//         {
//             $project: {
//                 img: 1,
//                 title: 1,
//                 description: 1,
//             },
//         },
//     ]);

//     if (!ads.length) {
//         return res
//             .status(200)
//             .json(new ApiResponse(200, null, "No advertisements available"));
//     }

//     const ad = ads[0];

//     // 5️⃣ Increase views + save viewHistory (ONLY INTERNAL CHANGE)
//     const updatedAd = await Advertisement.findByIdAndUpdate(
//         ad._id,
//         {
//             $inc: { views: 1 },
//             $push: { viewHistory: { viewedAt: Date.now() } },
//         },
//         { new: true }
//     );

//     // 6️⃣ Expire if limit reached (UNCHANGED)
//     if (updatedAd.views >= updatedAd.count) {
//         await Advertisement.findByIdAndUpdate(ad._id, {
//             status: "expired",
//             revokedAt: new Date(),
//         });
//     }

//     // 7️⃣ Save to Redis
//     await redis.sAdd(redisKey, ad._id.toString());
//     await redis.expire(redisKey, 60 * 60 * 24 * 30);

//     // 8️⃣ Response (UNCHANGED)
//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             {
//                 img: ad.img,
//                 title: ad.title,
//                 description: ad.description,
//             },
//             "Advertisement fetched successfully"
//         )
//     );
// });

export const displayUserAdvertisement = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const redisKey = `user:${userId}:seen_ads`;

    // 1️⃣ Get ads already seen by user
    let seenAds = await redis.sMembers(redisKey);
    seenAds = seenAds.map((id) => new mongoose.Types.ObjectId(id));

    // 2️⃣ Get all eligible ads (active + not exceeded count)
    const eligibleAds = await Advertisement.find(
        {
            status: "active",
            $expr: { $lt: ["$views", "$count"] },
        },
        { _id: 1 }
    ).lean();

    const eligibleAdIds = eligibleAds.map((ad) => ad._id.toString());
    const eligibleSet = new Set(eligibleAdIds);

    // 3️⃣ Remove expired / invalid ads from Redis seen list
    seenAds = seenAds.filter((id) => eligibleSet.has(id.toString()));

    // 4️⃣ Reset if user has seen all eligible ads
    if (seenAds.length >= eligibleAdIds.length && eligibleAdIds.length > 0) {
        await redis.del(redisKey);
        seenAds = [];
    }

    // 5️⃣ Get one random ad user has not seen
    const ads = await Advertisement.aggregate([
        {
            $match: {
                status: "active",
                _id: { $nin: seenAds },
                $expr: { $lt: ["$views", "$count"] },
            },
        },
        { $sample: { size: 1 } },
        {
            $project: {
                img: 1,
                title: 1,
                description: 1,
            },
        },
    ]);

    if (!ads.length) {
        return res
            .status(200)
            .json(new ApiResponse(200, null, "No advertisements available"));
    }

    const ad = ads[0];

    // 6️⃣ Increase views + save viewHistory
    const updatedAd = await Advertisement.findByIdAndUpdate(
        ad._id,
        {
            $inc: { views: 1 },
            $push: { viewHistory: { viewedAt: Date.now() } },
        },
        { new: true }
    );

    // 7️⃣ Expire ad if limit reached
    if (updatedAd.views >= updatedAd.count) {
        await Advertisement.findByIdAndUpdate(ad._id, {
            status: "expired",
            revokedAt: new Date(),
        });
    }

    // 8️⃣ Save ad as seen in Redis
    await redis.sAdd(redisKey, ad._id.toString());
    await redis.expire(redisKey, 60 * 60 * 24 * 30); // 30 days

    // 9️⃣ Response (UNCHANGED)
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                img: ad.img,
                title: ad.title,
                description: ad.description,
            },
            "Advertisement fetched successfully"
        )
    );
});
