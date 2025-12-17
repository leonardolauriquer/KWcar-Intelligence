
import { InfosimplesResponse } from "../types";

const BASE_URL = 'https://api.infosimples.com/api/v2/consultas';
// Token configurado
const TOKEN = process.env.INFOSIMPLES_TOKEN || '19BrFe67ddIw8OR9J9luTbwoYcbJw-CIIcLoVMIo';

// Proxy para evitar erros de CORS em ambiente de desenvolvimento/frontend-only
const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Função genérica para realizar chamadas à API da Infosimples
 */
async function callInfosimples(endpoint: string, params: Record<string, string>): Promise<InfosimplesResponse> {
  if (!TOKEN) {
    throw new Error("Token da Infosimples não configurado.");
  }

  // Constrói a URL original da API
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.append('token', TOKEN);
  url.searchParams.append('timeout', '600'); 
  
  // ESTRATÉGIA DE ALIASING (SINÔNIMOS)
  // Alguns serviços pedem 'nascimento', outros 'data_nascimento'. 
  // Enviamos ambos para garantir compatibilidade e evitar erro 606.
  const enrichedParams: Record<string, string> = { ...params };
  
  if (params.data_nascimento && !params.nascimento) enrichedParams.nascimento = params.data_nascimento;
  if (params.nascimento && !params.data_nascimento) enrichedParams.data_nascimento = params.nascimento;
  if (params.cpf && !params.documento) enrichedParams.documento = params.cpf;
  if (params.cnpj && !params.documento) enrichedParams.documento = params.cnpj;

  Object.keys(enrichedParams).forEach(key => {
    let value = enrichedParams[key];
    // Normalização de dados sensíveis
    if (['cpf', 'cnpj', 'placa', 'cep', 'telefone', 'documento'].includes(key)) {
        value = value.replace(/[^a-zA-Z0-9]/g, '');
    }
    url.searchParams.append(key, value);
  });

  const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url.toString())}`;

  try {
    const response = await fetch(proxiedUrl);
    
    if (!response.ok) {
       throw new Error(`Erro HTTP: ${response.status}`);
    }

    const json = await response.json();

    // Verifica códigos de erro específicos da Infosimples
    if (json.code !== 200 && json.code !== 600) { 
       const errorMsg = json.errors?.[0] || json.code_message || "Erro desconhecido na Infosimples";
       throw new Error(`Infosimples API Error (${json.code}): ${errorMsg}`);
    }

    return json as InfosimplesResponse;
  } catch (error: any) {
    console.error(`Erro na chamada Infosimples [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * EXECUÇÃO GENÉRICA DE SERVIÇO
 */
export const executeGenericConsulta = async (endpoint: string, inputs: Record<string, string>) => {
    return await callInfosimples(endpoint, inputs);
};

// --- PESSOA & EMPRESA ---

export const getCpfInfosimples = async (cpf: string, dataNascimento?: string) => {
  if (!dataNascimento) {
      throw new Error("Data de nascimento necessária para consulta oficial na Receita Federal.");
  }
  return await callInfosimples('receita-federal/cpf', { 
      cpf: cpf, 
      nascimento: dataNascimento 
  });
};

export const getCnpjInfosimples = async (cnpj: string) => {
  return await callInfosimples('receita-federal/cnpj', { cnpj });
};

// --- VEÍCULOS ---

export const getVeiculoInfosimples = async (placa: string) => {
  return await callInfosimples('senatran/veiculo', { placa });
};

export const getVeiculoCompletoInfosimples = async (placa: string) => {
  return await callInfosimples('detran/sp/debitos-restricoes-veiculo', { placa });
};

/**
 * Corrigido endpoint de consulta de frota por proprietário para evitar erro 602
 * Usando o endpoint mais estável do Detran SP
 */
export const getVeiculosPorProprietario = async (documento: string) => {
  return await callInfosimples('detran/sp/veiculos-por-cpf-cnpj', { 
    documento: documento
  });
};

// --- JURÍDICO E FINANCEIRO ---

export const getProcessosInfosimples = async (documento: string) => {
  return await callInfosimples('cnj/processos', { documento });
};

export const getEnderecoPorCepInfosimples = async (cep: string) => {
  return await callInfosimples('correios/cep', { cep });
};
