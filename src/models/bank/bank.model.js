import mongoose from 'mongoose';

const bankSchema = new mongoose.Schema(
    {
        bankName: {
            type: String,
            required: true,
            trim: true
        },
        bankImage: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Bank = mongoose.model('Bank', bankSchema);

export default Bank;
