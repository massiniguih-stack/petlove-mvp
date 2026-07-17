'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';

const mensagens = [
  {
    id: 'whatsapp',
    titulo: 'WhatsApp — Convite Direto',
    icone: '💬',
    cor: 'from-emerald-500 to-green-500',
    corBg: 'bg-emerald-50',
    corText: 'text-emerald-700',
    mensagem: `🐾 Olá! Somos do Patinha, o app que conecta tutores de pets aos melhores serviços da cidade.

Vi que a ${'{CLINICA}'} é uma ótima opção para os tutores da região e gostaríamos de convidá-la para ser nossa parceira Premium!

✅ Destaque no mapa para toda a cidade
✅ Selo de credibilidade no seu perfil
✅ Acesso a milhares de tutores ativos
✅ Métricas de visualização e contato
✅ Suporte dedicado para seu negócio

🔥 Oferta exclusiva: 50% OFF para novos parceiros!
De R$ 49,90 por apenas R$ 24,90/mês

Quer saber mais? Acesse: patinha.app/parceiros/premium

Estamos à disposição para qualquer dúvida! 😊`,
  },
  {
    id: 'email',
    titulo: 'Email — Convite Formal',
    icone: '📧',
    cor: 'from-blue-500 to-indigo-500',
    corBg: 'bg-blue-50',
    corText: 'text-blue-700',
    mensagem: `Assunto: Convite para ser Parceiro Patinha — 50% OFF para sua clínica

Prezado(a),

Sou da equipe do Patinha, plataforma que conecta tutores de pets aos melhores serviços veterinários e pet shops do Brasil.

Identificamos que a ${'{CLINICA}'} seria um parceiro ideal para nossa rede, e gostaríamos de convidá-la a se juntar ao nosso programa de parceiros Premium.

Benefícios do Plano Premium:
• Destaque no topo do mapa para sua região
• Selo de credibilidade no perfil do estabelecimento
• Galeria de até 20 fotos do seu espaço
• Botão de WhatsApp para contato direto
• Painel completo de métricas e analytics
• Suporte prioritário 24 horas

💰 Oferta Especial de Lançamento:
Plano Básico: R$ 24,90/mês (era R$ 49,90)
Plano Profissional: R$ 49,90/mês (era R$ 99,90)
Plano Empresarial: R$ 99,90/mês (era R$ 199,90)

Para se cadastrar, acesse:
https://patinha.app/parceiros/cadastro

Ficamos à disposição para esclarecer qualquer dúvida.

Atenciosamente,
Equipe Patinha
contato@patinha.app`,
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

Sou do Patinha, um app que ajuda tutores a encontrarem os melhores serviços para seus pets.

Estamos convidando clínicas e pet shops da região para serem nossos parceiros Premium. É uma chance incrível de ganhar visibilidade e atrair novos clientes!

Os benefícios são:
⭐ Destaque no mapa
📸 Galeria de fotos
💬 WhatsApp direto no perfil
📊 Métricas de visualização

E o melhor: estamos com 50% OFF para novos parceiros! Apenas R$ 24,90/mês.

Quer saber mais? Me manda que te explico tudo! 😄`,
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
"Olá! Tudo bem? Meu nome é [SEU NOME], sou representante do Patinha. Posso falar com o(a) dono(a) ou responsável?"

2. Apresentação do app:
"O Patinha é um aplicativo que conecta tutores de pets aos melhores serviços da cidade. Temos milhares de usuários ativos buscando clínicas e pet shops."

3. Convite:
"Estamos convidando estabelecimentos da região para serem nossos parceiros Premium. Com o plano, a ${'{CLINICA}'} ganharia destaque no mapa, um selo de credibilidade e acesso direto a novos clientes."

4. Oferta:
"Estamos com uma promoção de lançamento: 50% OFF para novos parceiros. O plano Básico sai por apenas R$ 24,90 por mês."

5. Próximo passo:
"Posso deixar este material informativo? E se quiser, posso fazer o cadastro agora mesmo pelo meu celular!"

Material de apoio: Cartão de visita + Flyer com QR Code para cadastro.`,
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
Meu nome é [SEU NOME], ligando em nome do Patinha."

2. Contexto:
"O Patinha é um aplicativo que conecta tutores de pets a clínicas e pet shops. Estamos expandindo na região e identificamos que a ${'{CLINICA}'} seria um parceiro ideal."

3. Benefícios:
"Com o plano Premium, a clínica ganharia:
- Destaque no topo do mapa para toda a cidade
- Selo de credibilidade no perfil
- Botão de WhatsApp para contato direto
- Acesso a milhares de tutores ativos"

4. Oferta:
"Estamos com uma condição especial de lançamento: 50% OFF para novos parceiros. A partir de R$ 24,90 por mês, sem contrato mínimo."

5. Fechamento:
"Posso enviar mais informações por WhatsApp? Ou se preferir, posso fazer o cadastro agora mesmo em poucos minutos!"

Se não tiver interesse:
"Sem problemas! Posso deixar nosso contato para quando tiver interesse? Obrigado pela atenção!"`,
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/30">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10">

          {/* Header */}
          <div className="mb-8">
            <BackButton href="/parceiros/premium" label="Voltar" />
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-sm font-bold text-white shadow-md">
                <span>📨</span> Convites para Parceiros
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Mensagens prontas para <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">convite</span>
              </h1>
              <p className="mt-3 text-slate-500 dark:text-slate-400">Copie e envie para clínicas e pet shops da sua região</p>
            </div>
          </div>

          {/* Input da clínica */}
          <div className="mb-8 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nome da clínica/pet shop (opcional)</label>
            <input
              type="text"
              value={clinica}
              onChange={(e) => setClinica(e.target.value)}
              placeholder="Ex: VetCare Clínica Veterinária"
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              Se preencher, o nome será inserido automaticamente nas mensagens
            </p>
          </div>

          {/* Mensagens */}
          <div className="space-y-6">
            {mensagens.map((m) => (
              <div key={m.id} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className={`flex items-center justify-between bg-gradient-to-r ${m.cor} p-4`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{m.icone}</span>
                    <h3 className="text-lg font-black text-white">{m.titulo}</h3>
                  </div>
                  <button
                    onClick={() => copiarMensagem(m.mensagem, m.id)}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                      mensagemCopiada === m.id
                        ? 'bg-white text-emerald-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {mensagemCopiada === m.id ? '✓ Copiado!' : '📋 Copiar'}
                  </button>
                </div>
                <div className="p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {m.mensagem.replace(/{CLINICA}/g, clinica || '[Nome da Clínica]')}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {/* Dicas */}
          <div className="mt-12 rounded-3xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 p-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">💡 Dicas para o convite</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>Pesquise o nome do estabelecimento antes de enviar o convite</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>Personalize a mensagem mencionando algo específico do negócio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>Envie em horário comercial (9h-18h) para melhor resposta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>Se não responder em 3 dias, faça um follow-up educado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>Ofereça fazer o cadastro gratuitamente para facilitar o processo</span>
              </li>
            </ul>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
