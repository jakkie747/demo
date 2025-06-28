
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, query, where, limit } from 'firebase/firestore';
import type { Teacher } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';

const TIMEOUT_DURATION = 15000;

export const getTeachers = async (): Promise<Teacher[]> => {
    if (!db) return [];
    const teachersCollectionRef = collection(db, 'teachers');
    const snapshot = await getDocs(teachersCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
};

export const addTeacher = async (teacherData: Omit<Teacher, 'id'>): Promise<string> => {
    if (!db) throw new Error("Firebase is not configured.");
    const teachersCollectionRef = collection(db, 'teachers');
    const docRef = await promiseWithTimeout(
        addDoc(teachersCollectionRef, teacherData),
        TIMEOUT_DURATION,
        new Error("Adding teacher document timed out.")
    );
    return docRef.id;
};

export const getTeacherByEmail = async (email: string): Promise<Teacher | null> => {
    if (!db) return null;
    const teachersCollectionRef = collection(db, 'teachers');
    const q = query(teachersCollectionRef, where("email", "==", email), limit(1));
    const snapshot = await promiseWithTimeout(
        getDocs(q),
        TIMEOUT_DURATION,
        new Error("Fetching teacher by email timed out.")
    );

    if (snapshot.empty) {
        return null;
    }
    const teacherDoc = snapshot.docs[0];
    return { id: teacherDoc.id, ...teacherDoc.data() } as Teacher;
};

export const deleteTeacher = async (teacherId: string): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    // Note: This only deletes the Firestore record.
    // In a real application, you would also need to delete the user from Firebase Authentication,
    // which typically requires a Cloud Function for secure execution.
    const teacherDoc = doc(db, 'teachers', teacherId);
    await promiseWithTimeout(
        deleteDoc(teacherDoc),
        TIMEOUT_DURATION,
        new Error(`Deleting teacher ${teacherId} timed out.`)
    );
};
