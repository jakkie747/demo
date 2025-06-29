import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { promiseWithTimeout } from '@/lib/utils';

const TIMEOUT_DURATION = 15000; // 15 seconds

interface EmailPayload {
    bcc: string[];
    message: {
        subject: string;
        html: string;
    };
}

/**
 * Adds an email document to the 'mail' collection in Firestore.
 * This function relies on the 'Trigger Email' Firebase Extension to be installed
 * and configured to listen for new documents in this collection.
 * 
 * @param subject The subject of the email.
 * @param body The body of the email (plain text).
 * @param emails An array of recipient email addresses for the BCC field.
 * @returns The ID of the newly created document in the 'mail' collection.
 */
export const sendBulkEmail = async (subject: string, body: string, emails: string[]): Promise<string> => {
    if (!db) throw new Error("Firebase is not configured.");
    if (emails.length === 0) throw new Error("No recipient emails provided.");

    const mailCollectionRef = collection(db, 'mail');
    
    // The Trigger Email extension expects the body to be HTML.
    const htmlBody = body.replace(/\n/g, '<br>');

    const payload: EmailPayload = {
        bcc: emails,
        message: {
            subject: subject,
            html: htmlBody,
        },
    };

    const docRef = await promiseWithTimeout(
        addDoc(mailCollectionRef, payload),
        TIMEOUT_DURATION,
        new Error("Request to send email timed out. Check Firestore connection and rules.")
    );

    return docRef.id;
};
