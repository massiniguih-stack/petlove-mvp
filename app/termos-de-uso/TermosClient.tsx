'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';

export default function TermosClient() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <BackButton href="/" />
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Termos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Uso</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Última atualização: julho de 2026</p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Aceitação dos termos</h2>
              <p className="mt-2">
                Ao criar uma conta ou usar o Patinha — seja como tutor de um pet, seja como parceiro (veterinário, petshop,
                hotel ou negócio similar) — você concorda com estes Termos de Uso e com a nossa{' '}
                <a href="/politica-de-privacidade" className="font-semibold text-amber-600 hover:underline">Política de Privacidade</a>.
                Se você não concordar com algum ponto, não utilize a plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. O que é o Patinha</h2>
              <p className="mt-2">
                O Patinha é uma plataforma digital que ajuda tutores a cuidar de seus pets (ração, atividades, vacinas,
                linha do tempo de saúde) e conecta esses tutores a negócios de serviços pet (veterinários, petshops,
                hotéis e afins) cadastrados na plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Cadastro e conta</h2>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Você deve fornecer informações verdadeiras e mantê-las atualizadas.</li>
                <li>Você é responsável por manter a confidencialidade da sua senha e por toda atividade realizada na sua conta.</li>
                <li>Uma mesma conta pode ser usada tanto como tutor quanto como parceiro, cada uma com seu próprio cadastro.</li>
                <li>Podemos suspender ou encerrar contas que violem estes termos ou usem a plataforma de forma indevida.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Cadastro de parceiros</h2>
              <p className="mt-2">
                Ao cadastrar um negócio como parceiro, você declara ter autoridade para representá-lo e autoriza o uso das
                informações fornecidas (nome, endereço, serviços, contato) para divulgação do negócio dentro da plataforma,
                incluindo exibição no mapa de serviços para tutores. Você pode solicitar a atualização ou remoção desse
                cadastro a qualquer momento.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Planos pagos e assinaturas</h2>
              <p className="mt-2">
                Alguns recursos (como múltiplos pets, histórico completo, comparação entre pets ou destaque no mapa para
                parceiros) exigem uma assinatura paga. Os valores e a forma de cobrança são exibidos antes da confirmação
                do pagamento. Assinaturas são processadas por um provedor de pagamento terceiro e podem ser canceladas a
                qualquer momento, valendo até o fim do período já pago.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. Uso adequado</h2>
              <p className="mt-2">Ao usar o Patinha, você concorda em não:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Fornecer informações falsas sobre você, seu pet ou seu negócio</li>
                <li>Usar a plataforma para fins ilegais ou para prejudicar outros usuários</li>
                <li>Tentar acessar dados de outras contas sem autorização</li>
                <li>Sobrecarregar ou interferir no funcionamento normal do serviço</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">7. Limitação de responsabilidade</h2>
              <p className="mt-2">
                As recomendações de ração, atividades e cuidados exibidas no app têm caráter informativo e não substituem
                a avaliação de um médico-veterinário. O Patinha não é parte nos serviços contratados diretamente entre
                tutores e parceiros, e não se responsabiliza pela qualidade, disponibilidade ou execução desses serviços.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">8. Alterações nestes termos</h2>
              <p className="mt-2">
                Podemos atualizar estes Termos de Uso periodicamente. Mudanças relevantes serão comunicadas dentro do
                aplicativo. O uso continuado da plataforma após uma atualização representa a aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">9. Contato</h2>
              <p className="mt-2">
                Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail: <strong>contato@patinha.app.br</strong>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
