import mongoose from "mongoose";

const cardTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            enum: ["Visa", "MasterCard", "RuPay", "AmericanExpress"]
        },
        image: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

const CardType = mongoose.model("CardType", cardTypeSchema);
export default CardType;
