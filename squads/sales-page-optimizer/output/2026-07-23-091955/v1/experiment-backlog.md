# Backlog de Experimentos — Patinha (Sales Page Optimizer)

**Agente:** Valeria Validacao (✅ QA and Experiment Validator)  
**Passo:** step-04-experiment-plan  
**Data:** 2026-07-23  
**Run:** `2026-07-23-091955/v1`  
**Inputs:** `messaging-proof-map.md`, `conversion-audit.md`, `page-inventory.md`, `squad.yaml`  
**Regra:** experimentos pequenos e reversíveis; sem inventar features, métricas ou prova social; preço / planType / % OFF / claims numéricos → **checkpoint**.

---

## 1. Resumo executivo

O funil comercial tem dois corredores (tutor B2C e parceiro B2B). Os achados dos steps 01–03 convergem em **três frentes de perda**:

```
1. Quebra no clique final     → auth 401 em /planos; toggle anual parceiro cosmético
2. Overclaim / desconfiança   → 50% OFF fictício; milhares; alertas PRO sem gate
3. Hierarquia e microcopy     → CTAs iguais; paywall sem preço; glossário free vs pago
```

| Frente | Ação neste backlog | Checkpoint? |
|--------|--------------------|-------------|
| Auth + checkout UX | Redirect login tutor; honestidade UI↔payload parceiro | Só se criar planType anual |
| Confiança comercial | Remover/reescrever overclaims; reclassificar alertas | Sim: 50% OFF, milhares, preço, planType |
| Conversão local (copy/UI) | Hierarquia CTAs, paywall com preço, trust lines, typos | Não (quick wins) |

**Princípio de experimento:** preferir ship/fix com proxy de evento (clique CTA, redirect login, erro 401) até haver analytics. Sem inventar baseline de conversão.

**Preservar sem mexer (salvo checkpoint):**

- Fluxo `POST /api/lastlink/checkout` e slugs LastLink
- `planType` tutor `tutor_monthly` | `tutor_annual` (já corretos)
- Preços R$ 19,90 / R$ 115 / R$ 39,80 até ok humano
- Paywall `/comparar` sem preview fake
- Upsell Premium só no **sucesso** do cadastro parceiro
- Um plano real parceiro (não restaurar 3 tiers)

---

## 2. Achados por página → mapa de experimentos

### 2.1 Home — `/` (`app/page.tsx`)

| Achado | Experimento(s) | Prioridade |
|--------|----------------|------------|
| CTAs tutor e parceiro com mesmo peso visual | EXP-03 | P1 |
| Tagline “premium” confunde free vs pago | EXP-04 | P1 |
| Hub com pet sem upsell se `!isPremium` | EXP-05 | P2 |
| Sem link a `/planos` em nenhum estado | coberto por EXP-05 | — |

### 2.2 Cadastro tutor — `/cadastro` (`app/cadastro/page.tsx`)

| Achado | Experimento(s) | Prioridade |
|--------|----------------|------------|
| H1 genérico; não reforça grátis / passo 1 | EXP-06 | P2 |
| Paleta rosa vs amber (marca) | EXP-06 (só copy neste ciclo; visual opcional) | P3 |

### 2.3 Planos tutor — `/planos` (`PlanosClient.tsx` + page)

| Achado | Experimento(s) | Prioridade |
|--------|----------------|------------|
| Deslogado: 401 sem redirect login | EXP-01 | **P0** |
| Alertas listados PRO sem gate no cron | EXP-02 | **P0** confiança |
| Sem trust line LastLink / como cancelar | EXP-07 | P1 |
| Acentos faltando; CTA genérico | EXP-08 | P2 |
| BackButton sempre `/dashboard` | EXP-09 | P3 |

### 2.4 Paywall comparar — `/comparar`

| Achado | Experimento(s) | Prioridade |
|--------|----------------|------------|
| Card sem preço | EXP-10 | P1 |
| Só benefício comparação; sem 1–2 PRO lastreados | EXP-10 | P1 |
| CTA “Ver Planos” fraco em valor | EXP-10 | P1 |

### 2.5 Cadastro parceiro — `/parceiros/cadastro`

| Achado | Experimento(s) | Prioridade |
|--------|----------------|------------|
| Label progresso “Negociação” | EXP-11 | P1 |
| Sem teaser free listing vs Premium | EXP-11 | P2 |
| SLA 48h / e-mail condicional | EXP-12 (copy defensiva) | P2 |

