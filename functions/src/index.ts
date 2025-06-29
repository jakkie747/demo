
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

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
export const sendBulkNotification = functions.https.onCall(async (data, context) => {
  functions.logger.log("sendBulkNotification function triggered.");

  // For a real app, you would want to add authentication checks here.

  const { title, body, url } = data;

  if (!title || !body) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      'The function must be called with "title" and "body" arguments.'
    );
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

    const tokensToDelete: Promise<any>[] = [];
    let totalSuccessCount = 0;
    let totalFailureCount = 0;
    
    // 2. Batch tokens into chunks of 500, as this is the FCM limit.
    const tokenChunks: string[][] = [];
    for (let i = 0; i < allTokens.length; i += 500) {
      tokenChunks.push(allTokens.slice(i, i + 500));
    }
    
    // 3. Send notification to each chunk.
    for (const tokens of tokenChunks) {
        const message: admin.messaging.MulticastMessage = {
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
            const token = tokens[idx];
            if (!response.success) {
            const errorCode = response.error?.code;
            if (
                errorCode === "messaging/invalid-registration-token" ||
                errorCode === "messaging/registration-token-not-registered"
            ) {
                functions.logger.log(`Marking invalid token for deletion: ${token}`);
                tokensToDelete.push(db.collection("fcmTokens").doc(token).delete());
            } else {
                functions.logger.error(
                `Failed to send to token ${token}`,
                response.error
                );
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
  } catch (error) {
    functions.logger.error("Unhandled error in sendBulkNotification:", error);
    // Throw a generic error to the client, but the specific error is logged here.
    throw new functions.https.HttpsError('internal', 'An unexpected error occurred while sending notifications.');
  }
});
