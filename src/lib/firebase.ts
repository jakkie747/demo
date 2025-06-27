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
  // PASTE YOUR WEB APP'S API KEY HERE (it's a long string of letters and numbers)
  apiKey: "",

  // These values are correct for your project. Do not change them.
  authDomain: "blink-notify-494bf.firebaseapp.com",
  projectId: "blink-notify-494bf",
  storageBucket: "blink-notify-494bf.appspot.com",
  messagingSenderId: "450079883039",

  // PASTE YOUR WEB APP'S APP ID HERE (it starts with "1:")
  appId: "",
};

// Initialize Firebase
let app: FirebaseApp;
let db: any;
let storage: FirebaseStorage | any;

if (firebaseConfig.apiKey && firebaseConfig.appId) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    storage = getStorage(app);
} else {
    console.warn("Firebase configuration is incomplete. The app will not connect to Firebase. Please update src/lib/firebase.ts");
}

export { app, db, storage };