### 2.6 Parceiro Premium — `/parceiros/premium`

| Achado | Experimento(s) | Prioridade |
|--------|----------------|------------|
| Toggle anual cosmético (`partner_basic` sempre) | EXP-13 | **P0** |
| “50% OFF” + preço 2× inventado | EXP-14 | **P0** checkpoint |
| Metadata “Milhares de Tutores” / “planos” plural | EXP-15 | **P0** checkpoint |
| Hero sem CTA de compra | EXP-16 | P1 |
| Typo “atraira” | EXP-08 | P2 |
| -20% anual inconsistente com matemática | coberto por EXP-13/14 | — |

### 2.7 Analytics (transversal)

| Achado | Experimento(s) | Prioridade |
|--------|----------------|------------|
| Sem instrumentação de funil comercial | EXP-17 | P1 (habilita medição) |

---

## 3. Riscos e dependências

| Tipo | Item | Impacto se ignorado | Bloqueia |
|------|------|---------------------|----------|
| **Risco conversão** | Tutor checkout 401 | Clique final morre | EXP-01 |
| **Risco conversão + confiança** | Toggle anual parceiro ≠ payload | Cobrança percebida errada | EXP-13 |
| **Risco confiança / comercial** | 50% OFF sem lastro | Desconfiança e risco de comunicação enganosa | EXP-14 + **checkpoint** |
| **Risco confiança / SEO** | “Milhares de Tutores” | Overclaim público | EXP-15 + **checkpoint** |
| **Risco produto** | Alertas PRO sem gate | Tabela de planos desmentida pelo app | EXP-02 |
| **Dependência env** | `LASTLINK_*_SLUG` vazios → 500 | Checkout quebrado em prod | Validação ops (fora EXP) |
| **Dependência ops** | Resend + domínio + SLA 48h parceiro | Promessa pós-cadastro falha | EXP-12 (mitiga copy) |
| **Dependência webhook** | Premium parceiro só se e-mail casar com `partners` | “Destaque hoje” pode falhar | Nota em EXP-11/16; não inventar fix de produto no funil |
| **Checkpoint** | Preço, planType, % OFF, claim numérico, planType anual parceiro | Veto squad | EXP-13B, 14, 15, 18 |
| **Fora de escopo** | Depoimentos, cases, contador inventado, 3 tiers B2B, métricas de painel parceiro | — | Não criar EXP |

**Gate de implementação:**

| Pode ir sem checkpoint humano | Precisa checkpoint antes de ship |
|-------------------------------|----------------------------------|
| Auth redirect, hierarquia CTA, typos, labels, trust LastLink, glossário free, paywall preço (valores **já** no código), reclassificar alertas como free (opção A), remover toggle anual (opção A), metadata sem número | Manter/recalcular 50% OFF; criar planType anual + slug; publicar número de tutores; mudar R$ 19,90/115/39,80/238,80; gatear alertas como exclusivo PRO (opção B = produto) |

---

## 4. Recomendações priorizadas — backlog de experimentos

### Legenda

| Campo | Significado |
|-------|-------------|
| **Impacto** | Alto / Médio / Baixo (hipótese de conversão ou confiança) |
| **Esforço** | Baixo (~horas) / Médio (meio dia+) / Alto (evitar neste ciclo) |
| **Métrica** | Preferir evento real; se ausente, proxy + nota “instrumentar” |
| **Tipo** | `copy` · `code` · `analytics` · `checkpoint-required` |

---

### EXP-01 — Auth redirect no checkout tutor

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-01 |
| **Hipótese** | Se o visitante deslogado for levado a login com retorno a `/planos` (em vez de ver “Unauthorized”), a taxa de conclusão do checkout tutor sobe e a percepção de produto quebrado some. |
| **Página/arquivo** | `app/planos/PlanosClient.tsx` (espelhar padrão de `PremiumClient.tsx`); **não** alterar contrato de `/api/lastlink/checkout` |
| **Variante A (atual)** | Clique “Assinar Premium” → POST → 401 → erro genérico na UI |
| **Variante B (proposta)** | Sem sessão (ou 401): `router.push('/login?next=/planos')`; com sessão: fluxo LastLink inalterado (`tutor_monthly` \| `tutor_annual`) |
| **Impacto / Esforço** | Alto / Baixo |
| **Métrica** | Proxy: contagem de cliques “Assinar” deslogados que chegam a `/login?next=/planos` vs erros 401 visíveis. Ideal: evento `checkout_tutor_auth_redirect`. **Instrumentação necessária** (EXP-17). |
| **Critério de aceite** | (1) Deslogado clica Assinar → landing em login com `next=/planos`. (2) Após login, retorna a `/planos` sem mensagem Unauthorized. (3) Logado continua a abrir URL LastLink. (4) `planType` e preços **inalterados**. |
| **Tipo** | `code` |
| **Risco de regressão** | Baixo se só UX de pré-check/401; reverter = remover guard. |
| **Checkpoint** | Não |

