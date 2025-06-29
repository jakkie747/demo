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
 * notification to each device, and handles cleanup of invalid or outdated tokens.
 */
export const sendBulkNotification = functions.https.onCall(async (data, context) => {
  functions.logger.log("sendBulkNotification function triggered.");

  // For a real app, you would want to check for authentication
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  // }
  // const userRole = context.auth.token.role;
  // if (userRole !== 'admin') {
  //   throw new functions.https.HttpsError('permission-denied', 'Only admins can send notifications.');
  // }

  const { title, body, url } = data;

  if (!title || !body) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      'The function must be called with "title" and "body" arguments.'
    );
  }

  functions.logger.log(`Processing notification: ${title}`);

  // 1. Get all FCM tokens from the 'fcmTokens' collection.
  const tokensSnapshot = await db.collection("fcmTokens").get();
  if (tokensSnapshot.empty) {
    functions.logger.log("No FCM tokens found. No notifications sent.");
    return { status: "no-tokens", successCount: 0, failureCount: 0 };
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
      notification: {
        icon: "https://placehold.co/192x192.png",
        tag: `blinkogies-general-update`, // This tag makes new notifications with the same tag replace old ones.
      },
      fcmOptions: {
        // This URL will be opened when the user clicks the notification.
        link: url || `https://blink-notify-494bf.firebaseapp.com`,
      },
    },
    data: {
      // We pass the URL in the data payload for the foreground listener to use.
      url: url || `https://blink-notify-494bf.firebaseapp.com`,
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
        functions.logger.error(
          `Failed to send to token ${token}`,
          response.error
        );
      }
    }
  });

  await Promise.all(tokensToDelete);

  functions.logger.log("Notification process complete.");
  return {
    status: "success",
    successCount: batchResponse.successCount,
    failureCount: batchResponse.failureCount,
  };
});
