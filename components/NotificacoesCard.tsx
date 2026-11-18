'use client';

import { useState } from 'react';
import { useNotifications } from '@/lib/useNotifications';

// Situação das notificações NESTE aparelho + botão de teste. Fica na página
// da conta para o tutor (e a equipe) conferir que os lembretes chegam.
export function NotificacoesCard() {
  const { permission, suporte, loading, erro, requestPermission, enviarTeste } = useNotifications();
  const [testando, setTestando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; mensagem: string } | null>(null);

  const testar = async () => {
    setTestando(true);
    setResultado(null);
    try {
      setResultado(await enviarTeste());
    } catch {
      setResultado({ ok: false, mensagem: 'Não consegui enviar o teste.' });
    } finally {
      setTestando(false);
    }
  };

  let situacao: { texto: string; cor: string };
  if (suporte === 'verificando') situacao = { texto: 'Verificando…', cor: 'text-slate-500 dark:text-slate-400' };
  else if (suporte === 'instalar-no-iphone') situacao = { texto: 'Instale o app para ativar', cor: 'text-amber-700 dark:text-amber-300' };
  else if (suporte === 'nao') situacao = { texto: 'Este navegador não recebe notificações', cor: 'text-slate-500 dark:text-slate-400' };
  else if (permission === 'granted') situacao = { texto: 'Ativas neste aparelho', cor: 'text-emerald-700 dark:text-emerald-300' };
  else if (permission === 'denied') situacao = { texto: 'Bloqueadas neste aparelho', cor: 'text-red-600 dark:text-red-300' };
  else situacao = { texto: 'Desativadas', cor: 'text-slate-500 dark:text-slate-400' };

  return (
    <section
      data-testid="notificacoes-card"
      className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
      aria-label="Notificações"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Notificações</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Lembretes de vacina no celular.</p>
        </div>
        <span data-testid="notificacoes-situacao" className={`text-right text-xs font-semibold ${situacao.cor}`}>
          {situacao.texto}
        </span>
      </div>

      {suporte === 'instalar-no-iphone' && (
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          No iPhone, as notificações só funcionam com o Patinha na tela de início: toque em{' '}
          <strong>Compartilhar</strong> → <strong>Adicionar à Tela de Início</strong>, abra o Patinha por lá e
          volte aqui para ativar.
        </p>
      )}

      {suporte === 'sim' && permission === 'denied' && (
        <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
          Para desbloquear, abra as configurações do site no navegador (ícone ao lado do endereço) e permita
          notificações. Depois recarregue esta página.
        </p>
      )}

      {suporte === 'sim' && permission === 'default' && (
        <button
          type="button"
          onClick={requestPermission}
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {loading ? 'Ativando…' : 'Ativar notificações'}
        </button>
      )}

      {suporte === 'sim' && permission === 'granted' && (
        <button
          type="button"
          onClick={testar}
          disabled={testando}
          className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {testando ? 'Enviando…' : 'Enviar notificação de teste'}
        </button>
      )}

      {(erro || resultado) && (
        <p
          role="status"
          className={`mt-2 text-xs ${resultado?.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'}`}
        >
          {resultado?.mensagem || erro}
        </p>
      )}
    </section>
  );
}
