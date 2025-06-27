import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { Event } from '@/lib/types';

const eventsCollectionRef = collection(db, 'events');

export const getEvents = async (): Promise<Event[]> => {
    // We are temporarily removing the orderBy clause to diagnose a potential missing index issue in Firestore.
    // This will fetch events, but they may not be in chronological order.
    const snapshot = await getDocs(eventsCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
};

export const addEvent = async (eventData: Omit<Event, 'id'>): Promise<string> => {
    const docRef = await addDoc(eventsCollectionRef, eventData);
    return docRef.id;
};

export const updateEvent = async (eventId: string, eventData: Partial<Omit<Event, 'id'>>): Promise<void> => {
    const eventDoc = doc(db, 'events', eventId);
    await updateDoc(eventDoc, eventData);
};

export const deleteEvent = async (eventId: string): Promise<void> => {
    const eventDoc = doc(db, 'events', eventId);
    await deleteDoc(eventDoc);
};
