
// This file must be in the public folder.

// Import the Firebase app and messaging scripts.
// The versions should match the ones used in your web app.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Your web app's Firebase configuration
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

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );

  // Customize the notification here
  const notificationTitle = payload.notification?.title || "New Message";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message.",
    icon: 'https://placehold.co/192x192.png', // Using a full URL for reliability
    tag: 'blinkogies-general-update' // This tag helps stack notifications
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
