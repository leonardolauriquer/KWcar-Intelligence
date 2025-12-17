
# KWcar Intelligence Platform v2.5

![Project Status](https://img.shields.io/badge/status-production_ready-emerald)
![React](https://img.shields.io/badge/react-18.3-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5%20%26%203.0-purple)

> **Plataforma de Inteligência Cibernética e Análise Veicular**
> 
> O KWcar é um hub de inteligência que agrega dados de fontes governamentais (Receita Federal, Detran, Tribunais) e utiliza IA Generativa para análise de risco, OCR e comparativos técnicos.

---

## ⚡ Funcionalidades & Requisitos

O sistema opera sob uma arquitetura de **Hybrid Data Fetching**. Abaixo, o mapa funcional do que é necessário para cada módulo operar 100%.

| Módulo | Função | Fonte de Dados Principal | Fallback / Secundário | Requisito Chave |
| :--- | :--- | :--- | :--- | :--- |
| **Dossiê Pessoa** | Consultar CPF | Infosimples (Receita Federal) | Denatran (Simulado) / IA | `INFOSIMPLES_TOKEN` + Data Nasc. |
| **Dossiê Pessoa** | Consultar CNPJ | BrasilAPI (Dados Abertos) | Infosimples (QSA Detalhado) | Acesso Livre (BrasilAPI) |
| **Radar Veicular** | Placa / Renavam | Infosimples (Senatran/Detran) | IA Simulation (Gemini) | `INFOSIMPLES_TOKEN` |
| **Radar Veicular** | Tabela FIPE | BrasilAPI | - | Acesso Livre |
| **Comparativo** | Batalha de Veículos | Google Gemini 2.5 Flash | - | `API_KEY` (Google AI) |
| **Vision AI** | Scanner de Danos/OCR | Google Gemini 3.0 Pro Vision | - | `API_KEY` (Google AI) |
| **Utilitários** | CEP / Bancos / Taxas | BrasilAPI | - | Acesso Livre |
| **Catálogo API** | 300+ Endpoints | Infosimples v2 | - | `INFOSIMPLES_TOKEN` |
| **AI Assistant** | Chatbot & Comandos | Google Gemini 2.5 Flash | - | `API_KEY` (Google AI) |

---

## 🛠 Tech Stack

### Core
*   **Frontend:** React (Vite), TypeScript, Tailwind CSS.
*   **UX/UI:** Glassmorphism Design, Lucide Icons, Toasts Notifications.
*   **Gerenciamento de Estado:** Context API (`AuthContext`, `ToastContext`).

### Inteligência Artificial
*   **LLM:** Google Gemini 2.5 Flash (Para raciocínio rápido e chat).
*   **Vision:** Gemini 3.0 Pro Vision (Para análise de imagens e OCR).
*   **Audio:** Web Speech API (Para comandos de voz no assistente).

### Integrações (Services)
*   **`infosimplesService`:** Gateway para APIs governamentais (requer Proxy CORS em dev).
*   **`brasilApiService`:** Consumo de dados públicos abertos.
*   **`geminiService`:** Camada de abstração do Google GenAI SDK.

---

## ⚙️ Instalação e Configuração

### 1. Clonar e Instalar
```bash
git clone https://github.com/seu-org/kwcar-intelligence.git
cd kwcar-intelligence
npm install
```

### 2. Configurar Variáveis de Ambiente (.env)
O sistema exige chaves para funcionar plenamente. Crie um arquivo `.env` na raiz:

```env
# [OBRIGATÓRIO] Chave do Google AI Studio (Gemini)
# Obtenha em: https://aistudio.google.com/app/apikey
API_KEY="AIzaSy..."

# [OPCIONAL] Token da Infosimples (Para dados reais de CPF/Placa)
# Se não fornecido, o sistema usará BrasilAPI ou Simulação IA onde possível.
INFOSIMPLES_TOKEN="seu_token_aqui"

# [DEV] Define se deve tentar conexão real mTLS com Denatran (Geralmente false em web)
USE_REAL_DENATRAN=false
```

### 3. Executar
```bash
npm run dev
```

## ⚠️ Notas de Arquitetura

1.  **CORS Proxy:**
    Como as APIs da Infosimples não possuem headers CORS para browsers, utilizamos um proxy (`corsproxy.io`) no arquivo `infosimplesService.ts`. Em produção, substitua por um Backend Node.js.

2.  **Privacidade & Compliance:**
    O App possui uma seção de Configurações onde o usuário aceita os termos de uso. Nenhum dado é salvo em banco de dados externo neste MVP (apenas `localStorage` do navegador do usuário).

---

**Licença:** Proprietária / Private Use.
