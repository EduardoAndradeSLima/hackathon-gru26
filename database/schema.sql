create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  senha_hash text not null,
  perfil text not null check (perfil in ('ADMINISTRADOR', 'GESTOR_CENTRAL', 'FUNCIONARIO_CRAS', 'FUNCIONARIO_CREAS', 'CENTRAL_VAGAS', 'CRAS', 'CREAS', 'OSC', 'CIDADAO')),
  unidade text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.oscs (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text not null unique,
  endereco text not null,
  bairro text,
  regiao text,
  telefone text not null,
  responsavel text not null,
  tipo_servico text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vagas (
  id uuid primary key default gen_random_uuid(),
  osc_id uuid not null references public.oscs(id) on delete cascade,
  tipo_servico text not null,
  perfil_aceito jsonb not null default '[]'::jsonb,
  grau_dependencia text,
  status text not null check (status in ('disponivel', 'ocupada', 'reservada', 'bloqueada')),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cidadaos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text not null unique,
  nis text,
  nascimento date,
  endereco text,
  telefone text,
  bairro text,
  regiao text,
  perfil_social text,
  vulnerabilidade jsonb not null default '[]'::jsonb,
  grau_risco text check (grau_risco in ('baixo', 'medio', 'alto', 'critico')),
  status_atendimento text not null default 'aguardando_triagem' check (status_atendimento in ('aguardando_triagem', 'em_triagem', 'aguardando_vaga', 'encaminhado', 'em_acolhimento', 'atendido', 'cancelado')),
  unidade_referencia text,
  historico jsonb not null default '[]'::jsonb,
  anexos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.solicitacoes (
  id uuid primary key default gen_random_uuid(),
  cidadao_id uuid not null references public.cidadaos(id) on delete cascade,
  tipo_servico text not null,
  prioridade text not null check (prioridade in ('baixa', 'media', 'alta', 'critica')),
  status text not null check (status in ('pendente', 'em_analise', 'encaminhada', 'concluida', 'cancelada')),
  data_solicitacao timestamptz not null default now(),
  data_encaminhamento timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.encaminhamentos (
  id uuid primary key default gen_random_uuid(),
  solicitacao_id uuid not null references public.solicitacoes(id) on delete cascade,
  vaga_id uuid not null references public.vagas(id) on delete restrict,
  status text not null check (status in ('aguardando_osc', 'aceito', 'recusado', 'concluido')),
  justificativa text,
  respondido_em timestamptz,
  respondido_por uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.triagens (
  id uuid primary key default gen_random_uuid(),
  origem text not null check (origem in ('cidadao', 'profissional')),
  dados jsonb not null,
  classificacao jsonb not null,
  recomendacoes jsonb not null default '[]'::jsonb,
  alertas jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  titulo text not null,
  mensagem text not null,
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  usuario_id text not null,
  usuario_nome text,
  acao text not null,
  entidade text not null,
  entidade_id text,
  detalhes jsonb not null default '{}'::jsonb,
  data timestamptz not null default now()
);

alter table public.cidadaos add column if not exists status_atendimento text not null default 'aguardando_triagem';

create index if not exists idx_users_perfil on public.users(perfil);
create index if not exists idx_vagas_status on public.vagas(status);
create index if not exists idx_vagas_tipo_servico on public.vagas(tipo_servico);
create index if not exists idx_cidadaos_regiao on public.cidadaos(regiao);
create index if not exists idx_cidadaos_status_atendimento on public.cidadaos(status_atendimento);
create index if not exists idx_solicitacoes_status on public.solicitacoes(status);
create index if not exists idx_solicitacoes_prioridade on public.solicitacoes(prioridade);
create index if not exists idx_logs_entidade on public.logs(entidade, entidade_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();

drop trigger if exists oscs_set_updated_at on public.oscs;
create trigger oscs_set_updated_at before update on public.oscs for each row execute function public.set_updated_at();

drop trigger if exists vagas_set_updated_at on public.vagas;
create trigger vagas_set_updated_at before update on public.vagas for each row execute function public.set_updated_at();

drop trigger if exists cidadaos_set_updated_at on public.cidadaos;
create trigger cidadaos_set_updated_at before update on public.cidadaos for each row execute function public.set_updated_at();

drop trigger if exists solicitacoes_set_updated_at on public.solicitacoes;
create trigger solicitacoes_set_updated_at before update on public.solicitacoes for each row execute function public.set_updated_at();

drop trigger if exists encaminhamentos_set_updated_at on public.encaminhamentos;
create trigger encaminhamentos_set_updated_at before update on public.encaminhamentos for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.oscs enable row level security;
alter table public.vagas enable row level security;
alter table public.cidadaos enable row level security;
alter table public.solicitacoes enable row level security;
alter table public.encaminhamentos enable row level security;
alter table public.triagens enable row level security;
alter table public.notificacoes enable row level security;
alter table public.logs enable row level security;

create policy "service_role_full_users" on public.users for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_full_oscs" on public.oscs for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_full_vagas" on public.vagas for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_full_cidadaos" on public.cidadaos for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_full_solicitacoes" on public.solicitacoes for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_full_encaminhamentos" on public.encaminhamentos for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_full_triagens" on public.triagens for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_full_notificacoes" on public.notificacoes for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_full_logs" on public.logs for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public.users drop constraint if exists users_perfil_check;
alter table public.users add constraint users_perfil_check check (perfil in ('ADMINISTRADOR', 'GESTOR_CENTRAL', 'FUNCIONARIO_CRAS', 'FUNCIONARIO_CREAS', 'CENTRAL_VAGAS', 'CRAS', 'CREAS', 'OSC', 'CIDADAO'));

alter table public.cidadaos add column if not exists status_atendimento text not null default 'aguardando_triagem';
alter table public.cidadaos drop constraint if exists cidadaos_status_atendimento_check;
alter table public.cidadaos add constraint cidadaos_status_atendimento_check check (status_atendimento in ('aguardando_triagem', 'em_triagem', 'aguardando_vaga', 'encaminhado', 'em_acolhimento', 'atendido', 'cancelado'));

notify pgrst, 'reload schema';
