'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const beneficios = [
  {
    icon: '⭐',
    titulo: 'Destaque no Mapa',
    descricao: 'Seu negócio aparece no topo da lista e com selo de destaque em toda a sua região.',
  },
  {
    icon: '📍',
    titulo: 'Prioridade por Cidade',
    descricao: 'Quando alguém buscar na sua cidade, você aparece primeiro — antes dos concorrentes.',
  },
  {
    icon: '🏅',
    titulo: 'Selo Premium',
    descricao: 'Badge exclusivo que transmite confiança e credibilidade para novos clientes.',
  },
  {
    icon: '📊',
    titulo: 'Painel de Métricas',
    descricao: 'Veja quantas pessoas viram seu perfil, clicaram no mapa e entraram em contato.',
  },
  {
    icon: '📸',
    titulo: 'Galeria de Fotos',
    descricao: 'Publique até 20 fotos do seu estabelecimento, equipe e serviços.',
  },
  {
    icon: '💬',
    titulo: 'WhatsApp Direto',
    descricao: 'Botão de WhatsApp no perfil para clientes agendarem direto pelo app.',
  },
  {
    icon: '🔄',
    titulo: 'Atualizações Ilimitadas',
    descricao: 'Altere horários, serviços, fotos e informações a qualquer momento.',
  },
  {
    icon: '📞',
    titulo: 'Suporte Prioritário',
    descricao: 'Equipe dedicada para ajudar você com qualquer dúvida ou problema.',
  },
];

const depoimentos = [
  {
    nome: 'Dr. Carlos Silva',
    cargo: 'VetCare Clínica Veterinária',
    cidade: 'Maringá, PR',
    texto: 'Desde que me tornei parceiro Premium, o fluxo de clientes aumentou 40%. O destaque no mapa faz toda diferença.',
    avatar: '👨‍⚕️',
  },
  {
    nome: 'Ana Beatriz',
    cargo: 'PetLove Pet Shop',
    cidade: 'Curitiba, PR',
    texto: 'O selo Premium dá muito mais credibilidade. Clientes chegam já confiando no nosso atendimento.',
    avatar: '👩‍💼',
  },
  {
    nome: 'Marcos Oliveira',
    cargo: 'PetSkill Escola Canina',
    cidade: 'Londrina, PR',
    texto: 'Melhor investimento que fiz para o meu negócio. O retorno é muito maior que o custo da assinatura.',
    avatar: '🧑‍🏫',
  },
];

export default function ParceiroPremiumPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-4 py-20 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white" />
            <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white" />
          </div>
          <div className="relative mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
              <span>🏆</span> Parceiro Premium
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Seja o <span className="text-yellow-200">Primeiro</span> que os<br />tutores encontram
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-orange-100">
              Apareça no topo do mapa, ganhe um selo de destaque e atraira mais clientes para sua clínica ou pet shop.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/parceiros/premium/planos"
                className="rounded-2xl bg-white px-8 py-4 text-lg font-black text-orange-600 shadow-2xl transition hover:bg-orange-50 hover:shadow-3xl"
              >
                Ver Planos →
              </a>
              <a
                href="#beneficios"
                className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
              >
                Conhecer Benefícios
              </a>
            </div>
          </div>
        </section>

        {/* Comparativo */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white">
              Compare os planos
            </h2>
            <p className="mt-2 text-center text-slate-500 dark:text-slate-400">Veja a diferença entre ser parceiro comum e Premium</p>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {/* Plano Gratuito */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Parceiro Comum</h3>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Gratuito</p>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {[
                    'Listagem no mapa',
                    'Informações básicas',
                    'Telefone e endereço',
                    'Avaliação de clientes',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400 dark:text-slate-500">✓</span> {item}
                    </li>
                  ))}
                  {[
                    'Destaque no mapa',
                    'Selo Premium',
                    'Galeria de fotos',
                    'Painel de métricas',
                    'WhatsApp direto',
                    'Suporte prioritário',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
                      <span>✕</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Plano Premium */}
              <div className="relative rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg shadow-amber-500/10">
                <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 text-xs font-black text-white shadow-md">
                  ⭐ MAIS POPULAR
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Parceiro Premium</h3>
                    <p className="text-sm font-bold text-amber-600">
                  <span className="text-slate-400 dark:text-slate-500 line-through">R$ 49,90</span>{' '}
                  <span className="text-lg">R$ 24,90</span>/mês
                </p>
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  🎉 50% OFF — Só para membros PetLove
                </p>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {[
                    'Listagem no mapa',
                    'Informações básicas',
                    'Telefone e endereço',
                    'Avaliação de clientes',
                    'Destaque no topo do mapa',
                    'Selo Premium exclusivo',
                    'Galeria de até 20 fotos',
                    'Painel de métricas completo',
                    'Botão WhatsApp direto',
                    'Suporte prioritário 24h',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-amber-500">✓</span> {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/parceiros/premium/planos"
                  className="mt-6 block rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-center text-sm font-black text-white shadow-lg shadow-amber-500/25 transition hover:shadow-xl hover:shadow-amber-500/35"
                >
                  Começar Agora →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section id="beneficios" className="bg-white dark:bg-slate-900 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white">
              Tudo que você precisa para <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">crescer</span>
            </h2>
            <p className="mt-2 text-center text-slate-500 dark:text-slate-400">Benefícios exclusivos para parceiros Premium</p>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {beneficios.map((b) => (
                <div key={b.titulo} className="group rounded-3xl border border-slate-100 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-3xl transition group-hover:scale-110">
                    {b.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">{b.titulo}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{b.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white">
              O que dizem nossos parceiros
            </h2>
            <p className="mt-2 text-center text-slate-500 dark:text-slate-400">Resultados reais de quem já é Premium</p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {depoimentos.map((d) => (
                <div key={d.nome} className="rounded-3xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <div className="flex items-center gap-1 text-amber-500">
                    {'⭐⭐⭐⭐⭐'.split('').map((_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">&ldquo;{d.texto}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-xl">
                      {d.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{d.nome}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{d.cargo} · {d.cidade}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-10 text-center text-white shadow-2xl shadow-amber-500/30">
            <h2 className="text-3xl font-black">Pronto para ser o nº 1 da sua cidade?</h2>
            <p className="mx-auto mt-3 max-w-lg text-orange-100">
              Junte-se a centenas de parceiros que já estão crescendo com o PetLove Premium.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/parceiros/premium/planos"
                className="rounded-2xl bg-white px-8 py-4 text-lg font-black text-orange-600 shadow-xl transition hover:bg-orange-50"
              >
                Ver Planos e Preços 🏆
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
