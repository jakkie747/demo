
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK.
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

export const sendBulkNotification = functions.https.onCall(async (data, context) => {
  functions.logger.log("sendBulkNotification triggered with data:", data);

  const { title, body, url } = data;
  if (!title || !body) {
    functions.logger.error("Function called with invalid arguments:", data);
    throw new functions.https.HttpsError(
      "invalid-argument",
      'The function must be called with "title" and "body" arguments.'
    );
  }

  try {
    // 1. Get all FCM tokens.
    functions.logger.log("Fetching FCM tokens from 'fcmTokens' collection...");
    const tokensSnapshot = await db.collection("fcmTokens").get();
    
    if (tokensSnapshot.empty) {
      functions.logger.warn("No FCM tokens found. Aborting notification send.");
      return { status: "no-tokens", successCount: 0, failureCount: 0 };
    }

    const allTokens = tokensSnapshot.docs.map((doc) => doc.id);
    functions.logger.log(`Found ${allTokens.length} total tokens.`);

    // 2. Batch tokens into chunks of 500.
    const tokenChunks: string[][] = [];
    for (let i = 0; i < allTokens.length; i += 500) {
      tokenChunks.push(allTokens.slice(i, i + 500));
    }
    functions.logger.log(`Split tokens into ${tokenChunks.length} chunk(s).`);

    let totalSuccessCount = 0;
    let totalFailureCount = 0;
    const tokensToDelete: Promise<any>[] = [];
    
    // 3. Send notification to each chunk.
    for (let i = 0; i < tokenChunks.length; i++) {
      const tokens = tokenChunks[i];
      functions.logger.log(`Processing chunk ${i + 1}/${tokenChunks.length} with ${tokens.length} tokens.`);

      const message: admin.messaging.MulticastMessage = {
          notification: { title, body },
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
      functions.logger.log(`Chunk ${i + 1} response: ${batchResponse.successCount} successes, ${batchResponse.failureCount} failures.`);
      
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
                functions.logger.error(`Failed to send to token ${token}`, response.error);
            }
          }
      });
    }

    // 5. Await all the deletion promises.
    if (tokensToDelete.length > 0) {
        functions.logger.log(`Attempting to delete ${tokensToDelete.length} invalid tokens...`);
        await Promise.all(tokensToDelete);
        functions.logger.log(`Successfully deleted invalid tokens.`);
    }

    functions.logger.log("Notification process complete. Final counts:", {
      success: totalSuccessCount,
      failure: totalFailureCount,
    });

    return {
      status: "success",
      successCount: totalSuccessCount,
      failureCount: totalFailureCount,
    };

  } catch (error) {
    functions.logger.error("!!! Unhandled exception in sendBulkNotification:", error);
    // Throw a generic error to the client, but the specific error is logged above.
    throw new functions.https.HttpsError('internal', 'An unexpected error occurred. Check the Cloud Function logs for details.');
  }
});
