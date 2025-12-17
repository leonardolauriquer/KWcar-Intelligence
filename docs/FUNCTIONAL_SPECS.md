
# Especificações Funcionais e Requisitos de Execução

Este documento detalha o funcionamento técnico de cada módulo do **KWcar Intelligence**, especificando as entradas esperadas (Inputs), o fluxo de processamento e os requisitos de API.

---

## 1. Módulo: Dossiê Pessoa (`/person`)

### Função: Consulta de CPF (Pessoa Física)
*   **Objetivo:** Obter situação cadastral na Receita Federal, Score de crédito estimado e veículos vinculados.
*   **Inputs Necessários:**
    1.  Número do CPF (11 dígitos).
    2.  Data de Nascimento (DD/MM/AAAA) - **Obrigatório** para a API da Receita Federal via Infosimples.
*   **Fluxo de Execução:**
    1.  Frontend valida formato e data.
    2.  Tenta API Infosimples (`receita-federal/cpf`).
    3.  *Se falhar ou sem token:* Tenta API Denatran (Simulada).
    4.  *Se falhar:* Executa `geminiService.generatePersonProfile` (IA) para gerar perfil simulado baseado em probabilidade demográfica.
*   **Requisitos:** `INFOSIMPLES_TOKEN` (Produção) ou `API_KEY` (Fallback IA).

### Função: Consulta de CNPJ (Pessoa Jurídica)
*   **Objetivo:** Obter QSA (Sócios), Endereço, Situação Cadastral e Capital Social.
*   **Inputs Necessários:**
    1.  Número do CNPJ (14 dígitos).
*   **Fluxo de Execução:**
    1.  Tenta API Infosimples (`receita-federal/cnpj`) para dados profundos.
    2.  *Fallback:* Tenta BrasilAPI (`/cnpj/v1/{cnpj}`) para dados públicos gratuitos.
*   **Requisitos:** Conexão internet (BrasilAPI é aberta).

---

## 2. Módulo: Radar Veicular (`/vehicle`)

### Função: Consulta por Placa ou Chassi
*   **Objetivo:** Identificar veículo, restrições (roubo/furto, judicial), proprietário e débitos.
*   **Inputs Necessários:**
    1.  Placa (ABC1234 ou ABC-1234) OU Chassi.
*   **Fluxo de Execução:**
    1.  Verifica se é placa ou código FIPE.
    2.  Tenta API Infosimples (`senatran/veiculo`).
    3.  *Se falhar:* Tenta API Denatran (Simulada).
    4.  *Se falhar:* Executa `geminiService.generateVehicleReport` (IA) criando um relatório técnico baseado no modelo decodificado pela placa.
*   **Requisitos:** `INFOSIMPLES_TOKEN`.

### Função: Consulta Tabela FIPE
*   **Objetivo:** Obter valor de mercado e histórico de preço.
*   **Inputs Necessários:** Código FIPE (ex: 001004-9).
*   **Requisitos:** BrasilAPI (Gratuito).

---

## 3. Módulo: Comparativo (`/compare`)

### Função: Batalha de Veículos
*   **Objetivo:** Comparar tecnicamente dois veículos e fornecer um veredito de compra.
*   **Inputs Necessários:** Nome de dois modelos de carro (ex: "Civic 2020" vs "Corolla 2020").
*   **Processamento:**
    *   Envia prompt complexo para o **Gemini 2.5 Flash**.
    *   A IA retorna um JSON estruturado com: Specs, Pros, Cons e Veredito.
*   **Requisitos:** `API_KEY` (Google).

---

## 4. Módulo: Vision AI (`/scanner`)

### Função: Análise Visual e OCR
*   **Objetivo:** Detectar modelo do carro, danos na lataria ou ler dados de CNH/CRLV.
*   **Inputs Necessários:** Arquivo de imagem (JPG/PNG/WEBP).
*   **Processamento:**
    *   Converte imagem para Base64.
    *   Envia para **Gemini 3.0 Pro Vision**.
    *   Prompt instrui a IA a diferenciar entre "Carro" e "Documento".
    *   Regex no Frontend tenta extrair Placa se detectada no texto da IA.
*   **Requisitos:** `API_KEY` (Google). Requer modelo Pro (mais custoso/lento que o Flash, mas necessário para visão).

---

## 5. Módulo: Utilitários (`/utilities`)

*   **CEP:** Busca endereço via BrasilAPI (`/cep/v1`). Requer apenas o CEP.
*   **Bancos:** Lista todos os bancos do Brasil via BrasilAPI (`/banks/v1`).
*   **Taxas:** Retorna Selic/CDI via BrasilAPI (`/taxas/v1`).
*   **DDD:** Retorna cidades de um DDD via BrasilAPI (`/ddd/v1`).
*   **Requisitos:** Todos gratuitos e abertos.

---

## 6. Módulo: AI Assistant (Chatbot)

### Função: Assistente Conversacional com Tools
*   **Objetivo:** Permitir navegação e consultas via linguagem natural (texto ou voz).
*   **Inputs:** Texto do usuário ou áudio (Web Speech API).
*   **Processamento:**
    *   O Chatbot possui ferramentas (`tools`) definidas: `navigate_to_page`, `execute_query`.
    *   Se o usuário diz "Consulte a placa ABC", a IA chama a função `execute_query`.
    *   O Frontend intercepta a chamada, executa o serviço real (`generateVehicleReport`) e devolve o JSON para a IA.
    *   A IA formata a resposta final para o usuário.
*   **Requisitos:** `API_KEY`. Permissão de microfone para voz.

---

## 7. Configurações (`/settings`)

### Função: Gestão de Preferências e Compliance
*   **Temas:** Altera o `hue-rotate` do CSS global.
*   **Compliance:** Exibe Termos de Uso e LGPD.
*   **Dados:** Limpeza de sessão (`logout`).
*   **Requisitos:** `AuthContext` e `LocalStorage`.
