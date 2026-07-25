# Mapa de Mensagem, Prova e Confiança — Patinha

**Agente:** Paula Prova (🛡️ Proof and Trust Analyst)  
**Passo:** step-03-message-proof  
**Data:** 2026-07-23  
**Run:** `2026-07-23-091955/v1`  
**Inputs:** `conversion-audit.md`, `page-inventory.md`, fontes das páginas comerciais, `company.md`, gates em `lib/store.ts`, `app/vida`, `app/racao`, `app/atividades`, `app/comparar`, `app/mapa`, `app/api/cron/vaccine-reminders`, `app/api/lastlink/webhook`  
**Regra:** só prova real; sem inventar depoimento, métrica ou case; claims sem lastro = **CHECKPOINT**.

---

## 1. Resumo executivo

A confiança do funil sofre mais por **promessas desalinhadas do produto** e **descontos/audiência sem lastro** do que por falta de FAQ.

```
TUTOR:  home (ambiguidade "premium") → cadastro (sem reforço free) → planos (features + FAQ ok)
         ↘ comparar (paywall honesto, sem preço) → LastLink
PARCEIRO: cadastro (SLA 48h + e-mail) → premium (50% OFF / milhares / toggle anual cosmético)
```

| # | Achado | Tipo | Severidade confiança |
|---|--------|------|----------------------|
| 1 | **“Alertas de vacinas e consultas” como PRO** em `/planos` e dashboard, mas cron de lembrete **não filtra** assinatura Premium | Fato código | **Alta** — overclaim de exclusividade |
| 2 | **“50% OFF” + preço cheio 2×** e badge **-20%** anual no parceiro (matemática e payload inconsistentes) | Fato código + **CHECKPOINT** | **Alta** |
| 3 | Metadata **“Milhares de Tutores”** sem contagem instrumentada | Fato código + **CHECKPOINT** | **Alta** |
| 4 | Toggle mensal/anual parceiro **não muda** `planType` (`partner_basic` sempre) | Fato código | **Alta** (quebra de confiança no checkout) |
| 5 | Features tutor PRO com lastro real: pets ilimitados, histórico 7 dias, refeições/atividades “dia anterior”, comparação | Fato código | Boa base — **preservar e nomear com precisão** |
| 6 | Features parceiro com lastro: `premium`/`destaque` no mapa, sort prioritário, botão WhatsApp só se premium | Fato código | Boa base — **não prometer métricas de painel** |
| 7 | Cancelamento: FAQ e “Cancelamento grátis” ok em tom; fluxo real = LastLink member URL (externo) | Fato + gap microcopy | Média |
| 8 | “Cuidados **premium**” na home free confunde plano pago | Fato copy | Média |

**O que já funciona como prova honesta (preservar):**

- Tabela free vs Premium em `/planos` com preços R$ 19,90 / R$ 115 e badge **-52%** coerente com `19,90×12` vs `115` (~51,8%).
- Comentário no código de parceiro Premium (1 plano real; tiers antigos removidos por honestidade).
- Trust line parceiro: “Pagamento seguro via LastLink” + “Cancelamento grátis”.
- FAQ tutor: cancelar, dados, multi-dispositivo.
- Upsell pós-cadastro parceiro sem bloquear listagem free.
- Paywall `/comparar` sem preview fake dos gráficos.

**Prova social / métricas:** **não existem** no código comercial. Não inventar. Contagens futuras só com instrumentação real (admin já tem stats internas — **não** usar na landing sem política de divulgação).

---

## 2. Achados por página

### 2.1 Landing — `/` (`app/page.tsx`)

