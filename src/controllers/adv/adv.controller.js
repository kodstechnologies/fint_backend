import Advertisement from "../../models/advertisement/advertisement.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { putObject } from "../../utils/aws/putObject.js";

export const displayAdvertisement = asyncHandler(async (req, res) => {
  const expiredAds = await Advertisement.find({ status: 'active' });

  return res.status(200).json(
    new ApiResponse(200, expiredAds, "✅ Expired advertisements fetched successfully.")
  );
});
export const displayDeletedAdvertisement = asyncHandler(async (req, res) => {
  const expiredAds = await Advertisement.find({ status: 'deleted' });

  return res.status(200).json(
    new ApiResponse(200, expiredAds, "✅ Expired advertisements fetched successfully.")
  );
});
export const displayExpiredAdvertisement = asyncHandler(async (req, res) => {
  const expiredAds = await Advertisement.find({ status: 'expired' });

  return res.status(200).json(
    new ApiResponse(200, expiredAds, "✅ Expired advertisements fetched successfully.")
  );
});


// export const displayVentureAdv = asyncHandler(async (req, res) => {
//   console.log("🔐 Verified venture ID:", req.venture._id);

//   const ventureId = req.venture._id;

//   // 1️⃣ Fetch all ads
//   const ads = await Advertisement.find({ createdBy: ventureId })
//     .populate("createdBy", "firstName lastName avatar email")
//     .sort({ createdAt: -1 })
//     .lean();

//   // 2️⃣ Status-wise count
//   const statusCounts = {
//     active: 0,
//     expired: 0,
//   };

//   ads.forEach((ad) => {
//     if (statusCounts[ad.status] !== undefined) {
//       statusCounts[ad.status]++;
//     }
//   });

//   // 🔹 Calculate last 30 days cutoff
//   const last30Days = new Date();
//   last30Days.setDate(last30Days.getDate() - 30);

//   // 3️⃣ Add DAILY VIEW COUNTS (LAST 30 DAYS ONLY)
//   const adsWithDailyViews = ads.map((ad) => {
//     const dailyMap = {};

//     if (Array.isArray(ad.viewHistory)) {
//       ad.viewHistory.forEach((entry) => {
//         const viewedDate = new Date(entry.viewedAt);

//         // ✅ Filter last 30 days only
//         if (viewedDate >= last30Days) {
//           const dateKey = viewedDate.toISOString().split("T")[0];
//           dailyMap[dateKey] = (dailyMap[dateKey] || 0) + 1;
//         }
//       });
//     }

//     const dailyViews = Object.keys(dailyMap)
//       .sort()
//       .map((date) => ({
//         date,
//         views: dailyMap[date],
//       }));

//     return {
//       ...ad,
//       dailyViews, // ✅ LAST 30 DAYS ONLY
//     };
//   });

