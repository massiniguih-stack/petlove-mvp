'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';

const SITE = 'https://patinha-mvp.vercel.app';

const mensagens = [
  {
    id: 'whatsapp',
    titulo: 'WhatsApp — Convite Direto',
    icone: '💬',
    cor: 'from-emerald-500 to-green-500',
    corBg: 'bg-emerald-50',
    corText: 'text-emerald-700',
    mensagem: `🐾 Olá! Somos do Patinha, o app que conecta tutores de pets aos melhores serviços da cidade.

Vi que a ${'{CLINICA}'} é uma ótima opção para os tutores da região e gostaríamos de convidá-los a entrar no mapa.

✅ Listagem grátis (após análise)
✅ Planos pagos com selo e destaque
✅ WhatsApp direto no perfil
✅ Painel de métricas nos planos pagos

📋 Planos:
• Grátis
• Básico — R$ 39,80/mês
• Profissional — R$ 69,80/mês
• Empresarial — R$ 129,80/mês

Veja os planos: ${SITE}/parceiros/premium
Cadastro: ${SITE}/parceiros/cadastro

Estamos à disposição! 😊`,
  },
  {
    id: 'email',
    titulo: 'Email — Convite Formal',
    icone: '📧',
    cor: 'from-blue-500 to-indigo-500',
    corBg: 'bg-blue-50',
    corText: 'text-blue-700',
    mensagem: `Assunto: Convite para ser parceiro Patinha — mapa de serviços pet

Prezado(a),

Sou da equipe do Patinha, plataforma que conecta tutores de pets aos melhores serviços veterinários e pet shops.

Identificamos que a ${'{CLINICA}'} seria um parceiro ideal e gostaríamos de convidá-los a se juntar ao mapa.

Planos disponíveis:
• Grátis — listagem após análise
• Básico — R$ 39,80/mês (selo Premium)
• Profissional — R$ 69,80/mês (selo + destaque)
• Empresarial — R$ 129,80/mês (máxima visibilidade)

Benefícios dos planos pagos:
• Selo de credibilidade no mapa
• Destaque na busca da cidade (Pro e Empresarial)
• Botão de WhatsApp no perfil
• Painel de métricas

Cadastro: ${SITE}/parceiros/cadastro
Planos: ${SITE}/parceiros/premium

Atenciosamente,
Equipe Patinha`,
  },
  {
    id: 'instagram',
    titulo: 'Instagram — Mensagem Direta',
    icone: '📸',
    cor: 'from-pink-500 to-purple-500',
    corBg: 'bg-pink-50',
    corText: 'text-pink-700',
    mensagem: `Oi! 👋

Vi o perfil da ${'{CLINICA}'} e amei o trabalho de vocês! 🐶🐱

Sou do Patinha, app que ajuda tutores a encontrarem serviços pet perto de casa.

Estamos convidando clínicas e pet shops da região para entrarem no mapa — tem opção grátis e planos pagos com selo e destaque.

Planos: Grátis · Básico R$ 39,80 · Pro R$ 69,80 · Empresarial R$ 129,80

Quer saber mais? ${SITE}/parceiros/premium

Me manda que te explico! 😄`,
  },
  {
    id: 'presencial',
    titulo: 'Abordagem Presencial',
    icone: '🤝',
    cor: 'from-amber-500 to-orange-500',
    corBg: 'bg-amber-50',
    corText: 'text-amber-700',
    mensagem: `Script de abordagem presencial:

1. Apresentação:
"Olá! Tudo bem? Meu nome é [SEU NOME], sou da Patinha. Posso falar com o(a) dono(a) ou responsável?"

2. App:
"O Patinha é um aplicativo que conecta tutores de pets aos serviços da cidade — mapa, saúde e ração."

3. Convite:
"Estamos convidando estabelecimentos da região. A ${'{CLINICA}'} pode entrar grátis (após análise) ou assinar Básico, Profissional ou Empresarial para selo e destaque."

4. Preços:
"Básico R$ 39,80 · Profissional R$ 69,80 · Empresarial R$ 129,80 por mês."

5. Próximo passo:
"Posso deixar o link de cadastro? ${SITE}/parceiros/cadastro"

Material: cartão + QR Code para cadastro.`,
  },
  {
    id: 'ligacao',
    titulo: 'Ligação — Telemarketing',
    icone: '📞',
    cor: 'from-violet-500 to-purple-500',
    corBg: 'bg-violet-50',
    corText: 'text-violet-700',
    mensagem: `Script de ligação:

1. Abertura:
"Boa tarde! Falo com o(a) dono(a) da ${'{CLINICA}'}?
Meu nome é [SEU NOME], da Patinha."

2. Contexto:
"O Patinha é um app que conecta tutores a clínicas e pet shops. Estamos expandindo na região e a ${'{CLINICA}'} seria um parceiro ideal."

3. Benefícios:
"- Entrada grátis no mapa (após análise)
- Planos pagos com selo Premium e destaque
- WhatsApp no perfil
- Painel de métricas"

4. Preços:
"Básico R$ 39,80 · Profissional R$ 69,80 · Empresarial R$ 129,80 / mês."

5. Fechamento:
"Posso enviar o link por WhatsApp? ${SITE}/parceiros/premium"

Se não tiver interesse:
"Sem problemas! Deixo nosso contato para quando quiser. Obrigado!"`,
  },
];

export default function ConvitesPage() {
  const [mensagemCopiada, setMensagemCopiada] = useState<string | null>(null);
  const [clinica, setClinica] = useState('');

  const copiarMensagem = (mensagem: string, id: string) => {
    const mensagemFinal = mensagem.replace(/{CLINICA}/g, clinica || '[Nome da Clínica]');
    navigator.clipboard.writeText(mensagemFinal);
    setMensagemCopiada(id);
    setTimeout(() => setMensagemCopiada(null), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/30">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <BackButton href="/admin" label="Voltar ao admin" />
          <h1 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
            Scripts de convite a parceiros
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Preços reais: Grátis · Básico R$ 39,80 · Pro R$ 69,80 · Empresarial R$ 129,80
          </p>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Nome da clínica (substitui {'{CLINICA}'})
            </label>
            <input
              value={clinica}
              onChange={(e) => setClinica(e.target.value)}
              placeholder="Ex: Clínica Vet Amor"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div className="mt-8 space-y-6">
            {mensagens.map((m) => (
              <div
                key={m.id}
                className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
              >
                <div className={`bg-gradient-to-r ${m.cor} px-5 py-3 text-white`}>
                  <h2 className="text-lg font-black">
                    {m.icone} {m.titulo}
                  </h2>
                </div>
                <div className="p-5">
                  <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {m.mensagem.replace(/{CLINICA}/g, clinica || '[Nome da Clínica]')}
                  </pre>
                  <button
                    type="button"
                    onClick={() => copiarMensagem(m.mensagem, m.id)}
                    className={`mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white ${
                      mensagemCopiada === m.id ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-violet-600'
                    }`}
                  >
                    {mensagemCopiada === m.id ? '✓ Copiado!' : 'Copiar mensagem'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
