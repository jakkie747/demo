
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK.
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Sends a push notification when a new document is added to the notificationQueue.
 *
 * This function is triggered when a new document is created in the
 * `notificationQueue` collection. It fetches all FCM tokens from the `fcmTokens`
 * collection and sends the notification to each device. It also handles cleanup
 * of invalid or outdated tokens.
 */
export const sendPushNotification = functions.firestore
  .document("notificationQueue/{notificationId}")
  .onCreate(async (snapshot) => {
    const notificationData = snapshot.data();

    if (!notificationData) {
      functions.logger.log("No data in notification document.");
      return;
    }

    const {title, body, url} = notificationData;

    if (!title || !body) {
      functions.logger.error("Notification missing title or body:", notificationData);
      return;
    }

    functions.logger.log(`Processing notification: ${title}`);

    // 1. Get all FCM tokens from the 'fcmTokens' collection.
    const tokensSnapshot = await db.collection("fcmTokens").get();
    if (tokensSnapshot.empty) {
      functions.logger.log("No FCM tokens found. No notifications sent.");
      // Delete the processed notification from the queue.
      await snapshot.ref.delete();
      return;
    }

    const tokens = tokensSnapshot.docs.map((doc) => doc.id);
    functions.logger.log(`Found ${tokens.length} tokens to send to.`);

    // 2. Construct the notification message payload.
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body,
      },
      webpush: {
        fcmOptions: {
          // This URL will be opened when the user clicks the notification.
          link: url || `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com`,
        },
        notification: {
            // A default icon for your notifications
            icon: "https://placehold.co/192x192.png",
        },
      },
      tokens,
    };

    // 3. Send the notification to all tokens.
    const batchResponse = await messaging.sendEachForMulticast(message);
    functions.logger.log(
      `${batchResponse.successCount} messages were sent successfully.`
    );

    // 4. Clean up invalid tokens.
    const tokensToDelete: Promise<any>[] = [];
    batchResponse.responses.forEach((response, idx) => {
      const token = tokens[idx];
      if (!response.success) {
        const errorCode = response.error?.code;
        // These error codes indicate that the token is no longer valid and
        // should be removed from the database.
        if (
          errorCode === "messaging/invalid-registration-token" ||
          errorCode === "messaging/registration-token-not-registered"
        ) {
          functions.logger.log(`Deleting invalid token: ${token}`);
          tokensToDelete.push(db.collection("fcmTokens").doc(token).delete());
        } else {
            functions.logger.error(`Failed to send to token ${token}`, response.error);
        }
      }
    });

    await Promise.all(tokensToDelete);

    // 5. Delete the processed notification from the queue.
    await snapshot.ref.delete();
    functions.logger.log(`Notification processed and deleted from queue.`);
  });
