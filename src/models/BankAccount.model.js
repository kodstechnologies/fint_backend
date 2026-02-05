// import mongoose from "mongoose";

// const bankAccountSchema = new mongoose.Schema(
//     {

//         accountHolderName: {
//             type: String,
//             required: true,
//             trim: true,
//         },

//         bankAccountNumber: {
//             type: String,
//             required: true,
//             trim: true,
//         },

//         ifscCode: {
//             type: String,
//             required: true,
//             trim: true,
//             uppercase: true,
//         },

//         bankName: {
//             type: String,
//             required: true,
//             trim: true,
//         },


//         accountType: {
//             type: String,
//             required: true,
//             enum: ["Savings", "Current"],
//         },
//         isAcive: {
//             type: Boolean,
//             default: false
//         }
//     },
//     {
//         timestamps: true,
//         collection: "bank_accounts",
//     }
// );

// export const BankAccount = mongoose.model(
//     "BankAccount",
//     bankAccountSchema
// );


import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
    {
        accountHolderName: {
            type: String,
            required: true,
            trim: true
        },

        bankAccountNumber: {
            type: String,
            required: true,
            trim: true
        },

        ifscCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        bankId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bank",
            required: true
        },

        cardTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CardType",
            required: true
        },

        accountType: {
            type: String,
            enum: ["Savings", "Current"],
            required: true
        },

        isActive: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        collection: "bank_accounts"
    }
);

export const BankAccount = mongoose.model("BankAccount", bankAccountSchema);
