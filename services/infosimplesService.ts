
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
  url.searchParams.append('timeout', '600'); // Timeout recomendado
  
  Object.keys(params).forEach(key => {
    // Remove caracteres especiais de chaves comuns para evitar erro 607/606
    let value = params[key];
    if (key === 'cpf' || key === 'cnpj' || key === 'placa' || key === 'cep' || key === 'telefone') {
        value = value.replace(/[^a-zA-Z0-9]/g, '');
    }
    url.searchParams.append(key, value);
  });

  // Envolve a URL com o Proxy CORS
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
    if (error.message === 'Failed to fetch') {
        throw new Error('Falha de conexão com a API (Bloqueio CORS ou Internet). Verifique o console.');
    }
    throw error;
  }
}

/**
 * EXECUÇÃO GENÉRICA DE SERVIÇO
 * Permite chamar qualquer endpoint da lista "SERVICE_CATALOG" passando os parâmetros dinâmicos.
 */
export const executeGenericConsulta = async (endpoint: string, inputs: Record<string, string>) => {
    return await callInfosimples(endpoint, inputs);
};

// --- PESSOA & EMPRESA (Mantidas para compatibilidade com PersonQuery) ---

export const getCpfInfosimples = async (cpf: string, dataNascimento?: string) => {
  if (!dataNascimento) {
      throw new Error("Data de nascimento necessária para consulta oficial na Receita Federal.");
  }
  const params: any = { cpf: cpf.replace(/\D/g, '') };
  params.data_nascimento = dataNascimento;
  return await callInfosimples('receita-federal/cpf', params);
};

export const getCnpjInfosimples = async (cnpj: string) => {
  return await callInfosimples('receita-federal/cnpj', { 
    cnpj: cnpj.replace(/\D/g, '') 
  });
};

// --- VEÍCULOS (Mantidas para compatibilidade com VehicleQuery) ---

export const getVeiculoInfosimples = async (placa: string) => {
  return await callInfosimples('sinesp/cidadao', { 
    placa: placa.replace(/[^a-zA-Z0-9]/g, '') 
  });
};

export const getVeiculoCompletoInfosimples = async (placa: string) => {
  return await callInfosimples('detran/sp/debitos-restricoes-veiculo', { 
    placa: placa.replace(/[^a-zA-Z0-9]/g, '') 
  });
};

export const getVeiculosPorProprietario = async (documento: string) => {
  return await callInfosimples('detran/sp/veiculos-proprietario', { 
    documento: documento.replace(/\D/g, '') 
  });
};

// --- JURÍDICO E FINANCEIRO ---

export const getProcessosInfosimples = async (documento: string) => {
  const doc = documento.replace(/\D/g, '');
  const paramKey = doc.length > 11 ? 'cnpj' : 'cpf';
  return await callInfosimples('cnj/processos', { [paramKey]: doc });
};

export const getDividaAtivaInfosimples = async (documento: string) => {
  const doc = documento.replace(/\D/g, '');
  const paramKey = doc.length > 11 ? 'cnpj' : 'cpf';
  return await callInfosimples('pgfn/divida-ativa', { [paramKey]: doc });
};

// --- UTILITÁRIOS ---

export const getTelefoneInfosimples = async (telefone: string) => {
  return await callInfosimples('telefonia/consulta-numero', { 
    telefone: telefone.replace(/\D/g, '') 
  });
};

export const getCnhInfosimples = async (cpf: string, registro?: string) => {
  const params: any = { cpf: cpf.replace(/\D/g, '') };
  if(registro) params.registro = registro;
  return await callInfosimples('detran/sp/cnh', params);
};

export const getEnderecoPorCepInfosimples = async (cep: string) => {
  return await callInfosimples('correios/cep', { 
    cep: cep.replace(/\D/g, '') 
  });
};
