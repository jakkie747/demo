import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Event } from '@/lib/types';

const getDb = () => {
  if (!db) {
    throw new Error("Firebase configuration is incomplete. The database connection could not be established. Please update src/lib/firebase.ts with your project's apiKey and appId.");
  }
  return db;
};

export const getEvents = async (): Promise<Event[]> => {
    const firestoreDb = getDb();
    const eventsCollectionRef = collection(firestoreDb, 'events');
    const snapshot = await getDocs(eventsCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
};

export const addEvent = async (eventData: Omit<Event, 'id'>): Promise<string> => {
    const firestoreDb = getDb();
    const eventsCollectionRef = collection(firestoreDb, 'events');
    const docRef = await addDoc(eventsCollectionRef, eventData);
    return docRef.id;
};

export const updateEvent = async (eventId: string, eventData: Partial<Omit<Event, 'id'>>): Promise<void> => {
    const firestoreDb = getDb();
    const eventDoc = doc(firestoreDb, 'events', eventId);
    await updateDoc(eventDoc, eventData);
};

export const deleteEvent = async (eventId: string): Promise<void> => {
    const firestoreDb = getDb();
    const eventDoc = doc(firestoreDb, 'events', eventId);
    await deleteDoc(eventDoc);
};