---

### EXP-02 — Honestidade dos “Alertas de vacinas e consultas”

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-02 |
| **Hipótese** | Se a tabela de planos refletir o produto real (cron **não** filtra Premium), a confiança sobe e evita churn por “paguei por algo grátis” ou free se sentindo enganado. |
| **Página/arquivo** | `app/planos/PlanosClient.tsx` (tabela features); eventualmente CTA dashboard que repete “alertas… por R$ 19,90” |
| **Variante A (atual)** | Alertas listados como exclusivo Premium; cron `vaccine-reminders` envia a qualquer tutor com vacina pendente |
| **Variante B-A (copy — preferida neste ciclo)** | Mover alertas para coluna free (ou “incluído no grátis”); Premium enfatiza pets ilimitados, histórico >7 dias, comparar, dias anteriores refeição/atividade |
| **Variante B-B (produto — checkpoint/produto)** | Gatear cron/push/e-mail por assinatura tutor ativa e **manter** claim PRO |
| **Impacto / Esforço** | Alto confiança / Baixo (B-A) · Médio (B-B) |
| **Métrica** | Proxy confiança: tickets/reclamações “não recebi alerta” vs “isso é grátis?”. Sem analytics de claim hoje. |
| **Critério de aceite** | (B-A) Nenhuma superfície comercial de venda afirma alertas como exclusivo PRO; lista bate com cron. (B-B) Cron + UI só enviam/prometem alertas a Premium; testes defensivos no gate. |
| **Tipo** | `copy` (B-A) · `code` + produto (B-B) |
| **Recomendação Valeria** | **Ship B-A agora** (reversível). B-B só se produto priorizar exclusividade. |
| **Checkpoint** | B-B sim (mudança de comportamento de notificação). B-A não. |

---

### EXP-03 — Hierarquia de CTAs na home

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-03 |
| **Hipótese** | Um único CTA visual dominante para tutor (“Começar grátis”) aumenta cliques na jornada principal e reduz clique acidental em parceiro. |
| **Página/arquivo** | `app/page.tsx` (estados visitante e sem pet) |
| **Variante A** | Dois botões filled amber (tutor + parceiro) com peso igual |
| **Variante B** | Tutor: filled (primário). Parceiro: outline/secundário (“Sou parceiro pet”). Rotas **iguais**. |
| **Impacto / Esforço** | Médio / Baixo |
| **Métrica** | Proxy: ratio cliques `/cadastro` vs `/parceiros/cadastro` a partir da home. Eventos `cta_home_tutor` / `cta_home_parceiro` se instrumentar. |
| **Critério de aceite** | Um primário visual óbvio para tutor; parceiro acessível mas secundário; nenhuma rota nova; free flow intacto. |
| **Tipo** | `code` + `copy` (label se precisar) |
| **Checkpoint** | Não |

---

### EXP-04 — Glossário free vs Premium (home)

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-04 |
| **Hipótese** | Microcopy que separa “grátis para começar” de “Premium opcional” reduz abandono por achar que o app é só pago. |
| **Página/arquivo** | `app/page.tsx` (hero visitante) |
| **Variante A** | “Cuidados premium para seu melhor amigo” sem explicar plano |
| **Variante B** | Manter tom acolhedor; ex.: lead “Grátis para começar · Premium opcional” e/ou tagline sem parecer plano pago (“Cuidados especiais…” / “Tudo que seu pet precisa…”) — **sem** inventar features |
| **Impacto / Esforço** | Médio / Baixo |
| **Métrica** | Proxy: cliques “Começar grátis” / sessões home. |
| **Critério de aceite** | Visitante entende que não precisa cartão para começar; não promete número de usuários; não muda preço. |
| **Tipo** | `copy` |
| **Checkpoint** | Não (desde que não use “milhares” ou % OFF) |

---

