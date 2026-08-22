# Patinha — caminho do cliente, go-live e beta

Atualizado: 2026-08-09  
Uso: guia operacional (não é parecer jurídico).

---

## 2) Teste do caminho do cliente (happy path)

Objetivo: uma pessoa real consegue **criar conta → cadastrar pet → usar o free → assinar → virar Premium**.

### Pré-requisitos do ambiente de teste

| Item | Esperado |
|------|----------|
| Deploy ou local com **OPEN_ACCESS=false** | Login de verdade |
| Supabase (URL + anon + service role) | OK |
| LastLink (slugs + webhook token) | OK |
| Resend (API key + domínio) | OK |
| Produtos na tabela `lastlink_products` | IDs batem com a LastLink |
| Webhook LastLink apontando pro deploy | `POST /api/lastlink/webhook` + header `x-webhook-token` |

### Roteiro A — Tutor free

| # | Passo | Onde | Passa se… |
|---|--------|------|-----------|
| A1 | Abrir home | `/` | Carrega sem erro |
| A2 | Criar conta | `/cadastro` | Conta criada; e-mail de confirmação (se habilitado no Supabase) |
| A3 | Login | `/login` | Entra no app |
| A4 | Onboarding pet | `/onboarding` | Pet salvo; vai pro hub/dashboard |
| A5 | Dashboard | `/dashboard` | Nome, peso, atalhos ok |
| A6 | Ração | `/racao` | Sugestões e checklist do dia |
| A7 | Atividades | `/atividades` | Lista e perfil do pet |
| A8 | Vida | `/vida` | Marcos / vacinas |
| A9 | Mapa | `/mapa` | Mapa carrega (mesmo com poucos parceiros) |
| A10 | 2º pet free | seletor / onboarding | **Bloqueia** e manda pra `/planos` (limite free = 1 pet) |

### Roteiro B — Tutor paga Premium

| # | Passo | Onde | Passa se… |
|---|--------|------|-----------|
| B1 | Abrir planos | `/planos` | Preços e benefícios claros |
| B2 | Clicar assinar | botão checkout | Redireciona LastLink (ou URL de checkout) |
| B3 | Pagar (teste real ou sandbox LastLink) | LastLink | Compra aprovada |
| B4 | Webhook chega | logs servidor / Supabase | Evento processado sem 401/500 |
| B5 | Assinatura no banco | tabela de subscription | `plan` + status ativo pro e-mail do comprador |
| B6 | Tela sucesso | `/checkout/sucesso` | Mostra Premium ativo (pode precisar refresh) |
| B7 | App libera | `/dashboard`, seletor de pets | `isPremium=true`; pode adicionar 2º pet |
| B8 | Histórico PRO | ração/atividades “dia anterior” | Deixa de bloquear com PRO |
| B9 | Comparar | `/comparar` | Acessível no Premium (se gateado) |
| B10 | Conta | `/conta/assinatura` | Mostra plano e status |

### Roteiro C — Falhas que você DEVE testar

| # | Cenário | Passa se… |
|---|---------|-----------|
| C1 | Webhook com token errado | 401 / rejeita |
| C2 | Compra com e-mail **diferente** da conta | Definir comportamento (ideal: instruir usar o mesmo e-mail) |
| C3 | Logout e login de novo | Premium continua ativo |
| C4 | Rota protegida sem login | Redireciona `/login?next=…` |
| C5 | `/admin` com e-mail não-admin | Bloqueia |

### Resultado do teste (preencher)

| Data | Ambiente | A free | B premium | C falhas | Notas |
|------|----------|--------|-----------|----------|-------|
| 2026-08-09 | local `next start` + **OPEN_ACCESS=true** | ⚠️ parcial (smoke HTTP/conteúdo) | ❌ não rodado (pagamento) | ⚠️ parcial | Ver “Smoke automático” abaixo |
| 2026-08-20 | local `next start` + **OPEN_ACCESS=false** | ⚠️ cadeado L1–L4 PASS (redirect login). Roteiro A cadastro/pet ⏭ se não houver conta de teste | ❌ não rodado (pagamento fora desta fatia) | ⚠️ L1–L4 | Cadeado de Production no código (`isOpenAccess`) |

### Smoke automático (2026-08-09, free path sem login real)

**Contexto:** `OPEN_ACCESS=true` e `NEXT_PUBLIC_OPEN_ACCESS=true` → rotas protegidas **não** exigem login neste ambiente. Não valida cadastro real, onboarding com banco, nem limite de 2º pet na UI.

