import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import Expense from "../../models/expense/expense.model.js";

export const getAllExpenseName = asyncHandler(async (req, res) => {
    const expenses = await Expense.aggregate([
        {
            $addFields: {
                sortNumber: {
                    $convert: {
                        input: {
                            $arrayElemAt: [
                                { $regexFindAll: { input: "$name", regex: /[0-9]+/ } },
                                0
                            ]
                        },
                        to: "int",
                        onError: 0,
                        onNull: 0
                    }
                }
            }
        },
        {
            $sort: { sortNumber: 1 }
        },
        {
            $project: { sortNumber: 0 }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, expenses, "Expenses fetched successfully")
    );
});


/**
 * @desc    Add new expense name
 * @route   POST /expense
 * @access  Admin
 */
export const addExpenseName = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        throw new ApiError(400, "Expense name is required");
    }

    // ✅ Limit check (max 12)
    const totalExpenses = await Expense.countDocuments();
    if (totalExpenses >= 12) {
        throw new ApiError(400, "Maximum 12 expense names allowed");
    }

    const existingExpense = await Expense.findOne({ name: name.trim() });
    if (existingExpense) {
        throw new ApiError(409, "Expense name already exists");
    }

    const expense = await Expense.create({
        name: name.trim(),
    });

    return res.status(201).json(
        new ApiResponse(201, expense, "Expense name added successfully")
    );
});


/**
 * @desc    Edit expense name
 * @route   PATCH /expense/:id
 * @access  Admin
 */
export const editExpenseName = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        throw new ApiError(400, "Expense name is required");
    }

    const expense = await Expense.findById(id);
    if (!expense) {
        throw new ApiError(404, "Expense not found");
    }

    // prevent duplicate names
    const alreadyExists = await Expense.findOne({
        name: name.trim(),
        _id: { $ne: id },
    });

    if (alreadyExists) {
        throw new ApiError(409, "Expense name already exists");
    }

    expense.name = name.trim();
    await expense.save();

    return res.status(200).json(
        new ApiResponse(200, expense, "Expense name updated successfully")
    );
});

/**
 * @desc    Delete expense
 * @route   DELETE /expense/:id
 * @access  Admin
 */
export const deleteExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const expense = await Expense.findById(id);
    if (!expense) {
        throw new ApiError(404, "Expense not found");
    }

    await expense.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, null, "Expense deleted successfully")
    );
});
