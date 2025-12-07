
export interface VehicleReport {
  model: string;
  year: string;
  priceEstimate: string;
  specs: string[];
  commonIssues: string[];
  history: string;
  source?: 'IA' | 'BrasilAPI' | 'Denatran' | 'Infosimples';
}

export interface PersonProfile {
  name: string;
  cpf: string; // CPF ou CNPJ
  status: 'Regular' | 'Pendente' | 'Suspenso' | 'Ativa' | 'Baixada';
  score: number;
  vehicles: {
    model: string;
    plate: string;
    status: string;
  }[];
  notes: string;
  address?: { // Campo novo para dados reais de CNPJ
    street: string;
    number: string;
    city: string;
    state: string;
  };
  partners?: string[]; // Sócios (para CNPJ)
  cnhData?: DenatranCondutor; // Dados reais da CNH
  source?: 'IA' | 'BrasilAPI' | 'Denatran' | 'Infosimples';
}

export enum QueryType {
  PERSON = 'PERSON',
  VEHICLE = 'VEHICLE',
  IMAGE = 'IMAGE'
}

// Interfaces da BrasilAPI
export interface BrasilApiCNPJ {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  descricao_situacao_cadastral: string;
  logradouro: string;
  numero: string;
  municipio: string;
  uf: string;
  qsa: { nome_socio: string; qualificação_socio: string }[];
  cnae_fiscal_descricao: string;
}

export interface BrasilApiFipe {
  valor: string;
  marca: string;
  modelo: string;
  anoModelo: number;
  combustivel: string;
  codigoFipe: string;
  mesReferencia: string;
}

export interface BrasilApiCep {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
}

export interface BrasilApiDdd {
  state: string;
  cities: string[];
}

export interface BrasilApiBank {
  ispb: string;
  name: string;
  code: number | null;
  fullName: string;
}

export interface BrasilApiTaxa {
  nome: string;
  valor: number;
  status: string;
}

// --- Interfaces WSDenatran (Baseado no PDF) ---

export interface DenatranCondutor {
  nome: string;
  cpf: string;
  registroCnh: string;
  categoria: string;
  dataValidade: string;
  dataPrimeiraHabilitacao: string;
  statusCnh: string;
  bloqueios?: string[];
  fotoBase64?: string;
}

export interface DenatranVeiculo {
  placa: string;
  chassi: string;
  renavam: string;
  marcaModelo: string;
  anoFabricacao: number;
  anoModelo: number;
  cor: string;
  combustivel: string;
  municipio: string;
  uf: string;
  nomeProprietario: string; // Parcial ou PJ
  documentoProprietario: string;
  restricoes: {
    judicial: boolean;
    rouboFurto: boolean;
    alienacao: boolean;
    administrativa: boolean;
  };
}

export interface DenatranInfracao {
  codigoInfra: string;
  descricao: string;
  data: string;
  valor: number;
  status: string;
  local: string;
}

// --- Interfaces Infosimples ---

export interface InfosimplesResponse {
  code: number;
  code_message: string;
  header: {
    api_version: string;
    service: string;
    parameters: any;
    client: string;
  };
  data: any; // O conteúdo varia muito por consulta
  errors: string[];
  site_receipts: string[];
}
