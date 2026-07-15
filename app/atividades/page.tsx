'use client';

import { useState, useEffect } from 'react';
import { usePetStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { BackButton } from '@/components/BackButton';
import { ScaleIcon3D } from '@/components/Icons3D';

interface Atividade {
  id: string;
  nome: string;
  categoria: 'caminhada' | 'brincadeira' | 'treino' | 'natacao' | 'obediencia' | 'agility';
  intensidade: 'baixa' | 'media' | 'alta';
  duracao: string;
  descricao: string;
  beneficios: string[];
  dicas: string[];
  indicadaPara: string[];
  equipamento?: string[];
}

function diaISO(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

interface CheckItem {
  id: string;
  hora: string;
  atividade: string;
  icone: string;
  concluida: boolean;
}

const todasAtividades: Atividade[] = [
  {
    id: '1',
    nome: 'Passeio matinal no parque',
    categoria: 'caminhada',
    intensidade: 'baixa',
    duracao: '20-30 min',
    descricao: 'Caminhada leve em área verde, permitindo que o pet fareje e socialize com outros animais.',
    beneficios: ['Estimula o sentido do faro', 'Socialização', 'Exercício aeróbico leve', 'Reduz ansiedade'],
    dicas: ['Leve água e tigela', 'Evite os horários de mais calor', 'Mantenha a guia relaxada'],
    indicadaPara: ['Filhote', 'Adulto', 'Sênior', 'Porte pequeno', 'Porte médio', 'Porte grande'],
    equipamento: ['Guia e peitoral', 'Sacos de coleta'],
  },
  {
    id: '2',
    nome: 'Brincadeira de buscar (fetch)',
    categoria: 'brincadeira',
    intensidade: 'media',
    duracao: '15-20 min',
    descricao: 'Jogar bolinha ou frisbee em área aberta, estimulando o instinto de caça e exercício.',
    beneficios: ['Exercício intenso', 'Fortalece vínculo', 'Estimula obediência', 'Divertido'],
    dicas: ['Use brinquedos macios para dentes sensíveis', 'Não force se o pet estiver cansado', 'Varie a direção'],
    indicadaPara: ['Adulto', 'Porte médio', 'Porte grande'],
    equipamento: ['Bolinha de borracha', 'Frisbee macio'],
  },
  {
    id: '3',
    nome: 'Adestramento básico',
    categoria: 'obediencia',
    intensidade: 'baixa',
    duracao: '10-15 min',
    descricao: 'Treinar comandos como sentar, ficar, vir e deitar usando recompensas positivas.',
    beneficios: ['Estimula o cérebro', 'Fortalece obediência', 'Melhora comunicação', 'Reduz comportamentos indesejados'],
    dicas: ['Use petiscos pequenos', 'Sessões curtas e frequentes', 'Sempre termine com sucesso'],
    indicadaPara: ['Filhote', 'Adulto', 'Qualquer porte'],
    equipamento: ['Petiscos', 'Clicker (opcional)'],
  },
  {
    id: '4',
    nome: 'Natação em piscina',
    categoria: 'natacao',
    intensidade: 'media',
    duracao: '20-30 min',
    descricao: 'Exercício aquático ideal para cães com problemas articulares ou que precisam de baixo impacto.',
    beneficios: ['Baixo impacto articular', 'Fortalece músculos', 'Resfria o corpo', 'Exercício completo'],
    dicas: ['Comece em áreas rasas', 'Nunca deixe sozinho', 'Lave o pelo após a água', 'Use colete salva-vidas se necessário'],
    indicadaPara: ['Adulto', 'Sênior', 'Porte grande', 'Cães com problemas articulares'],
    equipamento: ['Colete salva-vidas', 'Toalha'],
  },
  {
    id: '5',
    nome: 'Agility caseiro',
    categoria: 'agility',
    intensidade: 'alta',
    duracao: '15-20 min',
    descricao: 'Criar obstáculos simples em casa com cadeiras, caixas e cones para o pet superar.',
    beneficios: ['Exercício intenso', 'Estimula coordenação', 'Fortalece confiança', 'Muito divertido'],
    dicas: ['Comece com obstáculos baixos', 'Use recompensas generosas', 'Não force saltos altos'],
    indicadaPara: ['Adulto', 'Porte médio', 'Porte grande', 'Cães ativos'],
    equipamento: ['Cadeiras', 'Caixas de papel', 'Cones'],
  },
  {
    id: '6',
    nome: 'Brincadeira de puxa-corda',
    categoria: 'brincadeira',
    intensidade: 'media',
    duracao: '10-15 min',
    descricao: 'Jogo interativo que estimula o instinto de caça e fortalece os músculos da mandíbula.',
    beneficios: ['Fortalece mandíbula', 'Estimula instinto', 'Exercício moderado', 'Diversão garantida'],
    dicas: ['Use corda resistente', 'Não puxe com força excessiva', 'Ceda sempre para ensinar a soltar'],
    indicadaPara: ['Filhote', 'Adulto', 'Porte pequeno', 'Porte médio'],
    equipamento: ['Corda de algodão resistente'],
  },
  {
    id: '7',
    nome: 'Treino de agility com obstáculos',
    categoria: 'agility',
    intensidade: 'alta',
    duracao: '20-30 min',
    descricao: 'Corrida e superação de obstáculos como túneis, saltos e equilíbrio.',
    beneficios: ['Exercício aeróbico intenso', 'Coordenação motora', 'Concentração', 'Confiança'],
    dicas: ['Aqueça antes de começar', 'Nunca force o pet a pular', 'Celebre cada conquista'],
    indicadaPara: ['Adulto', 'Porte médio', 'Porte grande', 'Cães ativos'],
    equipamento: ['Saltos ajustáveis', 'Túnel de tecido', 'Placa de equilíbrio'],
  },
  {
    id: '8',
    nome: 'Yoga com o pet (Doga)',
    categoria: 'treino',
    intensidade: 'baixa',
    duracao: '20-30 min',
    descricao: 'Sessão de yoga onde o pet participa naturalmente, criando uma experiência de relaxamento conjunto.',
    beneficios: ['Relaxamento', 'Fortalece vínculo', 'Alongamento suave', 'Reduz ansiedade'],
    dicas: ['Escolha um local tranquilo', 'Respeite o ritmo do pet', 'Use músicas suaves'],
    indicadaPara: ['Adulto', 'Sênior', 'Qualquer porte', 'Cães calmos'],
    equipamento: ['Tapete de yoga', 'Música relaxante'],
  },
  {
    id: '9',
    nome: 'Caminhada na praia',
    categoria: 'caminhada',
    intensidade: 'media',
    duracao: '30-45 min',
    descricao: 'Passeio pela orla, com água rasa e areia macia para o pet explorar.',
    beneficios: ['Exercício moderado', 'Estimulação sensorial', 'Resfriamento natural', 'Novas texturas'],
    dicas: ['Vá em horários frios', 'Cuidado com água salgada', 'Lave o pet após o passeio', 'Leve muita água'],
    indicadaPara: ['Adulto', 'Porte médio', 'Porte grande', 'Cães que gostam de água'],
    equipamento: ['Guia resistente à água', 'Muita água', 'Toalha'],
  },
  {
    id: '10',
    nome: 'Treino de truques',
    categoria: 'obediencia',
    intensidade: 'baixa',
    duracao: '10-15 min',
    descricao: 'Ensinar truques como dar a pata, girar, fingir de morto usando recompensas.',
    beneficios: ['Estimula o cérebro', 'Diversão', 'Fortalece vínculo', 'Melhora concentração'],
    dicas: ['Divida em etapas pequenas', 'Use recompensas variadas', 'Mantenha positivo'],
    indicadaPara: ['Filhote', 'Adulto', 'Qualquer porte'],
    equipamento: ['Petiscos variados', 'Clicker'],
  },
  {
    id: '11',
    nome: 'Caminhada prolongada',
    categoria: 'caminhada',
    intensidade: 'media',
    duracao: '45-60 min',
    descricao: 'Passeio mais longo para queimar calorias e melhorar resistência cardíaca.',
    beneficios: ['Queima calorias', 'Melhora resistência', 'Fortalece articulações', 'Reduz ansiedade'],
    dicas: ['Aumente gradualmente a duração', 'Leve muita água', 'Observe sinais de cansaço', 'Varie o percurso'],
    indicadaPara: ['Adulto', 'Porte médio', 'Porte grande', 'Cães acima do peso'],
    equipamento: ['Guia resistente', 'Água e tigela', 'Sacos de coleta'],
  },
  {
    id: '12',
    nome: 'Brincadeira interativa com obstáculos',
    categoria: 'brincadeira',
    intensidade: 'media',
    duracao: '20-30 min',
    descricao: 'Criar circuito simples em casa com obstáculos para o pet percorrer e queimar energia.',
    beneficios: ['Queima calorias', 'Estimula coordenação', 'Diversão garantida', 'Exercício completo'],
    dicas: ['Use caixas e cadeiras', 'Comece com obstáculos fáceis', 'Recompense ao final', 'Não force'],
    indicadaPara: ['Adulto', 'Porte médio', 'Porte grande', 'Cães acima do peso'],
    equipamento: ['Caixas de papel', 'Cadeiras', 'Petiscos'],
  },
  {
    id: '13',
    nome: 'Natação para emagrecimento',
    categoria: 'natacao',
    intensidade: 'media',
    duracao: '30-40 min',
    descricao: 'Exercício aquático que queima muitas calorias sem sobrecarregar articulações.',
    beneficios: ['Queima muitas calorias', 'Baixo impacto', 'Fortalece músculos', 'Ideal para obesos'],
    dicas: ['Comece com 15 min e aumente', 'Use colete salva-vidas se necessário', 'Lave o pelo após', 'Nunca deixe sozinho'],
    indicadaPara: ['Adulto', 'Sênior', 'Porte grande', 'Cães com sobrepeso'],
    equipamento: ['Colete salva-vidas', 'Toalha', 'Shampoo neutro'],
  },
];

function getAtividadesPorPerfil(raca: string, peso: number, idadeEmMeses: number, objetivo: string) {
  const fase = idadeEmMeses < 6 ? 'filhote' : idadeEmMeses < 12 ? 'adolescente' : idadeEmMeses < 84 ? 'adulto' : 'senior';
  const porte = peso < 10 ? 'pequeno' : peso < 25 ? 'medio' : 'grande';

  return todasAtividades.filter((a) => {
    const indicaFase = a.indicadaPara.some((i) => {
      if (fase === 'filhote') return i === 'Filhote';
      if (fase === 'adolescente') return i === 'Filhote' || i === 'Adulto';
      if (fase === 'senior') return i === 'Sênior' || i === 'Adulto';
      return i === 'Adulto';
    });

    const indicaPorte = a.indicadaPara.some((i) => {
      if (porte === 'pequeno') return i === 'Porte pequeno' || i === 'Qualquer porte';
      if (porte === 'medio') return i === 'Porte médio' || i === 'Qualquer porte';
      return i === 'Porte grande' || i === 'Qualquer porte';
    });

    if (objetivo === 'manutencao' && a.intensidade === 'alta') return false;
    if (objetivo === 'desempenho' && a.intensidade === 'baixa') return false;
    if (objetivo === 'emagrecimento' && a.intensidade === 'alta') return false;

    return indicaFase && indicaPorte;
  });
}

function getCategoriaInfo(cat: string) {
  const info: Record<string, { label: string; cor: string; bg: string; icone: string }> = {
    caminhada: { label: 'Caminhada', cor: 'text-emerald-700', bg: 'bg-emerald-50', icone: '🐕' },
    brincadeira: { label: 'Brincadeira', cor: 'text-blue-700', bg: 'bg-blue-50', icone: '🎾' },
    treino: { label: 'Treino', cor: 'text-purple-700', bg: 'bg-purple-50', icone: '🐾' },
    natacao: { label: 'Natação', cor: 'text-cyan-700', bg: 'bg-cyan-50', icone: '🏊' },
    obediencia: { label: 'Obediência', cor: 'text-amber-700', bg: 'bg-amber-50', icone: '🎯' },
    agility: { label: 'Agility', cor: 'text-rose-700', bg: 'bg-rose-50', icone: '🦴' },
  };
  return info[cat] || info.brincadeira;
}

function getIntensidadeInfo(int: string) {
  const info: Record<string, { label: string; cor: string; bg: string }> = {
    baixa: { label: 'Baixa', cor: 'text-emerald-700', bg: 'bg-emerald-50' },
    media: { label: 'Média', cor: 'text-amber-700', bg: 'bg-amber-50' },
    alta: { label: 'Alta', cor: 'text-rose-700', bg: 'bg-rose-50' },
  };
  return info[int] || info.baixa;
}

export default function AtividadesPage() {
  const { pet } = usePetStore();
  const [filtroCat, setFiltroCat] = useState<string>('caminhada');
  const [filtroIntensidade, setFiltroIntensidade] = useState<string>('baixa');
  const [expandida, setExpandida] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<CheckItem[]>([]);
  const [novaAtividade, setNovaAtividade] = useState(false);

  useEffect(() => {
    if (!pet) return;
    const supabase = createClient();
    const hoje = diaISO(new Date());
    supabase
      .from('checklist_item')
      .select('*')
      .eq('pet_id', pet.id)
      .eq('lista', 'atividade')
      .eq('dia', hoje)
      .order('hora')
      .then(async ({ data, error }) => {
        if (error) return;
        if (data && data.length > 0) {
          setChecklist(data.map((r) => ({ id: r.id, hora: r.hora, atividade: r.nome, icone: r.detalhe || '🐾', concluida: r.concluida })));
          return;
        }
        const padrao = [
          { hora: '07:00', atividade: 'Passeio matinal', icone: '🐕' },
          { hora: '10:00', atividade: 'Brincadeira', icone: '🎾' },
          { hora: '14:00', atividade: 'Treino de obediência', icone: '🎯' },
          { hora: '17:00', atividade: 'Passeio vespertino', icone: '🦴' },
        ];
        const rows = padrao.map((p) => ({
          id: crypto.randomUUID(),
          pet_id: pet.id,
          lista: 'atividade',
          dia: hoje,
          hora: p.hora,
          nome: p.atividade,
          detalhe: p.icone,
          concluida: false,
        }));
        const { data: inseridos } = await supabase.from('checklist_item').insert(rows).select();
        const criados = inseridos || rows;
        setChecklist(criados.map((r) => ({ id: r.id, hora: r.hora, atividade: r.nome, icone: r.detalhe || '🐾', concluida: r.concluida })));
      });
  }, [pet?.id]);

  const concluirAtividade = (id: string) => {
    setChecklist((prev) => prev.map((c) => (c.id === id ? { ...c, concluida: true } : c)));
    const supabase = createClient();
    supabase.from('checklist_item').update({ concluida: true }).eq('id', id).then();
  };

  const desfazerAtividade = (id: string) => {
    setChecklist((prev) => prev.map((c) => (c.id === id ? { ...c, concluida: false } : c)));
    const supabase = createClient();
    supabase.from('checklist_item').update({ concluida: false }).eq('id', id).then();
  };

  const removerAtividade = (id: string) => {
    setChecklist((prev) => prev.filter((c) => c.id !== id));
    const supabase = createClient();
    supabase.from('checklist_item').delete().eq('id', id).then();
  };

  const adicionarAtividade = () => {
    if (!pet) return;
    const agora = new Date();
    const hora = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
    const id = crypto.randomUUID();
    const nova: CheckItem = { id, hora, atividade: 'Atividade livre', icone: '🐾', concluida: false };
    setChecklist((prev) => [...prev, nova]);
    setNovaAtividade(false);
    const supabase = createClient();
    supabase.from('checklist_item').insert({
      id, pet_id: pet.id, lista: 'atividade', dia: diaISO(agora),
      hora, nome: 'Atividade livre', detalhe: '🐾', concluida: false,
    }).then();
  };

  const pendentes = checklist.filter((c) => !c.concluida);
  const concluidas = checklist.filter((c) => c.concluida);

  if (!pet) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-2xl px-4 py-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">Cadastre um pet primeiro para ver atividades personalizadas.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const idadeEmMeses = Math.floor((new Date().getTime() - new Date(pet.dataNascimento).getTime()) / (1000 * 60 * 60 * 24 * 30));
  const fase = idadeEmMeses < 6 ? 'Filhote' : idadeEmMeses < 12 ? 'Adolescente' : idadeEmMeses < 84 ? 'Adulto' : 'Sênior';
  const porte = pet.peso < 10 ? 'Pequeno' : pet.peso < 25 ? 'Médio' : 'Grande';

  const atividadesFiltradas = getAtividadesPorPerfil(pet.raca, pet.peso, idadeEmMeses, pet.objetivo).filter((a) => {
    if (a.categoria !== filtroCat) return false;
    if (a.intensidade !== filtroIntensidade) return false;
    return true;
  });

  const categorias = ['caminhada', 'brincadeira', 'treino', 'natacao', 'obediencia', 'agility'];
  const intensidades = ['baixa', 'media', 'alta'];

  const rotinaSugerida = [
    { dia: 'Seg', atividade: 'Passeio + Adestramento', duracao: '40 min', icone: '🐕', cor: 'bg-emerald-50 text-emerald-700' },
    { dia: 'Ter', atividade: 'Buscar (fetch)', duracao: '20 min', icone: '🎾', cor: 'bg-blue-50 text-blue-700' },
    { dia: 'Qua', atividade: 'Passeio longo', duracao: '45 min', icone: '🦴', cor: 'bg-emerald-50 text-emerald-700' },
    { dia: 'Qui', atividade: 'Treino de truques', duracao: '15 min', icone: '🎯', cor: 'bg-amber-50 text-amber-700' },
    { dia: 'Sex', atividade: 'Passeio + Natação', duracao: '50 min', icone: '🏊', cor: 'bg-cyan-50 text-cyan-700' },
    { dia: 'Sáb', atividade: 'Agility caseiro', duracao: '25 min', icone: '🐾', cor: 'bg-rose-50 text-rose-700' },
    { dia: 'Dom', atividade: 'Passeio leve', duracao: '30 min', icone: '🐕', cor: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <header className="mb-8">
            <BackButton href="/dashboard" />
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              {atividadesFiltradas.length} atividades disponíveis
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Atividades para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">{pet.nome}</span>
            </h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
              Exercícios e dicas personalizadas para manter seu pet saudável e ativo
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3 space-y-6">
              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Perfil do pet</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center ring-1 ring-amber-100 dark:from-amber-950 dark:to-orange-950 dark:ring-amber-900">
                    <span className="text-2xl">🐕</span>
                    <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">Raça</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{pet.raca}</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4 text-center ring-1 ring-blue-100 dark:from-blue-950 dark:to-cyan-950 dark:ring-blue-900">
                    <ScaleIcon3D size={28} className="mx-auto" />
                    <p className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">Peso</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{pet.peso} kg</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-center ring-1 ring-emerald-100 dark:from-emerald-950 dark:to-teal-950 dark:ring-emerald-900">
                    <span className="text-2xl">🌱</span>
                    <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">Fase</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{fase}</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 text-center ring-1 ring-purple-100 dark:from-purple-950 dark:to-pink-950 dark:ring-purple-900">
                    <span className="text-2xl">📏</span>
                    <p className="mt-2 text-xs font-medium text-purple-600 dark:text-purple-400">Porte</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{porte}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-lg ring-1 ring-slate-100 dark:from-slate-900 dark:to-blue-950/30 dark:ring-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Atividades recomendadas</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Filtre por categoria e intensidade</p>
                  </div>
                  <span className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                    {atividadesFiltradas.length} atividades
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {categorias.map((c) => {
                    const info = getCategoriaInfo(c);
                    const isActive = filtroCat === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setFiltroCat(c)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg scale-105'
                            : 'bg-white text-slate-600 hover:bg-slate-50 hover:scale-105 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700'
                        }`}
                      >
                        <span className="text-lg">{info.icone}</span>
                        {info.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {intensidades.map((i) => {
                    const info = getIntensidadeInfo(i);
                    const isActive = filtroIntensidade === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setFiltroIntensidade(i)}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg scale-105'
                            : 'bg-white text-slate-600 hover:bg-slate-50 hover:scale-105 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700'
                        }`}
                      >
                        {info.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 space-y-4">
                  {atividadesFiltradas.map((atividade) => {
                    const catInfo = getCategoriaInfo(atividade.categoria);
                    const intInfo = getIntensidadeInfo(atividade.intensidade);
                    const isExpandida = expandida === atividade.id;

                    return (
                      <div
                        key={atividade.id}
                        className={`group rounded-2xl border transition-all duration-300 ${
                          isExpandida
                            ? 'border-blue-200 bg-gradient-to-br from-blue-50/50 to-white shadow-xl ring-2 ring-blue-100 dark:border-blue-800 dark:from-blue-950/50 dark:to-slate-900 dark:ring-blue-900'
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                        }`}
                      >
                        <div
                          className="flex cursor-pointer items-start gap-4 p-5"
                          onClick={() => setExpandida(isExpandida ? null : atividade.id)}
                        >
                          <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-3xl transition group-hover:scale-110 ${catInfo.bg}`}>
                            {catInfo.icone}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${catInfo.bg} ${catInfo.cor}`}>
                                {catInfo.label}
                              </span>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${intInfo.bg} ${intInfo.cor}`}>
                                {intInfo.label}
                              </span>
                            </div>
                            <h3 className="mt-2 text-lg font-black text-slate-900 group-hover:text-slate-950 dark:text-white dark:group-hover:text-white">{atividade.nome}</h3>
                            <p className="mt-1 text-sm text-slate-500 line-clamp-2 dark:text-slate-400">{atividade.descricao}</p>
                            <div className="mt-2.5 flex items-center gap-3">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"/>
                                  <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                {atividade.duracao}
                              </span>
                            </div>
                          </div>
                          <svg
                            className={`h-6 w-6 flex-shrink-0 text-slate-400 transition-transform ${isExpandida ? 'rotate-180 text-blue-500' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>

                        {isExpandida && (
                          <div className="border-t border-slate-100 dark:border-slate-800 px-5 pb-5 pt-5 space-y-4 animate-slide-up">
                            <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950">
                              <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                Benefícios
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {atividade.beneficios.map((b) => (
                                  <span key={b} className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">{b}</span>
                                ))}
                              </div>
                            </div>
                            <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950">
                              <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="12" y1="16" x2="12" y2="12"/>
                                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                Dicas
                              </p>
                              <ul className="mt-2 space-y-1.5">
                                {atividade.dicas.map((d) => (
                                  <li key={d} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400"/>
                                    {d}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {atividade.equipamento && (
                              <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
                                <p className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                  </svg>
                                  Equipamento
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {atividade.equipamento.map((e) => (
                                    <span key={e} className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">{e}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {atividadesFiltradas.length === 0 && (
                    <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 py-12 text-center dark:from-slate-900 dark:to-slate-800">
                      <span className="text-5xl">🔍</span>
                      <p className="mt-4 text-base font-bold text-slate-700 dark:text-slate-300">Nenhuma atividade encontrada</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Tente outros filtros</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              {/* Checklist Diário */}
              <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-600 p-5 text-white shadow-xl shadow-blue-500/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Checklist de Hoje</h3>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold backdrop-blur-sm">
                    {concluidas.length}/{checklist.length}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {pendentes.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl bg-white/15 p-3 backdrop-blur-sm transition-all hover:bg-white/25"
                    >
                      <button
                        onClick={() => concluirAtividade(item.id)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-white/40 transition hover:border-white hover:bg-white/20"
                      >
                        <span className="text-xs">✓</span>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white/80">{item.hora}</span>
                          <span className="text-sm font-bold">{item.atividade}</span>
                        </div>
                      </div>
                      <span className="text-lg">{item.icone}</span>
                      <button
                        onClick={() => removerAtividade(item.id)}
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
                      {concluidas.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-xl bg-white/10 p-2.5 opacity-60 transition-all"
                        >
                          <button
                            onClick={() => desfazerAtividade(item.id)}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/30 transition hover:bg-white/40"
                          >
                            <span className="text-[10px]">↩</span>
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/60 line-through">{item.hora}</span>
                              <span className="text-xs font-bold text-white/60 line-through">{item.atividade}</span>
                            </div>
                          </div>
                          <span className="text-sm opacity-60">{item.icone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setNovaAtividade(true)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/30 py-2.5 text-sm font-bold text-white/80 transition hover:border-white/50 hover:bg-white/10"
                >
                  <span>+</span> Adicionar atividade
                </button>
              </div>

              {/* Modal Nova Atividade */}
              {novaAtividade && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nova Atividade</h3>
                  <div className="mt-3 space-y-3">
                    <button
                      onClick={adicionarAtividade}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-3 text-sm font-bold text-white transition hover:shadow-lg"
                    >
                      🐾 Adicionar agora
                    </button>
                    <button
                      onClick={() => setNovaAtividade(false)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rotina semanal</h3>
                <div className="mt-4 space-y-2">
                  {rotinaSugerida.map((r) => (
                    <div key={r.dia} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${r.cor}`}>
                      <span className="text-lg">{r.icone}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold">{r.dia}</p>
                        <p className="text-xs opacity-80 truncate">{r.atividade}</p>
                      </div>
                      <span className="text-xs font-medium opacity-70">{r.duracao}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white shadow-lg shadow-amber-500/30">
                <h3 className="text-sm font-bold">Dicas gerais</h3>
                <ul className="mt-3 space-y-2 text-xs text-white/90">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">💡</span>
                    Sempre aqueça o pet antes de exercícios intensos
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">💧</span>
                    Mantenha água disponível durante as atividades
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">👀</span>
                    Observe sinais de cansaço e pare se necessário
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">⏰</span>
                    Evite exercícios logo após as refeições
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">🩺</span>
                    Consulte o veterinário antes de iniciar nova rotina
                  </li>
                </ul>
              </div>


            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
