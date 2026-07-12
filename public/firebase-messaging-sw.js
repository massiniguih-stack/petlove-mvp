import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: self.__FIREBASE_CONFIG?.apiKey,
  authDomain: self.__FIREBASE_CONFIG?.authDomain,
  projectId: self.__FIREBASE_CONFIG?.projectId,
  storageBucket: self.__FIREBASE_CONFIG?.storageBucket,
  messagingSenderId: self.__FIREBASE_CONFIG?.messagingSenderId,
  appId: self.__FIREBASE_CONFIG?.appId,
};

// eslint-disable-next-line no-undef
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onMessage(messaging, (payload) => {
  const notification = payload.notification;
  if (notification) {
    self.registration.showNotification(notification.title || 'PetLove', {
      body: notification.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: payload.data,
    });
  }
});
