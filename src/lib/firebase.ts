import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// =================================================================================
// IMPORTANT: ACTION REQUIRED
// =================================================================================
// Your app is not connecting to Firebase. Please add your project's configuration
// details below.
//
// How to find your Firebase config:
// 1. Go to your Firebase project: https://console.firebase.google.com/project/blink-notify-494bf/overview
// 2. Click the gear icon (Project settings) next to "Project Overview".
// 3. In the "General" tab, scroll down to the "Your apps" section.
// 4. Find your web app, and in the "SDK setup and configuration" box, select "Config".
// 5. You will see an object called `firebaseConfig`. Copy the values from that
//    object and paste them into the `firebaseConfig` object below, replacing
//    the placeholder values like "PASTE_YOUR_API_KEY_HERE".
// =================================================================================
export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "blink-notify-494bf",
  storageBucket: "blink-notify-494bf.appspot.com",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE",
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);


export { app, db, storage };
