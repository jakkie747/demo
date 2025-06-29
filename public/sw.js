// This file must be in the public folder.

// Import the Firebase scripts. NOTE: a specific version is imported to ensure stability.
// You may want to periodically update this to a newer version.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// These values need to match the ones in your src/lib/firebase.ts
const firebaseConfig = {
    apiKey: "AIzaSyDORczgYjyxDvjSAfW7Q9fsT8wkJ4gIe1g",
    authDomain: "blink-notify-494bf.firebaseapp.com",
    projectId: "blink-notify-494bf",
    storageBucket: "blink-notify-494bf.firebasestorage.app",
    messagingSenderId: "450079883039",
    appId: "1:450079883039:web:4e4162b5a3f6e1beb27a2a",
};

// Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages. This is all that's needed for the browser to display notifications
// that are sent with a 'notification' payload from your Cloud Function.
const messaging = firebase.messaging();