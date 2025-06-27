import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import type { Activity } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';

const TIMEOUT_DURATION = 15000; // 15 seconds

export const getActivities = async (): Promise<Activity[]> => {
    if (!db) return [];
    
    try {
        const activitiesCollectionRef = collection(db, 'activities');
        const q = query(activitiesCollectionRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
    } catch (error: any) {
        if ((error as any).code === 'failed-precondition') {
            const message = (error as Error).message;
            console.error("Firebase Error: The following error message contains a link to create the required Firestore index. Please click the link to resolve the issue:", error);
            throw new Error(`A database index is required to sort activities. Please open the browser console (F12) to find a link to create the required Firestore index, then refresh the page. Raw error: ${message}`);
        }
        console.error("Error fetching activities:", error);
        throw new Error("Could not fetch activities.");
    }
};

export const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!db) throw new Error("Firebase is not configured.");
    const activitiesCollectionRef = collection(db, 'activities');
    const docRef = await promiseWithTimeout(
        addDoc(activitiesCollectionRef, {
            ...activityData,
            createdAt: serverTimestamp(),
        }),
        TIMEOUT_DURATION,
        new Error("Adding activity document timed out.")
    );
    return docRef.id;
};

export const updateActivity = async (activityId: string, activityData: Partial<Omit<Activity, 'id' | 'createdAt'>>): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const activityDoc = doc(db, 'activities', activityId);
    await promiseWithTimeout(
        updateDoc(activityDoc, {
            ...activityData,
            updatedAt: serverTimestamp()
        }),
        TIMEOUT_DURATION,
        new Error(`Updating activity ${activityId} timed out.`)
    );
};

export const deleteActivity = async (activityId: string): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const activityDoc = doc(db, 'activities', activityId);
    await promiseWithTimeout(
        deleteDoc(activityDoc),
        TIMEOUT_DURATION,
        new Error(`Deleting activity ${activityId} timed out.`)
    );
};
