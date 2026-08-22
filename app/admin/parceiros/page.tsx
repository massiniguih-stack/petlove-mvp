'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { emojiServico } from '@/lib/tiposServico';
import { buildPartnerWhatsAppUrl } from '@/lib/partner-invite-messages';

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
  return buildPartnerWhatsAppUrl(parceiro.telefone, {
    nome: parceiro.nome,
    cidade: parceiro.cidade,
  });
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
  const [limpandoWhatsapp, setLimpandoWhatsapp] = useState(false);

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
    if (!url) {
      setMensagem(
        `Telefone inválido em “${parceiro.nome}” (${parceiro.telefone || 'vazio'}). Use só números com DDD (ex.: 11999998888) ou Pular na fila.`
      );
      return;
    }
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      // Brave/pop-up: tenta na mesma aba de fallback
      window.location.href = url;
      return;
    }
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

  // Fila: lista filtrada, telefone com ≥10 dígitos (evita "sadsa"), não contatado.
  const filaPendentes = useMemo(() => {
    return parceiros.filter((p) => {
      const digitos = (p.telefone || '').replace(/\D/g, '');
      return digitos.length >= 10 && !p.whatsapp_contatado_em && !puladosNaFila.has(p.id);
    });
  }, [parceiros, puladosNaFila]);

  const iniciarFila = () => {
    setPuladosNaFila(new Set());
    setFilaAtiva(true);
  };

  const limparMarcasWhatsapp = async () => {
    if (!confirm('Desmarcar TODOS os WhatsApp como “contatado”? A fila volta do zero.')) return;
    setLimpandoWhatsapp(true);
    setMensagem(null);
    try {
      const res = await fetch('/api/admin/import-partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limparWhatsappTodos: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setPartners((prev) => prev.map((p) => ({ ...p, whatsapp_contatado_em: null })));
        setPuladosNaFila(new Set());
        setMensagem(`✓ WhatsApp desmarcado em ${data.cleared ?? 0} parceiro(s) — fila liberada`);
      } else {
        setMensagem(data.error || 'Erro ao desmarcar WhatsApp');
      }
    } catch {
      setMensagem('Erro ao desmarcar WhatsApp');
    } finally {
      setLimpandoWhatsapp(false);
    }
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

  const inputClass =
    'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800';

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Parceiros
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {loading ? 'Carregando…' : `${stats.total} no mapa`}
            {!loading && (
              <span className="text-slate-400">
                {' '}
                · {stats.pendentesComEmail} convite pendente
                {' · '}
                {filaPendentes.length} WhatsApp na fila
              </span>
            )}
          </p>
          {mensagem && (
            <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">{mensagem}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={iniciarFila}
            disabled={filaPendentes.length === 0}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-40"
          >
            Fila WhatsApp ({filaPendentes.length})
          </button>
          <button
            onClick={enviarLotePendentes}
            disabled={enviandoLote || stats.pendentesComEmail === 0}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {enviandoLote ? 'Enviando…' : `E-mails (${stats.pendentesComEmail})`}
          </button>
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
              Mais
            </summary>
            <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <button
                type="button"
                onClick={importarParaBanco}
                disabled={importando}
                className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {importando ? 'Importando…' : 'Importar dados de exemplo'}
              </button>
              <button
                type="button"
                onClick={limparMarcasWhatsapp}
                disabled={limpandoWhatsapp || stats.contatadosWhatsapp === 0}
                className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {limpandoWhatsapp ? '…' : `Zerar marcas WhatsApp (${stats.contatadosWhatsapp})`}
              </button>
            </div>
          </details>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar nome ou cidade…"
          className={`${inputClass} w-full sm:min-w-[200px] sm:flex-1`}
        />
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className={inputClass}>
          <option value="todos">Tipo</option>
          <option value="veterinario">Veterinário</option>
          <option value="petshop">Pet Shop</option>
          <option value="creche">Creche</option>
          <option value="parque">Parque</option>
          <option value="hotel">Hotel</option>
        </select>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className={inputClass}>
          <option value="todos">E-mail</option>
          <option value="pendente">Pendente</option>
          <option value="enviado">Enviado</option>
          <option value="sem_email">Sem e-mail</option>
        </select>
        <select value={filtroWhatsapp} onChange={(e) => setFiltroWhatsapp(e.target.value)} className={inputClass}>
          <option value="todos">WhatsApp</option>
          <option value="pendente">Falta contatar</option>
          <option value="contatado">Já contatado</option>
        </select>
        <span className="text-xs text-slate-400 sm:ml-1">{parceiros.length} na lista</span>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600" />
        </div>
      ) : parceiros.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-500">Nenhum parceiro neste filtro</p>
          {stats.total === 0 && (
            <p className="mt-1 text-xs text-slate-400">Use “Mais → Importar dados de exemplo” se o banco estiver vazio.</p>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {parceiros.map((parceiro, i) => {
            const enviado = parceiro.status === 'sent';
            return (
              <div
                key={parceiro.id}
                className={`flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                  i > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''
                }`}
              >
                <span className="text-lg opacity-80" title={parceiro.tipo}>
                  {emojiServico(parceiro.tipo)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditando(parceiro);
                    setEmailEditando(parceiro.email || '');
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {parceiro.nome}
                    </span>
                    {parceiro.premium && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                        Premium
                      </span>
                    )}
                    {enviado ? (
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">e-mail ok</span>
                    ) : parceiro.email ? (
                      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">e-mail pendente</span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">sem e-mail</span>
                    )}
                    {parceiro.whatsapp_contatado_em && (
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">WhatsApp ok</span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {[parceiro.cidade, parceiro.email || null].filter(Boolean).join(' · ')}
                  </p>
                </button>
                <div className="flex shrink-0 items-center gap-1.5">
                  {parceiro.telefone && (
                    <button
                      type="button"
                      onClick={() => contatarWhatsapp(parceiro)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                        parceiro.whatsapp_contatado_em
                          ? 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500'
                      }`}
                    >
                      WhatsApp
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditando(parceiro);
                      setEmailEditando(parceiro.email || '');
                    }}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Abrir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal editar */}
      {editando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onClick={() => setEditando(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{editando.nome}</h2>
                <p className="mt-0.5 text-xs text-slate-500 capitalize">
                  {editando.tipo} · {editando.cidade || '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Telefone</dt>
                <dd className="font-medium text-slate-900 dark:text-white">{editando.telefone || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Endereço</dt>
                <dd className="max-w-[60%] text-right font-medium text-slate-900 dark:text-white">
                  {editando.endereco || '—'}
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <label className="text-xs font-semibold text-slate-500">E-mail do convite</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="email"
                  value={emailEditando}
                  onChange={(e) => setEmailEditando(e.target.value)}
                  placeholder="contato@clinica.com.br"
                  className={`${inputClass} min-w-0 flex-1`}
                />
                <button
                  type="button"
                  onClick={salvarEmail}
                  disabled={salvandoEmail}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
                >
                  {salvandoEmail ? '…' : 'Salvar'}
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              {editando.telefone && (
                <button
                  type="button"
                  onClick={() => contatarWhatsapp(editando)}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-500"
                >
                  WhatsApp
                </button>
              )}
              <button
                type="button"
                onClick={() => enviarConviteUnico(editando.id)}
                disabled={!editando.email || enviandoId === editando.id}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {enviandoId === editando.id
                  ? '…'
                  : editando.status === 'sent'
                    ? 'Reenviar e-mail'
                    : 'Enviar e-mail'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal fila */}
      {filaAtiva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Fila WhatsApp</h2>
              <button
                type="button"
                onClick={() => setFilaAtiva(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {filaPendentes.length === 0 ? (
              <div className="mt-8 text-center">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Fila vazia</p>
                <p className="mt-1 text-xs text-slate-500">Ninguém pendente neste filtro.</p>
                <button
                  type="button"
                  onClick={() => setFilaAtiva(false)}
                  className="mt-5 w-full rounded-xl bg-slate-100 py-2.5 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <p className="mt-1 text-xs text-slate-400">{filaPendentes.length} restante(s)</p>
                <div className="mt-5 rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/80">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{filaPendentes[0].nome}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {filaPendentes[0].cidade || '—'} · {filaPendentes[0].telefone}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => pularNaFila(filaPendentes[0].id)}
                    disabled={contatandoFila}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
                  >
                    Pular
                  </button>
                  <button
                    type="button"
                    onClick={() => contatarNaFila(filaPendentes[0])}
                    disabled={contatandoFila}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {contatandoFila ? '…' : 'Contatar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
