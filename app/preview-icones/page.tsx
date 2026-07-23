'use client';

import {
  PawIcon3D,
  CalendarIcon3D,
  ActivityIcon3D,
  BowlIcon3D,
  PinIcon3D,
  GearIcon3D,
  HealthIcon3D,
  PremiumIcon3D,
  ScaleIcon3D,
  TargetIcon3D,
  SearchIcon3D,
  CheckIcon3D,
  FileTextIcon3D,
  BoneIcon3D,
  TrophyIcon3D,
  ShieldIcon3D,
  FireIcon3D,
  MedalIcon3D,
  CrownIcon3D,
  ChartIcon3D,
  BriefcaseIcon3D,
  CakeIcon3D,
  PartyIcon3D,
} from '@/components/Icons3D';
import Link from 'next/link';

const main = [
  { id: '01', name: 'Dashboard', file: 'patinha.png', gradient: 'from-amber-500 to-orange-500', Icon: PawIcon3D },
  { id: '02', name: 'Linha do tempo', file: 'calendario.png', gradient: 'from-orange-400 to-amber-500', Icon: CalendarIcon3D },
  { id: '03', name: 'Atividades', file: 'atividades.png', gradient: 'from-blue-500 to-cyan-500', Icon: ActivityIcon3D },
  { id: '04', name: 'Ração', file: 'racao.png', gradient: 'from-emerald-500 to-teal-500', Icon: BowlIcon3D },
  { id: '05', name: 'Serviços', file: 'servicos.png', gradient: 'from-pink-500 to-rose-500', Icon: PinIcon3D },
  { id: '06', name: 'Editar perfil', file: 'perfil.png', gradient: 'from-slate-500 to-slate-600', Icon: GearIcon3D },
  { id: '07', name: 'Vida / Saúde', file: 'saude.png', gradient: 'from-violet-500 to-purple-600', Icon: HealthIcon3D },
  { id: '08', name: 'Premium', file: 'premium.png', gradient: 'from-purple-500 to-fuchsia-600', Icon: PremiumIcon3D },
] as const;

const aux = [
  { id: '09', name: 'Peso', file: 'peso.png', Icon: ScaleIcon3D },
  { id: '10', name: 'Objetivo', file: 'target.png', Icon: TargetIcon3D },
  { id: '11', name: 'Busca', file: 'search.png', Icon: SearchIcon3D },
  { id: '12', name: 'Sucesso', file: 'check.png', Icon: CheckIcon3D },
  { id: '13', name: 'Documento', file: 'file-text.png', Icon: FileTextIcon3D },
  { id: '14', name: 'Osso', file: 'bone.png', Icon: BoneIcon3D },
  { id: '15', name: 'Troféu', file: 'trophy.png', Icon: TrophyIcon3D },
  { id: '16', name: 'Escudo', file: 'shield.png', Icon: ShieldIcon3D },
  { id: '17', name: 'Fogo', file: 'fire.png', Icon: FireIcon3D },
  { id: '18', name: 'Medalha', file: 'medal.png', Icon: MedalIcon3D },
  { id: '19', name: 'Coroa', file: 'crown.png', Icon: CrownIcon3D },
  { id: '20', name: 'Gráfico', file: 'chart.png', Icon: ChartIcon3D },
  { id: '21', name: 'Parceiro / maleta', file: 'maleta.png', Icon: BriefcaseIcon3D },
  { id: '22', name: 'Aniversário / bolo', file: 'bolo.png', Icon: CakeIcon3D },
  { id: '23', name: 'Celebração / festa', file: 'festa.png', Icon: PartyIcon3D },
] as const;

export default function PreviewIconesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Patinha · Design</p>
            <h1 className="text-xl font-black tracking-tight">Ícones 3D — set completo (maiores)</h1>
            <p className="mt-0.5 text-sm text-slate-500">Set Soft 3D · size = pixels reais · sem corte</p>
          </div>
          <Link
            href="/"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-900"
          >
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-black">Módulos principais (72px nos cards)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {main.map(({ id, name, gradient, Icon }) => (
              <div
                key={id}
                className={`rounded-3xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg`}
              >
                <div className="icon-3d-slot h-20 w-20 rounded-2xl bg-white/15 ring-1 ring-white/25">
                  <Icon size={72} />
                </div>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-white/70">{id}</p>
                <h3 className="text-xl font-black">{name}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-lg font-black">Pack auxiliar (dashboard, marcos, empty states)</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {aux.map(({ id, name, Icon }) => (
              <div
                key={id}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
              >
                <Icon size={64} />
                <span className="text-[10px] font-bold text-slate-400">{id}</span>
                <span className="text-center text-xs font-semibold">{name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <h2 className="mb-4 text-lg font-black">Tamanhos pequenos (24 / 32)</h2>
          <div className="flex flex-wrap gap-4">
            {[...main, ...aux].map(({ id, name, Icon }) => (
              <div key={id} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
                <Icon size={24} />
                <Icon size={32} />
                <span className="text-[11px] font-semibold text-slate-500">{name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
