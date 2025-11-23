# 🚀 Deploy no Vercel - Guia Completo

## ✅ Passo 1: Criar Conta no Vercel

1. Acesse: **https://vercel.com/signup**
2. Clique em **"Continue with GitHub"**
3. Faça login com sua conta do GitHub
4. Autorize o Vercel a acessar seus repositórios

---

## ✅ Passo 2: Importar o Projeto

1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Você verá a lista dos seus repositórios do GitHub
3. Procure por **"finapp"**
4. Clique em **"Import"**

---

## ✅ Passo 3: Configurar o Projeto

### 3.1 - Build Settings (já detecta automaticamente):
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

✅ **NÃO precisa alterar nada aqui!**

### 3.2 - Environment Variables (IMPORTANTE!)

Clique em **"Environment Variables"** e adicione:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | (copie do seu arquivo .env) |
| `VITE_SUPABASE_ANON_KEY` | (copie do seu arquivo .env) |

**Como pegar os valores:**
1. Abra o arquivo `.env` no VS Code
2. Copie os valores de `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Cole no Vercel

---

## ✅ Passo 4: Deploy!

1. Clique em **"Deploy"**
2. Aguarde 1-2 minutos (o Vercel vai buildar seu projeto)
3. Quando terminar, você verá: 🎉 **"Congratulations!"**

---

## ✅ Passo 5: Acessar Seu App

Você receberá uma URL tipo:
```
https://finapp-SEU-USUARIO.vercel.app
```

**Pronto! Seu app está online!** 🚀

---

## 🔧 Configurações Adicionais (Opcional)

### Adicionar um domínio personalizado:
1. Vá em **Settings** → **Domains**
2. Adicione seu domínio (se tiver)

### Alterar o nome do projeto:
1. Vá em **Settings** → **General**
2. Altere o **Project Name**
3. A URL mudará para: `https://NOVO-NOME.vercel.app`

---

## 🔄 Atualizações Automáticas

A partir de agora, **toda vez que você fizer um push no GitHub**, o Vercel vai:
1. Detectar automaticamente
2. Fazer o build
3. Atualizar o deploy

**Workflow:**
```bash
git add .
git commit -m "feat: nova funcionalidade"
git push
# Vercel detecta e faz deploy automaticamente! 🚀
```

---

## 🐛 Solução de Problemas

### Se o deploy falhar:

1. **Erro de build:**
   - Verifique se `npm run build` funciona localmente
   - Veja os logs do Vercel para detalhes

2. **Página em branco:**
   - Verifique se adicionou as variáveis de ambiente
   - Abra o console do navegador (F12) para ver erros

3. **Rotas não funcionam (404):**
   - O arquivo `vercel.json` já resolve isso
   - Se ainda der problema, verifique se foi commitado corretamente

---

## 📝 Checklist Rápido

- [ ] Criar conta no Vercel
- [ ] Importar repositório `finapp`
- [ ] Adicionar variáveis de ambiente (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
- [ ] Clicar em Deploy
- [ ] Testar a URL gerada
- [ ] Celebrar! 🎉

---

## 🎯 Próximos Passos (depois do deploy)

1. Compartilhe a URL com amigos/família
2. Teste todas as funcionalidades online
3. Configure o bot do Telegram para funcionar com a URL de produção (se quiser)

---

**Seu arquivo `.env` está seguro e NÃO foi enviado ao GitHub ou Vercel!**
As variáveis ficam apenas no painel de configuração do Vercel.
