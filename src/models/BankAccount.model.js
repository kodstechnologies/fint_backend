import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
    {
        
        accountHolderName: {
            type: String,
            required: true,
            trim: true,
        },

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

        accountType: {
            type: String,
            required: true,
            enum: ["Savings", "Current"],
        },
        isAcive: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        collection: "bank_accounts",
    }
);

export const BankAccount = mongoose.model(
    "BankAccount",
    bankAccountSchema
);
