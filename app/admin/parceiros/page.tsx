'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { emojiServico } from '@/lib/tiposServico';

interface Partner {
  id: string;
  tipo: string;
  nome: string;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  telefone: string | null;
  instagram: string | null;
  website: string | null;
  avaliacao: number | null;
  premium: boolean;
  destaque: boolean;
  status: string;
  sent_at: string | null;
  email: string | null;
  whatsapp_contatado_em: string | null;
}

function linkWhatsapp(parceiro: Partner): string | null {
  if (!parceiro.telefone) return null;
  const digitos = parceiro.telefone.replace(/\D/g, '');
  const numero = digitos.startsWith('55') ? digitos : `55${digitos}`;
  const pata = '\u{1F43E}';
  const check = '✅';
  const fogo = '\u{1F525}';
  const sorriso = '\u{1F60A}';
  const mensagem = `${pata} Olá! Somos do Patinha, o app que conecta tutores de pets aos melhores serviços da cidade.\n\nVi que a ${parceiro.nome} é uma ótima opção para os tutores de ${parceiro.cidade || 'sua região'} e gostaríamos de convidá-la para ser nossa parceira Premium!\n\n${check} Destaque no mapa\n${check} Selo de credibilidade\n${check} Acesso a milhares de tutores ativos\n\n${fogo} 50% OFF pra novos parceiros: patinha.app/parceiros/premium\n\nEstamos à disposição! ${sorriso}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export default function AdminParceirosPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroWhatsapp, setFiltroWhatsapp] = useState('todos');
  const [editando, setEditando] = useState<Partner | null>(null);
  const [emailEditando, setEmailEditando] = useState('');
  const [salvandoEmail, setSalvandoEmail] = useState(false);
  const [enviandoId, setEnviandoId] = useState<string | null>(null);
  const [enviandoLote, setEnviandoLote] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [importando, setImportando] = useState(false);
  const [filaAtiva, setFilaAtiva] = useState(false);
  const [puladosNaFila, setPuladosNaFila] = useState<Set<string>>(new Set());
  const [contatandoFila, setContatandoFila] = useState(false);

  const carregarParceiros = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/import-partners?limit=500');
      const data = await res.json();
      const todos: Partner[] = Object.values(data.partners || {}).flat() as Partner[];
      todos.sort((a, b) => a.nome.localeCompare(b.nome));
      setPartners(todos);
    } catch {
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarParceiros();
  }, [carregarParceiros]);

  const importarParaBanco = async () => {
    setImportando(true);
    setMensagem(null);
    try {
      const res = await fetch('/api/admin/import-partners', { method: 'POST' });
      const data = await res.json();
      setMensagem(res.ok ? `✓ ${data.imported} parceiros importados` : data.error || 'Erro ao importar');
    } catch {
      setMensagem('Erro ao importar');
    } finally {
      setImportando(false);
      carregarParceiros();
    }
  };

  const salvarEmail = async () => {
    if (!editando) return;
    setSalvandoEmail(true);
    try {
      const res = await fetch('/api/admin/import-partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editando.id, email: emailEditando || null }),
      });
      if (res.ok) {
        setPartners((prev) => prev.map((p) => (p.id === editando.id ? { ...p, email: emailEditando || null } : p)));
        setEditando({ ...editando, email: emailEditando || null });
        setMensagem('✓ Email salvo');
      } else {
        setMensagem('Erro ao salvar email');
      }
    } catch {
      setMensagem('Erro ao salvar email');
    } finally {
      setSalvandoEmail(false);
    }
  };

  const enviarConvite = async (ids: string[]) => {
    try {
      const res = await fetch('/api/admin/partners/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (res.ok) {
        const marcarEnviado = (p: Partner) => (ids.includes(p.id) && p.email ? { ...p, status: 'sent', sent_at: new Date().toISOString() } : p);
        setPartners((prev) => prev.map(marcarEnviado));
        setEditando((prev) => (prev ? marcarEnviado(prev) : prev));
        setMensagem(`✓ ${data.sent} convite(s) enviado(s)${data.skipped ? `, ${data.skipped} sem email` : ''}${data.failed ? `, ${data.failed} falharam` : ''}`);
      } else {
        setMensagem(data.error || 'Erro ao enviar convite');
      }
    } catch {
      setMensagem('Erro ao enviar convite');
    }
  };

  const enviarConviteUnico = async (id: string) => {
    setEnviandoId(id);
    await enviarConvite([id]);
    setEnviandoId(null);
  };

  const contatarWhatsapp = async (parceiro: Partner) => {
    const url = linkWhatsapp(parceiro);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
    try {
      await fetch('/api/admin/import-partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parceiro.id, marcarWhatsapp: true }),
      });
      const agora = new Date().toISOString();
      setPartners((prev) => prev.map((p) => (p.id === parceiro.id ? { ...p, whatsapp_contatado_em: agora } : p)));
      setEditando((prev) => (prev && prev.id === parceiro.id ? { ...prev, whatsapp_contatado_em: agora } : prev));
    } catch {
      // abrir o WhatsApp já é o que importa; se o registro falhar, sem problema
    }
  };

  const parceiros = useMemo(() => {
    return partners.filter((p) => {
      const termo = filtro.toLowerCase();
      const matchBusca = !termo || p.nome.toLowerCase().includes(termo) || (p.cidade || '').toLowerCase().includes(termo);
      const matchTipo = filtroTipo === 'todos' || p.tipo === filtroTipo;
      const matchStatus =
        filtroStatus === 'todos' ||
        (filtroStatus === 'pendente' && p.status !== 'sent') ||
        (filtroStatus === 'enviado' && p.status === 'sent') ||
        (filtroStatus === 'sem_email' && !p.email);
      const matchWhatsapp =
        filtroWhatsapp === 'todos' ||
        (filtroWhatsapp === 'contatado' && !!p.whatsapp_contatado_em) ||
        (filtroWhatsapp === 'pendente' && p.telefone && !p.whatsapp_contatado_em);
      return matchBusca && matchTipo && matchStatus && matchWhatsapp;
    });
  }, [partners, filtro, filtroTipo, filtroStatus, filtroWhatsapp]);

  const stats = useMemo(() => {
    const total = partners.length;
    const comEmail = partners.filter((p) => p.email).length;
    const enviados = partners.filter((p) => p.status === 'sent').length;
    const pendentesComEmail = partners.filter((p) => p.status !== 'sent' && p.email).length;
    const comTelefone = partners.filter((p) => p.telefone).length;
    const contatadosWhatsapp = partners.filter((p) => p.whatsapp_contatado_em).length;
    return { total, comEmail, enviados, pendentesComEmail, comTelefone, contatadosWhatsapp };
  }, [partners]);

  // Fila: usa a mesma lista já filtrada (busca/tipo), restrita a quem tem
  // telefone e ainda não foi contatado — e vai sumindo sozinha conforme
  // contatarWhatsapp() marca cada um, sem precisar voltar pra lista.
  const filaPendentes = useMemo(() => {
    return parceiros.filter((p) => p.telefone && !p.whatsapp_contatado_em && !puladosNaFila.has(p.id));
  }, [parceiros, puladosNaFila]);

  const iniciarFila = () => {
    setPuladosNaFila(new Set());
    setFilaAtiva(true);
  };

  const contatarNaFila = async (parceiro: Partner) => {
    setContatandoFila(true);
    await contatarWhatsapp(parceiro);
    setContatandoFila(false);
  };

  const pularNaFila = (id: string) => {
    setPuladosNaFila((prev) => new Set(prev).add(id));
  };

  const enviarLotePendentes = async () => {
    const ids = parceiros.filter((p) => p.status !== 'sent' && p.email).map((p) => p.id);
    if (ids.length === 0) {
      setMensagem('Nenhum parceiro pendente com email na lista filtrada');
      return;
    }
    setEnviandoLote(true);
    await enviarConvite(ids);
    setEnviandoLote(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Parceiros</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gerencie os parceiros cadastrados no banco de dados</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
            {loading ? 'Carregando...' : `${stats.total} parceiros no banco (mesma fonte do /mapa)`}
          </p>
          {mensagem && <p className="mt-1 text-xs font-semibold text-blue-900 dark:text-blue-200">{mensagem}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={enviarLotePendentes}
            disabled={enviandoLote || stats.pendentesComEmail === 0}
            className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
          >
            {enviandoLote ? 'Enviando...' : `📤 Enviar convites pendentes (${stats.pendentesComEmail})`}
          </button>
          <button
            onClick={importarParaBanco}
            disabled={importando}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
          >
            {importando ? '...' : '⬆️ Importar dados de exemplo'}
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total</p>
          <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm dark:border-emerald-900 dark:from-emerald-950 dark:to-teal-950">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">✓ Convite enviado</p>
          <p className="mt-1 text-3xl font-black text-emerald-700 dark:text-emerald-300">{stats.enviados}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm dark:border-amber-900 dark:from-amber-950 dark:to-orange-950">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">⏳ Pendente com email</p>
          <p className="mt-1 text-3xl font-black text-amber-700 dark:text-amber-300">{stats.pendentesComEmail}</p>
        </div>
        <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4 shadow-sm dark:border-pink-900 dark:bg-pink-950">
          <p className="text-sm font-semibold text-pink-600 dark:text-pink-400">✉️ Com email cadastrado</p>
          <p className="mt-1 text-3xl font-black text-pink-700 dark:text-pink-300">{stats.comEmail}</p>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm dark:border-green-900 dark:bg-green-950">
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">💬 Contatados no WhatsApp</p>
          <p className="mt-1 text-3xl font-black text-green-700 dark:text-green-300">{stats.contatadosWhatsapp} <span className="text-base font-bold text-green-500">/ {stats.comTelefone}</span></p>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={iniciarFila}
          disabled={filaPendentes.length === 0}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md disabled:opacity-40"
        >
          🚀 Iniciar fila de WhatsApp ({filaPendentes.length} pendente{filaPendentes.length === 1 ? '' : 's'} nesse filtro)
        </button>
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
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-blue-400"
        >
          <option value="todos">Todos os status</option>
          <option value="pendente">⏳ Pendente</option>
          <option value="enviado">✓ Convite enviado</option>
          <option value="sem_email">Sem email</option>
        </select>
        <select
          value={filtroWhatsapp}
          onChange={(e) => setFiltroWhatsapp(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-blue-400"
        >
          <option value="todos">WhatsApp: todos</option>
          <option value="pendente">💬 Falta contatar</option>
          <option value="contatado">✓ Já contatado</option>
        </select>
        <span className="text-sm text-slate-500 dark:text-slate-400">{parceiros.length} parceiros</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {parceiros.map((parceiro) => {
            const enviado = parceiro.status === 'sent';
            return (
              <div
                key={parceiro.id}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <span className="text-xl">{emojiServico(parceiro.tipo)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold truncate text-slate-900 dark:text-white">{parceiro.nome}</h3>
                    {enviado ? (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300">✓ Enviado</span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-900 dark:text-amber-300">⏳ Pendente</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                    {parceiro.tipo} · {parceiro.cidade} · {parceiro.email || 'sem email cadastrado'}
                  </p>
                </div>

                <button
                  onClick={() => { setEditando(parceiro); setEmailEditando(parceiro.email || ''); }}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => enviarConviteUnico(parceiro.id)}
                  disabled={!parceiro.email || enviandoId === parceiro.id}
                  className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-600 transition hover:bg-amber-100 disabled:opacity-40 dark:bg-amber-900 dark:text-amber-300"
                >
                  {enviandoId === parceiro.id ? '...' : enviado ? 'Reenviar' : '📤 Enviar'}
                </button>
                {parceiro.telefone && (
                  <button
                    onClick={() => contatarWhatsapp(parceiro)}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                      parceiro.whatsapp_contatado_em
                        ? 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-950 dark:text-green-400'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                  >
                    {parceiro.whatsapp_contatado_em ? '✓ WhatsApp' : '💬 WhatsApp'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && parceiros.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-lg font-bold text-slate-400">Nenhum parceiro encontrado</p>
          {stats.total === 0 && (
            <p className="mt-2 text-sm text-slate-400">O banco está vazio — clique em &quot;Importar dados de exemplo&quot; acima.</p>
          )}
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
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Website</label>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{editando.website || '—'}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Endereço</label>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{editando.endereco || '—'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Email para convite</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="email"
                    value={emailEditando}
                    onChange={(e) => setEmailEditando(e.target.value)}
                    placeholder="contato@clinica.com.br"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    onClick={salvarEmail}
                    disabled={salvandoEmail}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {salvandoEmail ? '...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setEditando(null)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                Fechar
              </button>
              <button
                onClick={() => enviarConviteUnico(editando.id)}
                disabled={!editando.email || enviandoId === editando.id}
                className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-40"
              >
                {enviandoId === editando.id ? 'Enviando...' : editando.status === 'sent' ? 'Reenviar convite' : '📤 Enviar convite'}
              </button>
              {editando.telefone && (
                <button
                  onClick={() => contatarWhatsapp(editando)}
                  className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
                >
                  {editando.whatsapp_contatado_em ? '✓ Abrir WhatsApp de novo' : '💬 WhatsApp'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {filaAtiva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">🚀 Fila de WhatsApp</h2>
              <button
                onClick={() => setFilaAtiva(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            {filaPendentes.length === 0 ? (
              <div className="mt-8 text-center">
                <p className="text-4xl">🎉</p>
                <p className="mt-3 text-lg font-bold text-slate-900 dark:text-white">Fila concluída!</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Não sobrou ninguém pendente nesse filtro.</p>
                <button
                  onClick={() => setFilaAtiva(false)}
                  className="mt-6 w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">{filaPendentes.length} restante{filaPendentes.length === 1 ? '' : 's'}</p>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-700 dark:bg-slate-800">
                  <span className="text-3xl">{emojiServico(filaPendentes[0].tipo)}</span>
                  <h3 className="mt-2 text-lg font-black text-slate-900 dark:text-white">{filaPendentes[0].nome}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {filaPendentes[0].tipo} · {filaPendentes[0].cidade || 'sem cidade'}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">📱 {filaPendentes[0].telefone}</p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => pularNaFila(filaPendentes[0].id)}
                    disabled={contatandoFila}
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    ⏭️ Pular
                  </button>
                  <button
                    onClick={() => contatarNaFila(filaPendentes[0])}
                    disabled={contatandoFila}
                    className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                  >
                    {contatandoFila ? '...' : '💬 Contatar via WhatsApp'}
                  </button>
                </div>
                <p className="mt-3 text-center text-[11px] text-slate-400 dark:text-slate-500">
                  Abre o WhatsApp numa aba nova, marca como contatado e passa pro próximo sozinho.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
