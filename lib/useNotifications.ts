'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMessagingInstance } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    let messaging: Awaited<ReturnType<typeof getMessagingInstance>> = null;

    async function setupListener() {
      messaging = await getMessagingInstance();
      if (!messaging) return;

      onMessage(messaging, (payload) => {
        const notification = payload.notification;
        if (notification) {
          new Notification(notification.title || 'PetLove', {
            body: notification.body,
            icon: '/icon-192.png',
          });
        }
      });
    }

    setupListener();

    return () => {
      messaging = null;
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return null;

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        const messaging = await getMessagingInstance();
        if (messaging && VAPID_KEY) {
          const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
          if (currentToken) {
            setToken(currentToken);
            await fetch('/api/notifications/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: currentToken }),
            });
            return currentToken;
          }
        }
      }
      return null;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { permission, token, loading, requestPermission };
}
