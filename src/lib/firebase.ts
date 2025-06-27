import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

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
  apiKey: "",

  // These values are correct for your project. Do not change them.
  authDomain: "blink-notify-494bf.firebaseapp.com",
  projectId: "blink-notify-494bf",
  storageBucket: "blink-notify-494bf.appspot.com",
  messagingSenderId: "450079883039",

  // PASTE YOUR WEB APP'S APP ID HERE
  appId: "",
};

let app: FirebaseApp | null = null;
let db: any | null = null;
let storage: FirebaseStorage | any | null = null;

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
}

export { app, db, storage };
