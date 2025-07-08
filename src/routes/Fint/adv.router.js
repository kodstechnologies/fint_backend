import { Router } from "express";
import {
  createItem,
  updateItemById,
  deleteItemById,
  displayDeletedAdvertisement,
  displayExpiredAdvertisement,
  analytics,
  displayAdvertisement,
} from "../../controllers/fintConmtroller/adv.controller.js"; // ✅ Adjust path as needed
import { upload } from "../../middlewares/multer.middleware.js";

const router = Router();

/**
 * @route   GET /deleted
 * @desc    Get all deleted advertisements
 */
router.get("/available", displayAdvertisement);
/**
 * @route   GET /deleted
 * @desc    Get all deleted advertisements
 */
router.get("/deleted", displayDeletedAdvertisement);

/**
 * @route   GET /expired
 * @desc    Get all expired advertisements
 */
router.get("/expired", displayExpiredAdvertisement);

/**
 * @route   GET /analytics
 * @desc    Get views & viewers analytics
 */
router.get("/analytics", analytics);
/**
 * @route   POST /add
 * @desc    Create a new item
 */
router.post("/add", upload.single("img") , createItem);

/**
 * @route   PATCH /:id
 * @desc    Update an item by ID
 */
router.patch("/:id",upload.single("img"), updateItemById);

/**
 * @route   DELETE /:id
 * @desc    Delete an item by ID
 */
router.delete("/:id", deleteItemById);

export default router;
