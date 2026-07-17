// Service workers não suportam `import` de pacotes npm (isso exigiria um
// bundler) — o jeito suportado pelo navegador é `importScripts` com os
// bundles "compat" do Firebase hospedados no CDN oficial. A config abaixo
// não é segredo: é a mesma config pública que já vai embutida no JS do site
// (ver lib/firebase.ts) — a segurança do Firebase é feita por regras do
// servidor, não por esconder essa config.
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyA3Y8P61m--wEXNE3rkYxjeSN2iFadYjGI',
  authDomain: 'petlove-notifications.firebaseapp.com',
  projectId: 'petlove-notifications',
  storageBucket: 'petlove-notifications.firebasestorage.app',
  messagingSenderId: '553725826172',
  appId: '1:553725826172:web:742dbd42f5a65fd79ae5f9',
});

const messaging = firebase.messaging();

// Só dispara quando o app está fechado/em segundo plano — em primeiro
// plano quem trata a notificação é o onMessage em lib/useNotifications.ts.
messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  self.registration.showNotification(notification.title || 'Patinha', {
    body: notification.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.fcmOptions?.link ? { url: payload.fcmOptions.link } : payload.data,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
