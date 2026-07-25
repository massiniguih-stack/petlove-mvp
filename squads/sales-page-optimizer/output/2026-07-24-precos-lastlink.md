# Revisão de preços LastLink — atualizado 2026-07-24

## Decisão do usuário (checkpoint re-run)

| Plano | Valor no app (EXP-18 ship) |
|-------|----------------------------|
| Tutor mensal | **R$ 29,49**/mês |
| Tutor anual | **R$ 238,80**/ano (~**R$ 19,90**/mês) · badge **-33%** |
| Parceiro | sem mudança: 0 · 39,80 · 69,80 · 129,80 |

## Checklist LastLink (você na plataforma)

- [ ] Produto tutor mensal = **R$ 29,49**
- [ ] Produto tutor anual = **R$ 238,80** (cobrança única no ano)
- [ ] Slugs no Vercel batem com esses produtos (`LASTLINK_TUTOR_MONTHLY_SLUG`, `LASTLINK_TUTOR_ANNUAL_SLUG`)
- [ ] Testar um checkout real (ou sandbox) e comparar valor da tela vs cobrança

## Arquivos de código atualizados

- `app/planos/PlanosClient.tsx`
- `app/planos/page.tsx`
- `app/comparar/page.tsx`
- `app/dashboard/page.tsx`
- `app/api/admin/dashboard-stats/route.ts`
- `_opensquad/_memory/company.md`

## Risco

Se a LastLink ainda cobrar R$ 19,90 / R$ 115, o app **anuncia** 29,49 / 238,80 — atualize a LastLink **antes** do deploy de produção.
