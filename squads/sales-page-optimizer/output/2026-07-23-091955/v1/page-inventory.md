# Inventário de Páginas Comerciais — Patinha

**Agente:** Carla Conversao (📈 Conversion Strategist)  
**Passo:** step-01-map-pages  
**Data:** 2026-07-23  
**Escopo:** páginas listadas em `squads/sales-page-optimizer/squad.yaml`  
**Regra:** fatos de código vs hipóteses comerciais separados; sem inventar métricas ou prova social.

---

## 1. Resumo executivo

O funil comercial do Patinha tem **dois corredores distintos**:

```
TUTOR                          PARCEIRO (B2B)
─────                          ──────────────
Home (/)                       Home CTA → /parceiros/cadastro
  → Cadastro                   Cadastro 4 passos
  → Onboarding pet             Sucesso → upsell Premium
  → Uso free                   /parceiros/premium → LastLink
  → /planos ou paywall /comparar
  → LastLink checkout
```

| Jornada | Páginas de venda | Preço no código | Checkout |
|---------|------------------|-----------------|----------|
| Tutor Premium | `/planos`, paywall em `/comparar` | R$ 19,90/mês ou R$ 115/ano | `planType: tutor_monthly \| tutor_annual` → `/api/lastlink/checkout` |
| Parceiro Premium | `/parceiros/premium` (+ upsell pós-cadastro) | R$ 39,80/mês ou R$ 238,80/ano (UI) | Sempre `planType: partner_basic` (toggle anual **não muda** o payload) |

**Achados de maior impacto (hipótese, sem métricas):**

1. **Toggle mensal/anual do parceiro é cosmético** — preço muda na tela, checkout manda só `partner_basic` (`PremiumClient.tsx` + `lib/lastlink.ts`).
2. **Tutor em `/planos` sem login** — API exige auth (401); UI não redireciona para login com `next`, só mostra erro genérico.
3. **Home mistura jornadas** — dois CTAs primários iguais (tutor + parceiro) competem visualmente.
4. **Paywall contextual `/comparar`** é o melhor “gancho” tutor: benefício claro → `/planos`.
5. **Cadastro parceiro longo (4 passos)** sem promessa de valor monetário no topo; upsell Premium só no sucesso.
6. **Metadata parceiro** fala “Milhares de Tutores” — sem lastro no código; risco de overclaim.

---

## 2. Achados por página

### 2.1 `app/page.tsx` — Home / porta de entrada

| Campo | Conteúdo |
|-------|----------|
| **Público** | Visitante deslogado; conta logada sem pet; tutor com pet (hub, não venda) |
| **Promessa** | “Cuidados premium para seu melhor amigo” + “Saúde, ração e serviços perto de você — comece em 2 passos simples.” Benefícios: saúde/peso, ração, serviços no mapa |
| **CTA** | Deslogado: **Começar grátis** → `/cadastro`; **Já tenho conta** → `/login`; **Sou parceiro** → `/parceiros/cadastro`. Sem pet: **Cadastrar meu pet** → `/onboarding` + CTA parceiro. Com pet: cards de produto (sem upsell Premium) |
| **Preço** | Nenhum |
| **Gargalo** | 1) Dois botões amber de peso visual igual (tutor e parceiro) diluem prioridade. 2) Palavra “premium” no subtítulo sem explicar plano pago. 3) Logado com pet não vê caminho para Premium (hipótese: perda de upsell em uso). 4) Sem SEO metadata própria no arquivo (client component) |
| **Próximo passo** | Hierarquizar CTAs (primário tutor, secundário parceiro); opcional chip “Premium” no hub se `!isPremium` |

**Fato código:** 3 estados (`user && !pet` / `pet` / visitante).  
**Hipótese:** CTA parceiro com mesmo estilo do primário reduz cliques em “Começar grátis”.

---

### 2.2 `app/cadastro/page.tsx` — Cadastro tutor

| Campo | Conteúdo |
|-------|----------|
| **Público** | Tutor novo |
| **Promessa** | “Crie sua conta e comece a cuidar” — genérica, sem benefício Premium nem lista de features |
| **CTA** | `SignupForm` + `GoogleButton`; link **Entrar** → `/login`; **Voltar** → `/` |
| **Preço** | Nenhum (entrada free) |
| **Gargalo** | Promessa fraca vs home (“2 passos”); não reforça o que acontece depois (onboarding pet). Paleta rosa diverge do amber da home (consistência de marca). Sem menção a “grátis para começar” no H1 |
| **Próximo passo** | Alinhar copy ao funil da home (“Passo 1 de 2”); reforçar valor free sem bloquear formulário |