### EXP-05 — Chip/banner Premium no hub (logado com pet)

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-05 |
| **Hipótese** | Tutor free em uso ativo, ao ver 1–2 benefícios **já gateados**, clica em `/planos` sem bloquear o uso free. |
| **Página/arquivo** | `app/page.tsx` (estado `pet` + `!isPremium` via store) |
| **Variante A** | Só cards de produto; “Comparar pets” é gancho indireto |
| **Variante B** | Chip/banner discreto: benefícios lastreados apenas — ex. “Comparar pets · Histórico além de 7 dias · Pets ilimitados” → `/planos`. **Não** listar alertas exclusivos até EXP-02. |
| **Impacto / Esforço** | Médio / Baixo |
| **Métrica** | Cliques no chip → `/planos`; proxy `upsell_hub_click`. |
| **Critério de aceite** | Visível só se `!isPremium`; não bloqueia cards free; claims = features com gate real (message-proof). |
| **Tipo** | `code` + `copy` |
| **Checkpoint** | Não |

---

### EXP-06 — Copy do cadastro tutor alinhada ao funil

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-06 |
| **Hipótese** | “Passo 1 de 2 · grátis · sem cartão” reduz incerteza de esforço e medo de cobrança no signup. |
| **Página/arquivo** | `app/cadastro/page.tsx` |
| **Variante A** | “Crie sua conta e comece a cuidar” |
| **Variante B** | H1/sub: passo 1 de 2, grátis, o que vem depois (cadastrar pet); form Google+email intacto |
| **Impacto / Esforço** | Médio / Baixo |
| **Métrica** | Taxa signup (se existir) ou proxy submit form / Google click. |
| **Critério de aceite** | Copy alinhada à home; sem menção a preço Premium obrigatório; formulário e rotas intactos. |
| **Tipo** | `copy` |
| **Checkpoint** | Não |

---

### EXP-07 — Trust line LastLink + cancelamento em `/planos`

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-07 |
| **Hipótese** | Explicitar processador e **onde** cancelar reduz objeção de risco no clique de assinar. |
| **Página/arquivo** | `app/planos/PlanosClient.tsx` (sob CTA e/ou FAQ) |
| **Variante A** | FAQ genérico; sem “LastLink” no card de compra (parceiro já tem trust line) |
| **Variante B** | Linha: “Pagamento processado pela LastLink · cancele quando quiser na área de membros / Gerenciar assinatura”. FAQ aponta fluxo real (member URL / `/conta/assinatura`), sem prometer multa zero se LastLink tiver regras próprias — tom: “sem multa no Patinha”. |
| **Impacto / Esforço** | Médio / Baixo |
| **Métrica** | Proxy: cliques Assinar pós-leitura (difícil sem heatmaps); aceitar como higiene de confiança + FAQ. |
| **Critério de aceite** | Texto só descreve processo existente; não inventa garantia de reembolso; não muda checkout. |
| **Tipo** | `copy` |
| **Checkpoint** | Não |

---

### EXP-08 — Higiene pt-BR (acentos e typos)

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-08 |
| **Hipótese** | Textos corretos em pt-BR elevam profissionalismo e confiança sem mudar oferta. |
| **Página/arquivo** | `PlanosClient.tsx` (“voce”, “basico”, “Historico”, “Comparacao”, “Nao ha”…); `PremiumClient.tsx` (“atraira” → “atrairá”) |
| **Variante A** | Strings sem acento / typo |
| **Variante B** | pt-BR correto; **mesmo** significado |
| **Impacto / Esforço** | Baixo / Baixo |
| **Métrica** | N/A (higiene). Checklist visual. |
| **Critério de aceite** | Zero typos listados no audit nas strings comerciais tocadas; sem alteração de preço/claim. |
| **Tipo** | `copy` |
| **Checkpoint** | Não |

---

### EXP-09 — BackButton contextual em `/planos`

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-09 |
| **Hipótese** | Visitante de SEO/deslogado não cai em dashboard vazio ao “voltar”. |
| **Página/arquivo** | `app/planos/PlanosClient.tsx` (ou componente BackButton usado) |
| **Variante A** | `href="/dashboard"` sempre |
| **Variante B** | Logado → dashboard; deslogado → `/` ou histórico |
| **Impacto / Esforço** | Baixo / Baixo |
| **Métrica** | Proxy: bounce pós-voltar (se analytics). |
| **Critério de aceite** | Deslogado não é mandado a dashboard autenticado; logado mantém atalho app. |
| **Tipo** | `code` |
| **Checkpoint** | Não |

