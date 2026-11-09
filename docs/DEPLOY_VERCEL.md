# 🚀 Guia de Deploy no Vercel — CondoTech Sevilla

Este projeto é uma Single Page Application (SPA) construída com **React 19**, **TypeScript** e **Vite**, 100% pronta para deploy imediato na plataforma **Vercel** com suporte a rotas estáticas, rewrites de SPA e cabeçalhos de segurança HTTP.

---

## ⚡ Método 1: Deploy com 1-Click via Git (GitHub / GitLab / Bitbucket)

1. **Suba o repositório** para a sua conta no GitHub (ou GitLab).
2. Acesse o painel da Vercel: [https://vercel.com/new](https://vercel.com/new).
3. Selecione o repositório **`condotech-manager-pro`** (ou `condotech-sevilla`).
4. A Vercel detectará automaticamente o framework como **Vite**:
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
   * **Install Command:** `npm install`
5. *(Opcional)* Em **Environment Variables**, adicione sua chave caso queira utilizar a IA externa:
   * `GEMINI_API_KEY`: sua chave de API do Google Gemini.
6. Clique em **Deploy**.
7. Em menos de 60 segundos, sua aplicação estará no ar com domínio SSL gratuito (ex: `https://condotech-sevilla.vercel.app`).

---

## 💻 Método 2: Deploy Direto via Vercel CLI

Caso deseje fazer deploy diretamente do terminal do seu computador:

1. **Instale a Vercel CLI globalmente:**
   ```bash
   npm i -g vercel
   ```

2. **Faça login na sua conta Vercel:**
   ```bash
   vercel login
   ```

3. **Inicie o deploy na raiz do projeto:**
   ```bash
   vercel
   ```
   * *Set up and deploy?* `y`
   * *Which scope do you want to deploy to?* (Selecione sua conta)
   * *Link to existing project?* `n`
   * *What's your project's name?* `condotech-sevilla`
   * *In which directory is your code located?* `./`

4. **Para publicar diretamente em Produção:**
   ```bash
   vercel --prod
   ```

---

## ⚙️ Arquivos de Configuração Incluídos no Repositório

### `vercel.json`
Localizado na raiz do projeto, contém:
* **Rewrites para SPA:** Redireciona todas as sub-rotas para `index.html`, evitando erros de `404 Not Found` ao recarregar a página.
* **Cabeçalhos de Segurança (HTTP Headers):**
  * `X-Content-Type-Options: nosniff`
  * `X-Frame-Options: DENY`
  * `X-XSS-Protection: 1; mode=block`

### `.vercelignore`
Evita que arquivos locais desnecessários (como `.env.local` e `node_modules`) sejam enviados nos builds da Vercel.

---

*Condomínio Residencial Sevilla • Gestão do Síndico-Programador • sevillacond@gmail.com*
