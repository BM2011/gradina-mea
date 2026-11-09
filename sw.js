/* Service worker: aplicația pornește și fără internet (vremea se ia din ultima copie salvată). */
const V = 'gradina-gh-v1.3.0';
const SHELL = ['./', './index.html', './app.css', './data-plants.js', './data-tasks.js', './weather.js', './engine.js', './illustrations.js', './bg.svg', './app.js',
  './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // API-urile meteo: mereu din rețea (aplicația își păstrează singură ultima copie)
  if (/open-meteo\.com|bigdatacloud\.net/.test(u.host)) return;
  // Fonturi: cache, apoi rețea
  if (/fonts\.(googleapis|gstatic)\.com/.test(u.host)) {
    e.respondWith(caches.open(V + '-fonts').then(c => c.match(e.request).then(r => r || fetch(e.request).then(n => { c.put(e.request, n.clone()); return n; }))));
    return;
  }
  if (u.origin !== location.origin) return;
  // Fișierele aplicației: rețea întâi (actualizări rapide), cache dacă e offline
  e.respondWith(fetch(e.request).then(n => { const cp = n.clone(); caches.open(V).then(c => c.put(e.request, cp)); return n; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = './index.html' + ((e.notification.data && e.notification.data.url) || '#azi');
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(list => { for (const c of list) { c.navigate(url); return c.focus(); } return self.clients.openWindow(url); }));
});