| Dimensão | Achado |
|----------|--------|
| **Objeções típicas** | “É pago?” · “É só para clínica?” · “Quanto tempo leva?” · “Sou petshop, é aqui?” |
| **Prova existente** | Jornada 3 passos (conta → pet → uso); “Começar grátis”; benefícios concretos (saúde/peso, ração, mapa); CTA parceiro separado |
| **Gaps de confiança** | Zero menção a preço Premium, segurança, cancelamento; zero prova de “quantos usam”; palavra **premium** no tagline sem glossário free vs pago |
| **Microcopy** | “Cuidados premium para seu melhor amigo” ambígua; “2 passos simples” na lead vs 3 cards de jornada (leve inconsistência de contagem); hub com pet sem microcopy de upgrade |
| **Claim risks** | “premium” = marca/tagline, não plano — risco de achar que precisa pagar para começar |

**Claims mapeados**

| Claim | Lastro | Veredito |
|-------|--------|----------|
| Começar grátis / 2–3 passos | Fluxo cadastro + onboarding existe | ✅ Ok (alinhar “2” vs “3” na copy) |
| Saúde, ração, serviços no mapa | Rotas `/dashboard`, `/racao`, `/mapa` | ✅ Ok |
| “Cuidados premium…” | Sem definição free vs pago | ⚠️ Reescrever sem parecer plano pago |

**Prova recomendável (real):** microcopy “Grátis para começar · Premium opcional”; no hub, se `!isPremium`, chip com benefícios **já gateados** (ex.: “Comparar pets”, “Histórico além de 7 dias”) → `/planos`. Sem números de base de usuários.

---

### 2.2 Cadastro tutor — `/cadastro` (`app/cadastro/page.tsx`)

| Dimensão | Achado |
|----------|--------|
| **Objeções** | “Vão me cobrar?” · “Preciso de cartão?” · “O que vem depois?” · “Meus dados ficam onde?” |
| **Prova existente** | Google + e-mail; link Entrar; marca Patinha |
| **Gaps** | H1 não diz grátis; sem “passo 1 de 2”; sem linha de privacidade/sem cartão; paleta rosa ≠ home (quebra continuidade emocional) |
| **Microcopy** | “Crie sua conta e comece a cuidar” genérica |
| **Claim risks** | Baixo (não promete Premium aqui) |

**Prova recomendável:** “Passo 1 de 2 · sem cartão · grátis para começar”; opcional “seus dados no Supabase / conta sua” só se jurídico validar wording — senão: “conta protegida por login”.

---

### 2.3 Planos tutor — `/planos` (`PlanosClient.tsx` + metadata)

| Dimensão | Achado |
|----------|--------|
| **Objeções** | “Vale a pena?” · “Posso cancelar?” · “Perco meus dados?” · “O que o free já cobre?” · “Pagamento é seguro?” · “E se eu só quiser um pet?” |
| **Prova existente** | Comparativo feature a feature; preços claros; toggle mensal/anual **ligado** a `tutor_monthly` / `tutor_annual`; FAQ cancelamento/dados/dispositivos; badge -52% **coerente** com aritmética |
| **Gaps** | Sem menção a LastLink/segurança no card (só no parceiro); sem “como cancelar” (vai para LastLink member); 401 deslogado sem redirect (confiança + conversão); acentos faltando (“voce”, “basico”) — sinal de descuido; **claim de alertas PRO sem gate** |
| **Microcopy** | CTA “Assinar Premium” genérico; FAQ sem acentos; sem “o free continua existindo” no CTA |
| **Claim risks** | Lista PRO parcialmente overclaimed (alertas); resto majoritariamente lastreado |

#### Matriz feature × lastro (tutor)

