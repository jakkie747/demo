// This service worker handles background push notifications.

// IMPORTANT: The Firebase JS SDK is loaded from the CDN here.
// It's essential that the version matches the one in your package.json
self.importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
self.importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDORczgYjyxDvjSAfW7Q9fsT8wkJ4gIe1g",
  authDomain: "blink-notify-494bf.firebaseapp.com",
  projectId: "blink-notify-494bf",
  storageBucket: "blink-notify-494bf.firebasestorage.app",
  messagingSenderId: "450079883039",
  appId: "1:450079883039:web:4e4162b5a3f6e1beb27a2a",
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message: ', payload);

  const notificationTitle = payload.notification.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new update.',
    icon: payload.notification.image || 'https://placehold.co/192x192.png',
    data: {
        // Use the link from the payload, or default to the homepage
        url: payload.fcmOptions?.link || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// This event is triggered when a user clicks on a notification.
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window open with the same URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
