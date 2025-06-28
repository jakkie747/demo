'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { promiseWithTimeout } from '@/lib/utils';
import type { NotificationPayload } from '@/lib/types';

const TIMEOUT_DURATION = 15000;

/**
 * Adds a notification to a Firestore collection to be processed by a backend worker.
 * THIS DOES NOT SEND THE NOTIFICATION DIRECTLY.
 * A separate backend process (e.g., a Firebase Cloud Function) must be set up
 * to listen for new documents in the 'notificationQueue' collection and send them.
 */
export const queueNotificationForSending = async (payload: NotificationPayload) => {
  if (!db) {
    throw new Error('Firebase is not configured. Cannot queue notification.');
  }

  try {
    const queueCollection = collection(db, 'notificationQueue');
    await promiseWithTimeout(
      addDoc(queueCollection, {
        ...payload,
        createdAt: serverTimestamp(),
      }),
      TIMEOUT_DURATION,
      new Error('Request to queue notification timed out.')
    );
  } catch (error) {
    console.error('Error queuing notification for sending:', error);
    throw new Error('Failed to add notification to the send queue.');
  }
};
