import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";
import { getMessaging, type Messaging } from "firebase/messaging";

// =================================================================================
// CRITICAL: COMPLETE YOUR FIREBASE CONFIGURATION
// =================================================================================
// Your app is not connected to Firebase. Please complete the configuration below.
//
// How to find your Web App's Firebase config:
// 1. Go to your Firebase project settings:
//    https://console.firebase.google.com/project/blink-notify-494bf/settings/general
// 2. In the "Your apps" section, find your Web App (it has a </> icon).
// 3. In the "SDK setup and configuration" section, select "Config".
// 4. Copy the `apiKey` and `appId` values and paste them into the empty strings below.
// =================================================================================
export const firebaseConfig = {
  // PASTE YOUR WEB APP'S API KEY HERE
  apiKey: "AIzaSyDORczgYjyxDvjSAfW7Q9fsT8wkJ4gIe1g",

  // These values are correct for your project. Do not change them.
  authDomain: "blink-notify-494bf.firebaseapp.com",
  projectId: "blink-notify-494bf",
  storageBucket: "blink-notify-494bf.firebasestorage.app",
  messagingSenderId: "450079883039",

  // PASTE YOUR WEB APP'S APP ID HERE
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
