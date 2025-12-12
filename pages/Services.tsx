
import React, { useState, useMemo } from 'react';
import { 
  Search, Car, Users, Zap, Globe, 
  Building2, Scale, Lock, MapPin, 
  Phone, Briefcase, FileText, 
  ShieldCheck, AlertTriangle, 
  Loader2, X, CheckCircle, Database
} from 'lucide-react';
import { executeGenericConsulta } from '../services/infosimplesService';

// --- DEFINIÇÃO DE TIPOS ---
type InputType = 'CPF' | 'CNPJ' | 'PLACA' | 'RENAVAM' | 'PROCESSO' | 'TELEFONE' | 'CEP' | 'TEXTO' | 'GENERICO';

interface ServiceDefinition {
  name: string;
  endpoint: string;
  category: string;
  inputType: InputType;
  description?: string;
}

// --- CATALOGO MASSIVO (Baseado na Documentação v2) ---
const RAW_CATALOG = [
  // TELEFONIA & ANATEL
  { name: "Anatel / Consulta Celular Legal", endpoint: "anatel/celular-legal" },
  { name: "Telefonia / Consulta Número", endpoint: "telefonia/consulta-numero" },

  // ANP (Petróleo e Gás)
  { name: "ANP / Base de Distribuição", endpoint: "anp/base-distribuicao" },
  { name: "ANP / Certificados", endpoint: "anp/certificados" },
  { name: "ANP / Instalações do SIMP", endpoint: "anp/instalacoes-simp" },
  { name: "ANP / Postos", endpoint: "anp/postos" },
  { name: "ANP / Revendas GLP", endpoint: "anp/revendas" },

  // ANTECEDENTES CRIMINAIS
  { name: "Antecedentes Criminais / MG", endpoint: "antecedentes-criminais/mg" },
  { name: "Antecedentes Criminais / PF / Emitir", endpoint: "antecedentes-criminais/pf/emit" },
  { name: "Antecedentes Criminais / PF / Validar", endpoint: "antecedentes-criminais/pf/val" },
  { name: "Antecedentes Criminais / SP", endpoint: "antecedentes-criminais/sp" },

  // ANTT & TRANSPORTES
  { name: "ANTT / Produtos Perigosos", endpoint: "antt/produtos-perigosos" },
  { name: "ANTT / SIFAMA / Consultar Multas", endpoint: "antt/sifama/consultar-multas" },
  { name: "ANTT / Transportador", endpoint: "antt/transportador" },
  { name: "ANTT / Veículo", endpoint: "antt/veiculo" },
  
  // REGULATÓRIOS (ANVISA, CADASTUR, ETC)
  { name: "ANVISA / Funcionamento de Empresa", endpoint: "anvisa/empresas" },
  { name: "Cadastur / Prestadores", endpoint: "cadastur/prestadores" },
  { name: "CADE / Processos", endpoint: "cade/processos" },

  // FINANCEIRO & BACEN
  { name: "Banco Central / Cheques sem Fundos", endpoint: "bcb/cheques-sem-fundo" },
  { name: "Banco Central / Valores a Receber", endpoint: "bcb/valores-receber" },
  { name: "B3 / Participantes", endpoint: "b3/participantes" },
  { name: "CVM / Participante", endpoint: "cvm/participante" },
  { name: "CVM / Processos Sancionadores", endpoint: "cvm/processo-administrativo" },

  // RECEITA FEDERAL
  { name: "Receita Federal / CPF", endpoint: "receita-federal/cpf" },
  { name: "Receita Federal / CNPJ", endpoint: "receita-federal/cnpj" },
  { name: "Receita Federal / MEI", endpoint: "receita-federal/mei" },
  { name: "Receita Federal / Simples Nacional", endpoint: "receita-federal/simples" },
  { name: "Receita Federal / Certidão Negativa (PGFN)", endpoint: "receita-federal/pgfn" },
  { name: "Receita Federal / IRPF (Restituição)", endpoint: "receita-federal/irpf" },
  { name: "Receita Federal / Notas Fiscais (NFe)", endpoint: "receita-federal/nfe" },
  { name: "PGFN / Dívida Ativa", endpoint: "pgfn/divida-ativa" },
  { name: "CAIXA / FGTS Regularidade", endpoint: "caixa/regularidade" },

  // ENDEREÇO & IMÓVEIS
  { name: "Correios / CEP", endpoint: "correios/cep" },
  { name: "Correios / Rastreamento", endpoint: "correios/rastreamento" },
  { name: "IBGE / Código Município", endpoint: "ibge/codigo-municipio" },
  { name: "INCRA / SIGEF / Parcelas", endpoint: "incra/sigef/parcelas" },
  { name: "ONR / Mapa Registro de Imóveis", endpoint: "onr/mapa-registro-imoveis" },
  { name: "CAR / Imóvel Rural", endpoint: "car/imovel" },

  // CONSELHOS DE CLASSE (CFM, OAB, ETC)
  { name: "CFM / Médicos", endpoint: "cfm/cadastro" },
  { name: "CFO / Dentistas", endpoint: "cfo/cadastro" },
  { name: "CFC / Contabilidade", endpoint: "cfc/cadastro" },
  { name: "CFP / Psicologia", endpoint: "cfp/cadastro" },
  { name: "OAB / Cadastro Nacional (CNA)", endpoint: "cna/advogados" }, 
  
  // TRIBUNAIS (CNJ, STJ, STF, TRTs, TJs)
  { name: "CNJ / Processos", endpoint: "cnj/processos" },
  { name: "CNJ / Mandados de Prisão", endpoint: "cnj/mandados-prisao" },
  { name: "TST / CNDT Trabalhista", endpoint: "tst/cndt" },
  { name: "TST / Processos", endpoint: "tribunal/tst/processo" },
  { name: "STJ / Certidão Negativa", endpoint: "tribunal/stj/certidao-negativa" },
  { name: "TSE / Situação Eleitoral", endpoint: "tribunal/tse/situacao" },
  { name: "TSE / Quitação Eleitoral", endpoint: "tribunal/tse/certidao" },
  { name: "TRF1 / Processo", endpoint: "tribunal/trf1/processo" },
  { name: "TRF2 / Processo", endpoint: "tribunal/trf2/processo" },
  { name: "TRF3 / Processo", endpoint: "tribunal/trf3/processo" },
  { name: "TRF4 / Processo", endpoint: "tribunal/trf4/processo" },
  { name: "TJSP / Processos 1º Grau", endpoint: "tribunal/tjsp/primeiro-grau" },
  { name: "TJRJ / Processo", endpoint: "tribunal/tjrj/processo" },
  { name: "TJMG / Processo", endpoint: "tribunal/tjmg/processo" },
  
  // DETRAN (VEÍCULOS & CNH)
  { name: "DENATRAN / Veículo", endpoint: "senatran/veiculo" },
  { name: "DENATRAN / Infrações", endpoint: "senatran/infracoes" },
  { name: "DENATRAN / Condutor (CNH)", endpoint: "senatran/validar-cnh" },
  { name: "PRF / Nada Consta", endpoint: "prf/nada-consta" },
  { name: "PRF / Multas", endpoint: "prf/infracoes" },
  
  // Detran Estaduais
  { name: "DETRAN SP / Veículo Completo", endpoint: "detran/sp/debitos-restricoes-veiculo" },
  { name: "DETRAN SP / Débitos", endpoint: "detran/sp/debitos" },
  { name: "DETRAN SP / Multas", endpoint: "detran/sp/multas" },
  { name: "DETRAN SP / CNH", endpoint: "detran/sp/cnh" },
  { name: "DETRAN RJ / Veículo", endpoint: "detran/rj/veiculo" },
  { name: "DETRAN RJ / Multas", endpoint: "detran/rj/multas-guias" },
  { name: "DETRAN MG / Veículo", endpoint: "detran/mg/veic-nao-licenciado" },
  { name: "DETRAN MG / Multas", endpoint: "detran/mg/multas-extrato" },
  { name: "DETRAN PR / Veículo", endpoint: "detran/pr/veiculo-completa" },
  { name: "DETRAN RS / Veículo", endpoint: "detran/rs/veiculo" },
  { name: "DETRAN SC / Veículo", endpoint: "detran/sc/veiculo" },
  { name: "DETRAN BA / Veículo", endpoint: "detran/ba/veiculo" },
  { name: "DETRAN PE / Veículo", endpoint: "detran/pe/veiculo" },
  { name: "DETRAN DF / Veículo", endpoint: "detran/df/veiculo/mobile" },
  { name: "DETRAN GO / Veículo", endpoint: "detran/go/veiculo" },
  { name: "DETRAN ES / Veículo", endpoint: "detran/es/veiculo" },
  { name: "DETRAN CE / Veículo", endpoint: "detran/ce/veiculo" },

  // PREFEITURAS & SEFAZ
  { name: "Prefeitura SP / Multas", endpoint: "pref/sp/sao-paulo/multas" },
  { name: "Prefeitura SP / Dívida Ativa", endpoint: "pref/sp/sao-paulo/divida-ativa" },
  { name: "Prefeitura RJ / Multas", endpoint: "pref/rj/rio-janeiro/multas" },
  { name: "SEFAZ SP / IPVA", endpoint: "sefaz/sp/ipva-zero-km" },
  { name: "SEFAZ RJ / IPVA", endpoint: "sefaz/rj/ipva/darj" },
  { name: "SEFAZ MG / IPVA", endpoint: "sefaz/mg/debitos-ipva" },

  // DIVERSOS
  { name: "Portal da Transparência / Bolsa Família", endpoint: "portal-transparencia/bolsa" },
  { name: "Portal da Transparência / Servidor", endpoint: "portal-transparencia/servidor" },
  { name: "Buscador / Google", endpoint: "buscador/google" },
  { name: "OFAC / Sanções Internacionais", endpoint: "ofac/sancoes" }
];

