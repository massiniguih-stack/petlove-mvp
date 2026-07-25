# Inventário de Páginas Comerciais — Patinha (re-run)

**Agente:** Carla Conversao (📈 Conversion Strategist)  
**Passo:** step-01-map-pages  
**Data:** 2026-07-24  
**Run:** `2026-07-24-234101`  
**Contexto:** reauditoria **após** onda EXP 01–17 e revisão de preços (EXP-18 ainda bloqueado).  
**Regra:** fatos de código vs hipóteses; sem inventar métricas ou prova social.

---

## 1. Resumo executivo

```
TUTOR                              PARCEIRO (B2B)
─────                              ──────────────
Home (/)                           Home CTA secundário
  → Cadastro (passo 1/2)             → Cadastro 4 passos (Negócio…)
  → Onboarding pet                   → Sucesso + upsell Premium
  → Hub free + chip Premium          → /parceiros/premium (4 tiers)
  → /planos ou paywall /comparar     → LastLink por planType
  → LastLink tutor_monthly|annual
```

| Jornada | Páginas | Preço no código | Checkout |
|---------|---------|-----------------|----------|
| Tutor | `/`, `/cadastro`, `/planos`, `/comparar` | R$ 19,90/mês · R$ 115/ano | `tutor_monthly` \| `tutor_annual` + auth redirect |
| Parceiro | `/parceiros/cadastro`, `/parceiros/premium` | Grátis · 39,80 · 69,80 · 129,80 /mês | `partner_basic` \| `pro` \| `enterprise` |

**Mudança vs run 2026-07-23:** P0s de confiança (50% OFF, milhares, toggle cosmético, 401 sem redirect, alertas como PRO) **não aparecem mais** no código comercial. O funil está “limpo”; o gap principal restante é **estratégico de preço (EXP-18)** + **medição parcial** + polish de conversão.

---

## 2. Achados por página

### 2.1 `app/page.tsx` — Home

| Campo | Conteúdo |
|-------|----------|
| **Público** | Visitante; logado sem pet; hub com pet |
| **Promessa** | “Cuidados para o seu melhor amigo” + “Grátis para começar · Premium opcional” |
| **CTA** | Primário filled: Começar grátis; secundário outline: Já tenho conta; terciário outline full-width: Sou parceiro. Hub: chip Premium se `!isPremium` |
| **Preço** | Nenhum (só no chip: benefícios, sem valor) |
| **Gargalo residual** | Chip Premium no hub sem preço; Meta `ViewContent` nos CTAs home (depende de pixel ID em prod) |
| **Próximo passo** | Opcional: preço no chip; instrumentação server-side se pixel falhar |

**Fato:** hierarquia EXP-03/04/05 presente.  
**Hipótese:** conversão home→cadastro ok; upsell hub ainda fraco sem preço.

### 2.2 `app/cadastro/page.tsx` — Cadastro tutor

| Campo | Conteúdo |
|-------|----------|
| **Público** | Tutor novo |
| **Promessa** | “Passo 1 de 2 · grátis · sem cartão” |
| **CTA** | SignupForm + Google; Entrar |
| **Preço** | Nenhum |
| **Gargalo residual** | Paleta rosa vs amber da home (marca); sem link a `/planos` (ok no free path) |
| **Próximo passo** | Alinhar paleta (P3) se redesign leve |

### 2.3 `app/planos/page.tsx` + `PlanosClient.tsx`

| Campo | Conteúdo |
|-------|----------|
| **Público** | Deslogado e logado |
| **Promessa** | Premium = pets ilimitados, histórico, comparar; alertas na coluna **free** |
| **CTA** | Assinar Premium / Assinar Premium anual; login `?next=/planos` |
| **Preço** | 19,90 · 115/ano · badge -52% (matemática real vs mensal) |
| **Gargalo residual** | (1) Preço desejado 29,49/19,90-eq **não** aplicado. (2) CTA ainda genérico. (3) Badge -52% é honesto na conta atual, mas se subir mensal sem reajustar anual, distorce. (4) Metadata já sem overclaim de alertas PRO |
| **Próximo passo** | Checkpoint EXP-18; opcional CTA benefício; validar LastLink = UI |

