import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import type { Child } from '@/lib/types';

const childrenCollectionRef = collection(db, 'children');

export const getChildren = async (): Promise<Child[]> => {
    // Note: Child documents don't have a natural ordering field like a timestamp.
    // They will be fetched in the default order determined by Firestore.
    const snapshot = await getDocs(childrenCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child));
};

export const addChild = async (childData: Omit<Child, 'id'>): Promise<string> => {
    const docRef = await addDoc(childrenCollectionRef, childData);
    return docRef.id;
};
