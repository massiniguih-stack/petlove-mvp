# Patinha MVP - Ordem de implementação

## Já feito
- [x] Projeto Next.js + Tailwind criado em `petlove-mvp/`
- [x] Rotas: `/`, `/onboarding`, `/dashboard`, `/mapa`, `/racao`
- [x] Layout base + navbar + footer
- [x] Mock de serviços no `/mapa`
- [x] Store local do pet (Zustand)
- [x] Script SQL inicial do Supabase em `supabase/schema.sql`

## Próximos passos sugeridos

### 1. Subir Supabase e aplicar schema
- Criar projeto no Supabase ou rodar localmente (`supabase init`)
- Aplicar `supabase/schema.sql`
- Copiar URL e anon key para `.env.local`

### 2. Autenticação
- Implementar login/cadastro de tutor
- Conectar com Supabase Auth
- Proteger rotas do pet/dashboard

### 3. Substituir mocks por dados reais
- `/dashboard`: carregar pet e histórico do Supabase
- `/mapa`: trocar lista mock por query em `servico` + Mapbox
- `/racao`: ligar à tabela `recomendacao_racao` e regras por raça/objetivo

### 4. LGPD mínima
- Checkbox de consentimento no onboarding
- Página de política de privacidade
- Ajustar RLS para garantir acesso apenas aos próprios dados

### 5. Ajustes pós-MVP
- Ração caseira validada com profissional
- Notificações de vacina (push/email)
- Piloto do mapa em 1 cidade com curadoria manual