---

### EXP-10 — Paywall `/comparar` com preço e bullets lastreados

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-10 |
| **Hipótese** | Mostrar “a partir de R$ 19,90/mês” + 1–2 benefícios com gate real aumenta intenção de ir a `/planos` e reduz hop “cego”. |
| **Página/arquivo** | `app/comparar/page.tsx` |
| **Variante A** | Card: recurso Premium + “Ver Planos →”; sem preço |
| **Variante B** | Preço a partir de R$ 19,90/mês (constante alinhada a PlanosClient); bullets **só** lastreados: comparar pets, pets ilimitados, histórico >7 dias (e/ou ver dias anteriores). CTA pode virar “Ver planos e assinar” mantendo destino `/planos`. **Não** incluir alertas exclusivos até EXP-02. Preferir `Link` Next se já for padrão do app (sem mudar destino). |
| **Impacto / Esforço** | Médio / Baixo |
| **Métrica** | Cliques CTA paywall → `/planos`; proxy `paywall_comparar_cta`. |
| **Critério de aceite** | Preço = o já usado em `/planos` (sem novo valor); sem preview fake de gráficos; gate `!isPremium` intacto. |
| **Tipo** | `copy` (+ `code` mínimo de markup) |
| **Checkpoint** | Não (preço já público no produto) |

---

### EXP-11 — Cadastro parceiro: label + teaser free vs Premium

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-11 |
| **Hipótese** | Label “Negócio” remove confusão de barganha; teaser “listagem gratuita após análise · destaque pago opcional” alinha expectativa sem bloquear o form. |
| **Página/arquivo** | `app/parceiros/cadastro/CadastroClient.tsx` |
| **Variante A** | Passo 1 progresso = “Negociação”; header sem teaser Premium |
| **Variante B** | “Negócio”; link discreto `/parceiros/premium`; microcopy free vs destaque; **não** enxugar campos neste EXP (separar se quiser depois) |
| **Impacto / Esforço** | Médio / Baixo |
| **Métrica** | Completions de passo 1→2 (se instrumentar); qualitativo: menos confusão. |
| **Critério de aceite** | Label correta; upsell pós-sucesso **preservado**; form e `POST /api/parceiros/cadastro` intactos. |
| **Tipo** | `copy` + `code` leve |
| **Checkpoint** | Não |

---

### EXP-12 — Copy defensiva e-mail / SLA 48h (parceiro)

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-12 |
| **Hipótese** | Se o backend pode falhar no Resend, a UI não deve prometer envio absoluto — reduz quebra de confiança. |
| **Página/arquivo** | `CadastroClient.tsx` (estado sucesso) + alinhar tom com API se necessário |
| **Variante A** | “Enviamos um e-mail…” categórico + 48h |
| **Variante B** | “Você deve receber um e-mail de confirmação (verifique o spam). Analisamos em até 48 horas” **somente se** ops confirma SLA; senão “assim que possível”. Se API retornar falha de e-mail no futuro, não afirmar envio — **sem inventar endpoint** neste EXP. |
| **Impacto / Esforço** | Médio confiança / Baixo |
| **Métrica** | Reclamações “não recebi e-mail”; taxa Resend (ops). |
| **Critério de aceite** | Copy condicional à realidade operacional documentada; não inventa automação de SLA. |
| **Tipo** | `copy` |
| **Checkpoint** | Só se mudar SLA público de forma material (ex. prometer &lt;2h). Manter 48h = ok se time cumpre. |

---

### EXP-13 — Alinhar período parceiro UI ↔ checkout

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-13 |
| **Hipótese** | Se a UI só mostra o que o LastLink cobra de fato, cai desconfiança e risco de “paguei anual e cobrou mensal” (ou o inverso). |
| **Página/arquivo** | `app/parceiros/premium/PremiumClient.tsx`; eventual `lib/lastlink.ts` **só** com checkpoint |
| **Variante A** | Toggle mensal/anual muda preços na tela; body sempre `{ planType: 'partner_basic' }` |
| **Variante B-A (segura, preferida sem produto anual)** | Remover toggle, badge -20% anual, textos “cobrado anualmente” e economia baseada em preço 2×; UI = um preço mensal R$ 39,80 alinhado a `partner_basic` |
| **Variante B-B (checkpoint)** | Criar planType anual real + slug env LastLink + payload condicional a `periodo` |
| **Impacto / Esforço** | Alto / Baixo (B-A) · Médio (B-B) |
| **Métrica** | Zero divergência UI↔payload em QA; reclamações de cobrança; eventos checkout. |
| **Critério de aceite** | (B-A) Nenhuma menção a plano anual na página. (B-B) Mensal e anual geram planTypes distintos e URLs LastLink corretas; env documentado. |
| **Tipo** | `code` + `copy` (B-A) · `checkpoint-required` (B-B) |
| **Recomendação Valeria** | **Ship B-A** até existir produto anual no LastLink. |
| **Checkpoint** | B-B sim. B-A não (é **remoção** de claim enganoso). |

