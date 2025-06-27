import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Event } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';

const TIMEOUT_DURATION = 15000; // 15 seconds

export const getEvents = async (): Promise<Event[]> => {
    if (!db) return [];
    const eventsCollectionRef = collection(db, 'events');
    const snapshot = await getDocs(eventsCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
};

export const addEvent = async (eventData: Omit<Event, 'id'>): Promise<string> => {
    if (!db) throw new Error("Firebase is not configured.");
    const eventsCollectionRef = collection(db, 'events');
    const docRef = await promiseWithTimeout(
        addDoc(eventsCollectionRef, eventData),
        TIMEOUT_DURATION,
        new Error("Adding event document timed out.")
    );
    return docRef.id;
};

export const updateEvent = async (eventId: string, eventData: Partial<Omit<Event, 'id'>>): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const eventDoc = doc(db, 'events', eventId);
    await promiseWithTimeout(
        updateDoc(eventDoc, eventData),
        TIMEOUT_DURATION,
        new Error(`Updating event ${eventId} timed out.`)
    );
};

export const deleteEvent = async (eventId: string): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const eventDoc = doc(db, 'events', eventId);
    await promiseWithTimeout(
        deleteDoc(eventDoc),
        TIMEOUT_DURATION,
        new Error(`Deleting event ${eventId} timed out.`)
    );
};
