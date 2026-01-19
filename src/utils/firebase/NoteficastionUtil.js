
import admin from "../../firebase.js";

export const sendFCMNotification = async ({
    tokens = [],
    title,
    body,
    data = {},
}) => {
    if (!tokens || tokens.length === 0) return;

    const message = {
        tokens,
        notification: {
            title,
            body,
        },
        data: {
            ...data,
        },
    };

    console.log("🚀 ~ sendFCMNotification ~ message:", message);

    try {
        const messaging = admin.messaging();

        // ✅ NEW SDK (v9+)
        if (typeof messaging.sendMulticast === "function") {
            const response = await messaging.sendMulticast(message);
            console.log("✅ FCM sent (sendMulticast):", response.successCount);
            return response;
        }

        // ✅ OLD SDK fallback
        if (typeof messaging.sendEachForMulticast === "function") {
            const response = await messaging.sendEachForMulticast(message);
            console.log(
                "✅ FCM sent (sendEachForMulticast):",
                response.responses.filter(r => r.success).length
            );
            return response;
        }

        // ✅ VERY OLD SDK fallback (always works)
        for (const token of tokens) {
            await messaging.send({
                token,
                notification: { title, body },
                data,
            });
        }

        console.log("✅ FCM sent (manual loop)");

    } catch (error) {
        console.error("❌ FCM error:", error.message);
    }
};