// Helper aprimorado para determinar InputType
const detectInputType = (name: string, endpoint: string): InputType => {
  const n = name.toLowerCase();
  const e = endpoint.toLowerCase();

  // Telefonia
  if (e.includes('telefone') || e.includes('celular')) return 'TELEFONE';
  
  // Endereço
  if (e.includes('cep')) return 'CEP';
  
  // Jurídico
  if (e.includes('processo') || e.includes('mandado') || e.includes('cndt') || e.includes('tribunal')) return 'PROCESSO';
  
  // Veicular
  if (e.includes('veiculo') || e.includes('placa') || e.includes('multa') || e.includes('chassi') || e.includes('renavam') || e.includes('detran') || e.includes('antt/veiculo')) return 'PLACA';
  
  // Empresas / CNPJ
  if (e.includes('cnpj') || e.includes('empresa') || e.includes('mei') || e.includes('simples') || e.includes('anp/') || e.includes('anvisa') || e.includes('cadastur')) return 'CNPJ';
  
  // Pessoa Física / CPF
  if (e.includes('cpf') || e.includes('pessoa') || e.includes('cnh') || e.includes('antecedentes') || e.includes('titulo') || e.includes('eleitoral') || e.includes('bolsa') || e.includes('servidor')) return 'CPF';
  
  // Genéricos (Texto, Nome, etc)
  if (e.includes('google') || e.includes('nome')) return 'TEXTO';
  
  return 'GENERICO';
};

