'use client';

// Sino de um compromisso da rotina: ligado = aviso no celular todo dia,
// 15 min antes do horário.
export function SinoLembrete({ ligado, onClick, nome }: { ligado: boolean; onClick: () => void; nome: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ligado}
      aria-label={ligado ? `Desligar lembrete de ${nome}` : `Ligar lembrete de ${nome}`}
      title={ligado ? 'Lembrete ligado — toque para desligar' : 'Me avise 15 min antes, todo dia'}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
        ligado
          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/60 dark:text-amber-300 dark:hover:bg-amber-900'
          : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500 dark:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-400'
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={ligado ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    </button>
  );
}

/** Recado curto que aparece depois de ligar um sino. */
export function RecadoLembrete({ recado, ok }: { recado: string | null; ok: boolean }) {
  if (!recado) return null;
  return (
    <p
      role="status"
      className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ${
        ok
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
      }`}
    >
      🔔 {recado}
    </p>
  );
}
