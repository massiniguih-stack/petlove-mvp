'use client';

import { useState, useEffect } from 'react';
import { usePetStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { BackButton } from '@/components/BackButton';
import { ScaleIcon3D, CalendarIcon3D, TargetIcon3D, FireIcon3D, DogIcon3D, BowlIcon3D } from '@/components/Icons3D';
import { diaISO } from '@/lib/checklist';

interface MarcaRacao {
  nome: string;
  tier: 'premium' | 'superior' | 'basic';
  proteina: number;
  gordura: number;
  fibra: number;
  indicada: string[];
  pontosFortes: string[];
  cuidados: string[];
  preco: string;
  logo: string;
}

interface Refeicao {
  id: string;
  hora: string;
  tipo: string;
  quantidade: string;
  concluida: boolean;
}

interface SuplementoDetalhe {
  nome: string;
  beneficio: string;
  quando: string;
  icone: string;
  iconeImg?: string;
  cor: string;
  descricao: string;
  dosagem: string;
  cuidados: string[];
  contraindicacoes: string[];
}

const marcas: MarcaRacao[] = [
  {
    nome: 'Royal Canin',
    tier: 'premium',
    proteina: 25,
    gordura: 14,
    fibra: 3.5,
    indicada: ['Porte pequeno', 'Porte médio', 'Porte grande', 'Filhote', 'Adulto', 'Sênior'],
    pontosFortes: ['Raça específica', 'Fases de vida', 'Veterinária', 'Ampla distribuição'],
    cuidados: ['Preço elevado', 'Contém grãos', 'Ingredientes vegetais'],
    preco: '$$$$',
    logo: '👑',
  },
  {
    nome: 'Hills Science Diet',
    tier: 'premium',
    proteina: 24,
    gordura: 14,
    fibra: 3,
    indicada: ['Porte pequeno', 'Porte médio', 'Porte grande', 'Filhote', 'Adulto', 'Sênior'],
    pontosFortes: ['Baseada em ciência', 'Veterinária', 'Controle de peso', 'Renal'],
    cuidados: ['Preço elevado', 'Disponibilidade limitada'],
    preco: '$$$$',
    logo: '🔬',
  },
  {
    nome: 'Blue Buffalo',
    tier: 'superior',
    proteina: 28,
    gordura: 15,
    fibra: 4,
    indicada: ['Porte pequeno', 'Porte médio', 'Porte grande', 'Adulto'],
    pontosFortes: ['Sem subprodutos', 'LifeSource Bits', 'Antioxidantes', 'Sem corantes'],
    cuidados: ['Disponibilidade limitada', 'Preço médio-alto'],
    preco: '$$$',
    logo: '🦬',
  },
  {
    nome: 'Orijen',
    tier: 'premium',
    proteina: 38,
    gordura: 18,
    fibra: 5,
    indicada: ['Porte pequeno', 'Porte médio', 'Porte grande', 'Adulto', 'Ativo'],
    pontosFortes: ['Alta proteína', 'Biologicamente apropriado', 'Ingredientes frescos'],
    cuidados: ['Muito rica para cães sedentários', 'Preço muito elevado', 'Não indicada para filhotes'],
    preco: '$$$$$',
    logo: '🌿',
  },
  {
    nome: 'GranPlus',
    tier: 'superior',
    proteina: 26,
    gordura: 14,
    fibra: 3.5,
    indicada: ['Porte pequeno', 'Porte médio', 'Porte grande', 'Filhote', 'Adulto', 'Sênior'],
    pontosFortes: ['Boa relação custo-benefício', 'National Pet', 'Fórmulas especializadas'],
    cuidados: ['Contém grãos', 'Alguns ingredientes vegetais'],
    preco: '$$',
    logo: '🐾',
  },
  {
    nome: 'Golden',
    tier: 'basic',
    proteina: 22,
    gordura: 12,
    fibra: 4,
    indicada: ['Porte pequeno', 'Porte médio', 'Porte grande', 'Adulto'],
    pontosFortes: ['Preço acessível', 'Ampla distribuição', 'Variety'],
    cuidados: ['Ingredientes inferiores', 'Subprodutos', 'Corantes', 'Não indicada para exigentes'],
    preco: '$',
    logo: '⭐',
  },
];

function getRecomendacao(objetivo: string, peso: number, raca: string) {
  const marcasRecomendadas = marcas.filter((m) => {
    if (objetivo === 'desempenho') return m.tier === 'premium' && m.proteina >= 30;
    if (objetivo === 'pelagem') return m.tier === 'premium' || m.tier === 'superior';
    if (objetivo === 'emagrecimento') return m.gordura <= 14 && m.fibra >= 3;
    return true;
  });

  const racaoDiaria = peso * 0.02 * 1000;
  const caloriasDiarias = peso * 60 + 70;

  return {
    marcas: marcasRecomendadas.slice(0, 3),
    quantidadeDiaria: Math.round(racaoDiaria),
    caloriasDiarias: Math.round(caloriasDiarias),
    raca,
  };
}

function getSuplementos(objetivo: string): SuplementoDetalhe[] {
  const base: SuplementoDetalhe[] = [
    {
      nome: 'Ômega 3 e 6',
      beneficio: 'Pelagem brilhante e pele saudável',
      quando: 'Diário, junto com a refeição',
      icone: '✨',
      cor: 'bg-purple-50 text-purple-700',
      descricao: 'Ácidos graxos essenciais que promovem saúde da pele, pelagem brilhante e redução de inflamações. Funciona como anti-inflamatório natural.',
      dosagem: '1000mg por 10kg de peso corporal ao dia',
      cuidados: ['Armazenar em local frio e escuro', 'Verificar validade', 'Não superdosar'],
      contraindicacoes: ['Cães com alergia a peixes', 'Animais com problemas de coagulação'],
    },
  ];

  if (objetivo === 'desempenho') {
    return [
      ...base,
      {
        nome: 'Creatina',
        beneficio: 'Força muscular e resistência',
        quando: 'Pré-treino, 30min antes',
        icone: '💪',
        iconeImg: '/icons/weight.png',
        cor: 'bg-rose-50 text-rose-700',
        descricao: 'Aminoácido que aumenta a disponibilidade de energia muscular, melhorando força e performance em exercícios de curta duração e alta intensidade.',
        dosagem: '5-10g por dia para cães de grande porte',
        cuidados: ['Introduzir gradualmente', 'Garantir hidratação adequada', 'Não usar em filhotes'],
        contraindicacoes: ['Cães com problemas renais', 'Filhotes em crescimento', 'Animais sedentários'],
      },
      {
        nome: 'BCAA',
        beneficio: 'Recuperação muscular',
        quando: 'Pós-exercício',
        icone: '🔄',
        cor: 'bg-blue-50 text-blue-700',
        descricao: 'Aminoácidos ramificados (Leucina, Isoleucina, Valina) que reduzem fadiga muscular e aceleram a recuperação pós-exercício.',
        dosagem: '2-5g por dia, dividido em 2 porções',
        cuidados: ['Misturar com alimento ou água', 'Não substitui alimentação balanceada'],
        contraindicacoes: ['Cães com doenças hepáticas', 'Animais com problemas renais'],
      },
      {
        nome: 'Vitamina E',
        beneficio: 'Proteção antioxidante',
        quando: 'Diário',
        icone: '🛡️',
        iconeImg: '/icons/shield.png',
        cor: 'bg-amber-50 text-amber-700',
        descricao: 'Antioxidante poderoso que protege as células contra radicais livres, fortalece o sistema imunológico e melhora a recuperação muscular.',
        dosagem: '1-2 UI por kg de peso corporal ao dia',
        cuidados: ['Não armazenar em ambiente quente', 'Verificar concentração do produto'],
        contraindicacoes: ['Cães em uso de anticoagulantes', 'Animais com problemas de coagulação'],
      },
    ];
  }

  if (objetivo === 'pelagem') {
    return [
      ...base,
      {
        nome: 'Biotina',
        beneficio: 'Fortalecimento do pelo',
        quando: 'Diário',
        icone: '💅',
        cor: 'bg-pink-50 text-pink-700',
        descricao: 'Vitamina do complexo B essencial para a saúde do pelo, unha e pele. Fortalece fios quebradiços e estimula crescimento.',
        dosagem: '2.5-5mg por dia',
        cuidados: ['Efeitos visíveis após 4-8 semanas', 'Associar com zinco para melhor absorção'],
        contraindicacoes: ['Cães com alergia a biotina', 'Animais com pancreatite'],
      },
      {
        nome: 'Zinco',
        beneficio: 'Crescimento capilar',
        quando: '3x por semana',
        icone: '🧬',
        cor: 'bg-cyan-50 text-cyan-700',
        descricao: 'Mineral essencial para crescimento capilar, cicatrização de feridas e função imunológica. Deficiência causa queda de pelo.',
        dosagem: '10-20mg por dia (dose elemental)',
        cuidados: ['Não associar com suplementos de ferro', 'Observar coloração das fezes'],
        contraindicacoes: ['Cães com hemocromatose', 'Animais com úlceras gástricas'],
      },
      {
        nome: 'Extrato de Alfafa',
        beneficio: 'Nutrição da pelagem',
        quando: 'Diário',
        icone: '🌱',
        cor: 'bg-emerald-50 text-emerald-700',
        descricao: 'Planta rica em vitaminas, minerais e antioxidantes que nutre a pelagem de dentro para fora, promovendo brilho natural.',
        dosagem: '100-200mg por dia',
        cuidados: ['Introduzir gradualmente', 'Observar reações alérgicas'],
        contraindicacoes: ['Cães com lúpus', 'Animais com doenças autoimunes'],
      },
    ];
  }

  return [
    ...base,
    {
      nome: 'Glucosamina',
      beneficio: 'Saúde articular',
      quando: 'Diário',
      icone: '🦴',
      cor: 'bg-amber-50 text-amber-700',
      descricao: 'Composto natural que ajuda a manter a saúde das articulações, reduzindo dor e inflamação em cães com artrite ou displasia.',
      dosagem: '20mg por kg de peso corporal ao dia',
      cuidados: ['Efeitos após 4-8 semanas', 'Associar com condroitina para melhor resultado'],
      contraindicacoes: ['Cães com diabetes', 'Animais alérgicos a frutos do mar'],
    },
    {
      nome: 'Probióticos',
      beneficio: 'Saúde intestinal',
      quando: 'Diário, em jejum',
      icone: '🦠',
      cor: 'bg-emerald-50 text-emerald-700',
      descricao: 'Bactérias benéficas que equilibram a flora intestinal, melhorando digestão, absorção de nutrientes e imunidade.',
      dosagem: '1-10 bilhões de UFC por dia',
      cuidados: ['Armazenar em geladeira', 'Não misturar com alimentos quentes', 'Introduzir gradualmente'],
      contraindicacoes: ['Cães imunocomprometidos', 'Animais com pancreatite severa'],
    },
    {
      nome: 'Vitamina C',
      beneficio: 'Imunidade',
      quando: '3x por semana',
      icone: '🍊',
      cor: 'bg-orange-50 text-orange-700',
      descricao: 'Antioxidante que fortalece o sistema imunológico, auxilia na absorção de ferro e promove cicatrização de feridas.',
      dosagem: '10-30mg por kg de peso corporal',
      cuidados: ['Associar com fontes de bioflavonoides', 'Observar tolerância gastrointestinal'],
      contraindicacoes: ['Cães com pedra nos rins', 'Animais com hemoglobinúia'],
    },
  ];
}

function getDicasDesenvolvimento(idadeEmMeses: number, objetivo: string) {
  const dicas = [];

  if (idadeEmMeses < 6) {
    dicas.push(
      { titulo: 'Socialização', descricao: 'Exponha o filhote a diferentes ambientes, pessoas e animais.', icone: '🤝', cor: 'bg-blue-50 text-blue-700' },
      { titulo: 'Treino de obediência', descricao: 'Comece com comandos básicos: sentar, ficar, vir.', icone: '🎯', cor: 'bg-amber-50 text-amber-700' },
      { titulo: 'Vacinação em dia', descricao: 'Siga o calendário de vacinas conforme orientação veterinária.', icone: '💉', cor: 'bg-emerald-50 text-emerald-700' },
    );
  } else if (idadeEmMeses < 12) {
    dicas.push(
      { titulo: 'Exercício adequado', descricao: 'Passeios de 20-30 min, 2x ao dia.', icone: '🚶', cor: 'bg-emerald-50 text-emerald-700' },
      { titulo: 'Controle de peso', descricao: 'Mantenha o peso ideal para evitar problemas articulares.', icone: '⚖️', cor: 'bg-blue-50 text-blue-700' },
      { titulo: 'Estímulo mental', descricao: 'Brinquedos interativos e puzzles para desenvolver cognição.', icone: '🧠', cor: 'bg-purple-50 text-purple-700' },
    );
  } else {
    dicas.push(
      { titulo: 'Exercício regular', descricao: 'Passeios diários de 30-60 min conforme o porte.', icone: '🏃', cor: 'bg-emerald-50 text-emerald-700' },
      { titulo: 'Check-up anual', descricao: 'Exames de sangue e avaliação clínica anual.', icone: '🩺', cor: 'bg-rose-50 text-rose-700' },
      { titulo: 'Higiene dental', descricao: 'Escovação 2-3x por semana e brinquedos de limpeza.', icone: '🦷', cor: 'bg-cyan-50 text-cyan-700' },
    );
  }

  if (objetivo === 'desempenho') {
    dicas.push(
      { titulo: 'Treino progressivo', descricao: 'Aumente gradualmente a intensidade dos exercícios.', icone: '📈', iconeImg: '/icons/chart.png', cor: 'bg-amber-50 text-amber-700' },
      { titulo: 'Hidratação', descricao: 'Garanta água fresca sempre disponível.', icone: '💧', cor: 'bg-blue-50 text-blue-700' },
      { titulo: 'Descanso ativo', descricao: 'Mesmo cães ativos precisam de 12-14h de sono.', icone: '😴', cor: 'bg-purple-50 text-purple-700' },
    );
  }

  return dicas;
}

export default function RacaoPage() {
  const { pet, hydrated, isPremium } = usePetStore();
  const [objetivo, setObjetivo] = useState(pet?.objetivo ?? 'manutencao');

  // pet só fica disponível depois que o store hidrata a partir do
  // localStorage (ver lib/store.ts); o useState acima captura o valor
  // inicial antes disso, então re-sincroniza assim que a hidratação terminar.
  useEffect(() => {
    if (hydrated && pet) setObjetivo(pet.objetivo);
  }, [hydrated]);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [marcaExpandida, setMarcaExpandida] = useState<string | null>(null);
  const [suplementoExpandido, setSuplementoExpandido] = useState<SuplementoDetalhe | null>(null);
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
        // ao dia usados em getRecomendacao() (peso * 0.02 * 1000 = peso * 20g).
        const padrao = [
          { hora: '07:00', tipo: 'Café da manhã', quantidade: `${Math.round(pet.peso * 6)}g` },
          { hora: '12:00', tipo: 'Almoço', quantidade: `${Math.round(pet.peso * 7)}g` },
          { hora: '18:00', tipo: 'Jantar', quantidade: `${Math.round(pet.peso * 7)}g` },
        ];
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
    setRefeicoes((prev) => prev.filter((r) => r.id !== id));
    const supabase = createClient();
    supabase.from('checklist_item').delete().eq('id', id).then();
  };

  const pendentes = refeicoes.filter((r) => !r.concluida);
  const concluidas = refeicoes.filter((r) => r.concluida);

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

  const idadeEmMeses = Math.floor((new Date().getTime() - new Date(pet.dataNascimento).getTime()) / (1000 * 60 * 60 * 24 * 30));
  const recomendacao = getRecomendacao(objetivo, pet.peso, pet.raca);
  const suplementos = getSuplementos(objetivo);
  const dicas = getDicasDesenvolvimento(idadeEmMeses, objetivo);

  const marcasParaMostrar = mostrarTodos ? marcas : recomendacao.marcas;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <header className="mb-8">
            <BackButton href="/dashboard" />
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 dark:bg-amber-950">
              <span className="text-lg">🥣</span>
              Análise personalizada
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Recomendação de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">ração</span>
            </h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
              Para {pet.nome} ({pet.raca}, {pet.peso} kg)
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3 space-y-6">
              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Perfil do pet</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                   <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center ring-1 ring-amber-100 dark:from-amber-950 dark:to-orange-950">
                     <DogIcon3D size={28} className="mx-auto" />
                     <p className="mt-2 text-xs font-medium text-amber-600">Raça</p>
                     <p className="text-sm font-bold text-slate-900 dark:text-white">{pet.raca}</p>
                  </div>
                   <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4 text-center ring-1 ring-blue-100 dark:from-blue-950 dark:to-cyan-950">
                     <ScaleIcon3D size={28} className="mx-auto" />
                     <p className="mt-2 text-xs font-medium text-blue-600">Peso</p>
                     <p className="text-sm font-bold text-slate-900 dark:text-white">{pet.peso} kg</p>
                  </div>
                   <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-center ring-1 ring-emerald-100 dark:from-emerald-950 dark:to-teal-950">
                     <CalendarIcon3D size={28} className="mx-auto" />
                     <p className="mt-2 text-xs font-medium text-emerald-600">Idade</p>
                     <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {idadeEmMeses < 12 ? `${idadeEmMeses} meses` : `${Math.floor(idadeEmMeses / 12)} anos`}
                    </p>
                  </div>
                   <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 text-center ring-1 ring-purple-100 dark:from-purple-950 dark:to-pink-950">
                     <TargetIcon3D size={28} className="mx-auto" />
                     <p className="mt-2 text-xs font-medium text-purple-600">Objetivo</p>
                     <p className="text-sm font-bold text-slate-900 dark:text-white">
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

              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Marcas recomendadas</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Baseado no perfil de {pet.nome}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    {marcas.length} opções
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {marcasParaMostrar.map((marca, index) => {
                    const isExpandida = marcaExpandida === marca.nome;
                    return (
                    <div
                      key={marca.nome}
                      onClick={() => setMarcaExpandida(isExpandida ? null : marca.nome)}
                      className={`relative cursor-pointer rounded-2xl border p-5 transition-all ${
                        index === 0 ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white ring-2 ring-amber-100 shadow-md dark:border-amber-800 dark:from-amber-950 dark:to-slate-900' : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
                      }`}
                    >
                      {index === 0 && (
                        <div className="absolute -top-3 left-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                          ⭐ Melhor escolha
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-3xl dark:from-slate-800 dark:to-slate-700">
                          {marca.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{marca.nome}</h3>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              marca.tier === 'premium' ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white' :
                              marca.tier === 'superior' ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white' :
                              'bg-slate-200 text-slate-700'
                            }`}>
                              {marca.tier}
                            </span>
                            <span className="text-sm font-bold text-slate-400 dark:text-slate-500">{marca.preco}</span>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-3 text-center ring-1 ring-emerald-100 dark:from-emerald-950 dark:to-teal-950">
                              <p className="text-xs font-medium text-emerald-600">Proteína</p>
                              <p className="text-lg font-black text-emerald-700">{marca.proteina}%</p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-3 text-center ring-1 ring-amber-100 dark:from-amber-950 dark:to-orange-950">
                              <p className="text-xs font-medium text-amber-600">Gordura</p>
                              <p className="text-lg font-black text-amber-700">{marca.gordura}%</p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-3 text-center ring-1 ring-blue-100 dark:from-blue-950 dark:to-cyan-950">
                              <p className="text-xs font-medium text-blue-600">Fibra</p>
                              <p className="text-lg font-black text-blue-700">{marca.fibra}%</p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                Pontos fortes
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {marca.pontosFortes.map((p) => (
                                  <span key={p} className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">{p}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="12" y1="16" x2="12" y2="12"/>
                                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                Cuidados
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {marca.cuidados.map((c) => (
                                  <span key={c} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">{c}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setMarcaExpandida(isExpandida ? null : marca.nome)}
                            className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                          >
                            {isExpandida ? 'Ocultar detalhes' : 'Ver detalhes'}
                            <svg
                              className={`h-3 w-3 transition-transform ${isExpandida ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isExpandida && (
                            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-700">
                              <div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Indicada para</p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {marca.indicada.map((i) => (
                                    <span key={i} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">{i}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {!mostrarTodos && marcas.length > 3 && (
                  <button
                    onClick={() => setMostrarTodos(true)}
                    className="mt-4 flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700"
                  >
                    Ver todas as marcas ({marcas.length})
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                )}
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Suplementação</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Clique para ver detalhes · Complementos para {objetivo === 'manutencao' ? 'manutenção' : objetivo === 'pelagem' ? 'pelagem' : objetivo === 'emagrecimento' ? 'emagrecimento' : 'desempenho'}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {suplementos.map((s) => (
                    <button
                      key={s.nome}
                      onClick={() => setSuplementoExpandido(s)}
                      className={`group flex items-start gap-3 rounded-xl p-4 text-left ring-1 ring-inset transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${s.cor.split(' ')[0].replace('bg-', 'ring-')}/30 ${s.cor.split(' ')[0]}`}
                    >
                      {s.iconeImg ? (
                        <Image src={s.iconeImg} alt="" width={28} height={28} unoptimized className="transition group-hover:scale-110" />
                      ) : (
                        <span className="text-2xl transition group-hover:scale-110">{s.icone}</span>
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${s.cor.split(' ')[1]}`}>{s.nome}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{s.beneficio}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{s.quando}</p>
                      </div>
                      <svg className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-slate-600 group-hover:translate-x-0.5 dark:text-slate-500 dark:group-hover:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </section>

              {/* Modal de Detalhes do Suplemento */}
              {suplementoExpandido && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setSuplementoExpandido(null)}>
                  <div
                    className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-scale-in dark:bg-slate-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {suplementoExpandido.iconeImg ? (
                          <Image src={suplementoExpandido.iconeImg} alt="" width={44} height={44} unoptimized />
                        ) : (
                          <span className="text-4xl">{suplementoExpandido.icone}</span>
                        )}
                        <div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white">{suplementoExpandido.nome}</h3>
                          <p className={`text-sm font-bold ${suplementoExpandido.cor.split(' ')[1]}`}>{suplementoExpandido.beneficio}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSuplementoExpandido(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{suplementoExpandido.descricao}</p>

                    <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Dosagem</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{suplementoExpandido.dosagem}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Quando usar</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{suplementoExpandido.quando}</p>
                        </div>
                      </div>
                    </div>

                    {suplementoExpandido.cuidados.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-bold text-amber-600">⚠️ Cuidados</p>
                        <ul className="mt-2 space-y-1">
                          {suplementoExpandido.cuidados.map((c) => (
                            <li key={c} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <span className="mt-0.5 text-amber-500">•</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {suplementoExpandido.contraindicacoes.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-red-500">🚫 Contraindicações</p>
                        <ul className="mt-2 space-y-1">
                          {suplementoExpandido.contraindicacoes.map((c) => (
                            <li key={c} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <span className="mt-0.5 text-red-400">•</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button
                      onClick={() => setSuplementoExpandido(null)}
                      className="mt-5 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      Entendi
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Checklist de Refeições */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white shadow-lg shadow-amber-500/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">{ehHoje ? 'Refeições de Hoje' : diaVisualizado.toLocaleDateString('pt-BR')}</h3>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
                    {concluidas.length}/{refeicoes.length}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (!isPremium && diaOffset === 0) return;
                      setDiaOffset((d) => d + 1);
                    }}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                  >
                    ← Dia anterior {!isPremium && diaOffset === 0 && <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold">PRO</span>}
                  </button>
                  <button
                    onClick={() => setDiaOffset((d) => Math.max(0, d - 1))}
                    disabled={ehHoje}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                  >
                    Próximo dia →
                  </button>
                </div>
                {!isPremium && diaOffset === 0 && (
                  <a href="/planos" className="mt-1 block text-center text-[10px] text-white/70 hover:text-white hover:underline">
                    Assine Premium para ver dias anteriores
                  </a>
                )}

                <div className="mt-4 space-y-2">
                  {pendentes.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 rounded-xl bg-white/15 p-3 backdrop-blur-sm transition-all hover:bg-white/25"
                    >
                      <button
                        onClick={() => concluirRefeicao(r.id)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-white/40 transition hover:border-white hover:bg-white/20"
                      >
                        <span className="text-xs">✓</span>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white/80">{r.hora}</span>
                          <span className="text-sm font-bold">{r.tipo}</span>
                        </div>
                        <p className="text-xs text-white/70">{r.quantidade}</p>
                      </div>
                      <button
                        onClick={() => removerRefeicao(r.id)}
                        className="text-white/50 hover:text-white/80 transition"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}

                  {concluidas.length > 0 && (
                    <div className="border-t border-white/20 pt-2">
                      <p className="text-xs font-bold text-white/60 mb-2">✓ Concluídas</p>
                      {concluidas.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center gap-3 rounded-xl bg-white/10 p-2.5 opacity-60 transition-all"
                        >
                          <button
                            onClick={() => desfazerRefeicao(r.id)}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/30 transition hover:bg-white/40"
                          >
                            <span className="text-[10px]">↩</span>
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/60 line-through">{r.hora}</span>
                              <span className="text-xs font-bold text-white/60 line-through">{r.tipo}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {ehHoje && (
                  <button
                    onClick={() => setNovaRefeicao(true)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/30 py-2.5 text-sm font-bold text-white/80 transition hover:border-white/50 hover:bg-white/10"
                  >
                    <span>+</span> Adicionar refeição
                  </button>
                )}
              </div>

              {/* Modal Nova Refeição */}
              {novaRefeicao && ehHoje && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
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

              {/* Porções Diárias */}
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Porções diárias</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-3 ring-1 ring-amber-100 dark:from-amber-950 dark:to-orange-950">
                    <BowlIcon3D size={28} />
                    <div>
                      <p className="text-xs font-medium text-amber-600">Quantidade</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{recomendacao.quantidadeDiaria}g/dia</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 p-3 ring-1 ring-rose-100 dark:from-rose-950 dark:to-pink-950">
                    <FireIcon3D size={28} />
                    <div>
                      <p className="text-xs font-medium text-rose-600">Calorias</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{recomendacao.caloriasDiarias} kcal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-3 ring-1 ring-blue-100 dark:from-blue-950 dark:to-cyan-950">
                    <span className="text-2xl">🍽️</span>
                    <div>
                      <p className="text-xs font-medium text-blue-600">Refeições</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">2-3x ao dia</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dicas de desenvolvimento</h3>
                <div className="mt-4 space-y-3">
                  {dicas.map((d) => (
                    <div key={d.titulo} className={`flex items-start gap-3 rounded-xl p-3 ${d.cor.split(' ')[0]}`}>
                      {'iconeImg' in d && d.iconeImg ? (
                        <Image src={d.iconeImg} alt="" width={20} height={20} />
                      ) : (
                        <span className="text-lg">{d.icone}</span>
                      )}
                      <div>
                        <p className={`text-sm font-bold ${d.cor.split(' ')[1]}`}>{d.titulo}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{d.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-5 text-white shadow-lg shadow-emerald-500/30">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🩺</span>
                  <h3 className="text-sm font-bold">Lembrete</h3>
                </div>
                <p className="mt-2 text-sm text-white/90">
                  Consulte sempre um veterinário para orientações específicas sobre a nutrição do seu pet.
                </p>
              </div>


            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
