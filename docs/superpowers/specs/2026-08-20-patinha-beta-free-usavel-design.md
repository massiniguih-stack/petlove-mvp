# Patinha — beta free usável (cadeado de produção)

Data: 2026-08-20  
Issue-mãe: [MAS-5](https://linear.app/massini/issue/MAS-5/patinha-mvp-o-que-ainda-precisa-da-atencao-go-live-beta)  
Fatia desta spec: trancar o app na Vercel de produção e validar o caminho free. Sem pagamento, sem domínio próprio, sem placas de vitrine.

## Decisões já tomadas (não reabrir nesta fatia)

| Decisão | Escolha |
|---------|---------|
| Formato do primeiro beta (~10 tutores) | Só free. Pagamento LastLink fica para depois (MAS-7 / MAS-13). |
| Endereço do convite | URL atual da Vercel (`patinha-mvp.vercel.app`). Domínio da marca (MAS-8) depois. |
| Recorte desta sessão | Beta usável operacional: cadeado + admin + teste do caminho free. |
| Placas de vitrine | **Fora.** Não pausar Assinar, não faixa “você está no beta”, não canal de suporte no rodapé. Motivo: o app ainda não está rodando para ninguém. |

## Objetivo

Um visitante na **produção Vercel** não entra nas telas do pet sem conta. Um tutor consegue **criar conta → cadastrar 1 pet → usar o free**. O 2º pet continua bloqueado e aponta para `/planos`.

Critério de pronto desta fatia:

1. Na produção Vercel, `OPEN_ACCESS` não destranca o app, mesmo se a variável estiver `true` por engano.
2. Visitante sem login em rota protegida vai para `/login?next=…`.
3. E-mail admin é o do founder (`massini.guih@gmail.com`), via `ADMIN_EMAILS` ou o fallback já existente no código.
4. Roteiro A (free) rodado **com o atalho desligado**: cadastro, 1 pet, bloqueio do 2º pet.

## Fora de escopo

- Webhook LastLink, compra teste, Premium ponta a ponta (MAS-7, MAS-13).
- Pausar o botão Assinar ou a API `/api/lastlink/checkout`.
- Canal de suporte no rodapé / WhatsApp (MAS-10) — fica Todo.
- Licença Thiings (MAS-9).
- Domínio HTTPS próprio (MAS-8).
- Instagram (MAS-20).
- Termos, LGPD, push, mapa piloto, parceiro B2B pago.
- Esconder `/planos` ou mudar copy comercial.

`/planos` e o checkout continuam como estão. Risco aceito: ninguém está usando o app ainda, então não há pagamento acidental nesta semana.

## Arquitetura

Hoje o atalho de revisão lê duas variáveis e, se qualquer uma for a string `true`, **todas** as rotas passam sem login:

- `OPEN_ACCESS` (servidor)
- `NEXT_PUBLIC_OPEN_ACCESS` (cliente e servidor; entra no bundle na hora do build)

Isso é desejável **na oficina** (`next start` local, para revisar telas). É proibido **na rua** (deploy Production da Vercel).

Não usar `NODE_ENV === 'production'` como trava: `npm run build && npm run start` local também roda com `NODE_ENV=production`, e o atalho precisa continuar funcionando aí (ver `CLAUDE.md`).

Sinal correto: `VERCEL_ENV === 'production'`. A Vercel define isso só nos deploys de Production. Local e Preview ficam livres para o atalho.

```
Visitante pede /dashboard
        ↓
middleware → isOpenAccess()?
        ├─ sim (oficina / preview com chave true) → deixa passar
        └─ não
              ├─ sem login → /login?next=/dashboard
              └─ com login → segue
```

### Função única

Criar `lib/openAccess.ts` com:

```ts
export function isOpenAccess(): boolean {
  const vercelEnv =
    process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (vercelEnv === 'production') return false;
  return (
    process.env.OPEN_ACCESS === 'true' ||
    process.env.NEXT_PUBLIC_OPEN_ACCESS === 'true'
  );
}
```

Regras:

- Produção Vercel: sempre `false`. As chaves são ignoradas.
- Local / Preview: `true` só se alguma chave for exatamente `'true'`. Ausente, vazia ou `false` → cadeado ligado.
- Sem terceira variável de produto. Sem default `true`.

Por que duas leituras de ambiente: `VERCEL_ENV` existe no servidor. No browser o Next **só** entrega variável com prefixo `NEXT_PUBLIC_`. Sem o espelho, o middleware tranca a porta e o `store` ainda cria o pet demo “Mel” e marca Premium no aparelho de quem abriu o site.

Em `next.config.js`, espelhar na hora do build (a Vercel já define `VERCEL_ENV`; local fica vazio):

```js
env: {
  NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || '',
},
```

Assim o build de Production congela `isOpenAccess() === false` no bundle do cliente, mesmo se alguém colar `NEXT_PUBLIC_OPEN_ACCESS=true` no painel.

### Onde passar a usar a função

Substituir as leituras soltas da chave nestes quatro pontos (e só nestes):

| Arquivo | Uso atual |
|---------|-----------|
| `middleware.ts` | Se atalho ligado, devolve a resposta sem checar login. |
| `lib/store.ts` | Se atalho ligado e não há pet local, cria o pet demo “Mel” e marca Premium. |
| `app/admin/layout.tsx` | Lê `NEXT_PUBLIC_OPEN_ACCESS` para o layout staff. |
| `app/api/admin/dashboard-stats/route.ts` | Lê as duas chaves na API de stats. |

Não espalhar a lógica de `VERCEL_ENV` à mão em cada arquivo.

### Admin

Nenhuma mudança de regra. Continua:

```
ADMIN_EMAILS  →  lista separada por vírgula
fallback      →  massini.guih@gmail.com   (middleware.ts e lib/supabase/admin.ts)
```

Founder confirma a variável na Vercel (explícito vale mais que fallback). Código de fallback permanece: se a variável vier vazia, o e-mail do founder ainda entra em `/admin`.

## Passos que só o founder consegue clicar

No projeto Vercel de produção (Production):

1. Remover ou pôr `false` em `OPEN_ACCESS` e `NEXT_PUBLIC_OPEN_ACCESS`.
2. Definir `ADMIN_EMAILS=massini.guih@gmail.com` (ou a lista real, vírgula no meio se houver mais de um).
3. Redeploy de Production para o bundle cliente nascer sem o atalho.

Enquanto isso não for clicado, o cadeado no código **já** impede destrancar em Production. Os passos acima são cinto e suspensório + admin explícito.

## Fluxo de dados (caminho free, atalho desligado)

```
/cadastro → conta no Supabase Auth → (e-mail de confirmação se o projeto exigir)
     ↓
/login → sessão
     ↓
/onboarding → addPet no store/Supabase
     ↓
/dashboard, /racao, /atividades, /vida, /mapa
     ↓
tentar 2º pet → store.addPet recusa se !isPremium && pets.length >= 1
             → PetSelector aponta para /planos
```

Nada disso muda de regra. Só passa a ser **testável**, porque o atalho deixa de inventar o pet demo e de pular o login.

## Erros e casos de borda

| Situação | Comportamento |
|----------|-----------------|
| Visitante em rota de `protectedRoutes` | Redirect `/login?next=<path>` (já existe). |
| Visitante em `/admin` | Redirect `/login`. |
| Logado sem e-mail admin em `/admin` | Redirect `/dashboard` (já existe). |
| `/conferir` e `/preview-icones` na produção | Só admin logado; atalho não existe na Production. |
| Atalho `true` na Production | Ignorado no servidor e no cliente. App exige login; não cria pet demo. |
| Atalho `true` local com `next start` | Continua revisando telas sem login (incluindo pet demo). |
| Deploy Preview da Vercel com atalho `true` | Atalho vale. Não é a URL que vamos convitar. |
| 2º pet no free | Mensagem de limite; link para `/planos`. Checkout LastLink **não** é alterado nesta fatia. |
| `ADMIN_EMAILS` vazio na Vercel | Fallback `massini.guih@gmail.com`. |

## Testes

Ambiente: `npm run build && npm run start` com `OPEN_ACCESS` e `NEXT_PUBLIC_OPEN_ACCESS` **ausentes ou false**. Não usar `npm run dev` (CSP bloqueia `unsafe-eval`; ver `CLAUDE.md`).

### Cadeado (sem conta)

| # | Passo | Passa se |
|---|--------|----------|
| L1 | GET `/dashboard` sem cookie | 307/302 para `/login` (com `next`) |
| L2 | GET `/racao`, `/atividades`, `/vida`, `/onboarding`, `/mapa`, `/conta` | Idem |
| L3 | GET `/admin` | Vai para `/login` |
| L4 | GET `/conferir` e `/preview-icones` | Login, não o conteúdo de QA |

### Caminho free (com conta de teste)

| # | Passo | Passa se |
|---|--------|----------|
| A1 | Home `/` | 200 |
| A2 | Cadastro + login | Entra no app |
| A3 | Onboarding 1 pet | Pet salvo; dashboard com o nome |
| A4 | Ração, atividades, vida | Carregam com o pet |
| A5 | Tentar 2º pet | Bloqueia e manda a `/planos` |
| A6 | Logout e `/dashboard` | Volta ao login |

Conta de teste: e-mail descartável ou o do founder. Não usar o pet demo “Mel” — ele só existe com atalho ligado.

### Produção (depois do redeploy)

Repetir L1 contra `https://patinha-mvp.vercel.app/dashboard` sem cookie: tem que ir para login, não para o hub.

## Mapeamento Linear

| Ticket | O que esta fatia faz |
|--------|----------------------|
| MAS-5 | Comentário com as decisões (beta só free, URL Vercel, placas adiadas). Continua In Progress; não fechar a epic. |
| MAS-6 | Implementar `isOpenAccess()` + trocas nos 4 arquivos. Este é o trabalho de código. |
| MAS-11 | Founder preenche `ADMIN_EMAILS` na Vercel. Sem mudança de código se o fallback já for o e-mail certo. |
| MAS-12 | Rodar o roteiro A com atalho desligado e anotar o resultado no ticket / no checklist. |
| MAS-10, MAS-7, MAS-8, MAS-9 | Intocados. Continuam Todo. |

## Arquivos tocados (código)

- `lib/openAccess.ts` (novo)
- `next.config.js` (`NEXT_PUBLIC_VERCEL_ENV` espelhando `VERCEL_ENV`)
- `middleware.ts`
- `lib/store.ts`
- `app/admin/layout.tsx`
- `app/api/admin/dashboard-stats/route.ts`

Docs opcionais na mesma fatia, se o teste A for rodado: uma linha em `docs/go-live-beta-checklist.md` na tabela “Resultado do teste”.

## Não fazer

- Flag `PAYMENTS_OPEN` / desligar checkout.
- Texto novo no `Footer`.
- Banner de beta.
- Mudar fallback de admin para outro e-mail sem o founder pedir.
- Travar Preview deploys (só Production).
