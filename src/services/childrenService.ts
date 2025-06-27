import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import type { Child } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';

const TIMEOUT_DURATION = 15000; // 15 seconds

export const getChildren = async (): Promise<Child[]> => {
    if (!db) return [];
    const childrenCollectionRef = collection(db, 'children');
    const snapshot = await getDocs(childrenCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child));
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
