# Squad Memory: Sales Page Optimizer

## Estilo de Escrita

- pt-BR, tutor acolhedor; parceiro mais direto/comercial
- Preferir benefício lastreado a feature dump
- Nunca inventar número de usuários, % OFF ou preço sem LastLink

## Design Visual

- Tutor: amber/orange; Premium tutor: violet
- Parceiro: amber/orange + tiers Free/Basic/Pro/Enterprise
- Soft 3D icons no produto

## Estrutura de Conteúdo

- Dois funis: tutor Premium e parceiro Premium (mapa)
- Home: CTA tutor primário, parceiro secundário
- Upsell pós-sucesso do cadastro parceiro preservado

## Proibições Explícitas

- “50% OFF” / preço riscado sem campanha real
- “Milhares de tutores” sem fonte
- Alertas de vacina como exclusivo PRO (cron é free)
- Toggle anual cosmético no parceiro
- Mudar preço na UI sem slug LastLink correspondente (EXP-18)

## Técnico (específico do squad)

- Checkout: `POST /api/lastlink/checkout` + planTypes em `lib/lastlink.ts`
- Tutor: `tutor_monthly` | `tutor_annual` (slugs SET)
- Parceiro pago: `partner_basic` | `partner_pro` | `partner_enterprise` (slugs SET)
- `partner_annual` slug EMPTY — não vender
- Preços UI atuais: tutor **29,49** / **238,80** ano; parceiro 39,80 / 69,80 / 129,80
- LastLink deve espelhar tutor 29,49 e 238,80 (checklist ops em `output/2026-07-24-precos-lastlink.md`)

## Status implementação EXPs (2026-07-24)

| EXP | Status |
|-----|--------|
| 01 Auth redirect `/planos` | ✅ |
| 02A Alertas free na tabela | ✅ |
| 03 CTA hierarquia home | ✅ |
| 04 Glossário free vs Premium | ✅ |
| 05 Chip Premium no hub | ✅ |
| 06 Copy cadastro tutor | ✅ |
| 07 Trust line LastLink | ✅ |
| 08 Higiene pt-BR | ✅ (superfícies comerciais) |
| 09 BackButton contextual | ✅ |
| 10 Paywall `/comparar` + preço | ✅ |
| 11 Cadastro parceiro Negócio | ✅ |
| 12 Copy e-mail/SLA defensiva | ✅ |
| 13A Sem toggle cosmético | ✅ (tiers reais mensais) |
| 13B Anual parceiro real | ❌ futuro (slug vazio) |
| 14 Remover 50% OFF | ✅ |
| 15 Sem milhares na metadata | ✅ |
| 16 CTA hero parceiro | ✅ |
| 17 Instrumentação | ✅ parcial (Meta: signup, lead, checkout tutor/parceiro) |
| 18 Novos preços tutor | ✅ UI 29,49/238,80 · ⏳ LastLink ops |
| 19 Features tier lastreadas | ✅ |
| 20 Upsell/header parceiro | ✅ |
| 21 Preço no chip hub | ✅ |
| 22 Eventos paywall/hub | ✅ |
| 23 CTA benefício tutor | ✅ |
