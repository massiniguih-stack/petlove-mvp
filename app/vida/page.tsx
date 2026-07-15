'use client';

import { usePetStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { format, differenceInMonths, differenceInDays, addMonths, startOfMonth, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import { CalendarIcon3D } from '@/components/Icons3D';

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
  { id: 'nascimento', label: 'Nascimento', cor: 'bg-pink-500', corGrad: 'from-pink-500 to-rose-500', emoji: '🍼' },
  { id: 'vacina', label: 'Vacina', cor: 'bg-blue-500', corGrad: 'from-blue-500 to-indigo-500', emoji: '💉' },
  { id: 'doenca', label: 'Doença', cor: 'bg-red-500', corGrad: 'from-red-500 to-rose-500', emoji: '🏥' },
  { id: 'conquista', label: 'Conquista', cor: 'bg-amber-500', corGrad: 'from-amber-500 to-orange-500', emoji: '🏆' },
  { id: 'evento', label: 'Evento', cor: 'bg-purple-500', corGrad: 'from-purple-500 to-pink-500', emoji: '🎉' },
  { id: 'foto', label: 'Foto', cor: 'bg-emerald-500', corGrad: 'from-emerald-500 to-teal-500', emoji: '📸' },
  { id: 'viagem', label: 'Viagem', cor: 'bg-cyan-500', corGrad: 'from-cyan-500 to-blue-500', emoji: '✈️' },
];

function CategoriaBadge({ categoria }: { categoria: Momento['categoria'] }) {
  const cat = categorias.find((c) => c.id === categoria);
  if (!cat) return null;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white ${cat.cor}`}>
      <span>{cat.emoji}</span>
      {cat.label}
    </span>
  );
}

function NovoMomentoForm({ onClose, onSave, editando, dataNascimento }: { onClose: () => void; onSave: (m: Omit<Momento, 'id'>) => void; editando?: Momento; dataNascimento: string }) {
  const [data, setData] = useState(editando?.data ? format(editando.data, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [titulo, setTitulo] = useState(editando?.titulo || '');
  const [descricao, setDescricao] = useState(editando?.descricao || '');
  const [categoria, setCategoria] = useState<Momento['categoria']>(editando?.categoria || 'evento');
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
                  <span>{cat.emoji}</span>
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

function LinhaDoTempo({ momentos, pet, onEdit, onDelete }: { momentos: Momento[]; pet: { nome: string; dataNascimento: string; fotoUrl: string | null }; onEdit: (m: Momento) => void; onDelete: (id: string) => void }) {
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
    const lista: { mes: number; label: string; emoji: string; cor: string; momento?: Momento }[] = [];
    
    const nascimentoMomento = momentos.find((m) => m.categoria === 'nascimento');
    lista.push({ 
      mes: 0, 
      label: 'Nascimento', 
      emoji: '🍼', 
      cor: 'from-pink-500 to-rose-500',
      momento: nascimentoMomento 
    });

    const marcosImportantes = [
      { mes: 2, label: '2 meses', emoji: '🐾', cor: 'from-amber-400 to-orange-400' },
      { mes: 4, label: '4 meses', emoji: '🦴', cor: 'from-emerald-400 to-teal-400' },
      { mes: 6, label: '6 meses', emoji: '🎂', cor: 'from-purple-400 to-pink-400' },
      { mes: 9, label: '9 meses', emoji: '🐕', cor: 'from-blue-400 to-indigo-400' },
      { mes: 12, label: '1 ano', emoji: '🎉', cor: 'from-rose-400 to-pink-400' },
      { mes: 18, label: '1.5 anos', emoji: '🌟', cor: 'from-cyan-400 to-blue-400' },
      { mes: 24, label: '2 anos', emoji: '🏆', cor: 'from-amber-500 to-orange-500' },
      { mes: 36, label: '3 anos', emoji: '💪', cor: 'from-violet-500 to-purple-500' },
      { mes: 48, label: '4 anos', emoji: '🎖️', cor: 'from-indigo-500 to-blue-500' },
      { mes: 60, label: '5 anos', emoji: '⭐', cor: 'from-yellow-500 to-amber-500' },
      { mes: 84, label: '7 anos', emoji: '🏅', cor: 'from-emerald-500 to-green-500' },
      { mes: 120, label: '10 anos', emoji: '👑', cor: 'from-pink-500 to-rose-500' },
    ];

    for (const marco of marcosImportantes) {
      if (marco.mes <= totalMeses + 1) {
        const momento = momentosComMes.find((m) => m.mes === marco.mes);
        lista.push({ ...marco, momento });
      }
    }

    const outrosMomentos = momentosComMes.filter((m) => 
      !lista.some((l) => l.mes === m.mes) && m.categoria !== 'nascimento'
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
  }, [momentos, momentosComMes, totalMeses]);

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
              className={`flex flex-col items-center rounded-xl p-3 transition-all shrink-0 w-20 ${
                isSelected 
                  ? 'bg-rose-50 ring-2 ring-rose-300 dark:ring-rose-700' 
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${marco.cor} text-white shadow-sm transition-all hover:scale-110 ${
                isAtual ? 'ring-2 ring-rose-400 ring-offset-1' : ''
              } ${isProximo ? 'ring-2 ring-amber-400 ring-offset-1 animate-pulse' : ''}`}>
                <span className="text-lg">{marco.emoji}</span>
                {isAtual && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-1 ring-white" />
                )}
              </div>
              <div className="mt-1.5 text-center">
                <div className={`text-[11px] font-bold leading-tight ${isAtual ? 'text-rose-600' : isProximo ? 'text-amber-600' : 'text-slate-600'}`}>
                  {getMesLabel(marco.mes)}
                </div>
                {marco.momento && (
                  <div className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[68px]">
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
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${marcoDetalhe.cor} text-white shadow-md`}>
              <span className="text-xl">{marcoDetalhe.emoji}</span>
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
                  <div className="flex gap-2">
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
        <div className="mt-4 rounded-xl bg-gradient-to-r from-amber-50 to-rose-50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">
              📅 <span className="font-bold text-slate-900 dark:text-white">{pet.nome}</span> tem{' '}
              <span className="font-bold text-rose-600">{totalMeses} {totalMeses === 1 ? 'mês' : 'meses'}</span>
            </span>
            <span className="text-slate-500">
              {momentos.length} momento{momentos.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VidaPage() {
  const { pet, hydrated } = usePetStore();
  const router = useRouter();
  const [momentos, setMomentos] = useState<Momento[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Momento | undefined>();
  const [filtro, setFiltro] = useState<Momento['categoria'] | 'todos'>('todos');

  useEffect(() => {
    if (hydrated && !pet) router.push('/onboarding');
  }, [hydrated, pet, router]);

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
  const momentosFiltrados = filtro === 'todos' ? momentosOrdenados : momentosOrdenados.filter((m) => m.categoria === filtro);

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

  const vacinasPendentes = momentos.filter((m) => m.categoria === 'vacina' && m.statusVacina === 'pendente');
  const vacinasTomadas = momentos.filter((m) => m.categoria === 'vacina' && m.statusVacina === 'tomada');
  const proximasVacinas = vacinasPendentes.sort((a, b) => a.data.getTime() - b.data.getTime());

  const primeiraData = momentos.length > 0 ? new Date(Math.min(...momentos.map((m) => m.data.getTime()))) : null;
  const diasVida = primeiraData ? Math.floor((hoje.getTime() - primeiraData.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const primeiraFoto = momentos.find((m) => m.fotoUrl);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10">
          {/* Header */}
          <div className="mb-8">
            <BackButton href="/dashboard" />
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700">
              <span className="text-lg">📅</span>
              {totalMeses} {totalMeses === 1 ? 'mês' : 'meses'} de história
              {diasVida > 0 && ` · ${diasVida} dias`}
            </div>
            <div className="mt-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Linha do tempo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-500">{pet.nome}</span>
              </h1>
              <button
                onClick={() => { setEditando(undefined); setShowForm(true); }}
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

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              onClick={() => {
                const el = document.getElementById('timeline');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 p-4 text-left text-white shadow-lg shadow-pink-500/20 transition hover:shadow-xl hover:shadow-pink-500/30 hover:-translate-y-0.5"
            >
              <div className="text-3xl font-black">{totalMeses}</div>
              <div className="mt-1 text-sm font-medium text-pink-100">🍼 Meses</div>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('timeline');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 p-4 text-left text-white shadow-lg shadow-rose-500/20 transition hover:shadow-xl hover:shadow-rose-500/30 hover:-translate-y-0.5"
            >
              <div className="text-3xl font-black">{totalDias}</div>
              <div className="mt-1 text-sm font-medium text-rose-100">📅 Dias</div>
            </button>
            <button
              onClick={() => setFiltro('foto')}
              className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-4 text-left text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              <div className="text-3xl font-black">{momentos.length}</div>
              <div className="mt-1 text-sm font-medium text-emerald-100">📸 Momentos</div>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('timeline');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 text-left text-white shadow-lg shadow-amber-500/20 transition hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
            >
              <div className="text-3xl font-black">
                {totalAnos > 0 ? totalAnos : mesesRestantes}
              </div>
              <div className="mt-1 text-sm font-medium text-amber-100">🎂 Idade</div>
            </button>
          </div>

          {/* Painel de Vacinas */}
          {(vacinasPendentes.length > 0 || vacinasTomadas.length > 0) && (
            <div className="mb-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm ring-1 ring-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30">
                    <span className="text-xl">💉</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Painel de Vacinas</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {vacinasTomadas.length} tomada{vacinasTomadas.length !== 1 ? 's' : ''} · {vacinasPendentes.length} pendente{vacinasPendentes.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {vacinasPendentes.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-700">
                    <span className="text-lg">⏰</span> Próximas Vacinas
                  </h4>
                  <div className="space-y-3">
                    {proximasVacinas.map((vacina) => {
                      const diasAte = differenceInDays(vacina.data, new Date());
                      const isUrgente = diasAte <= 7;
                      
                      return (
                        <div
                          key={vacina.id}
                          className={`group relative flex items-center justify-between rounded-2xl border p-4 transition ${
                            isUrgente 
                              ? 'border-amber-200 bg-amber-50 shadow-md' 
                              : 'border-slate-200 bg-white dark:bg-slate-900 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                              isUrgente 
                                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' 
                                : 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                            }`}>
                              <span className="text-lg">💉</span>
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-900 dark:text-white">{vacina.titulo}</h5>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold ${
                                  isUrgente ? 'text-amber-600' : 'text-slate-500'
                                }`}>
                                  {isUrgente 
                                    ? `Daqui ${diasAte} dia${diasAte !== 1 ? 's' : ''}`
                                    : format(vacina.data, "dd 'de' MMMM", { locale: ptBR })
                                  }
                                </span>
                                {isUrgente && (
                                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                                    Urgente!
                                  </span>
                                )}
                              </div>
                              {vacina.descricao && (
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{vacina.descricao}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleMarcarComoTomada(vacina.id)}
                            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-emerald-600 hover:shadow-lg"
                          >
                            ✅ Já tomou
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {vacinasTomadas.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-700">
                    <span className="text-lg">✅</span> Vacinas Tomadas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {vacinasTomadas.map((vacina) => (
                      <div
                        key={vacina.id}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700"
                      >
                        <span>💉</span>
                        {vacina.titulo}
                        <span className="text-xs text-emerald-500">
                          {format(vacina.data, "dd/MM/yy")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filtros */}
          <div className="mb-6 flex flex-wrap gap-2">
            {filtro !== 'todos' && (
              <button
                onClick={() => setFiltro('todos')}
                className="rounded-full bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-800 transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                ✕ Limpar filtro
              </button>
            )}
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFiltro(cat.id as Momento['categoria'])}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  filtro === cat.id ? `${cat.cor} text-white shadow-md` : ' bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div id="timeline">
            <LinhaDoTempo
              momentos={filtro === 'todos' ? momentos : momentosFiltrados}
              pet={{ nome: pet.nome, dataNascimento: pet.dataNascimento, fotoUrl: pet.fotoUrl }}
              onEdit={handleEditar}
              onDelete={handleExcluir}
            />
          </div>

          {/* Primeira Foto */}
          {primeiraFoto && (
            <div className="mt-12 rounded-3xl bg-gradient-to-br from-amber-50 to-rose-50 p-6 shadow-sm ring-1 ring-rose-100 dark:ring-rose-900">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-lg shadow-rose-500/30">
                  <span className="text-xl">📸</span>
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
                <CalendarIcon3D size={56} />
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
          onClose={() => { setShowForm(false); setEditando(undefined); }}
          onSave={handleSalvar}
          dataNascimento={pet.dataNascimento}
        />
      )}
    </div>
  );
}
