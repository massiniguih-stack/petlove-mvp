'use client';

import { useState, useEffect } from 'react';

interface Tutor {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  endereco: string | null;
  created_at: string;
}

export default function AdminUsuariosPage() {
  const [filtro, setFiltro] = useState('');
  const [usuarios, setUsuarios] = useState<Tutor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);
  const limit = 50;

  const carregarUsuarios = () => {
    setCarregando(true);
    fetch(`/api/admin/usuarios?page=${page}&limit=${limit}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          setUsuarios(data.data);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        } else if (Array.isArray(data)) {
          setUsuarios(data);
        } else {
          setErro(data.error || 'Erro ao carregar');
        }
      })
      .catch(() => setErro('Erro de conexao'))
      .finally(() => setCarregando(false));
  };

  useEffect(carregarUsuarios, [page]);

  const excluirUsuario = async (id: string) => {
    if (confirmandoId !== id) {
      setConfirmandoId(id);
      setTimeout(() => setConfirmandoId((atual) => (atual === id ? null : atual)), 4000);
      return;
    }
    setConfirmandoId(null);
    setExcluindoId(id);
    setErroExclusao(null);
    try {
      const res = await fetch(`/api/admin/usuarios?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsuarios((prev) => prev.filter((u) => u.id !== id));
        setTotal((t) => Math.max(0, t - 1));
      } else {
        const data = await res.json().catch(() => ({}));
        setErroExclusao(data.error || 'Erro ao excluir usuário');
      }
    } catch {
      setErroExclusao('Erro de conexão ao excluir usuário');
    } finally {
      setExcluindoId(null);
    }
  };

  const filtrados = usuarios.filter((u) => {
    const termo = filtro.toLowerCase();
    return !termo || u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo) || (u.telefone && u.telefone.includes(termo));
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Usuarios</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Todos os usuarios cadastrados no app</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total</p>
          <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Com telefone</p>
          <p className="mt-1 text-3xl font-black text-emerald-700 dark:text-emerald-300">{usuarios.filter((u) => u.telefone).length}</p>
        </div>
      </div>

      {erroExclusao && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">{erroExclusao}</p>
          <button onClick={() => setErroExclusao(null)} className="text-xs font-bold text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por nome, email ou telefone..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-96 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400"
        />
        <span className="text-sm text-slate-500 dark:text-slate-400">{filtrados.length} usuarios</span>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : erro ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-sm font-bold text-red-700 dark:text-red-400">{erro}</p>
          <p className="mt-2 text-xs text-red-600 dark:text-red-500">Verifique as politicas RLS no Supabase.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400">Telefone</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400">Cadastro</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-bold text-white">
                        {u.nome?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{u.nome || 'Sem nome'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{u.telefone || '-'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(u.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => excluirUsuario(u.id)}
                      disabled={excluindoId === u.id}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                        confirmandoId === u.id
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-red-950 dark:hover:text-red-400'
                      }`}
                    >
                      {excluindoId === u.id ? '...' : confirmandoId === u.id ? 'Confirmar exclusão' : '🗑️ Excluir'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!carregando && !erro && filtrados.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-4xl">👥</p>
          <p className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Nenhum usuario encontrado</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{usuarios.length === 0 ? 'Aguarde usuarios se cadastrarem no app.' : 'Tente outro filtro de busca.'}</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pagina {page} de {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Proxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
