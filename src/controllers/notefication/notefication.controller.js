import Notification from "../../models/notification/notification.model.js";
import moment from "moment-timezone";
import admin from "../../../firebase.js"; // ✅ Ensure firebase.js exports initialized admin

const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Send notification to all subscribed customers via FCM topic
 */
export const sendCustomerNotification = async (req, res) => {
    const { title, body, link, img } = req.body;

    if (!title || !body) {
        return res.status(400).json({ message: "Title and body are required" });
    }

    try {
        // ✅ Build notification payload
        const message = {
            notification: {
                title,
                body,
                image: img || undefined,
            },
            android: { priority: "high" },
            apns: { payload: { aps: { sound: "default" } } },
            webpush: {
                notification: {
                    title,
                    body,
                    icon: img || "icon.png",
                },
                fcm_options: {
                    link: link || "https://yourwebsite.com",
                },
            },
            data: link ? { link } : {},
        };

        // ✅ Send notification to topic "all"
        const firebaseResponse = await admin.messaging().sendToTopic("all", message);

        // ✅ Save notification to DB
        const newNotification = await Notification.create({
            title,
            body,
            link: link ?? "",
            img: img ?? "",
        });

        // ✅ Link notification to all customers
        // await Customer.updateMany({}, { $push: { notifications: newNotification._id } });

        return res.status(200).json({
            message: "Notification sent successfully to topic 'all' and linked to customers",
            firebaseResponse,
            sentAtIST: moment().tz(IST_TIMEZONE).format("YYYY-MM-DD HH:mm"),
        });
    } catch (error) {
        console.error("🔥 Error sending notifications:", error);
        return res.status(500).json({
            message: "Failed to send notifications",
            error: error.message,
        });
    }
};

/**
 * Save device token and subscribe it to topic "all"
 */
export const saveAndSubscribeToken = async (req, res) => {
    const { token } = req.body;
    console.log("🚀 Token received:", token);

    if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Valid device token is required." });
    }

    try {
        // ✅ Subscribe token to topic "all"
        const response = await admin.messaging().subscribeToTopic(token, "all");

        if (response.failureCount > 0) {
            return res.status(400).json({
                message: "Failed to subscribe token",
                error: response.errors[0]?.error,
            });
        }

        return res.status(200).json({
            message: "Token subscribed to 'all' topic successfully",
            firebaseResponse: response,
        });
    } catch (error) {
        console.error("🔥 Subscription Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const notefication = {
    sendCustomerNotification,
    saveAndSubscribeToken,
};