| Feature na tabela `/planos` | Gate no código? | Evidência | Veredito |
|-----------------------------|-----------------|-----------|----------|
| Perfil do pet | Free | App geral | ✅ |
| Cadastro de 1 pet | Free | `addPet` libera 1 sem Premium | ✅ |
| Controle de peso básico | Free | Dashboard/pet | ✅ (copy sem acento) |
| Linha do tempo (últimos 7 dias) | Free limitado | `DIAS_HISTORICO_GRATIS = 7` em `vida/page.tsx` | ✅ |
| Mapa de serviços | Free | `/mapa` sem gate tutor | ✅ |
| Cadastro ilimitado de pets | **Premium** | `lib/store.ts` `addPet`: bloqueia se `!isPremium && pets.length >= 1`; `PetSelector` → `/planos` | ✅ |
| Histórico completo linha do tempo | **Premium** | free filtra `m.data >= corteHistorico` | ✅ |
| Histórico completo de refeições | **Premium** (navegação dia anterior) | `racao/page.tsx`: `!isPremium && diaOffset === 0` bloqueia dia anterior | ✅ com nuance: copy “histórico completo” vs “ver dias anteriores” |
| Histórico completo de atividades | **Premium** (idem) | `atividades/page.tsx` mesmo padrão | ✅ com mesma nuance |
| **Alertas de vacinas e consultas** | **Listado PRO, cron NÃO filtra plano** | `api/cron/vaccine-reminders` envia e-mail/push a qualquer tutor com vacina pendente | ❌ **Overclaim de exclusividade** |
| Comparação entre pets | **Premium** | `comparar/page.tsx` `!isPremium` paywall | ✅ |

#### Claims de preço / desconto

| Claim | Lastro | Veredito |
|-------|--------|----------|
| R$ 19,90/mês · R$ 115/ano | Constantes + metadata + dashboard | ✅ (mudança = **CHECKPOINT**) |
| Badge **-52%** anual | `(19,9×12 − 115) / (19,9×12) ≈ 51,8%` | ✅ honesto o suficiente |
| “Acesso total” | Não é literal (produto MVP) | ⚠️ Preferir “recursos Premium listados abaixo” |

#### FAQ × realidade

| FAQ | Realidade | Gap |
|-----|-----------|-----|
| Cancelar a qualquer momento, sem multa | Gestão via `NEXT_PUBLIC_LASTLINK_MEMBER_URL` / LastLink; UI mostra `cancelAtPeriodEnd` em `/conta/assinatura` | Falta dizer **onde** cancelar |
| Dados ficam seguros; volta ao free | Dados de pet/momentos não são apagados no cancel (não há job de purge no fluxo de assinatura lido) | Ok em espírito; “seguros” é genérico |
| Vários dispositivos / nuvem | Auth Supabase + store sync | ✅ razoável |

**Prova recomendável:**  
1) Reclassificar **alertas** (ver recs).  
2) Linha sob CTA: “Pagamento processado pela LastLink · cancele quando quiser na área de membros”.  
3) CTA: “Assinar Premium — pets ilimitados + histórico completo”.  
4) Corrigir pt-BR (acentos) = higiene de confiança.

---

### 2.4 Paywall comparar — `/comparar`

| Dimensão | Achado |
|----------|--------|
| **Objeções** | “Por que bloquear?” · “Quanto custa?” · “Só isso no Premium?” |
| **Prova existente** | Promessa contextual **verdadeira** (recurso gated); lista o que desbloqueia (peso, idade, objetivo, recomendações) alinhada ao conteúdo real pós-paywall |
| **Gaps** | Sem preço; sem outros benefícios PRO lastreados; sem link de cancelamento/FAQ |
| **Microcopy** | “Ver Planos →” fraco em valor; bom em honestidade |
| **Claim risks** | Baixo — não inventa preview |

**Prova recomendável:** “A partir de R$ 19,90/mês” + bullets só com features **com gate real** (comparar + pets ilimitados + histórico >7 dias). **Não** repetir “alertas exclusivos” até o gate existir ou a claim mudar.

---

### 2.5 Cadastro parceiro — `/parceiros/cadastro` (`CadastroClient.tsx` + API)