---

### EXP-14 — “50% OFF” e preço riscado 2× (parceiro)

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-14 |
| **Hipótese** | Remover desconto sem âncora real no LastLink protege marca e evita comunicação enganosa; se houver campanha real, lastro deve ser documentado. |
| **Página/arquivo** | `PremiumClient.tsx` (badge, preço riscado, “desconto aplicado automaticamente”); alinhar templates admin convite WA **depois** da decisão (consistência de marca) |
| **Variante A** | Badge 50% OFF; cheio = `mensal * 2`; economia anual em cima do fictício |
| **Variante B-1 (default se sem política)** | Remover badge, risco e “desconto automático”; mostrar só preço vigente R$ 39,80 |
| **Variante B-2 (checkpoint)** | Manter % com política comercial escrita + preço âncora real no LastLink + matemática revisada |
| **Impacto / Esforço** | Alto confiança / Baixo |
| **Métrica** | N/A conversão imediata; risco legal/marca. QA: zero % OFF sem lastro. |
| **Critério de aceite** | Decisão humana registrada no checkpoint do squad. UI reflete decisão. Sem inventar cupom. |
| **Tipo** | `checkpoint-required` (+ `copy`/`code` na implementação) |
| **Checkpoint** | **Sim — bloqueante** |

---

### EXP-15 — Metadata “Milhares de Tutores” e plural “planos”

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-15 |
| **Hipótese** | SEO/social sem claim numérico inventado evita overclaim e desalinhamento com o tamanho real do MVP. |
| **Página/arquivo** | `app/parceiros/premium/page.tsx` (metadata/OG); revisar outbound admin se copiar a frase |
| **Variante A** | “Milhares de Tutores”; “Planos a partir de…” |
| **Variante B** | Sem número (ex. “Tutores na sua região” / “Rede Patinha”); “Plano a partir de R$ 39,80” se preço mantido |
| **Impacto / Esforço** | Alto confiança / Baixo |
| **Métrica** | Não otimizar para impressão SEO inventada; checklist claim. |
| **Critério de aceite** | Metadata sem contagem sem instrumentação pública; singular se um plano. |
| **Tipo** | `checkpoint-required` se quiser **publicar número real**; remoção sem número = ship seguro (`copy`) |
| **Recomendação Valeria** | Remover número **agora** (seguro). Número futuro só com definição + fonte admin + ok humano. |
| **Checkpoint** | Sim para **qualquer** número público. Não para remoção. |

---

### EXP-16 — CTA de compra no hero parceiro Premium

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-16 |
| **Hipótese** | CTA no hero (“Assinar e aparecer no topo” → `#planos` ou checkout se logado) reduz fricção de scroll e alinha intenção de compra. |
| **Página/arquivo** | `PremiumClient.tsx` hero |
| **Variante A** | Só “Conhecer Benefícios” → `#beneficios` |
| **Variante B** | Primário: âncora `#planos` ou “Assinar…”; secundário: benefícios. Microcopy de benefícios = selo + topo da lista + WhatsApp (**lastreados**). Evitar “garantido #1 absoluto”. |
| **Impacto / Esforço** | Médio / Baixo |
| **Métrica** | Scroll-to-planos / cliques Assinar; proxy `hero_premium_cta`. |
| **Critério de aceite** | Hero tem caminho de compra; `handleCheckout` e planType preservados (pós EXP-13); login `?next=` intacto. |
| **Tipo** | `code` + `copy` |
| **Checkpoint** | Não (se não mudar preço/%) |

---

