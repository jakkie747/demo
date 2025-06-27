import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

if (!storage) {
    console.warn("Firebase Storage is not initialized. All storage operations will fail if attempted.");
}

export const uploadImage = async (file: File, path: 'activities' | 'events' | 'children'): Promise<string> => {
    if (!storage) {
        throw new Error("Firebase Storage is not configured. Please set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in your environment variables.");
    }
    const filePath = `${path}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
};

// Function to delete an image from a Firebase Storage URL
export const deleteImageFromUrl = async (url: string): Promise<void> => {
    if (!storage) {
        // If storage isn't configured, we can't delete anything anyway.
        return;
    }
    // Don't try to delete placeholder images from an external service
    if (!url.includes('firebasestorage.googleapis.com')) {
        return;
    }
    try {
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
    } catch (error: any) {
        // If the file doesn't exist, we can ignore the error.
        if (error.code !== 'storage/object-not-found') {
            console.error("Error deleting image from storage:", error);
            // We don't re-throw, as failing to delete an old image shouldn't block the user flow.
        }
    }
};
