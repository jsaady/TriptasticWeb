/// <reference lib="webworker" />
import {manifest, version} from '@parcel/service-worker';
declare var self: ServiceWorkerGlobalScope;

self.addEventListener('push', (event) => {
  const textRaw = event.data?.text() ?? '{}';

  const { title, text } = JSON.parse(textRaw);

  if (title && text) {
    const options = {
      body: textRaw,
      icon: 'icon.png',
      badge: 'badge.png'
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }

});

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