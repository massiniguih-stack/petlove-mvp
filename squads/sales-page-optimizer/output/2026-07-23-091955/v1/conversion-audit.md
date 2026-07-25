# Auditoria de Conversão — Patinha

**Agente:** Carla Conversao (📈 Conversion Strategist)  
**Passo:** step-02-conversion-audit  
**Data:** 2026-07-23  
**Run:** `2026-07-23-091955/v1`  
**Inputs:** `page-inventory.md`, `research-brief.md`, fontes em `squad.yaml`, `lib/lastlink.ts`, `app/api/lastlink/checkout/route.ts`  
**Regra:** fatos de código vs hipóteses comerciais; sem inventar métricas, features ou prova social.

---

## 1. Resumo executivo

O funil tem **dois corredores** (tutor B2C e parceiro B2B). A conversão sofre mais por **fricção de checkout/auth** e **desalinhamento preço ↔ payload** do que por falta de páginas de venda.

```
TUTOR                                    PARCEIRO
─────                                    ────────
/  → /cadastro → onboarding → uso free   /  → /parceiros/cadastro (4 passos)
          ↘ /planos → LastLink                     ↘ sucesso → upsell
          ↘ /comparar (paywall) → /planos          ↘ /parceiros/premium → LastLink
```

| # | Achado crítico | Tipo | Impacto conversão (hipótese) |
|---|----------------|------|------------------------------|
| 1 | `/planos` não redireciona deslogado para login; API devolve 401 e UI mostra erro | Fato código | Alto — clique final morre |
| 2 | Toggle mensal/anual parceiro só muda UI; checkout sempre `partner_basic` | Fato código | Alto — risco de cobrança errada / desconfiança |
| 3 | Home: CTA tutor e parceiro com o mesmo peso visual (amber sólido) | Fato código | Médio — dilui jornada principal |
| 4 | Paywall `/comparar` forte, mas sem preço no card | Fato código | Médio — intenção alta, fechamento fraco |
| 5 | Claims “50% OFF”, “Milhares de Tutores”, “planos” no plural sem lastro | Fato código + hipótese confiança | Alto confiança / Médio SEO |

**O que já funciona bem (preservar):**

- Comparativo free vs Premium em `/planos` com preços claros (R$ 19,90 / R$ 115).
- Tutor anual/mensal **liga** `tutor_monthly` | `tutor_annual` ao payload (correto).
- Parceiro Premium: redirect de login com `next` + comentário honesto de plano único no código.
- Upsell Premium no **sucesso** do cadastro parceiro (timing correto).
- FAQ de cancelamento/dados em `/planos` (reduz medo).

**Não mexer sem checkpoint:** preços, `planType`, % OFF, claims numéricos de audiência.

---

## 2. Achados por página

### 2.1 Landing — `app/page.tsx` (`/`)

| Dimensão | Avaliação | Detalhe |
|----------|-----------|---------|
| **Promessa** | Média | “Cuidados premium…” + “2 passos” — boa clareza de entrada free; palavra “premium” confunde com plano pago |
| **CTA** | Fraca hierarquia | Primários: “Começar grátis” + “Já tenho conta” ok; “Sou parceiro” repete estilo amber sólido (mesmo peso) |
| **Preço** | Ausente | Correto para top-of-funnel free; zero menção a Premium para quem já usa |
| **Fricção** | Baixa (visitante) | 3 estados claros: visitante / logado sem pet / hub com pet |
| **Upsell** | Ausente no hub | Estado `pet`: cards de produto; “Comparar pets” é o único gancho indireto Premium |

**Seções (checklist de conversão)**

| Seção | Problema | Hipótese de perda |
|-------|----------|-------------------|
| Hero visitante | Tagline “premium” sem explicar free vs pago | Visitante pode achar que precisa pagar para começar |
| CTAs | Dois botões filled amber (tutor + parceiro) | Clique em parceiro por engano; diluição do CTA tutor |
| Estado sem pet | CTA parceiro com **mesmo estilo** do primário “Cadastrar pet” | Mistura jornadas no pior momento (quase no app) |
| Hub com pet | Sem chip/banner Premium se `!isPremium` | Perda de upsell em uso ativo |

