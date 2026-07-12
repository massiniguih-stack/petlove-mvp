'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_premium: boolean;
  email_confirmed: boolean;
}

type FilterType = 'all' | 'new' | 'premium' | 'inactive';

export default function AdminEmailsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }

  function getFilteredUsers() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'new':
        return users.filter(u => new Date(u.created_at) > sevenDaysAgo);
      case 'premium':
        return users.filter(u => u.is_premium);
      case 'inactive':
        return users.filter(u => !u.last_sign_in_at || new Date(u.last_sign_in_at) < sevenDaysAgo);
      default:
        return users;
    }
  }

  async function sendEmail(to: string, type: string, subject?: string, html?: string) {
    setSending(to);
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, to, subject, html }),
      });
      setSent(prev => [...prev, to]);
    } catch (err) {
      console.error('Failed to send email:', err);
    } finally {
      setSending(null);
    }
  }

  async function sendBulk(type: string) {
    const filtered = getFilteredUsers();
    for (const user of filtered) {
      if (!sent.includes(user.email)) {
        await sendEmail(user.email, type);
      }
    }
  }

  async function sendCustomBulk() {
    const filtered = getFilteredUsers();
    for (const user of filtered) {
      if (!sent.includes(user.email)) {
        await sendEmail(user.email, 'email', customSubject, customBody);
      }
    }
    setCustomSubject('');
    setCustomBody('');
    setShowCustom(false);
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Emails</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Envie emails para seus usuarios</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total</p>
          <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Novos (7 dias)</p>
          <p className="mt-1 text-3xl font-black text-blue-700 dark:text-blue-300">
            {users.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
          </p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950">
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">Premium</p>
          <p className="mt-1 text-3xl font-black text-violet-700 dark:text-violet-300">
            {users.filter(u => u.is_premium).length}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Inativos</p>
          <p className="mt-1 text-3xl font-black text-amber-700 dark:text-amber-300">
            {users.filter(u => !u.last_sign_in_at || new Date(u.last_sign_in_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: 'all' as FilterType, label: 'Todos' },
          { key: 'new' as FilterType, label: 'Novos (7 dias)' },
          { key: 'premium' as FilterType, label: 'Premium' },
          { key: 'inactive' as FilterType, label: 'Inativos' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              filter === f.key
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => sendBulk('welcome')}
          disabled={sending !== null}
          className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl disabled:opacity-50"
        >
          {sending ? 'Enviando...' : `✉️ Enviar boas-vindas (${filteredUsers.length})`}
        </button>
        <button
          onClick={() => sendBulk('premium')}
          disabled={sending !== null}
          className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl disabled:opacity-50"
        >
          {sending ? 'Enviando...' : `⭐ Enviar premium (${filteredUsers.length})`}
        </button>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ✏️ Email personalizado
        </button>
      </div>

      {/* Custom Email Form */}
      {showCustom && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Email personalizado</h3>
          <input
            type="text"
            placeholder="Assunto"
            value={customSubject}
            onChange={e => setCustomSubject(e.target.value)}
            className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <textarea
            placeholder="Conteudo do email (HTML permitido)"
            value={customBody}
            onChange={e => setCustomBody(e.target.value)}
            rows={6}
            className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <div className="flex gap-3">
            <button
              onClick={sendCustomBulk}
              disabled={!customSubject || !customBody || sending !== null}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:shadow-xl disabled:opacity-50"
            >
              {sending ? 'Enviando...' : `📤 Enviar para ${filteredUsers.length} usuarios`}
            </button>
            <button
              onClick={() => setShowCustom(false)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-800">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {filteredUsers.length} usuarios
          </p>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Nenhum usuario encontrado</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between px-6 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-bold text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.email}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cadastro: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      {user.last_sign_in_at && ` · Ultimo login: ${new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user.is_premium && (
                    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                      ⭐ Premium
                    </span>
                  )}
                  {sent.includes(user.email) ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300">
                      ✓ Enviado
                    </span>
                  ) : (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => sendEmail(user.email, 'welcome')}
                        disabled={sending === user.email}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-900 dark:text-blue-300"
                        title="Enviar boas-vindas"
                      >
                        {sending === user.email ? '...' : '✉️'}
                      </button>
                      <button
                        onClick={() => sendEmail(user.email, 'premium')}
                        disabled={sending === user.email}
                        className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-600 transition hover:bg-violet-100 disabled:opacity-50 dark:bg-violet-900 dark:text-violet-300"
                        title="Enviar premium"
                      >
                        {sending === user.email ? '...' : '⭐'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
