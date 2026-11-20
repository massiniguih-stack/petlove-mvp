# Admin — Visão geral com análise (etapa 1 de 3)

Data: 2026-11-20
Status: aprovado em conversa, aguardando revisão do documento

## Contexto

A Visão geral do admin (`app/admin/page.tsx`) mostra só totais soltos, sem linha do
tempo. Não dá para ver se tutores e empresas estão entrando, nem quantos passam de grátis
para pago.

O banco guarda apenas o **estado atual** das assinaturas (`subscriptions` tem uma linha
por usuário e categoria, sobrescrita a cada webhook). Por isso não existe histórico de
quando alguém virou pago, cancelou ou quando uma empresa ativou o painel.

## Plano geral do admin (3 etapas)

O admin passa a ser organizado por tarefa:

```
Visão geral   → análise: abas Tutores | Empresas          (etapa 1 — este documento)
Empresas      → Lista · Prospecção · Aprovações · Importar  (etapa 2 — documento próprio)
Tutores       → lista com grátis/pago, entrada, origem, pets (etapa 3 — documento próprio)
Feedback      → comentários + tendência de satisfação        (etapa 3)
```

A etapa 1 também define o padrão visual (cartões, cores, gráficos) que as etapas 2 e 3
reaproveitam. Este documento cobre só a etapa 1.

## Objetivo da etapa 1

1. Começar a registrar, a partir da migração, cada mudança relevante de tutores e
   empresas num diário de eventos.
2. Reconstruir o passado com o que existe, marcando o que for aproximado.
3. Refazer a Visão geral com filtro de período, gráficos de entrada, crescimento e funis
   de conversão, separados em abas Tutores e Empresas.

Fora do escopo: mudanças nas páginas Parceiros, Usuários e Feedback (exceto o item de
menu, que continua igual), novos eventos além dos listados, receita ao longo do tempo,
comparação por cidade.

## Parte A — Diário de eventos

### Tabela `public.admin_eventos`

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `ocorrido_em` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `publico` | `text` | `NOT NULL`, `CHECK (publico IN ('tutor','empresa'))` |
| `tipo` | `text` | `NOT NULL`, um dos tipos abaixo (`CHECK`) |
| `entidade_id` | `uuid` | `NOT NULL` — `tutor.id` (= `auth.users.id`) ou `partners.id` |
| `detalhe` | `jsonb` | `NOT NULL DEFAULT '{}'` |
| `estimado` | `boolean` | `NOT NULL DEFAULT false` — `true` só na reconstrução |

Índices: `(publico, ocorrido_em)` e `(tipo, entidade_id)`.

Índice único parcial para eventos que só acontecem uma vez por entidade:
`UNIQUE (tipo, entidade_id) WHERE tipo IN ('tutor_entrou','empresa_entrou_mapa','empresa_convidada','empresa_ativou_painel')`.
Inserções desses tipos usam `ON CONFLICT DO NOTHING`. Isso garante que reenviar o
WhatsApp depois de "zerar" a fila não gera um segundo convite, e que a migração pode
rodar de novo sem duplicar.

RLS ativado **sem nenhuma policy**: só a service role (servidor) lê e escreve. Nenhum
acesso para `anon` ou `authenticated`.

### Tipos de evento e gatilhos

| Tipo | Gatilho | `detalhe` |
|---|---|---|
| `tutor_entrou` | `AFTER INSERT ON tutor` | `{utm_source, utm_medium, utm_campaign}` |
| `tutor_virou_pago` | `AFTER INSERT OR UPDATE OF status ON subscriptions`, categoria tutor, status novo em `('active','trialing')` e antigo fora disso (ou INSERT) | `{plan_type}` |
| `tutor_cancelou` | mesmo gatilho, status antigo em `('active','trialing')` e novo fora disso | `{plan_type, status}` |
| `empresa_entrou_mapa` | `AFTER INSERT ON partners` | `{origem: 'cadastro_proprio' \| 'importada', lote: partners.origem, tipo: partners.tipo}` |
| `empresa_convidada` | `AFTER UPDATE ON partners` quando `status` passa a `'sent'` ou `whatsapp_contatado_em` passa de `NULL` a um valor | `{canal: 'email' \| 'whatsapp'}` |
| `empresa_ativou_painel` | `AFTER UPDATE OF user_id ON partners` quando passa de `NULL` a um valor | `{}` |
| `empresa_virou_paga` | gatilho de `subscriptions`, categoria partner, mesma regra do tutor | `{plan_type}` |
| `empresa_cancelou` | gatilho de `subscriptions`, categoria partner, mesma regra do tutor | `{plan_type, status}` |

