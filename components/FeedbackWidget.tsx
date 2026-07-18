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

  useEffect(() => {
    const ocultarAte = localStorage.getItem(STORAGE_KEY);
    if (ocultarAte && new Date(ocultarAte) > new Date()) return;
    setVisivel(true);
  }, []);

  const enviar = async () => {
    if (!humor || !user) return;
    setEnviando(true);
    const supabase = createClient();
    const { error } = await supabase.from('feedback').insert({
      tutor_id: user.id,
      humor,
      comentario: comentario.trim() || null,
    });
    setEnviando(false);
    if (error) return;

    setEnviado(true);
    const ocultarAte = new Date();
    ocultarAte.setDate(ocultarAte.getDate() + DIAS_OCULTO_APOS_ENVIO);
    localStorage.setItem(STORAGE_KEY, ocultarAte.toISOString());
    setTimeout(() => setVisivel(false), 2500);
  };

  if (!visivel) return null;

  return (
    <div className="mb-6 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-4 dark:border-violet-900 dark:from-violet-950 dark:to-purple-950">
      {enviado ? (
        <p className="text-center text-sm font-bold text-violet-700 dark:text-violet-300">💜 Obrigado pelo feedback! Isso nos ajuda a melhorar.</p>
      ) : !humor ? (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Como está sendo sua experiência com o Patinha?</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sua opinião ajuda a gente a melhorar o app</p>
          </div>
          <div className="flex items-center gap-2">
            {humores.map((h) => (
              <button
                key={h.id}
                onClick={() => setHumor(h.id)}
                title={h.label}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl shadow-sm ring-1 ring-slate-200 transition hover:scale-110 hover:shadow-md dark:bg-slate-800 dark:ring-slate-700"
              >
                {h.emoji}
              </button>
            ))}
            <button
              onClick={() => {
                const ocultarAte = new Date();
                ocultarAte.setDate(ocultarAte.getDate() + DIAS_OCULTO_APOS_ENVIO);
                localStorage.setItem(STORAGE_KEY, ocultarAte.toISOString());
                setVisivel(false);
              }}
              className="ml-1 rounded-lg p-2 text-slate-400 transition hover:bg-white/50 hover:text-slate-600 dark:hover:bg-slate-800"
              title="Agora não"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <span className="text-2xl">{humores.find((h) => h.id === humor)?.emoji}</span>
            Quer contar mais alguma coisa? (opcional)
          </div>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="O que você acha que poderia melhorar?"
            rows={2}
            maxLength={1000}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setHumor(null)}
              className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-white/50 dark:hover:bg-slate-800"
            >
              Voltar
            </button>
            <button
              onClick={enviar}
              disabled={enviando}
              className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'Enviar feedback'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
