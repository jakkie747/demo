import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import type { Activity } from '@/lib/types';

const getDb = () => {
  if (!db) {
    throw new Error("Firebase configuration is incomplete. The database connection could not be established. Please update src/lib/firebase.ts with your project's apiKey and appId.");
  }
  return db;
};

export const getActivities = async (): Promise<Activity[]> => {
    const firestoreDb = getDb();
    const activitiesCollectionRef = collection(firestoreDb, 'activities');
    const q = query(activitiesCollectionRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
    return activities;
};

export const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const firestoreDb = getDb();
    const activitiesCollectionRef = collection(firestoreDb, 'activities');
    const docRef = await addDoc(activitiesCollectionRef, {
        ...activityData,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const updateActivity = async (activityId: string, activityData: Partial<Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    const firestoreDb = getDb();
    const activityDoc = doc(firestoreDb, 'activities', activityId);
    await updateDoc(activityDoc, {
        ...activityData,
        updatedAt: serverTimestamp()
    });
};

export const deleteActivity = async (activityId: string): Promise<void> => {
    const firestoreDb = getDb();
    const activityDoc = doc(firestoreDb, 'activities', activityId);
    await deleteDoc(activityDoc);
};
