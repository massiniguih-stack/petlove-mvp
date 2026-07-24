'use client';

import { usePetStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { format, differenceInMonths, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import {
  CalendarIcon3D,
  PawIcon3D,
  DogIcon3D,
  CakeIcon3D,
  PartyIcon3D,
  BoneIcon3D,
  TrophyIcon3D,
  ScaleIcon3D,
  MedalIcon3D,
  PremiumIcon3D,
  CrownIcon3D,
  CheckIcon3D,
  HealthIcon3D,
} from '@/components/Icons3D';

/** Tamanho único dos ícones nos círculos da linha do tempo */
const MARCO_ICON_SIZE = 44;
const MARCO_CIRCLE = 64; // h/w do círculo em px

interface Momento {
  id: string;
  data: Date;
  titulo: string;
  descricao: string;
  categoria: 'nascimento' | 'vacina' | 'doenca' | 'conquista' | 'evento' | 'foto' | 'viagem';
  fotoUrl?: string;
  mesMes?: number;
  statusVacina?: 'tomada' | 'pendente';
  dataAgendada?: Date;
  lembreteEnviado?: boolean;
}

function momentoFromRow(row: Record<string, unknown>): Momento {
  return {
    id: row.id as string,
    data: new Date(row.data as string),
    titulo: row.titulo as string,
    descricao: (row.descricao as string) || '',
    categoria: row.categoria as Momento['categoria'],
    fotoUrl: (row.foto_url as string) || undefined,
    statusVacina: (row.status_vacina as 'tomada' | 'pendente') || undefined,
    dataAgendada: row.data_agendada ? new Date(row.data_agendada as string) : undefined,
    lembreteEnviado: Boolean(row.lembrete_enviado_em),
  };
}

function momentoToRow(m: Omit<Momento, 'id'>) {
  return {
    data: m.data.toISOString(),
    titulo: m.titulo,
    descricao: m.descricao || null,
    categoria: m.categoria,
    foto_url: m.fotoUrl || null,
    status_vacina: m.statusVacina || null,
    data_agendada: m.dataAgendada ? format(m.dataAgendada, 'yyyy-MM-dd') : null,
  };
}

const vacinasComuns = [
  { nome: 'V10 (Polivalente)', descricao: 'Proteção contra cinomose, parvovirose, adenovírose e leptospirose' },
  { nome: 'V8', descricao: 'Proteção contra adenovírose, parvovirose, cinomose e leptospirose' },
  { nome: 'Raiva', descricao: 'Vacina obrigatória anual contra raiva' },
  { nome: 'Gripe Canina', descricao: 'Proteção contra tosse dos canis' },
  { nome: 'Leptospirose', descricao: 'Proteção contra leptospirose bacteriana' },
  { nome: 'Giárdia', descricao: 'Proteção contra giardíase intestinal' },
  { nome: 'Lyme', descricao: 'Proteção contra doença de Lyme (carrapato)' },
];

const categorias = [
  { id: 'nascimento', label: 'Nascimento', cor: 'bg-pink-500', corGrad: 'from-pink-500 to-rose-500', emoji: '🍼', iconSrc: '/icons/3d/dog.png' },
  { id: 'vacina', label: 'Vacina', cor: 'bg-blue-500', corGrad: 'from-blue-500 to-indigo-500', emoji: '💉', iconSrc: '/icons/3d/saude.png' },
  { id: 'doenca', label: 'Doença', cor: 'bg-red-500', corGrad: 'from-red-500 to-rose-500', emoji: '🏥', iconSrc: '/icons/3d/shield.png' },
  { id: 'conquista', label: 'Conquista', cor: 'bg-amber-500', corGrad: 'from-amber-500 to-orange-500', emoji: '🏆', iconSrc: '/icons/3d/trophy.png' },
  { id: 'evento', label: 'Evento', cor: 'bg-purple-500', corGrad: 'from-purple-500 to-pink-500', emoji: '🎉', iconSrc: '/icons/3d/festa.png' },
  { id: 'foto', label: 'Foto', cor: 'bg-emerald-500', corGrad: 'from-emerald-500 to-teal-500', emoji: '📸', iconSrc: '/icons/3d/check.png' },
  { id: 'viagem', label: 'Viagem', cor: 'bg-cyan-500', corGrad: 'from-cyan-500 to-blue-500', emoji: '✈️', iconSrc: '/icons/3d/servicos.png' },
];

function CategoriaBadge({ categoria }: { categoria: Momento['categoria'] }) {
  const cat = categorias.find((c) => c.id === categoria);
  if (!cat) return null;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white ${cat.cor}`}>
      <Image src={cat.iconSrc} alt="" width={14} height={14} unoptimized className="icon-3d" />
      {cat.label}
    </span>
  );
}

function NovoMomentoForm({ onClose, onSave, editando, dataNascimento, categoriaPadrao }: { onClose: () => void; onSave: (m: Omit<Momento, 'id'>) => void; editando?: Momento; dataNascimento: string; categoriaPadrao?: Momento['categoria'] }) {
  const [data, setData] = useState(editando?.data ? format(editando.data, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [titulo, setTitulo] = useState(editando?.titulo || '');
  const [descricao, setDescricao] = useState(editando?.descricao || '');
  const [categoria, setCategoria] = useState<Momento['categoria']>(editando?.categoria || categoriaPadrao || 'evento');
  const [fotoUrl, setFotoUrl] = useState(editando?.fotoUrl || '');
  const [statusVacina, setStatusVacina] = useState<'tomada' | 'pendente'>(editando?.statusVacina || 'tomada');
  const [dataAgendada, setDataAgendada] = useState(editando?.dataAgendada ? format(editando.dataAgendada, 'yyyy-MM-dd') : '');
  const [usarVacinaComum, setUsarVacinaComum] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVacinaComumSelect = (vacina: typeof vacinasComuns[0]) => {
    setTitulo(vacina.nome);
    setDescricao(vacina.descricao);
    setUsarVacinaComum(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const dataMomento = statusVacina === 'pendente' && dataAgendada ? new Date(dataAgendada) : new Date(data);
    const nascimento = new Date(dataNascimento);
    const mesAtual = differenceInMonths(dataMomento, nascimento);

    onSave({
      data: dataMomento,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      fotoUrl: fotoUrl || undefined,
      mesMes: mesAtual >= 0 ? mesAtual : undefined,
      statusVacina: categoria === 'vacina' ? statusVacina : undefined,
      dataAgendada: statusVacina === 'pendente' && dataAgendada ? new Date(dataAgendada) : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{editando ? '✏️ Editar momento' : '📸 Novo momento'}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Registre um momento especial na vida do seu pet</p>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <span className="text-lg">📅</span> Data
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white transition focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <span className="text-lg">🏷️</span> Categoria
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoria(cat.id as Momento['categoria'])}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition ${
                    categoria === cat.id
                      ? `${cat.cor} text-white shadow-md`
                      : ' bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Image src={cat.iconSrc} alt="" width={18} height={18} unoptimized className="icon-3d" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campos específicos para Vacinas */}
          {categoria === 'vacina' && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💉</span>
                <span className="text-sm font-bold text-blue-800">Tipo de Vacina</span>
              </div>
              
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setStatusVacina('tomada')}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    statusVacina === 'tomada'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-white text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  ✅ Já tomou
                </button>
                <button
                  type="button"
                  onClick={() => setStatusVacina('pendente')}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    statusVacina === 'pendente'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-white text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  📅 Ainda vai tomar
                </button>
              </div>

              <button
                type="button"
                onClick={() => setUsarVacinaComum(true)}
                className="w-full rounded-xl bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                📋 Selecionar vacina comum
              </button>

              {usarVacinaComum && (
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                  {vacinasComuns.map((vacina) => (
                    <button
                      key={vacina.nome}
                      type="button"
                      onClick={() => handleVacinaComumSelect(vacina)}
                      className="w-full rounded-xl bg-white dark:bg-slate-900 p-3 text-left transition hover:bg-blue-100 dark:hover:bg-blue-900"
                    >
                      <div className="font-semibold text-slate-900 dark:text-white">{vacina.nome}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{vacina.descricao}</div>
                    </button>
                  ))}
                </div>
              )}

              {statusVacina === 'pendente' && (
                <div className="mt-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-amber-700">
                    <span className="text-lg">⏰</span> Data agendada
                  </label>
                  <input
                    type="date"
                    value={dataAgendada}
                    onChange={(e) => setDataAgendada(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-amber-200 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <p className="mt-2 text-xs text-amber-600">
                    📲 Você receberá um lembrete antes da data agendada
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <span className="text-lg">✨</span> Título
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder={categoria === 'vacina' ? 'Ex: V10, Raiva, Gripe...' : 'Ex: Primeira vacina, Dia do parque...'}
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 transition focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <span className="text-lg">📝</span> Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={categoria === 'vacina' ? 'Local, veterinário, observações...' : 'Conte mais sobre este momento especial...'}
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 transition focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <span className="text-lg">📷</span> Foto (opcional)
            </label>
            <div className="mt-2 flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 transition hover:border-rose-400 hover:text-rose-600"
              >
                {fotoUrl ? '🔄 Trocar foto' : '📷 Adicionar foto'}
              </button>
              {fotoUrl && (
                <div className="relative">
                  <img src={fotoUrl} alt="Preview" className="h-16 w-16 rounded-xl object-cover shadow-md" />
                  <button
                    type="button"
                    onClick={() => setFotoUrl('')}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-md hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border-2 border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition hover:shadow-xl hover:shadow-rose-500/40">
              {editando ? '💾 Salvar' : '✨ Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LinhaDoTempo({ momentos, pet, onEdit, onDelete, onMarcarTomada }: { momentos: Momento[]; pet: { nome: string; dataNascimento: string; fotoUrl: string | null }; onEdit: (m: Momento) => void; onDelete: (id: string) => void; onMarcarTomada: (id: string) => void }) {
  const nascimento = new Date(pet.dataNascimento);
  const hoje = new Date();
  const totalMeses = differenceInMonths(hoje, nascimento);
  const [marcoSelecionado, setMarcoSelecionado] = useState<number | null>(null);

  const momentosComMes = useMemo(() => {
    return momentos
      .map((m) => ({
        ...m,
        mes: differenceInMonths(m.data, nascimento),
      }))
      .sort((a, b) => a.mes - b.mes);
  }, [momentos, nascimento]);

  const marcos = useMemo(() => {
    type MarcoIcon = typeof PawIcon3D;
    const lista: {
      mes: number;
      label: string;
      emoji: string;
      icone?: string;
      IconComp?: MarcoIcon;
      cor: string;
      momento?: Momento;
    }[] = [];

    // Todos com IconComp + mesmo tamanho no render — evita misturar Image solto (miúdo) com Soft 3D (maior).
    const marcosImportantes: {
      mes: number;
      label: string;
      emoji: string;
      IconComp: MarcoIcon;
      cor: string;
    }[] = [
      { mes: 2, label: '2 meses', emoji: '🐾', IconComp: PawIcon3D, cor: 'from-amber-400 to-orange-400' },
      { mes: 4, label: '4 meses', emoji: '🦴', IconComp: BoneIcon3D, cor: 'from-emerald-400 to-teal-400' },
      { mes: 6, label: '6 meses', emoji: '🎂', IconComp: CakeIcon3D, cor: 'from-purple-400 to-pink-400' },
      { mes: 9, label: '9 meses', emoji: '🐕', IconComp: DogIcon3D, cor: 'from-blue-400 to-indigo-400' },
      { mes: 12, label: '1 ano', emoji: '🎉', IconComp: PartyIcon3D, cor: 'from-rose-400 to-pink-400' },
      { mes: 18, label: '1.5 anos', emoji: '🌟', IconComp: PremiumIcon3D, cor: 'from-cyan-400 to-blue-400' },
      { mes: 24, label: '2 anos', emoji: '🏆', IconComp: TrophyIcon3D, cor: 'from-amber-500 to-orange-500' },
      { mes: 36, label: '3 anos', emoji: '💪', IconComp: ScaleIcon3D, cor: 'from-violet-500 to-purple-500' },
      { mes: 48, label: '4 anos', emoji: '🎖️', IconComp: MedalIcon3D, cor: 'from-indigo-500 to-blue-500' },
      { mes: 60, label: '5 anos', emoji: '⭐', IconComp: PremiumIcon3D, cor: 'from-yellow-500 to-amber-500' },
      { mes: 84, label: '7 anos', emoji: '🏅', IconComp: MedalIcon3D, cor: 'from-emerald-500 to-green-500' },
      { mes: 120, label: '10 anos', emoji: '👑', IconComp: CrownIcon3D, cor: 'from-pink-500 to-rose-500' },
    ];

    for (const marco of marcosImportantes) {
      if (marco.mes <= totalMeses + 1) {
        const momento = momentosComMes.find((m) => m.mes === marco.mes);
        lista.push({ ...marco, momento });
      }
    }

    const outrosMomentos = momentosComMes.filter((m) =>
      !lista.some((l) => l.mes === m.mes)
    );
    
    for (const m of outrosMomentos) {
      const cat = categorias.find((c) => c.id === m.categoria);
      lista.push({
        mes: m.mes,
        label: m.titulo,
        emoji: cat?.emoji || '📌',
        cor: cat?.corGrad || 'from-slate-400 to-slate-500',
        momento: m,
      });
    }

    return lista.sort((a, b) => a.mes - b.mes);
  }, [momentosComMes, totalMeses]);

  const getMesLabel = (mes: number) => {
    if (mes === 0) return 'Nascimento';
    if (mes < 12) return `${mes}m`;
    const anos = Math.floor(mes / 12);
    const mesesRest = mes % 12;
    if (mesesRest === 0) return `${anos}a`;
    return `${anos}a ${mesesRest}m`;
  };

  const marcoDetalhe = marcos.find((m) => m.mes === marcoSelecionado);

  return (
    <div className="relative">
      {/* Timeline grid - scrollável horizontal */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent" style={{ WebkitOverflowScrolling: 'touch' }}>
        {marcos.map((marco) => {
          const isAtual = marco.mes === totalMeses;
          const isProximo = marco.mes === totalMeses + 1;
          const isSelected = marco.mes === marcoSelecionado;
          
          return (
            <button
              key={marco.mes}
              type="button"
              onClick={() => setMarcoSelecionado(isSelected ? null : marco.mes)}
              className="flex w-20 shrink-0 flex-col items-center gap-2 bg-transparent p-1 transition-all focus:outline-none"
            >
              {/* Só o círculo recebe estado de seleção — sem “quadrado” no botão */}
              <div
                className={[
                  'relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br text-white shadow-md transition-all',
                  marco.cor,
                  'hover:scale-105',
                  isSelected
                    ? 'scale-110 ring-2 ring-rose-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-950'
                    : '',
                  !isSelected && isAtual ? 'ring-2 ring-rose-400 ring-offset-1' : '',
                  !isSelected && isProximo ? 'ring-2 ring-amber-400 ring-offset-1 animate-pulse' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ width: MARCO_CIRCLE, height: MARCO_CIRCLE }}
              >
                {marco.IconComp ? (
                  <marco.IconComp size={MARCO_ICON_SIZE} />
                ) : marco.icone ? (
                  <Image
                    src={marco.icone}
                    alt=""
                    width={MARCO_ICON_SIZE}
                    height={MARCO_ICON_SIZE}
                    unoptimized
                    className="icon-3d object-contain"
                    style={{ width: MARCO_ICON_SIZE, height: MARCO_ICON_SIZE }}
                  />
                ) : (
                  <span className="text-2xl leading-none">{marco.emoji}</span>
                )}
                {isAtual && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </div>
              <div className="text-center">
                <div className={`text-xs font-bold leading-tight ${isAtual ? 'text-rose-600' : isProximo ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300'}`}>
                  {getMesLabel(marco.mes)}
                </div>
                {marco.momento && (
                  <div className="mt-0.5 max-w-[72px] truncate text-[10px] text-slate-400 dark:text-slate-500">
                    {marco.momento.titulo}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {marcoDetalhe && (
        <div className="mt-4 rounded-2xl border border-rose-100 bg-gradient-to-br from-amber-50 to-rose-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div
              className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${marcoDetalhe.cor} text-white shadow-md`}
              style={{ width: MARCO_CIRCLE, height: MARCO_CIRCLE }}
            >
              {marcoDetalhe.IconComp ? (
                <marcoDetalhe.IconComp size={MARCO_ICON_SIZE} />
              ) : marcoDetalhe.icone ? (
                <Image
                  src={marcoDetalhe.icone}
                  alt=""
                  width={MARCO_ICON_SIZE}
                  height={MARCO_ICON_SIZE}
                  unoptimized
                  className="icon-3d object-contain"
                  style={{ width: MARCO_ICON_SIZE, height: MARCO_ICON_SIZE }}
                />
              ) : (
                <span className="text-2xl leading-none">{marcoDetalhe.emoji}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{marcoDetalhe.label}</h3>
                {marcoDetalhe.momento && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                    Registrado
                  </span>
                )}
              </div>
              
              {marcoDetalhe.momento ? (
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{marcoDetalhe.momento.titulo}</p>
                    {marcoDetalhe.momento.descricao && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{marcoDetalhe.momento.descricao}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <CategoriaBadge categoria={marcoDetalhe.momento.categoria} />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {format(marcoDetalhe.momento.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  {marcoDetalhe.momento.fotoUrl && (
                    <img 
                      src={marcoDetalhe.momento.fotoUrl} 
                      alt={marcoDetalhe.momento.titulo}
                      className="mt-2 h-24 w-24 rounded-xl object-cover shadow-md"
                    />
                  )}
                  <div className="flex flex-wrap gap-2">
                    {marcoDetalhe.momento.categoria === 'vacina' && marcoDetalhe.momento.statusVacina === 'pendente' && (
                      <button
                        onClick={() => onMarcarTomada(marcoDetalhe.momento!.id)}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-600"
                      >
                        ✅ Já tomou
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(marcoDetalhe.momento!)}
                      className="rounded-lg bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-800 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => { onDelete(marcoDetalhe.momento!.id); setMarcoSelecionado(null); }}
                      className="rounded-lg bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-red-500 ring-1 ring-red-100 transition hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Nenhum momento registrado para este marco.
                </p>
              )}
            </div>
            <button
              onClick={() => setMarcoSelecionado(null)}
              className="shrink-0 rounded-lg p-1 text-slate-400 dark:text-slate-500 transition hover:bg-white hover:text-slate-600"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Resumo */}
      {marcos.length > 0 && (
        <div className="mt-4 rounded-xl bg-gradient-to-r from-amber-50 to-rose-50 p-3 dark:from-amber-950/40 dark:to-rose-950/40">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="icon-3d-slot"><CalendarIcon3D size={16} /></span>
              <span className="font-bold text-slate-900 dark:text-white">{pet.nome}</span> tem{' '}
              <span className="font-bold text-rose-600">{totalMeses} {totalMeses === 1 ? 'mês' : 'meses'}</span>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {momentos.length} momento{momentos.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function GaleriaFotos({ fotos, onAdicionar, onAbrir, onFechar }: { fotos: Momento[]; onAdicionar: () => void; onAbrir: (m: Momento) => void; onFechar: () => void }) {
  return (
    <div id="galeria" className="mb-8 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <span className="icon-3d-slot"><CheckIcon3D size={28} /></span>
            Galeria de fotos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {fotos.length > 0 ? `${fotos.length} foto${fotos.length !== 1 ? 's' : ''}, em ordem cronológica` : 'Nenhuma foto ainda'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAdicionar}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:shadow-lg"
          >
            📷 Adicionar foto
          </button>
          <button
            onClick={onFechar}
            className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {fotos.length === 0 ? (
        <button
          onClick={onAdicionar}
          className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 py-10 text-slate-500 dark:text-slate-400 transition hover:border-rose-400 hover:text-rose-600"
        >
          <span className="text-3xl">📷</span>
          <span className="text-sm font-semibold">Adicionar a primeira foto</span>
        </button>
      ) : (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent" style={{ WebkitOverflowScrolling: 'touch' }}>
          {fotos.map((foto) => (
            <button
              key={foto.id}
              onClick={() => onAbrir(foto)}
              className="group flex shrink-0 flex-col items-center gap-1.5"
            >
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl shadow-md ring-1 ring-slate-200 dark:ring-slate-800 transition group-hover:ring-2 group-hover:ring-rose-300">
                <img src={foto.fotoUrl} alt={foto.titulo} className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <span className="max-w-[96px] truncate text-[11px] font-semibold text-slate-600 dark:text-slate-400">{foto.titulo}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{format(foto.data, 'dd/MM/yy')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FotoAmpliada({ momento, onClose, onEdit, onDelete }: { momento: Momento; onClose: () => void; onEdit: (m: Momento) => void; onDelete: (id: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={momento.fotoUrl} alt={momento.titulo} className="w-full object-cover" style={{ maxHeight: '420px' }} />
        <div className="p-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{momento.titulo}</h3>
            <CategoriaBadge categoria={momento.categoria} />
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{format(momento.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
          {momento.descricao && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{momento.descricao}</p>}
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border-2 border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Fechar
            </button>
            <button
              onClick={() => { onEdit(momento); onClose(); }}
              className="rounded-lg bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-800 transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              ✏️ Editar
            </button>
            <button
              onClick={() => { onDelete(momento.id); onClose(); }}
              className="rounded-lg bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-red-500 ring-1 ring-red-100 transition hover:bg-red-50 dark:hover:bg-red-950"
            >
              🗑️ Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DIAS_HISTORICO_GRATIS = 7;

export default function VidaPage() {
  const { pet, petsCarregados, isPremium } = usePetStore();
  const router = useRouter();
  const [momentos, setMomentos] = useState<Momento[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Momento | undefined>();
  const [categoriaPadraoForm, setCategoriaPadraoForm] = useState<Momento['categoria']>('evento');
  const [mostrarGaleria, setMostrarGaleria] = useState(false);
  const [fotoAmpliada, setFotoAmpliada] = useState<Momento | undefined>();

  useEffect(() => {
    if (mostrarGaleria) {
      document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [mostrarGaleria]);

  useEffect(() => {
    if (petsCarregados && !pet) router.push('/onboarding');
  }, [petsCarregados, pet, router]);

  useEffect(() => {
    if (!pet?.id) return;
    const supabase = createClient();
    supabase
      .from('momento')
      .select('*')
      .eq('pet_id', pet.id)
      .order('data')
      .then(({ data, error }) => {
        if (!error && data) setMomentos(data.map(momentoFromRow));
      });
  }, [pet?.id]);

  if (!pet) return null;

  const handleSalvar = async (m: Omit<Momento, 'id'>) => {
    const supabase = createClient();
    if (editando) {
      setMomentos((prev) => prev.map((item) => (item.id === editando.id ? { ...m, id: editando.id } : item)));
      await supabase.from('momento').update(momentoToRow(m)).eq('id', editando.id);
    } else {
      const id = crypto.randomUUID();
      setMomentos((prev) => [...prev, { ...m, id }]);
      await supabase.from('momento').insert({ id, pet_id: pet.id, ...momentoToRow(m) });
    }
    setEditando(undefined);
  };

  const handleExcluir = (id: string) => {
    setMomentos((prev) => prev.filter((m) => m.id !== id));
    const supabase = createClient();
    supabase.from('momento').delete().eq('id', id).then();
  };

  const handleEditar = (m: Momento) => {
    setEditando(m);
    setShowForm(true);
  };

  const momentosOrdenados = [...momentos].sort((a, b) => b.data.getTime() - a.data.getTime());
  // Filtros por categoria (chips) removidos da UI — lista sempre completa.
  const momentosFiltrados = momentosOrdenados;

  // Grátis só vê os últimos DIAS_HISTORICO_GRATIS dias da linha do tempo;
  // as estatísticas do topo (meses de vida, vacinas, etc.) continuam
  // calculadas com o histórico completo, só a lista de momentos é limitada.
  const corteHistorico = new Date();
  corteHistorico.setDate(corteHistorico.getDate() - DIAS_HISTORICO_GRATIS);
  const momentosVisiveis = isPremium ? momentosFiltrados : momentosFiltrados.filter((m) => m.data >= corteHistorico);
  const momentosOcultosPorPlano = momentosFiltrados.length - momentosVisiveis.length;

  const nascimento = new Date(pet.dataNascimento);
  const hoje = new Date();
  const totalMeses = differenceInMonths(hoje, nascimento);
  const totalDias = differenceInDays(hoje, nascimento);
  const totalAnos = Math.floor(totalMeses / 12);
  const mesesRestantes = totalMeses % 12;

  const handleMarcarComoTomada = (id: string) => {
    const agora = new Date();
    setMomentos((prev) => prev.map((m) =>
      m.id === id ? { ...m, statusVacina: 'tomada', data: agora } : m
    ));
    const supabase = createClient();
    supabase.from('momento').update({ status_vacina: 'tomada', data: agora.toISOString() }).eq('id', id).then();
  };

  const primeiraData = momentos.length > 0 ? new Date(Math.min(...momentos.map((m) => m.data.getTime()))) : null;
  const diasVida = primeiraData ? Math.floor((hoje.getTime() - primeiraData.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const primeiraFoto = momentos.find((m) => m.fotoUrl);
  const fotosCronologicas = [...momentos].filter((m) => m.fotoUrl).sort((a, b) => a.data.getTime() - b.data.getTime());

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10">
          {/* Header */}
          <div className="mb-8">
            <BackButton href="/dashboard" />
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              <span className="icon-3d-slot">
                <CalendarIcon3D size={18} />
              </span>
              {totalMeses} {totalMeses === 1 ? 'mês' : 'meses'} de história
              {diasVida > 0 && ` · ${diasVida} dias`}
            </div>
            <div className="mt-3 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="flex flex-wrap items-center gap-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  <span className="icon-3d-slot shrink-0">
                    <HealthIcon3D size={40} />
                  </span>
                  <span>
                    Saúde de{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-500">
                      {pet.nome}
                    </span>
                  </span>
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Linha do tempo · vacinas · momentos e fotos
                </p>
              </div>
              <button
                onClick={() => { setEditando(undefined); setCategoriaPadraoForm('evento'); setShowForm(true); }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition hover:shadow-xl hover:shadow-rose-500/40"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Novo momento
              </button>
            </div>
          </div>

          {/* Stats Cards — Soft 3D (sem emoji solto) */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              onClick={() => {
                const el = document.getElementById('timeline');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 p-4 text-left text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-500/30"
            >
              <div className="text-3xl font-black">{totalMeses}</div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-pink-100">
                <span className="icon-3d-slot"><PawIcon3D size={20} /></span> Meses
              </div>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('timeline');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 p-4 text-left text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/30"
            >
              <div className="text-3xl font-black">{totalDias}</div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-rose-100">
                <span className="icon-3d-slot"><CalendarIcon3D size={20} /></span> Dias
              </div>
            </button>
            <button
              onClick={() => setMostrarGaleria(true)}
              className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-4 text-left text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              <div className="text-3xl font-black">{fotosCronologicas.length}</div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-emerald-100">
                <span className="icon-3d-slot"><CheckIcon3D size={20} /></span> Fotos
              </div>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('timeline');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 text-left text-white shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/30"
            >
              <div className="text-3xl font-black">
                {totalAnos > 0 ? totalAnos : mesesRestantes}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-amber-100">
                <span className="icon-3d-slot"><CakeIcon3D size={20} /></span> Idade
              </div>
            </button>
          </div>


          {/* Galeria de fotos */}
          {mostrarGaleria && (
            <GaleriaFotos
              fotos={fotosCronologicas}
              onAdicionar={() => { setEditando(undefined); setCategoriaPadraoForm('foto'); setShowForm(true); }}
              onAbrir={(m) => setFotoAmpliada(m)}
              onFechar={() => setMostrarGaleria(false)}
            />
          )}

          {/* Timeline — marcos (filtros por categoria removidos da UI) */}
          <div id="timeline" className="mb-2">
            {momentosOcultosPorPlano > 0 && (
              <a
                href="/planos"
                className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 p-4 text-white shadow-lg shadow-purple-500/20 transition hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <Image src="/icons/3d/premium.png" alt="" width={36} height={36} unoptimized className="icon-3d" />
                  <div>
                    <p className="text-sm font-bold">
                      {momentosOcultosPorPlano} {momentosOcultosPorPlano === 1 ? 'momento mais antigo' : 'momentos mais antigos'} disponíve{momentosOcultosPorPlano === 1 ? 'l' : 'is'} só no Premium
                    </p>
                    <p className="text-xs text-purple-100">Grátis mostra os últimos {DIAS_HISTORICO_GRATIS} dias da linha do tempo</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">Assinar →</span>
              </a>
            )}
            <LinhaDoTempo
              momentos={momentosVisiveis}
              pet={{ nome: pet.nome, dataNascimento: pet.dataNascimento, fotoUrl: pet.fotoUrl }}
              onEdit={handleEditar}
              onDelete={handleExcluir}
              onMarcarTomada={handleMarcarComoTomada}
            />
          </div>

          {/* Primeira Foto */}
          {primeiraFoto && (
            <div className="mt-12 rounded-3xl bg-gradient-to-br from-amber-50 to-rose-50 p-6 shadow-sm ring-1 ring-rose-100 dark:ring-rose-900">
              <div className="flex items-center gap-3">
                <div className="icon-3d-slot h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 shadow-lg shadow-rose-500/30">
                  <CheckIcon3D size={36} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Primeira foto registrada</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {format(primeiraFoto.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
              {primeiraFoto.fotoUrl && (
                <div className="mt-4 overflow-hidden rounded-2xl">
                  <img 
                    src={primeiraFoto.fotoUrl} 
                    alt={primeiraFoto.titulo} 
                    className="w-full object-cover shadow-md" 
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {momentos.length === 0 && (
            <div className="mt-12 rounded-3xl bg-white dark:bg-slate-900 py-20 text-center shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-rose-100">
                <CalendarIcon3D size={72} />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
                Comece a contar a história de {pet.nome}
              </h2>
              <p className="mt-2 max-w-sm mx-auto text-slate-500 dark:text-slate-400">
                Adicione fotos, vacinas, conquistas e momentos especiais para criar uma linha do tempo única.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition hover:shadow-xl hover:shadow-rose-500/40"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Adicionar primeiro momento
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {showForm && (
        <NovoMomentoForm
          editando={editando}
          categoriaPadrao={categoriaPadraoForm}
          onClose={() => { setShowForm(false); setEditando(undefined); }}
          onSave={handleSalvar}
          dataNascimento={pet.dataNascimento}
        />
      )}

      {fotoAmpliada && (
        <FotoAmpliada
          momento={fotoAmpliada}
          onClose={() => setFotoAmpliada(undefined)}
          onEdit={handleEditar}
          onDelete={handleExcluir}
        />
      )}
    </div>
  );
}