Regras:

- **Categoria da assinatura:** `plan_category`, ou, se nula, `'partner'` quando
  `plan_type LIKE 'partner_%'`, senão `'tutor'` (mesma regra de
  `app/api/admin/dashboard-stats/route.ts`).
- **Empresa nas assinaturas:** `subscriptions.user_id` é o usuário de login. O gatilho
  procura `partners.id` por `partners.user_id = NEW.user_id`. Se não achar, grava com
  `entidade_id = NEW.user_id` e `detalhe.sem_partner = true` (o webhook às vezes chega
  antes do vínculo).
- **Origem da empresa:** `cadastro_proprio` quando `NEW.status` é `'new_signup'` ou
  `'ativo'` (`AWAITING_REVIEW_STATUS` / `APPROVED_STATUS` de `lib/partnerReview.ts`),
  senão `importada`.
- **Nunca bloquear a operação principal:** cada função de gatilho envolve o `INSERT` em
  `BEGIN … EXCEPTION WHEN OTHERS THEN RAISE WARNING … END` e sempre retorna `NEW`.
- Funções `SECURITY DEFINER` com `SET search_path = public`.
- Contas da equipe **são** registradas. A exclusão acontece na leitura (Parte C), como já
  é feito hoje.

### Reconstrução do passado

Roda uma vez, no fim da migração, com `estimado = true` e `ON CONFLICT DO NOTHING`.

| Evento | Fonte da data | Qualidade |
|---|---|---|
| `tutor_entrou` | `tutor.created_at` | exata |
| `tutor_virou_pago` / `empresa_virou_paga` | `subscriptions.created_at` das linhas com status premium | aproximada |
| `tutor_cancelou` / `empresa_cancelou` | `subscriptions.updated_at` das linhas `canceled`/`expired` | aproximada |
| `empresa_entrou_mapa` | `partners.created_at` | exata |
| `empresa_convidada` | o menor entre `partners.sent_at` e `partners.whatsapp_contatado_em` | exata |
| `empresa_ativou_painel` | `auth.users.created_at` do `partners.user_id` | aproximada |

A reconstrução só cria eventos de pagamento/cancelamento quando ainda não existe
nenhum evento desse tipo para a entidade, o que evita duplicar ao rodar de novo.

As tabelas `tutor` e `partners` foram criadas fora de `supabase/migrations/`. Por isso a
migração começa com uma checagem: se faltar alguma coluna usada (por exemplo
`partners.created_at`, `partners.origem`, `partners.sent_at`), ela para com a mensagem
"Faltam colunas: …" sem mudar nada. Tudo roda dentro de `BEGIN … COMMIT`.

As assinaturas `canceled`/`expired` também ganham um `virou_pago` estimado (na data de
criação), porque só se cancela o que já foi pago. A origem das empresas antigas é
`cadastro_proprio` quando o status é `new_signup` ou `ativo` (cadastro aprovado), senão
`importada`. O gatilho ao vivo usa a mesma regra.

Arquivo: `supabase/migrations/20261120_admin_eventos.sql`, rodado à mão no SQL editor.

### Modo exemplo (só local)

Para conferir a tela localmente sem as chaves do Supabase, a rota devolve dados
fictícios quando `isOpenAccess()` e `ANALISE_EXEMPLO=1` estão ligados.
`isOpenAccess()` é sempre falso em produção na Vercel, então esse modo nunca expõe nada
lá, e os dados são inventados.

## Parte B — Tela

### Topo (compartilhado)