| Dimensão | Achado |
|----------|--------|
| **Objeções** | “É grátis entrar no mapa?” · “Vou aparecer na hora?” · “É golpe / lead genérico?” · “Por que tantos campos?” · “E o Premium?” |
| **Prova existente** | Wizard com resumo; termos; ViaCEP; e-mail de confirmação **implementado** (Resend); texto 48h na UI e no e-mail; upsell “sem esperar análise” no sucesso |
| **Gaps** | Label progresso **“Negociação”** vs título “Informações do Negócio” (parece barganha de preço); sem teaser do que é free listing vs Premium; SLA 48h depende de operação humana (não automatizado além do e-mail); e-mail `from: onboarding@resend.dev` pode cair em spam / parecer não oficial |
| **Microcopy** | Upsell sucesso é bom e honesto no tom; header fraco em valor |
| **Claim risks** | “Enviamos um e-mail…” — true se Resend/env ok; falha só loga erro (usuário ainda vê sucesso) → **risco de confiança se e-mail não chegar** |

**Claims**

| Claim | Lastro | Veredito |
|-------|--------|----------|
| Análise em até 48 horas | Copy UI + e-mail; sem SLA técnico/automação | ⚠️ Operacional — manter só se time cumprir; senão “em breve” / “assim que possível” |
| E-mail de confirmação | `app/api/parceiros/cadastro/route.ts` tenta enviar | ⚠️ Condicional a `RESEND_API_KEY` e domínio |
| Premium “já entra em destaque hoje, sem esperar análise” | Webhook seta `premium`+`destaque` no parceiro casado por e-mail; cadastro free ainda passa por análise | ⚠️ Validar se pagamento **antes** da row `partners` ativar de verdade (webhook reclama se não achar parceiro por e-mail) |

**Prova recomendável:** “Listagem gratuita após análise · destaque pago opcional”; corrigir label **Negócio**; no sucesso, se e-mail falhar no backend, não prometer envio absoluto (ou reenviar).

---

### 2.6 Parceiro Premium — `/parceiros/premium` (`PremiumClient.tsx` + metadata)

| Dimensão | Achado |
|----------|--------|
| **Objeções** | “Funciona de verdade no mapa?” · “Mensal ou anual cobra o quê?” · “50% OFF de quê?” · “Quantos tutores veem?” · “Posso cancelar?” · “WhatsApp aparece?” |
| **Prova existente** | Features alinhadas ao que o mapa faz; trust LastLink + cancelamento; login com `?next=`; comentário honesto de plano único no código |
| **Gaps** | Hero sem CTA de compra; sem FAQ; sem “como aparece no mapa” (screenshot real / passo a passo); overclaims SEO e desconto |
| **Microcopy** | “atraira” typo; “Seja o Primeiro” é aspiracional (ok se não afirmar ranking garantido por cidade com volume zero); “Desconto aplicado automaticamente” sem prova de cupom |
| **Claim risks** | **Críticos** abaixo |

#### Matriz feature × lastro (parceiro)

| Feature / benefício na UI | Lastro | Veredito |
|---------------------------|--------|----------|
| Listagem no mapa | Cadastro + `servicos` / partners no mapa | ✅ (não é exclusivo Premium — free listing após análise também lista) |
| Selo Premium | Badge “🏆 Premium” se `servico.premium` | ✅ |
| Destaque no topo da busca | Sort `premium` depois `destaque` em `mapa/page.tsx` | ✅ com nuance: “primeiro na sua cidade” depende de haver outros e da ordenação local — não garantir “sempre o #1 absoluto” se houver vários premium |
| WhatsApp direto no perfil | Botão WA **só** se `servico.premium` | ✅ (telefone `tel:` free continua) |
| Informações de contato completas | Free também pode ter telefone/instagram | ⚠️ Não vender como exclusivo |
| Webhook ativa `premium` + `destaque` | `lastlink/webhook` | ✅ se e-mail casar com row |

#### Claims de desconto / audiência / período — **CHECKPOINT**