**Fato código:** página só de auth; sem checkout.  
**Hipótese:** fricção baixa se formulário for curto; abandono por falta de reforço de valor (não medido).

---

### 2.3 `app/planos/page.tsx` + `app/planos/PlanosClient.tsx` — Assinatura tutor

| Campo | Conteúdo |
|-------|----------|
| **Público** | Tutor logado (implícito) querendo Premium; também acessível deslogado pela URL |
| **Promessa** | H1: “Cuide do seu pet com tudo que ele merece”. Comparativo free vs Premium: pets ilimitados, histórico completo, alertas vacina/consulta, comparação entre pets |
| **CTA** | **Assinar Premium** → `handleCheckout` → `/api/lastlink/checkout` com `tutor_monthly` ou `tutor_annual` |
| **Preço** | R$ 19,90/mês · R$ 115/ano (~R$ 9,58/mês, badge -52%). Free R$ 0 |
| **Gargalo** | 1) Checkout API exige login (`checkout/route.ts`); UI **não** trata 401 com redirect `/login?next=/planos`. 2) CTA genérico “Assinar Premium” (não nomeia benefício). 3) Copy com acentos faltando em várias strings (“voce”, “Comparacao”, “basico”) — tom menos profissional. 4) Sem prova social real (correto não inventar). 5) Metadata SEO alinhada ao preço (R$ 19,90) — ok |
| **Próximo passo** | Guard de auth + redirect com `next`; CTA orientado a benefício; corrigir acentos; manter `planType` e preços |

**Fato código:** `PRECO_MENSAL = 19.9`, `PRECO_ANUAL = 115`; FAQ de cancelamento/dados/dispositivos.  
**Hipótese:** erro “Unauthorized” em deslogados mata conversão no clique final.  
**Veto/checkpoint:** qualquer mudança de preço ou `planType` → checkpoint.

---

### 2.4 `app/comparar/page.tsx` — Paywall contextual tutor

| Campo | Conteúdo |
|-------|----------|
| **Público** | Tutor com pet(s) autenticado no fluxo do app |
| **Promessa** | “Comparação entre pets é um recurso Premium” — peso, idade, objetivo, recomendações |
| **CTA** | **Ver Planos →** → `/planos` (âncora `<a>`, não `Link`) |
| **Preço** | Não exibe (empurra para `/planos`) |
| **Gargalo** | 1) Paywall bom, mas não mostra preço/âncora de valor no próprio card. 2) Se premium e 1 pet: CTA “+ Adicionar pet” (correto). 3) Redirect para onboarding se zero pets. 4) Não lista outros benefícios Premium — oportunidade de upsell mais larga |
| **Próximo passo** | Manter paywall; testar microcopy com preço “a partir de R$ 19,90” e 1–2 bullets Premium no card |

**Fato código:** gate `!isPremium` via `usePetStore`.  
**Hipótese:** melhor página de intenção comercial do tutor (benefício sentido na hora).

---

### 2.5 `app/parceiros/cadastro/page.tsx` + `CadastroClient.tsx` — Cadastro B2B

| Campo | Conteúdo |
|-------|----------|
| **Público** | Clínicas, pet shops, hotéis, creches, pet sitters, parques |
| **Promessa** | Metadata: “coloque seu negócio no mapa e comece a receber tutores”. UI H1: “Seja um Parceiro” + “Cadastre sua clínica, pet shop ou parque no Patinha” |
| **CTA** | Wizard 4 passos (Negócio → Localização → Contato → Serviços) → **Enviar Cadastro** → `/api/parceiros/cadastro`. Pós-sucesso: **Assinar Premium agora** → `/parceiros/premium` |
| **Preço** | Nenhum no formulário; Premium só no card de sucesso |
| **Gargalo** | 1) Form longo (muitos campos) antes de valor pago. 2) Label do passo 1 na barra = “Negociação” (copy confusa vs “Informações do Negócio”). 3) SLA “48 horas” + e-mail de confirmação — se e-mail não for real, quebra confiança (**dependência** de backend). 4) Upsell Premium só no fim (bom timing, mas zero teaser no início). 5) Metadata não cita preço Premium |
| **Próximo passo** | Corrigir label “Negociação”; teaser de destaque Premium no header; enxugar campos opcionais (hipótese de fricção) |

