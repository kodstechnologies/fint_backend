import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
    {

        bankAccountNumber: {
            type: String,
            required: true,
            trim: true,
        },

        ifscCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        bankName: {
            type: String,
            required: true,
            trim: true,
        },
    }
);

export const BankAccount = mongoose.model(
    "BankAccount",
    bankAccountSchema
);
