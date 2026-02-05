import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Bank from "../../models/bank/bank.model.js";
import { putObject } from "../../utils/aws/putObject.js";
import CardType from "../../models/bank/cardType.model.js";

/* ================= CREATE BANK ================= */

export const createBank = asyncHandler(async (req, res) => {
    const { bankName } = req.body;

    // 1️⃣ Validate input
    if (!bankName) {
        throw new ApiError(400, "Bank name is required");
    }

    if (!req.file) {
        throw new ApiError(400, "Bank image is required");
    }

    // 2️⃣ Check duplicate bank
    const existingBank = await Bank.findOne({ bankName });
    if (existingBank) {
        throw new ApiError(409, "Bank already exists");
    }

    // 3️⃣ Generate unique file name
    const fileExtension = req.file.originalname.split(".").pop();
    const fileName = `banks/${crypto.randomUUID()}.${fileExtension}`;

    // 4️⃣ Upload image to AWS S3
    const { url, key } = await putObject(req.file, fileName);

    // 5️⃣ Save bank in DB
    const bank = await Bank.create({
        bankName,
        bankImage: url,     // ✅ PUBLIC S3 URL
        bankImageKey: key   // ✅ (optional but recommended)
    });

    // 6️⃣ Response
    return res
        .status(201)
        .json(new ApiResponse(201, bank, "Bank created successfully"));
});

// =================================================

export const createCardType = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Card type name is required" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        const exists = await CardType.findOne({ name });
        if (exists) {
            return res.status(409).json({ message: "Card type already exists" });
        }

        const ext = req.file.originalname.split(".").pop();
        const key = `cardTypes/${crypto.randomUUID()}.${ext}`;

        const { url } = await putObject(req.file, key);

        const cardType = await CardType.create({
            name,
            image: url
        });

        return res.status(201).json({
            success: true,
            message: "Card type created successfully",
            data: cardType
        });
    } catch (error) {
        console.error("❌ createCardType error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



/* ================= GET ALL BANKS ================= */

export const getAllBanks = async (req, res) => {
    try {
        const banks = await Bank.find().sort({ createdAt: -1 });
        const cardTypes = await CardType.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            banks: banks,        // 👈 array 1
            cardTypes: cardTypes // 👈 array 2
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* ================= GET BANK BY ID ================= */
export const getBankById = asyncHandler(async (req, res) => {
    const { bankId } = req.params;

    const bank = await Bank.findById(bankId);
    if (!bank) {
        throw new ApiError(404, "Bank not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, bank, "Bank fetched successfully"));
});

/* ================= UPDATE BANK ================= */
export const updateBank = asyncHandler(async (req, res) => {
    const { bankId } = req.params;
    const { bankName } = req.body;

    const bank = await Bank.findById(bankId);
    if (!bank) {
        throw new ApiError(404, "Bank not found");
    }

    if (bankName) {
        bank.bankName = bankName;
    }

    if (req.file) {
        bank.bankImage = req.file.path; // or req.file.location
    }

    await bank.save();

    return res
        .status(200)
        .json(new ApiResponse(200, bank, "Bank updated successfully"));
});

/* ================= DELETE BANK ================= */
export const deleteBank = asyncHandler(async (req, res) => {
    const { bankId } = req.params;

    const bank = await Bank.findByIdAndDelete(bankId);
    if (!bank) {
        throw new ApiError(404, "Bank not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Bank deleted successfully"));
});
