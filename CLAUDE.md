# Patinha MVP

Next.js 14 (App Router) + Supabase app for pet tutors (main app) and a
staff-only admin panel. Payments via LastLink (webhook-driven), email via
Resend, push notifications via Firebase Cloud Messaging.

## Opensquad neste projeto

Este projeto agora usa **Opensquad** para squads locais de agentes. Use:

- `/opensquad` — abrir menu principal
- `/opensquad run sales-page-optimizer` — rodar o squad de otimização das páginas de venda
- `/opensquad edit sales-page-optimizer` — ajustar o squad

Estrutura OpenSquad:

- `_opensquad/` — arquivos core do Opensquad; não editar manualmente
- `_opensquad/_memory/` — contexto persistente de empresa/preferências
- `squads/` — squads criados pelo projeto
- `squads/{name}/output/` — artefatos gerados pelos agentes
- `_opensquad/_browser_profile/` — sessões Playwright locais, privadas e ignoradas pelo git

## Structure

- `app/` — routes. Tutor-facing pages at the root (`/dashboard`, `/vida`,
  `/racao`, `/atividades`, `/mapa`, `/comparar`, ...), staff admin under
  `app/admin/**`, API routes under `app/api/**`.
- `lib/` — shared logic: `lib/store.ts` (Zustand pet/subscription store),
  `lib/supabase/*` (browser/server/admin Supabase clients — `admin.ts` uses
  the service-role key and must stay server-only), `lib/push.ts` (Firebase
  Admin push sending).
- `data/` — static reference data (`cidades`, `servicosMock` used as
  one-time seed data, breed lists), not user data.
- `supabase/migrations/` — applied manually via the Supabase SQL editor;
  there's no linked `supabase` CLI session in this environment, so new
  migrations need to be run by hand after merging.

## Gotchas learned the hard way

- `next dev`'s HMR needs `unsafe-eval`, which the CSP in `next.config.js`
  blocks — use `npm run build && npm run start` to test changes locally,
  not `npm run dev`.
- Admin-only API routes must check `isAdmin(user.email)` from
  `lib/supabase/admin.ts`; being merely authenticated is not enough.
- RLS policies must include `TO <role>` — `USING (true)` without a `TO`
  clause grants access to `anon`, not just the intended role.
