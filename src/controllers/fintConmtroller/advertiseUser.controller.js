import Advertisement from "../../models/advertisement/advertisement.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { putObject } from "../../utils/aws/putObject.js";

export const displayUSerAdvertisement = asyncHandler(async (req, res) => {
    // 1️⃣ Get latest active advertisement
    const advertisement = await Advertisement.findOne({ status: "active" })
        .sort({ createdAt: -1 })
        .select("title img description");

    // 2️⃣ If no advertisement found → data = null
    if (!advertisement) {
        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "No advertisement available"
            )
        );
    }

    // 3️⃣ Increment views safely (no NaN issue)
    await Advertisement.updateOne(
        { _id: advertisement._id },
        { $inc: { views: 1 } }
    );

    // 4️⃣ Response with data
    const responseData = {
        title: advertisement.title ?? null,
        img: advertisement.img ?? null,
        description: advertisement.description ?? null,
    };

    return res.status(200).json(
        new ApiResponse(
            200,
            responseData,
            "Latest advertisement fetched successfully"
        )
    );
});



