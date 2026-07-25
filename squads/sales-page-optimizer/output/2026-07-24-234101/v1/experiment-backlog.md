# Backlog de Experimentos — re-run 2026-07-24

**Agente:** Valeria Validacao (✅)  
**Passo:** step-04-experiment-plan  
**Run:** `2026-07-24-234101`  
**Base:** inventário + auditoria + mapa de prova deste run + memória de EXPs 01–18.

---

## 1. Resumo executivo

```
EXPs 01–17 (onda segura) → em grande parte SHIPPED
EXP-18 (preço tutor)       → AINDA BLOQUEADO (revisão documentada)
Novos EXPs 19–24           → residual de conversão e confiança
```

**Princípio:** não reabrir EXPs verdes sem regressão. Foco em preço ops, clareza B2B e prova de tiers.

---

## 2. Checklist de regressão (ondas anteriores)

| EXP | Status código (24/07) | Ação |
|-----|----------------------|------|
| 01 Auth `/planos` | ✅ login?next | Monitorar |
| 02A Alertas free | ✅ tabela + metadata | Monitorar |
| 03 Hierarquia CTA home | ✅ | Monitorar |
| 04 Glossário free | ✅ | Monitorar |
| 05 Chip hub | ✅ sem preço | Opcional EXP-21 |
| 06 Cadastro tutor copy | ✅ | Monitorar |
| 07 Trust LastLink | ✅ | Monitorar |
| 08 pt-BR | ✅ superfícies | Spot-check |
| 09 Back planos | ✅ | Monitorar |
| 10 Paywall comparar | ✅ preço | + evento EXP-22 |
| 11 Label Negócio | ✅ | + teaser EXP-20 |
| 12 E-mail defensivo | ✅ | Monitorar |
| 13A Toggle cosmético | ✅ removido | Monitorar |
| 13B Anual parceiro | ❌ slug empty | Futuro |
| 14 50% OFF | ✅ ausente | Monitorar |
| 15 Milhares | ✅ ausente | Monitorar |
| 16 Hero CTA parceiro | ✅ | Monitorar |
| 17 Analytics | ✅ parcial Meta | EXP-22 |
| 18 Preços tutor | ❌ bloqueado | Checkpoint |

---

## 3. Riscos

| Item | Se ignorar |
|------|------------|
| EXP-18 sem LastLink | UI e cobrança divergem |
| Features Pro/Enterprise inventadas | Chargeback de confiança B2B |
| Badge -52% após reprice | Matemática falsa |

---

## 4. Novos experimentos

### EXP-18 — Preços tutor (ainda checkpoint)

| Campo | Conteúdo |
|-------|----------|
| **Hipótese** | Alinhar UI e LastLink ao preço comercial desejado (29,49 mensal / 19,90-eq anual) aumenta ARPU sem quebrar confiança. |
| **Variante A (atual)** | 19,90 / 115 |
| **Variante B** | 29,49 / 238,80 (ou total que ops definir) **só** com produtos LastLink |
| **Aceite** | Constantes + metadata + comparar + dashboard + badge economia recalculados; slugs Vercel ok |
| **Checkpoint** | **Sim — bloqueante** |
| **Doc** | `output/2026-07-24-precos-lastlink.md` |

### EXP-19 — Auditoria feature × tier parceiro

| Campo | Conteúdo |
|-------|----------|
| **Hipótese** | Bullets que batem com o app aumentam confiança e reduzem suporte. |
| **Arquivos** | `PremiumClient.tsx`, `app/parceiro/dashboard/**`, webhook destaque |
| **Aceite** | Matriz Basic/Pro/Enterprise com ✅/❌ real; copy ajustada |
| **Checkpoint** | Não (remoção/suavização de claim) |

### EXP-20 — Upsell e header cadastro parceiro

| Campo | Conteúdo |
|-------|----------|
| **Hipótese** | “Listagem grátis · planos a partir de R$ 39,80” + upsell com tiers reduz fricção e alinha expectativa. |
| **Arquivo** | `CadastroClient.tsx` |
| **Aceite** | Header teaser; sucesso não promete feature inexistente; link `/parceiros/premium` |
| **Checkpoint** | Não (preços já públicos) |

### EXP-21 — Preço no chip Premium do hub

| Campo | Conteúdo |
|-------|----------|
| **Hipótese** | “A partir de R$ 19,90” no chip sobe CTR para `/planos`. |
| **Arquivo** | `app/page.tsx` hub |
| **Aceite** | Só se `!isPremium`; preço = PlanosClient |
| **Checkpoint** | Não |

### EXP-22 — Eventos restantes do funil

| Campo | Conteúdo |
|-------|----------|
| **Hipótese** | Sem evento no paywall e em Assinar parceiro já existe; fechar buracos. |
| **Pontos** | `/comparar` CTA; opcional CompleteRegistration já no signup |
| **Aceite** | Clique paywall gera ViewContent/custom; sem PII |
| **Checkpoint** | Não |

### EXP-23 — CTA tutor orientado a benefício

| Campo | Conteúdo |
|-------|----------|
| **Hipótese** | “Liberar histórico e comparar pets” > “Assinar Premium”. |
| **Arquivo** | `PlanosClient.tsx` |
| **Aceite** | Mesmo `handleCheckout`/planType; só label |
| **Checkpoint** | Não |

### EXP-24 — Soften “destaque hoje” se webhook frágil

| Campo | Conteúdo |
|-------|----------|
| **Hipótese** | “Após confirmação do pagamento” reduz promessa quebrada. |
| **Arquivo** | `CadastroClient.tsx` sucesso |
| **Aceite** | Copy condicional à realidade ops |
| **Checkpoint** | Só se mudar SLA material |

---

## 5. Prioridade de implementação

| Ordem | EXP | Pode ship sem checkpoint? |
|-------|-----|---------------------------|
| 1 | 19 + 20 | Sim |
| 2 | 21 + 22 + 23 | Sim |
| 3 | 24 | Sim (se copy mais fraca) |
| 4 | 18 | **Não** — LastLink primeiro |
| 5 | 13B | **Não** — produto anual parceiro |

---

## 6. Próximos passos

Checkpoint humano: (A) preço tutor, (B) liberar onda EXP-19–23, (C) adiar tudo e só monitorar.
