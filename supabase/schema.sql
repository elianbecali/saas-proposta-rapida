-- ============================================================
-- PROPOSTA RÁPIDA — Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database
-- ============================================================

-- ==========================================
-- TABLES
-- ==========================================

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text,
  plan        text not null default 'free' check (plan in ('free', 'pro')),
  created_at  timestamptz not null default now()
);

create table public.proposals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  client_name  text not null,
  content      text not null default '',
  status       text not null default 'draft' check (status in ('draft', 'sent', 'approved')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.templates (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  content    text not null,
  created_at timestamptz not null default now()
);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-update updated_at on proposals
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger proposals_updated_at
  before update on public.proposals
  for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Free plan limit enforcement at DB level (safety net)
create or replace function check_proposal_limit()
returns trigger language plpgsql security definer as $$
declare
  proposal_count int;
  user_plan      text;
begin
  select plan into user_plan from public.profiles where id = new.user_id;
  if user_plan = 'pro' then
    return new;
  end if;

  select count(*) into proposal_count
    from public.proposals
   where user_id = new.user_id;

  if proposal_count >= 3 then
    raise exception 'PROPOSAL_LIMIT_REACHED';
  end if;
  return new;
end;
$$;

create trigger enforce_free_proposal_limit
  before insert on public.proposals
  for each row execute function check_proposal_limit();

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

alter table public.profiles  enable row level security;
alter table public.proposals enable row level security;
alter table public.templates enable row level security;

-- Profiles: own row only
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Proposals: full CRUD scoped to owner
create policy "proposals_select_own"
  on public.proposals for select
  using (auth.uid() = user_id);

create policy "proposals_insert_own"
  on public.proposals for insert
  with check (auth.uid() = user_id);

create policy "proposals_update_own"
  on public.proposals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "proposals_delete_own"
  on public.proposals for delete
  using (auth.uid() = user_id);

-- Templates: public read-only
create policy "templates_select_all"
  on public.templates for select
  using (true);

-- ==========================================
-- SEED TEMPLATES
-- ==========================================

insert into public.templates (name, content) values
(
  'Desenvolvimento Web',
  '## Proposta Comercial — Desenvolvimento Web

**Cliente:** {{client_name}}
**Data:** {{date}}

---

### Sobre o Projeto

Descreva o contexto e objetivo do projeto.

### Escopo de Trabalho

- Desenvolvimento do site/sistema
- Criação de layouts responsivos
- Integração com APIs necessárias
- Testes e publicação

### Entregáveis

| Item | Descrição |
|------|-----------|
| Layout | Protótipo e design final |
| Desenvolvimento | Código-fonte completo |
| Deploy | Publicação em produção |

### Investimento

| Serviço | Valor |
|---------|-------|
| Design | R$ 0,00 |
| Desenvolvimento | R$ 0,00 |
| **Total** | **R$ 0,00** |

### Prazo de Entrega

X semanas após aprovação.

### Validade da Proposta

Esta proposta é válida por 15 dias.

---

*Qualquer dúvida estou à disposição.*'
),
(
  'Design & Identidade Visual',
  '## Proposta de Design

**Cliente:** {{client_name}}
**Data:** {{date}}

---

### Objetivo

Criação de identidade visual completa para a marca.

### O que está incluído

- Logotipo (3 versões: horizontal, vertical, ícone)
- Paleta de cores
- Tipografia
- Manual de marca (PDF)
- Arquivos editáveis (AI/PDF)

### Investimento

**R$ 0,00** (pagamento em 2x)

### Prazo

X dias úteis após aprovação e pagamento da entrada.

### Validade

15 dias.'
),
(
  'Consultoria',
  '## Proposta de Consultoria

**Cliente:** {{client_name}}
**Data:** {{date}}

---

### Objetivo

Descreva o objetivo da consultoria.

### Metodologia

1. Diagnóstico inicial
2. Análise e levantamento
3. Plano de ação
4. Acompanhamento

### Carga Horária

X horas no total.

### Investimento

**Valor por hora:** R$ 0,00
**Total estimado:** R$ 0,00

### Forma de Pagamento

50% na contratação, 50% na entrega.

### Validade

15 dias.'
);
