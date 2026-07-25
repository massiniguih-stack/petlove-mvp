# Checkpoint — Sales Page Optimizer (re-run) — APROVADO E IMPLEMENTADO

**Run:** `2026-07-24-234101`  
**Data:** 2026-07-24  
**Step:** step-05-checkpoint  

---

## Decisões do usuário

| Tema | Escolha |
|------|---------|
| EXP-18 preço tutor | **A2** — R$ 29,49/mês · R$ 238,80/ano (~R$ 19,90/mês) |
| Onda residual | **B1** — EXP-19…23 |
| Anual parceiro | **C1** implícito — sem slug, não vender |

## Implementado no código

- EXP-18: constantes e copy de preço tutor  
- EXP-19: features de tiers lastreadas no mapa/webhook  
- EXP-20: teaser + upsell cadastro parceiro  
- EXP-21: chip hub com preço  
- EXP-22: evento paywall `/comparar` + hub  
- EXP-23: CTA benefício em `/planos`  

## Ainda é ação humana (fora do git)

- [ ] Atualizar produtos LastLink para 29,49 e 238,80  
- [ ] Deploy produção só depois disso  

## Artefatos

| Arquivo |
|---------|
| `v1/page-inventory.md` |
| `v1/conversion-audit.md` |
| `v1/messaging-proof-map.md` |
| `v1/experiment-backlog.md` |
| `../2026-07-24-precos-lastlink.md` |
