# PetLove MVP — Autenticação com Supabase Auth

## Visão Geral

Implementar sistema de autenticação completo no PetLove MVP utilizando Supabase Auth com email/senha e login social (Google). Inclui verificação de email, recuperação de senha, e proteção de rotas.

## Decisões de Design

### Abordagem Escolhida

**Supabase Auth + Tabela Separada com Trigger**

- Supabase Auth gerencia autenticação (email/senha, Google OAuth)
- Tabela `tutor` armazena dados do perfil do usuário
- Trigger automático cria perfil quando usuário se cadastra
- RLS garante acesso apenas aos próprios dados

### Por que não outras abordagens?

- **User Metadata**: Limitado para consultas, difícil de expandir
- **Sync Manual**: Mais código, risco de dessincronismo entre auth e perfil

## Requisitos Funcionais

### Cadastro

#### Email + Senha
1. Usuário preenche: nome, email, senha, telefone, endereço, cidade
2. Supabase Auth cria conta com email não verificado
3. Trigger `on_auth_user_created` cria row na tabela `tutor`
4. Supabase envia email de verificação automaticamente
5. Usuário clica no link → email verificado → acesso liberado

#### Google OAuth
1. Usuário clica "Continuar com Google"
2. Redireciona para OAuth do Google
3. Supabase Auth cria conta com email verificado (Google já verifica)
4. Trigger `on_auth_user_created` cria row na tabela `tutor`
5. Acesso imediato (sem necessidade de verificação)

### Login
1. Usuário digita email + senha OU clica "Google"
2. Supabase Auth valida credenciais
3. RLS garante acesso apenas aos próprios dados

### Recuperação de Senha
1. Usuário clica "Esqueceu a senha?"
2. Digita email
3. Supabase envia link de redefinição
4. Usuário define nova senha

### Verificação de Email
- Email verification obrigatório para cadastro via email/senha
- Google OAuth não requer verificação (Google já verifica)
- Tela informativa "Verifique seu email" após cadastro

## Requisitos Não-Funcionais

### Segurança
- Senhas hasheadas pelo Supabase Auth (bcrypt)
- RLS habilitado em todas as tabelas
- Tokens JWT expiram após 1 hora
- Refresh tokens armazenados de forma segura

### Performance
- Login responde em < 2 segundos
- Middleware executa em < 50ms
- AuthProvider não bloqueia renderização

### UX
- Loading states em todos os formulários
- Mensagens de erro claras em português
- Redirecionamento automático pós-login
- Layout responsivo (mobile-first)

## Schema do Banco de Dados

### Tabela `tutor` (atualizada)

```sql
create table public.tutor (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  telefone text,
  endereco text,
  cidade text,
  consentimento_marketing boolean default false,
  consentimento_localizacao boolean default false,
  data_exclusao timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### Trigger: `on_auth_user_created`

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.tutor (id, nome, email)
  values (
    new.id,
    -- Google OAuth envia 'full_name', email/senha envia 'nome'
    coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

**Nota:** O campo `senha_hash` da tabela `tutor` atual deve ser removido, pois o Supabase Auth gerencia senhas internamente.

### RLS Policies

```sql
-- Tutor: leitura e escrita própria
create policy "tutor_select_own" on public.tutor
  for select using (auth.uid() = id);

create policy "tutor_update_own" on public.tutor
  for update using (auth.uid() = id);

-- Pet: leitura e escrita própria
create policy "pet_select_own" on public.pet
  for select using (auth.uid() = tutor_id);

create policy "pet_insert_own" on public.pet
  for insert with check (auth.uid() = tutor_id);

create policy "pet_update_own" on public.pet
  for update using (auth.uid() = tutor_id);

create policy "pet_delete_own" on public.pet
  for delete using (auth.uid() = tutor_id);
```

## Fluxos de Autenticação

### Fluxo 1: Cadastro Email/Senha

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Usuário    │────▶│  Supabase   │────▶│   Trigger   │
│  Preenche   │     │    Auth     │     │  Cria Tutor │
│  Formulário │     │  Cria Conta │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Email de   │
                    │ Verificação │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Usuário    │
                    │  Clica Link │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Acesso     │
                    │  Liberado   │
                    └─────────────┘
```

### Fluxo 2: Cadastro Google

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Usuário    │────▶│   Google    │────▶│  Supabase   │
│  Clica      │     │   OAuth     │     │    Auth     │
│  "Google"   │     │             │     │  Cria Conta │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           │                    ▼
                           │             ┌─────────────┐
                           │             │   Trigger   │
                           │             │  Cria Tutor │
                           │             └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────────────────────────┐
                    │        Acesso Imediato          │
                    │    (email já verificado)        │
                    └─────────────────────────────────┘
```

### Fluxo 3: Login

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Usuário    │────▶│  Supabase   │────▶│   RLS       │
│  Digita     │     │    Auth     │     │  Valida     │
│  Credenciais│     │  Valida     │     │  Acesso     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Dashboard  │
                    │  (rotas     │
                    │  protegidas)│
                    └─────────────┘
```

## Componentes UI/UX

### Páginas

