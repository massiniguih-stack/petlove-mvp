'use client';

import { useState, Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { StarIcon, MapPinIcon } from '@/components/Icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import { SearchIcon3D } from '@/components/Icons3D';
import { cidades, type Servico } from '@/data/servicos';
import { emojiServico } from '@/lib/tiposServico';

const PetMap = dynamic(() => import('@/components/PetMap'), { ssr: false });

const labels: Record<string, string> = {
  veterinario: 'Veterinários', petshop: 'Pet Shop', creche: 'Creche',
  hotel: 'Hotel', petsitter: 'Pet Sitter', parque: 'Parques',
};

const cores: Record<string, string> = {
  veterinario: 'from-emerald-500 to-teal-500', petshop: 'from-amber-500 to-orange-500',
  creche: 'from-purple-500 to-pink-500', hotel: 'from-blue-500 to-indigo-500',
  petsitter: 'from-rose-500 to-pink-500', parque: 'from-green-500 to-emerald-500',
};

const coresBg: Record<string, string> = {
  veterinario: 'bg-emerald-100 text-emerald-700', petshop: 'bg-amber-100 text-amber-700',
  creche: 'bg-purple-100 text-purple-700', hotel: 'bg-blue-100 text-blue-700',
  petsitter: 'bg-rose-100 text-rose-700', parque: 'bg-green-100 text-green-700',
};

function ServicoCard({ servico, onSelect, onCenterMap }: { servico: Servico; onSelect?: (s: Servico) => void; onCenterMap?: (s: Servico) => void }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div
      onClick={() => onCenterMap?.(servico)}
      className={`group cursor-pointer rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-300 hover:shadow-lg ${
        servico.premium ? 'border-amber-300 ring-2 ring-amber-200 shadow-amber-500/10' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {servico.premium && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm shadow-amber-500/20">🏆 Premium</span>
            )}
            {servico.destaque && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm shadow-purple-500/20">⭐ Destaque</span>
            )}
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${coresBg[servico.tipo]}`}>
              {emojiServico(servico.tipo)} {labels[servico.tipo]}
            </span>
            {servico.plantao24h && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">🚨 24h</span>
            )}
          </div>

          <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white group-hover:text-slate-950 dark:group-hover:text-white">{servico.nome}</h3>

          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <MapPinIcon size={14} />
            <span>{servico.endereco}</span>
          </div>
          <p className="mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">{servico.bairro} · {servico.cidade}</p>

          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <StarIcon size={15} className="text-amber-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {servico.avaliacao != null ? servico.avaliacao.toLocaleString('pt-BR') : 'Novo'}
              </span>
            </div>
            {servico.telefone && (
              <>
                <span className="text-slate-300">·</span>
                <a href={`tel:${servico.telefone.replace(/\D/g, '')}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">📞 {servico.telefone}</a>
              </>
            )}
          </div>

          {servico.horario && <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">🕐 {servico.horario}</p>}

          {servico.servicos && servico.servicos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {servico.servicos.slice(0, expandido ? undefined : 4).map((s) => (
                <span key={s} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">{s}</span>
              ))}
              {!expandido && servico.servicos.length > 4 && (
                <button onClick={() => setExpandido(true)} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover: bg-slate-200 dark:bg-slate-700">
                  +{servico.servicos.length - 4} mais
                </button>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onSelect?.(servico)}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:shadow-md"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Criar rota
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(servico.nome + ' ' + servico.endereco + ' ' + servico.cidade)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600 hover:shadow-md"
            >
              📍 Maps
            </a>
            {servico.telefone && servico.premium && (
              <a
                href={`https://wa.me/${(() => {
                  const digitos = servico.telefone!.replace(/\D/g, '');
                  return digitos.startsWith('55') ? digitos : `55${digitos}`;
                })()}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-600 hover:shadow-md"
              >
                💬 WhatsApp
              </a>
            )}
            {servico.instagram && (
              <a href={`https://instagram.com/${servico.instagram}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:shadow-md">
                📸 Instagram
              </a>
            )}
          </div>
          <p className="mt-2 text-[10px] font-medium text-slate-400 dark:text-slate-500 text-center">Clique no card para ver no mapa</p>
        </div>
      </div>
    </div>
  );
}

export default function MapaPage() {
  const [cidade, setCidade] = useState('Maringá');
  const [filtro, setFiltro] = useState<string>('todos');
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [coordenadasUsuario, setCoordenadasUsuario] = useState<{ lat: number; lng: number } | null>(null);
  const [ordenarPor, setOrdenarPor] = useState<'avaliacao' | 'distancia'>('avaliacao');
  const [servicosDaCidade, setServicosDaCidade] = useState<Servico[]>([]);
  const [carregandoServicos, setCarregandoServicos] = useState(true);

  const cidadeSelecionada = cidades.find((c) => c.nome === cidade) || cidades[0];

  useEffect(() => {
    let cancelado = false;
    setCarregandoServicos(true);
    fetch(`/api/servicos?cidade=${encodeURIComponent(cidade)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelado) setServicosDaCidade(data.servicos || []);
      })
      .catch(() => {
        if (!cancelado) setServicosDaCidade([]);
      })
      .finally(() => {
        if (!cancelado) setCarregandoServicos(false);
      });
    return () => {
      cancelado = true;
    };
  }, [cidade]);

  const distanciaKm = (s: Servico) => {
    if (!coordenadasUsuario || s.lat == null || s.lng == null) return null;
    const R = 6371;
    const dLat = ((s.lat - coordenadasUsuario.lat) * Math.PI) / 180;
    const dLng = ((s.lng - coordenadasUsuario.lng) * Math.PI) / 180;
    const lat1 = (coordenadasUsuario.lat * Math.PI) / 180;
    const lat2 = (s.lat * Math.PI) / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const listaFiltrada = servicosDaCidade
    .filter((s) => filtro === 'todos' || s.tipo === filtro)
    .sort((a, b) => {
      if (a.premium && !b.premium) return -1;
      if (!a.premium && b.premium) return 1;
      if (a.destaque && !b.destaque) return -1;
      if (!a.destaque && b.destaque) return 1;
      if (ordenarPor === 'distancia') {
        const da = distanciaKm(a);
        const db = distanciaKm(b);
        if (da != null && db != null) return da - db;
        if (da != null) return -1;
        if (db != null) return 1;
      }
      return (b.avaliacao ?? 0) - (a.avaliacao ?? 0);
    });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoordenadasUsuario({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      <Navbar />
      <main className="flex-1">

        {/* Hero Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-rose-600 to-pink-600 px-4 py-12 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white dark:bg-slate-900" />
            <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white dark:bg-slate-900" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <BackButton href="/dashboard" />
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold backdrop-blur-sm dark:bg-white/10">
                <span>📍</span> Mapa de Serviços
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Encontre o melhor <span className="text-yellow-200">para seu pet</span>
              </h1>
              <p className="mt-3 max-w-lg text-lg text-rose-100">
                Clínicas, pet shops, creches, hotéis e parques pet friendly na sua região.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8">

          {/* Cidade + Ordenação */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">📍</span>
              <select
                value={cidade}
                onChange={(e) => { setCidade(e.target.value); setFiltro('todos'); setServicoSelecionado(null); }}
                className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-10 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {cidades.map((c) => (
                  <option key={c.nome} value={c.nome}>{c.nome}, {c.uf}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">⚡</span>
              <select
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value as 'avaliacao' | 'distancia')}
                className="appearance-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-10 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="avaliacao">⭐ Melhor avaliados</option>
                <option value="distancia">📍 Mais próximos</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </div>
          </div>

          {/* Mapa */}
          <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
            <Suspense fallback={
              <div className="flex h-[400px] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 sm:h-[500px]">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                  <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Carregando mapa...</p>
                </div>
              </div>
            }>
              <PetMap
                servicos={listaFiltrada}
                servicoSelecionado={servicoSelecionado}
                onFecharRota={() => setServicoSelecionado(null)}
                centro={[cidadeSelecionada.lat, cidadeSelecionada.lng]}
              />
            </Suspense>
          </div>


          {/* Filtros */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Filtrar por tipo</h3>
              {filtro !== 'todos' && (
                <button onClick={() => setFiltro('todos')} className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100">
                  ✕ Limpar
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {(['veterinario', 'petshop', 'creche', 'hotel', 'petsitter', 'parque'] as const).map((tipo) => {
                const count = servicosDaCidade.filter((s) => s.tipo === tipo).length;
                const isActive = filtro === tipo;
                return (
                  <button
                    key={tipo}
                    onClick={() => setFiltro(tipo)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-2xl px-5 py-3.5 transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${cores[tipo]} text-white shadow-xl scale-105`
                        : 'bg-white text-slate-700 dark:text-slate-300 shadow-md ring-1 ring-slate-200 dark:ring-slate-800 hover:shadow-lg hover:ring-slate-300 dark:hover:ring-slate-600 hover:scale-105'
                    }`}
                  >
                    <span className="text-2xl">{emojiServico(tipo)}</span>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>{labels[tipo]}</p>
                      <p className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-500'}`}>{count} encontrado{count !== 1 ? 's' : ''}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de Serviços */}
          {carregandoServicos ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {listaFiltrada.map((servico) => (
                <ServicoCard key={servico.id} servico={servico} onSelect={setServicoSelecionado} onCenterMap={setServicoSelecionado} />
              ))}
            </div>
          )}

          {!carregandoServicos && listaFiltrada.length === 0 && (
            <div className="rounded-3xl bg-white dark:bg-slate-900 py-16 text-center ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                <SearchIcon3D size={40} />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Nenhum serviço em {cidade}</h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">Tente outra cidade ou filtro.</p>
              <button onClick={() => setFiltro('todos')} className="mt-4 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600 hover:shadow-lg">
                Limpar filtros
              </button>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 shadow-2xl shadow-amber-500/30">
            <div className="relative flex flex-col items-center gap-6 p-10 text-center lg:flex-row lg:text-left">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white dark:bg-slate-900" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white dark:bg-slate-900" />
              </div>
              <div className="relative flex-1">
                <h2 className="text-2xl font-black text-white">Você é dono de uma loja ou clínica pet?</h2>
                <p className="mt-2 text-orange-100">Torne-se parceiro Premium e apareça no topo do mapa!</p>
              </div>
              <a
                href="/parceiros/premium"
                className="relative rounded-2xl bg-white dark:bg-slate-900 px-8 py-4 text-lg font-black text-orange-600 shadow-xl transition hover:bg-orange-50 hover:shadow-2xl hover:scale-105 active:scale-95"
              >
                🏆 Ser Premium
              </a>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