| Item | Resultado |
|------|-----------|
| Home `/` | ✅ PASS 200 + conteúdo |
| Login `/login` | ✅ PASS 200 + conteúdo |
| Cadastro `/cadastro` | ✅ PASS 200 + conteúdo |
| Planos `/planos` | ✅ PASS 200 + conteúdo |
| Dashboard `/dashboard` | ✅ PASS 200 + conteúdo |
| Onboarding `/onboarding` | ✅ PASS 200 + conteúdo |
| Ração `/racao` | ✅ PASS 200 + conteúdo |
| Atividades `/atividades` | ✅ PASS 200 + conteúdo |
| Vida `/vida` | ✅ PASS 200 + conteúdo |
| Mapa `/mapa` | ✅ PASS 200 + conteúdo |
| Comparar `/comparar` | ✅ PASS 200 + conteúdo |
| Política / Termos | ✅ PASS 200 + conteúdo |
| Ícones hub (PNG Thiings) | ✅ PASS 200 |
| `GET /api/subscription` | ✅ PASS → `isPremium:false` |
| `GET /api/servicos?cidade=...` | ✅ PASS após copiar env real do projeto `seabiscuit` (Supabase `npqrhqivzaeprkpdhglu`). Ex.: São Paulo → 3 serviços; Belém/Salvador/Brasília → 1. |
| Cadastro real + login | ⏭ não executado (precisa e-mail/senha e OPEN_ACCESS=false) |
| Onboarding pet no banco | ⏭ não executado |
| Limite 1 pet free | ⏭ código existe (`lib/store.ts`); UI não exercitada |
| Premium / webhook | ⏭ não executado |
| Redirect sem login (middleware) | ⏭ **não testável** com OPEN_ACCESS=true |

---

## 1) Checklist de go-live (antes do 1º cliente pago em massa)

### Bloqueadores (vermelho) — sem isso, não anuncia

- [ ] **OPEN_ACCESS** e **NEXT_PUBLIC_OPEN_ACCESS** = `false` (ou ausentes) no deploy público  
- [ ] Variáveis de produção preenchidas (Supabase, LastLink, Resend, Firebase se push, ADMIN_EMAILS)  
- [ ] Webhook LastLink em **produção** testado (roteiro B)  
- [ ] `lastlink_products` confere com produtos reais  
- [ ] HTTPS no domínio final (ex.: `patinha.app.br` ou Vercel)  
- [ ] Login / cadastro / recuperar senha funcionando no domínio real  
- [ ] RLS revisada (tutor só vê os próprios pets)  
- [ ] Termos e Política acessíveis no rodapé e coerentes com o produto  
- [ ] Canal de suporte (e-mail ou WhatsApp) publicado  
- [ ] Decisão **ícones Thiings**: licença Indie **ou** troca dos proibidos (ver `docs/auditoria-icones-3d.md`). No beta: atribuição visível no rodapé; **não substitui** Indie na loja aberta.

### Importantes (amarelo) — beta ok, escala não

- [ ] E-mail saindo de domínio autenticado (SPF/DKIM)  
- [ ] Push FCM testado em 1 aparelho real  
- [ ] Cron de lembrete de vacina agendado (se usar em produção)  
- [ ] Monitoramento de erro (ex.: Sentry)  
- [ ] Backup / export mental: “como apago conta do tutor?” (LGPD)  
- [ ] Mapa com parceiros reais na cidade piloto (ou aviso de “em expansão”)  
- [ ] Página de planos sem prometer o que o free já faz (vacina etc.)  
- [ ] Remover ou proteger rotas internas de dev (ver seção 3)

### Polimento (verde) — pode ir depois

- [ ] Onboarding mais curto  
- [ ] Empty states com texto acolhedor  
- [ ] Analytics (Meta Pixel etc.) só com consentimento  
- [ ] Performance de imagens 3D (compressão PNG)  
- [ ] App instalável / PWA se fizer sentido  

### Assinatura de go-live

| Papel | Nome | Data | OK? |
|-------|------|------|-----|
| Produto | | | ☐ |
| Técnico | | | ☐ |
| Pagamentos | | | ☐ |

---

## 3) Só beta — o que liberar e o que esconder

### Beta fechado (recomendado agora)

**Liberar para 10–50 tutores convidados**

| Área | Liberar? | Como |
|------|----------|------|
| Cadastro / login | ✅ | Link direto; sem ads em massa |
| 1 pet free | ✅ | Núcleo do produto |
| Dashboard, ração, atividades, vida | ✅ | Core |
| Mapa | ✅ com aviso | “Parceiros ainda em expansão na sua cidade” |
| Planos / checkout | ⚠️ opcional | Só se webhook B já passou; senão esconder CTA forte |
| Comparar / multi-pet | ⚠️ | Só se Premium de teste estiver ok |
| Parceiro (vet/petshop) | ⚠️ separado | Beta B2B depois do tutor |
| Admin | ❌ público | Só e-mails em `ADMIN_EMAILS` |

