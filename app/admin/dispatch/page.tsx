'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

interface TutorRow {
  id: string;
  nome: string;
  email: string;
  cidade: string | null;
  estado: string;
  sent: boolean;
  sentAt: string | null;
}

export default function AdminDispatchPage() {
  const [tutores, setTutores] = useState<TutorRow[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalSent, setTotalSent] = useState(0);

  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dispatch-partners?limit=500');
      const data = await res.json();
      const todos: TutorRow[] = Object.values(data.users || {}).flat() as TutorRow[];
      todos.sort((a, b) => a.nome.localeCompare(b.nome));
      setTutores(todos);
      setStates(data.states || []);
      setTotal(data.total || 0);
      setTotalSent(data.totalSent || 0);
    } catch {
      setTutores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtrados = useMemo(() => {
    return tutores.filter((t) => {
      const termo = filtro.toLowerCase();
      const matchBusca = !termo || t.nome.toLowerCase().includes(termo) || t.email.toLowerCase().includes(termo);
      const matchEstado = filtroEstado === 'todos' || t.estado === filtroEstado;
      return matchBusca && matchEstado;
    });
  }, [tutores, filtro, filtroEstado]);

  const toggleSelecionado = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selecionarPendentesFiltrados = () => {
    const pendentes = filtrados.filter((t) => !t.sent).map((t) => t.id);
    setSelecionados(new Set(pendentes));
  };

  const limparSelecao = () => setSelecionados(new Set());

  const enviar = async () => {
    if (selecionados.size === 0) {
      setMensagem('Selecione pelo menos um tutor');
      return;
    }
    if (!subject || !html) {
      setMensagem('Preencha assunto e mensagem antes de enviar');
      return;
    }
    setEnviando(true);
    setMensagem(null);
    try {
      const res = await fetch('/api/admin/dispatch-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: Array.from(selecionados), subject, html }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensagem(`✓ ${data.sent} enviado(s)${data.failed ? `, ${data.failed} falharam` : ''}`);
        setSelecionados(new Set());
        carregar();
      } else {
        setMensagem(data.error || 'Erro ao enviar');
      }
    } catch {
      setMensagem('Erro ao enviar');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          🚀 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Dispatch</span> de E-mails
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Envie um e-mail em massa para os tutores cadastrados no app, agrupados por estado. Use <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">{'{nome}'}</code> no assunto/mensagem para personalizar.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total de Tutores</p>
          <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{loading ? '...' : total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Já receberam este disparo</p>
          <p className="mt-1 text-3xl font-black text-emerald-700 dark:text-emerald-300">{loading ? '...' : totalSent}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-blue-900 dark:bg-blue-950">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Selecionados agora</p>
          <p className="mt-1 text-3xl font-black text-blue-700 dark:text-blue-300">{selecionados.size}</p>
        </div>
      </div>

      <div className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-bold text-slate-900 dark:text-white">Mensagem</p>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Assunto (ex: Novidades pra {nome} e o pet dele!)"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
        />
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          placeholder="Corpo do e-mail (HTML). Ex: <p>Oi {nome}, ...</p>"
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={enviar}
            disabled={enviando || selecionados.size === 0}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl disabled:opacity-50"
          >
            {enviando ? 'Enviando...' : `📨 Enviar para ${selecionados.size} selecionado(s)`}
          </button>
          {mensagem && <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{mensagem}</span>}
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-72 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400"
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-blue-400"
          >
            <option value="todos">Todos os estados</option>
            {states.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
          <span className="text-sm text-slate-500 dark:text-slate-400">{filtrados.length} tutores</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={selecionarPendentesFiltrados}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Selecionar pendentes filtrados
          </button>
          <button
            onClick={limparSelecao}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Limpar seleção
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((tutor) => (
            <label
              key={tutor.id}
              className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 shadow-sm transition ${
                tutor.sent
                  ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/50'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-slate-900'
              }`}
            >
              <input
                type="checkbox"
                checked={selecionados.has(tutor.id)}
                onChange={() => toggleSelecionado(tutor.id)}
                className="h-4 w-4 shrink-0 rounded border-slate-300"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{tutor.nome || 'Sem nome'}</h3>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tutor.estado}</span>
                  {tutor.sent && (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400">✓ Recebeu</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate dark:text-slate-400">{tutor.email} · {tutor.cidade || 'sem cidade'}</p>
              </div>
            </label>
          ))}
        </div>
      )}

      {!loading && filtrados.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-lg font-bold text-slate-400">Nenhum tutor encontrado</p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Tente ajustar os filtros de busca</p>
        </div>
      )}
    </div>
  );
}
