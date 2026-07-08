'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <BackButton href="/" />
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Política de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Privacidade</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Última atualização: janeiro de 2026</p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Quem somos</h2>
              <p className="mt-2">
                O PetLove é uma plataforma digital que conecta tutores de animais de estimação a serviços e cuidados para seus pets.
                Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais,
                em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Dados que coletamos</h2>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li><strong>Dados de cadastro:</strong> nome, e-mail, telefone, endereço</li>
                <li><strong>Dados do pet:</strong> nome, raça, data de nascimento, peso, sexo, objetivo</li>
                <li><strong>Dados de localização:</strong> quando autorizado, sua localização para encontrar serviços próximos</li>
                <li><strong>Dados de uso:</strong> interações no app, checklists preenchidos, histórico de atividades</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Finalidade do tratamento</h2>
              <p className="mt-2">
                Seus dados são utilizados para:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Fornecer recomendações personalizadas de ração, atividades e cuidados</li>
                <li>Mostrar serviços próximos à sua localização</li>
                <li>Enviar lembretes de vacinas, refeições e atividades</li>
                <li>Melhorar a experiência de uso do aplicativo</li>
                <li>Comunicar novidades e atualizações (somente com consentimento)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Compartilhamento de dados</h2>
              <p className="mt-2">
                Não vendemos ou compartilhamos seus dados pessoais com terceiros para fins de marketing.
                Seus dados podem ser compartilhados apenas:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Com prestadores de serviços listados na plataforma (quando você agenda um serviço)</li>
                <li>Por obrigação legal ou ordem judicial</li>
                <li>Com provedores de infraestrutura que auxiliam na operação (ex: Supabase, Vercel)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Armazenamento e segurança</h2>
              <p className="mt-2">
                Seus dados são armazenados em servidores seguros com criptografia em trânsito (HTTPS) e em repouso.
                Utilizamos o Supabase como provedor de banco de dados, que adota medidas técnicas e administrativas
                de segurança da informação.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. Seus direitos (LGPD)</h2>
              <p className="mt-2">Conforme a LGPD, você tem direito a:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li><strong>Acesso:</strong> solicitar uma cópia dos seus dados pessoais</li>
                <li><strong>Correção:</strong> solicitar a correção de dados incompletos ou desatualizados</li>
                <li><strong>Exclusão:</strong> solicitar a exclusão dos seus dados pessoais</li>
                <li><strong>Revogação do consentimento:</strong> a qualquer momento, para finalidades que dependam de consentimento</li>
                <li><strong>Portabilidade:</strong> solicitar a transferência dos seus dados para outro serviço</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">7. Retenção de dados</h2>
              <p className="mt-2">
                Seus dados são mantidos enquanto sua conta estiver ativa.
                Após solicitação de exclusão, seus dados serão removidos em até 30 dias,
                exceto quando houver obrigação legal de conservação.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">8. Cookies e tecnologias</h2>
              <p className="mt-2">
                Utilizamos cookies essenciais para o funcionamento da aplicação (autenticação).
                Não utilizamos cookies de rastreamento ou publicitários.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">9. Contato</h2>
              <p className="mt-2">
                Em caso de dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus dados,
                entre em contato pelo e-mail: <strong>contato@petlove.app.br</strong>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
