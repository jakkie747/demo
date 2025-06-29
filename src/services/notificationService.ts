import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { promiseWithTimeout } from '@/lib/utils';
import type { NotificationPayload } from '@/lib/types';

const TIMEOUT_DURATION = 30000; // 30 seconds for a callable function

/**
 * Directly calls the 'sendBulkNotification' Cloud Function to send a message
 * to all registered devices.
 * @param payload The notification content (title, body, url).
 * @returns An object with the status and counts of success/failure.
 */
export const sendNotificationDirectly = async (payload: NotificationPayload) => {
  if (!functions) {
    throw new Error('Firebase Functions is not configured.');
  }

  try {
    const sendBulkNotification = httpsCallable(functions, 'sendBulkNotification');
    
    // The payload is passed directly. The Functions SDK handles wrapping it.
    const result = await promiseWithTimeout(
      sendBulkNotification(payload),
      TIMEOUT_DURATION,
      new Error('Request to send notification timed out. The function may still be running.')
    );
    
    return result.data as { status: string; successCount: number; failureCount: number };
  } catch (error) {
    console.error('Error calling sendBulkNotification function:', error);
    const httpsError = error as any;

    if (httpsError.code === 'internal') {
      throw new Error('An internal server error occurred. Please check the Cloud Function logs in the Firebase Console for more details.');
    }
    
    throw new Error(httpsError.message || 'Failed to send notification.');
  }
};
