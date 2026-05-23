insert into public.users (nome, email, senha_hash, perfil, unidade)
values
  ('Administrador Geral', 'admin@guarulhos.sp.gov.br', crypt('Admin@123', gen_salt('bf')), 'ADMINISTRADOR', 'Secretaria de Desenvolvimento Social'),
  ('Equipe Central de Vagas', 'central@guarulhos.sp.gov.br', crypt('Admin@123', gen_salt('bf')), 'CENTRAL_VAGAS', 'Central de Vagas'),
  ('CRAS Pimentas', 'cras@guarulhos.sp.gov.br', crypt('Admin@123', gen_salt('bf')), 'CRAS', 'CRAS Pimentas'),
  ('CREAS Centro', 'creas@guarulhos.sp.gov.br', crypt('Admin@123', gen_salt('bf')), 'CREAS', 'CREAS Centro'),
  ('Casa Social Parceira', 'osc@parceira.org.br', crypt('Admin@123', gen_salt('bf')), 'OSC', 'OSC Casa Social Esperanca')
on conflict (email) do nothing;

with inserted_oscs as (
  insert into public.oscs (nome, cnpj, endereco, bairro, regiao, telefone, responsavel, tipo_servico)
  values
    ('Casa Social Esperanca', '12.345.678/0001-90', 'Rua Itapegica, 120 - Centro', 'Centro', 'Centro', '(11) 2400-1000', 'Mariana Costa', 'Acolhimento adulto'),
    ('Lar Protecao Idosa Guarulhos', '23.456.789/0001-01', 'Avenida Timoteo Penteado, 891 - Vila Galvao', 'Vila Galvao', 'Norte', '(11) 2450-2200', 'Carlos Almeida', 'ILPI'),
    ('Instituto Nova Familia', '34.567.890/0001-12', 'Rua Jurema, 450 - Pimentas', 'Pimentas', 'Leste', '(11) 2480-3300', 'Aline Souza', 'Acolhimento infantil'),
    ('Casa Mulher Segura', '45.678.901/0001-23', 'Endereco sigiloso', 'Sigiloso', 'Municipal', '(11) 2460-4400', 'Equipe Tecnica', 'Violencia domestica')
  on conflict (cnpj) do nothing
  returning id, tipo_servico
)
insert into public.vagas (osc_id, tipo_servico, perfil_aceito, grau_dependencia, status, observacoes)
select id, tipo_servico,
  case tipo_servico
    when 'ILPI' then '["idoso", "deficiencia", "dependencia_grau_2"]'::jsonb
    when 'Violencia domestica' then '["mulher", "violencia_domestica", "risco_social"]'::jsonb
    when 'Acolhimento infantil' then '["crianca", "adolescente", "abandono"]'::jsonb
    else '["adulto", "situacao_rua", "desemprego"]'::jsonb
  end,
  case tipo_servico when 'ILPI' then 'grau_2' else 'nao_aplicavel' end,
  case tipo_servico when 'Acolhimento infantil' then 'reservada' else 'disponivel' end,
  'Seed inicial'
from inserted_oscs;

insert into public.cidadaos (nome, cpf, nis, nascimento, endereco, telefone, bairro, regiao, perfil_social, vulnerabilidade, grau_risco, unidade_referencia, historico)
values
  ('Joao Silva', '123.456.789-00', '12345678901', '1951-09-14', 'Rua das Palmeiras, 70', '(11) 99999-1000', 'Vila Galvao', 'Norte', 'Pessoa idosa com renda baixa e dependencia moderada.', '["pessoa_idosa", "deficiencia"]'::jsonb, 'medio', 'CREAS Centro', '["Atendimento inicial registrado."]'::jsonb),
  ('Maria Oliveira', '987.654.321-00', '98765432109', '1988-03-18', 'Endereco protegido', '(11) 98888-1000', 'Sigiloso', 'Municipal', 'Mulher em situacao de risco por violencia domestica.', '["violencia_domestica", "risco_social"]'::jsonb, 'alto', 'CREAS Centro', '["Encaminhamento de urgencia em avaliacao."]'::jsonb)
on conflict (cpf) do nothing;

insert into public.solicitacoes (cidadao_id, tipo_servico, prioridade, status, data_solicitacao, tempo_espera_dias)
select id, 'ILPI', 'media', 'pendente', now() - interval '14 days', 14
from public.cidadaos
where cpf = '123.456.789-00'
on conflict do nothing;

insert into public.solicitacoes (cidadao_id, tipo_servico, prioridade, status, data_solicitacao, tempo_espera_dias)
select id, 'Violencia domestica', 'critica', 'em_analise', now() - interval '5 days', 5
from public.cidadaos
where cpf = '987.654.321-00'
on conflict do nothing;