| Claim | Onde | Lastro no código | Veredito |
|-------|------|------------------|----------|
| **“50% OFF para membros Patinha — Desconto aplicado automaticamente”** | Badge + preço riscado | Preço “cheio” = `mensal * 2` (R$ 79,60) inventado na UI; checkout não aplica cupom; sempre `partner_basic` | ❌ **CHECKPOINT** — manter só com política comercial + preço âncora real no LastLink |
| Badge **-20%** no toggle anual | Toggle | Preço anual R$ 238,80 vs 12× R$ 39,80 = R$ 477,60 → **~50%**, não 20%; e payload **ignora** período | ❌ inconsistente + cosmético |
| Economia anual com base em `mensal * 2 * 12` | Card | Usa preço cheio fictício 2× | ❌ infla economia |
| **“Milhares de Tutores”** | `page.tsx` metadata/OG | Sem contagem pública; admin tem stats internas não expostas | ❌ **CHECKPOINT** — reescrever sem número |
| “Planos a partir de R$ 39,80” (plural) | metadata | UI = **um** plano | ⚠️ singular “Plano a partir de…” |
| R$ 39,80 / R$ 238,80 | UI | Constantes locais; LastLink slug único `partner_basic` | ⚠️ preço anual na UI sem planType anual = **CHECKPOINT** se quiser vender anual de verdade |
| “Cancelamento grátis” | Trust line | Alinhado ao modelo assinatura / LastLink; sem multa no app | ✅ tom ok; detalhar “via LastLink” |
| “Pagamento seguro via LastLink” | Trust line | Checkout real LastLink | ✅ |
| “Seja o Primeiro que os tutores encontram” | H1 | Ordenação prioriza premium | ⚠️ aspiracional; evitar “garantido” |

**Prova recomendável (só mecanismos reais):**

- Screenshot ou frame real do card com selo Premium (sem fabricar volume).
- “Como funciona: 1) assina 2) webhook marca destaque 3) aparece no topo da lista da cidade”.
- FAQ: cancelamento LastLink; listagem free vs destaque pago; WhatsApp só no Premium.
- Remover ou lastrear 50% OFF / milhares / toggle anual cosmético.

---

### 2.7 Superfícies adjacentes (impacto na confiança das páginas de venda)

| Superfície | Claim | Nota |
|------------|-------|------|
| Dashboard CTA Premium | “alertas de vacinas… por R$ 19,90” | Repete overclaim de alertas exclusivos |
| `/conta/assinatura` | “Gerenciar assinatura” → LastLink | Prova de gestão externa — citar nas páginas de venda |
| Admin convite WhatsApp | “milhares de tutores” + “50% OFF” | Mesmo overclaim em outbound — **CHECKPOINT** de consistência de marca |
| Home tagline / Navbar “Cuidados premium” | Ambiguidade de plano | Alinhar glossário |

---

## 3. Riscos e dependências

| Tipo | Item | Impacto se ignorado |
|------|------|---------------------|
| **Overclaim feature** | Alertas listados PRO sem gate | Tutor free recebe lembrete → “paguei por algo grátis” ou free se sente enganado pela tabela |
| **Overclaim desconto** | 50% OFF / preço 2× / -20% anual parceiro | Desconfiança regulatória e de marca (**CHECKPOINT**) |
| **Overclaim audiência** | “Milhares de Tutores” | SEO/social enganoso (**CHECKPOINT**) |
| **Checkout vs UI** | Toggle anual parceiro cosmético | Cobrança percebida errada |
| **Auth UX tutor** | 401 → erro “Unauthorized” | Sensação de produto quebrado no momento de pagar |
| **Operacional** | SLA 48h + e-mail Resend domínio onboarding | Quebra promessa pós-cadastro |
| **Webhook parceiro** | Premium só ativa se e-mail casar com `partners` | Upsell “destaque hoje” falha silenciosamente |
| **Env LastLink** | Slugs vazios → checkout 500 | Confiança zero no pagamento |
| **Dependência legal-comercial** | Qualquer preço, % OFF, planType, claim numérico | Veto do squad até ok humano |
| **Fora de escopo** | Depoimentos, cases, “X clínicas”, NPS | Não inventar |

