'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ehPeriodo, PERIODO_PADRAO } from '@/lib/admin/analytics/periodo';
import type { Analise, PeriodoChave } from '@/lib/admin/analytics/tipos';
import { AbaEmpresas } from '@/components/admin/analytics/AbaEmpresas';
import { AbaTutores } from '@/components/admin/analytics/AbaTutores';
import { FaixaFila } from '@/components/admin/analytics/FaixaFila';
import { PeriodoFiltro } from '@/components/admin/analytics/PeriodoFiltro';
import { ehAba, SeletorAbas, type AbaChave } from '@/components/admin/analytics/SeletorAbas';
import { dataCurta } from '@/components/admin/analytics/formato';

export default function AdminVisaoGeralPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const periodoBruto = params.get('periodo');
  const periodo: PeriodoChave = ehPeriodo(periodoBruto) ? periodoBruto : PERIODO_PADRAO;
  const abaBruta = params.get('aba');
  const aba: AbaChave = ehAba(abaBruta) ? abaBruta : 'tutores';

  const [analise, setAnalise] = useState<Analise | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    fetch(`/api/admin/analytics?periodo=${periodo}`)
      .then(async (res) => {
        const corpo = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(corpo.error || 'Erro ao carregar a análise');
        return corpo as Analise;
      })
      .then((dados) => {
        if (ativo) setAnalise(dados);
      })
      .catch((e: Error) => {
        if (ativo) setErro(e.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [periodo]);

  const mudar = useCallback(
    (campo: 'aba' | 'periodo', valor: string) => {
      const novos = new URLSearchParams(params.toString());
      novos.set(campo, valor);
      router.push(`${pathname}?${novos.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return (
    <div className="space-y-5 p-4 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Visão geral</h1>
          <p className="mt-1 text-sm text-slate-500">Entrada e conversão de tutores e empresas. Contas da equipe ficam de fora.</p>
        </div>
        <PeriodoFiltro valor={periodo} aoMudar={(p) => mudar('periodo', p)} />
      </div>

      {analise && <FaixaFila itens={analise.fila} />}

      <SeletorAbas valor={aba} aoMudar={(a) => mudar('aba', a)} />

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{erro}</p>
          <p className="mt-1 text-xs text-slate-500">Confira o login de equipe e o banco.</p>
        </div>
      ) : !analise ? (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className={`transition-opacity ${carregando ? 'opacity-60' : ''}`} aria-busy={carregando}>
          {aba === 'tutores' ? (
            <AbaTutores dados={analise.tutores} granularidade={analise.periodo.granularidade} />
          ) : (
            <AbaEmpresas dados={analise.empresas} granularidade={analise.periodo.granularidade} />
          )}
          {analise.temEstimado && analise.estimadoAte && (
            <p className="mt-4 text-xs text-slate-400">
              * inclui datas aproximadas de antes de {dataCurta(analise.estimadoAte)}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
