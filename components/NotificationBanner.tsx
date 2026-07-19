'use client';

import { useNotifications } from '@/lib/useNotifications';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'patinha_notificacao_banner_visto';

export default function NotificationBanner() {
  const { permission, loading, requestPermission } = useNotifications();
  const [visto, setVisto] = useState(true); // começa escondido até checar o navegador

  useEffect(() => {
    setVisto(localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  const esconderPraSempre = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisto(true);
  };

  if (permission === 'granted' || permission === 'denied' || visto) return null;

  return (
    <div className="mb-6 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Ative as notificacoes</p>
            <p className="text-xs text-slate-500">Receba lembretes de vacinas e consultas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              await requestPermission();
              esconderPraSempre();
            }}
            disabled={loading}
            className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? 'Ativando...' : 'Ativar'}
          </button>
          <button
            onClick={esconderPraSempre}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
