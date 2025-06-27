import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import type { Activity } from '@/lib/types';

const activitiesCollectionRef = collection(db, 'activities');

export const getActivities = async (): Promise<Activity[]> => {
    const q = query(activitiesCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
};

export const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const docRef = await addDoc(activitiesCollectionRef, {
        ...activityData,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const updateActivity = async (activityId: string, activityData: Partial<Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    const activityDoc = doc(db, 'activities', activityId);
    await updateDoc(activityDoc, {
        ...activityData,
        updatedAt: serverTimestamp()
    });
};

export const deleteActivity = async (activityId: string): Promise<void> => {
    const activityDoc = doc(db, 'activities', activityId);
    await deleteDoc(activityDoc);
};
