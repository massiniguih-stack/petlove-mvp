'use client';

import { useState } from 'react';
import { MapPin, Star } from '@phosphor-icons/react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const servicosMock = [
  {
    id: '1',
    tipo: 'veterinario',
    nome: 'Clínica VetAmigo',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    bairro: 'Jardins',
    avaliacao: 4.8,
  },
  {
    id: '2',
    tipo: 'parque',
    nome: 'Parque Cãominhar',
    endereco: 'Av. dos Pets, 456 - São Paulo, SP',
    bairro: 'Pinheiros',
    avaliacao: 4.6,
  },
  {
    id: '3',
    tipo: 'hotel',
    nome: 'Hotel PetLovers',
    endereco: 'Rua do Sino, 789 - São Paulo, SP',
    bairro: 'Moema',
    avaliacao: 4.9,
  },
];

export default function MapaPage() {
  const [filtro, setFiltro] = useState<'todos' | 'veterinario' | 'parque' | 'hotel'>('todos');

  const listaFiltrada =
    filtro === 'todos' ? servicosMock : servicosMock.filter((s) => s.tipo === filtro);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <header className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Mapa de serviços
            </h1>
            <p className="mt-1 text-slate-600">
              Encontre veterinários, parques e hotéis próximos.
            </p>
          </header>

          <div className="flex flex-wrap gap-3">
            {(['todos', 'veterinario', 'parque', 'hotel'] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  filtro === tipo
                    ? 'bg-brand-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tipo === 'todos'
                  ? 'Todos'
                  : tipo === 'veterinario'
                  ? 'Veterinários'
                  : tipo === 'parque'
                  ? 'Parques'
                  : 'Hotéis'}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listaFiltrada.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-brand-600">{item.tipo}</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">
                      {item.nome}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{item.endereco}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <Star size={16} className="text-amber-500" />
                  <span>{item.avaliacao.toLocaleString('pt-BR')}</span>
                  <span>•</span>
                  <span>{item.bairro}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Mapa interativo via Mapbox será integrado nesta seção.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
