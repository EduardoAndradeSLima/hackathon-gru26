alter table public.cidadaos
  add column if not exists status_atendimento text not null default 'aguardando_triagem';

alter table public.cidadaos
  drop constraint if exists cidadaos_status_atendimento_check;

alter table public.cidadaos
  add constraint cidadaos_status_atendimento_check
  check (
    status_atendimento in (
      'aguardando_triagem',
      'em_triagem',
      'aguardando_vaga',
      'encaminhado',
      'em_acolhimento',
      'atendido',
      'cancelado'
    )
  );

create index if not exists idx_cidadaos_status_atendimento
  on public.cidadaos(status_atendimento);

notify pgrst, 'reload schema';
