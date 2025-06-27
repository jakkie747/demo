import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// =================================================================================
// CORRECT FIREBASE CONFIGURATION
// =================================================================================
// The configuration below has been partially pre-filled for your project.
// However, you still need to provide your Web App's specific `apiKey` and `appId`.
//
// How to find your Web App's Firebase config:
// 1. Go to your Firebase project settings: https://console.firebase.google.com/project/blink-notify-494bf/settings/general
// 2. In the "Your apps" section, make sure you have a Web App (it has a </> icon). If not, create one.
// 3. Find your Web App in the list and click its name to see its configuration.
// 4. In the "SDK setup and configuration" section, select the "Config" option.
// 5. Copy your `apiKey` and `appId` values and paste them into the placeholders below.
// =================================================================================
export const firebaseConfig = {
  // TODO: PASTE YOUR WEB APP'S API KEY HERE
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  // This value is correct for your project
  authDomain: "blink-notify-494bf.firebaseapp.com",
  // This value is correct for your project
  projectId: "blink-notify-494bf",
  // This value is correct for your project
  storageBucket: "blink-notify-494bf.appspot.com",
  // This value is correct for your project
  messagingSenderId: "450079883039",
  // TODO: PASTE YOUR WEB APP'S APP ID HERE
  appId: "PASTE_YOUR_WEB_APP_ID_HERE",
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);


export { app, db, storage };
