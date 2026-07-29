'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import { buildPartnerWhatsAppMessage, partnerWhatsAppTemplate } from '@/lib/partner-invite-messages';

export default function ConvitesPage() {
  const [copiado, setCopiado] = useState(false);
  const [clinica, setClinica] = useState('');
  const [cidade, setCidade] = useState('');

  const mensagem = clinica.trim()
    ? buildPartnerWhatsAppMessage({ nome: clinica.trim(), cidade: cidade.trim() || 'sua cidade' })
    : partnerWhatsAppTemplate('{CLINICA}');

  const copiar = () => {
    navigator.clipboard.writeText(mensagem);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <BackButton href="/admin" label="Voltar ao admin" />
          <h1 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
            Mensagem de WhatsApp
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Texto único usado na fila de disparos em /admin/parceiros. Foco: facilidade, crescimento e reconhecimento do negócio.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nome da clínica
              </label>
              <input
                value={clinica}
                onChange={(e) => setClinica(e.target.value)}
                placeholder="Ex: Clínica Vet Amor"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Cidade (opcional)
              </label>
              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: Campinas"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-3 text-white">
              <h2 className="text-lg font-black">💬 WhatsApp — única mensagem</h2>
            </div>
            <div className="p-5">
              <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {mensagem}
              </pre>
              <button
                type="button"
                onClick={copiar}
                className={`mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white ${
                  copiado ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-violet-600'
                }`}
              >
                {copiado ? '✓ Copiado!' : 'Copiar mensagem'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