---

## 4. Recomendações priorizadas

| # | Ação | Impacto confiança | Esforço | Critério de aceite | Notas |
|---|------|-------------------|---------|--------------------|-------|
| 1 | **Alertas:** (A) tirar da coluna só-PRO e listar free, **ou** (B) gatear cron/push/e-mail por assinatura tutor ativa | **Alto** | Médio (B) / Baixo (A) | Tabela `/planos` e dashboard batem com `vaccine-reminders` | Preferir verdade do produto atual (A) se gate for backlog |
| 2 | Parceiro: **CHECKPOINT** 50% OFF — manter com âncora real no LastLink **ou** remover badge + preço riscado 2× | **Alto** | Baixo (UI) | Nenhuma % sem política documentada | Humano decide |
| 3 | Parceiro: alinhar período — remover toggle/badge anual **ou** planType anual real + slug (**CHECKPOINT**) | **Alto** | Médio | UI = payload = cobrança | Ver audit step-02 |
| 4 | Metadata: remover **“Milhares de Tutores”**; “planos” → “plano” | **Alto** | Baixo | SEO sem claim numérico | **CHECKPOINT** se quiser número real instrumentado depois |
| 5 | Tutor `/planos`: trust line LastLink + “cancele em Gerenciar assinatura / LastLink” | **Médio** | Baixo | FAQ/CTA explicam **como** cancelar | Prova de processo, não depoimento |
| 6 | Paywall `/comparar`: preço a partir de R$ 19,90 + 1–2 bullets **só lastreados** | **Médio** | Baixo | Sem alertas exclusivos até item 1 | |
| 7 | Home/cadastro: glossário “grátis para começar · Premium opcional”; cadastro “passo 1 · sem cartão” | **Médio** | Baixo | Visitante não acha que pagamento é obrigatório | |
| 8 | Cadastro parceiro: label **Negócio**; teaser free vs Premium; não prometer e-mail se envio falhar | **Médio** | Baixo | Label correta; copy condicional | |
| 9 | Features refeições/atividades: microcopy “ver dias anteriores” em vez de só “histórico completo” se quiser máxima precisão | **Baixo–Médio** | Baixo | Expectativa = UX real | |
| 10 | Corrigir typos/acentos (Planos + “atrairá”) | **Baixo** | Baixo | pt-BR correto | Higiene |
| 11 | Parceiro hero: CTA âncora `#planos` + microcopy “destaque no mapa (selo + topo da lista + WhatsApp)” | **Médio** | Baixo | Benefícios = features implementadas | |
| 12 | **Não fazer:** depoimentos fake, contador inventado, tiers B2B com métricas, “garantia de clientes” | — | — | — | Veto prova social inventada |

### Matriz impacto × esforço (prova/confiança)

```
        IMPACTO CONFIANÇA
        Baixo        Médio              Alto
ESFORÇO
Baixo   | Typos      | Trust LastLink   | Tirar milhares / 50% OFF UI
        |            | Glossário free   | Alertas copy (opção A)
        |            | Paywall preço    | Label Negócio
────────|────────────|──────────────────|────────────────────────
Médio   |            | FAQ cancelar     | Gate alertas (opção B)
        |            |                  | Toggle anual real/remover
────────|────────────|──────────────────|────────────────────────
Alto    |            |                  | Painel métricas parceiro
                                        | (não prometer até existir)
```

---

## 5. Próximos passos

1. **Checkpoint humano (bloqueante para copy de desconto/audiência):**  
   - Manter, recalcular ou remover **50% OFF** parceiro?  
   - Existe produto/slug **anual** parceiro no LastLink?  
   - Pode-se publicar **algum** número de tutores/parceiros com fonte admin?

