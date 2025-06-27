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
  apiKey: "AIzaSyCllPpwubpm2RwfBuIT1JVHIdGQd0i0ZOw",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "blink-notify-494bf",
  storageBucket: "blink-notify-494bf.firebasestorage.app",
  messagingSenderId: "450079883039",
  appId: "1:450079883039:android:09445bc4809ba1b2b27a2a",
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);


export { app, db, storage };
