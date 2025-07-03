/**
 * @fileoverview Cloud Functions for Firebase.
 * This file uses the v2 API for Cloud Functions.
 */

import {onCall, HttpsError} from 'firebase-functions/v2/https';
import {logger} from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const authAdmin = admin.auth();
const storage = admin.storage();

/**
 * A v2 callable Cloud Function to delete a teacher's auth credentials and Firestore profile.
 * This function also handles deleting the teacher's profile photo from Firebase Storage.
 */
export const deleteTeacherUser = onCall(async request => {
  // 1. Authentication Check: Ensure the user calling the function is authenticated.
  if (!request.auth) {
    logger.warn('Unauthenticated user tried to call deleteTeacherUser');
    throw new HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const callerUid = request.auth.uid;
  const uidToDelete = request.data.uid;

  // 2. Input Validation: Ensure the UID to delete is a valid string.
  if (typeof uidToDelete !== 'string' || uidToDelete.length === 0) {
    throw new HttpsError(
      'invalid-argument',
      'The function must be called with a valid "uid" string argument.'
    );
  }

  // 3. Self-Deletion Check: Prevent admins from deleting themselves.
  if (callerUid === uidToDelete) {
    throw new HttpsError(
      'permission-denied',
      'Admins cannot delete their own accounts.'
    );
  }

  // 4. Authorization Check: Ensure the caller is an admin.
  try {
    const callerDoc = await db.collection('teachers').doc(callerUid).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
      logger.warn(
        `User ${callerUid} without admin role attempted to delete user ${uidToDelete}.`
      );
      throw new HttpsError(
        'permission-denied',
        'Only admins can delete users.'
      );
    }
  } catch (e) {
    logger.error(`Error checking admin role for ${callerUid}`, e);
    throw new HttpsError('internal', 'Could not verify admin permissions.');
  }

  logger.log(
    `Admin ${callerUid} is attempting to delete user ${uidToDelete}.`
  );

  // 5. Deletion Logic
  try {
    // 5a. Delete Photo from Storage (if it exists)
    const teacherDocRef = db.collection('teachers').doc(uidToDelete);
    const teacherDocToDelete = await teacherDocRef.get();

    if (teacherDocToDelete.exists()) {
      const teacherData = teacherDocToDelete.data();
      if (
        teacherData?.photo &&
        teacherData.photo.includes('firebasestorage.googleapis.com')
      ) {
        try {
          // Extract the file path from the full URL
          const fileUrl = new URL(teacherData.photo);
          const filePath = decodeURIComponent(fileUrl.pathname.split('/o/')[1]);
          const file = storage.bucket().file(filePath);

          await file.delete();
          logger.log(
            `Successfully deleted photo for user ${uidToDelete} at path ${filePath}`
          );
        } catch (storageError: any) {
          // If the file is not found, it's not a critical error, just log it.
          if (storageError.code === 404) {
            logger.warn(
              `Photo for user ${uidToDelete} not found in Storage. It may have already been deleted.`
            );
          } else {
            logger.error(
              `Failed to delete photo for user ${uidToDelete}.`,
              storageError
            );
            // Non-fatal, continue with user deletion.
          }
        }
      }
    }

    // 5b. Delete Firebase Auth user
    await authAdmin.deleteUser(uidToDelete);
    logger.log(
      `Successfully deleted user ${uidToDelete} from Firebase Authentication.`
    );

    // 5c. Delete Firestore document
    await teacherDocRef.delete();
    logger.log(
      `Successfully deleted teacher document for ${uidToDelete} from Firestore.`
    );

    return {status: 'success', message: `Successfully deleted user ${uidToDelete}`};
  } catch (error: any) {
    logger.error(`Error during deletion process for user ${uidToDelete}:`, error);

    // Handle case where auth user might not exist but Firestore doc does.
    if (error.code === 'auth/user-not-found') {
      try {
        await db.collection('teachers').doc(uidToDelete).delete();
        logger.log(
          `Auth user not found for ${uidToDelete}, but cleaned up Firestore document.`
        );
        return {
          status: 'success',
          message: `User auth not found, but Firestore document for ${uidToDelete} was cleaned up.`,
        };
      } catch (dbError) {
        logger.error(
          `Error deleting Firestore doc for user ${uidToDelete} after auth/user-not-found error:`,
          dbError
        );
      }
    }

    // Re-throw HttpsError if it's already in the correct format
    if (error instanceof HttpsError) {
      throw error;
    }

    // Throw a generic internal error for all other cases
    throw new HttpsError(
      'internal',
      'An unexpected error occurred while deleting the user.'
    );
  }
});
