
# KWcar Intelligence Platform v2.4

![Project Status](https://img.shields.io/badge/status-active-emerald)
![React](https://img.shields.io/badge/react-19.0-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%20Pro-purple)

> **Plataforma de Inteligência Cibernética e Análise Veicular**
> 
> O KWcar não é apenas um dashboard; é um hub de agregação de dados que combina APIs governamentais oficiais com modelos de Inteligência Artificial Generativa para oferecer diagnósticos de risco em tempo real.

---

## ⚡ Visão Geral

O projeto foi desenhado para resolver a fragmentação de dados no setor automotivo e de crédito. Utilizamos uma arquitetura de **Hybrid Data Fetching**:
1.  **Prioridade 0:** Busca em bases oficiais (Infosimples, Dataprev, Denatran).
2.  **Prioridade 1:** Enriquecimento via BrasilAPI (Dados abertos).
3.  **Fallback Inteligente:** Se as APIs oficiais falharem ou estiverem offline, o **Google Gemini 2.5 Flash** entra em ação para simular cenários ou extrair dados não estruturados via OCR.

A interface segue o conceito **"Glassmorphism HUD"**, priorizando a densidade de informações e a legibilidade em ambientes com alto fluxo de dados.

## 🛠 Tech Stack

### Core
*   **Frontend:** React 19 (RC) + Vite.
*   **Linguagem:** TypeScript (Strict Mode).
*   **State Management:** React Context API + LocalStorage/SessionStorage para persistência leve.
*   **Estilização:** Tailwind CSS v3.4 com `backdrop-filter` intensivo e animações CSS nativas.

### Inteligência Artificial & Serviços
*   **LLM:** Google Gemini 2.5 Flash (Agente Conversacional e Dados Preditivos).
*   **Computer Vision:** Gemini 3 Pro Vision (Análise de danos veiculares e OCR de CNH).
*   **APIs Integradas:**
    *   `Infosimples v2` (Proxy de serviços governamentais).
    *   `BrasilAPI` (Dados públicos).
    *   `WSDenatran` (Simulação de endpoints SOAP/REST oficiais).

## 🚀 Funcionalidades Chave

### 1. Radar Veicular 360º
Consulta unificada que aceita **Placa, Chassi ou Código FIPE**.
*   Cruza dados de restrições judiciais, roubo/furto e leilão.
*   Histórico de preços da Tabela FIPE (últimos 12 meses).
*   *Smart Fallback:* Se o Denatran estiver instável, a IA projeta as especificações técnicas do veículo baseadas no modelo identificado.

### 2. Dossiê Investigativo (PF & PJ)
*   **Busca CPF:** Validação na Receita Federal + Varredura de veículos vinculados ao documento.
*   **Busca CNPJ:** Quadro Societário (QSA), Capital Social e Endereços.
*   **Validação CNH:** Verifica bloqueios, categoria e data de primeira habilitação.

### 3. KW-AI Assistant (Agente Ativo)
Diferente de chatbots comuns, o nosso agente possui **Function Calling**.
*   O usuário pede: *"Consulte a placa ABC-1234"*
*   A IA entende a intenção, executa a função `execute_query('VEHICLE', 'ABC1234')` no código e retorna o JSON processado em linguagem natural.

### 4. Vision AI Scanner
Upload de fotos de veículos ou documentos. O sistema identifica:
*   Modelo e ano aproximado do carro.
*   Danos visíveis (lataria, vidros).
*   OCR de campos da CNH/CRLV.

## ⚙️ Instalação e Configuração

Este projeto utiliza variáveis de ambiente para chaves de API. Nunca comite o arquivo `.env` em repositórios públicos.

### 1. Clonar e Instalar
```bash
git clone https://github.com/seu-org/kwcar-intelligence.git
cd kwcar-intelligence
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# (Obrigatório) Chave do Google AI Studio para o Gemini
API_KEY="AIzaSy..."

# (Opcional) Token da Infosimples. O projeto possui um token de demo embutido, 
# mas para produção, substitua pelo seu.
INFOSIMPLES_TOKEN="seu_token_aqui"

# (Opcional) Define se deve tentar bater na API real do Denatran (requer mTLS)
# Mantenha false para ambiente de desenvolvimento web.
USE_REAL_DENATRAN=false
```

### 3. Rodar em Desenvolvimento
```bash
npm run dev
```
Acesse: `http://localhost:5173`

## 🧩 Arquitetura de Pastas

```
/src
  ├── components/    # UI Kits (Cards, Modals, HUD Layout)
  ├── services/      # Camada de Integração (API Gateway)
  │     ├── geminiService.ts       # Lógica de LLM e Vision
  │     ├── infosimplesService.ts  # Proxy para APIs Gov
  │     └── aiAssistantService.ts  # Definição de Tools/Agents
  ├── pages/         # Rotas da Aplicação
  ├── types/         # Definições TypeScript (Interfaces de DTOs)
  └── docs/          # Documentação técnica detalhada das APIs
```

## ⚠️ Notas Técnicas Importantes

1.  **CORS Proxy:**
    Como as APIs da Infosimples e Gov.br não possuem headers CORS configurados para acesso direto via browser (`Access-Control-Allow-Origin: *`), utilizamos um proxy (`corsproxy.io`) no arquivo `infosimplesService.ts`. Em produção, isso deve ser substituído por um Backend (Node.js/Python) atuando como Middleware.

2.  **mTLS (Denatran):**
    A integração real com o Serpro requer certificado digital A1. Como browsers não suportam injeção programática segura de certificados mTLS via JS, o `denatranService.ts` opera em modo de simulação ou repassa para a IA em ambiente de desenvolvimento.

## 🤝 Contribuição

PRs são bem-vindos. Por favor, garanta que os tipos do TypeScript estejam estritos e rode o linter antes de submeter.

1.  Fork o projeto
2.  Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit (`git commit -m 'Add: New AI Capability'`)
4.  Push (`git push origin feature/AmazingFeature`)

---

**Licença:** Proprietária / Private Use.
*Desenvolvido pela Equipe de Engenharia KWcar.*