### 2.4 `app/comparar/page.tsx`

| Campo | Conteúdo |
|-------|----------|
| **Público** | Tutor no app |
| **Promessa** | Comparação = Premium; preço a partir de 19,90 + bullets lastreados |
| **CTA** | “Ver planos e assinar →” → `/planos` |
| **Preço** | Sim (19,90) |
| **Gargalo residual** | `<a>` em vez de `Link` (menor); sem evento Meta no clique paywall |
| **Próximo passo** | Evento `paywall_comparar_cta`; manter preço = PlanosClient |

### 2.5 `app/parceiros/cadastro/CadastroClient.tsx`

| Campo | Conteúdo |
|-------|----------|
| **Público** | Negócio pet |
| **Promessa** | Entrar no mapa; labels Negócio/Localização/Contato/Serviços; sucesso com e-mail defensivo + 48h |
| **CTA** | Submit multi-step; upsell “Assinar Premium agora” → `/parceiros/premium` |
| **Preço** | Não no form; upsell sem listar tiers/preço |
| **Gargalo residual** | Upsell diz “Premium” genérico enquanto a página de planos tem **4 tiers**; teaser free vs pago no **topo do form** ainda fraco |
| **Próximo passo** | Microcopy no header: “listagem grátis após análise · destaque pago opcional”; upsell citar “a partir de R$ 39,80” |

### 2.6 `app/parceiros/premium/page.tsx` + `PremiumClient.tsx`

| Campo | Conteúdo |
|-------|----------|
| **Público** | Parceiro comprando destaque |
| **Promessa** | Grátis → Empresarial; selo, prioridade, WhatsApp |
| **CTA** | Hero “Ver planos” + checkout por tier; login `?next=` |
| **Preço** | 0 · 39,80 · 69,80 · 129,80 mensal; sem anual na UI |
| **Gargalo residual** | (1) Upsell pós-cadastro fala “Premium” singular. (2) Features Pro/Enterprise precisam bater com produto real (painel, multi-unidade) — risco de overclaim de **capacidade** se feature não existir. (3) `partner_annual` slug empty — ok não mostrar |
| **Próximo passo** | Auditar features de cada tier vs código do painel parceiro |

---

## 3. Riscos e dependências

| Risco | Evidência | Impacto |
|-------|-----------|---------|
| UI preço ≠ LastLink real | Preços hardcoded; slugs SET mas valores na LastLink não verificáveis no repo | Surpresa no checkout |
| EXP-18 pendente | Checkpoint usuário 29,49 / 19,90-eq | Se ship sem LastLink, quebra confiança |
| Features tier Pro/Enterprise | Copy “painel”, “redes/filiais” | Overclaim se produto não cobre |
| Pixel Meta opcional | Só se `NEXT_PUBLIC_META_PIXEL_ID` | EXP-17 “cego” em ambiente sem pixel |
| Webhook e-mail parceiro | Upsell “destaque hoje” depende de e-mail casar | Promessa pós-pagamento |

---

## 4. Recomendações priorizadas

| # | Ação | Impacto | Esforço |
|---|------|---------|---------|
| 1 | Fechar EXP-18 (LastLink + UI juntos) ou documentar “preço congelado 19,90/115” | Alto | Ops + baixo code |
| 2 | Alinhar upsell cadastro parceiro aos 4 tiers + “a partir de R$ 39,80” | Médio | Baixo |
| 3 | Auditar claims de feature por tier parceiro | Alto confiança | Médio |
| 4 | Eventos Meta no paywall `/comparar` e cliques Assinar (tutor já tem InitiateCheckout) | Médio aprendizado | Baixo |
| 5 | CTA tutor orientado a benefício (teste A/B) | Médio | Baixo |

---

## 5. Próximos passos

1. step-02 auditoria de conversão residual.  
2. step-03 prova/confiança em tiers e preço.  
3. step-04 backlog EXP-19+ (não reabrir EXPs já shipados sem regressão).  
4. Checkpoint só para preço e claims de feature Pro/Enterprise.
