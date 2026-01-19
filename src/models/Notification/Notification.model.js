// import mongoose from "mongoose";

// const notificationSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true,
//     },
//     body: {
//         type: String,
//         required: true,
//     },
//     link: {
//         type: String,
//     },
//     img: {
//         type: String,
//     },
// }, {
//     timestamps: true, // ✅ auto-create createdAt & updatedAt
// });

// export default mongoose.model("Notification", notificationSchema);


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

        // ✅ SINGLE MODEL FIELD
        model: {
            type: String,
            required: true, // e.g. "User" | "Venture" | "Admin"
        },
    },
    {
        timestamps: true,
    });

export default mongoose.model("Notification", notificationSchema);
