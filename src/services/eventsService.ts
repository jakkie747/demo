import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Event } from '@/lib/types';

export const getEvents = async (): Promise<Event[]> => {
    if (!db) return [];
    const eventsCollectionRef = collection(db, 'events');
    const snapshot = await getDocs(eventsCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
};

export const addEvent = async (eventData: Omit<Event, 'id'>): Promise<string> => {
    if (!db) throw new Error("Firebase is not configured.");
    const eventsCollectionRef = collection(db, 'events');
    const docRef = await addDoc(eventsCollectionRef, eventData);
    return docRef.id;
};

export const updateEvent = async (eventId: string, eventData: Partial<Omit<Event, 'id'>>): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const eventDoc = doc(db, 'events', eventId);
    await updateDoc(eventDoc, eventData);
};

export const deleteEvent = async (eventId: string): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const eventDoc = doc(db, 'events', eventId);
    await deleteDoc(eventDoc);
};