**Fato código:** ViaCEP, tipos multi-select, termos obrigatórios, estado `enviado` com upsell.  
**Hipótese:** abandono alto no passo 2–3 por volume de campos.

---

### 2.6 `app/parceiros/premium/page.tsx` + `PremiumClient.tsx` — Plano parceiro

| Campo | Conteúdo |
|-------|----------|
| **Público** | Parceiro autenticado (ou visitante que será forçado a login no checkout) |
| **Promessa** | Hero: “Seja o Primeiro que os tutores encontram”. Benefícios: destaque mapa, prioridade busca, selo Premium, WhatsApp direto. Features alinhadas ao comentário de honestidade no código (1 plano real) |
| **CTA** | Hero: **Conhecer Benefícios** (âncora `#beneficios` — **sem CTA de compra no hero**). Card: **Assinar Agora** → login se necessário → LastLink |
| **Preço** | Mensal R$ 39,80 · Anual R$ 238,80 (exibe /mês equivalente). Badge “50% OFF” com preço riscado 2× mensal. Economia anual calculada sobre preço “cheio” |
| **Gargalo** | 1) **Crítico:** `periodo` só altera UI; checkout sempre `{ planType: 'partner_basic' }` — se LastLink tiver só um slug, o seletor anual engana. 2) Hero sem botão “Assinar”. 3) Metadata: “Milhares de Tutores” e “Planos a partir de R$ 39,80” — “milhares” sem prova; “planos” no plural com plano único. 4) Badge 50% OFF precisa lastro comercial real (**checkpoint** se for promoção inventada). 5) Tipografia “atraira” (erro de português) no hero |
| **Próximo passo** | Conectar `periodo` a planTypes reais **ou** remover toggle até existir produto anual; CTA no hero; limpar overclaim SEO |

**Fato código:** `planType: 'partner_basic'`; redirect `/login?next=/parceiros/premium` (melhor que tutor). Comentário no arquivo documenta que planos Básico/Pro/Empresarial antigos prometiam features inexistentes.  
**Hipótese:** desconfiança alta se mensal e anual cobrarem o mesmo no LastLink.  
**Veto/checkpoint:** alterar preço, % OFF ou `planType` → checkpoint.  
**Dependência:** slugs/produtos anuais em `lib/lastlink.ts` / env LastLink se quiser período real.

---

## 3. Riscos e dependências

| Tipo | Item | Onde |
|------|------|------|
| **Risco conversão** | Toggle anual parceiro cosmético | `PremiumClient.tsx` `handleCheckout` |
| **Risco conversão** | Tutor checkout sem redirect de login | `PlanosClient.tsx` vs `checkout/route.ts` |
| **Risco confiança** | “50% OFF” e preço riscado sem política clara | `PremiumClient.tsx` |
| **Risco confiança** | Metadata “Milhares de Tutores” | `parceiros/premium/page.tsx` |
| **Risco marca** | CTAs iguais home; “premium” free vs pago | `app/page.tsx` |
| **Risco copy** | Acentos faltando em planos; “atraira”; label “Negociação” | PlanosClient / PremiumClient / CadastroClient |
| **Dependência** | Config env LastLink (`LASTLINK_*_SLUG`) | `lib/lastlink.ts` |
| **Dependência** | E-mail confirmação parceiro 48h | API `/api/parceiros/cadastro` + Resend |
| **Dependência** | Features Premium tutor (alertas, histórico) devem existir de fato | Tabela `funcionalidades` em PlanosClient — não revalidado feature-a-feature neste passo |
| **Checkpoint** | Qualquer mudança de preço / planType / desconto | Squad constraint |
| **Fora de escopo inventado** | Prova social numérica, cases, depoimentos | Memória: não inventar |

---

## 4. Recomendações priorizadas

Ordem por impacto estimado × esforço (hipótese; sem métricas).

