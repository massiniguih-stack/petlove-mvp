-- PetLove MVP - Schema inicial

-- Tabela de tutores
create table public.tutor (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique not null,
  senha_hash text not null,
  localizacao_preferencia text,
  consentimento_marketing boolean default false,
  consentimento_localizacao boolean default false,
  data_exclusao timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Tabela de pets
create table public.pet (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid references public.tutor(id) on delete cascade not null,
  nome text not null,
  raca text not null,
  data_nascimento date not null,
  sexo text not null check (sexo in ('macho','femea')),
  peso_atual numeric not null,
  foto_url text,
  fase_vida text not null default 'filhote',
  objetivo text not null default 'manutencao',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Histórico de peso
create table public.peso_historico (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pet(id) on delete cascade not null,
  data timestamp default now() not null,
  peso numeric not null,
  medidas jsonb
);

-- Vacinas
create table public.vacina (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pet(id) on delete cascade not null,
  tipo text not null,
  data_aplicacao date not null,
  proxima_data date,
  veterinario_id uuid,
  created_at timestamp default now()
);

-- Serviços
create table public.servico (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('veterinario','parque','hotel','creche','pet_sitter')),
  nome text not null,
  endereco text not null,
  bairro text,
  cidade text not null,
  estado text not null,
  lat numeric,
  lng numeric,
  avaliacao numeric,
  telefone text,
  site text,
  created_at timestamp default now()
);

-- Recomendações de ração
create table public.recomendacao_racao (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pet(id) on delete cascade not null,
  tipo text not null,
  objetivo text not null,
  detalhes jsonb not null,
  data timestamp default now() not null
);

-- RLS (Row Level Security)
alter table public.tutor enable row level security;
alter table public.pet enable row level security;
alter table public.peso_historico enable row level security;
alter table public.vacina enable row level security;
alter table public.servico enable row level security;
alter table public.recomendacao_racao enable row level security;

-- Políticas básicas (para MVP, ajustar depois)
create policy "tutor_read_own" on public.tutor for select using (auth.uid() = id);
create policy "pet_read_own" on public.pet for select using (auth.uid() = tutor_id);
create policy "servico_read_all" on public.servico for select using (true);
