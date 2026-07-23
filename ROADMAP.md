# Patinha MVP - Roadmap

> Última atualização: 2026-07-22. Este arquivo é reescrito periodicamente para
> refletir o estado real do projeto — se você concluir algo da lista de
> "Próximos passos", marque como feito ou mova para "Já feito".

## Já feito

### Base
- [x] Next.js 14 (App Router) + Tailwind
- [x] Store local do pet (Zustand) em `lib/store.ts`
- [x] Clientes Supabase (browser/server/admin) em `lib/supabase/*`

### Autenticação e cadastro
- [x] Login, cadastro e recuperação de senha (tutor) — `app/login`,
      `app/cadastro`, `app/recuperar-senha`
- [x] Onboarding do pet — `app/onboarding`
- [x] Cadastro e login de parceiros — `app/parceiros/cadastro`,
      `app/api/parceiro/*`

### Área do tutor
- [x] Dashboard, `/vida` (com galeria de fotos e timeline), `/racao`,
      `/atividades` (checklist e dicas personalizadas), `/mapa`,
      `/comparar` (com gráficos), `/desempenho`, `/conta/assinatura`
- [x] Vacinas com lembretes automáticos (`app/api/cron/vaccine-reminders`)

### Pagamentos
- [x] Integração LastLink (checkout + webhook) — `app/api/lastlink/*`
- [x] Planos (`app/planos`), checkout e página de sucesso

### Parceiros (prestadores de serviço)
- [x] Dashboard do parceiro, métricas, serviços realizados
- [x] Convites de parceiros (admin) e importação em massa

### Painel administrativo (staff)
- [x] `/admin` com métricas, usuários, feedback, parceiros
- [x] Controle de acesso via `isAdmin()` (não basta estar autenticado)

### Notificações
- [x] Push notifications via Firebase Cloud Messaging —
      `app/api/notifications/subscribe`, `lib/push.ts`
- [x] E-mails transacionais via Resend

### LGPD / institucional
- [x] Política de privacidade — `app/politica-de-privacidade`
- [x] Termos de uso — `app/termos-de-uso`
- [x] RLS (Row Level Security) aplicado nas tabelas do Supabase, com
      políticas restritas por `TO <role>` (correção histórica documentada
      em `CLAUDE.md`)

### Banco de dados
- [x] 19 migrations aplicadas manualmente (`supabase/migrations/`), cobrindo
      pagamentos, pets, parceiros, feedback, push, logs de serviço

## Próximos passos sugeridos

### 1. Testes automatizados
- Hoje não há nenhum teste (`*.test.*` / `*.spec.*`) no projeto — toda
  verificação é manual via `npm run build && npm run start`
- Começar pelos fluxos de maior risco financeiro/legal: webhook do
  LastLink (`app/api/lastlink/webhook`) e RLS das tabelas de assinatura

### 2. Observabilidade
- Não há logging estruturado nem monitoramento de erros em produção
  (ex.: Sentry) — hoje um erro no webhook de pagamento ou no cron de
  vacina só é percebido se alguém checar manualmente

### 3. CI mínimo
- Não há pipeline de CI (GitHub Actions ou similar) rodando `lint`/`build`
  a cada PR — hoje isso depende de rodar localmente antes de mergear

### 4. Fluxo de migrations
- As migrations do Supabase são aplicadas manualmente (não há CLI
  linkada neste ambiente) — avaliar se vale linkar o `supabase` CLI para
  reduzir o risco de esquecer de aplicar uma migration em produção

### 5. Pós-MVP (do roadmap original, ainda não endereçado)
- Ração caseira validada com profissional (nutricionista/veterinário)
- Piloto do `/mapa` com curadoria manual em uma cidade específica