### EXP-17 — Instrumentação mínima do funil comercial

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-17 |
| **Hipótese** | Sem eventos, os EXPs 01–16 não têm métrica real — só proxy qualitativo. |
| **Página/arquivo** | Pontos: home CTAs, cadastro submit, `/planos` Assinar, redirect auth, `/comparar` paywall CTA, parceiro Assinar, sucesso cadastro parceiro. Stack: o que o projeto já tiver (ou logging server mínimo) — **não inventar** dashboard de BI. |
| **Variante A** | Zero eventos de funil comercial |
| **Variante B** | 6–10 eventos nomeados + propriedade `planType` quando checkout |
| **Impacto / Esforço** | Alto para aprendizado / Médio |
| **Métrica** | É a métrica dos demais. |
| **Critério de aceite** | Cada EXP P0/P1 tem ao menos um evento ou proxy documentado; sem PII sensível nos logs. |
| **Tipo** | `analytics` |
| **Checkpoint** | Não (instrumentar ≠ mudar oferta) |

---

### EXP-18 — (Opcional, checkpoint) Preços e planTypes

| Campo | Conteúdo |
|-------|----------|
| **ID** | EXP-18 |
| **Hipótese** | Qualquer mudança de preço ou novo planType só após ok de negócio + LastLink. |
| **Página/arquivo** | Constantes em PlanosClient / PremiumClient; `lib/lastlink.ts`; env |
| **Variante A** | Preços atuais e planTypes atuais |
| **Variante B** | TBD só com checkpoint (não propor valores novos neste backlog) |
| **Impacto / Esforço** | — / — |
| **Métrica** | Receita / conversão — só com analytics |
| **Critério de aceite** | Documentação de decisão + slugs LastLink + UI sincronizada |
| **Tipo** | `checkpoint-required` |
| **Checkpoint** | **Sim — sempre** |

---

### Matriz priorização impacto × esforço

```
        IMPACTO
        Baixo              Médio                    Alto
ESFORÇO
Baixo   | EXP-08 typos     | EXP-03 CTAs home       | EXP-01 auth /planos
        | EXP-09 back      | EXP-04 glossário       | EXP-02 alertas (copy A)
        |                  | EXP-05 chip hub        | EXP-13A remover toggle anual
        |                  | EXP-06 cadastro copy   | EXP-14 remoção 50% OFF*
        |                  | EXP-07 trust LastLink  | EXP-15 remoção milhares*
        |                  | EXP-10 paywall preço   |
        |                  | EXP-11 label+teaser    |
        |                  | EXP-12 SLA copy        |
        |                  | EXP-16 hero CTA        |
────────|──────────────────|────────────────────────|────────────────────────
Médio   |                  | EXP-17 analytics       | EXP-02B gate alertas**
        |                  |                        | EXP-13B planType anual**
────────|──────────────────|────────────────────────|────────────────────────
Alto    |                  |                        | (evitar) 3 tiers B2B
                                        * implementação UI sem %/número = sem checkpoint
                                        ** exige checkpoint / produto
```

### Ordem sugerida de execução (wave)

| Wave | IDs | Motivo |
|------|-----|--------|
| **W0 — Checkpoint humano** | EXP-14, EXP-15 (decisão), EXP-13B?, EXP-18? | Não shipar desconto/número/planType sem ok |
| **W1 — P0 ship seguro** | EXP-01, EXP-02A, EXP-13A, EXP-15 remoção, EXP-14 remoção (se ok ou default seguro) | Converte + honestidade |
| **W2 — Quick wins conversão/confiança** | EXP-03, EXP-04, EXP-07, EXP-10, EXP-11, EXP-16, EXP-08 | Baixo risco |
| **W3 — Upsell e funil** | EXP-05, EXP-06, EXP-09, EXP-12 | Refino |
| **W4 — Medição e produto** | EXP-17, EXP-02B se priorizado | Aprender / exclusividade real |

---

## 5. Próximos passos

### 5.1 Vai para **checkpoint humano** (não implementar oferta sem ok)

Apresentar no `user-approval` / checkpoint do pipeline:

| # | Decisão | Opções honestas | Default Valeria |
|---|---------|-----------------|-----------------|
| 1 | **50% OFF** parceiro | Manter com lastro LastLink · recalcular · **remover** | Remover |
| 2 | **Toggle anual** parceiro | Remover UI anual · criar planType+slug anual | Remover UI até produto existir |
| 3 | **“Milhares de Tutores”** | Remover · publicar número com fonte | Remover |
| 4 | **Alertas** | Copy free (A) · gate Premium (B) | Copy A agora |
| 5 | Preços R$ 19,90 / 115 / 39,80 / 238,80 | Manter · mudar (EXP-18) | Manter |

