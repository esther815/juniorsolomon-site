// 주니어솔로몬 앱 서비스워커: 설치 + 휴대폰 푸시 알림 (회원 정보는 저장하지 않고 항상 새로 받아 옵니다)
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () { /* 네트워크 그대로 사용 */ });

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: e.data ? e.data.text() : '새 소식' }; }
  var title = '✦ ' + (d.title || '주니어솔로몬 새 소식');
  var opt = {
    body: d.body || '',
    icon: '/assets/icon-192.png',
    badge: '/assets/badge-star.png',
    image: d.star ? '/assets/push-star.png' : undefined,
    tag: d.tag || 'js',
    renotify: true,
    requireInteraction: !!d.star,
    vibrate: [80, 60, 80, 60, 220],
    data: { url: d.url || '/member.html' }
  };
  e.waitUntil(Promise.all([
    self.registration.showNotification(title, opt),
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
      cs.forEach(function (c) { c.postMessage({ jsPush: true, title: d.title || '새 소식', body: d.body || '' }); });
    })
  ]));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/member.html';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) { if (cs[i].url.indexOf('/member.html') >= 0) return cs[i].focus(); }
    return self.clients.openWindow(url);
  }));
});
