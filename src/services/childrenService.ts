import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, writeBatch, doc, query, orderBy } from 'firebase/firestore';
import type { Child } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';

const TIMEOUT_DURATION = 15000; // 15 seconds

export const getChildren = async (): Promise<Child[]> => {
    if (!db) return [];
    try {
        const childrenCollectionRef = collection(db, 'children');
        const q = query(childrenCollectionRef, orderBy("name")); // Sorting by name
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child));
    } catch (error: any) {
         if ((error as any).code === 'failed-precondition') {
            const message = (error as Error).message;
            console.error("Firebase Error: The following error message contains a link to create the required Firestore index. Please click the link to resolve the issue:", error);
            throw new Error(`A database index is required to sort children by name. Please open the browser console (F12) to find a link to create the required Firestore index, then refresh the page. Raw error: ${message}`);
        }
        console.error("Error fetching children:", error);
        throw new Error("Could not fetch children.");
    }
};

export const addChild = async (childData: Omit<Child, 'id'>): Promise<string> => {
    if (!db) throw new Error("Firebase is not configured.");
    const childrenCollectionRef = collection(db, 'children');
    const docRef = await promiseWithTimeout(
        addDoc(childrenCollectionRef, childData),
        TIMEOUT_DURATION,
        new Error("Adding child document timed out.")
    );
    return docRef.id;
};

export const addMultipleChildren = async (childrenData: Omit<Child, 'id'>[]): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    if (childrenData.length === 0) return;

    const childrenCollectionRef = collection(db, 'children');
    const batch = writeBatch(db);

    childrenData.forEach(child => {
        const docRef = doc(childrenCollectionRef); // Create a new document reference with a unique ID
        batch.set(docRef, child);
    });

    await promiseWithTimeout(
        batch.commit(),
        TIMEOUT_DURATION * 3, // Allow more time for batch writes
        new Error("Batch adding children timed out.")
    );
};
