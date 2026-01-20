import { User } from "../../models/user.model.js";
import { Venture } from "../../models/venture.model.js";
import Notification from "../../models/Notification/Notification.model.js";
import { fintApp, fintVenturesApp } from "../../../firebase.js";
export const sendNotificationByType = async ({
    id,
    type,
    title,
    body,
    link = "",
    img = "",
    data = {},
    notificationType,
}) => {
    try {
        console.log(type, "type ========================================================", notificationType)
        let entity;
        let firebaseApp;

        if (type === "User") {
            entity = await User.findById(id).select("firebaseTokens");
            console.log("🚀 ~ sendNotificationByType ~ entity:", entity)
            firebaseApp = fintApp;
        } else if (type === "Venture") {
            entity = await Venture.findById(id).select("firebaseTokens");
            console.log("🚀 ~ sendNotificationByType ~ entity:", entity)
            firebaseApp = fintVenturesApp;
        } else {
            throw new Error("Invalid notification type");
        }

        if (!entity?.firebaseTokens?.length) {
            console.log(`⚠️ No FCM tokens found for ${type}: ${id}`);
            return;
        }

        // Save notification in DB
        await Notification.create({
            title,
            body,
            link,
            img,
            model: type,
            receiverId: id,
            notificationType,
        });


        const messaging = firebaseApp.messaging();
        console.log("🚀 ~ sendNotificationByType ~ messaging://////////////////////////////////////", messaging)
        console.log(entity.firebaseTokens, "entity.firebaseTokens++++++++++++++++++++++");

        await messaging.sendEachForMulticast({
            tokens: entity.firebaseTokens,
            notification: { title, body },
            data: {
                ...data,
                receiverId: id.toString(),
                model: type,
            },
        });

        console.log(`✅ Notification sent to ${type}: ${id}`);
    } catch (error) {
        console.error("❌ sendNotificationByType error:", error);
    }
};