//   // 4️⃣ Response
//   res.status(200).json({
//     success: true,
//     total: adsWithDailyViews.length,
//     statusCounts,
//     data: adsWithDailyViews,
//   });
// });
export const displayVentureAdv = asyncHandler(async (req, res) => {
  console.log("🔐 Verified venture ID:", req.venture._id);

  const ventureId = req.venture._id;

  // 1️⃣ Fetch ads
  const ads = await Advertisement.find({ createdBy: ventureId })
    .populate("createdBy", "firstName lastName avatar email")
    .sort({ createdAt: -1 })
    .lean();

  // 2️⃣ Status counts
  const statusCounts = { active: 0, expired: 0 };
  ads.forEach((ad) => {
    if (statusCounts[ad.status] !== undefined) {
      statusCounts[ad.status]++;
    }
  });

  // 🔹 Normalize today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 🔹 Last 30 days cutoff (ONCE)
  const last30Days = new Date(today);
  last30Days.setDate(today.getDate() - 30);

  // 🔹 Helper: last 7 days template
  const getLast7DaysTemplate = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        date: d.toISOString().split("T")[0],
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        views: 0,
      });
    }
    return days;
  };

  // 🔹 Global weekly total
  const weeklyDayWiseTotal = getLast7DaysTemplate();
  let last30DaysTotalViews = 0;

  // 3️⃣ Build analytics
  const adsWithAnalytics = ads.map((ad) => {
    const last7DaysViews = getLast7DaysTemplate();
    const dayWiseMap = {};

    if (Array.isArray(ad.viewHistory)) {
      ad.viewHistory.forEach((entry) => {
        const viewedDate = new Date(entry.viewedAt);
        viewedDate.setHours(0, 0, 0, 0);

        const dateKey = viewedDate.toISOString().split("T")[0];

        // 🔸 Per-ad last 7 days
        last7DaysViews.forEach((day) => {
          if (day.date === dateKey) {
            day.views += 1;
          }
        });

        // 🔸 Global weekly
        weeklyDayWiseTotal.forEach((day) => {
          if (day.date === dateKey) {
            day.views += 1;
          }
        });

        // 🔸 Last 30 days total (GLOBAL)
        if (viewedDate >= last30Days) {
          last30DaysTotalViews += 1;

          // ✅ DAY-WISE COUNT (ONLY LAST 30 DAYS)
          dayWiseMap[dateKey] = (dayWiseMap[dateKey] || 0) + 1;
        }
      });
    }

    // 🔹 Convert map → array (already filtered)
    const dayWiseViewCount = Object.keys(dayWiseMap)
      .sort()
      .map((date) => ({
        date,
        count: dayWiseMap[date],
      }));

    return {
      ...ad,
      last7DaysViews,
      dayWiseViewCount, // ✅ ONLY LAST 30 DAYS
    };
  });

  // 4️⃣ Response
  res.status(200).json({
    success: true,
    totalAds: adsWithAnalytics.length,
    statusCounts,
    weeklyDayWiseTotal,
    last30DaysTotalViews,
    data: adsWithAnalytics,
  });
});

export const displayVentureAdvDetails = asyncHandler(async (req, res) => {
  const ventureId = req.venture._id;

  const ads = await Advertisement.find({ createdBy: ventureId })
    .populate("createdBy", "firstName lastName avatar email")
    .sort({ createdAt: -1 })
    .select("-viewHistory") // ✅ REMOVE FIELD FROM RESPONSE
    .lean();

  const statusCounts = { active: 0, expired: 0, deleted: 0 };

  ads.forEach((ad) => {
    if (statusCounts[ad.status] !== undefined) {
      statusCounts[ad.status]++;
    }
  });

  res.status(200).json({
    success: true,
    total: ads.length,
    statusCounts,
    data: ads,
  });
});


export const displayAdv = asyncHandler(async (req, res) => {
  // Auto-expire advertisements where validity has passed
  const now = new Date();
  await Advertisement.updateMany(
    { validity: { $lte: now }, status: "active" },
    { $set: { status: "expired", isExpired: true } }
  );

  // Fetch all advertisements, sorted by latest
  const advertisements = await Advertisement.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: advertisements,
    total: advertisements.length,
  });
});

// GET /venture/:ventureId/ads
export const analytics = asyncHandler(async (req, res) => {
  const analyticsData = await Advertisement.aggregate([
    // Unwind the viewers array to access individual view records
    { $unwind: "$viewers" },

    // Group by date (formatted to YYYY-MM-DD)
    {
      $group: {
        _id: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$viewers.viewedAt" } }
        },
        totalViews: { $sum: 1 },
        uniqueUsers: { $addToSet: "$viewers.userId" },
      }
    },

    // Project output nicely
    {
      $project: {
        _id: 0,
        date: "$_id.day",
        totalViews: 1,
        uniqueUsersCount: { $size: "$uniqueUsers" },
      }
    },

    // Sort by most recent day first
    { $sort: { date: -1 } }
  ]);

  res.status(200).json(new ApiResponse(200, analyticsData, "Day-wise analytics data"));
});

export const createItem = asyncHandler(async (req, res) => {
  // 1️⃣ Authorization
  if (!req.venture) {
    throw new ApiError(401, "Unauthorized");
  }

  const { title, description, count } = req.body;
  const ventureId = req.venture._id;

  // 2️⃣ Validation
  if (!title || !description) {
    throw new ApiError(
      400,
      "All fields (title, description) are required."
    );
  }

  let imgUrl = null;

  // 3️⃣ Optional image upload
  if (req.file) {
    const fileName = `advertisements/${ventureId}/${Date.now()}-${req.file.originalname}`;
    const { url } = await putObject(req.file, fileName);
    imgUrl = url;
  }

  // 4️⃣ Create Advertisement
  const newAd = await Advertisement.create({
    title: title.trim(),
    description: description.trim(),
    img: imgUrl,
    createdBy: ventureId,

    status: "active", // enum-safe
    count,         // ✅ initialize count properly
  });

  // 5️⃣ Response
  return res.status(201).json(
    new ApiResponse(
      201,
      newAd,
      "Advertisement created successfully."
    )
  );
});

