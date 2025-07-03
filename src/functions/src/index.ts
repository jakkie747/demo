
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

// Initialize the Firebase Admin SDK.
initializeApp();

const db = getFirestore();
const authAdmin = getAuth();
const storage = getStorage();

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

    // First, try to delete the associated photo from storage, if it exists.
    const teacherDocToDelete = await db.collection('teachers').doc(uidToDelete).get();
    if (teacherDocToDelete.exists()) {
        const teacherData = teacherDocToDelete.data();
        if (teacherData?.photo && teacherData.photo.includes('firebasestorage.googleapis.com')) {
            try {
                // This will attempt to delete the file from storage using its URL.
                const fileRef = storage.refFromURL(teacherData.photo);
                await fileRef.delete();
                logger.log(`Successfully deleted photo for user ${uidToDelete} at path ${fileRef.fullPath}`);
            } catch (storageError: any) {
                // If the file doesn't exist, we can ignore the error. Otherwise, log it.
                if (storageError.code !== 'storage/object-not-found') {
                    logger.error(`Failed to delete photo for user ${uidToDelete}. It might not exist or there's a permission issue.`, storageError);
                }
            }
        }
    }

    // After attempting to clean up storage, delete the user from Authentication.
    await authAdmin.deleteUser(uidToDelete);
    logger.log(`Successfully deleted user ${uidToDelete} from Firebase Authentication.`);
    
    // Finally, delete the teacher document from Firestore.
    await db.collection('teachers').doc(uidToDelete).delete();
    logger.log(`Successfully deleted teacher document for ${uidToDelete} from Firestore.`);

    return { status: 'success', message: `Successfully deleted user ${uidToDelete}` };
  } catch (error: any) {
    logger.error(`Error deleting user ${uidToDelete}:`, error);
    // Handle the case where the user might have been deleted from Auth but not Firestore
    if (error.code === 'auth/user-not-found') {
        try {
            // Still try to delete the Firestore document to clean up.
            await db.collection('teachers').doc(uidToDelete).delete();
            return { status: 'success', message: `User auth not found, but Firestore document deleted for ${uidToDelete}` };
        } catch (dbError) {
            logger.error(`Error deleting Firestore doc for user ${uidToDelete} after auth/user-not-found:`, dbError);
        }
    }
    throw new HttpsError('internal', 'An unexpected error occurred while deleting the user. Check the function logs for details.');
  }
});
