
/**
 * @fileoverview Cloud Functions for Firebase (v1 syntax).
 * This file uses the v1 API for Cloud Functions for maximum stability.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize the Admin SDK once.
// This is a global initialization.
try {
  admin.initializeApp();
  functions.logger.log('Firebase Admin SDK initialized successfully.');
} catch (e) {
  functions.logger.error('Error initializing Firebase Admin SDK:', e);
}


const db = admin.firestore();
const authAdmin = admin.auth();

/**
 * A v1 callable Cloud Function to delete a teacher's auth credentials and Firestore profile.
 */
export const deleteTeacherUser = functions.https.onCall(async (data, context) => {
  functions.logger.log('--- Starting deleteTeacherUser function execution ---');
  
  // 1. Authentication Check: Ensure the user calling the function is authenticated.
  if (!context.auth) {
    functions.logger.warn('Unauthenticated call to deleteTeacherUser.');
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  
  const callerUid = context.auth.uid;
  const uidToDelete = data.uid;
  
  functions.logger.log(`Caller UID: ${callerUid}, UID to delete: ${uidToDelete}`);

  // 2. Input Validation: Ensure the UID to delete is a valid string.
  if (typeof uidToDelete !== 'string' || uidToDelete.length === 0) {
    functions.logger.error('Invalid argument: "uid" is not a valid string.', data);
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with a valid "uid" string argument.'
    );
  }

  // 3. Self-Deletion Check: Prevent admins from deleting themselves.
  if (callerUid === uidToDelete) {
    functions.logger.warn(`User ${callerUid} attempted to delete themselves.`);
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admins cannot delete their own accounts.'
    );
  }

  // 4. Authorization Check: Ensure the caller is an admin.
  try {
    const callerDocRef = db.collection('teachers').doc(callerUid);
    const callerDoc = await callerDocRef.get();
    
    if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
      functions.logger.warn(`User ${callerUid} (role: ${callerDoc.data()?.role}) attempted to delete user ${uidToDelete}. Permission denied.`);
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can delete users.'
      );
    }
    functions.logger.log(`Caller ${callerUid} is authorized as admin.`);
  } catch (e: any) {
    functions.logger.error(`Error during authorization check for ${callerUid}`, e);
    throw new functions.https.HttpsError('internal', 'Could not verify admin permissions.');
  }

  // 5. Deletion Logic
  const teacherDocRef = db.collection('teachers').doc(uidToDelete);
  
  try {
    // Step 5a: Delete Firebase Auth user
    functions.logger.log(`Attempting to delete auth user for UID: ${uidToDelete}`);
    await authAdmin.deleteUser(uidToDelete);
    functions.logger.log(`Successfully deleted auth user for UID: ${uidToDelete}`);
    
    // Step 5b: Delete Firestore document
    functions.logger.log(`Attempting to delete Firestore document for UID: ${uidToDelete}`);
    await teacherDocRef.delete();
    functions.logger.log(`Successfully deleted Firestore document for UID: ${uidToDelete}`);

    functions.logger.log('--- deleteTeacherUser function execution successful ---');
    return { status: 'success', message: `Successfully deleted user ${uidToDelete}` };

  } catch (error: any) {
    functions.logger.error(`Error during deletion process for user ${uidToDelete}:`, error);

    // Clean up Firestore doc if auth user was already deleted
    if (error.code === 'auth/user-not-found') {
      functions.logger.warn(`Auth user ${uidToDelete} not found, attempting to clean up Firestore document.`);
      try {
        await teacherDocRef.delete();
        functions.logger.log(`Successfully cleaned up Firestore doc for ${uidToDelete}.`);
        return { status: 'success', message: 'User auth not found, but Firestore document was cleaned up.' };
      } catch (dbError) {
        functions.logger.error(`Failed to clean up Firestore doc for ${uidToDelete} after auth error.`, dbError);
      }
    }
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'An unexpected error occurred while deleting the user.',
      error.message
    );
  }
});
