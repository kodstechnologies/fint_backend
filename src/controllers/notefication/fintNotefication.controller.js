// // import { sendNotificationByType } from "../../utils/firebase/NoteficastionUtil.js";

// // export const sendNotification = async (req, res) => {
// //     try {
// //         const { id, amount, type } = req.body;
// //         // type = "User" | "Venture"

// //         if (!id || !amount || !type) {
// //             return res
// //                 .status(400)
// //                 .json({ success: false, message: "Missing required fields" });
// //         }

// //         const message = `₹${amount} has been credited to your wallet 💰`;

// //         await sendNotificationByType({
// //             id,
// //             type,
// //             title: "Wallet Update",
// //             body: message,
// //             data: {
// //                 amount: amount.toString(),
// //                 action: "credited",
// //                 source: "wallet",
// //             },
// //         });

// //         return res.json({
// //             success: true,
// //             message: "Notification sent successfully",
// //         });

// //     } catch (error) {
// //         console.error("Send notification error:", error);
// //         return res.status(500).json({
// //             success: false,
// //             message: "Failed to send notification",
// //         });
// //     }
// // };

// import { sendNotificationByType } from "../../utils/firebase/NoteficastionUtil.js";

// export const sendNotification = async (req, res) => {
//     try {
//         const { id, amount, type } = req.body;
//         // type = "User" | "Venture"

//         if (!id || !amount || !type) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing required fields",
//             });
//         }

//         const message = `₹${amount} has been credited to your wallet 💰`;

//         await sendNotificationByType({
//             id,
//             type,
//             title: "Wallet Update",
//             body: message,
//             data: {
//                 amount: amount.toString(),
//                 action: "credited",
//                 source: "wallet",
//             },
//         });

//         return res.json({
//             success: true,
//             message: "Notification sent successfully",
//         });
//     } catch (error) {
//         console.error("Send notification error:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Failed to send notification",
//         });
//     }
// };


import { sendNotificationByType } from "../../utils/firebase/NoteficastionUtil.js";

export const sendNotification = async (req, res) => {
    try {
        const {
            id,
            amount,
            type,              // "User" | "Venture"
            transactionType,   // "CREDIT" | "DEBIT"
            source = "wallet", // optional
        } = req.body;

        if (!id || !amount || !type || !transactionType) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        if (!["CREDIT", "DEBIT"].includes(transactionType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction type",
            });
        }

        const isCredit = transactionType === "CREDIT";

        const title = "Wallet Update";

        const body = isCredit
            ? `₹${amount} has been credited to your wallet 💰`
            : `₹${amount} has been debited from your wallet 💸`;

        await sendNotificationByType({
            id,
            type,
            title,
            body,
            data: {
                amount: amount.toString(),
                transactionType,
                source,
            },
            
        });

        return res.json({
            success: true,
            message: "Notification sent successfully",
        });
    } catch (error) {
        console.error("Send notification error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send notification",
        });
    }
};
