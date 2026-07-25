# Research Focus / User Approval — Sales Page Optimizer

**Squad:** sales-page-optimizer  
**Run ID:** 2026-07-23-091955  
**Date:** 2026-07-23  
**Step:** step-05-checkpoint  
**Language:** pt-BR  

---

## Decisões do usuário

### A) “50% OFF” do parceiro
**Escolha:** Remover 50% OFF e preço riscado (recomendado).  
**Ação:** EXP-14 — só mostrar preço real do plano; sem desconto fictício na UI.

### B) “Milhares de Tutores”
**Escolha:** Remover o claim (recomendado).  
**Ação:** EXP-15 — metadata/copy sem número de base de usuários inventado.

### C) Toggle mensal/anual do parceiro
**Escolha:** Criar plano anual de verdade **depois**.  
**Ação imediata:** EXP-13A — remover toggle cosmético (UI alinhada a `partner_basic`).  
**Ação futura:** EXP-13B — configurar planType/slug anual no LastLink + UI quando existir produto real.

### D) Preços
**Escolha (texto do usuário):** `29,49 mes e anual 19,90`  
**Interpretação registrada (a confirmar na implementação):**

| Plano | Valor interpretado |
|-------|--------------------|
| Tutor **mensal** | **R$ 29,49**/mês |
| Tutor **anual** | **R$ 19,90**/mês equivalente → cobrança anual **R$ 238,80** (19,90 × 12), **salvo** se o usuário quiser outro total |

**Nota:** hoje o código/copy usam R$ 19,90/mês e R$ 115/ano. Mudança de preço = EXP-18 e exige atualizar LastLink + UI + qualquer string de preço. **Não implementar** até validar slugs LastLink e confirmar se “anual 19,90” é mensal-equivalente ou valor total.

---

## Autorizado a implementar sem mais checkpoint

- EXP-01 — redirect login em `/planos` deslogado  
- EXP-02A — honestidade de alertas vacina (copy / reclassificar PRO)  
- EXP-13A — remover toggle anual cosmético parceiro  
- EXP-14 — remover 50% OFF e preço riscado  
- EXP-15 — remover “Milhares de Tutores”  
- EXP-03 a EXP-12, EXP-16 — quick wins de copy/hierarquia  
- EXP-17 — instrumentação de eventos (quando priorizar)

## Bloqueado / futuro

- EXP-13B — planType anual parceiro real (depois + LastLink)  
- EXP-18 — mudança de preços tutor para 29,49 / 19,90 (equivalente) — **só após confirmação de cobrança anual total e slugs LastLink**

---

## Risco de não implementar o autorizado

- Checkout tutor deslogado continua falhando em silêncio (401).  
- Claims 50% OFF / milhares continuam gerando desconfiança.  
- Toggle parceiro continua prometendo anual que o payload não envia.

---

## Artefatos do run

| Arquivo | Conteúdo |
|---------|----------|
| `v1/page-inventory.md` | Inventário de páginas |
| `v1/conversion-audit.md` | Auditoria de conversão |
| `v1/messaging-proof-map.md` | Prova e confiança |
| `v1/experiment-backlog.md` | Backlog EXP-01…18 |
| `user-approval.md` | Este arquivo |

---

## Próximo passo sugerido

1. Confirmar interpretação de preço: mensal **R$ 29,49** e anual **R$ 19,90/mês** (total **R$ 238,80**)?  
2. Shipar wave segura (EXP-01, 02A, 13A, 14, 15 + quick wins).  
3. Agendar EXP-13B + EXP-18 com LastLink.
