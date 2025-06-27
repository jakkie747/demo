import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import type { Activity } from '@/lib/types';

const activitiesCollectionRef = collection(db, 'activities');

export const getActivities = async (): Promise<Activity[]> => {
    // We are temporarily removing the orderBy clause to diagnose a potential missing index issue in Firestore.
    // This will fetch activities, but they may not be in chronological order.
    const snapshot = await getDocs(activitiesCollectionRef);
    const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));

    // Manual client-side sort to ensure newest appears first
    return activities.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || 0;
        const dateB = b.createdAt?.toDate?.() || 0;
        if (dateA && dateB) {
            return dateB.getTime() - dateA.getTime();
        }
        return 0;
    });
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
