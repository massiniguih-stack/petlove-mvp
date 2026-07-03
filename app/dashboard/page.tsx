'use client';

import { usePetStore } from '@/lib/store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PawPrint,
  MapPin,
  BowlFood,
  TrendUp,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function DashboardPage() {
  const { pet } = usePetStore();
  const router = useRouter();
  const [peso, setPeso] = useState('');
  const [erro, setErro] = useState('');
  const [historico, setHistorico] = useState<{ data: Date; peso: number }[]>([]);

  useEffect(() => {
    if (!pet) router.push('/onboarding');
  }, [pet, router]);

  if (!pet) return null;

  const handleRegistrarPeso = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    const valor = Number(peso);
    if (!Number.isFinite(valor) || valor <= 0) {
      setErro('Informe um peso válido.');
      return;
    }
    setHistorico((prev) => [...prev, { data: new Date(), peso: valor }]);
    setPeso('');
  };

  const idadeEmMeses = (() => {
    const diff = new Date().getTime() - new Date(pet.dataNascimento).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  })();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <header className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Olá, {pet.nome}
            </h1>
            <p className="text-slate-600">
              {pet.raca} - {idadeEmMeses < 12 ? `${idadeEmMeses} meses` : `${Math.floor(idadeEmMeses / 12)} anos`}
            </p>
          </header>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <DashboardCard
              title="Peso atual"
              value={`${pet.peso.toLocaleString('pt-BR')} kg`}
              icon={<BowlFood size={24} />}
              linkText="Registrar novo peso"
              href="/dashboard"
            />
            <DashboardCard
              title="Objetivo"
              value={pet.objetivo === 'manutencao' ? 'Manutenção' : pet.objetivo === 'pelagem' ? 'Pelagem' : 'Desempenho'}
              icon={<TrendUp size={24} />}
              linkText="Ver recomendação"
              href="/racao"
            />
            <DashboardCard
              title="Serviços próximos"
              value="Vets, parques e hotéis"
              icon={<MapPin size={24} />}
              linkText="Abrir mapa"
              href="/mapa"
            />
          </div>

          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Histórico de peso</h2>
                <p className="text-sm text-slate-500">Acompanhe a evolução do seu pet</p>
              </div>
            </div>

            <form onSubmit={handleRegistrarPeso} className="mt-4 flex flex-wrap gap-3">
              <input
                type="number"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="Novo peso (kg)"
                min="0.1"
                step="0.1"
                className="w-40 rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Registrar
              </button>
            </form>

            {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}

            {historico.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {historico.map((item) => (
                  <li
                    key={item.data.toISOString()}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 text-sm"
                  >
                    <span className="text-slate-500">
                      {format(item.data, "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {item.peso.toLocaleString('pt-BR')} kg
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Nenhum registro de peso ainda.</p>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DashboardCard({
  title,
  value,
  icon,
  linkText,
  href,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  linkText: string;
  href: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-full bg-brand-50 p-2 text-brand-600">{icon}</div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{title}</p>
      <p className="text-xl font-semibold text-slate-900">{value}</p>
      <Link
        href={href}
        className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        {linkText}
      </Link>
    </div>
  );
}
