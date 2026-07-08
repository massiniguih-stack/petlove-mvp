'use client';

import { useState, useMemo } from 'react';
import { servicosMock, type Servico } from '@/data/servicos';

interface ConviteEnviado {
  id: string;
  canal: string;
  data: string;
}

const canais = [
  { id: 'whatsapp', label: 'WhatsApp', icone: '💬', cor: 'bg-emerald-500' },
  { id: 'email', label: 'Email', icone: '📧', cor: 'bg-blue-500' },
  { id: 'instagram', label: 'Instagram', icone: '📸', cor: 'bg-pink-500' },
];

export default function AdminDispatchPage() {
  const [filtro, setFiltro] = useState('');
  const [canalSelecionado, setCanalSelecionado] = useState('whatsapp');
  const [convitesEnviados, setConvitesEnviados] = useState<ConviteEnviado[]>([]);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [mensagemCopiada, setMensagemCopiada] = useState<string | null>(null);

  const servicos = useMemo(() => {
    return servicosMock.filter((s) => {
      if (!filtro) return true;
      const termo = filtro.toLowerCase();
      return (
        s.nome.toLowerCase().includes(termo) ||
        s.cidade.toLowerCase().includes(termo) ||
        s.tipo.toLowerCase().includes(termo)
      );
    });
  }, [filtro]);

  const servicosComInstagram = useMemo(() => {
    return servicos.filter((s) => s.instagram);
  }, [servicos]);

  const servicosSemInstagram = useMemo(() => {
    return servicos.filter((s) => !s.instagram);
  }, [servicos]);

  const jaEnviados = useMemo(() => {
    return new Set(convitesEnviados.map((c) => c.id));
  }, [convitesEnviados]);

  const gerarMensagem = (servico: Servico) => {
    const nome = servico.nome;
    const cidade = servico.cidade;

    if (canalSelecionado === 'whatsapp') {
      return `🐾 Olá! Somos do PetLove, o app que conecta tutores de pets aos melhores serviços da cidade.

Vi que ${nome} é uma ótima opção para os tutores de ${cidade} e gostaríamos de convidá-la para ser nossa parceira Premium!

✅ Destaque no mapa para toda a cidade
✅ Selo de credibilidade no seu perfil
✅ Acesso a milhares de tutores ativos
✅ Métricas de visualização e contato
✅ Suporte dedicado para seu negócio

🔥 Oferta exclusiva: 50% OFF para novos parceiros!
De R$ 49,90 por apenas R$ 24,90/mês

Quer saber mais? Acesse: petlove.app/parceiros/premium

Estamos à disposição para qualquer dúvida! 😊`;
    }

    if (canalSelecionado === 'email') {
      return `Assunto: Convite para ser Parceiro PetLove — 50% OFF para ${nome}

Prezado(a),

Sou da equipe do PetLove, plataforma que conecta tutores de pets aos melhores serviços veterinários e pet shops do Brasil.

Identificamos que ${nome} seria um parceiro ideal para nossa rede, e gostaríamos de convidá-la a se juntar ao nosso programa de parceiros Premium.

Benefícios do Plano Premium:
• Destaque no topo do mapa para ${cidade}
• Selo de credibilidade no perfil do estabelecimento
• Galeria de até 20 fotos do seu espaço
• Botão de WhatsApp para contato direto
• Painel completo de métricas e analytics
• Suporte prioritário 24 horas

💰 Oferta Especial de Lançamento:
Plano Básico: R$ 24,90/mês (era R$ 49,90)
Plano Profissional: R$ 49,90/mês (era R$ 99,90)
Plano Empresarial: R$ 99,90/mês (era R$ 199,90)

Para se cadastrar, acesse:
https://petlove.app/parceiros/cadastro

Ficamos à disposição para esclarecer qualquer dúvida.

Atenciosamente,
Equipe PetLove
contato@petlove.app`;
    }

    if (canalSelecionado === 'instagram') {
      return `Oi! 👋

Vi o perfil da ${nome} e amei o trabalho de vocês! 🐶🐱

Sou do PetLove, um app que ajuda tutores a encontrarem os melhores serviços para seus pets.

Estamos convidando clínicas e pet shops de ${cidade} para serem nossos parceiros Premium. É uma chance incrível de ganhar visibilidade e atrair novos clientes!

Os benefícios são:
⭐ Destaque no mapa
📸 Galeria de fotos
💬 WhatsApp direto no perfil
📊 Métricas de visualização

E o melhor: estamos com 50% OFF para novos parceiros! Apenas R$ 24,90/mês.

Quer saber mais? Me manda que te explico tudo! 😄`;
    }

    return '';
  };

  const copiarMensagem = (servico: Servico) => {
    const msg = gerarMensagem(servico);
    navigator.clipboard.writeText(msg);
    setMensagemCopiada(servico.id);
    setTimeout(() => setMensagemCopiada(null), 2000);
  };

  const marcarComoEnviado = (servico: Servico) => {
    setEnviando(servico.id);
    setTimeout(() => {
      setConvitesEnviados((prev) => [
        ...prev,
        { id: servico.id, canal: canalSelecionado, data: new Date().toISOString() },
      ]);
      setEnviando(null);
    }, 500);
  };

  const enviarTodos = () => {
    const pendentes = servicos.filter((s) => !jaEnviados.has(s.id));
    pendentes.forEach((s, i) => {
      setTimeout(() => {
        setConvitesEnviados((prev) => [
          ...prev,
          { id: s.id, canal: canalSelecionado, data: new Date().toISOString() },
        ]);
      }, i * 300);
    });
  };

  const stats = useMemo(() => {
    const total = servicos.length;
    const enviados = servicos.filter((s) => jaEnviados.has(s.id)).length;
    const pendentes = total - enviados;
    const comInstagram = servicosComInstagram.length;
    return { total, enviados, pendentes, comInstagram };
  }, [servicos, jaEnviados, servicosComInstagram]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          🚀 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Dispatch</span> de Convites
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Envie convites automaticamente para todas as clínicas cadastradas</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <a href="#lista" className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total de Parceiros</p>
          <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{stats.total}</p>
          <span className="mt-1 inline-block text-[10px] font-bold text-blue-500 opacity-0 transition group-hover:opacity-100">Ver lista →</span>
        </a>
        <a href="#lista" className="group rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-emerald-900 dark:bg-emerald-950 dark:hover:border-emerald-800">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Enviados</p>
          <p className="mt-1 text-3xl font-black text-emerald-700 dark:text-emerald-300">{stats.enviados}</p>
          <span className="mt-1 inline-block text-[10px] font-bold text-emerald-500 opacity-0 transition group-hover:opacity-100">Ver lista →</span>
        </a>
        <a href="#lista" className="group rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-amber-900 dark:bg-amber-950 dark:hover:border-amber-800">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Pendentes</p>
          <p className="mt-1 text-3xl font-black text-amber-700 dark:text-amber-300">{stats.pendentes}</p>
          <span className="mt-1 inline-block text-[10px] font-bold text-amber-500 opacity-0 transition group-hover:opacity-100">Ver lista →</span>
        </a>
        <a href="#lista" className="group rounded-2xl border border-pink-200 bg-pink-50 p-4 shadow-sm transition hover:border-pink-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-pink-900 dark:bg-pink-950 dark:hover:border-pink-800">
          <p className="text-sm font-semibold text-pink-600 dark:text-pink-400">Com Instagram</p>
          <p className="mt-1 text-3xl font-black text-pink-700 dark:text-pink-300">{stats.comInstagram}</p>
          <span className="mt-1 inline-block text-[10px] font-bold text-pink-500 opacity-0 transition group-hover:opacity-100">Ver lista →</span>
        </a>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por nome, cidade ou tipo..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-80 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400"
          />
          <select
            value={canalSelecionado}
            onChange={(e) => setCanalSelecionado(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-blue-400"
          >
            {canais.map((c) => (
              <option key={c.id} value={c.id}>{c.icone} {c.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={enviarTodos}
          disabled={stats.pendentes === 0}
          className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl hover:shadow-blue-500/35 disabled:opacity-50"
        >
          📨 Enviar Todos ({stats.pendentes} pendentes)
        </button>
      </div>

      <div id="lista" className="space-y-3">
        {servicos.map((servico) => {
          const enviado = jaEnviados.has(servico.id);
          return (
            <div
              key={servico.id}
              className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
                enviado ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/50' : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  servico.tipo === 'veterinario' ? 'bg-blue-100 dark:bg-blue-900' :
                  servico.tipo === 'petshop' ? 'bg-purple-100 dark:bg-purple-900' :
                  servico.tipo === 'parque' ? 'bg-green-100 dark:bg-green-900' :
                  servico.tipo === 'creche' ? 'bg-amber-100 dark:bg-amber-900' :
                  'bg-slate-100 dark:bg-slate-800'
                }`}>
                  <span className="text-xl">
                    {servico.tipo === 'veterinario' ? '🩺' :
                     servico.tipo === 'petshop' ? '🛁' :
                     servico.tipo === 'parque' ? '🌳' :
                     servico.tipo === 'creche' ? '🏫' : '🐾'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{servico.nome}</h3>
                    {servico.instagram && (
                      <span className="shrink-0 rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-600 dark:bg-pink-900 dark:text-pink-400">
                        📸 @{servico.instagram}
                      </span>
                    )}
                    {enviado && (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400">
                        ✓ Enviado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                    {servico.tipo} · {servico.cidade} · {servico.telefone || 'Sem telefone'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copiarMensagem(servico)}
                    disabled={enviado}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                      mensagemCopiada === servico.id
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400'
                        : enviado
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    {mensagemCopiada === servico.id ? '✓ Copiado' : '📋 Copiar'}
                  </button>
                  {!enviado && (
                    <button
                      onClick={() => marcarComoEnviado(servico)}
                      disabled={enviando === servico.id}
                      className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-2 text-xs font-bold text-white shadow transition hover:shadow-md disabled:opacity-50"
                    >
                      {enviando === servico.id ? '...' : '📤 Enviar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {servicos.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-lg font-bold text-slate-400">Nenhum parceiro encontrado</p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Tente ajustar os filtros de busca</p>
        </div>
      )}
    </div>
  );
}
