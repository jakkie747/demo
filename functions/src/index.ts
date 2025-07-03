/**
 * @fileoverview Cloud Functions for Firebase.
 * This file uses the v1 API for Cloud Functions for stability.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

// Initialize the Admin SDK once
admin.initializeApp();
const db = admin.firestore();
const authAdmin = admin.auth();
const storage = admin.storage();

// Use cors middleware to handle cross-origin requests.
// This will automatically handle pre-flight OPTIONS requests.
const corsHandler = cors({origin: true});

/**
 * A v1 onRequest HTTP Cloud Function to delete a teacher.
 * This function manually handles CORS and authentication, providing a more stable
 * alternative to v2 onCall functions for this use case.
 */
export const deleteTeacherUser = functions.https.onRequest(async (request, response) => {
  // corsHandler will automatically end the request for pre-flight OPTIONS requests
  corsHandler(request, response, async () => {
    // 1. Authentication Check: Ensure the user calling the function is authenticated.
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      functions.logger.warn('Unauthenticated user tried to call deleteTeacherUser without token.');
      response.status(401).send({error: {message: 'The function must be called while authenticated.'}});
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await authAdmin.verifyIdToken(idToken);
    } catch (error) {
      functions.logger.error('Error verifying auth token:', error);
      response.status(401).send({error: {message: 'Invalid authentication token.'}});
      return;
    }
    const callerUid = decodedToken.uid;
    // The data is nested under a 'data' property by convention with callable functions client SDK
    const uidToDelete = request.body.data.uid;

    // 2. Input Validation
    if (typeof uidToDelete !== 'string' || uidToDelete.length === 0) {
      response.status(400).send({error: {message: 'The function must be called with a valid "uid" string argument.'}});
      return;
    }

    // 3. Self-Deletion Check
    if (callerUid === uidToDelete) {
      response.status(403).send({error: {message: 'Admins cannot delete their own accounts.'}});
      return;
    }

    // 4. Authorization Check
    try {
      const callerDoc = await db.collection('teachers').doc(callerUid).get();
      if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
        functions.logger.warn(`User ${callerUid} without admin role attempted to delete user ${uidToDelete}.`);
        response.status(403).send({error: {message: 'Only admins can delete users.'}});
        return;
      }
    } catch (e: any) {
      functions.logger.error(`Error checking admin role for ${callerUid}`, e);
      response.status(500).send({error: {message: 'Could not verify admin permissions.'}});
      return;
    }

    functions.logger.log(`Admin ${callerUid} is attempting to delete user ${uidToDelete}.`);

    // 5. Deletion Logic
    try {
      // 5a. Delete Photo from Storage
      const teacherDocRef = db.collection('teachers').doc(uidToDelete);
      const teacherDocToDelete = await teacherDocRef.get();
      if (teacherDocToDelete.exists()) {
        const teacherData = teacherDocToDelete.data();
        if (teacherData?.photo && teacherData.photo.includes('firebasestorage.googleapis.com')) {
          try {
            const fileUrl = new URL(teacherData.photo);
            const filePath = decodeURIComponent(fileUrl.pathname.split('/o/')[1]);
            const file = storage.bucket().file(filePath);
            await file.delete();
            functions.logger.log(`Successfully deleted photo for user ${uidToDelete} at path ${filePath}`);
          } catch (storageError: any) {
            if (storageError.code === 404) {
              functions.logger.warn(`Photo for user ${uidToDelete} not found in Storage.`);
            } else {
              functions.logger.error(`Failed to delete photo for user ${uidToDelete}.`, storageError);
            }
          }
        }
      }

      // 5b. Delete Firebase Auth user
      await authAdmin.deleteUser(uidToDelete);
      functions.logger.log(`Successfully deleted user ${uidToDelete} from Firebase Authentication.`);

      // 5c. Delete Firestore document
      await teacherDocRef.delete();
      functions.logger.log(`Successfully deleted teacher document for ${uidToDelete} from Firestore.`);

      response.status(200).send({data: {status: 'success', message: `Successfully deleted user ${uidToDelete}`}});
    } catch (error: any) {
      functions.logger.error(`Error during deletion process for user ${uidToDelete}:`, error);
      if (error.code === 'auth/user-not-found') {
        try {
          await db.collection('teachers').doc(uidToDelete).delete();
          functions.logger.log(`Auth user not found for ${uidToDelete}, but cleaned up Firestore document.`);
          response.status(200).send({data: {status: 'success', message: 'User auth not found, but Firestore document cleaned up.'}});
          return;
        } catch (dbError) {
          functions.logger.error(`Error cleaning up Firestore doc for ${uidToDelete}`, dbError);
        }
      }
      response.status(500).send({error: {message: 'An unexpected error occurred while deleting the user.'}});
    }
  });
});
