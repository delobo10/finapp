# 🔧 Configurar URLs no Supabase para Deploy

## ❓ Por que preciso disso?

Quando seu site estiver online no Vercel, o **Google OAuth** só vai funcionar se você configurar as URLs corretas no Supabase. Sem isso, você terá erro de "redirect_uri_mismatch" ao tentar fazer login.

---

## ✅ Passo 1: Obter a URL do Vercel

1. Faça o deploy no Vercel primeiro (siga o `VERCEL_DEPLOY.md`)
2. Após o deploy, você receberá uma URL tipo:
   ```
   https://finapp-SEU-USUARIO.vercel.app
   ```
3. **Copie essa URL completa!**

---

## ✅ Passo 2: Acessar o Painel do Supabase

1. Acesse: **https://supabase.com/dashboard**
2. Faça login na sua conta
3. Selecione seu projeto **finapp** (ou o nome que você deu)

---

## ✅ Passo 3: Configurar as URLs de Redirecionamento

### 3.1 - Ir para Authentication Settings

1. No menu lateral esquerdo, clique em **"Authentication"** (ícone de cadeado 🔒)
2. Depois clique em **"URL Configuration"**

### 3.2 - Adicionar as URLs

Você verá dois campos importantes:

#### **Site URL**
Substitua `http://localhost:5173` pela sua URL do Vercel:
```
https://finapp-SEU-USUARIO.vercel.app
```

#### **Redirect URLs**
Adicione AMBAS as URLs (uma por linha):
```
http://localhost:5173/**
https://finapp-SEU-USUARIO.vercel.app/**
```

> **Importante:** O `/**` no final permite que qualquer caminho funcione (dashboard, login, etc.)

### 3.3 - Salvar

1. Clique em **"Save"** no final da página
2. Aguarde alguns segundos para a configuração ser aplicada

---

## ✅ Passo 4: Configurar Google OAuth (se ainda não fez)

Se você ainda não configurou o Google OAuth no Supabase:

### 4.1 - Criar Projeto no Google Cloud Console

1. Acesse: **https://console.cloud.google.com**
2. Crie um novo projeto ou selecione um existente
3. No menu lateral, vá em **"APIs & Services"** → **"Credentials"**

### 4.2 - Criar OAuth 2.0 Client ID

1. Clique em **"+ CREATE CREDENTIALS"**
2. Selecione **"OAuth client ID"**
3. Escolha **"Web application"**
4. Configure:
   - **Name:** FinApp
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     https://finapp-SEU-USUARIO.vercel.app
     ```
   - **Authorized redirect URIs:**
     ```
     https://SEU-PROJETO.supabase.co/auth/v1/callback
     ```
     ⚠️ **Substitua** `SEU-PROJETO` pelo nome do seu projeto no Supabase
     
     Para encontrar a URL correta:
     - Vá no Supabase → Authentication → Providers → Google
     - Copie o "Callback URL (for OAuth)" que aparece lá

5. Clique em **"CREATE"**
6. **Copie** o `Client ID` e `Client Secret`

### 4.3 - Adicionar no Supabase

1. Volte para o Supabase
2. Vá em **Authentication** → **Providers**
3. Procure por **"Google"** e clique nele
4. Ative o toggle **"Enable"**
5. Cole o **Client ID** e **Client Secret** do Google
6. Clique em **"Save"**

---

## ✅ Passo 5: Testar

1. Acesse sua URL do Vercel: `https://finapp-SEU-USUARIO.vercel.app`
2. Clique em **"Google"** para fazer login
3. Se tudo estiver correto, você será redirecionado para o Google e depois voltará logado no app! 🎉

---

## 🐛 Problemas Comuns

### Erro: "redirect_uri_mismatch"
**Solução:** Verifique se as URLs no Supabase e no Google Cloud Console estão EXATAMENTE iguais, incluindo `https://` e sem barras extras no final.

### Erro: "Invalid redirect URL"
**Solução:** Certifique-se de adicionar `/**` no final das Redirect URLs no Supabase.

### Login funciona local mas não no Vercel
**Solução:** Verifique se você adicionou AMBAS as URLs (localhost E vercel) em todos os lugares.

---

## 📋 Checklist Rápido

- [ ] Fazer deploy no Vercel e copiar a URL
- [ ] Adicionar URL do Vercel no Supabase → Authentication → URL Configuration → Site URL
- [ ] Adicionar URL do Vercel no Supabase → Authentication → URL Configuration → Redirect URLs (com /**)
- [ ] (Se necessário) Configurar Google OAuth no Google Cloud Console
- [ ] (Se necessário) Adicionar credenciais do Google no Supabase → Authentication → Providers → Google
- [ ] Testar login com Google na URL do Vercel
- [ ] Celebrar! 🎉

---

## 💡 Dica

Sempre que você mudar o domínio do Vercel (ou adicionar um domínio personalizado), lembre-se de atualizar essas URLs no Supabase!
