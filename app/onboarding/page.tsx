'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePetStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { racasCachorros } from '@/data/racas';

export default function OnboardingPage() {
  const router = useRouter();
  const { pet, addPet } = usePetStore();
  const [erro, setErro] = useState('');
  const [step, setStep] = useState<'pet' | 'tutor'>('pet');
  const [buscaRaca, setBuscaRaca] = useState(pet?.raca ?? '');
  const [mostrarRacas, setMostrarRacas] = useState(false);
  const [form, setForm] = useState({
    nome: pet?.nome ?? '',
    raca: pet?.raca ?? '',
    dataNascimento: pet?.dataNascimento ?? '',
    peso: pet?.peso?.toString() ?? '',
    sexo: pet?.sexo ?? 'macho',
    objetivo: 'manutencao',
    tutorNome: pet?.tutor?.nome ?? '',
    tutorEmail: pet?.tutor?.email ?? '',
    tutorTelefone: pet?.tutor?.telefone ?? '',
    tutorEndereco: pet?.tutor?.endereco ?? '',
    consentimentoMarketing: false,
    consentimentoLocalizacao: false,
  });

  const racasFiltradas = buscaRaca.trim()
    ? racasCachorros.filter((r) => r.toLowerCase().includes(buscaRaca.toLowerCase())).slice(0, 20)
    : racasCachorros.slice(0, 20);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro('');
  };

  const selecionarRaca = (raca: string) => {
    setForm((prev) => ({ ...prev, raca }));
    setBuscaRaca(raca);
    setMostrarRacas(false);
  };

  const handleBuscaRaca = (value: string) => {
    setBuscaRaca(value);
    setForm((prev) => ({ ...prev, raca: value }));
    setMostrarRacas(true);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!form.nome.trim() || !form.raca.trim() || !form.dataNascimento || !form.peso) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    const pesoNum = Number(form.peso);
    if (!Number.isFinite(pesoNum) || pesoNum <= 0 || pesoNum > 200) {
      setErro('Informe um peso válido em kg.');
      return;
    }

    const dataNasc = new Date(form.dataNascimento);
    if (Number.isNaN(dataNasc.getTime())) {
      setErro('Data de nascimento inválida.');
      return;
    }

    setStep('tutor');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!form.tutorNome.trim() || !form.tutorEmail.trim()) {
      setErro('Preencha nome e e-mail do tutor.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.tutorEmail)) {
      setErro('E-mail inválido.');
      return;
    }

    addPet({
      id: crypto.randomUUID(),
      nome: form.nome.trim(),
      raca: form.raca.trim(),
      dataNascimento: form.dataNascimento,
      peso: Number(form.peso),
      sexo: form.sexo as 'macho' | 'femea',
      objetivo: form.objetivo as 'manutencao' | 'pelagem' | 'desempenho' | 'emagrecimento',
      fotoUrl: null,
      tutor: {
        nome: form.tutorNome.trim(),
        email: form.tutorEmail.trim(),
        telefone: form.tutorTelefone.trim(),
        endereco: form.tutorEndereco.trim(),
      },
    });
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="mb-10">
            <div className="flex items-center gap-4">
              <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl font-bold transition-all ${
                step === 'pet' 
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
              }`}>
                <span className="text-lg">🐕</span>
                {step === 'tutor' && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                    ✓
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={`h-full rounded-full transition-all duration-500 ${
                    step === 'tutor' ? 'w-full bg-gradient-to-r from-emerald-500 to-teal-500' : 'w-1/2 bg-gradient-to-r from-amber-500 to-orange-500'
                  }`} />
                </div>
              </div>
              <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl font-bold transition-all ${
                step === 'tutor' 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
              }`}>
                <span className="text-lg">👤</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm font-semibold">
              <span className={step === 'pet' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>Dados do pet</span>
              <span className={step === 'tutor' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}>Dados do tutor</span>
            </div>
          </div>

          {step === 'pet' ? (
            <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Qual o nome do seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">pet</span>?
              </h1>
              <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
                Vamos conhecer melhor o seu melhor amigo.
              </p>

              <form onSubmit={handleNextStep} className="mt-8 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <span className="text-lg">🐾</span> Nome do pet *
                    </label>
                    <input
                      name="nome"
                      value={form.nome}
                      onChange={handleChange}
                      placeholder="Ex: Rex, Luna, Thor..."
                      required
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400 dark:focus:bg-slate-800"
                    />
                  </div>

                  <div className="relative">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <span className="text-lg">🧬</span> Raça *
                    </label>
                    <input
                      name="raca"
                      value={buscaRaca}
                      onChange={(e) => handleBuscaRaca(e.target.value)}
                      onFocus={() => setMostrarRacas(true)}
                      onBlur={() => setTimeout(() => setMostrarRacas(false), 200)}
                      placeholder="Digite para buscar..."
                      required
                      autoComplete="off"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400 dark:focus:bg-slate-800"
                    />
                    {mostrarRacas && racasFiltradas.length > 0 && (
                      <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                        {racasFiltradas.map((raca) => (
                          <button
                            key={raca}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selecionarRaca(raca)}
                            className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-amber-50 dark:hover:bg-amber-950 ${
                              form.raca === raca ? 'bg-amber-50 font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {raca}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <span className="text-lg">📅</span> Data de nascimento *
                    </label>
                    <input
                      type="date"
                      name="dataNascimento"
                      value={form.dataNascimento}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().split('T')[0]}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <span className="text-lg">⚖️</span> Peso atual (kg) *
                    </label>
                    <input
                      type="number"
                      name="peso"
                      value={form.peso}
                      onChange={handleChange}
                      placeholder="Ex: 12.5"
                      required
                      min="0.1"
                      max="200"
                      step="0.1"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400 dark:focus:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <span className="text-lg">⚧️</span> Sexo
                    </label>
                    <select
                      name="sexo"
                      value={form.sexo}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-800"
                    >
                      <option value="macho">Macho ♂️</option>
                      <option value="femea">Fêmea ♀️</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <span className="text-lg">🎯</span> Objetivo principal
                    </label>
                    <select
                      name="objetivo"
                      value={form.objetivo}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-800"
                    >
                      <option value="manutencao">🏋️ Manutenção</option>
                      <option value="pelagem">✨ Pelagem</option>
                      <option value="desempenho">🚀 Desempenho</option>
                      <option value="emagrecimento">⚖️ Emagrecimento</option>
                    </select>
                  </div>
                </div>

                {erro && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100 dark:bg-red-950 dark:text-red-400 dark:ring-red-900">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {erro}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    Passo 1 de 2
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition hover:shadow-xl hover:shadow-amber-500/40"
                  >
                    Próximo
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Dados do <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">tutor</span>
              </h1>
              <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
                Agora vamos conhecer você, tutor do {form.nome}.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <span className="text-lg">👤</span> Seu nome *
                    </label>
                    <input
                      name="tutorNome"
                      value={form.tutorNome}
                      onChange={handleChange}
                      placeholder="Ex: João Silva"
                      required
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <span className="text-lg">📧</span> E-mail *
                    </label>
                    <input
                      type="email"
                      name="tutorEmail"
                      value={form.tutorEmail}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      required
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <span className="text-lg">📱</span> Telefone
                    </label>
                    <input
                      type="tel"
                      name="tutorTelefone"
                      value={form.tutorTelefone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:bg-slate-800"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <span className="text-lg">📍</span> Endereço
                    </label>
                    <input
                      name="tutorEndereco"
                      value={form.tutorEndereco}
                      onChange={handleChange}
                      placeholder="Rua, número, bairro, cidade"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Consentimentos (LGPD)</p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consentimentoMarketing}
                      onChange={(e) => setForm((prev) => ({ ...prev, consentimentoMarketing: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 dark:border-slate-600"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Receber novidades, dicas e promoções por e-mail. <span className="font-semibold text-slate-700 dark:text-slate-300">(Opcional)</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consentimentoLocalizacao}
                      onChange={(e) => setForm((prev) => ({ ...prev, consentimentoLocalizacao: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 dark:border-slate-600"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Compartilhar localização para encontrar serviços próximos. <span className="font-semibold text-slate-700 dark:text-slate-300">(Opcional)</span>
                    </span>
                  </label>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Seus dados são protegidos conforme a LGPD. Consulte nossa{' '}
                    <a href="/politica-de-privacidade" target="_blank" className="underline text-emerald-600 dark:text-emerald-400">Política de Privacidade</a>.
                  </p>
                </div>

                {erro && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100 dark:bg-red-950 dark:text-red-400 dark:ring-red-900">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {erro}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('pet')}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"/>
                      <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl hover:shadow-emerald-500/40"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Criar perfil
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
