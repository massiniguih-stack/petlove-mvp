'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePetStore } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function OnboardingPage() {
  const router = useRouter();
  const { pet, setPet } = usePetStore();
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({
    nome: pet?.nome ?? '',
    raca: pet?.raca ?? '',
    dataNascimento: pet?.dataNascimento ?? '',
    peso: pet?.peso?.toString() ?? '',
    sexo: pet?.sexo ?? 'macho',
    objetivo: 'manutencao',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro('');
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    setPet({
      id: crypto.randomUUID(),
      nome: form.nome.trim(),
      raca: form.raca.trim(),
      dataNascimento: form.dataNascimento,
      peso: pesoNum,
      sexo: form.sexo as 'macho' | 'femea',
      objetivo: form.objetivo as 'manutencao' | 'pelagem' | 'desempenho',
      fotoUrl: null,
      tutorId: 'tutor-placeholder',
    });
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Cadastro do pet
          </h1>
          <p className="mt-2 text-slate-600">
            Preencha os dados do seu cachorro para receber recomendações personalizadas.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Nome do pet
                </label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Raça
                </label>
                <input
                  name="raca"
                  value={form.raca}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Data de nascimento
                </label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={form.dataNascimento}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Peso atual (kg)
                </label>
                <input
                  type="number"
                  name="peso"
                  value={form.peso}
                  onChange={handleChange}
                  required
                  min="0.1"
                  max="200"
                  step="0.1"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Sexo
                </label>
                <select
                  name="sexo"
                  value={form.sexo}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
                >
                  <option value="macho">Macho</option>
                  <option value="femea">Fêmea</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Objetivo principal
                </label>
                <select
                  name="objetivo"
                  value={form.objetivo}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
                >
                  <option value="manutencao">Manutenção</option>
                  <option value="pelagem">Pelagem</option>
                  <option value="desempenho">Desempenho</option>
                </select>
              </div>
            </div>

            {erro && (
              <p className="text-sm text-red-600">{erro}</p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Ao continuar, você concorda com nossos termos de uso e política de privacidade.
              </p>
              <button
                type="submit"
                className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Criar perfil do pet
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
