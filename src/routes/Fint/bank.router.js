import { Router } from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import { createBank, createCardType, deleteBank, getAllBanks, getBankById, updateBank } from "../../controllers/paymentGetway/bank.controller.js";

const router = Router();

// fintVenture 

router.post("/", upload.single("img"), createBank);
router.post("/CardType", upload.single("image"), createCardType);
router.get("/", getAllBanks);
router.get("/:bankId", getBankById);
router.patch("/:bankId", upload.single("img"), updateBank);
router.delete("/:bankId", deleteBank);

export default router;