### 5.2 Pode implementar **com segurança** após aprovação geral do backlog (sem mudar preço/planType)

| ID | Resumo | Tipo |
|----|--------|------|
| EXP-01 | Redirect login `?next=/planos` | code |
| EXP-02A | Alertas fora da exclusividade PRO | copy |
| EXP-03 | Hierarquia CTAs home | code |
| EXP-04 | Glossário free/Premium home | copy |
| EXP-05 | Chip Premium no hub | code+copy |
| EXP-06 | Copy cadastro tutor | copy |
| EXP-07 | Trust LastLink em planos | copy |
| EXP-08 | Acentos/typos | copy |
| EXP-09 | BackButton contextual | code |
| EXP-10 | Paywall comparar + preço | copy |
| EXP-11 | Label Negócio + teaser | copy |
| EXP-12 | Copy e-mail/SLA defensiva | copy |
| EXP-13A | Remover toggle anual cosmético | code+copy |
| EXP-15 remoção | Metadata sem “milhares” | copy |
| EXP-16 | Hero CTA parceiro | code+copy |
| EXP-14 remoção | Se checkpoint escolher remover 50% OFF | copy+code |

### 5.3 Explicitamente **não** fazer neste ciclo

- Inventar depoimentos, cases, contador de tutores, “garantia de clientes”
- Restaurar tiers Básico/Pro/Empresarial parceiro
- Alterar contrato LastLink além de UX de auth no cliente
- Prometer painel de métricas parceiro
- Preview fake de gráficos no paywall `/comparar`
- Mudar `planType` tutor (já corretos)

### 5.4 Dependências ops (paralelo, não são EXP de copy)

- [ ] Confirmar `LASTLINK_*_SLUG` em produção
- [ ] Confirmar Resend domínio (não só `onboarding@resend.dev`)
- [ ] Confirmar taxa de match e-mail webhook → `partners` no upsell “destaque hoje”
- [ ] Confirmar se SLA 48h é cumprido pela operação

### 5.5 Entrega ao próximo passo do pipeline

1. Checkpoint com Guilherme (decisões §5.1).  
2. Implementação W1 → W2 (PR pequenos e reversíveis).  
3. EXP-17 o quanto antes para medir W1/W2.  
4. Atualizar `squads/sales-page-optimizer/_memory/memories.md` após o run com decisões do checkpoint.

---

## Apêndice A — Checklist de aceite global (antes de merge de qualquer EXP)

| Check | Obrigatório |
|-------|-------------|
| Nenhuma feature inventada | ✅ |
| Nenhum depoimento/métrica inventada | ✅ |
| LastLink checkout preservado | ✅ |
| planTypes existentes preservados salvo checkpoint | ✅ |
| Preços inalterados salvo checkpoint | ✅ |
| Claims de `/planos` e premium batem com gates (message-proof) | ✅ |
| Experimento reversível (git revert / flag simples) | ✅ |
| pt-BR nas strings tocadas | ✅ |

---

## Apêndice B — Mapa ID → severidade origem

| ID | Origem principal (step) | Severidade origem |
|----|-------------------------|-------------------|
| EXP-01 | Audit #1, Inventory #1 | P0 conversão |
| EXP-02 | Message-proof #1 | P0 confiança |
| EXP-03 | Audit #3, Inventory home | P1 |
| EXP-04 | Message-proof home | P1 |
| EXP-05 | Audit hub, Inventory #9 | P2 |
| EXP-06 | Audit cadastro | P2 |
| EXP-07 | Message-proof planos | P1 |
| EXP-08 | Audit copy | P3 higiene |
| EXP-09 | Audit back button | P3 |
| EXP-10 | Audit/Inventory comparar | P1 |
| EXP-11 | Audit cadastro B2B | P1 |
| EXP-12 | Message-proof e-mail/SLA | P2 |
| EXP-13 | Audit #2 toggle | P0 |
| EXP-14 | Message-proof 50% OFF | P0 checkpoint |
| EXP-15 | Message-proof milhares | P0 checkpoint |
| EXP-16 | Audit hero parceiro | P1 |
| EXP-17 | Transversal | P1 medição |
| EXP-18 | Constraint squad | Checkpoint |

---

*Fim do backlog step-04. Saída: `squads/sales-page-optimizer/output/2026-07-23-091955/v1/experiment-backlog.md`.*
