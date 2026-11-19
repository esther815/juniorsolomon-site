// 주니어솔로몬 앱: 설치용 최소 서비스워커 (회원 정보는 저장하지 않고 항상 새로 받아 옵니다)
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () { /* 네트워크 그대로 사용 */ });
