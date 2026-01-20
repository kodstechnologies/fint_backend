import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        body: {
            type: String,
            required: true,
        },

        link: {
            type: String,
        },

        img: {
            type: String,
        },

        // 🔑 Which model this notification belongs to
        model: {
            type: String,
            required: true,
            enum: ["User", "Venture"], // optional but recommended
        },
        // 🔔 Notification category
        notificationType: {
            type: String,
            enum: [
                "general",
                "payment",
                "blood",
                "insurance",
                "advertisement",
                "coupon"
            ],
            required: true,
        },

        // 🔗 Dynamic reference to User or Venture
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "model",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Notification", notificationSchema);
