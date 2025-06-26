import { Router } from "express";
import {
  getLatestItem,
  getAllItems,
  createItem,
  updateItemById,
  deleteItemById,
} from "../controllers/item.controller.js"; // ✅ Adjust path as needed

const router = Router();

/**
 * @route   GET /
 * @desc    Get the latest single item
 */
router.get("/", getLatestItem);

/**
 * @route   GET /all
 * @desc    Get all items
 */
router.get("/all", getAllItems);

/**
 * @route   POST /add
 * @desc    Create a new item
 */
router.post("/add", createItem);

/**
 * @route   PATCH /:id
 * @desc    Update an item by ID
 */
router.patch("/:id", updateItemById);

/**
 * @route   DELETE /:id
 * @desc    Delete an item by ID
 */
router.delete("/:id", deleteItemById);

export default router;