export const updateItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1️⃣ Authorization
  if (!req.venture) {
    throw new ApiError(401, "Unauthorized");
  }

  // 2️⃣ Find advertisement
  const existingAd = await Advertisement.findById(id);
  if (!existingAd) {
    throw new ApiError(404, "Advertisement not found");
  }

  // 3️⃣ Ownership check
  if (existingAd.createdBy.toString() !== req.venture._id.toString()) {
    throw new ApiError(
      403,
      "You are not allowed to update this advertisement"
    );
  }

  // 🚫 Do not allow updating revoked ads
  if (existingAd.status === "revoked") {
    throw new ApiError(400, "Revoked advertisement cannot be updated");
  }

  let imgUrl = existingAd.img;

  // 4️⃣ Optional image upload
  if (req.file) {
    const ventureId = req.venture._id;
    const fileName = `advertisements/${ventureId}/${Date.now()}-${req.file.originalname}`;
    const { url } = await putObject(req.file, fileName);
    imgUrl = url;
  }

  // 5️⃣ Validate count if provided
  if (req.body.count !== undefined) {
    const parsedCount = Number(req.body.count);
    if (isNaN(parsedCount) || parsedCount < 0) {
      throw new ApiError(400, "Count must be a non-negative number");
    }
  }

  // 6️⃣ Build update object (ONLY allowed fields)
  const updatedData = {
    ...(req.body.title && { title: req.body.title.trim() }),
    ...(req.body.description && {
      description: req.body.description.trim(),
    }),
    ...(req.body.count !== undefined && {
      count: Number(req.body.count),
    }),
    img: imgUrl,
  };

  // 7️⃣ Update
  const updatedAd = await Advertisement.findByIdAndUpdate(
    id,
    updatedData,
    {
      new: true,
      runValidators: true,
    }
  );

  // 8️⃣ Response
  return res.status(200).json(
    new ApiResponse(
      200,
      updatedAd,
      "Advertisement updated successfully"
    )
  );
});


export const deleteItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ad = await Advertisement.findById(id);

  if (!ad) {
    throw new ApiError(404, "Advertisement not found.");
  }

  // ✅ Already revoked check
  if (ad.status === "expired") {
    throw new ApiError(400, "This advertisement is already revoked.");
  }

  ad.status = "expired";
  await ad.save();

  res
    .status(200)
    .json(new ApiResponse(200, ad, "Your advertisement has been revoked successfully."));
});

export const revokeAdv = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // const { revokedAt } = req.body;
  const revokedAt = new Date()
    .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
    .replace(" ", "T");

  // 1️⃣ Auth check
  if (!req.venture) {
    throw new ApiError(401, "Unauthorized");
  }

  // 2️⃣ Find advertisement
  const ad = await Advertisement.findById(id);
  if (!ad) {
    throw new ApiError(404, "Advertisement not found");
  }

  // 3️⃣ Only creator venture can revoke
  if (ad.createdBy.toString() !== req.venture._id.toString()) {
    throw new ApiError(403, "You are not allowed to revoke this advertisement");
  }

  // 4️⃣ Already revoked
  if (ad.status === "expired") {
    return res.status(200).json(
      new ApiResponse(200, ad, "Advertisement already revoked")
    );
  }

  // 5️⃣ Validate & normalize date
  let finalRevokedAt;

  if (revokedAt) {
    const parsedDate = new Date(revokedAt);

    if (isNaN(parsedDate.getTime())) {
      throw new ApiError(400, "Invalid revokedAt date format");
    }

    parsedDate.setHours(0, 0, 0, 0); // remove time
    finalRevokedAt = parsedDate;
  } else {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    finalRevokedAt = d;
  }

  // 6️⃣ Revoke
  ad.status = "revoked";
  ad.revokedAt = finalRevokedAt;

  await ad.save();

  // 7️⃣ Response
  return res.status(200).json(
    new ApiResponse(200, ad, "Advertisement revoked successfully")
  );
});