| # | Recomendação | Página | Impacto | Esforço | Critério de aceite |
|---|--------------|--------|---------|---------|-------------------|
| 1 | Tratar 401 no tutor: redirect `/login?next=/planos` antes ou após falha de checkout | `PlanosClient.tsx` | Alto | Baixo | Deslogado clica Assinar → login → volta a `/planos` sem erro solto |
| 2 | Corrigir período parceiro: ou `partner_basic` mensal + tipo anual real, ou remover toggle/badge anual até existir produto | `PremiumClient.tsx` + `lib/lastlink.ts` | Alto | Médio | UI e payload LastLink batem; **checkpoint** se criar planType/preço |
| 3 | Hierarquizar CTAs na home (primário tutor, secundário outline parceiro) | `app/page.tsx` | Médio | Baixo | Um único CTA visual dominante para visitante tutor |
| 4 | CTA no hero parceiro Premium (“Assinar e aparecer no topo”) + âncora benefícios | `PremiumClient.tsx` | Médio | Baixo | Hero tem botão que rola a `#planos` ou dispara checkout se logado |
| 5 | Paywall `/comparar`: incluir preço + 2 bullets Premium no card | `comparar/page.tsx` | Médio | Baixo | Card mostra R$ 19,90 e benefícios listados em PlanosClient |
| 6 | Teaser Premium no header do cadastro parceiro + fix label “Negociação” → “Negócio” | `CadastroClient.tsx` | Médio | Baixo | Label correta; link discreto para `/parceiros/premium` |
| 7 | Remover/reescrever “Milhares de Tutores” no metadata | `parceiros/premium/page.tsx` | Médio (confiança) | Baixo | SEO sem claim numérico sem lastro |
| 8 | Corrigir acentos e typos comerciais | PlanosClient, PremiumClient | Baixo | Baixo | Textos pt-BR corretos |
| 9 | Chip upsell Premium no hub logado se `!isPremium` | `app/page.tsx` (estado pet) | Médio | Baixo | Link `/planos` sem bloquear navegação free |
| 10 | Avaliar honestidade do “50% OFF” parceiro | PremiumClient | Alto (confiança) | Baixo | **Checkpoint** com negócio: manter, recalcular ou remover |

**Não fazer neste ciclo (veto / dependência):**

- Mudar preços ou criar planTypes sem checkpoint e sem produto LastLink.
- Inventar depoimentos, número de tutores ou “já usado por X clínicas”.
- Restaurar 3 tiers B2B (código já documenta features inexistentes).

---

## 5. Próximos passos

1. **step-02 (conversion audit):** aprofundar fricção CTA/preço/login/checkout com checklist por seção (home, planos, premium parceiro, paywall).
2. **step-03 (message-proof):** mapear claims vs evidência no código (features listadas em PlanosClient e PremiumClient).
3. **step-04 (experiment plan):** transformar itens 1–6 em experimentos pequenos e reversíveis.
4. **Checkpoint humano** antes de: preços, % OFF, planTypes, claims “milhares”.
5. **Validação técnica paralela (opcional):** confirmar se alertas de vacina e históricos “completos” estão realmente gateados por Premium no app — lastro das bullets de `/planos`.

---

## Apêndice — Mapa rápido público / promessa / CTA / preço / gargalo / próximo

| Página | Público | Promessa | CTA | Preço | Gargalo | Próximo |
|--------|---------|----------|-----|-------|---------|---------|
| `/` | Tutor visitante / logado | Cuidados + 3 benefícios | Começar grátis / Parceiro | — | CTAs competindo | Hierarquia visual |
| `/cadastro` | Tutor novo | Crie conta e cuide | Signup + Google | Free | Promessa fraca | Copy alinhada ao funil |
| `/planos` | Tutor (ideal logado) | Tudo que o pet merece | Assinar Premium | 19,90 / 115 | Auth 401 sem redirect | Guard + CTA benefício |
| `/comparar` | Tutor multi-pet | Comparação Premium | Ver Planos | via /planos | Sem preço no paywall | Microcopy + preço |
| `/parceiros/cadastro` | B2B local | Entrar no mapa | Enviar cadastro → Premium | — | Form longo; label “Negociação” | Teaser + enxugar |
| `/parceiros/premium` | B2B pagante | Ser o 1º no mapa | Assinar Agora | 39,80 / 238,80 UI | Toggle anual cosmético; overclaim SEO | Alinhar checkout + claims |

---

*Fim do inventário step-01. Saída exclusiva deste path para o run `2026-07-23-091955/v1`.*