**Esconder / não divulgar no beta**

| Rota ou coisa | Por quê / status |
|---------------|------------------|
| `/preview-icones` | Design — **middleware**: só OPEN_ACCESS ou admin |
| `/conferir` | QA de rotas — **middleware**: só OPEN_ACCESS ou admin |
| `/api/test-email` | Teste Resend — **já exige admin** |
| `OPEN_ACCESS=true` | Abre o app sem login — **nunca em prod** |
| Marketing pago agressivo | Ainda não “loja aberta” |
| Prometer cobertura nacional de mapa | Dados locais ainda limitados |

### Mensagem sugerida pro beta

> “Você está no **beta do Patinha**. O app já cuida do dia a dia do pet (ração, atividades, linha do tempo). Algumas cidades ainda têm poucos parceiros no mapa. Feedback: [e-mail/WhatsApp].”

### O que pedir de feedback

1. Conseguiu cadastrar pet em menos de 5 minutos?  
2. O que mais usou no primeiro dia?  
3. O que confundiu?  
4. Pagaria o Premium por quê / por que não?  

### Depois do beta (critérios pra “abrir mais”)

- [ ] Roteiro A 100% sem bugs graves  
- [ ] Roteiro B ok em produção (1 compra teste)  
- [ ] Zero `OPEN_ACCESS` em prod  
- [ ] Suporte respondendo em &lt; 24h no beta  
- [ ] Licença de ícones resolvida  

---

## Ordem prática desta semana

```
Dia 1–2  →  Rodar roteiro A (free) no deploy de staging/prod
Dia 2–3  →  Rodar roteiro B (1 pagamento teste) + C1–C3
Dia 3    →  Marcar checklist vermelho
Dia 4    →  Convidar 10 beta (só free ou free+premium se B ok)
Dia 5+   →  Coletar feedback; só então ads / mais escala
```

---

## Referências no código

| Tema | Onde |
|------|------|
| Login obrigatório | `middleware.ts` (`protectedRoutes`, `OPEN_ACCESS`) |
| Limite 1 pet free | `lib/store.ts` (`isPremium` + addPet) |
| Checkout | `app/api/lastlink/checkout`, `app/planos` |
| Webhook Premium | `app/api/lastlink/webhook` |
| Sucesso pós-compra | `app/checkout/sucesso` |
| Ícones / licença | `docs/auditoria-icones-3d.md` |
| Parceiro — cadastro | `app/parceiros/cadastro`, `app/api/parceiros/cadastro` |
| Parceiro — planos | `app/parceiros/premium`, slugs `LASTLINK_PARTNER_*` |
| Parceiro — painel | `app/parceiro/dashboard`, `lib/partner.ts` |
| Parceiro — convites admin | `app/parceiros/convites`, `app/admin/parceiros` |

---

## Parceiro pet (B2B) — caminho do cliente + atenção

### Mapa do funil parceiro

```
/parceiros/cadastro  →  lead no banco (partners)
        ↓
/parceiros/premium   →  LastLink (basic / pro / enterprise)
        ↓
Webhook  →  subscription partner + premium/destaque no mapa
        ↓
/parceiro/dashboard  →  perfil, métricas, assinatura
```

Admin: convites WhatsApp em `/parceiros/convites` + fila em `/admin/parceiros`.

### Roteiro D — Parceiro free / listagem

| # | Passo | Passa se… |
|---|--------|-----------|
| D1 | Abrir `/parceiros/cadastro` | Página 200 + formulário |
| D2 | Enviar cadastro logado | Linha em `partners` (status coerente) |
| D3 | Aparecer no `/mapa` na cidade | Card visível (sem selo Premium se free) |
| D4 | Conta sem partner em `/parceiro/dashboard` | Mensagem “não é parceiro” + link cadastro |

**Smoke 2026-08-10 (local):** D1 rotas `/parceiros/cadastro`, `/parceiros/premium`, `/parceiros/convites`, `/parceiro/dashboard` → HTTP 200 (OPEN_ACCESS=true). Cadastro real + mapa com partner novo → ⏭ precisa login/banco.

### Roteiro E — Parceiro Premium

