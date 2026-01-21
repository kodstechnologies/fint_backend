import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Expense", expenseSchema);
