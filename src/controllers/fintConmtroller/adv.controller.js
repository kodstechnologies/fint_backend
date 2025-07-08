import Advertisement from "../../models/advertisement/advertisement.model.js";
import DelAdvertisement from "../../models/advertisement/deletedAdvertisement.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const displayAdvertisement = asyncHandler(async (req, res) => {
  const activeAds = await Advertisement.find({ isExpired: false }).sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, activeAds, "Active (non-expired) advertisements fetched.")
  );
});
export const displayDeletedAdvertisement = asyncHandler(async (req, res) => {
  const deletedAds = await DelAdvertisement.find().sort({ createdAt: -1 }); // latest first

  res.status(200).json(
    new ApiResponse(200, deletedAds, "All deleted advertisements fetched.")
  );
});
export const displayExpiredAdvertisement = asyncHandler(async (req, res) => {
  const activeAds = await Advertisement.find({ isExpired: true }).sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, activeAds, "Active (non-expired) advertisements fetched.")
  );
});
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
export const createItem = asyncHandler (async (req ,res) =>{
    const { title, description, validity } = req.body;
    const img = req.file?.path ; 
    if (!title || !description || !validity) {
    throw new ApiError(400, "All fields (title, description, validity, img) are required.");
  }
    const newAd = await Advertisement.create({
    title,
    description,
    validity,
  });
  res.status(201).json(
    new ApiResponse(201, newAd, "Advertisement created successfully.")
  );
});
export const updateItemById = () =>{

}
export const deleteItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Find the advertisement
  const ad = await Advertisement.findById(id);

  if (!ad) {
    throw new ApiError(404, "Advertisement not found.");
  }

  // 2. Save it to the deleted collection with all fields
  await DelAdvertisement.create({
    img: ad.img,
    title: ad.title,
    description: ad.description,
    validity: ad.validity,
    views: ad.views,
    viewers: ad.viewers,
  });

  // 3. Delete it from the original collection
  await Advertisement.findByIdAndDelete(id);

  res.status(200).json(
    new ApiResponse(200, ad, "Advertisement archived and deleted successfully.")
  );
});
