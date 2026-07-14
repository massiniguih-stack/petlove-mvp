'use client';

import { useState, useMemo, useEffect } from 'react';
import { servicosMock, type Servico } from '@/data/servicos';

export default function AdminParceirosPage() {
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroDestaque, setFiltroDestaque] = useState('todos');
  const [editando, setEditando] = useState<Servico | null>(null);
  const [dbCount, setDbCount] = useState<number | null>(null);
  const [importando, setImportando] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const carregarContagemBanco = async () => {
    try {
      const res = await fetch('/api/admin/import-partners?limit=1');
      const data = await res.json();
      setDbCount(typeof data.total === 'number' ? data.total : null);
    } catch {
      setDbCount(null);
    }
  };

  useEffect(() => {
    carregarContagemBanco();
  }, []);

  const importarParaBanco = async () => {
    setImportando(true);
    setImportResult(null);
    try {
      const res = await fetch('/api/admin/import-partners', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setImportResult(data.error || 'Erro ao importar');
      } else {
        setImportResult(`✓ ${data.imported} parceiros importados para o banco`);
      }
    } catch {
      setImportResult('Erro ao importar');
    } finally {
      setImportando(false);
      carregarContagemBanco();
    }
  };

  const parceiros = useMemo(() => {
    return servicosMock
      .filter((s) => {
        const termo = filtro.toLowerCase();
        const matchBusca = !termo || s.nome.toLowerCase().includes(termo) || s.cidade.toLowerCase().includes(termo);
        const matchTipo = filtroTipo === 'todos' || s.tipo === filtroTipo;
        const matchDestaque = filtroDestaque === 'todos' ||
          (filtroDestaque === 'premium' && s.premium) ||
          (filtroDestaque === 'destaque' && s.destaque) ||
          (filtroDestaque === 'comum' && !s.premium && !s.destaque);
        return matchBusca && matchTipo && matchDestaque;
      })
      .sort((a, b) => {
        if (a.premium && !b.premium) return -1;
        if (!a.premium && b.premium) return 1;
        if (a.destaque && !b.destaque) return -1;
        if (!a.destaque && b.destaque) return 1;
        return a.nome.localeCompare(b.nome);
      });
  }, [filtro, filtroTipo, filtroDestaque]);

  const stats = useMemo(() => {
    const total = servicosMock.length;
    const comInstagram = servicosMock.filter((s) => s.instagram).length;
    const premium = servicosMock.filter((s) => s.premium).length;
    const destaque = servicosMock.filter((s) => s.destaque).length;
    return { total, comInstagram, premium, destaque };
  }, []);

  const getBadge = (parceiro: Servico) => {
    if (parceiro.premium) return { label: '⭐ PREMIUM', classes: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-500/30' };
    if (parceiro.destaque) return { label: '🔥 DESTAQUE', classes: 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-lg shadow-blue-500/30' };
    return null;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Parceiros</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gerencie os parceiros cadastrados</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
            Banco de dados (usado pelo /mapa): {dbCount === null ? '...' : `${dbCount} parceiros importados`}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            A lista abaixo mostra os {servicosMock.length} dados de exemplo do código. O mapa público lê do banco — importe para sincronizar.
          </p>
          {importResult && <p className="mt-1 text-xs font-semibold text-blue-900 dark:text-blue-200">{importResult}</p>}
        </div>
        <button
          onClick={importarParaBanco}
          disabled={importando}
          className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
        >
          {importando ? 'Importando...' : '⬆️ Importar para o banco'}
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total</p>
          <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm dark:border-amber-900 dark:from-amber-950 dark:to-orange-950">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">⭐ Premium</p>
          <p className="mt-1 text-3xl font-black text-amber-700 dark:text-amber-300">{stats.premium}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm dark:border-blue-900 dark:from-blue-950 dark:to-indigo-950">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">🔥 Destaque</p>
          <p className="mt-1 text-3xl font-black text-blue-700 dark:text-blue-300">{stats.destaque}</p>
        </div>
        <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4 shadow-sm dark:border-pink-900 dark:bg-pink-950">
          <p className="text-sm font-semibold text-pink-600 dark:text-pink-400">📸 Com Instagram</p>
          <p className="mt-1 text-3xl font-black text-pink-700 dark:text-pink-300">{stats.comInstagram}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por nome ou cidade..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-80 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400"
        />
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-blue-400"
        >
          <option value="todos">Todos os tipos</option>
          <option value="veterinario">Veterinário</option>
          <option value="petshop">Pet Shop</option>
          <option value="creche">Creche</option>
          <option value="parque">Parque</option>
          <option value="hotel">Hotel</option>
        </select>
        <select
          value={filtroDestaque}
          onChange={(e) => setFiltroDestaque(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-blue-400"
        >
          <option value="todos">Todos os status</option>
          <option value="premium">⭐ Premium</option>
          <option value="destaque">🔥 Destaque</option>
          <option value="comum">Comum</option>
        </select>
        <span className="text-sm text-slate-500 dark:text-slate-400">{parceiros.length} parceiros</span>
      </div>

      <div className="space-y-3">
        {parceiros.map((parceiro) => {
          const badge = getBadge(parceiro);
          const isPremium = parceiro.premium;
          const isDestaque = parceiro.destaque;

          return (
            <div
              key={parceiro.id}
              className={`flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${
                isPremium
                  ? 'border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 ring-2 ring-amber-200 dark:border-amber-800 dark:from-amber-950 dark:via-orange-950 dark:to-amber-950 dark:ring-amber-900'
                  : isDestaque
                  ? 'border-blue-300 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 ring-2 ring-blue-200 dark:border-blue-800 dark:from-blue-950 dark:via-indigo-950 dark:to-blue-950 dark:ring-blue-900'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
              }`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                isPremium ? 'bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg shadow-amber-500/30' :
                isDestaque ? 'bg-gradient-to-br from-blue-400 to-indigo-400 shadow-lg shadow-blue-500/30' :
                parceiro.tipo === 'veterinario' ? 'bg-blue-100 dark:bg-blue-900' :
                parceiro.tipo === 'petshop' ? 'bg-purple-100 dark:bg-purple-900' :
                parceiro.tipo === 'creche' ? 'bg-amber-100 dark:bg-amber-900' :
                parceiro.tipo === 'parque' ? 'bg-green-100 dark:bg-green-900' :
                'bg-slate-100 dark:bg-slate-800'
              }`}>
                <span className={`text-xl ${isPremium || isDestaque ? 'drop-shadow-sm' : ''}`}>
                  {parceiro.tipo === 'veterinario' ? '🩺' :
                   parceiro.tipo === 'petshop' ? '🛁' :
                   parceiro.tipo === 'creche' ? '🏫' :
                   parceiro.tipo === 'parque' ? '🌳' : '🐾'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-bold truncate ${isPremium || isDestaque ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                    {parceiro.nome}
                  </h3>
                  {badge && (
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge.classes}`}>
                      {badge.label}
                    </span>
                  )}
                  {parceiro.instagram && (
                    <span className="shrink-0 rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-600 dark:bg-pink-900 dark:text-pink-400">📸</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                  {parceiro.tipo} · {parceiro.cidade}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                {parceiro.telefone && <span title="Telefone">📱</span>}
                {parceiro.website && <span title="Website">🌐</span>}
                {parceiro.instagram && <span title="Instagram">📸</span>}
              </div>

              <button
                onClick={() => setEditando(parceiro)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  isPremium || isDestaque
                    ? 'bg-white/80 text-slate-700 hover:bg-white shadow-sm dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                Editar
              </button>
            </div>
          );
        })}
      </div>

      {parceiros.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-lg font-bold text-slate-400">Nenhum parceiro encontrado</p>
        </div>
      )}

      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setEditando(null)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{editando.nome}</h2>
                {editando.premium && (
                  <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-0.5 text-[10px] font-bold text-white">⭐ PREMIUM</span>
                )}
                {editando.destaque && (
                  <span className="rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 px-2.5 py-0.5 text-[10px] font-bold text-white">🔥 DESTAQUE</span>
                )}
              </div>
              <button onClick={() => setEditando(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">✕</button>
            </div>
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Tipo</label>
                  <p className="mt-1 text-sm font-semibold text-slate-900 capitalize dark:text-white">{editando.tipo}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Cidade</label>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{editando.cidade}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Telefone</label>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{editando.telefone || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Website</label>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{editando.website || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Instagram</label>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{editando.instagram ? `@${editando.instagram}` : '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Avaliação</label>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{editando.avaliacao ? `${editando.avaliacao} ⭐` : '—'}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Endereço</label>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{editando.endereco || '—'}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setEditando(null)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
