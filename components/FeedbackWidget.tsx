'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'patinha_feedback_ocultar_ate';
const DIAS_OCULTO_APOS_ENVIO = 30;

const humores = [
  { id: 'ruim', emoji: '😞', label: 'Ruim' },
  { id: 'ok', emoji: '😐', label: 'Ok' },
  { id: 'otimo', emoji: '😊', label: 'Ótimo' },
] as const;

export default function FeedbackWidget() {
  const { user } = useAuth();
  const [visivel, setVisivel] = useState(false);
  const [humor, setHumor] = useState<(typeof humores)[number]['id'] | null>(null);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    const ocultarAte = localStorage.getItem(STORAGE_KEY);
    if (ocultarAte && new Date(ocultarAte) > new Date()) return;
    setVisivel(true);
  }, []);

  const ocultarPor30Dias = () => {
    const ocultarAte = new Date();
    ocultarAte.setDate(ocultarAte.getDate() + DIAS_OCULTO_APOS_ENVIO);
    localStorage.setItem(STORAGE_KEY, ocultarAte.toISOString());
  };

  const enviar = async () => {
    if (!humor) return;
    setFalhou(false);
    if (!user) {
      setFalhou(true);
      return;
    }
    setEnviando(true);
    const supabase = createClient();
    const { error } = await supabase.from('feedback').insert({
      tutor_id: user.id,
      humor,
      comentario: comentario.trim() || null,
    });
    setEnviando(false);
    if (error) {
      setFalhou(true);
      return;
    }

    setEnviado(true);
    ocultarPor30Dias();
    setTimeout(() => setVisivel(false), 2500);
  };

  if (!visivel) return null;

  if (enviado) {
    return (
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300" role="status">
        Obrigado! Sua opinião foi registrada.
      </p>
    );
  }

  return (
    <section
      className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
      aria-label="Pesquisa de satisfação"
    >
      <div className="flex items-center gap-3">
        <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-slate-900 dark:text-white">
          O que está achando do Patinha?
        </p>
        <div className="flex shrink-0 items-center gap-1">
          {humores.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setHumor(h.id)}
              aria-label={h.label}
              aria-pressed={humor === h.id}
              title={h.label}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition active:scale-95 ${
                humor === h.id
                  ? 'bg-amber-100 ring-2 ring-amber-400 dark:bg-amber-950'
                  : humor
                    ? 'opacity-40 hover:opacity-100'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {h.emoji}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              ocultarPor30Dias();
              setVisivel(false);
            }}
            aria-label="Agora não"
            title="Agora não"
            className="ml-1 flex h-10 w-8 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {humor && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
        >
          <input
            type="text"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Quer contar algo? (opcional)"
            maxLength={1000}
            aria-label="Comentário opcional"
            className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={enviando}
            className="shrink-0 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {enviando ? 'Enviando…' : 'Enviar'}
          </button>
        </form>
      )}
      {falhou && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
          Não consegui enviar agora. Tente de novo em instantes.
        </p>
      )}
    </section>
  );
}
