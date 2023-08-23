/// <reference lib="webworker" />
// import {manifest, version} from '@parcel/service-worker';
declare var self: ServiceWorkerGlobalScope;

function handleMessageEvent(_event: ExtendableMessageEvent) {
  // ...
};
self.addEventListener('message', (event) => {
  handleMessageEvent(event);
});

self.addEventListener('push', (event) => {
  const evtData = event.data?.json() ?? {};
  const { title, text } = evtData;

  const options = {
    body: text,
    icon: 'icon.png',
    badge: 'badge.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('install', (event) => {
  // primeCaches();

  // Notify all clients about the installation
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage('INSTALLED!'));
  });
});

self.addEventListener('activate', e => {
  console.log('ACTIVATED!');
});

// self.addEventListener('fetch', (event) => {
//   event.respondWith(caches.match(event.request) as any);
// });

// self.addEventListener("online")

// async function install() {
//   const cache = await caches.open(version);

//   debugger;
  
//   await cache.addAll(manifest);
// }
// self.addEventListener('install', e => e.waitUntil(install()));

// async function activate() {
//   const keys = await caches.keys();
//   await Promise.all(
//     keys.map(key => key !== version && caches.delete(key))
//   );
// }
// self.addEventListener('activate', e => e.waitUntil(activate()));

// self.addEventListener('fetch', async (event) => {
//   let res: Response;
//   let cache: Cache;

//   try {
//     res = await fetch(event.request);
//     cache = await caches.open(version);
//     cache.put(event.request.url, res.clone());
//     return res;
//   } catch(error){
//     return caches.match(event.request);
//   }
// });