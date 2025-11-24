# 🔑 Como Criar o Login com Google (Passo a Passo)

Se a lista de "IDs do cliente OAuth 2.0" está vazia, siga estes passos para criar:

## ✅ Passo 1: Preparar o Supabase (Pegar a URL de Callback)

Antes de ir para o Google, você precisa de um link especial do Supabase.

1. Acesse seu projeto no **Supabase**.
2. Vá em **Authentication** (ícone cadeado 🔒) -> **Providers**.
3. Clique em **Google**.
4. Procure o campo **"Callback URL (for OAuth)"**.
5. Clique no ícone de copiar 📋.
   - Vai ser algo parecido com: `https://seu-projeto.supabase.co/auth/v1/callback`
   - **Guarde esse link**, vamos usar no Passo 3.

---

## ✅ Passo 2: Configurar a Tela de Consentimento (Google Cloud)

1. Acesse: **https://console.cloud.google.com/apis/credentials**
2. Se pedir para criar um projeto, crie um com o nome "FinApp".
3. No menu lateral esquerdo, clique em **"OAuth consent screen"** (Tela de permissão OAuth).
4. Escolha **External** (Externo) e clique em **CREATE**.
5. Preencha apenas o obrigatório:
   - **App name:** FinApp
   - **User support email:** Seu email.
   - **Developer contact information:** Seu email novamente.
6. Clique em **SAVE AND CONTINUE** em todas as próximas telas (não precisa adicionar escopos ou usuários de teste agora).
7. No final, clique em **BACK TO DASHBOARD**.

---

## ✅ Passo 3: Criar as Credenciais (Onde você estava)

Agora sim vamos criar o ID que estava faltando:

1. No menu lateral, clique em **"Credentials"** (Credenciais).
2. Clique no botão **"+ CREATE CREDENTIALS"** (no topo) -> **OAuth client ID**.
3. Em **Application type**, escolha **Web application**.
4. Em **Name**, pode deixar "Web client 1" ou mudar para "FinApp Web".

### ⚠️ AQUI É A PARTE IMPORTANTE:

Você verá duas seções para adicionar URLs. Preencha assim:

**Authorized JavaScript origins (Origens JavaScript autorizadas):**
Clique em "ADD URI" e adicione estas duas (uma de cada vez):
1. `http://localhost:5173`
2. `https://finapp-amber.vercel.app`  <-- (Sua URL do Vercel)

**Authorized redirect URIs (URIs de redirecionamento autorizadas):**
Clique em "ADD URI" e cole o link que você copiou do Supabase no Passo 1:
1. `https://seu-projeto.supabase.co/auth/v1/callback`

5. Clique em **CREATE**.

---

## ✅ Passo 4: Conectar no Supabase

Assim que você criar, vai aparecer uma janela com **"Your Client ID"** e **"Your Client Secret"**.

1. Copie o **Client ID**.
2. Volte no **Supabase** -> **Authentication** -> **Providers** -> **Google**.
3. Cole no campo **Client ID**.
4. Volte no Google, copie o **Client Secret**.
5. Cole no Supabase no campo **Client Secret**.
6. Ative a chavinha **Enable Sign in with Google** (se não estiver ativa).
7. Clique em **Save**.

---

## 🎉 Pronto!

Agora tente fazer login no seu site: `https://finapp-amber.vercel.app`.
O Google vai pedir permissão e depois logar você no sistema!
