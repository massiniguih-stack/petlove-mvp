export type AbaChave = 'tutores' | 'empresas';

const ABAS: Array<{ chave: AbaChave; nome: string }> = [
  { chave: 'tutores', nome: 'Tutores' },
  { chave: 'empresas', nome: 'Empresas' },
];

export function ehAba(v: unknown): v is AbaChave {
  return v === 'tutores' || v === 'empresas';
}

export function SeletorAbas({ valor, aoMudar }: { valor: AbaChave; aoMudar: (a: AbaChave) => void }) {
  return (
    <div role="tablist" aria-label="Público" className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
      {ABAS.map((aba) => (
        <button
          key={aba.chave}
          type="button"
          role="tab"
          aria-selected={aba.chave === valor}
          onClick={() => aoMudar(aba.chave)}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
            aba.chave === valor
              ? 'border-amber-600 text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          {aba.nome}
        </button>
      ))}
    </div>
  );
}
