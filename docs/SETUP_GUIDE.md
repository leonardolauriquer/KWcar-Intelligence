
# Guia de Configuração e Execução (Setup Guide)

## Pré-requisitos
- Node.js v18+
- NPM ou Yarn
- Chave de API da Google Gemini (AI Studio)
- Token da Infosimples (Opcional, o projeto tem um padrão, mas pode expirar)

## Instalação

1. **Clone o repositório** (ou baixe os arquivos):
   ```bash
   git clone [url-do-repo]
   cd kwcar-intelligence
   ```

2. **Instale as dependências:**
   O projeto utiliza módulos ES modernos. O `index.html` já importa via CDN (`esm.sh` ou `aistudiocdn`) para execução rápida em ambientes webcontainer, mas para rodar localmente com Vite:

   ```bash
   npm install
   ```
   *Dependências principais:* `react`, `react-dom`, `react-router-dom`, `lucide-react`, `recharts`, `@google/genai`.

## Configuração de Ambiente (.env)

Crie um arquivo `.env` na raiz se estiver rodando localmente. Se estiver no WebContainer/AI Studio, as variáveis são injetadas automaticamente.

```env
# Obrigatório para IA e Visão Computacional
API_KEY="SUA_CHAVE_GEMINI_AQUI"

# Opcional (O sistema tem um fallback, mas para uso intenso use o seu)
INFOSIMPLES_TOKEN="SEU_TOKEN_INFOSIMPLES"

# Flag para debug do Denatran (Deixe false para evitar erros de certificado)
USE_REAL_DENATRAN=false
```

## Executando o Projeto

### Ambiente de Desenvolvimento
```bash
npm run dev
# ou
npx vite
```
O app estará disponível em `http://localhost:5173`.

## Solução de Problemas Comuns

### 1. Erro "Failed to fetch" na consulta
- **Causa:** Bloqueio de CORS do navegador ou bloqueio de AdBlocker no Proxy.
- **Solução:** Desative AdBlockers para o domínio local. Verifique se o `CORS_PROXY` em `infosimplesService.ts` está online.

### 2. Erro 606 (Infosimples)
- **Causa:** Parâmetros obrigatórios faltando.
- **Solução:** Na tela de Serviços, verifique se o serviço escolhido exige dados extras (ex: Data de Nascimento para Receita Federal) e preencha o campo secundário.

### 3. Tela branca ou erro de renderização
- **Causa:** Erro na chave da API do Gemini.
- **Solução:** Verifique o console do navegador (F12). Se houver erro 403/401 do Google, renove a `API_KEY`.
