import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isStorageConfigured = !!firebaseConfig.storageBucket;

// Initialize Firebase
// Note: You will need to set up a Firebase project and add your configuration
// details to environment variables (e.g., in a .env.local file) for this to work.
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Conditionally initialize storage
let storage: FirebaseStorage | undefined;
if (isStorageConfigured) {
  storage = getStorage(app);
} else {
  console.warn(
    "Firebase Storage is not configured. Missing 'storageBucket' in Firebase config. " +
    "File uploads will be disabled. Please set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in your .env.local file."
  );
}


export { app, db, storage };
