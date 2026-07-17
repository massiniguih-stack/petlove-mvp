import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

function getFirebaseAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) return null;

  const apps = getApps();
  const app = apps.length > 0 ? apps[0] : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return getMessaging(app);
}

// Envia uma notificação push para um token salvo em push_subscriptions.
// Retorna false (sem lançar) se as credenciais do Firebase Admin não
// estiverem configuradas — quem chama decide se quer logar isso ou não.
export async function sendPushNotification(token: string, title: string, body: string, url?: string): Promise<{ sent: boolean; tokenInvalido?: boolean }> {
  const messaging = getFirebaseAdmin();
  if (!messaging) return { sent: false };

  try {
    await messaging.send({
      token,
      notification: { title, body },
      webpush: url ? { fcmOptions: { link: url } } : undefined,
    });
    return { sent: true };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    const tokenInvalido = code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token';
    if (!tokenInvalido) console.error('Falha ao enviar push:', err);
    return { sent: false, tokenInvalido };
  }
}