**Fato código:** não há link para `/planos` na home em nenhum estado.  
**Hipótese:** hierarquia visual + upsell sutil no hub eleva intenção sem bloquear free.

---

### 2.2 Cadastro tutor — `app/cadastro/page.tsx` (`/cadastro`)

| Dimensão | Avaliação | Detalhe |
|----------|-----------|---------|
| **Promessa** | Fraca | “Crie sua conta e comece a cuidar” — genérica vs home (“2 passos”) |
| **CTA** | Ok | `SignupForm` + `GoogleButton`; link Entrar; Voltar `/` |
| **Preço** | N/A (free) | Não reforça “grátis para começar” no H1 |
| **Fricção** | Baixa se form curto | Página só auth; sem checkout |
| **Consistência** | Quebrada | Paleta rosa/rose vs amber da home — sensação de “outro produto” |

**Seções**

| Seção | Problema | Hipótese |
|-------|----------|----------|
| H1/sub | Não diz “passo 1 de 2” nem o que vem depois (pet) | Abandono por incerteza de esforço |
| Card form | Sem microcopy de valor free | Menos confiança vs concorrentes com social proof (não inventar prova) |
| Visual | Rosa vs amber | Quebra continuidade da jornada home → cadastro |

**Próximo (copy, sem feature nova):** alinhar H1 ao funil da home; manter Google + email.

---

### 2.3 Planos tutor — `app/planos/page.tsx` + `PlanosClient.tsx` (`/planos`)

| Dimensão | Avaliação | Detalhe |
|----------|-----------|---------|
| **Promessa** | Boa | “tudo que ele merece” + tabela free/Premium objetiva |
| **CTA** | Médio | “Assinar Premium” genérico; loading state ok |
| **Preço** | Forte | R$ 19,90/mês · R$ 115/ano · badge -52% · economia anual calculada |
| **Checkout** | **Crítico** | `handleCheckout` → `tutor_monthly` \| `tutor_annual`; API exige user; **sem** redirect `/login?next=/planos` |
| **Copy** | Risco profissionalismo | Acentos faltando (“voce”, “basico”, “Historico”, “Comparacao”, “Nao ha”) |
| **SEO** | Ok | Metadata com preço R$ 19,90 — alinhada |

**Seções**

| Seção | Problema | Severidade |
|-------|----------|------------|
| Toggle mensal/anual | Funcional: payload muda corretamente (fato) | — preservar |
| Card Premium CTA | Sem guard de auth pré-clique; 401 vira `Error` genérico na tela | **Alta** |
| BackButton | `href="/dashboard"` — frio se visitante veio da URL ou SEO | Média |
| FAQ | Bom para objeção; copy sem acentos | Baixa |
| Tabela features | Lista clara; **dependência**: gates reais no app (alertas, histórico) a validar em message-proof | Dependência |

**Fato código (checkout):**

```text
POST /api/lastlink/checkout
  sem user → 401 { error: 'Unauthorized' }
  planType válido → URL LastLink via slug env
```

**Veto:** manter `handleCheckout` e `planType` tutor_*; qualquer preço novo → checkpoint.

---

### 2.4 Paywall comparar — `app/comparar/page.tsx` (`/comparar`)

| Dimensão | Avaliação | Detalhe |
|----------|-----------|---------|
| **Promessa** | Excelente (contextual) | “Comparação entre pets é um recurso Premium” + o que desbloqueia |
| **CTA** | Médio | “Ver Planos →” âncora `<a href="/planos">` (não `Link` Next) |
| **Preço** | Ausente no card | Empurra 100% para `/planos` |
| **Fricção** | Baixa | Gate `!isPremium`; 0 pets → onboarding; 1 pet premium → add pet |
| **Upsell largura** | Estreita | Só fala de comparação; não lista 1–2 outros benefícios PRO já listados em PlanosClient |

**Seções**

| Seção | Problema | Hipótese |
|-------|----------|----------|
| Card paywall | Sem “a partir de R$ 19,90/mês” | Fricção extra de um hop sem âncora de valor |
| CTA único | Só “Ver Planos” | Testável: CTA secundário “Comparar peso e ração entre pets” no mesmo botão (benefício) |
| Rota pós-login | Se deslogado, store pode redirecionar/ocultar — não é página de venda fria | Fora do top-of-funnel |

