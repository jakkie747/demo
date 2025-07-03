
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const authAdmin = admin.auth();
const storage = admin.storage();

/**
 * A v1 callable Cloud Function to delete a teacher's auth credentials and Firestore profile.
 */
exports.deleteTeacherUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerUid = context.auth.uid;
  
  try {
    const callerDoc = await db.collection('teachers').doc(callerUid).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can delete users.');
    }
  } catch(e) {
      functions.logger.error(`Error checking admin role for ${callerUid}`, e);
      throw new functions.https.HttpsError('internal', 'Could not verify admin permissions.');
  }

  const uidToDelete = data.uid;
  if (typeof uidToDelete !== 'string' || uidToDelete.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid "uid" string argument.');
  }
  
  if (callerUid === uidToDelete) {
      throw new functions.https.HttpsError('permission-denied', 'Admins cannot delete their own accounts.');
  }

  try {
    functions.logger.log(`Admin ${callerUid} is attempting to delete user ${uidToDelete}`);

    const teacherDocToDelete = await db.collection('teachers').doc(uidToDelete).get();
    if (teacherDocToDelete.exists()) {
        const teacherData = teacherDocToDelete.data();
        if (teacherData?.photo && teacherData.photo.includes('firebasestorage.googleapis.com')) {
            try {
                const decodedUrl = decodeURIComponent(teacherData.photo);
                const filePath = decodedUrl.substring(decodedUrl.indexOf('/o/') + 3, decodedUrl.indexOf('?alt=media'));
                const file = storage.bucket().file(filePath);
                
                await file.delete();
                functions.logger.log(`Successfully deleted photo for user ${uidToDelete} at path ${filePath}`);
            } catch (storageError: any) {
                if (storageError.code !== 404) {
                    functions.logger.error(`Failed to delete photo for user ${uidToDelete}. It might not exist or there's a permission issue.`, storageError);
                }
            }
        }
    }

    await authAdmin.deleteUser(uidToDelete);
    functions.logger.log(`Successfully deleted user ${uidToDelete} from Firebase Authentication.`);
    
    await db.collection('teachers').doc(uidToDelete).delete();
    functions.logger.log(`Successfully deleted teacher document for ${uidToDelete} from Firestore.`);

    return { status: 'success', message: `Successfully deleted user ${uidToDelete}` };
  } catch (error: any) {
    functions.logger.error(`Error deleting user ${uidToDelete}:`, error);
    if (error.code === 'auth/user-not-found') {
        try {
            await db.collection('teachers').doc(uidToDelete).delete();
            return { status: 'success', message: `User auth not found, but Firestore document for ${uidToDelete} was cleaned up.` };
        } catch (dbError) {
            functions.logger.error(`Error deleting Firestore doc for user ${uidToDelete} after auth/user-not-found:`, dbError);
        }
    }
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'An unexpected error occurred while deleting the user.');
  }
});
