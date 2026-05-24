importScripts('https://www.gstatic.com/firebasejs/8.4.1/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.4.1/firebase-messaging.js')
importScripts('/hitalk/publicUtils.js')

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

const context = {
  pushListenerRegistered: false,
}

firebase.initializeApp({
    apiKey: "AIzaSyBMlftT-MLM_4uNXKH_nKHvAJBokKtGDys",
    projectId: "newclass-bb938",
    messagingSenderId: "1028665832919",
    appId: "1:1028665832919:web:ba9018e7cdba9aea568792",
})

const pushHandler = event => {
  event.waitUntil(new Promise(async (resolve) => {
    const visibleClients = (await self.clients.matchAll({type: 'window', includeUncontrolled: true}))
                            .filter(client => client.visibilityState === 'visible' && !client.url.startsWith('chrome-extension://'))
                            .filter(client => client.url.indexOf('/hitalk') !== -1);
    if (visibleClients.length > 0)
      return resolve(visibleClients.forEach(client => client.postMessage(event.data.json())))
    const payload = event.data.json()
    self.registration.showNotification(payload.data.title, {
      ...payload,
      body: payload.data.message.replace(/&#[0-9]+/g, (v) => (String.fromCodePoint(parseInt(parseInt(v.replace('&','').replace('#','').replace('',''),10).toString(16),16)))),
      icon: '/firebase-logo.png'
    })
    resolve()
  }))
}

const registPushHandler = () => {
  if (context.pushListenerRegistered) return
  context.pushListenerRegistered = true
  self.addEventListener('push', pushHandler)
}

self.addEventListener('message', ({data: { cmd }}) => (({
  pause: () => {
    context.pushListenerRegistered = false; 
    self.removeEventListener('push', pushHandler)
  },
  wakeup: () => registPushHandler()
})[cmd] || (() => {}))())

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(new Promise(async r => {
    (await self.clients.matchAll({ type: 'window', includeUncontrolled: true })).forEach(c => {
      c.focus() && c.postMessage({data: {
        ...event.notification.data,
        messageCode: 'openChat',
        content: event.notification.data.sender,
        doNotCreateRoom: true
      }})}) && r()}))})

registPushHandler()

console.log('Firebase service worker registered')