// Neon Speed · service worker de avisos (solo push; no guarda nada en caché)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: 'Neon Speed', body: e.data ? e.data.text() : '' }; }
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    list.forEach((c) => c.postMessage({ ns: 'push', d }));
    if (list.some((c) => c.visibilityState === 'visible' && c.focused)) return; // el juego está delante: lo muestra él
    await self.registration.showNotification(d.title || 'Neon Speed', {
      body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || undefined, renotify: !!d.tag,
      data: { url: d.url || './' }, vibrate: [80, 40, 80],
    });
  })());
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) { if ('focus' in c) { c.postMessage({ ns: 'nav', url }); return c.focus(); } }
    return self.clients.openWindow(url);
  })());
});
