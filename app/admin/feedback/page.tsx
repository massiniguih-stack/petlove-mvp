'use client';

import { useEffect, useState } from 'react';

interface Feedback {
  id: string;
  humor: 'otimo' | 'ok' | 'ruim';
  comentario: string | null;
  created_at: string;
  tutor: { nome: string; email: string } | { nome: string; email: string }[] | null;
}

const humorInfo: Record<Feedback['humor'], { emoji: string; label: string; cor: string }> = {
  otimo: { emoji: '😊', label: 'Ótimo', cor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  ok: { emoji: '😐', label: 'Ok', cor: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  ruim: { emoji: '😞', label: 'Ruim', cor: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

function tutorDe(f: Feedback) {
  return Array.isArray(f.tutor) ? f.tutor[0] : f.tutor;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroHumor, setFiltroHumor] = useState<'todos' | Feedback['humor']>('todos');
  const [resumo, setResumo] = useState({ otimo: 0, ok: 0, ruim: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  useEffect(() => {
    setCarregando(true);
    fetch(`/api/admin/feedback?page=${page}&limit=${limit}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          setFeedbacks(data.data);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
          setResumo(data.resumo || { otimo: 0, ok: 0, ruim: 0 });
        } else {
          setErro(data.error || 'Erro ao carregar');
        }
      })
      .catch(() => setErro('Erro de conexão'))
      .finally(() => setCarregando(false));
  }, [page]);

  const filtrados = feedbacks.filter((f) => filtroHumor === 'todos' || f.humor === filtroHumor);
  const totalRespostas = resumo.otimo + resumo.ok + resumo.ruim;
  const satisfacao = totalRespostas > 0 ? Math.round((resumo.otimo / totalRespostas) * 100) : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Feedback dos tutores</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">O que os tutores estão achando do app</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total de respostas</p>
          <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{total}</p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 shadow-sm dark:border-violet-900 dark:bg-violet-950">
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">% dizendo &quot;Ótimo&quot;</p>
          <p className="mt-1 text-3xl font-black text-violet-700 dark:text-violet-300">{satisfacao}%</p>
        </div>
        <button onClick={() => setFiltroHumor(filtroHumor === 'ok' ? 'todos' : 'ok')} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left shadow-sm transition hover:shadow-md dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">😐 Ok</p>
          <p className="mt-1 text-3xl font-black text-amber-700 dark:text-amber-300">{resumo.ok}</p>
        </button>
        <button onClick={() => setFiltroHumor(filtroHumor === 'ruim' ? 'todos' : 'ruim')} className="rounded-2xl border border-red-200 bg-red-50 p-4 text-left shadow-sm transition hover:shadow-md dark:border-red-900 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">😞 Ruim</p>
          <p className="mt-1 text-3xl font-black text-red-700 dark:text-red-300">{resumo.ruim}</p>
        </button>
      </div>

      <div className="mb-6 flex items-center gap-2">
        {(['todos', 'otimo', 'ok', 'ruim'] as const).map((h) => (
          <button
            key={h}
            onClick={() => setFiltroHumor(h)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              filtroHumor === h
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {h === 'todos' ? 'Todos' : `${humorInfo[h].emoji} ${humorInfo[h].label}`}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
        </div>
      ) : erro ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-sm font-bold text-red-700 dark:text-red-400">{erro}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((f) => {
            const tutor = tutorDe(f);
            return (
              <div key={f.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl ${humorInfo[f.humor].cor}`}>
                      {humorInfo[f.humor].emoji}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{tutor?.nome || 'Tutor sem nome'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{tutor?.email}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                    {new Date(f.created_at).toLocaleDateString('pt-BR')} às {new Date(f.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {f.comentario && (
                  <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">{f.comentario}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!carregando && !erro && filtrados.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-4xl">💬</p>
          <p className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Nenhum feedback ainda</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Assim que tutores responderem no dashboard, aparece aqui.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">Página {page} de {totalPages} ({total} total)</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