2. **Decisão produto alertas:** exclusivos Premium (implementar gate) **ou** benefício free (corrigir `/planos` + dashboard + metadata planos).

3. **step-04 (experiment backlog):** empacotar quick wins de prova sem inventar social proof: trust lines, glossário free/pago, paywall com preço, remoção de overclaims, auth redirect tutor (já no audit).

4. **Validação operacional:** Resend domínio de envio; taxa de ativação premium parceiro quando e-mail não casa; slugs LastLink em produção.

5. **Quando houver dados reais:** instrumentar contagem pública (ex. “X tutores ativos este mês”) com definição clara e atualização — nunca placeholder.

---

## Apêndice A — Checklist de objeções × resposta honesta sugerida

| Objeção | Resposta honesta (microcopy base) | Onde usar |
|---------|-----------------------------------|-----------|
| É grátis? | “Sim. Conta e 1 pet grátis. Premium é opcional.” | Home, cadastro |
| O que pago desbloqueia? | Lista só features com gate: pets+, histórico >7 dias, dias anteriores refeição/atividade, comparar | Planos, comparar |
| Posso cancelar? | “Sim, pela área de membros LastLink. Sem multa no Patinha.” | Planos, premium parceiro |
| Pagamento é seguro? | “Checkout pela LastLink (processador de pagamento).” | Planos, premium |
| Alertas de vacina? | **Depende decisão item 1** — hoje o sistema pode lembrar free também | Não vender como exclusivo até gate |
| Vou ser o #1 no mapa? | “Parceiros Premium sobem na lista e ganham selo e WhatsApp.” | Premium parceiro |
| Quantos tutores? | Não afirmar número sem lastro | Metadata, admin outbound |
| 50% OFF? | Só se campanha real; senão remover | Premium parceiro |

---

## Apêndice B — Claims que exigem **CHECKPOINT** de negócio

| Claim | Local | Ação mínima se não houver ok |
|-------|-------|------------------------------|
| **50% OFF** / desconto automático / preço riscado 2× | `PremiumClient.tsx`, admin convite WA | Remover badge e risco |
| **-20%** anual parceiro | Toggle Premium | Remover ou recalcular com produto real |
| Preço anual R$ 238,80 sem planType anual | UI vs checkout | Remover seletor ou criar produto |
| **Milhares de Tutores** | metadata premium + templates admin | “Tutores na sua região” / “rede Patinha” sem número |
| Qualquer mudança R$ 19,90 / 115 / 39,80 | Planos / Premium | Checkpoint |
| Alertas como exclusivo PRO (se quiser manter exclusividade) | Planos + dashboard | Implementar gate ou reclassificar |

---

## Apêndice C — Mecanismos de prova permitidos neste produto (catálogo)

| Mecanismo | Status hoje | Uso em copy |
|-----------|-------------|-------------|
| Lista de features com gate no código | Parcial (alertas furados) | Primário |
| Preço público alinhado a constantes/LastLink | Tutor ok; parceiro período frágil | Primário |
| FAQ cancelamento / dados | Tutor sim; parceiro fraco | Primário |
| Nome do processador (LastLink) | Parceiro sim; tutor não | Expandir para tutor |
| Fluxo de gestão de assinatura (`/conta/assinatura`) | Existe | Citar |
| Selo/sort/WhatsApp no mapa | Existe | Parceiro |
| Screenshot real do app | Não nas páginas de venda | Adicionar sem fabricar UI |
| Contagem instrumentada de usuários | Admin interno only | Só com checkpoint + definição |
| Depoimentos / logos clientes | Inexistentes | **Não inventar** |
| Selos PCI genéricos / “garantia de resultado” | N/A | Evitar |

---

*Fim do mapa step-03. Saída: `squads/sales-page-optimizer/output/2026-07-23-091955/v1/messaging-proof-map.md`.*
