import { DenatranCondutor, DenatranVeiculo, DenatranInfracao } from "../types";

/**
 * SERVIÇO DE INTEGRAÇÃO OFICIAL DENATRAN (SERPRO)
 * Baseado na documentação WSDenatran.pdf
 * 
 * NOTA: Esta API requer autenticação via Certificado Digital (mTLS).
 * Em um ambiente de produção real, estas chamadas devem ser feitas através de um Proxy/Backend seguro
 * que detenha o certificado (e-CNPJ/e-CPF), pois o navegador não suporta mTLS direto com segurança de chaves.
 */

// Alternar para 'https://renavam.denatran.serpro.gov.br' em produção
const BASE_URL = 'https://wsrenavam.hom.denatran.serpro.gov.br'; 

const HEADERS = {
  'Content-Type': 'application/json',
  'x-cpf-usuario': '00000000000' // CPF do operador logado (obrigatório segundo PDF)
};

/**
 * Consulta Condutor por CPF (Endpoint /v1/condutores/cpf/{cpf})
 */
export const getCondutorDenatran = async (cpf: string): Promise<DenatranCondutor | null> => {
  try {
    // Simulação de erro de certificado para desenvolvimento local
    // Remova este throw quando tiver o proxy configurado
    if (!process.env.USE_REAL_DENATRAN) {
      console.warn("WSDenatran: Modo simulação ativo (sem certificado).");
      return null;
    }

    const response = await fetch(`${BASE_URL}/v1/condutores/cpf/${cpf}`, {
      method: 'GET',
      headers: HEADERS
    });

    if (!response.ok) throw new Error(`Denatran API Error: ${response.status}`);

    const data = await response.json();
    const c = data.condutores[0]; // PDF indica array de condutores

    return {
      nome: c.nome,
      cpf: c.cpf,
      registroCnh: c.numeroRegistro,
      categoria: c.categoriaAtual,
      dataValidade: c.dataValidadeCnh,
      dataPrimeiraHabilitacao: c.dataPrimeiraHabilitacao,
      statusCnh: c.situacaoCnh,
      bloqueios: c.ocorrencias?.map((o: any) => o.descricaoMotivoImpedimentoBloqueio)
    };
  } catch (error) {
    console.error("Erro ao consultar Denatran:", error);
    return null;
  }
};

/**
 * Consulta Veículo por Placa (Endpoint /v1/veiculos/placa/{placa})
 */
export const getVeiculoDenatran = async (placa: string): Promise<DenatranVeiculo | null> => {
  try {
    if (!process.env.USE_REAL_DENATRAN) return null;

    const response = await fetch(`${BASE_URL}/v1/veiculos/placa/${placa}`, {
      method: 'GET',
      headers: HEADERS
    });

    if (!response.ok) throw new Error(`Denatran API Error: ${response.status}`);

    const data = await response.json();
    const v = data.veiculo[0];

    // Consulta paralela de indicadores (Roubo/Furto e Restrições)
    // Endpoints do PDF: /v1/indicadores/rouboFurto/placa/{placa} e /v1/restricoesJudiciaisAtivas/placa/{placa}
    const [rouboRes, judicialRes] = await Promise.all([
      fetch(`${BASE_URL}/v1/indicadores/rouboFurto/placa/${placa}`, { headers: HEADERS }),
      fetch(`${BASE_URL}/v1/restricoesJudiciaisAtivas/placa/${placa}`, { headers: HEADERS })
    ]);

    const rouboData = await rouboRes.json();
    // A resposta de roubo é um booleano ou objeto conforme PDF (pág 40/74)
    // O PDF mostra status 200 retorna boolean ou objeto detalhado. Assumindo objeto para segurança.
    const isRoubado = rouboData === true || (rouboData.ocorrenciasRouboFurto && rouboData.ocorrenciasRouboFurto.length > 0);

    return {
      placa: v.placa,
      chassi: v.chassi,
      renavam: v.codigoRenavam,
      marcaModelo: v.descricaoMarcaModelo,
      anoFabricacao: v.anoFabricacao,
      anoModelo: v.anoModelo,
      cor: v.descricaoCor,
      combustivel: v.descricaoCombustivel,
      municipio: v.descricaoMunicipioEmplacamento,
      uf: v.ufJurisdicao,
      nomeProprietario: v.nomeProprietario,
      documentoProprietario: v.numeroIdentificacaoProprietario,
      restricoes: {
        judicial: judicialRes.ok, // Simplificação
        rouboFurto: isRoubado,
        alienacao: !!v.indicadorComunicacaoVenda, // Inferido
        administrativa: !!v.codigoRestricao1 // Se houver código de restrição
      }
    };
  } catch (error) {
    console.error("Erro ao consultar veículo Denatran:", error);
    return null;
  }
};

/**
 * Consulta Infrações por Placa (Endpoint /v1/infracoes/placa/{placa})
 * Requer parâmetros adicionais segundo PDF (exigibilidade) mas faremos o básico
 */
export const getInfracoesDenatran = async (placa: string): Promise<DenatranInfracao[]> => {
  try {
    if (!process.env.USE_REAL_DENATRAN) return [];

    // O PDF menciona /v1/infracoes/placa/{placa}/exigibilidade/{situacao}
    // Assumindo endpoint simplificado ou implementação customizada
    const response = await fetch(`${BASE_URL}/v1/infracoes/placa/${placa}`, {
      method: 'GET',
      headers: HEADERS
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.infracoes) return [];

    return data.infracoes.map((inf: any) => ({
      codigoInfra: inf.codigoInfracao,
      descricao: inf.descricaoInfracao,
      data: inf.dataInfracao,
      valor: inf.valorPagoInfracao || 0, // Ou buscar valor da infração
      status: 'Autuada',
      local: inf.localOcorrenciaInfracao
    }));

  } catch (error) {
    return [];
  }
};
