'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePetStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import { FireIcon3D, BowlIcon3D, CalendarIcon3D } from '@/components/Icons3D';
import { diaISO } from '@/lib/checklist';
import { extrasDaRotina } from '@/lib/lembretes';
import { buscarLembretes, prepararAvisos, useLembretesRotina } from '@/lib/useLembretesRotina';
import { useNotifications } from '@/lib/useNotifications';
import { RecadoLembrete, SinoLembrete } from '@/components/SinoLembrete';
import { formatarIdade, idadeEmMeses as calcularIdadeEmMeses } from '@/lib/pet';

import { ICONE } from '@/lib/iconSizes';
interface Refeicao {
  id: string;
  hora: string;
  tipo: string;
  quantidade: string;
  concluida: boolean;
}

interface Suplemento {
  id: string;
  nome: string;
  dose: string;
}

const LIMITE_TEXTO_SUPLEMENTO = 80;

// Só as contas da porção. O app não recomenda marca nem suplemento: quem
// informa o que o pet come e toma é o tutor.
function getPorcoes(peso: number) {
  return {
    quantidadeDiaria: Math.round(peso * 0.02 * 1000),
    caloriasDiarias: Math.round(peso * 60 + 70),
  };
}

function getDicasDesenvolvimento(idadeEmMeses: number, objetivo: string) {
  const dicas = [];

  if (idadeEmMeses < 6) {
    dicas.push(
      { titulo: 'Socialização', descricao: 'Exponha o filhote a diferentes ambientes, pessoas e animais.', icone: '🤝' },
      { titulo: 'Treino de obediência', descricao: 'Comece com comandos básicos: sentar, ficar, vir.', icone: '🎯' },
      { titulo: 'Vacinação em dia', descricao: 'Siga o calendário de vacinas conforme orientação veterinária.', icone: '💉' },
    );
  } else if (idadeEmMeses < 12) {
    dicas.push(
      { titulo: 'Exercício adequado', descricao: 'Passeios de 20-30 min, 2x ao dia.', icone: '🚶' },
      { titulo: 'Controle de peso', descricao: 'Mantenha o peso ideal para evitar problemas articulares.', icone: '⚖️' },
      { titulo: 'Estímulo mental', descricao: 'Brinquedos interativos e puzzles para desenvolver cognição.', icone: '🧠' },
    );
  } else {
    dicas.push(
      { titulo: 'Exercício regular', descricao: 'Passeios diários de 30-60 min conforme o porte.', icone: '🏃' },
      { titulo: 'Check-up anual', descricao: 'Exames de sangue e avaliação clínica anual.', icone: '🩺' },
      { titulo: 'Higiene dental', descricao: 'Escovação 2-3x por semana e brinquedos de limpeza.', icone: '🦷' },
    );
  }

  if (objetivo === 'desempenho') {
    dicas.push(
      { titulo: 'Treino progressivo', descricao: 'Aumente gradualmente a intensidade dos exercícios.', icone: '📈', iconeImg: '/icons/3d/chart.png' },
      { titulo: 'Hidratação', descricao: 'Garanta água fresca sempre disponível.', icone: '💧' },
      { titulo: 'Descanso ativo', descricao: 'Mesmo cães ativos precisam de 12-14h de sono.', icone: '😴' },
    );
  }

  return dicas;
}