- Título "Visão geral" e filtro de período: `7 dias`, `30 dias` (padrão), `90 dias`,
  `Tudo`.
- **Faixa da Fila de hoje:** uma linha clicável com os itens de `montarFilaHoje`
  (`lib/admin/filaHoje.ts`). Some quando não há itens.
- Abas `Tutores` (padrão) e `Empresas`.
- Aba e período ficam no endereço: `/admin?aba=empresas&periodo=90d`. Valores inválidos
  caem no padrão.

### Agrupamento e comparação

- Agrupamento automático: 7d e 30d → dia; 90d → semana (segunda a domingo); Tudo → mês.
- Todas as datas são convertidas para `America/Sao_Paulo` antes de agrupar.
- Cada número-chave de período mostra a variação contra o período anterior de mesmo
  tamanho (▲/▼ em %). Se o período anterior for 0, mostra "novo" no lugar da %. Em
  "Tudo" não há comparação.

### Aba Tutores

| Bloco | Conteúdo |
|---|---|
| Números-chave | **Novos cadastros** (`tutor_entrou` no período) · **Viraram pagos** (`tutor_virou_pago` no período) · **Conversão da turma** (funil, último passo ÷ primeiro) · **Receita mensal** (MRR atual, com a tabela `PRECO_MENSAL` existente, só categoria tutor) com "−N cancelamentos no período" |
| Entradas | Barras por intervalo: cinza = cadastros, laranja = viraram pagos |
| Crescimento | Linha acumulada: base total de cadastros e de pagos (pagos − cancelamentos) ao fim de cada intervalo |
| Funil da turma | Cadastrou → cadastrou o 1º pet (menor `pet.created_at` do tutor) → pagou, só para os tutores com `tutor_entrou` dentro do período. % de cada passagem |
| Origem | Barras horizontais por `utm_source` (vazio = "Direto"): cadastros e pagos, considerando a turma do período |

### Aba Empresas

| Bloco | Conteúdo |
|---|---|
| Números-chave | **Entraram no mapa** (com divisão importadas · cadastro próprio) · **Convidadas** · **Ativaram painel** · **Pagas** — todos contando eventos no período — mais a **receita B2B** (MRR atual da categoria partner) |
| Entradas | Barras empilhadas por intervalo: importadas vs cadastro próprio, em cores diferentes |
| Funil da turma | No mapa → convidada → ativou painel → pagou, para as empresas com `empresa_entrou_mapa` no período, com % de cada passagem e divisão por origem |
| Por tipo | Ranking por `partners.tipo`: total no mapa e quantas pagas (estado atual) |
| Uso do mapa | Linhas por intervalo: visualizações (`partner_events.event_type = 'view'`) e cliques no WhatsApp (`'whatsapp_click'`) |

### Leitura honesta

- Quando o período inclui eventos `estimado = true`, aparece a nota "* inclui datas
  aproximadas de antes de <data da migração>".
- Quando o total de eventos do bloco no período é menor que 5, o gráfico é trocado pelo
  aviso "Poucos dados no período (N)", com o número.
- Estados de carregamento (esqueleto) e de erro seguem o padrão atual da página.

### Visual

- Mesma base atual: `slate` para estrutura e dados "grátis", `amber` (marca) para
  "pago". Uma terceira cor (`sky`) só para "cadastro próprio" das empresas.
- Modo escuro em todos os blocos. Funciona a partir de 360px de largura: os números-chave
  passam a 2 colunas e os gráficos ocupam a largura toda.
- Gráficos com Recharts (já instalado).

## Parte C — Arquitetura

```
admin_eventos, tutor, pet, partners, partner_events, subscriptions
        │  (service role, em lotes de 1000)
        ▼
GET /api/admin/analytics?periodo=30d   ← requireAdmin()
        │  chama funções puras de lib/admin/analytics/
        ▼
{ periodo, fila, tutores: {...}, empresas: {...}, temEstimado, desde }
        ▼
app/admin/page.tsx  →  components/admin/analytics/*
```

### Peças

