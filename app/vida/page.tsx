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
  CakeIcon3D,
  PartyIcon3D,
  TrophyIcon3D,
  ShieldIcon3D,
  CheckIcon3D,
  HealthIcon3D,
  CameraIcon3D,
  VaccineIcon3D,
  TravelIcon3D,
} from '@/components/Icons3D';

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
  { id: 'nascimento', label: 'Nascimento', cor: 'bg-pink-500', corGrad: 'from-pink-500 to-rose-500', emoji: '🍼', iconSrc: '/icons/3d/bolo.png' },
  { id: 'vacina', label: 'Vacina', cor: 'bg-blue-500', corGrad: 'from-blue-500 to-indigo-500', emoji: '💉', iconSrc: '/icons/3d/vacina.png' },
  { id: 'doenca', label: 'Doença', cor: 'bg-red-500', corGrad: 'from-red-500 to-rose-500', emoji: '🏥', iconSrc: '/icons/3d/shield.png' },
  { id: 'conquista', label: 'Conquista', cor: 'bg-amber-500', corGrad: 'from-amber-500 to-orange-500', emoji: '🏆', iconSrc: '/icons/3d/trophy.png' },
  { id: 'evento', label: 'Evento', cor: 'bg-purple-500', corGrad: 'from-purple-500 to-pink-500', emoji: '🎉', iconSrc: '/icons/3d/festa.png' },
  { id: 'foto', label: 'Foto', cor: 'bg-emerald-500', corGrad: 'from-emerald-500 to-teal-500', emoji: '📸', iconSrc: '/icons/3d/foto.png' },
  { id: 'viagem', label: 'Viagem', cor: 'bg-cyan-500', corGrad: 'from-cyan-500 to-blue-500', emoji: '✈️', iconSrc: '/icons/3d/viagem.png' },
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

