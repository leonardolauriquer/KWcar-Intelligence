
# Arquitetura de Software e Serviços de Backend

## 1. Arquitetura Geral
O sistema segue o padrão **SPA (Single Page Application)**. Não há um backend proprietário (Node/Python) hospedado; a aplicação consome APIs de terceiros diretamente do cliente.

**Desafio de CORS:**
APIs corporativas como a Infosimples bloqueiam requisições diretas do navegador por segurança (CORS).
**Solução:** Implementamos um `CORS Proxy` (`corsproxy.io` ou similar) na camada de serviço (`infosimplesService.ts`) para tunelar as requisições durante o desenvolvimento.

## 2. Camada de Serviços (`/services`)

A lógica "backend" está encapsulada em módulos TypeScript dentro da pasta `services`.

### A. Infosimples Service (`infosimplesService.ts`)
É o coração da aplicação.
- **Autenticação:** Utiliza Token Bearer via Query Params.
- **Generic Executor:** Implementamos `executeGenericConsulta` para suportar os 300+ endpoints da API v2 sem criar 300 funções manuais.
- **Tratamento de Erros:**
  - `Code 606`: Parâmetros ausentes (Tratado no frontend via *Parameter Aliasing*).
  - `Code 600/600+`: Erros de negócio da API.

### B. Gemini Service (`geminiService.ts`)
Atua como Fallback e Analista.
- **Perfilamento:** Se as APIs oficiais falharem, a IA gera estimativas baseadas em padrões probabilísticos (Mock Inteligente).
- **Visão:** O modelo `gemini-3-pro-preview` é usado para OCR e detecção de danos em fotos.
- **Engenharia de Prompt:** Os prompts são estruturados para retornar JSON estrito.

### C. BrasilAPI Service (`brasilApiService.ts`)
Fonte de dados abertos que não requer autenticação.
- Usado para: CEP, FIPE, Bancos, CNPJ (dados básicos).

### D. Denatran Service (`denatranService.ts`)
- **Estado Atual:** Simulação.
- **Motivo:** A API oficial do Denatran (Serpro) exige certificado digital A1 (e-CNPJ) via mTLS (Mutual TLS). Navegadores não suportam injeção direta de certificados mTLS via JavaScript por segurança.
- **Produção:** Em um cenário real, exigiria um Middleware (Node.js/Python) para segurar o certificado e repassar a requisição.

## 3. Fluxo de Dados (Data Flow)

1.  **Input do Usuário:** O usuário insere um dado (ex: CPF).
2.  **Normalização:** O frontend remove caracteres especiais (`. - /`).
3.  **Parameter Aliasing:** O sistema envia múltiplas chaves para a API para garantir compatibilidade (ex: envia `{ cpf: '...', documento: '...' }`).
4.  **Execução:**
    - `fetch` -> `Proxy` -> `API Externa`.
5.  **Resposta:**
    - Sucesso (200): Dados populam a UI.
    - Falha (API Error): O sistema tenta o próximo serviço (Chain of Responsibility). Ex: Infosimples falhou -> Tenta BrasilAPI -> Tenta IA.

## 4. Segurança
- **API Keys:** Armazenadas em variáveis de ambiente (`process.env`).
- **Sessão:** Autenticação simulada via `sessionStorage`.
- **Validação:** Inputs são sanitizados antes do envio para evitar injeção básica.
