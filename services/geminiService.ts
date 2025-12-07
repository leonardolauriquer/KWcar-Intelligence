import { GoogleGenAI, Type } from "@google/genai";

// Inicializa o cliente Gemini com a chave de API do ambiente
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Gera um perfil de pessoa fictício baseado em um nome ou CPF simulado.
 * Usa Flash para resposta rápida.
 */
export const generatePersonProfile = async (query: string) => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Atue como um sistema de banco de dados governamental simulado.
      O usuário buscou por: "${query}".
      Gere um perfil fictício JSON realista de um cidadão brasileiro para fins de demonstração.
      NÃO use dados reais de ninguém. Invente os dados.
      
      Schema esperado:
      {
        "name": "Nome Completo",
        "cpf": "000.000.000-00",
        "status": "Regular" | "Pendente" | "Suspenso",
        "score": number (0-1000),
        "vehicles": [{ "model": "Carro Ano", "plate": "ABC-1234", "status": "Em dia" }],
        "notes": "Breve histórico financeiro simulado"
      }
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            cpf: { type: Type.STRING },
            status: { type: Type.STRING },
            score: { type: Type.INTEGER },
            vehicles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  model: { type: Type.STRING },
                  plate: { type: Type.STRING },
                  status: { type: Type.STRING }
                }
              }
            },
            notes: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Erro ao gerar perfil:", error);
    throw error;
  }
};

/**
 * Gera um relatório veicular detalhado baseado em placa ou modelo.
 */
export const generateVehicleReport = async (query: string) => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Gere um relatório técnico detalhado (fictício mas realista baseado no modelo provável) para a busca: "${query}".
      Se for uma placa, invente um carro associado.
      Schema JSON:
      {
        "model": "Marca Modelo Versão",
        "year": "Ano",
        "priceEstimate": "Valor Fipe Estimado",
        "specs": ["Motor", "Potência", "Consumo"],
        "commonIssues": ["Problema 1", "Problema 2"],
        "history": "Histórico simulado do veículo (multas, leilão, etc)"
      }
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Erro ao gerar veículo:", error);
    throw error;
  }
};

/**
 * Analisa uma imagem (carro ou documento) usando o Gemini Vision Pro.
 */
export const analyzeImage = async (base64Data: string, mimeType: string) => {
  try {
    // Usando o modelo Pro Image Preview conforme guidelines para análise visual complexa
    const model = "gemini-3-pro-preview"; 
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analise esta imagem detalhadamente.
            Se for um VEÍCULO: Identifique marca, modelo, ano aproximado, cor e possíveis modificações ou danos visíveis.
            Se for um DOCUMENTO (CNH/CRLV): Extraia os dados visíveis (Nome, CPF, Placa, Renavam) em formato texto estruturado.
            Se for outra coisa: Descreva o que é.
            
            Retorne a resposta em formato Markdown bem formatado.`
          }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 1024 } // Habilitar pensamento para melhor análise OCR/Visual
      }
    });

    return response.text;
  } catch (error) {
    console.error("Erro na análise de imagem:", error);
    throw error;
  }
};
