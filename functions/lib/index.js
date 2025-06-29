"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBulkNotification = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize the Firebase Admin SDK.
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
/**
 * A callable Cloud Function to send a push notification to all subscribed devices.
 *
 * This function is invoked directly from the client-side application.
 * It fetches all FCM tokens from the `fcmTokens` collection, sends the
 * notification to each device in batches, and handles cleanup of invalid tokens.
 */
exports.sendBulkNotification = functions.https.onCall(async (data, context) => {
    functions.logger.log("sendBulkNotification function triggered.");
    // For a real app, you would want to add authentication checks here.
    const { title, body, url } = data;
    if (!title || !body) {
        throw new functions.https.HttpsError("invalid-argument", 'The function must be called with "title" and "body" arguments.');
    }
    try {
        functions.logger.log(`Processing notification: ${title}`);
        // 1. Get all FCM tokens from the 'fcmTokens' collection.
        const tokensSnapshot = await db.collection("fcmTokens").get();
        if (tokensSnapshot.empty) {
            functions.logger.log("No FCM tokens found. No notifications sent.");
            return { status: "no-tokens", successCount: 0, failureCount: 0 };
        }
        const allTokens = tokensSnapshot.docs.map((doc) => doc.id);
        functions.logger.log(`Found ${allTokens.length} total tokens.`);
        const tokensToDelete = [];
        let totalSuccessCount = 0;
        let totalFailureCount = 0;
        // 2. Batch tokens into chunks of 500, as this is the FCM limit.
        const tokenChunks = [];
        for (let i = 0; i < allTokens.length; i += 500) {
            tokenChunks.push(allTokens.slice(i, i + 500));
        }
        // 3. Send notification to each chunk.
        for (const tokens of tokenChunks) {
            const message = {
                notification: {
                    title,
                    body,
                },
                webpush: {
                    notification: {
                        icon: "https://placehold.co/192x192.png",
                        tag: `blinkogies-general-update`,
                    },
                    fcmOptions: {
                        link: url || `https://blink-notify-494bf.firebaseapp.com`,
                    },
                },
                data: {
                    url: url || `https://blink-notify-494bf.firebaseapp.com`,
                },
                tokens,
            };
            const batchResponse = await messaging.sendEachForMulticast(message);
            functions.logger.log(`${batchResponse.successCount} messages were sent successfully in this batch.`);
            totalSuccessCount += batchResponse.successCount;
            totalFailureCount += batchResponse.failureCount;
            // 4. Clean up invalid tokens from the batch.
            batchResponse.responses.forEach((response, idx) => {
                var _a;
                const token = tokens[idx];
                if (!response.success) {
                    const errorCode = (_a = response.error) === null || _a === void 0 ? void 0 : _a.code;
                    if (errorCode === "messaging/invalid-registration-token" ||
                        errorCode === "messaging/registration-token-not-registered") {
                        functions.logger.log(`Marking invalid token for deletion: ${token}`);
                        tokensToDelete.push(db.collection("fcmTokens").doc(token).delete());
                    }
                    else {
                        functions.logger.error(`Failed to send to token ${token}`, response.error);
                    }
                }
            });
        }
        // 5. Await all the deletion promises.
        if (tokensToDelete.length > 0) {
            await Promise.all(tokensToDelete);
            functions.logger.log(`Deleted ${tokensToDelete.length} invalid tokens.`);
        }
        functions.logger.log("Notification process complete.");
        return {
            status: "success",
            successCount: totalSuccessCount,
            failureCount: totalFailureCount,
        };
    }
    catch (error) {
        functions.logger.error("Unhandled error in sendBulkNotification:", error);
        // Throw a generic error to the client, but the specific error is logged here.
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred while sending notifications.');
    }
});
//# sourceMappingURL=index.js.map