| Arquivo | Responsabilidade |
|---|---|
| `lib/admin/analytics/periodo.ts` | Converte `7d/30d/90d/tudo` em intervalo atual + anterior + granularidade. Tudo começa no evento mais antigo |
| `lib/admin/analytics/agrupar.ts` | Cria os intervalos (dia/semana/mês em `America/Sao_Paulo`) e conta eventos por intervalo e série |
| `lib/admin/analytics/funil.ts` | Funil por turma: recebe a lista de entradas e as datas de cada etapa por entidade e devolve contagens e % |
| `lib/admin/analytics/variacao.ts` | Variação contra o período anterior (`{ pct } \| 'novo' \| null`) |
| `lib/admin/analytics/montar.ts` | Junta as peças em `tutores` e `empresas` a partir de dados brutos já carregados (sem banco) |
| `lib/admin/analytics/carregar.ts` | Leitura do Supabase com paginação (`range`) e exclusão da equipe (`ADMIN_EMAILS` → ids de tutor e de partners da equipe) |
| `app/api/admin/analytics/route.ts` | `requireAdmin`, valida `periodo` com zod, chama `carregar` + `montar` e devolve JSON |
| `components/admin/analytics/` | `PeriodoFiltro`, `FaixaFila`, `CartaoNumero` (com ▲▼), `GraficoEntradas`, `GraficoCrescimento`, `Funil`, `RankingBarras`, `GraficoUsoMapa`, `AvisoPoucosDados`, `AbaTutores`, `AbaEmpresas` |
| `app/admin/page.tsx` | Lê `aba`/`periodo` da URL, busca a rota e monta o topo e as abas |

A rota `app/api/admin/dashboard-stats/route.ts` deixa de ser usada pela página e é
removida. Os contadores da Fila de hoje passam para a nova rota, reaproveitando
`contarWhatsappPendentes` e `montarFilaHoje`.

Sem cache na rota: o volume é de poucos milhares de linhas, e o admin quer o número de
agora.

### Erros

- Usuário sem permissão: a resposta de `requireAdmin` é repassada como está.
- `periodo` inválido: 400 com mensagem.
- Falha numa consulta: 500 com `{ error }`, e a tela mostra a mensagem atual de erro.
- Tabela `admin_eventos` ausente (migração ainda não rodada): a rota devolve
  `{ error: 'Rode a migração 20261120_admin_eventos.sql no Supabase.' }` com 503, e a tela
  mostra esse texto.

## Testes

| O quê | Como |
|---|---|
| `periodo`, `agrupar`, `funil`, `variacao`, `montar` | Vitest em `lib/admin/analytics/*.test.ts`. Inclui: virada de dia em Brasília (23h30 local ≠ dia seguinte), semana começando na segunda, funil com turma vazia, entidade que pula etapa, período anterior zerado, exclusão da equipe, empresa sem partner (`sem_partner`) |
| Rota | Teste de que sem admin devolve 401/403 e `periodo` inválido devolve 400 (mesmo padrão de `app/api/lastlink/webhook/route.test.ts`) |
| Migração | Roteiro `docs/superpowers/specs/2026-11-20-admin-analise-verificacao.sql`: contagem por tipo/estimado, e um bloco `BEGIN … ROLLBACK` que insere um tutor e uma empresa de teste, muda status e confere os eventos criados |
| Tela | `npm run build && npm run start`, nos temas claro e escuro, em 360px e desktop, nas duas abas e nos 4 períodos |
| Dados reais | Depois do merge e da migração, conferir os números da aba Tutores contra a página Usuários |

## Critérios de pronto

- [ ] Migração roda no Supabase sem erro, e rodar de novo não duplica eventos.
- [ ] Um cadastro novo de tutor aparece no gráfico no mesmo dia.
- [ ] Um webhook de pagamento cria `tutor_virou_pago` ou `empresa_virou_paga`.
- [ ] Uma falha forçada no gatilho não impede o cadastro nem o webhook.
- [ ] As duas abas funcionam nos 4 períodos, nos dois temas e no celular.
- [ ] `npm test` e `npm run build` passam.