**Hipótese:** melhor página de intenção comercial do tutor (benefício sentido na hora).  
**Preservar:** paywall visual forte; não inventar preview fake dos gráficos.

---

### 2.5 Cadastro parceiro — `page.tsx` + `CadastroClient.tsx` (`/parceiros/cadastro`)

| Dimensão | Avaliação | Detalhe |
|----------|-----------|---------|
| **Promessa** | Média | Metadata boa (“receber tutores”); UI H1 “Seja um Parceiro” sem ROI/preço |
| **CTA** | Ok por passo | Wizard 4 passos → “Enviar Cadastro”; sucesso → “Assinar Premium agora” |
| **Preço** | Só no upsell pós-envio | Timing bom; zero teaser no header |
| **Fricção** | Alta | Muitos campos; passo 3 com redes/horários; serviços multi-select longo |
| **Confiança** | Dependência | “48 horas” + “e-mail de confirmação” — se backend não enviar, quebra confiança |

**Seções**

| Seção | Problema | Severidade |
|-------|----------|------------|
| Progress labels | Passo 1 = **“Negociação”** (deveria ser Negócio) | Alta (confusão) |
| Header | Sem teaser Premium / destaque mapa | Média |
| Step 2 CEP | CEP opcional; endereço obrigatório — ViaCEP ajuda mas CEP não é empurrado como “atalho primeiro” | Média fricção |
| Step 3 | Muitos opcionais no mesmo passo que telefone/email obrigatórios | Hipótese abandono |
| Step 4 | Termos ok; resumo bom | Preservar |
| Sucesso | Upsell Premium bem escrito (“sem esperar análise”) | Preservar timing |

**Fato código:** `POST /api/parceiros/cadastro`; estado `enviado` com card amber de upsell.  
**Hipótese:** abandono nos passos 2–3 por volume; teaser Premium no topo não deve bloquear free listing.

---

### 2.6 Parceiro Premium — `page.tsx` + `PremiumClient.tsx` (`/parceiros/premium`)

| Dimensão | Avaliação | Detalhe |
|----------|-----------|---------|
| **Promessa** | Forte | “Seja o Primeiro que os tutores encontram” + 4 benefícios honestos (mapa, busca, selo, WhatsApp) |
| **CTA hero** | Fraco | Só “Conhecer Benefícios” (`#beneficios`) — **sem assinar no hero** |
| **CTA card** | Ok | “Assinar Agora” + login `?next=/parceiros/premium` (melhor que tutor) |
| **Preço UI** | Mensal R$ 39,80 · Anual R$ 238,80 | Toggle e textos “cobrado anualmente” / economia |
| **Checkout** | **Crítico** | Sempre `{ planType: 'partner_basic' }` — `periodo` **não entra** no body |
| **Confiança** | Alta risco | Badge “50% OFF” + preço riscado 2× mensal; “-20%” no toggle anual; metadata “Milhares de Tutores” + “Planos” plural |
| **Copy** | Typo | “atraira” no hero |

**Seções**

| Seção | Problema | Severidade |
|-------|----------|------------|
| Hero | Sem CTA de compra; âncora só benefícios (seção `#planos` existe, hero não aponta para ela) | Média |
| Toggle período | Cosmético vs LastLink | **Crítica** |
| Badge 50% OFF | Precisa política comercial real | **Checkpoint** |
| Trust line | “Pagamento seguro via LastLink” + “Cancelamento grátis” — bom | Preservar |
| Metadata SEO | Overclaim numérico | Média (confiança/SEO) |

**Fato código `lib/lastlink.ts`:** slugs `partner_basic`, `partner_pro`, `partner_enterprise` no mapa; UI só usa `partner_basic`. Não há `partner_annual` no mapa.  
**Hipótese:** se LastLink só tem um produto, seletor anual engana; se tem produto anual, código não o usa.

**Veto:** criar planType/preço/anual real → checkpoint + env LastLink.

---

## 3. Riscos e dependências