function AtalhosSaude({
  contagens,
  onAtalho,
}: {
  contagens: { fotos: number; memorias: number; vacinas: number; vacinasPendentes: number };
  onAtalho: (id: string) => void;
}) {
  const atalhos: {
    id: string;
    titulo: string;
    sub: string;
    Icon: typeof CameraIcon3D;
    grad: string;
  }[] = [
    {
      id: 'galeria',
      titulo: 'Galeria',
      sub: contagens.fotos === 0 ? 'Nenhuma foto' : `${contagens.fotos} foto${contagens.fotos === 1 ? '' : 's'}`,
      Icon: CameraIcon3D,
      grad: 'from-emerald-50 to-teal-50 ring-emerald-100 dark:from-emerald-950/50 dark:to-teal-950/50 dark:ring-emerald-900',
    },
    {
      id: 'memorias',
      titulo: 'Memórias',
      sub: contagens.memorias === 0 ? 'Linha do tempo' : `${contagens.memorias} momento${contagens.memorias === 1 ? '' : 's'}`,
      Icon: CalendarIcon3D,
      grad: 'from-amber-50 to-orange-50 ring-amber-100 dark:from-amber-950/50 dark:to-orange-950/50 dark:ring-amber-900',
    },
    {
      id: 'vacinas',
      titulo: 'Vacinas',
      sub: contagens.vacinasPendentes > 0
        ? `${contagens.vacinasPendentes} pendente${contagens.vacinasPendentes === 1 ? '' : 's'}`
        : contagens.vacinas === 0
          ? 'Registrar vacina'
          : `${contagens.vacinas} registrada${contagens.vacinas === 1 ? '' : 's'}`,
      Icon: VaccineIcon3D,
      grad: 'from-sky-50 to-blue-50 ring-sky-100 dark:from-sky-950/50 dark:to-blue-950/50 dark:ring-sky-900',
    },
    {
      id: 'saude',
      titulo: 'Cuidados',
      sub: 'Doença e saúde',
      Icon: ShieldIcon3D,
      grad: 'from-rose-50 to-red-50 ring-rose-100 dark:from-rose-950/50 dark:to-red-950/50 dark:ring-rose-900',
    },
    {
      id: 'conquistas',
      titulo: 'Conquistas',
      sub: 'Vitórias do pet',
      Icon: TrophyIcon3D,
      grad: 'from-yellow-50 to-amber-50 ring-yellow-100 dark:from-yellow-950/50 dark:to-amber-950/50 dark:ring-yellow-900',
    },
    {
      id: 'viagens',
      titulo: 'Viagens',
      sub: 'Passeios e trips',
      Icon: TravelIcon3D,
      grad: 'from-cyan-50 to-blue-50 ring-cyan-100 dark:from-cyan-950/50 dark:to-blue-950/50 dark:ring-cyan-900',
    },
    {
      id: 'aniversario',
      titulo: 'Aniversário',
      sub: 'Datas especiais',
      Icon: CakeIcon3D,
      grad: 'from-pink-50 to-rose-50 ring-pink-100 dark:from-pink-950/50 dark:to-rose-950/50 dark:ring-pink-900',
    },
    {
      id: 'novo',
      titulo: 'Novo momento',
      sub: 'Registrar agora',
      Icon: PartyIcon3D,
      grad: 'from-violet-50 to-purple-50 ring-violet-100 dark:from-violet-950/50 dark:to-purple-950/50 dark:ring-violet-900',
    },
  ];

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900 dark:text-white">
        O que você quer fazer?
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {atalhos.map(({ id, titulo, sub, Icon, grad }) => (
          <button
            key={id}
            type="button"
            onClick={() => onAtalho(id)}
            className={`group flex flex-col items-center rounded-3xl bg-gradient-to-br p-5 text-center ring-1 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${grad}`}
          >
            <span className="icon-3d-slot flex h-20 w-20 items-center justify-center overflow-visible transition group-hover:scale-110 sm:h-24 sm:w-24">
              <Icon size={80} />
            </span>
            <span className="mt-3 text-sm font-black text-slate-900 dark:text-white">{titulo}</span>
            <span className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">{sub}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ListaMemorias({
  momentos,
  petNome,
  totalMeses,
  onEdit,
  onDelete,
  onMarcarTomada,
  onNovo,
}: {
  momentos: Momento[];
  petNome: string;
  totalMeses: number;
  onEdit: (m: Momento) => void;
  onDelete: (id: string) => void;
  onMarcarTomada: (id: string) => void;
  onNovo: () => void;
}) {
  return (
    <section id="memorias" className="mb-8 scroll-mt-24">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            <span className="icon-3d-slot"><CalendarIcon3D size={28} /></span>
            Memórias
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {petNome} · {totalMeses} {totalMeses === 1 ? 'mês' : 'meses'} · {momentos.length} momento{momentos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onNovo}
          className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/20"
        >
          + Momento
        </button>
      </div>

      {momentos.length === 0 ? (
        <div className="rounded-3xl bg-white py-14 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="mx-auto flex h-20 w-20 items-center justify-center">
            <CalendarIcon3D size={72} />
          </div>
          <p className="mt-4 text-base font-bold text-slate-900 dark:text-white">Nenhuma memória ainda</p>
          <p className="mt-1 text-sm text-slate-500">Registre fotos, vacinas e momentos especiais.</p>
          <button
            type="button"
            onClick={onNovo}
            className="mt-5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-2.5 text-sm font-bold text-white"
          >
            Adicionar primeiro momento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {momentos.map((m) => {
            const cat = categorias.find((c) => c.id === m.categoria);
            return (
              <article
                key={m.id}
                className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
              >
                <div className="icon-3d-slot flex h-14 w-14 shrink-0 items-center justify-center overflow-visible rounded-2xl bg-slate-50 dark:bg-slate-800">
                  {cat?.iconSrc ? (
                    <Image src={cat.iconSrc} alt="" width={48} height={48} unoptimized className="icon-3d object-contain" />
                  ) : (
                    <span className="text-2xl">{cat?.emoji || '📌'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{m.titulo}</h3>
                    <CategoriaBadge categoria={m.categoria} />
                    {m.categoria === 'vacina' && m.statusVacina === 'pendente' && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Pendente</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {format(m.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  {m.descricao && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">{m.descricao}</p>
                  )}
                  {m.fotoUrl && (
                    <img src={m.fotoUrl} alt="" className="mt-2 h-20 w-20 rounded-xl object-cover" />
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.categoria === 'vacina' && m.statusVacina === 'pendente' && (
                      <button
                        type="button"
                        onClick={() => onMarcarTomada(m.id)}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100"
                      >
                        Marcar como tomada
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEdit(m)}
                      className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(m.id)}
                      className="rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 ring-1 ring-red-100"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
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

          {/* Resumo rápido de idade */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              {totalMeses} {totalMeses === 1 ? 'mês' : 'meses'}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              {totalDias} dias
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {fotosCronologicas.length} foto{fotosCronologicas.length === 1 ? '' : 's'}
            </span>
            {totalAnos > 0 && (
              <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                {totalAnos} {totalAnos === 1 ? 'ano' : 'anos'}
                {mesesRestantes > 0 ? ` e ${mesesRestantes}m` : ''}
              </span>
            )}
          </div>

          {/* Atalhos grandes — cada ícone = uma situação */}
          <AtalhosSaude
            contagens={{
              fotos: fotosCronologicas.length,
              memorias: momentosVisiveis.length,
              vacinas: momentos.filter((m) => m.categoria === 'vacina').length,
              vacinasPendentes: momentos.filter((m) => m.categoria === 'vacina' && m.statusVacina === 'pendente').length,
            }}
            onAtalho={(id) => {
              if (id === 'galeria') {
                setMostrarGaleria(true);
                return;
              }
              if (id === 'memorias') {
                document.getElementById('memorias')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
              }
              if (id === 'vacinas') {
                setEditando(undefined);
                setCategoriaPadraoForm('vacina');
                setShowForm(true);
                return;
              }
              if (id === 'saude') {
                setEditando(undefined);
                setCategoriaPadraoForm('doenca');
                setShowForm(true);
                return;
              }
              if (id === 'conquistas') {
                setEditando(undefined);
                setCategoriaPadraoForm('conquista');
                setShowForm(true);
                return;
              }
              if (id === 'viagens') {
                setEditando(undefined);
                setCategoriaPadraoForm('viagem');
                setShowForm(true);
                return;
              }
              if (id === 'aniversario') {
                setEditando(undefined);
                setCategoriaPadraoForm('nascimento');
                setShowForm(true);
                return;
              }
              if (id === 'novo') {
                setEditando(undefined);
                setCategoriaPadraoForm('evento');
                setShowForm(true);
              }
            }}
          />

          {/* Galeria de fotos */}
          {mostrarGaleria && (
            <GaleriaFotos
              fotos={fotosCronologicas}
              onAdicionar={() => { setEditando(undefined); setCategoriaPadraoForm('foto'); setShowForm(true); }}
              onAbrir={(m) => setFotoAmpliada(m)}
              onFechar={() => setMostrarGaleria(false)}
            />
          )}

          {/* Premium upsell */}
          {momentosOcultosPorPlano > 0 && (
            <a
              href="/planos"
              className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 p-4 text-white shadow-lg shadow-purple-500/20 transition hover:shadow-xl"
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

          {/* Lista de memórias */}
          <ListaMemorias
            momentos={momentosVisiveis}
            petNome={pet.nome}
            totalMeses={totalMeses}
            onEdit={handleEditar}
            onDelete={handleExcluir}
            onMarcarTomada={handleMarcarComoTomada}
            onNovo={() => { setEditando(undefined); setCategoriaPadraoForm('evento'); setShowForm(true); }}
          />

          {/* Primeira Foto */}
          {primeiraFoto && (
            <div className="mt-4 rounded-3xl bg-gradient-to-br from-amber-50 to-rose-50 p-6 shadow-sm ring-1 ring-rose-100 dark:ring-rose-900">
              <div className="flex items-center gap-3">
                <div className="icon-3d-slot flex h-14 w-14 items-center justify-center overflow-visible">
                  <CameraIcon3D size={48} />
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
