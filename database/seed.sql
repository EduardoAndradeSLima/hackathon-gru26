insert into public.users (nome, email, senha_hash, perfil, unidade)
values
  ('Administrador Geral', 'admin@guarulhos.sp.gov.br', crypt('Admin@123', gen_salt('bf')), 'ADMINISTRADOR', 'Secretaria de Desenvolvimento Social'),
  ('Equipe Central de Vagas', 'central@guarulhos.sp.gov.br', crypt('Admin@123', gen_salt('bf')), 'GESTOR_CENTRAL', 'Central de Vagas ILPI'),
  ('CRAS Pimentas', 'cras@guarulhos.sp.gov.br', crypt('Admin@123', gen_salt('bf')), 'FUNCIONARIO_CRAS', 'CRAS Pimentas'),
  ('CREAS Centro', 'creas@guarulhos.sp.gov.br', crypt('Admin@123', gen_salt('bf')), 'FUNCIONARIO_CREAS', 'CREAS Centro'),
  ('OSC ILPI Parceira', 'osc@parceira.org.br', crypt('Admin@123', gen_salt('bf')), 'OSC', 'Lar Protecao Idosa Guarulhos')
on conflict (email) do update set perfil = excluded.perfil, unidade = excluded.unidade;

with inserted_oscs as (
  insert into public.oscs (nome, cnpj, endereco, bairro, regiao, telefone, responsavel, tipo_servico)
  values
    ('Lar Autonomia Guarulhos', '12.345.678/0001-90', 'Rua Itapegica, 120 - Centro', 'Centro', 'Centro', '(11) 2400-1000', 'Mariana Costa', 'ILPI'),
    ('Lar Protecao Idosa Guarulhos', '23.456.789/0001-01', 'Avenida Timoteo Penteado, 891 - Vila Galvao', 'Vila Galvao', 'Norte', '(11) 2450-2200', 'Carlos Almeida', 'ILPI'),
    ('Residencial Vida Segura ILPI', '34.567.890/0001-12', 'Rua Jurema, 450 - Pimentas', 'Pimentas', 'Leste', '(11) 2480-3300', 'Aline Souza', 'ILPI')
  on conflict (cnpj) do update set tipo_servico = excluded.tipo_servico, regiao = excluded.regiao
  returning id, nome, tipo_servico
)
insert into public.vagas (osc_id, tipo_servico, perfil_aceito, grau_dependencia, status, observacoes)
select id, 'ILPI',
  case nome
    when 'Lar Autonomia Guarulhos' then '["idoso", "pessoa_idosa", "grau_1", "dependencia_grau_1"]'::jsonb
    when 'Lar Protecao Idosa Guarulhos' then '["idoso", "pessoa_idosa", "grau_2", "dependencia_grau_2"]'::jsonb
    else '["idoso", "pessoa_idosa", "grau_3", "dependencia_grau_3", "sem_cuidador"]'::jsonb
  end,
  case nome
    when 'Lar Autonomia Guarulhos' then 'grau_1'
    when 'Lar Protecao Idosa Guarulhos' then 'grau_2'
    else 'grau_3'
  end,
  'disponivel',
  'Seed inicial ILPI'
from inserted_oscs
on conflict do nothing;

insert into public.cidadaos (nome, cpf, nis, nascimento, endereco, telefone, bairro, regiao, perfil_social, vulnerabilidade, grau_risco, status_atendimento, unidade_referencia, historico)
values
  ('Joao Silva', '123.456.789-00', '12345678901', '1951-09-14', 'Rua das Palmeiras, 70', '(11) 99999-1000', 'Vila Galvao', 'Norte', 'Pessoa idosa com renda baixa e dependencia moderada.', '["pessoa_idosa", "idoso", "grau_2", "dependencia_grau_2"]'::jsonb, 'medio', 'aguardando_vaga', 'Equipe tecnica ILPI - Regiao Norte', '["Atendimento inicial registrado."]'::jsonb),
  ('Maria Aparecida Santos', '987.654.321-00', '98765432109', '1943-03-18', 'Rua das Acacias, 35', '(11) 98888-1000', 'Pimentas', 'Leste', 'Pessoa idosa sem cuidador fixo e com dependencia elevada.', '["pessoa_idosa", "idoso", "grau_3", "dependencia_grau_3", "sem_cuidador"]'::jsonb, 'alto', 'em_analise', 'Equipe tecnica ILPI - Regiao Leste', '["Triagem ILPI aguardando avaliacao humana."]'::jsonb)
on conflict (cpf) do update set
  status_atendimento = excluded.status_atendimento,
  grau_risco = excluded.grau_risco,
  vulnerabilidade = excluded.vulnerabilidade,
  unidade_referencia = excluded.unidade_referencia;

insert into public.solicitacoes (cidadao_id, tipo_servico, prioridade, status, data_solicitacao)
select id, 'ILPI', 'media', 'pendente', now()
from public.cidadaos
where cpf = '123.456.789-00'
on conflict do nothing;

insert into public.solicitacoes (cidadao_id, tipo_servico, prioridade, status, data_solicitacao)
select id, 'ILPI', 'alta', 'em_analise', now()
from public.cidadaos
where cpf = '987.654.321-00'
on conflict do nothing;

insert into public.notificacoes (tipo, titulo, mensagem)
values ('triagem_ilpi', 'Idoso para avaliacao - Leste', 'Maria Aparecida Santos, 83 anos, grau_3, risco alto. Caso aguarda avaliacao humana regional.')
on conflict do nothing;
