'use client';

import { useState } from 'react';
import { useNotifications } from '@/lib/useNotifications';

// Situação das notificações NESTE aparelho + botão de teste. Fica na página
// da conta para o tutor (e a equipe) conferir que os lembretes chegam.
export function NotificacoesCard() {
  const { permission, suporte, token, loading, erro, aparelho, requestPermission, enviarTeste } = useNotifications();
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
  else if (permission === 'granted' && token) situacao = { texto: 'Ativas neste aparelho', cor: 'text-emerald-700 dark:text-emerald-300' };
  else if (permission === 'granted' && loading) situacao = { texto: 'Conectando…', cor: 'text-slate-500 dark:text-slate-400' };
  else if (permission === 'granted') situacao = { texto: 'Permitidas, mas não conectadas', cor: 'text-amber-700 dark:text-amber-300' };
  else if (permission === 'denied') situacao = { texto: 'Bloqueadas neste aparelho', cor: 'text-red-600 dark:text-red-300' };
  else situacao = { texto: 'Ainda não ativadas', cor: 'text-slate-500 dark:text-slate-400' };

  const conectadas = suporte === 'sim' && permission === 'granted' && !!token;
  const precisaTentarDeNovo = suporte === 'sim' && permission === 'granted' && !token && !loading;
  const permissaoTexto = { default: 'ainda não pedida', granted: 'permitida', denied: 'bloqueada' }[permission];

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
          {aparelho?.ios ? (
            <>
              Para desbloquear no iPhone: <strong>Ajustes → Notificações → Patinha</strong> → ative{' '}
              <strong>Permitir Notificações</strong>. Depois feche e abra o Patinha.
            </>
          ) : (
            <>
              Para desbloquear, abra as configurações do site no navegador (ícone ao lado do endereço) e permita
              notificações. Depois recarregue esta página.
            </>
          )}
        </p>
      )}

      {suporte === 'sim' && permission === 'default' && (
        <>
          <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
            Toque no botão abaixo e escolha <strong>Permitir</strong> na pergunta que aparecer.
          </p>
          <button
            type="button"
            data-testid="ativar-notificacoes"
            onClick={requestPermission}
            disabled={loading}
            className="mt-3 w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? 'Ativando…' : 'Ativar notificações'}
          </button>
        </>
      )}

      {precisaTentarDeNovo && (
        <button
          type="button"
          data-testid="tentar-de-novo"
          onClick={requestPermission}
          className="mt-4 w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
        >
          Tentar de novo
        </button>
      )}

      {conectadas && (
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

      {aparelho && suporte !== 'verificando' && (
        <p data-testid="notificacoes-diagnostico" className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
          {aparelho.ios ? 'iPhone' : 'Este aparelho'} · {aparelho.instalado ? 'aberto pelo app instalado' : 'aberto no navegador'}
          {'Notification' in globalThis ? ` · permissão: ${permissaoTexto}` : ' · sem suporte a notificações'}
        </p>
      )}
    </section>
  );
}
