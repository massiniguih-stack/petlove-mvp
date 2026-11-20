'use client';

import Link from 'next/link';
import { useNotifications } from '@/lib/useNotifications';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'patinha_notificacao_banner_visto';

export default function NotificationBanner() {
  const { permission, suporte, loading, erro, requestPermission } = useNotifications();
  const [visto, setVisto] = useState(true); // começa escondido até checar o navegador

  useEffect(() => {
    try {
      setVisto(localStorage.getItem(STORAGE_KEY) === 'true');
    } catch {
      setVisto(false);
    }
  }, []);

  const esconderPraSempre = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
    setVisto(true);
  };

  if (visto) return null;
  const podeAtivar = suporte === 'sim' && permission === 'default';
  const iphone = suporte === 'instalar-no-iphone';
  // Banner só aparece onde dá para fazer alguma coisa. Já ativado, bloqueado
  // ou navegador sem suporte: a situação fica na página da conta.
  if (!podeAtivar && !iphone && !erro) return null;

  return (
    <div
      data-testid="banner-notificacoes"
      className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600 dark:text-violet-300" aria-hidden>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Ative as notificações</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {iphone
                ? 'No iPhone: Compartilhar → Adicionar à Tela de Início. Depois ative em Minha conta.'
                : 'Receba os lembretes de vacina no celular.'}
            </p>
            {erro && (
              <p role="status" className="mt-1 text-xs text-red-600 dark:text-red-300">
                {erro} <Link href="/conta/assinatura" className="underline underline-offset-2">Ver em Minha conta</Link>
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {podeAtivar && (
            <button
              onClick={async () => {
                const token = await requestPermission();
                // Deu certo ou a pessoa recusou: não pergunta de novo. Se deu
                // erro, o banner fica com a mensagem.
                if (token || Notification.permission === 'denied') esconderPraSempre();
              }}
              disabled={loading}
              className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? 'Ativando...' : 'Ativar'}
            </button>
          )}
          <button
            onClick={esconderPraSempre}
            aria-label="Fechar"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-violet-100 hover:text-slate-600 dark:hover:bg-violet-900 dark:hover:text-slate-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
