
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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

export const updateTeacher = async (teacherId: string, teacherData: Partial<Omit<Teacher, 'id' | 'uid' | 'email' | 'role'>>): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const teacherDocRef = doc(db, 'teachers', teacherId);
    await promiseWithTimeout(
        updateDoc(teacherDocRef, teacherData),
        TIMEOUT_DURATION,
        new Error(`Updating teacher document ${teacherId} timed out.`)
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
