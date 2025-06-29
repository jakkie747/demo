
// public/firebase-messaging-sw.js
// This script runs in the background to receive push notifications.

// Import the Firebase scripts that are needed
importScripts('https://www.gstatic.com/firebasejs/10.12.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.3/firebase-messaging-compat.js');

// IMPORTANT: This configuration object must match the one in your app.
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

// If you want to customize the behavior of background notifications, you can
// listen for them here. For simple notifications sent from a Cloud Function
// with a "notification" payload, the browser will often handle displaying
// them automatically without this listener.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);

  // You can customize the notification that is displayed here.
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "https://placehold.co/192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
