
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";

// 1. Ferramenta de Navegação
const navigationTool: FunctionDeclaration = {
  name: "navigate_to_page",
  description: "Navega para uma rota específica da aplicação quando o usuário solicita acessar uma área ou funcionalidade.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      route: {
        type: Type.STRING,
        description: "A rota para navegar. Opções: '/' (Dashboard), '/services' (Catálogo), '/person' (Pessoa/CPF/CNPJ), '/vehicle' (Veículo/Placa), '/utilities' (Utilitários/CEP/Bancos), '/scanner' (Scanner Visual), '/settings' (Configurações).",
      },
      reason: {
        type: Type.STRING,
        description: "Breve motivo da navegação.",
      }
    },
    required: ["route"],
  },
};

// 2. Ferramenta de Informações do App
const appKnowledgeTool: FunctionDeclaration = {
  name: "get_app_info",
  description: "Retorna informações técnicas sobre o que o KWcar Intelligence pode fazer.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

// 3. Ferramenta de Consulta Direta (NOVA - Estratégia de Agente Ativo)
const queryTool: FunctionDeclaration = {
  name: "execute_query",
  description: "Executa uma consulta real de dados veiculares ou cadastrais diretamente na base de dados quando o usuário fornece uma Placa, CPF, CNPJ ou CEP no chat.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        description: "Tipo da consulta: 'VEHICLE' (para placas/chassi/renavam), 'PERSON' (para CPF), 'COMPANY' (para CNPJ), 'CEP' (para endereço).",
      },
      value: {
        type: Type.STRING,
        description: "O valor a ser consultado (ex: ABC1234, 00000000000, 01001000).",
      }
    },
    required: ["type", "value"],
  },
};

// Inicialização do Chat
export const createChatSession = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      temperature: 0.5, // Temperatura menor para ser mais preciso nos dados técnicos
      systemInstruction: `
        Você é o KW-AI, um agente de inteligência da plataforma KWcar.
        
        SEUS SUPERPODERES:
        1. NAVEGAR: Se o usuário disser "quero ir para veículos" ou "onde consulto cpf", use 'navigate_to_page'.
        2. CONSULTAR E RESPONDER: Se o usuário disser "Consulte a placa ABC1234" ou "Quem é o CPF 123..." ou "Busque o CEP 01001000", use 'execute_query'.
           - NÃO diga "vou navegar para a página de consulta". Diga "Consultando base de dados..." e execute a tool IMEDIATAMENTE.
           - Ao receber os dados da tool 'execute_query', analise o JSON retornado e escreva uma resposta sumarizada e bonita para o usuário.
           - Se for carro: Informe Modelo, Ano, Valor FIPE estimado e se tem restrições.
           - Se for pessoa: Informe Nome, Status do CPF e Score.
        
        PERSONALIDADE:
        - Profissional, direto e eficiente (estilo Jarvis/AI Assistant).
        - Use formatação Markdown (negrito, listas) para destacar os dados importantes (ex: **Modelo:** Honda Civic).
        - Se a consulta falhar, sugira gentilmente a navegação manual.
      `,
      tools: [{ functionDeclarations: [navigationTool, appKnowledgeTool, queryTool] }],
    },
  });
};
