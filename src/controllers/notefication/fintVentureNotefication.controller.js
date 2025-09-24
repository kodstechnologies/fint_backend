import fintVentureNotification from "../../models/Notification/fintVentureNotefication.model.js";
import moment from "moment-timezone";
import { fintVenturesApp } from "../../../firebase.js"; // ✅ Ensure firebase.js exports initialized fintVenturesApp

const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Send notification to all subscribed customers via FCM topic
 */


const sendCustomerNotificationFintVentures = async (req, res) => {
    const { title, body, userType } = req.body; // Accept userType optionally

    if (!title || !body) {
        return res.status(400).json({ message: "Title and body are required" });
    }

    try {
        const message = {
            notification: { title, body },
            android: { priority: "high" },
            apns: { payload: { aps: { sound: "default" } } },
            webpush: { notification: { title, body } },
            topic: "all",
        };

        // ✅ Send notification via Firebase
        const firebaseResponse = await fintVenturesApp.messaging().send(message);

        // ✅ Save notification to DB with userType and sentAtIST
        const newNotification = await fintVentureNotification.create({
            title,
            body,
            userType: userType || "fint", // default to 'fint' if not provided
            sentAtIST: moment().tz(IST_TIMEZONE).format("YYYY-MM-DD HH:mm"), // optional field if you want
        });

        return res.status(200).json({
            message: "Notification sent successfully to topic 'all'",
            firebaseResponse,
            notification: newNotification,
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

// Display only notifications for 'fint' users

const display_fint_user_NoteficationFintVentures = async (req, res) => {
    try {
        // Find all notifications where userType is 'fint'
        const notifications = await fintVentureNotification.find({ userType: "fint" }).sort({ createdAt: -1 });

        return res.status(200).json({
            statusCode: 200,
            success: true,
            message: "Fint user notifications fetched successfully",
            data: notifications,
        });
    } catch (error) {
        console.error("🔥 Error fetching notifications:", error);
        return res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Failed to fetch notifications",
            error: error.message,
        });
    }
};


/**
 * Save device token and subscribe it to topic "all"
 */
const saveAndSubscribeTokenFintVentures = async (req, res) => {
    const { token } = req.body;
    // console.log("🚀 Token received:", token);

    if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Valid device token is required." });
    }

    try {
        // ✅ Subscribe token to topic "all"
        const response = await fintVenturesApp.messaging().subscribeToTopic(token, "all");

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

export const noteficationFintVentures = {
    saveAndSubscribeTokenFintVentures,
    sendCustomerNotificationFintVentures,
    display_fint_user_NoteficationFintVentures,
};