| Tipo | Item | Onde | Ação |
|------|------|------|------|
| **Risco conversão** | Tutor checkout sem redirect login | `PlanosClient.tsx` vs `checkout/route.ts` | Fix UI (baixo esforço) |
| **Risco conversão / legal-comercial** | Toggle anual parceiro cosmético | `PremiumClient.tsx` `handleCheckout` | Alinhar UI↔payload ou remover toggle |
| **Risco confiança** | “50% OFF” e preço cheio 2× | `PremiumClient.tsx` | Checkpoint negócio |
| **Risco confiança** | “Milhares de Tutores” | `parceiros/premium/page.tsx` metadata | Reescrever sem número |
| **Risco marca** | CTAs iguais home; “premium” free vs pago | `app/page.tsx` | Hierarquia + glossário copy |
| **Risco copy** | Acentos Planos; “atraira”; “Negociação” | PlanosClient / PremiumClient / CadastroClient | Correção textual |
| **Dependência** | Env LastLink `LASTLINK_*_SLUG` | `lib/lastlink.ts` | Checkout 500 se slug vazio |
| **Dependência** | E-mail confirmação 48h parceiro | API cadastro + Resend | Validar envio real |
| **Dependência** | Features Premium tutor gateadas de fato | App (vida, alertas, históricos) | Validar no step message-proof |
| **Dependência** | Produto anual parceiro no LastLink | Fora do código atual | Só se quiser toggle real |
| **Checkpoint** | Preço / planType / % OFF / claims “milhares” | Squad constraint | Não implementar sem ok humano |
| **Fora de escopo** | Depoimentos, cases, número de clínicas | — | Não inventar |

---

## 4. Recomendações priorizadas

### 4.1 Matriz impacto × esforço

```
        IMPACTO
        Baixo          Médio              Alto
ESFORÇO
Baixo   | Typos acentos | Hierarquia CTAs home | Auth redirect /planos
        |               | Paywall + preço      | Honestidade 50% OFF (decisão)
        |               | Hero CTA parceiro    | Metadata milhares
        |               | Label Negociação     |
        |               | Teaser cadastro B2B  |
        |               | Chip Premium hub     |
────────|───────────────|──────────────────────|────────────────────────
Médio   |               | Enxugar form B2B     | Toggle parceiro ↔ planType real
        |               | (opcionais)          |   ou remover seletor anual
────────|───────────────|──────────────────────|────────────────────────
Alto    |               |                      | (evitar) 3 tiers B2B de novo
```

### 4.2 Lista priorizada (implementável / experimentável)

| # | Página | Seção | Recomendação | Impacto | Esforço | Critério de aceite | Notas |
|---|--------|-------|--------------|---------|---------|--------------------|-------|
| 1 | `/planos` | CTA Premium / `handleCheckout` | Se 401 ou sem sessão: `router.push('/login?next=/planos')` (espelhar parceiro) | **Alto** | **Baixo** | Deslogado clica Assinar → login → retorna `/planos` sem mensagem “Unauthorized” | Manter `planType` tutor_* |
| 2 | `/parceiros/premium` | Toggle + checkout | **Opção A:** remover toggle/badge anual até existir produto. **Opção B (checkpoint):** planType anual real + slug env | **Alto** | **Médio** | UI e payload LastLink idênticos; usuário não vê “cobrado anualmente” se só há mensal | Não inventar planType sem checkpoint |
| 3 | `/parceiros/premium` | Badge “50% OFF” + preço riscado | Checkpoint: manter com lastro, recalcular ou remover | **Alto** (confiança) | **Baixo** | Decisão registrada; UI não promete desconto fictício | Checkpoint humano |
| 4 | `/` | CTAs visitante + sem pet | Primário tutor filled; parceiro outline/secundário | **Médio** | **Baixo** | Um único CTA visual dominante para tutor | Sem mudar rotas |
| 5 | `/parceiros/premium` | Hero | CTA “Assinar e aparecer no topo” → `#planos` (ou checkout se logado) | **Médio** | **Baixo** | Hero tem botão de compra/âncora planos além de benefícios | Preservar `handleCheckout` |
| 6 | `/comparar` | Card paywall | Incluir “a partir de R$ 19,90/mês” + 1–2 bullets PRO já listados em PlanosClient | **Médio** | **Baixo** | Card mostra preço e benefícios existentes; CTA continua `/planos` | Só features do código |
| 7 | `/parceiros/cadastro` | Progress + header | Label “Negociação” → “Negócio”; teaser link `/parceiros/premium` | **Médio** | **Baixo** | Label correta; link discreto sem bloquear form | |
| 8 | `/parceiros/premium` | metadata | Remover “Milhares de Tutores”; “planos” → “plano” se único | **Médio** (confiança) | **Baixo** | SEO sem claim numérico sem lastro | |
| 9 | `/` | Hub com pet | Chip/banner “Desbloqueie Premium” se `!isPremium` → `/planos` | **Médio** | **Baixo** | Visível só free; não bloqueia cards free | Dependência: `isPremium` no store |
| 10 | `/planos`, premium | Copy | Corrigir acentos pt-BR + typo “atrairá” | **Baixo** | **Baixo** | Textos com acentuação correta | |
| 11 | `/cadastro` | H1/sub | “Passo 1 de 2 — grátis” + o que vem (pet) | **Médio** | **Baixo** | Copy alinhada à home; form intacto | |
| 12 | `/planos` | BackButton | Se deslogado, voltar `/` ou “Voltar”; se logado, dashboard | **Baixo** | **Baixo** | Frio de SEO não cai em dashboard vazio | Opcional |

