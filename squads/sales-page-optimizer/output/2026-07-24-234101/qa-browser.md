# QA browser local — 2026-07-25

Ambiente: `npm run build && npm run start` → http://localhost:3000

| Página | Resultado | Evidência |
|--------|-----------|-----------|
| `/planos` mensal | ✅ | R$ 29,49 · CTA “Liberar histórico…” · -33% · LastLink trust |
| `/planos` anual | ✅ | R$ 19,90/mês eq · R$ 238,80/ano · economia 115,08 |
| `/parceiros/premium` | ✅ | 39,80 / 69,80 / 129,80 · sem 50% OFF · sem milhares |
| `/parceiros/cadastro` | ✅ | teaser 39,80 + “ver planos” · passo Negócio |
| `/comparar` paywall | ⚠️ não visto nesta sessão | Conta local “Mel” parece Premium (1 pet → “cadastre mais um”) — copy 29,49 está no código |
| Build | ✅ | após exclude `agent/`, `skills/`, `data/skills` no tsconfig |

## LastLink (caixa)

Checkout pages abrem (slugs OK) mas preço não aparece no HTML estático (SPA).  
**Ação humana:** logar na LastLink e editar TUTOR mensal=29,49 e anual=238,80.

Links:
- Mensal: https://lastlink.com/p/C19A63EB1
- Anual: https://lastlink.com/p/CC8626778
