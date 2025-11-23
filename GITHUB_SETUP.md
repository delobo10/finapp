# 🚀 Guia: Conectar FinApp ao GitHub

## ✅ Passo 1: Configurar Git (FAÇA PRIMEIRO)

Abra o terminal e execute:

```bash
git config --global user.name "Seu Nome Aqui"
git config --global user.email "seu.email@gmail.com"
```

**Importante:** Use o mesmo email da sua conta do GitHub!

---

## ✅ Passo 2: Fazer o Primeiro Commit

```bash
git add .
git commit -m "Initial commit: FinApp - Sistema de Gestão Financeira completo"
```

---

## ✅ Passo 3: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. **Nome do repositório:** `finapp` (ou o nome que preferir)
3. **Descrição:** "Sistema de Gestão Financeira Pessoal com React + Supabase + Telegram Bot"
4. Deixe **Público** ou **Privado** (sua escolha)
5. **NÃO** marque "Add a README file"
6. **NÃO** adicione .gitignore (já temos um)
7. Clique em **"Create repository"**

---

## ✅ Passo 4: Conectar o Repositório Local ao GitHub

Depois de criar o repositório no GitHub, copie a URL que aparece (algo como `https://github.com/seu-usuario/finapp.git`).

Execute no terminal:

```bash
git remote add origin https://github.com/SEU-USUARIO/finapp.git
git branch -M main
git push -u origin main
```

**Substitua** `SEU-USUARIO` pelo seu nome de usuário do GitHub!

---

## ✅ Passo 5: Verificar

Depois do push, acesse seu repositório no GitHub e verifique se todos os arquivos foram enviados corretamente.

---

## 📝 Comandos Futuros (para próximas alterações)

### Salvar alterações:
```bash
git add .
git commit -m "Descrição das alterações"
git push
```

### Ver status:
```bash
git status
```

### Ver histórico:
```bash
git log --oneline
```

---

## 🔒 Segurança: Arquivo .env

O arquivo `.env` está no `.gitignore` e **NÃO** será enviado ao GitHub.

**Nunca** compartilhe suas chaves:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `TELEGRAM_BOT_TOKEN` (no Supabase)

---

## 📦 O que foi incluído no repositório

✅ Todo o código-fonte (src/)
✅ Configurações (package.json, vite.config.ts, tailwind.config.js)
✅ Schemas SQL (para documentação)
✅ README.md
✅ .gitignore

❌ node_modules/ (ignorado)
❌ .env (ignorado - SEGURANÇA!)
❌ dist/ (ignorado - build gerado)
❌ Arquivos temporários (telegram-webhook-*.ts, FIX_*.sql)

---

## 🎉 Pronto!

Agora seu projeto FinApp está versionado e seguro no GitHub!
