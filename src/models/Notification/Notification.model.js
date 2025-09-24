import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
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
    userType: {
        type: String,
        enum: ["fint", "venture"], // ✅ allowed values
        default: "fint",           // optional: default value
    },
}, {
    timestamps: true, // ✅ auto-create createdAt & updatedAt
});

export default mongoose.model("Notification", notificationSchema);