### 4.3 Explicitamente NÃO fazer neste ciclo

| Item | Motivo |
|------|--------|
| Mudar R$ 19,90 / 115 / 39,80 / 238,80 sem ok | Veto checkpoint |
| Restaurar Básico/Pro/Empresarial parceiro | Código já documenta features inexistentes |
| Inventar depoimentos / “X mil tutores” | Sem lastro |
| Alterar fluxo LastLink `/api/lastlink/checkout` além de auth UX | Constraint squad |
| Prometer métricas de painel parceiro | Não implementado |

---

## 5. Próximos passos

1. **step-03 (message-proof):** mapear cada claim de `/planos` e `/parceiros/premium` vs gate real no app (alertas, histórico, destaque mapa, WhatsApp).
2. **step-04 (experiment backlog):** transformar itens 1, 4, 5, 6, 7, 9 em experimentos pequenos e reversíveis (A/B ou ship/fix se sem tráfego).
3. **Checkpoint humano imediato** antes de qualquer implementação de: preço, % OFF, planType parceiro anual, “milhares”.
4. **Quick wins paralelos (sem checkpoint de preço):** #1 auth redirect tutor, #4 hierarquia CTAs, #7 label Negócio, #8 metadata, #10 typos.
5. **Validação de dependência:** confirmar envio de e-mail pós-cadastro parceiro e slugs LastLink preenchidos em produção.

---

## Apêndice A — Matriz resumo por página

| Página | Clareza preço | Clareza CTA | Fricção auth | Risco confiança | Prioridade fix |
|--------|---------------|-------------|--------------|-----------------|----------------|
| `/` | N/A free | Média (CTAs competem) | Baixa | “premium” ambíguo | P2 hierarquia |
| `/cadastro` | N/A | Ok | Baixa | Baixa | P3 copy funil |
| `/planos` | Alta | Média | **Alta (401)** | Acentos | **P0 auth** |
| `/comparar` | Baixa no card | Ok | N/A logado | Baixa | P2 preço no card |
| `/parceiros/cadastro` | Só pós-sucesso | Ok | N/A form | 48h/e-mail dep. | P2 label + teaser |
| `/parceiros/premium` | Alta na UI | Média (hero fraco) | Ok (next) | **Toggle + 50% + milhares** | **P0 alinhamento checkout** |

---

## Apêndice B — Fluxos de checkout (fato)

```
TUTOR
  PlanosClient.handleCheckout
    → POST /api/lastlink/checkout { planType: tutor_monthly | tutor_annual }
    → precisa user (senão 401)
    → redirect window.location = LastLink URL

PARCEIRO
  PremiumClient.handleCheckout
    → se !user → /login?next=/parceiros/premium
    → POST { planType: 'partner_basic' }  // periodo ignorado
    → LastLink URL
```

*Fim da auditoria step-02. Saída: `squads/sales-page-optimizer/output/2026-07-23-091955/v1/conversion-audit.md`.*
