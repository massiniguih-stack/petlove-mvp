'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import { CheckIcon3D } from '@/components/Icons3D';

const tiposServico = [
  { id: 'veterinario', label: 'Veterinário', emoji: '🩺' },
  { id: 'petshop', label: 'Pet Shop', emoji: '🛁' },
  { id: 'creche', label: 'Creche / Day Care', emoji: '🏫' },
  { id: 'hotel', label: 'Hotel Pet', emoji: '🏨' },
  { id: 'petsitter', label: 'Pet Sitter', emoji: '🐾' },
  { id: 'parque', label: 'Parque / Área Pet', emoji: '🌳' },
];

const estados = [
  { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' }, { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' }, { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' }, { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' }, { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' }, { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' }, { uf: 'RR', nome: 'Roraima' }, { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' }, { uf: 'TO', nome: 'Tocantins' },
];

const servicosOferecidos = [
  'Consultas', 'Vacinas', 'Cirurgias', 'Exames Laboratoriais', 'Raio-X',
  'Castração', 'Microchipagem', 'Vermifugação', 'Check-up',
  'Odontologia', 'Dermatologia', 'Fisioterapia', 'Acupuntura', 'Nutrição',
  'Banho', 'Tosa', 'Day Care', 'Creche', 'Hotel', 'Passeio',
  'Educação Canina', 'Adestramento', 'Hidratação', 'Estética',
  'Rações', 'Acessórios', 'Brinquedos', 'Petiscos', 'Farmácia',
  'Área para Cães', 'Obstáculos', 'Bebedouros', 'Trilhas',
  'Pet Táxi', 'Transporte', 'Funerária / Cremação',
  'Emergência 24h', 'Internamento', 'UTI',
];

interface FormData {
  nome: string;
  tipo: string[];
  descricao: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  horarioAbertura: string;
  horarioFechamento: string;
  horarioEspecial: string;
  servicos: string[];
  plantao24h: boolean;
  aceiteTermos: boolean;
}

export default function CadastroClient() {
  const [step, setStep] = useState(1);
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState<FormData>({
    nome: '', tipo: [], descricao: '',
    endereco: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '',
    telefone: '', whatsapp: '', email: '', website: '', instagram: '', facebook: '',
    horarioAbertura: '08:00', horarioFechamento: '18:00', horarioEspecial: '',
    servicos: [], plantao24h: false, aceiteTermos: false,
  });

  const update = (field: keyof FormData, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTipo = (tipo: string) => {
    setForm((prev) => ({
      ...prev,
      tipo: prev.tipo.includes(tipo)
        ? prev.tipo.filter((t) => t !== tipo)
        : [...prev.tipo, tipo],
    }));
  };

  const toggleServico = (servico: string) => {
    setForm((prev) => ({
      ...prev,
      servicos: prev.servicos.includes(servico)
        ? prev.servicos.filter((s) => s !== servico)
        : [...prev.servicos, servico],
    }));
  };

  const [novoServico, setNovoServico] = useState('');
  const adicionarServicoCustom = () => {
    const nome = novoServico.trim();
    if (!nome || form.servicos.includes(nome)) return;
    setForm((prev) => ({ ...prev, servicos: [...prev.servicos, nome] }));
    setNovoServico('');
  };

  const [buscandoCep, setBuscandoCep] = useState(false);

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          uf: data.uf || prev.uf,
        }));
      }
    } catch {
      // Erro silencioso
    } finally {
      setBuscandoCep(false);
    }
  };

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  };

  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.aceiteTermos) return;
    setEnviando(true);
    setErroEnvio(null);
    try {
      const res = await fetch('/api/parceiros/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao enviar cadastro');
      }
      setEnviado(true);
    } catch (err) {
      setErroEnvio(err instanceof Error ? err.message : 'Erro ao enviar cadastro');
    } finally {
      setEnviando(false);
    }
  };

  const totalSteps = 4;
  const progresso = (step / totalSteps) * 100;

  if (enviado) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl shadow-emerald-500/30">
              <CheckIcon3D size={56} />
            </div>
            <h1 className="mt-8 text-3xl font-black text-slate-900 dark:text-white">Cadastro Enviado!</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Recebemos as informações de <strong>{form.nome}</strong>. Nossa equipe irá analisar e entrar em contato em até <strong>48 horas</strong>.
            </p>
            <div className="mt-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950 p-4 ring-1 ring-emerald-200 dark:ring-emerald-800">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                📧 Enviamos um e-mail de confirmação para <strong>{form.email}</strong>
              </p>
            </div>

            <div className="mt-8 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-left text-white shadow-xl shadow-amber-500/30">
              <p className="text-sm font-bold uppercase tracking-wide text-amber-100">Não quer esperar?</p>
              <h2 className="mt-1 text-xl font-black">Apareça em destaque no mapa agora mesmo</h2>
              <p className="mt-2 text-sm text-amber-50">
                Assinando o Premium, seu negócio já entra em destaque hoje, sem esperar a análise da nossa equipe.
              </p>
              <a
                href="/parceiros/premium"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-orange-600 shadow-lg transition hover:shadow-xl"
              >
                🏆 Assinar Premium agora
              </a>
            </div>

            <a
              href="/mapa"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-8 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              📍 Voltar ao Mapa
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">

          {/* Header */}
          <div className="mb-8">
            <BackButton href="/mapa" label="Voltar ao mapa" />
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-xl shadow-blue-500/30">
                <span className="text-3xl">💼</span>
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Seja um <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Parceiro</span>
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Cadastre sua clínica, pet shop ou parque no Patinha</p>
              </div>
            </div>
          </div>

          {/* Progresso */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-600 dark:text-slate-400">
              <span>Passo {step} de {totalSteps}</span>
              <span>{Math.round(progresso)}% concluído</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${progresso}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between">
              {['Negociação', 'Localização', 'Contato', 'Serviços'].map((label, i) => (
                <button
                  key={label}
                  onClick={() => setStep(i + 1)}
                  className={`text-xs font-semibold transition ${
                    step === i + 1 ? 'text-blue-600' : step > i + 1 ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step > i + 1 ? '✓' : ''} {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Informações do Negócio */}
            {step === 1 && (
              <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 ring-1 ring-slate-100 dark:ring-slate-800">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Informações do Negócio</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Conte-nos sobre sua empresa</p>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nome do Estabelecimento *</label>
                    <input
                      type="text" required value={form.nome} onChange={(e) => update('nome', e.target.value)}
                      placeholder="Ex: VetCare Clínica Veterinária"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Negócio * <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(pode selecionar mais de um)</span></label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {tiposServico.map((tipo) => (
                        <button
                          key={tipo.id} type="button"
                          onClick={() => toggleTipo(tipo.id)}
                          className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                            form.tipo.includes(tipo.id)
                              ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <span>{tipo.emoji}</span>
                          <span className="text-left">{tipo.label}</span>
                        </button>
                      ))}
                    </div>
                    {form.tipo.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {form.tipo.map((t) => {
                          const tipoInfo = tiposServico.find((ts) => ts.id === t);
                          return (
                            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              {tipoInfo?.emoji} {tipoInfo?.label}
                              <button type="button" onClick={() => toggleTipo(t)} className="ml-0.5 hover:text-blue-900">✕</button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descrição</label>
                    <textarea
                      value={form.descricao} onChange={(e) => update('descricao', e.target.value)}
                      placeholder="Descreva brevemente seu estabelecimento, diferenciais e história..."
                      rows={3}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button" onClick={() => setStep(2)}
                    disabled={!form.nome || form.tipo.length === 0}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl hover:shadow-blue-500/35 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Localização */}
            {step === 2 && (
              <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 ring-1 ring-slate-100 dark:ring-slate-800">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Localização</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Onde seus clientes podem te encontrar</p>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Endereço *</label>
                    <input
                      type="text" required value={form.endereco} onChange={(e) => update('endereco', e.target.value)}
                      placeholder="Ex: Av. Paraná, 368"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Número *</label>
                      <input
                        type="text" required value={form.numero} onChange={(e) => update('numero', e.target.value)}
                        placeholder="368"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Complemento</label>
                      <input
                        type="text" value={form.complemento} onChange={(e) => update('complemento', e.target.value)}
                        placeholder="Sala 1, Bloco B"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Bairro *</label>
                    <input
                      type="text" required value={form.bairro} onChange={(e) => update('bairro', e.target.value)}
                      placeholder="Ex: Centro"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cidade *</label>
                      <input
                        type="text" required value={form.cidade} onChange={(e) => update('cidade', e.target.value)}
                        placeholder="Ex: Maringá"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Estado *</label>
                      <select
                        required value={form.uf} onChange={(e) => update('uf', e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="">Selecione</option>
                        {estados.map((e) => (
                          <option key={e.uf} value={e.uf}>{e.nome} ({e.uf})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CEP</label>
                    <div className="relative">
                      <input
                        type="text" value={form.cep}
                        onChange={(e) => {
                          const formatted = formatCep(e.target.value);
                          update('cep', formatted);
                          if (formatted.replace(/\D/g, '').length === 8) {
                            buscarCep(formatted);
                          }
                        }}
                        onBlur={() => {
                          if (form.cep.replace(/\D/g, '').length === 8) {
                            buscarCep(form.cep);
                          }
                        }}
                        placeholder="00000-000"
                        maxLength={9}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      {buscandoCep && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Digite o CEP para preencher endereço automaticamente</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-800">
                    ← Voltar
                  </button>
                  <button
                    type="button" onClick={() => setStep(3)}
                    disabled={!form.endereco || !form.numero || !form.bairro || !form.cidade || !form.uf}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl hover:shadow-blue-500/35 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contato */}
            {step === 3 && (
              <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 ring-1 ring-slate-100 dark:ring-slate-800">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Contato</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Como seus clientes podem entrar em contato</p>

                <div className="mt-6 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Telefone *</label>
                      <input
                        type="tel" required value={form.telefone} onChange={(e) => update('telefone', e.target.value)}
                        placeholder="(44) 3305-1234"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">WhatsApp</label>
                      <input
                        type="tel" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)}
                        placeholder="(44) 99999-1234"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">E-mail *</label>
                    <input
                      type="email" required value={form.email} onChange={(e) => update('email', e.target.value)}
                      placeholder="contato@vetcarea.com.br"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Website</label>
                    <input
                      type="url" value={form.website} onChange={(e) => update('website', e.target.value)}
                      placeholder="https://www.vetcarea.com.br"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Instagram</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">@</span>
                        <input
                          type="text" value={form.instagram} onChange={(e) => update('instagram', e.target.value)}
                          placeholder="vetcarea"
                          className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3 pl-8 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Facebook</label>
                      <input
                        type="text" value={form.facebook} onChange={(e) => update('facebook', e.target.value)}
                        placeholder="vetcarea"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Horário de Funcionamento</label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Abertura</label>
                        <input
                          type="time" value={form.horarioAbertura} onChange={(e) => update('horarioAbertura', e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fechamento</label>
                        <input
                          type="time" value={form.horarioFechamento} onChange={(e) => update('horarioFechamento', e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Horário especial (opcional)</label>
                      <input
                        type="text" value={form.horarioEspecial} onChange={(e) => update('horarioEspecial', e.target.value)}
                        placeholder="Ex: Sáb 8h-12h, Dom Fechado"
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox" checked={form.plantao24h} onChange={(e) => update('plantao24h', e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="h-6 w-11 rounded-full bg-slate-200 dark:bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-full" />
                      </label>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Plantão 24 horas</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setStep(2)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-800">
                    ← Voltar
                  </button>
                  <button
                    type="button" onClick={() => setStep(4)}
                    disabled={!form.telefone || !form.email}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl hover:shadow-blue-500/35 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Serviços */}
            {step === 4 && (
              <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 ring-1 ring-slate-100 dark:ring-slate-800">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Serviços Oferecidos</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Selecione tudo que seu estabelecimento oferece</p>

                <div className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    {servicosOferecidos.map((servico) => (
                      <button
                        key={servico} type="button"
                        onClick={() => toggleServico(servico)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          form.servicos.includes(servico)
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {servico}
                      </button>
                    ))}
                    {form.servicos.filter((s) => !servicosOferecidos.includes(s)).map((servico) => (
                      <button
                        key={servico} type="button"
                        onClick={() => toggleServico(servico)}
                        className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20"
                      >
                        {servico} ✕
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={novoServico}
                      onChange={(e) => setNovoServico(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarServicoCustom(); } }}
                      placeholder="Não achou o seu serviço? Digite aqui"
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={adicionarServicoCustom}
                      className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 transition hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>

                {/* Termos */}
                <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox" checked={form.aceiteTermos} onChange={(e) => update('aceiteTermos', e.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Li e aceito os{' '}
                      <a href="#" className="font-semibold text-blue-600 hover:underline">Termos de Uso</a>
                      {' '}e{' '}
                      <a href="#" className="font-semibold text-blue-600 hover:underline">Política de Privacidade</a>.
                      Estou ciente de que meus dados serão utilizados para divulgação no Patinha.
                    </span>
                  </label>
                </div>

                {/* Resumo */}
                <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-950/30 p-5 ring-1 ring-slate-100 dark:ring-slate-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resumo do Cadastro</h3>
                  <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <p>
                      <span className="font-semibold">Negócio:</span> {form.nome} (
                      {form.tipo.map(t => tiposServico.find(ts => ts.id === t)?.label).filter(Boolean).join(', ')}
                      )
                    </p>
                    <p><span className="font-semibold">Local:</span> {form.endereco}, {form.numero} - {form.bairro}, {form.cidade}/{form.uf}</p>
                    <p><span className="font-semibold">Contato:</span> {form.telefone} · {form.email}</p>
                    {form.servicos.length > 0 && (
                      <p><span className="font-semibold">Serviços:</span> {form.servicos.join(', ')}</p>
                    )}
                  </div>
                </div>

                {erroEnvio && (
                  <p className="mt-4 rounded-xl bg-red-50 dark:bg-red-950 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">{erroEnvio}</p>
                )}

                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setStep(3)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-800">
                    ← Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={!form.aceiteTermos || enviando}
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-xl hover:shadow-emerald-500/35 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviando ? 'Enviando...' : '✅ Enviar Cadastro'}
                  </button>
                </div>
              </div>
            )}
          </form>

        </div>
      </main>
      <Footer />
    </div>
  );
}
