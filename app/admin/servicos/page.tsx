'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { servicosMock, type Servico } from '@/data/servicos';

function AdminServicosContent() {
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get('tipo') || 'todos';

  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState(tipoParam);
  const [editando, setEditando] = useState<Servico | null>(null);

  useEffect(() => {
    setFiltroTipo(tipoParam);
  }, [tipoParam]);

  const servicos = useMemo(() => {
    return servicosMock.filter((s) => {
      const termo = filtro.toLowerCase();
      const matchBusca = !termo || s.nome.toLowerCase().includes(termo) || s.cidade.toLowerCase().includes(termo);
      const matchTipo = filtroTipo === 'todos' || s.tipo === filtroTipo;
      return matchBusca && matchTipo;
    });
  }, [filtro, filtroTipo]);

  const stats = useMemo(() => {
    const total = servicosMock.length;
    const porCidade = servicosMock.reduce((acc, s) => {
      acc[s.cidade] = (acc[s.cidade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const top5 = Object.entries(porCidade).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { total, top5 };
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Serviços</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gerencie todos os serviços cadastrados</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total de Serviços</p>
          <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Top 5 Cidades</p>
          <div className="mt-2 space-y-1">
            {stats.top5.map(([cidade, count]) => (
              <div key={cidade} className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">{cidade}</span>
                <span className="font-bold text-slate-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
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
        <span className="text-sm text-slate-500 dark:text-slate-400">{servicos.length} serviços</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400">Cidade</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400">Contato</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.map((servico) => (
              <tr key={servico.id} className="border-b border-slate-50 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {servico.tipo === 'veterinario' ? '🩺' :
                       servico.tipo === 'petshop' ? '🛁' :
                       servico.tipo === 'creche' ? '🏫' :
                       servico.tipo === 'parque' ? '🌳' : '🐾'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{servico.nome}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 capitalize dark:bg-slate-800 dark:text-slate-300">{servico.tipo}</span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{servico.cidade}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    {servico.telefone && <span title={servico.telefone}>📱</span>}
                    {servico.instagram && <span title={`@${servico.instagram}`}>📸</span>}
                    {servico.website && <span title={servico.website}>🌐</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditando(servico)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {servicos.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-lg font-bold text-slate-400">Nenhum serviço encontrado</p>
        </div>
      )}

      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setEditando(null)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{editando.nome}</h2>
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
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Instagram</label>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{editando.instagram ? `@${editando.instagram}` : '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Website</label>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{editando.website || '—'}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Endereço</label>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{editando.endereco || '—'}</p>
              </div>
              {editando.instagram && (
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Instagram Handle</label>
                  <a href={`https://instagram.com/${editando.instagram}`} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
                    @{editando.instagram}
                  </a>
                </div>
              )}
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

export default function AdminServicosPage() {
  return (
    <AdminServicosContent />
  );
}
