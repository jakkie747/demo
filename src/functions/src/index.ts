
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

// Initialize the Firebase Admin SDK.
initializeApp();

const db = getFirestore();
const messaging = getMessaging();
const authAdmin = getAuth();
const storage = getStorage();


/**
 * A callable Cloud Function to send a push notification to all subscribed devices.
 */
export const sendBulkNotification = onCall(async (request) => {
  logger.log("sendBulkNotification function triggered.");

  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerUid = request.auth.uid;
  const callerDoc = await db.collection('teachers').doc(callerUid).get();
  
  if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
     throw new HttpsError('permission-denied', 'Only admins can send notifications.');
  }

  const { title, body, url } = request.data;

  if (!title || !body) {
    logger.error("Function called with invalid arguments. Title or body is missing.", { data: request.data });
    throw new HttpsError(
      "invalid-argument",
      'The function must be called with "title" and "body" arguments.'
    );
  }

  try {
    logger.log(`Processing notification: "${title}"`);

    const tokensSnapshot = await db.collection("fcmTokens").get();
    if (tokensSnapshot.empty) {
      logger.log("No FCM tokens found. No notifications sent.");
      return { status: "no-tokens", successCount: 0, failureCount: 0 };
    }

    const allTokens = tokensSnapshot.docs.map((doc) => doc.id);
    logger.log(`Found ${allTokens.length} total tokens.`);

    const tokensToDelete: Promise<any>[] = [];
    let totalSuccessCount = 0;
    let totalFailureCount = 0;
    
    const tokenChunks: string[][] = [];
    for (let i = 0; i < allTokens.length; i += 500) {
      tokenChunks.push(allTokens.slice(i, i + 500));
    }
    
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

        const batchResponse = await messaging.sendMulticast(message);
        logger.log(`${batchResponse.successCount} messages were sent successfully in this batch.`);
        
        totalSuccessCount += batchResponse.successCount;
        totalFailureCount += batchResponse.failureCount;

        batchResponse.responses.forEach((response, idx) => {
            const token = tokens[idx];
            if (!response.success) {
            const errorCode = response.error?.code;
            if (
                errorCode === "messaging/invalid-registration-token" ||
                errorCode === "messaging/registration-token-not-registered"
            ) {
                logger.log(`Marking invalid token for deletion: ${token}`);
                tokensToDelete.push(db.collection("fcmTokens").doc(token).delete());
            } else {
                logger.error(
                `Failed to send to token ${token}`,
                response.error
                );
            }
            }
        });
    }

    if (tokensToDelete.length > 0) {
        await Promise.all(tokensToDelete);
        logger.log(`Deleted ${tokensToDelete.length} invalid tokens.`);
    }

    logger.log("Notification process complete.");
    return {
      status: "success",
      successCount: totalSuccessCount,
      failureCount: totalFailureCount,
    };
  } catch (error) {
    logger.error("Unhandled error in sendBulkNotification:", error);
    throw new HttpsError('internal', 'An unexpected error occurred while sending notifications.');
  }
});


/**
 * A callable Cloud Function to delete a teacher's auth credentials and Firestore profile.
 */
export const deleteTeacherUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerUid = request.auth.uid;
  const callerDoc = await db.collection('teachers').doc(callerUid).get();
  
  if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
     throw new HttpsError('permission-denied', 'Only admins can delete users.');
  }

  const uidToDelete = request.data.uid;
  if (!uidToDelete) {
      throw new HttpsError('invalid-argument', 'The function must be called with a "uid" argument.');
  }
  
  if (callerUid === uidToDelete) {
      throw new HttpsError('permission-denied', 'Admins cannot delete their own accounts.');
  }

  try {
    logger.log(`Admin ${callerUid} is attempting to delete user ${uidToDelete}`);

    const teacherDocToDelete = await db.collection('teachers').doc(uidToDelete).get();
    if (teacherDocToDelete.exists()) {
        const teacherData = teacherDocToDelete.data();
        if (teacherData?.photo && teacherData.photo.includes('firebasestorage.googleapis.com')) {
            try {
                const decodedUrl = decodeURIComponent(teacherData.photo);
                const pathStartIndex = decodedUrl.indexOf('/o/') + 3;
                const pathEndIndex = decodedUrl.indexOf('?');
                if(pathEndIndex > -1){
                  const filePath = decodedUrl.substring(pathStartIndex, pathEndIndex);
                  await storage.bucket().file(filePath).delete();
                  logger.log(`Successfully deleted photo for user ${uidToDelete} at path ${filePath}`);
                }
            } catch (storageError) {
                logger.error(`Failed to delete photo for user ${uidToDelete}. It might not exist or there's a permission issue.`, storageError);
            }
        }
    }

    await authAdmin.deleteUser(uidToDelete);
    logger.log(`Successfully deleted user ${uidToDelete} from Firebase Authentication.`);
    
    await db.collection('teachers').doc(uidToDelete).delete();
    logger.log(`Successfully deleted teacher document for ${uidToDelete} from Firestore.`);

    return { status: 'success', message: `Successfully deleted user ${uidToDelete}` };
  } catch (error) {
    logger.error(`Error deleting user ${uidToDelete}:`, error);
    if ((error as any).code === 'auth/user-not-found') {
        try {
            await db.collection('teachers').doc(uidToDelete).delete();
            return { status: 'success', message: `User auth not found, but Firestore document deleted for ${uidToDelete}` };
        } catch (dbError) {
            logger.error(`Error deleting Firestore doc for user ${uidToDelete} after auth/user-not-found:`, dbError);
        }
    }
    throw new HttpsError('internal', 'An unexpected error occurred while deleting the user.');
  }
});
