import { Router } from "express";
import { adminverifyJWT } from "../../middlewares/auth.admin.middleware.js";
import { userOrAdminAuth } from "../../middlewares/auth.either.middleware.js";

import {
    getAllExpenseName,
    addExpenseName,
    editExpenseName,
    deleteExpense,
} from "../../controllers/expenseTrack/expense.controller.js";

const router = Router();

// ✅ User + Admin can view
router.get("/", userOrAdminAuth, getAllExpenseName);

// ✅ Only Admin can add
router.post("/", adminverifyJWT, addExpenseName);

// ✅ Only Admin can edit
router.patch("/:id", adminverifyJWT, editExpenseName);

// ✅ Only Admin can delete
router.delete("/:id", adminverifyJWT, deleteExpense);

export default router;
