
# KWcar Intelligence - Plataforma de Inteligência Veicular e Cadastral

## Visão Geral
O **KWcar Intelligence** é uma aplicação web de alta performance desenvolvida para realizar consultas profundas de dados veiculares, análise de crédito (PF/PJ), verificação de antecedentes e diagnósticos visuais assistidos por Inteligência Artificial.

A plataforma atua como um agregador de fontes de dados governamentais e privadas (Infosimples, Detran, Receita Federal, BrasilAPI) enriquecida por análise generativa (Google Gemini).

## Stack Tecnológica

### Frontend
- **Core:** React 19 (Hooks, Context API).
- **Roteamento:** React Router DOM v6+.
- **Estilização:** Tailwind CSS (Utilitários, Animações Customizadas).
- **Ícones:** Lucide React.
- **Gráficos:** Recharts.

### Camada de Serviços (Service Layer)
- **Integração Governamental:** Infosimples API v2 (via Proxy CORS).
- **Dados Públicos:** BrasilAPI (REST).
- **Inteligência Artificial:** Google Gemini 2.5 Flash & 3.0 Pro Vision (SDK oficial).
- **Simulação Governamental:** Mock de WSDenatran (devido a restrições de mTLS em browser).

## Funcionalidades Principais
1.  **Dossiê Pessoa (PF/PJ):** Varredura completa em Receita Federal, Detran (bens), Processos Jurídicos e Antecedentes.
2.  **Dossiê Veicular:** Consulta via Placa/Chassi/FIPE, detectando roubos, leilões e restrições.
3.  **Catálogo de Serviços (v2):** Acesso dinâmico a mais de 300 endpoints da Infosimples.
4.  **Scanner AI:** Análise visual de danos em veículos e OCR de documentos (CNH/CRLV).
5.  **Utilitários:** Ferramentas de geolocalização (CEP), bancárias e taxas financeiras.

## Estrutura de Pastas
- `/components`: Componentes de UI reutilizáveis (Layout, Cards, Modais).
- `/pages`: Telas principais da aplicação (rotas).
- `/services`: Lógica de negócios e comunicação com APIs externas.
- `/docs`: Documentação técnica e manuais de referência.
