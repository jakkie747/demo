
'use client';

import { useEffect } from 'react';

export function PwaRegistry() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/firebase-messaging-sw.js')
          .then((registration) => {
            console.log(
              'PWA: ServiceWorker registration successful with scope: ',
              registration.scope
            );
          })
          .catch((err) => {
            console.log('PWA: ServiceWorker registration failed: ', err);
          });
      });
    }
  }, []);

  return null;
}
