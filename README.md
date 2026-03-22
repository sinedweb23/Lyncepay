# Painel SaaS – Eat

Aplicação **separada** para gerenciar os clientes da plataforma (empresas/escolas).  
Cada empresa tem seu próprio banco Supabase; este painel usa apenas o banco **MASTER**, onde ficam cadastradas as empresas e suas credenciais.

## Deploy na Vercel (projeto separado)

1. Crie um **novo projeto** na Vercel.
2. Conecte o **mesmo repositório** do eat, mas defina:
   - **Root Directory**: `saas-panel`
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_MASTER_SUPABASE_URL`
   - `MASTER_SUPABASE_SERVICE_ROLE_KEY`
   - `SAAS_PANEL_API_KEY` (chave secreta para o app da cantina chamar a API de credenciais)

## Desenvolvimento local

```bash
cd saas-panel
npm install
cp .env.example .env.local
# Edite .env.local com as variáveis do MASTER e SAAS_PANEL_API_KEY
npm run dev
```

Acesse http://localhost:3001 (porta diferente do app principal).

## APIs para as cantinas

**Credenciais Supabase:**
```
GET /api/tenant-credentials?slug=escola-msul
Authorization: Bearer <SAAS_PANEL_API_KEY>
```
Retorna: `{ supabase_url, supabase_anon_key }`

**Config completa (Supabase + Rede + Twilio + Google + Importação):**
```
GET /api/tenant-config?slug=escola-msul
Authorization: Bearer <SAAS_PANEL_API_KEY>
```
Retorna: `{ supabase_url, supabase_anon_key, rede, twilio, google, importacao }`

No app da cantina: `NEXT_PUBLIC_SAAS_PANEL_URL` e `SAAS_PANEL_API_KEY`