// Processamento do Catálogo
const SERVICE_CATALOG: ServiceDefinition[] = RAW_CATALOG.map(item => ({
  ...item,
  category: item.name.split('/')[0].trim(),
  inputType: detectInputType(item.name, item.endpoint)
}));

// Categorias Únicas
const CATEGORIES = ['Todos', ...Array.from(new Set(SERVICE_CATALOG.map(s => s.category))).sort()];

const Services: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  // Estado Modal
  const [selectedService, setSelectedService] = useState<ServiceDefinition | null>(null);
  const [primaryInput, setPrimaryInput] = useState('');
  const [secondaryInput, setSecondaryInput] = useState(''); // Ex: Data Nascimento, UF
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // Filtragem
  const filteredServices = useMemo(() => {
    return SERVICE_CATALOG.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            service.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Todos' || service.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const handleExecute = async () => {
    if (!selectedService || !primaryInput) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Prepara os parâmetros baseado no tipo
      const params: Record<string, string> = {};
      const type = selectedService.inputType;

      // Lógica de mapeamento de parâmetros
      if (type === 'CPF') {
         params['cpf'] = primaryInput;
         if (secondaryInput) params['data_nascimento'] = secondaryInput; 
      } else if (type === 'CNPJ') {
         params['cnpj'] = primaryInput;
      } else if (type === 'PLACA') {
         params['placa'] = primaryInput;
         if (secondaryInput) params['renavam'] = secondaryInput;
      } else if (type === 'TELEFONE') {
         params['telefone'] = primaryInput;
      } else if (type === 'CEP') {
         params['cep'] = primaryInput;
      } else if (type === 'PROCESSO') {
         // Alguns tribunais usam 'numero', outros 'processo'
         params['processo'] = primaryInput; 
         params['numero'] = primaryInput;
      } else {
         // Genérico
         params['term'] = primaryInput;
         params['q'] = primaryInput;
         params['nome'] = primaryInput;
      }

      const data = await executeGenericConsulta(selectedService.endpoint, params);
      setResult(data);

    } catch (err: any) {
      setError(err.message || "Erro na execução da consulta.");
    } finally {
      setLoading(false);
    }
  };

  const getIconForCategory = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('receita') || c.includes('fazenda') || c.includes('sefaz')) return Building2;
    if (c.includes('detran') || c.includes('denatran') || c.includes('prf') || c.includes('antt') || c.includes('sinesp')) return Car;
    if (c.includes('tribunal') || c.includes('cnj') || c.includes('tj') || c.includes('trf') || c.includes('tst') || c.includes('tse')) return Scale;
    if (c.includes('correios') || c.includes('ibge') || c.includes('incra') || c.includes('onr') || c.includes('car')) return MapPin;
    if (c.includes('anatel') || c.includes('telefonia')) return Phone;
    if (c.includes('antecedentes') || c.includes('policia')) return ShieldCheck;
    if (c.includes('banco') || c.includes('b3') || c.includes('cvm')) return Briefcase;
    return Globe;
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Catálogo de Serviços</h1>
          <p className="text-slate-500 text-lg">
             Acesso universal a {SERVICE_CATALOG.length} endpoints da API Infosimples v2.
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar serviço (ex: antt, inpi, tj...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>
      </div>

      {/* Tabs Categorias */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              whitespace-nowrap px-4 py-2 rounded-t-lg text-sm font-semibold transition-all border-b-2
              ${activeCategory === cat 
                ? 'border-blue-600 text-blue-600 bg-blue-50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredServices.map((service, idx) => {
          const Icon = getIconForCategory(service.category);
          return (
            <div 
              key={idx}
              onClick={() => { setSelectedService(service); setPrimaryInput(''); setSecondaryInput(''); setResult(null); setError(''); }}
              className="bg-white border border-slate-200 p-4 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group flex items-start gap-4"
            >
              <div className="p-3 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Icon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-sm truncate" title={service.name}>
                  {service.name.split('/').pop()?.trim()}
                </h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{service.category}</p>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-500 font-mono truncate w-full block">
                     {service.endpoint}
                   </span>
                </div>
              </div>
              <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 self-start">
                 {service.inputType}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de Execução */}
      {selectedService && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedService(null)}></div>
          
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col animate-fade-in-up">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedService.name}</h2>
                <p className="text-sm text-slate-500 font-mono">{selectedService.endpoint}</p>
              </div>
              <button onClick={() => setSelectedService(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <div className="grid gap-6">
                 {/* Formulário de Input */}
                 <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            {selectedService.inputType === 'CPF' ? 'CPF do Alvo' :
                             selectedService.inputType === 'CNPJ' ? 'CNPJ da Empresa' :
                             selectedService.inputType === 'PLACA' ? 'Placa do Veículo' :
                             selectedService.inputType === 'TELEFONE' ? 'Número (DDD + Telefone)' :
                             selectedService.inputType === 'PROCESSO' ? 'Número do Processo' :
                             selectedService.inputType} *
                        </label>
                        <input 
                            type="text" 
                            value={primaryInput}
                            onChange={(e) => setPrimaryInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-blue-500 transition-all font-mono"
                            placeholder={
                                selectedService.inputType === 'PROCESSO' ? 'Ex: 0000000-00.2025.8.26.0000' : 
                                "Digite aqui..."
                            }
                        />
                    </div>
                    
                    {/* Campos Secundários Condicionais */}
                    {selectedService.inputType === 'CPF' && (
                        <div className="flex-1">
                             <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Data Nascimento (Opcional)
                            </label>
                            <input 
                                type="text" 
                                value={secondaryInput}
                                onChange={(e) => setSecondaryInput(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-blue-500 transition-all font-mono"
                                placeholder="DD/MM/AAAA"
                            />
                        </div>
                    )}
                    
                    <button 
                        onClick={handleExecute}
                        disabled={loading || !primaryInput}
                        className="h-[50px] self-end px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Consultar'}
                    </button>
                 </div>

                 {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="shrink-0 mt-0.5" />
                        <div className="text-sm">{error}</div>
                    </div>
                 )}

                 {/* Área de Resultados */}
                 {result && (
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                            <CheckCircle size={20} />
                            <div>
                                <p className="font-bold text-sm">Sucesso (Código {result.code})</p>
                                <p className="text-xs opacity-80">{result.code_message}</p>
                            </div>
                        </div>

                        {/* Dados Principais Formatados */}
                        {result.data && Array.isArray(result.data) && result.data.length > 0 && (
                            <div className="grid gap-3">
                                {result.data.map((item: any, i: number) => (
                                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm space-y-2">
                                        <h4 className="font-bold text-slate-700 border-b border-slate-200 pb-2 mb-2">Resultado #{i + 1}</h4>
                                        {Object.entries(item).map(([k, v]) => {
                                            if (typeof v === 'object' || v === null) return null;
                                            return (
                                                <div key={k} className="flex justify-between hover:bg-slate-100 p-1 rounded">
                                                    <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}:</span>
                                                    <span className="font-medium text-slate-800 text-right truncate max-w-[200px]" title={String(v)}>{String(v)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* JSON Viewer para Debug/Dados Complexos */}
                        <div className="mt-4">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-slate-400 uppercase">Resposta Bruta (JSON)</span>
                             </div>
                             <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto max-h-[300px] custom-scrollbar">
                                <pre className="text-xs text-blue-300 font-mono">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                             </div>
                        </div>

                        {/* Links de PDF/HTML (Receipts) */}
                        {result.site_receipts && result.site_receipts.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {result.site_receipts.map((url: string, i: number) => (
                                    <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-blue-600 text-sm hover:underline">
                                        <FileText size={16} /> Comprovante {i+1}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