| # | Passo | Passa se… |
|---|--------|-----------|
| E1 | Login + `/parceiros/premium` | Planos Básico/Pro/Empresarial |
| E2 | Checkout LastLink | Redirect com slug `partner_basic` / `pro` / `enterprise` |
| E3 | Webhook com token | 200; `subscriptions` com `plan_category=partner` |
| E4 | `partners.premium` / `destaque` | Basic: premium sem destaque; Pro/Enterprise/annual: premium+destaque |
| E5 | `/parceiro/dashboard` | Assinatura ativa + métricas |
| E6 | Mapa | Selo/prioridade conforme plano |

### Env parceiro (status local 2026-08-10)

| Variável | Status |
|----------|--------|
| `LASTLINK_PARTNER_BASIC_SLUG` | Preenchido |
| `LASTLINK_PARTNER_PRO_SLUG` | Preenchido |
| `LASTLINK_PARTNER_ENTERPRISE_SLUG` | Preenchido |
| `LASTLINK_PARTNER_ANNUAL_SLUG` | **VAZIO** (se UI/oferta anual parceiro existir, completar) |
| `LASTLINK_WEBHOOK_TOKEN` | **VAZIO** (bloqueia E3–E6) |
| `LASTLINK_CHECKOUT_URL` | Preenchido |

### Vermelho parceiro (atenção)

1. Mesmo webhook LastLink do tutor (**MAS-7**) — sem ele nenhum Premium parceiro libera  
2. Produtos LastLink + linhas `lastlink_products` batendo com `partner_basic` / `pro` / `enterprise` (/annual se usar)  
3. OPEN_ACCESS off em prod — painel `/parceiro` e checkout exigem conta real  
4. Deploy + APP_URL — redirects de checkout e e-mails  
5. Processo de aprovação: cadastro free entra no mapa automático ou só após admin?  
6. Conteúdo comercial B2B (página premium, convites WhatsApp) revisado  

### Amarelo parceiro

- Teste E ponta a ponta com 1 clínica piloto  
- Métricas `/api/parceiro/metrics` com track de views/WhatsApp  
- Convites admin: fila real de e-mails/WhatsApp  
- Separar conta tutor vs parceiro no mesmo e-mail (já suportado em `planCategory`)  
- SLA de suporte B2B  

### Linear

Epic parceiro e subtarefas: **[MAS-35](https://linear.app/massini/issue/MAS-35)** (filhos MAS-36…MAS-42).  
Webhook compartilhado com tutor: **MAS-7**.

---

## Admin (staff) — operação interna

### O que o painel faz (e faz sentido)

| Rota | Função |
|------|--------|
| `/admin` | Dashboard: tutores, pets, assinaturas, mapa 30d, parceiros |
| `/admin/parceiros` | Lista, e-mail, convite WhatsApp, import seed, fila contato |
| `/admin/usuarios` | Tutores / contas |
| `/admin/feedback` | Feedback dos tutores |
| APIs `/api/admin/*` | stats, partners, import, feedback, usuarios (devem checar `isAdmin`) |

### O que **não** deve ser público (e o que fizemos)

| Item | Decisão |
|------|---------|
| `/conferir` | Mantido para QA, **bloqueado** sem OPEN_ACCESS e sem admin |
| `/preview-icones` | Mantido para design, **bloqueado** sem OPEN_ACCESS e sem admin |
| `/api/test-email` | Mantido (útil p/ Resend), **já exige admin** — não expor link no site |
| OPEN_ACCESS em prod | **Nunca** — senão admin e app abrem sem login |

### Atenção admin (sua)

1. Preencher **`ADMIN_EMAILS`** no env de produção (local ainda tem fallback no código: `massini.guih@gmail.com`)
2. Validar cada API admin com conta não-admin → 401/redirect
3. Testar import parceiros + convite WhatsApp com 1 clínica
4. Dashboard stats com Supabase real (já configurado local)
5. Não linkar `/conferir` nem `/preview-icones` no Navbar/Footer público

### Roteiro F — Admin smoke

| # | Passo | Passa se… |
|---|--------|-----------|
| F1 | Login com e-mail em ADMIN_EMAILS | Entra em `/admin` |
| F2 | Login com e-mail comum | Redireciona para `/dashboard` |
| F3 | OPEN_ACCESS=false, visitante em `/conferir` | Login ou fora |
| F4 | Dashboard stats | Números carregam (sem erro) |
| F5 | Parceiros: listar / editar e-mail / WhatsApp | OK |
| F6 | test-email admin | 200 com `?to=` |

### Linear

Epic admin: **[MAS-43](https://linear.app/massini/issue/MAS-43)** (filhos de smoke/ops).  
Rotas dev (MAS-17): coberto pelo middleware — pode marcar Done.
