// 메인 쓰레드와 서비스 워커간 postMessage 통신을 위해, 본 파일의 내용을 hiclass-fcm-sw.js 로 이동
self.addEventListener('activate', event => event.waitUntil(self.registration.unregister()))
self.addEventListener('install', () => self.skipWaiting())