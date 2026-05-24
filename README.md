# FacilitaGRU

Plataforma inteligente para triagem, priorizacao e gestao de vagas ILPI da rede socioassistencial de Guarulhos.

## Tese do projeto

O FacilitaGRU transforma uma triagem subjetiva e manual em um processo estruturado, rastreavel e orientado por dados. O sistema classifica o grau de dependencia, calcula vulnerabilidade social, sugere vaga compativel e gera aviso para avaliacao humana. A decisao final continua com a equipe tecnica.

## Fluxo principal da demo

1. Cidadao ou profissional preenche a triagem ILPI.
2. O sistema identifica automaticamente bairro, regiao, grau de dependencia e risco social.
3. A recomendacao cruza perfil do idoso, grau, vulnerabilidade e disponibilidade de vagas.
4. Quando existe compatibilidade, o caso e pre-encaminhado para evitar lentidao.
5. A OSC aceita ou recusa com justificativa.
6. A Central acompanha fila, vagas, alertas, gargalos e historico.

## Stack

- Frontend: React, React Router, Context API, Axios, TailwindCSS, Recharts
- Backend: Node.js, Express.js, JWT, bcrypt, multer, express-validator
- Banco: Supabase em producao; JSON local para demonstracao
- Arquitetura: controllers, services, routes, middlewares, validators, config e database

## Como executar

1. Instale as dependencias:

```bash
npm run install:all
```

2. Copie os arquivos de ambiente:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Inicie a aplicacao:

```bash
npm run dev
```

4. Acesse:

- Frontend: http://localhost:5173
- Backend: http://localhost:3333/api/health

## Acessos de demonstracao

Todos usam a senha `Admin@123`.

| Perfil | Email |
| --- | --- |
| Administrador | admin@guarulhos.sp.gov.br |
| Gestor central | central@guarulhos.sp.gov.br |
| Funcionario CRAS | cras@guarulhos.sp.gov.br |
| Funcionario CREAS | creas@guarulhos.sp.gov.br |
| OSC | osc@parceira.org.br |

## Funcionalidades fortes para hackathon

- Formulario unico ILPI
- Classificador automatico de grau 1, 2 e 3
- Indice de vulnerabilidade social
- Match automatico com vaga compativel
- Pre-encaminhamento assistido, sem tirar a decisao humana
- Aviso regional para avaliacao tecnica
- Sincronizacao entre status do cidadao e disponibilidade da vaga
- Dashboard operacional e gerencial
- Relatorios CSV e PDF
- Auditoria, logs, historico, upload de documentos e controle por perfil
- Layout responsivo, acessivel e institucional

## Supabase

O schema esta em `database/schema.sql`. Para producao:

1. Crie um projeto no Supabase.
2. Execute o SQL de `database/schema.sql`.
3. Execute o SQL de `database/seed.sql` para dados de demonstracao.
4. Configure `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no backend.
5. Configure `DB_DRIVER=supabase`.

## Deploy

O guia completo esta em `DEPLOY.md`.

Rota recomendada:

- Banco: Supabase
- Backend: Render
- Frontend: Vercel

Variaveis principais:

- Backend: `NODE_ENV`, `PORT`, `CLIENT_URLS`, `JWT_SECRET`, `DB_DRIVER`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Frontend: `VITE_API_URL`

## LGPD e seguranca

O projeto usa minimizacao de dados, autorizacao por perfil, mascara visual de CPF, logs de auditoria, senha com hash bcrypt, protecao de rotas, validacao de entrada, headers de seguranca e separacao entre area publica e area de gestao. Em producao, configure HTTPS, politicas de retencao, backup, DPO, termos de consentimento e RLS no Supabase.
