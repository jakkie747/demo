
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
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerDoc = await db.collection('teachers').doc(callerUid).get();
  
  if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
     throw new functions.https.HttpsError('permission-denied', 'Only admins can send notifications.');
  }


  const { title, body, url } = data;

  if (!title || !body) {
    functions.logger.error("Function called with invalid arguments. Title or body is missing.", { data: data });
    throw new functions.https.HttpsError(
      "invalid-argument",
      'The function must be called with "title" and "body" arguments.'
    );
  }

  try {
    functions.logger.log(`Processing notification: "${title}"`);

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


/**
 * A callable Cloud Function to delete a teacher's auth credentials and Firestore profile.
 */
export const deleteTeacherUser = functions.https.onCall(async (data, context) => {
  // 1. Check if the user is authenticated and is an admin.
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerDoc = await db.collection('teachers').doc(callerUid).get();
  
  if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
     throw new functions.https.HttpsError('permission-denied', 'Only admins can delete users.');
  }

  // 2. Get the UID of the user to delete from the data payload.
  const uidToDelete = data.uid;
  if (!uidToDelete) {
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "uid" argument.');
  }
  
  // 3. Prevent an admin from deleting themselves.
  if (callerUid === uidToDelete) {
      throw new functions.https.HttpsError('permission-denied', 'Admins cannot delete their own accounts.');
  }

  try {
    functions.logger.log(`Admin ${callerUid} is attempting to delete user ${uidToDelete}`);

    // 4. Delete user's photo from storage if it exists
    const teacherDocToDelete = await db.collection('teachers').doc(uidToDelete).get();
    if (teacherDocToDelete.exists) {
        const teacherData = teacherDocToDelete.data();
        if (teacherData?.photo && teacherData.photo.includes('firebasestorage.googleapis.com')) {
            try {
                const decodedUrl = decodeURIComponent(teacherData.photo);
                const pathStartIndex = decodedUrl.indexOf('/o/') + 3;
                const pathEndIndex = decodedUrl.indexOf('?');
                if(pathEndIndex > -1){
                  const filePath = decodedUrl.substring(pathStartIndex, pathEndIndex);
                  await admin.storage().bucket().file(filePath).delete();
                  functions.logger.log(`Successfully deleted photo for user ${uidToDelete} at path ${filePath}`);
                }
            } catch (storageError) {
                functions.logger.error(`Failed to delete photo for user ${uidToDelete}. It might not exist or there's a permission issue.`, storageError);
            }
        }
    }

    // 5. Delete the user from Firebase Authentication.
    await admin.auth().deleteUser(uidToDelete);
    functions.logger.log(`Successfully deleted user ${uidToDelete} from Firebase Authentication.`);
    
    // 6. Delete the user's document from Firestore.
    await db.collection('teachers').doc(uidToDelete).delete();
    functions.logger.log(`Successfully deleted teacher document for ${uidToDelete} from Firestore.`);

    return { status: 'success', message: `Successfully deleted user ${uidToDelete}` };
  } catch (error) {
    functions.logger.error(`Error deleting user ${uidToDelete}:`, error);
    if ((error as any).code === 'auth/user-not-found') {
        try {
            await db.collection('teachers').doc(uidToDelete).delete();
            return { status: 'success', message: `User auth not found, but Firestore document deleted for ${uidToDelete}` };
        } catch (dbError) {
            functions.logger.error(`Error deleting Firestore doc for user ${uidToDelete} after auth/user-not-found:`, dbError);
        }
    }
    throw new functions.https.HttpsError('internal', 'An unexpected error occurred while deleting the user.');
  }
});
