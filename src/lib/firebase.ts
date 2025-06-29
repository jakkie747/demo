import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";
import { getMessaging, type Messaging } from "firebase/messaging";

// =================================================================================
// Your Web App's Firebase configuration
// =================================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyDORczgYjyxDvjSAfW7Q9fsT8wkJ4gIe1g",
  authDomain: "blink-notify-494bf.firebaseapp.com",
  projectId: "blink-notify-494bf",
  storageBucket: "blink-notify-494bf.firebasestorage.app",
  messagingSenderId: "450079883039",
  appId: "1:450079883039:web:4e4162b5a3f6e1beb27a2a",
};

let app: FirebaseApp | null = null;
let db: any | null = null;
let storage: FirebaseStorage | any | null = null;
let auth: Auth | null = null;
let messaging: Messaging | null = null;

// Helper to check if the config is populated, so we can show a nice error.
export const isFirebaseConfigured = () => {
    return firebaseConfig.apiKey !== "" && firebaseConfig.appId !== "";
}

if (isFirebaseConfigured()) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
    
    if (typeof window !== 'undefined') {
        messaging = getMessaging(app);
    }
}

export { app, db, storage, auth, messaging };
