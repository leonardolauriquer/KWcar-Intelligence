
# Estado Atual do Projeto (Project Status)

**Data da Última Atualização:** 24/05/2024
**Versão:** 1.2.0 (Stable Beta)

## ✅ Módulos Concluídos

### 1. Core & UI
- [x] Layout Responsivo (Glassmorphism).
- [x] Dashboard Analítico com gráficos Recharts.
- [x] Autenticação (Login/Logout com persistência de sessão).
- [x] Proteção de Rotas.

### 2. Módulo de Consultas (PersonQuery / VehicleQuery)
- [x] Busca CPF/CNPJ híbrida (BrasilAPI + Infosimples).
- [x] Busca Veicular híbrida (FIPE + Infosimples + IA).
- [x] Lógica de Fallback (Se API A falha, tenta API B).
- [x] Visualização de Dossiê (Score, Bens, Histórico).

### 3. Catálogo de Serviços v2 (Services.tsx)
- [x] Mapeamento de 300+ endpoints da Infosimples.
- [x] Execução Genérica Dinâmica.
- [x] Categorização Automática (Detran, Tribunais, etc.).
- [x] **Correção do Erro 606:** Implementação de Aliasing de Parâmetros (`cpf` + `documento`, `processo` + `numero`).
- [x] Suporte a Inputs Secundários (Data Nasc., Renavam).

### 4. Inteligência Artificial
- [x] Geração de Perfil Simulado (Gemini Flash).
- [x] Scanner Visual (Gemini Pro Vision) para análise de danos/documentos.

### 5. Utilitários
- [x] Busca CEP, DDD, Bancos e Taxas (Selic/CDI).

## 🚧 Em Desenvolvimento / Limitações Conhecidas

1.  **Proxy CORS:**
    - O sistema depende de um proxy público (`corsproxy.io`). Para produção, é **obrigatório** criar um backend próprio para intermediar as chamadas e proteger o Token.

2.  **API Denatran:**
    - Atualmente operando em modo "Simulação/IA" devido à impossibilidade técnica de usar certificados A1 (mTLS) diretamente no navegador.

3.  **Persistência:**
    - O histórico de consultas não é salvo em banco de dados (apenas em memória/estado React).

## 📅 Roadmap Futuro

- [ ] **Backend Node.js:** Criar servidor Express/NestJS para remover a dependência do proxy público.
- [ ] **Banco de Dados:** Implementar Supabase ou Firebase para salvar histórico de consultas e usuários.
- [ ] **Exportação PDF:** Gerar relatórios em PDF dos dossiês consultados.
- [ ] **Integração Pagamentos:** Gateway para cobrar por consulta (Stripe/MercadoPago).
- [ ] **Webhooks:** Notificar usuário quando um monitoramento (ex: processo novo) for ativado.
