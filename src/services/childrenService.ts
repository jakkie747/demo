import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import type { Child } from '@/lib/types';

const getDb = () => {
  if (!db) {
    throw new Error("Firebase configuration is incomplete. The database connection could not be established. Please update src/lib/firebase.ts with your project's apiKey and appId.");
  }
  return db;
};

export const getChildren = async (): Promise<Child[] | null> => {
    try {
        const firestoreDb = getDb();
        const childrenCollectionRef = collection(firestoreDb, 'children');
        const snapshot = await getDocs(childrenCollectionRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child));
    } catch (error) {
        console.error("Error fetching children:", error);
        return null;
    }
};

export const addChild = async (childData: Omit<Child, 'id'>): Promise<string> => {
    const firestoreDb = getDb();
    const childrenCollectionRef = collection(firestoreDb, 'children');
    const docRef = await addDoc(childrenCollectionRef, childData);
    return docRef.id;
};
