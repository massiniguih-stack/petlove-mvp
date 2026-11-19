'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMessagingInstance } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { lerTokenEnviado, precisaInstalarNoIphone, precisaReenviarToken } from '@/lib/notificacoes';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
const SW_URL = '/firebase-messaging-sw.js';
const TOKEN_ENVIADO_KEY = 'patinha_push_token_enviado';

export type SuporteNotificacao = 'verificando' | 'sim' | 'nao' | 'instalar-no-iphone';

/** Onde o app está rodando — aparece no cartão para ajudar a descobrir problemas. */
export interface Aparelho {
  ios: boolean;
  instalado: boolean;
}

async function registrarServiceWorker() {
  return navigator.serviceWorker.register(SW_URL);
}

// Pega o token do aparelho no Firebase e manda para o servidor, só quando
// for novo/antigo demais (ver precisaReenviarToken). `forcar` ignora a regra
// (usado no clique em "Ativar").
async function sincronizarToken(forcar: boolean): Promise<{ token: string | null; erro: string | null }> {
  if (!VAPID_KEY) return { token: null, erro: 'Notificações não configuradas neste site.' };
  const messaging = await getMessagingInstance();
  if (!messaging) return { token: null, erro: 'Este navegador não recebe notificações.' };

  const serviceWorkerRegistration = await registrarServiceWorker();
  let token: string;
  try {
    token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration });
  } catch (err) {
    // No iPhone a primeira inscrição às vezes falha logo depois de instalar o
    // service worker ("push service error"). Uma segunda tentativa resolve.
    console.warn('getToken falhou, tentando de novo:', err);
    await new Promise((r) => setTimeout(r, 1500));
    token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration });
  }
  if (!token) return { token: null, erro: 'Não consegui ativar neste aparelho.' };

  let salvo = null;
  try {
    salvo = lerTokenEnviado(localStorage.getItem(TOKEN_ENVIADO_KEY));
  } catch {}
  if (!forcar && !precisaReenviarToken(salvo, token, Date.now())) return { token, erro: null };

  const res = await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    // 401 = deslogado: tenta de novo numa próxima visita, sem alarde.
    return { token, erro: res.status === 401 ? null : 'Não consegui salvar este aparelho. Tente de novo.' };
  }
  try {
    localStorage.setItem(TOKEN_ENVIADO_KEY, JSON.stringify({ token, em: Date.now() }));
  } catch {}
  return { token, erro: null };
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [suporte, setSuporte] = useState<SuporteNotificacao>('verificando');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aparelho, setAparelho] = useState<Aparelho | null>(null);

  useEffect(() => {
    let ativo = true;
    let pararDeOuvir: (() => void) | null = null;
    (async () => {
      const standalone =
        window.matchMedia?.('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true;
      if (ativo) setAparelho({ ios: /iPhone|iPad|iPod/i.test(navigator.userAgent), instalado: !!standalone });
      if (precisaInstalarNoIphone(navigator.userAgent, standalone)) {
        if (ativo) setSuporte('instalar-no-iphone');
        return;
      }
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        if (ativo) setSuporte('nao');
        return;
      }
      const messaging = await getMessagingInstance().catch(() => null);
      if (!ativo) return;
      setSuporte(messaging ? 'sim' : 'nao');
      setPermission(Notification.permission);

      if (!messaging) return;

      // Com o app aberto, o Firebase entrega aqui (e não no service worker).
      // `new Notification()` é recusado pelo Chrome do Android — quem mostra
      // a notificação tem que ser o service worker.
      pararDeOuvir = onMessage(messaging, async (payload) => {
        const n = payload.notification;
        if (!n) return;
        const opcoes = { body: n.body, icon: '/icon-192.png', badge: '/icon-192.png', data: { url: payload.fcmOptions?.link } };
        try {
          const reg = await navigator.serviceWorker.getRegistration(SW_URL);
          if (reg) return void reg.showNotification(n.title || 'Patinha', opcoes);
          new Notification(n.title || 'Patinha', opcoes);
        } catch (err) {
          console.error('Não consegui mostrar a notificação:', err);
        }
      });
      if (!ativo) pararDeOuvir();

      // Já permitido antes: confirma em silêncio que o servidor tem o token
      // atual deste aparelho (ele pode ter mudado ou o envio ter falhado).
      if (Notification.permission === 'granted') {
        setLoading(true);
        sincronizarToken(false)
          .then((r) => {
            if (!ativo) return;
            setToken(r.erro ? null : r.token);
            setErro(r.erro);
          })
          .catch((err) => {
            console.error('Falha ao sincronizar notificações:', err);
            const motivo = err instanceof Error ? ` (${err.name})` : '';
            if (ativo) setErro(`Não consegui conectar este aparelho. Toque em "Tentar de novo".${motivo}`);
          })
          .finally(() => {
            if (ativo) setLoading(false);
          });
      }
    })();
    return () => {
      ativo = false;
      pararDeOuvir?.();
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return null;

    setLoading(true);
    setErro(null);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') return null;

      const r = await sincronizarToken(true);
      setToken(r.erro ? null : r.token);
      setErro(r.erro);
      return r.erro ? null : r.token;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      setErro(`Não consegui ativar as notificações. Tente de novo. (${err instanceof Error ? err.name : 'erro'})`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Pede ao servidor uma notificação de teste para este aparelho. */
  const enviarTeste = useCallback(async (): Promise<{ ok: boolean; mensagem: string }> => {
    const res = await fetch('/api/notifications/teste', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, mensagem: 'Enviada! Deve chegar em alguns segundos.' };
    if (data.semToken) {
      try {
        localStorage.removeItem(TOKEN_ENVIADO_KEY);
      } catch {}
    }
    return { ok: false, mensagem: data.error || 'Não consegui enviar o teste.' };
  }, []);

  return { permission, suporte, token, loading, erro, aparelho, requestPermission, enviarTeste };
}
