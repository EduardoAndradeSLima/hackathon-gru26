# Deploy do FacilitaGRU

Este roteiro publica o sistema em producao usando Supabase, Render e Vercel. Railway e Netlify tambem funcionam com as mesmas variaveis.

## 1. Banco no Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Execute `database/schema.sql`.
4. Execute `database/seed.sql` se quiser dados iniciais.
5. Copie:
   - Project URL
   - Service Role Key

Use a Service Role Key apenas no backend. Nunca coloque essa chave no frontend.

## 2. Backend no Render

Crie um Web Service apontando para este repositorio.

Configuracao:

- Root Directory: `backend`
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`

Variaveis de ambiente:

```env
NODE_ENV=production
PORT=10000
CLIENT_URLS=https://seu-frontend.vercel.app
JWT_SECRET=gere-uma-chave-grande-e-segura
JWT_EXPIRES_IN=8h
DB_DRIVER=supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
UPLOAD_DIR=uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

Depois do deploy, teste:

```text
https://sua-api.onrender.com/api/health
```

## 3. Frontend no Vercel

Crie um projeto no Vercel apontando para este repositorio.

Configuracao:

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Variavel de ambiente:

```env
VITE_API_URL=https://sua-api.onrender.com/api
```

Depois que a Vercel gerar a URL final, volte no backend e atualize:

```env
CLIENT_URLS=https://seu-frontend.vercel.app
```

Se usar uma URL preview e uma URL final, separe por virgula:

```env
CLIENT_URLS=https://seu-frontend.vercel.app,https://facilitagru.vercel.app
```

## 4. Deploy alternativo via Docker

O backend possui `backend/Dockerfile`.

Build:

```bash
docker build -t facilitagru-api ./backend
```

Run:

```bash
docker run -p 3333:3333 --env-file backend/.env facilitagru-api
```

## 5. Checklist de producao

- Trocar `JWT_SECRET` por uma chave forte.
- Usar `DB_DRIVER=supabase`.
- Conferir CORS em `CLIENT_URLS`.
- Ativar HTTPS nos dominios finais.
- Criar politica de backup no Supabase.
- Revisar RLS e permissoes antes de dados reais.
- Migrar uploads para Supabase Storage ou outro storage persistente.
- Criar termos de uso, aviso de privacidade e politica LGPD.
