const CACHE_NAME = "blinkogies-cache-v2";
const APP_SHELL_URLS = ["/", "/offline", "/events", "/register"];
const DYNAMIC_CACHE_NAME = "dynamic-cache-v2";

self.addEventListener("install", (event) => {
  console.log("SW: Install event");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("SW: Caching app shell");
      return cache.addAll(APP_SHELL_URLS);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("SW: Activate event");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (APP_SHELL_URLS.includes(new URL(event.request.url).pathname)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).catch(() => caches.match('/offline'));
      })
    );
  } else if (event.request.destination === 'image') {
      event.respondWith(
        caches.open(DYNAMIC_CACHE_NAME).then(async (cache) => {
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) return cachedResponse;
          
          const networkResponse = await fetch(event.request);
          if (networkResponse) {
              cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
            // If the image fetch fails, we don't want to show the offline page.
            // We can return a placeholder or just let it fail.
        })
      )
  } else {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(event.request).then(res => {
                return res || caches.match('/offline');
            });
          });
      })
    );
  }
});
