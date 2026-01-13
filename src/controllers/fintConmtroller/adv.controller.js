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
export const displayVentureAdv = asyncHandler(async (req, res) => {
  console.log("🔐 Verified venture ID:", req.venture._id);

  const ventureId = req.venture._id;

  const ads = await Advertisement.find({ createdBy: ventureId })
    .populate("createdBy", "firstName lastName avatar email")
    .sort({ createdAt: -1 });

  // ✅ Count status-wise
  const statusCounts = {
    active: 0,
    expired: 0,
    deleted: 0,
  };

  ads.forEach((ad) => {
    const status = ad.status;
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
  });

  res.status(200).json({
    success: true,
    total: ads.length,
    statusCounts,
    data: ads,
  });
});

// Display all advertisements with status check and auto-expiry
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
  if (!req.venture) {
    throw new ApiError(401, "Unauthorized");
  }

  const { title, description, validity } = req.body;
  const ventureId = req.venture._id;

  if (!title || !description || !validity) {
    throw new ApiError(
      400,
      "All fields (title, description, validity) are required."
    );
  }

  let imgUrl = null;

  // ✅ Upload image to AWS S3 (optional)
  if (req.file) {
    const fileName = `advertisements/${ventureId}/${Date.now()}-${req.file.originalname}`;
    const { url } = await putObject(req.file, fileName);
    imgUrl = url;
  }

  const newAd = await Advertisement.create({
    title,
    description,
    validity,
    img: imgUrl,           // ✅ S3 URL stored
    createdBy: ventureId,  // ✅ venture reference
  });

  res.status(201).json(
    new ApiResponse(201, newAd, "Advertisement created successfully.")
  );
});

// export const createItem = asyncHandler(async (req, res) => {
//   const { title, description, validity } = req.body;
//   const img = req.file?.path;

//   const ventureId = req.venture?._id; // ✅ FIXED HERE

//   if (!title || !description || !validity) {
//     throw new ApiError(400, "All fields (title, description, validity) are required.");
//   }

//   const newAd = await Advertisement.create({
//     title,
//     description,
//     validity,
//     img,
//     createdBy: ventureId, // ✅ will now be valid
//   });

//   res
//     .status(201)
//     .json(new ApiResponse(201, newAd, "Advertisement created successfully."));
// });
export const updateItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.venture) {
    throw new ApiError(401, "Unauthorized");
  }

  const existingAd = await Advertisement.findById(id);

  if (!existingAd) {
    throw new ApiError(404, "Advertisement not found");
  }

  // 🔐 Only creator venture can update
  if (existingAd.createdBy.toString() !== req.venture._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this advertisement");
  }

  let imgUrl = existingAd.img;

  // ✅ Upload new image to S3 if provided
  if (req.file) {
    const ventureId = req.venture._id;
    const fileName = `advertisements/${ventureId}/${Date.now()}-${req.file.originalname}`;
    const { url } = await putObject(req.file, fileName);
    imgUrl = url;
  }

  const updatedData = {
    title: req.body.title ?? existingAd.title,
    description: req.body.description ?? existingAd.description,
    validity: req.body.validity ?? existingAd.validity,
    img: imgUrl,
  };

  const updatedAd = await Advertisement.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(
    new ApiResponse(200, updatedAd, "Advertisement updated successfully")
  );
});

export const deleteItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ad = await Advertisement.findById(id);

  if (!ad) {
    throw new ApiError(404, "Advertisement not found.");
  }

  ad.status = "deleted";
  await ad.save();

  res
    .status(200)
    .json(new ApiResponse(200, ad, "Your advertisement was deleted."));
});

