'use strict';
// Offline-Cache für die Spielwelt. Bei Änderungen VERSION erhöhen.
const VERSION = 'kunterbunt-v16';
const FILES = [
  './',
  './index.html',
  './style.css',
  './manifest.webmanifest',
  './js/main.js',
  './js/art.js',
  './js/world.js',
  './js/sound.js',
  './js/map.js',
  './js/dj.js',
  './js/learn.js',
  './js/vocab.js',
  './js/names.js',
  './js/playtime.js',
  './audio/track1.mp3',
  './audio/track2.mp3',
  './audio/track3.mp3',
  './icons/icon.svg',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/itmx-logo.png',
  './icons/itmx-x.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith('kunterbunt-') && k !== VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Erst aus dem Cache (schnell & offline), im Hintergrund aktualisieren.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.registration.scope)) return;
  event.respondWith(
    caches.open(VERSION).then((cache) =>
      cache.match(req, { ignoreSearch: true }).then((hit) => {
        const net = fetch(req)
          .then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});
