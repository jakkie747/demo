import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const getStorageInstance = () => {
    if (!storage) {
        console.warn("Firebase configuration is incomplete. The storage connection could not be established. Please update src/lib/firebase.ts with your project's apiKey and appId.");
        return null;
    }
    return storage;
}

export const uploadImage = async (file: File, path: 'activities' | 'events' | 'children'): Promise<string> => {
    const storageInstance = getStorageInstance();
    if (!storageInstance) {
        // This error will be caught by the component's try-catch block and displayed to the user.
        throw new Error("Firebase configuration is incomplete. The storage connection could not be established. Please update src/lib/firebase.ts with your project's apiKey and appId.");
    }
    const filePath = `${path}/${Date.now()}-${file.name}`;
    const storageRef = ref(storageInstance, filePath);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
};

// Function to delete an image from a Firebase Storage URL
export const deleteImageFromUrl = async (url: string): Promise<void> => {
    // Don't try to delete placeholder images from an external service
    if (!url.includes('firebasestorage.googleapis.com')) {
        return;
    }
    
    const storageInstance = getStorageInstance();
    if (!storageInstance) {
        // If storage isn't configured, we can't delete, so just exit gracefully.
        return;
    }
    
    try {
        const storageRef = ref(storageInstance, url);
        await deleteObject(storageRef);
    } catch (error: any) {
        // If the file doesn't exist, we can ignore the error.
        if (error.code !== 'storage/object-not-found') {
            console.error("Error deleting image from storage:", error);
            // We don't re-throw, as failing to delete an old image shouldn't block the user flow.
        }
    }
};
