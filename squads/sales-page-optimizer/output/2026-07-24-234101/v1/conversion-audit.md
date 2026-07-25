# Auditoria de Conversão — re-run 2026-07-24

**Agente:** Carla Conversao (📈)  
**Passo:** step-02-conversion-audit  
**Input:** `page-inventory.md` (mesmo run)  
**Run:** `2026-07-24-234101`

---

## 1. Resumo executivo

A fricção **P0 do run anterior** (401 silencioso, 50% OFF, milhares, toggle cosmético, alertas PRO falsos) está **mitigada no código**.  

Funil atual = **higiene comercial boa** + **oportunidades de crescimento**:

```
Antes (23/07): quebras de confiança no clique final
Agora  (24/07): funil limpo; conversão limitada por preço/posicionamento e clareza de tiers B2B
```

| Frente | Status | Onde ainda dói |
|--------|--------|----------------|
| Auth checkout tutor | ✅ | — |
| Claims enganosos | ✅ removidos | Features tier parceiro a validar |
| Hierarquia home | ✅ | — |
| Preço tutor vs desejo comercial | ⏳ | 19,90 vs 29,49 desejado |
| Upsell parceiro pós-cadastro | ⚠️ genérico | Não espelha 4 planos |
| Analytics | ⚠️ parcial | Pixel condicional |

---

## 2. Achados por página (impacto × esforço)

### Home `/`

| Achado | Impacto | Esforço | Tipo |
|--------|---------|---------|------|
| CTAs hierarquizados | — resolvido | — | — |
| Chip Premium sem preço no hub | Médio | Baixo | copy |
| Eventos CTA home | Baixo-médio | Feito (ViewContent) | analytics |

### Cadastro tutor

| Achado | Impacto | Esforço | Tipo |
|--------|---------|---------|------|
| Copy passo 1/2 grátis | — resolvido | — | — |
| Paleta rosa vs marca amber | Baixo | Médio | design |

### Planos tutor

| Achado | Impacto | Esforço | Tipo |
|--------|---------|---------|------|
| Redirect login | — resolvido | — | — |
| Preço 19,90/115 vs meta 29,49/238,80 | Alto (negócio) | Ops+code | **checkpoint** |
| Badge -52% honesto só se mensal=19,90 e anual=115 | Médio | Baixo recalcular se mudar preço | code |
| CTA genérico “Assinar Premium” | Médio | Baixo | copy teste |
| Trust line LastLink | — resolvido | — | — |

### Comparar paywall

| Achado | Impacto | Esforço | Tipo |
|--------|---------|---------|------|
| Preço + bullets | — resolvido | — | — |
| Sem track no CTA | Médio | Baixo | analytics |
| Usa `<a href>` | Baixo | Baixo | code |

### Cadastro parceiro

| Achado | Impacto | Esforço | Tipo |
|--------|---------|---------|------|
| Label Negócio + e-mail defensivo | — resolvido | — | — |
| Header sem teaser free vs pago | Médio | Baixo | copy |
| Form 4 passos longo | Médio | Alto (não neste ciclo) | produto |
| Upsell “Premium” singular | Médio | Baixo | copy |

### Premium parceiro

| Achado | Impacto | Esforço | Tipo |
|--------|---------|---------|------|
| 4 tiers + checkout real por planType | — evoluiu bem | — | — |
| Features Pro/Enterprise vs produto | Alto confiança | Médio | audit produto |
| Sem plano anual (slug vazio) | Correto | — | — |
| Hero com CTA | — resolvido | — | — |

---

## 3. Riscos e dependências

- **LastLink como fonte da verdade** — UI é espelho; sem painel LastLink no repo, só checklist ops.
- **Mudança de preço** sem atualizar badge -52% e copy “a partir de” em 3+ superfícies.
- **Upsell “destaque hoje”** depende de webhook + match de e-mail (`partners`).

---

## 4. Recomendações priorizadas

1. **P0 negócio:** decidir preço tutor (manter 19,90/115 ou subir com LastLink).  
2. **P1 copy B2B:** upsell + header cadastro alinhados a tiers.  
3. **P1 confiança:** checklist feature-by-tier no painel parceiro.  
4. **P2:** CTA benefício tutor + evento paywall.  
5. **P3:** paleta cadastro tutor.

---

## 5. Próximos passos

→ Paula (prova) valida claims restantes.  
→ Valeria monta backlog EXP-19+ sem reabrir o que já está verde.
