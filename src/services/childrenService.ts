import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import type { Child } from '@/lib/types';

export const getChildren = async (): Promise<Child[]> => {
    if (!db) return [];
    const childrenCollectionRef = collection(db, 'children');
    const snapshot = await getDocs(childrenCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child));
};

export const addChild = async (childData: Omit<Child, 'id'>): Promise<string> => {
    if (!db) throw new Error("Firebase is not configured.");
    const childrenCollectionRef = collection(db, 'children');
    const docRef = await addDoc(childrenCollectionRef, childData);
    return docRef.id;
};