export default function RacaoPage() {
  const { pet, hydrated, isPremium } = usePetStore();
  const notif = useNotifications();
  const lembretes = useLembretesRotina(pet?.id, 'refeicao');
  const [recado, setRecado] = useState<{ texto: string; ok: boolean } | null>(null);
  const [objetivo, setObjetivo] = useState(pet?.objetivo ?? 'manutencao');

  // pet só fica disponível depois que o store hidrata a partir do
  // localStorage (ver lib/store.ts); o useState acima captura o valor
  // inicial antes disso, então re-sincroniza assim que a hidratação terminar.
  useEffect(() => {
    if (hydrated && pet) setObjetivo(pet.objetivo);
  }, [hydrated]);
  const [suplementos, setSuplementos] = useState<Suplemento[]>([]);
  const [suplementoNome, setSuplementoNome] = useState('');
  const [suplementoDose, setSuplementoDose] = useState('');
  const [suplementoErro, setSuplementoErro] = useState(false);
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [novaRefeicao, setNovaRefeicao] = useState(false);
  const [diaOffset, setDiaOffset] = useState(0); // 0 = hoje, 1 = ontem, etc.

  const diaVisualizado = (() => {
    const d = new Date();
    d.setDate(d.getDate() - diaOffset);
    return d;
  })();
  const ehHoje = diaOffset === 0;

  useEffect(() => {
    if (!pet?.id) return;
    const supabase = createClient();
    const diaAlvo = diaISO(diaVisualizado);
    supabase
      .from('checklist_item')
      .select('*')
      .eq('pet_id', pet.id)
      .eq('lista', 'refeicao')
      .eq('dia', diaAlvo)
      .order('hora')
      .then(async ({ data, error }) => {
        if (error) return;
        if (data && data.length > 0) {
          setRefeicoes(data.map((r) => ({ id: r.id, hora: r.hora, tipo: r.nome, quantidade: r.detalhe || '', concluida: r.concluida })));
          return;
        }
        // Só gera as refeições padrão pro dia de hoje — dias passados sem
        // registro ficam vazios mesmo (não inventamos histórico).
        if (!ehHoje) {
          setRefeicoes([]);
          return;
        }
        // Distribuição das refeições padrão soma os mesmos 2% do peso corporal
        // ao dia usados em getPorcoes() (peso * 0.02 * 1000 = peso * 20g).
        const padrao = [
          { hora: '07:00', tipo: 'Café da manhã', quantidade: `${Math.round(pet.peso * 6)}g` },
          { hora: '12:00', tipo: 'Almoço', quantidade: `${Math.round(pet.peso * 7)}g` },
          { hora: '18:00', tipo: 'Jantar', quantidade: `${Math.round(pet.peso * 7)}g` },
        ];
        // Refeições com sino ligado fazem parte da rotina: entram todo dia.
        const extras = extrasDaRotina(
          padrao.map((p) => ({ nome: p.tipo, hora: p.hora })),
          await buscarLembretes(pet.id, 'refeicao')
        );
        padrao.push(...extras.map((l) => ({ hora: l.hora, tipo: l.nome, quantidade: l.detalhe || '' })));
        const rows = padrao.map((p) => ({
          id: crypto.randomUUID(),
          pet_id: pet.id,
          lista: 'refeicao',
          dia: diaAlvo,
          hora: p.hora,
          nome: p.tipo,
          detalhe: p.quantidade,
          concluida: false,
        }));
        const { data: inseridos } = await supabase.from('checklist_item').insert(rows).select();
        const criados = inseridos || rows;
        setRefeicoes(criados.map((r) => ({ id: r.id, hora: r.hora, tipo: r.nome, quantidade: r.detalhe || '', concluida: r.concluida })));
      });
  }, [pet?.id, pet?.peso, diaOffset]);

  const concluirRefeicao = (id: string) => {
    setRefeicoes((prev) => prev.map((r) => (r.id === id ? { ...r, concluida: true } : r)));
    const supabase = createClient();
    supabase.from('checklist_item').update({ concluida: true }).eq('id', id).then();
  };

  const desfazerRefeicao = (id: string) => {
    setRefeicoes((prev) => prev.map((r) => (r.id === id ? { ...r, concluida: false } : r)));
    const supabase = createClient();
    supabase.from('checklist_item').update({ concluida: false }).eq('id', id).then();
  };

  const adicionarRefeicao = () => {
    if (!pet) return;
    const agora = new Date();
    const hora = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
    const id = crypto.randomUUID();
    const quantidade = `${Math.round((pet.peso || 10) * 5)}g`;
    const nova: Refeicao = { id, hora, tipo: 'Lanche', quantidade, concluida: false };
    setRefeicoes((prev) => [...prev, nova]);
    setNovaRefeicao(false);
    const supabase = createClient();
    supabase.from('checklist_item').insert({
      id, pet_id: pet.id, lista: 'refeicao', dia: diaISO(agora),
      hora, nome: 'Lanche', detalhe: quantidade, concluida: false,
    }).then();
  };

  const removerRefeicao = (id: string) => {
    const item = refeicoes.find((r) => r.id === id);
    if (item) lembretes.remover(item.tipo, item.hora);
    setRefeicoes((prev) => prev.filter((r) => r.id !== id));
    const supabase = createClient();
    supabase.from('checklist_item').delete().eq('id', id).then();
  };

  useEffect(() => {
    if (!pet?.id || pet.id === 'demo-pet-preview') {
      setSuplementos([]);
      return;
    }
    let ativo = true;
    const supabase = createClient();
    supabase
      .from('suplemento')
      .select('id, nome, dose')
      .eq('pet_id', pet.id)
      .order('created_at')
      .then(({ data, error }) => {
        if (!ativo || error) return;
        setSuplementos((data || []).map((r) => ({ id: r.id as string, nome: r.nome as string, dose: (r.dose as string) || '' })));
      });
    return () => {
      ativo = false;
    };
  }, [pet?.id]);

  const adicionarSuplemento = async () => {
    const nome = suplementoNome.trim();
    const dose = suplementoDose.trim();
    if (!pet || !nome) return;
    setSuplementoErro(false);
    const novo: Suplemento = { id: crypto.randomUUID(), nome, dose };
    setSuplementos((prev) => [...prev, novo]);
    setSuplementoNome('');
    setSuplementoDose('');
    if (pet.id === 'demo-pet-preview') return;
    const supabase = createClient();
    const { error } = await supabase
      .from('suplemento')
      .insert({ id: novo.id, pet_id: pet.id, nome, dose: dose || null });
    if (error) {
      // Não finge que salvou: devolve o texto pro campo e avisa.
      setSuplementos((prev) => prev.filter((x) => x.id !== novo.id));
      setSuplementoNome(nome);
      setSuplementoDose(dose);
      setSuplementoErro(true);
    }
  };

  const removerSuplemento = (id: string) => {
    setSuplementos((prev) => prev.filter((x) => x.id !== id));
    if (pet?.id === 'demo-pet-preview') return;
    const supabase = createClient();
    supabase.from('suplemento').delete().eq('id', id).then();
  };

  const pendentes = refeicoes.filter((r) => !r.concluida);
  const concluidas = refeicoes.filter((r) => r.concluida);

  const alternarSino = async (r: Refeicao) => {
    const ligando = !lembretes.ligado(r.tipo, r.hora);
    // Pede a permissão antes de qualquer outra espera (exigência do iPhone).
    const preparo = ligando ? await prepararAvisos(notif) : null;
    const ficouLigado = await lembretes.alternar({ nome: r.tipo, hora: r.hora, detalhe: r.quantidade });
    if (ligando && !ficouLigado) setRecado({ texto: 'Não consegui salvar o lembrete. Tente de novo.', ok: false });
    else setRecado(preparo ? { texto: preparo.recado, ok: preparo.ok } : { texto: `Lembrete de ${r.tipo} desligado.`, ok: true });
    setTimeout(() => setRecado(null), 6000);
  };

  if (!pet) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-2xl px-4 py-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">Cadastre um pet primeiro para ver recomendações.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const idadeEmMeses = calcularIdadeEmMeses(pet.dataNascimento);
  const porcoes = getPorcoes(pet.peso);
  const dicas = getDicasDesenvolvimento(idadeEmMeses, objetivo);


  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <header className="mb-8">
            <BackButton href="/dashboard" />
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Ração de {pet.nome}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {pet.raca} · {pet.peso.toLocaleString('pt-BR')} kg · refeições, porções e suplementos do dia a dia
            </p>
          </header>

          <div className="space-y-6">
          {/* Checklist de Refeições */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ehHoje ? 'Refeições de Hoje' : diaVisualizado.toLocaleDateString('pt-BR')}</h3>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                {concluidas.length}/{refeicoes.length}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  if (!isPremium && diaOffset === 0) return;
                  setDiaOffset((d) => d + 1);
                }}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-amber-100 hover:text-slate-900 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-amber-900"
              >
                ← Dia anterior {!isPremium && diaOffset === 0 && <span className="rounded-full bg-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-800 dark:text-amber-200">PRO</span>}
              </button>
              <button
                onClick={() => setDiaOffset((d) => Math.max(0, d - 1))}
                disabled={ehHoje}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-amber-100 hover:text-slate-900 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-amber-900"
              >
                Próximo dia →
              </button>
            </div>
            {!isPremium && diaOffset === 0 && (
              <a href="/dashboard#plano" className="mt-1 block text-center text-xs text-amber-700 hover:text-amber-900 hover:underline dark:text-amber-300">
                Dias anteriores são do Premium · veja seu plano na tela inicial
              </a>
            )}

            <div className="mt-4 space-y-2">
              {pendentes.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-amber-100 transition-all hover:ring-amber-200 dark:bg-slate-900 dark:ring-amber-900"
                >
                  <button
                    onClick={() => concluirRefeicao(r.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-amber-300 text-amber-600 transition hover:border-amber-500 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                  >
                    <span className="text-xs">✓</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{r.hora}</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{r.tipo}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{r.quantidade}</p>
                  </div>
                  <SinoLembrete nome={r.tipo} ligado={lembretes.ligado(r.tipo, r.hora)} onClick={() => alternarSino(r)} />
                  <button
                    onClick={() => removerRefeicao(r.id)}
                    className="text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}

              {concluidas.length > 0 && (
                <div className="border-t border-amber-200 pt-2 dark:border-amber-900">
                  <p className="text-xs font-bold text-slate-500 mb-2 dark:text-slate-400">✓ Concluídas</p>
                  {concluidas.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 rounded-xl bg-white/60 p-2.5 opacity-70 transition-all dark:bg-slate-900/60"
                    >
                      <button
                        onClick={() => desfazerRefeicao(r.id)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 transition hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300"
                      >
                        <span className="text-[10px]">↩</span>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 line-through dark:text-slate-500">{r.hora}</span>
                          <span className="text-xs font-bold text-slate-400 line-through dark:text-slate-500">{r.tipo}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <RecadoLembrete recado={recado?.texto ?? null} ok={recado?.ok ?? true} />

            {ehHoje && (
              <button
                onClick={() => setNovaRefeicao(true)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 py-2.5 text-sm font-bold text-amber-700 transition hover:border-amber-400 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900"
              >
                <span>+</span> Adicionar refeição
              </button>
            )}
          </div>

          {/* Modal Nova Refeição */}
          {novaRefeicao && ehHoje && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nova Refeição</h3>
              <div className="mt-3 space-y-3">
                <button
                  onClick={adicionarRefeicao}
                  className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white transition hover:bg-amber-600"
                >
                  🍽️ Adicionar agora
                </button>
                <button
                  onClick={() => setNovaRefeicao(false)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Porções diárias */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Porções diárias</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <BowlIcon3D size={ICONE.atalho} />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Gramas por dia</p>
                <p className="text-base font-semibold tabular-nums text-slate-900 dark:text-white">{porcoes.quantidadeDiaria} g</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <FireIcon3D size={ICONE.atalho} />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Calorias por dia</p>
                <p className="text-base font-semibold tabular-nums text-slate-900 dark:text-white">{porcoes.caloriasDiarias} kcal</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <CalendarIcon3D size={ICONE.atalho} />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Refeições por dia</p>
                <p className="text-base font-semibold text-slate-900 dark:text-white">2 a 3</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Estimativa pelo peso de {pet.nome}. A embalagem da ração e o veterinário dão a medida exata.
            </p>
          </section>

          {/* Suplementos — o tutor informa; o app não recomenda */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" aria-label="Suplementos">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Suplementos</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {pet.nome} toma algum suplemento? Adicione aqui para ter tudo num lugar só. Se não toma, é só deixar em branco.
            </p>

            {suplementos.length > 0 && (
              <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {suplementos.map((sup) => (
                  <li key={sup.id} className="flex items-center gap-3 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{sup.nome}</span>
                      {sup.dose && <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{sup.dose}</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => removerSuplemento(sup.id)}
                      aria-label={`Remover ${sup.nome}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form
              className="mt-4 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                adicionarSuplemento();
              }}
            >
              <input
                type="text"
                value={suplementoNome}
                onChange={(e) => setSuplementoNome(e.target.value)}
                placeholder="Nome (ex.: ômega 3)"
                maxLength={LIMITE_TEXTO_SUPLEMENTO}
                aria-label="Nome do suplemento"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <input
                type="text"
                value={suplementoDose}
                onChange={(e) => setSuplementoDose(e.target.value)}
                placeholder="Dose (opcional)"
                maxLength={LIMITE_TEXTO_SUPLEMENTO}
                aria-label="Dose do suplemento, opcional"
                className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:w-44"
              />
              <button
                type="submit"
                disabled={!suplementoNome.trim()}
                className="shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Adicionar
              </button>
            </form>
            {suplementoErro && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
                Não consegui salvar agora. Tente de novo em instantes.
              </p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Perfil do pet</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Link href="/atividades" className="rounded-xl border border-slate-200 p-4 transition hover:border-amber-300 dark:border-slate-800 dark:hover:border-amber-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">Raça</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{pet.raca}</p>
              </Link>
              <Link href="/desempenho" className="rounded-xl border border-slate-200 p-4 transition hover:border-amber-300 dark:border-slate-800 dark:hover:border-amber-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">Peso</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{pet.peso} kg</p>
              </Link>
              <Link href="/vida" className="rounded-xl border border-slate-200 p-4 transition hover:border-amber-300 dark:border-slate-800 dark:hover:border-amber-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">Idade</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formatarIdade(idadeEmMeses)}
                </p>
              </Link>
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Objetivo</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {objetivo === 'manutencao' ? 'Manutenção' : objetivo === 'pelagem' ? 'Pelagem' : objetivo === 'emagrecimento' ? 'Emagrecimento' : 'Desempenho'}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Alterar objetivo</label>
              <select
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value as 'manutencao' | 'pelagem' | 'desempenho' | 'emagrecimento')}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="manutencao">Manutenção</option>
                <option value="pelagem">Pelagem</option>
                <option value="desempenho">Desempenho</option>
                <option value="emagrecimento">Emagrecimento</option>
              </select>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Dicas de desenvolvimento</h2>
            <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
              {dicas.map((d) => (
                <li key={d.titulo} className="py-2.5">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{d.titulo}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{d.descricao}</p>
                </li>
              ))}
            </ul>
          </section>

          <p className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Antes de mudar a ração ou começar um suplemento, converse com o veterinário de {pet.nome}.
          </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
