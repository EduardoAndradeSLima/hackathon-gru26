# FacilitaGRU

Sistema web para gestao inteligente de vagas socioassistenciais, integrando Secretaria de Desenvolvimento Social, Central de Vagas, CRAS, CREAS e OSCs conveniadas.

## Visao geral

O projeto centraliza cadastros, vagas, fila de espera, encaminhamentos, auditoria, relatorios e recomendacoes assistidas. A recomendacao inteligente classifica o perfil social, identifica servicos compativeis e apresenta sugestoes explicaveis, mantendo a decisao final sob responsabilidade humana.

## Stack

- Frontend: React, React Router, Context API, Axios, TailwindCSS, Recharts
- Backend: Node.js, Express.js, JWT, bcrypt, multer, express-validator
- Banco: schema Supabase em `database/schema.sql`; modo local com JSON seed para demonstracao
- Arquitetura: camadas separadas em controllers, services, routes, middlewares, validators, config e database

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
| Central de Vagas | central@guarulhos.sp.gov.br |
| CRAS | cras@guarulhos.sp.gov.br |
| CREAS | creas@guarulhos.sp.gov.br |
| OSC | osc@parceira.org.br |

## Supabase

O schema completo esta em `database/schema.sql`. Para producao:

1. Crie um projeto no Supabase.
2. Execute o SQL do arquivo `database/schema.sql`.
3. Preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no backend.
4. Altere `DB_DRIVER=supabase` em `backend/.env`.

O codigo esta organizado para permitir troca do repositório local JSON por Supabase ou MongoDB sem alterar controllers e rotas.

## Deploy

O guia completo esta em `DEPLOY.md`.

Rota recomendada:

- Banco: Supabase
- Backend: Render ou Railway
- Frontend: Vercel ou Netlify

Variaveis principais:

- Backend: `NODE_ENV`, `PORT`, `CLIENT_URLS`, `JWT_SECRET`, `DB_DRIVER`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Frontend: `VITE_API_URL`

## Funcionalidades

- Autenticacao JWT e controle por perfil
- CRUD de usuarios, OSCs, vagas, cidadaos, solicitacoes e encaminhamentos
- Upload de documentos de cidadaos
- Logs de auditoria e historico de alteracoes
- Filtros, busca e paginacao
- Dashboard operacional e gerencial
- Relatorios CSV e PDF
- Triagem cidadao/profissional
- Recomendacao inteligente com score e justificativas
- Alertas automaticos para risco, espera longa e vulnerabilidade critica
- Layout responsivo, acessivel e institucional

## Observacoes LGPD

O projeto inclui principios de minimizacao, autorizacao por perfil, logs de acesso, mascaramento visual de CPF, protecao de rotas, senha com hash bcrypt e headers de seguranca. Em producao, configure HTTPS, backup, politica de retencao, DPO, termos de consentimento e RLS no Supabase.