| Rota | Descrição | Autenticação |
|------|-----------|--------------|
| `/login` | Formulário email/senha + Google | Pública |
| `/cadastro` | Formulário completo | Pública |
| `/verificar-email` | Mensagem informativa | Pública |
| `/recuperar-senha` | Formulário de redefinição | Pública |
| `/dashboard` | Painel do usuário | Protegida |
| `/mapa` | Mapa de serviços | Protegida |
| `/racao` | Recomendações de ração | Protegida |

### Componentes

```
components/
  auth/
    LoginForm.tsx          -- Formulário de login
    SignupForm.tsx         -- Formulário de cadastro
    GoogleButton.tsx       -- Botão "Continuar com Google"
    EmailVerification.tsx  -- Tela de verificação
    ForgotPassword.tsx     -- Recuperação de senha
  providers/
    AuthProvider.tsx       -- Context de autenticação
```

### Layout Login (`/login`)

```
┌─────────────────────────────┐
│         🐕 PetLove          │
│                             │
│  ┌───────────────────────┐  │
│  │ Email                 │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Senha                 │  │
│  └───────────────────────┘  │
│                             │
│  [ Entrar ]                 │
│                             │
│  ───────── ou ─────────     │
│                             │
│  [ Continuar com Google ]   │
│                             │
│  Esqueceu a senha?          │
│  Não tem conta? Cadastrar   │
└─────────────────────────────┘
```

### Layout Cadastro (`/cadastro`)

```
┌─────────────────────────────┐
│         🐕 PetLove          │
│                             │
│  Nome completo              │
│  Email                      │
│  Senha                      │
│  Telefone                   │
│  Endereço                   │
│  Cidade                     │
│                             │
│  [ Cadastrar ]              │
│                             │
│  ───────── ou ─────────     │
│  [ Continuar com Google ]   │
│                             │
│  Já tem conta? Entrar       │
└─────────────────────────────┘
```

## Middleware e Proteção de Rotas

### Rotas

```typescript
const protectedRoutes = ['/dashboard', '/mapa', '/racao'];
const authRoutes = ['/login', '/cadastro', '/verificar-email', '/recuperar-senha'];
```

### Lógica

1. Usuário logado tentando acessar `/login` ou `/cadastro` → redireciona para `/dashboard`
2. Rota protegida sem sessão → redireciona para `/login`
3. Rota pública → acesso livre

### AuthProvider

```typescript
// Context fornece:
- user: dados do usuário logado
- session: sessão do Supabase
- loading: estado de carregamento
- signIn: função de login
- signUp: função de cadastro
- signOut: função de logout
- signInWithGoogle: login com Google
```

### Hook `useAuth()`

```typescript
const { user, loading, signIn, signOut } = useAuth();

if (loading) return <Loading />;
if (!user) redirect('/login');
```

## Estrutura de Arquivos

### Novos Arquivos

```
petlove-mvp/
├── app/
│   ├── login/page.tsx
│   ├── cadastro/page.tsx
│   ├── verificar-email/page.tsx
│   ├── recuperar-senha/page.tsx
│   └── layout.tsx              (atualizar com AuthProvider)
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       ├── SignupForm.tsx
│       ├── GoogleButton.tsx
│       ├── EmailVerification.tsx
│       └── ForgotPassword.tsx
├── lib/
│   └── supabase/
│       ├── client.ts           (browser client)
│       ├── server.ts           (server client)
│       └── middleware.ts       (helper do middleware)
├── providers/
│   └── AuthProvider.tsx
├── middleware.ts                (novo)
└── supabase/
    └── schema.sql              (atualizar)
```

### Dependências

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "next": "latest",
    "react": "latest",
    "zustand": "latest"
  }
}
```

### Variáveis de Ambiente (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
```

## Checklist de Implementação

- [ ] Criar projeto no Supabase (ou usar existente)
- [ ] Aplicar schema.sql atualizado com trigger
- [ ] Configurar variáveis de ambiente
- [ ] Criar `lib/supabase/client.ts` e `server.ts`
- [ ] Criar `providers/AuthProvider.tsx`
- [ ] Criar componentes de auth (LoginForm, SignupForm, etc.)
- [ ] Criar páginas (login, cadastro, verificar-email, recuperar-senha)
- [ ] Criar `middleware.ts`
- [ ] Atualizar `layout.tsx` com AuthProvider
- [ ] Testar fluxo completo de cadastro
- [ ] Testar fluxo completo de login
- [ ] Testar login com Google
- [ ] Testar recuperação de senha
- [ ] Testar proteção de rotas
- [ ] Verificar RLS funcionando

## Critérios de Aceite

- [ ] Usuário consegue cadastrar com email/senha
- [ ] Usuário consegue cadastrar com Google
- [ ] Email de verificação é enviado automaticamente
- [ ] Usuário só acessa após verificar email (email/senha)
- [ ] Login com Google funciona sem verificação
- [ ] Recuperação de senha funciona
- [ ] Rotas protegidas redirecionam para login
- [ ] Usuário logado não acessa login/cadastro
- [ ] RLS garante acesso apenas aos próprios dados
- [ ] Layout responsivo (mobile-first)
- [ ] Mensagens de erro em português
- [ ] Loading states em todos os formulários
