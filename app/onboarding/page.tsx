'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePetStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { racasCachorros } from '@/data/racas';

export default function OnboardingPage() {
  const router = useRouter();
  const { pet, addPet, updatePet, hydrated } = usePetStore();
  const { user, loading: authLoading } = useAuth();
  const [erro, setErro] = useState('');
  const [mostrarOpcionais, setMostrarOpcionais] = useState(false);
  const [buscaRaca, setBuscaRaca] = useState(pet?.raca ?? '');
  const [mostrarRacas, setMostrarRacas] = useState(false);
  const [form, setForm] = useState({
    nome: pet?.nome ?? '',
    raca: pet?.raca ?? '',
    dataNascimento: pet?.dataNascimento ?? '',
    peso: pet?.peso?.toString() ?? '',
    sexo: pet?.sexo ?? 'macho',
    objetivo: pet?.objetivo ?? 'manutencao',
    tutorTelefone: pet?.tutor?.telefone ?? '',
    tutorEndereco: pet?.tutor?.endereco ?? '',
    consentimentoMarketing: false,
    consentimentoLocalizacao: false,
  });

  // Preenche telefone/endereço se já existirem no pet
  useEffect(() => {
    if (pet?.tutor?.telefone || pet?.tutor?.endereco) {
      setMostrarOpcionais(true);
    }
  }, [pet]);

  // pet só fica disponível depois que o store hidrata a partir do
  // localStorage (ver lib/store.ts); os useState acima capturam o valor
  // inicial (vazio) antes disso, então re-sincroniza o formulário assim
  // que a hidratação terminar, se houver um pet existente para editar.
  useEffect(() => {
    if (hydrated && pet) {
      setForm({
        nome: pet.nome,
        raca: pet.raca,
        dataNascimento: pet.dataNascimento,
        peso: pet.peso?.toString() ?? '',
        sexo: pet.sexo,
        objetivo: pet.objetivo,
        tutorTelefone: pet.tutor?.telefone ?? '',
        tutorEndereco: pet.tutor?.endereco ?? '',
        consentimentoMarketing: false,
        consentimentoLocalizacao: false,
      });
      setBuscaRaca(pet.raca ?? '');
    }
  }, [hydrated]);

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

  const tutorNome =
    (user?.user_metadata?.nome as string | undefined)?.trim() ||
    (user?.user_metadata?.full_name as string | undefined)?.trim() ||
    (user?.user_metadata?.name as string | undefined)?.trim() ||
    user?.email?.split('@')[0] ||
    'Tutor';

  const tutorEmail = user?.email ?? pet?.tutor?.email ?? '';

  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!form.nome.trim() || !form.raca.trim() || !form.dataNascimento || !form.peso) {
      setErro('Preencha os campos obrigatórios do pet.');
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

    if (!tutorEmail) {
      setErro('Não encontramos seu e-mail da conta. Saia e entre de novo.');
      return;
    }

    const tutor = {
      nome: tutorNome,
      email: tutorEmail,
      telefone: form.tutorTelefone.trim(),
      endereco: form.tutorEndereco.trim(),
    };

    setSalvando(true);
    const resultado = pet
      ? await updatePet(pet.id, {
          nome: form.nome.trim(),
          raca: form.raca.trim(),
          dataNascimento: form.dataNascimento,
          peso: pesoNum,
          sexo: form.sexo as 'macho' | 'femea',
          objetivo: form.objetivo as 'manutencao' | 'pelagem' | 'desempenho' | 'emagrecimento',
          tutor,
        })
      : await addPet({
          id: crypto.randomUUID(),
          nome: form.nome.trim(),
          raca: form.raca.trim(),
          dataNascimento: form.dataNascimento,
          peso: pesoNum,
          sexo: form.sexo as 'macho' | 'femea',
          objetivo: form.objetivo as 'manutencao' | 'pelagem' | 'desempenho' | 'emagrecimento',
          fotoUrl: null,
          tutor,
        });
    setSalvando(false);

    // O pet já foi salvo neste dispositivo mesmo se o envio ao servidor falhar
    // (uma próxima sincronização tenta de novo automaticamente), então não
    // travamos o fluxo — só avisamos.
    if (resultado?.error) {
      console.warn(resultado.error);
    }

    router.push('/dashboard');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12">
          {/* Progresso simples: 1 passo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                ✓
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">Conta criada</span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-xs font-bold text-white">
                2
              </span>
              <span className="text-amber-600 dark:text-amber-400">Seu pet</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Último passo — depois você já usa o app
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
              {pet ? (
                <>
                  Editar perfil de{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                    {pet.nome}
                  </span>
                </>
              ) : (
                <>
                  Qual o nome do seu{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                    pet
                  </span>
                  ?
                </>
              )}
            </h1>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              {pet
                ? 'Atualize os dados quando quiser.'
                : 'Só os dados essenciais. Leva menos de 1 minuto.'}
            </p>

            {/* Conta do tutor (já preenchida) */}
            {user && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg dark:bg-emerald-900">
                  👤
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                    {tutorNome}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{tutorEmail}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                  Sua conta
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                    autoFocus
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400"
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
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400"
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
                            form.raca === raca
                              ? 'bg-amber-50 font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'text-slate-700 dark:text-slate-300'
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
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-amber-400"
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
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400"
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
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-amber-400"
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
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-amber-400"
                  >
                    <option value="manutencao">🏋️ Manutenção</option>
                    <option value="pelagem">✨ Pelagem</option>
                    <option value="desempenho">🚀 Desempenho</option>
                    <option value="emagrecimento">⚖️ Emagrecimento</option>
                  </select>
                </div>
              </div>

              {/* Opcionais recolhidos para não assustar */}
              <div className="rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700">
                <button
                  type="button"
                  onClick={() => setMostrarOpcionais((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span>Telefone, endereço e preferências (opcional)</span>
                  <span className="text-slate-400">{mostrarOpcionais ? '−' : '+'}</span>
                </button>
                {mostrarOpcionais && (
                  <div className="space-y-4 border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-800">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          name="tutorTelefone"
                          value={form.tutorTelefone}
                          onChange={handleChange}
                          placeholder="(11) 99999-9999"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          Endereço
                        </label>
                        <input
                          name="tutorEndereco"
                          value={form.tutorEndereco}
                          onChange={handleChange}
                          placeholder="Cidade ou bairro"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={form.consentimentoMarketing}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, consentimentoMarketing: e.target.checked }))
                          }
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Receber novidades e dicas por e-mail (opcional)
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={form.consentimentoLocalizacao}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              consentimentoLocalizacao: e.target.checked,
                            }))
                          }
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Usar localização para serviços próximos (opcional)
                        </span>
                      </label>
                      <p className="text-[10px] text-slate-400">
                        Seus dados seguem a LGPD.{' '}
                        <a
                          href="/politica-de-privacidade"
                          target="_blank"
                          className="underline text-emerald-600 dark:text-emerald-400"
                        >
                          Política de Privacidade
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {erro && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100 dark:bg-red-950 dark:text-red-400 dark:ring-red-900">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={salvando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition hover:shadow-xl hover:shadow-amber-500/40 disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : pet ? 'Salvar alterações' : 'Concluir e ir para o painel'}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
