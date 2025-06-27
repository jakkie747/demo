import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "@/lib/firebase";

const storage = getStorage(app);

export const uploadActivityImage = async (file: File): Promise<string> => {
    const filePath = `activities/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, filePath);
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
