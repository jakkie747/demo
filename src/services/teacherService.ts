
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, query, where, getDoc, setDoc } from 'firebase/firestore';
import type { Teacher } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';

const TIMEOUT_DURATION = 15000;

export const getTeachers = async (): Promise<Teacher[]> => {
    if (!db) return [];
    const teachersCollectionRef = collection(db, 'teachers');
    const snapshot = await getDocs(teachersCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
};

export const addTeacher = async (uid: string, teacherData: Omit<Teacher, 'id' | 'uid'>): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const teacherDocRef = doc(db, 'teachers', uid);
    await promiseWithTimeout(
        setDoc(teacherDocRef, { ...teacherData, uid }),
        TIMEOUT_DURATION,
        new Error("Adding teacher document timed out.")
    );
};

export const getTeacherByUid = async (uid: string): Promise<Teacher | null> => {
    if (!db) return null;
    const teacherDocRef = doc(db, 'teachers', uid);
    const docSnap = await promiseWithTimeout(
        getDoc(teacherDocRef),
        TIMEOUT_DURATION,
        new Error("Fetching teacher by UID timed out.")
    );

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Teacher;
    } else {
        return null;
    }
};

export const deleteTeacher = async (teacherId: string): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    // This only deletes the Firestore record (name, email, photo, role).
    // It does NOT delete the user's login credentials from Firebase Authentication.
    // That must be done manually in the Firebase Console for security.
    const teacherDoc = doc(db, 'teachers', teacherId);
    await promiseWithTimeout(
        deleteDoc(teacherDoc),
        TIMEOUT_DURATION,
        new Error(`Deleting teacher document ${teacherId} timed out.`)
    );
};
