
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Car, Users, Zap, Globe, 
  Building2, Scale, Lock, MapPin, 
  Phone, Briefcase, FileText, 
  ShieldCheck, AlertTriangle, 
  Loader2, X, CheckCircle, Database,
  Sparkles, Terminal
} from 'lucide-react';
import { executeGenericConsulta } from '../services/infosimplesService';
import AutocompleteInput from '../components/AutocompleteInput';
import { getContext } from '../utils/contextUtils';

// --- (CÓDIGO DE TIPOS E CATÁLOGO MANTIDO IGUAL - OMITIDO POR BREVIDADE, INSERIR TODO O ARRAY CONST RAW_CATALOG AQUI) ---
// Para a resposta, vou reimplementar a parte de UI e manter a lógica de importação dos dados.
// Assumindo que RAW_CATALOG e SERVICE_CATALOG estão presentes como no arquivo original.

type InputType = 'CPF' | 'CNPJ' | 'PLACA' | 'RENAVAM' | 'PROCESSO' | 'TELEFONE' | 'CEP' | 'TEXTO' | 'GENERICO';

interface ServiceDefinition {
  name: string;
  endpoint: string;
  category: string;
  inputType: InputType;
  description?: string;
}

const RAW_CATALOG = [
  // ... (Mesmo array do arquivo original)
  { name: "Anatel / Consulta Celular Legal", endpoint: "anatel/celular-legal" },
  { name: "Telefonia / Consulta Número", endpoint: "telefonia/consulta-numero" },
  { name: "ANP / Base de Distribuição", endpoint: "anp/base-distribuicao" },
  { name: "ANP / Certificados", endpoint: "anp/certificados" },
  { name: "ANP / Instalações do SIMP", endpoint: "anp/instalacoes-simp" },
  { name: "ANP / Postos", endpoint: "anp/postos" },
  { name: "ANP / Revendas GLP", endpoint: "anp/revendas" },
  { name: "Antecedentes Criminais / MG", endpoint: "antecedentes-criminais/mg" },
  { name: "Antecedentes Criminais / PF / Emitir", endpoint: "antecedentes-criminais/pf/emit" },
  { name: "Antecedentes Criminais / PF / Validar", endpoint: "antecedentes-criminais/pf/val" },
  { name: "Antecedentes Criminais / SP", endpoint: "antecedentes-criminais/sp" },
  { name: "ANTT / Produtos Perigosos", endpoint: "antt/produtos-perigosos" },
  { name: "ANTT / SIFAMA / Consultar Multas", endpoint: "antt/sifama/consultar-multas" },
  { name: "ANTT / Transportador", endpoint: "antt/transportador" },
  { name: "ANTT / Veículo", endpoint: "antt/veiculo" },
  { name: "ANVISA / Funcionamento de Empresa", endpoint: "anvisa/empresas" },
  { name: "Cadastur / Prestadores", endpoint: "cadastur/prestadores" },
  { name: "CADE / Processos", endpoint: "cade/processos" },
  { name: "Banco Central / Cheques sem Fundos", endpoint: "bcb/cheques-sem-fundo" },
  { name: "Banco Central / Valores a Receber", endpoint: "bcb/valores-receber" },
  { name: "B3 / Participantes", endpoint: "b3/participantes" },
  { name: "CVM / Participante", endpoint: "cvm/participante" },
  { name: "CVM / Processos Sancionadores", endpoint: "cvm/processo-administrativo" },
  { name: "Receita Federal / CPF", endpoint: "receita-federal/cpf" },
  { name: "Receita Federal / CNPJ", endpoint: "receita-federal/cnpj" },
  { name: "Receita Federal / MEI", endpoint: "receita-federal/mei" },
  { name: "Receita Federal / Simples Nacional", endpoint: "receita-federal/simples" },
  { name: "Receita Federal / Certidão Negativa (PGFN)", endpoint: "receita-federal/pgfn" },
  { name: "Receita Federal / IRPF (Restituição)", endpoint: "receita-federal/irpf" },
  { name: "Receita Federal / Notas Fiscais (NFe)", endpoint: "receita-federal/nfe" },
  { name: "PGFN / Dívida Ativa", endpoint: "pgfn/divida-ativa" },
  { name: "CAIXA / FGTS Regularidade", endpoint: "caixa/regularidade" },
  { name: "Correios / CEP", endpoint: "correios/cep" },
  { name: "Correios / Rastreamento", endpoint: "correios/rastreamento" },
  { name: "IBGE / Código Município", endpoint: "ibge/codigo-municipio" },
  { name: "INCRA / SIGEF / Parcelas", endpoint: "incra/sigef/parcelas" },
  { name: "ONR / Mapa Registro de Imóveis", endpoint: "onr/mapa-registro-imoveis" },
  { name: "CAR / Imóvel Rural", endpoint: "car/imovel" },
  { name: "CFM / Médicos", endpoint: "cfm/cadastro" },
  { name: "CFO / Dentistas", endpoint: "cfo/cadastro" },
  { name: "CFC / Contabilidade", endpoint: "cfc/cadastro" },
  { name: "CFP / Psicologia", endpoint: "cfp/cadastro" },
  { name: "OAB / Cadastro Nacional (CNA)", endpoint: "cna/advogados" }, 
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
  { name: "DENATRAN / Veículo", endpoint: "senatran/veiculo" },
  { name: "DENATRAN / Infrações", endpoint: "senatran/infracoes" },
  { name: "DENATRAN / Condutor (CNH)", endpoint: "senatran/validar-cnh" },
  { name: "PRF / Nada Consta", endpoint: "prf/nada-consta" },
  { name: "PRF / Multas", endpoint: "prf/infracoes" },
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
  { name: "Prefeitura SP / Multas", endpoint: "pref/sp/sao-paulo/multas" },
  { name: "Prefeitura SP / Dívida Ativa", endpoint: "pref/sp/sao-paulo/divida-ativa" },
  { name: "Prefeitura RJ / Multas", endpoint: "pref/rj/rio-janeiro/multas" },
  { name: "SEFAZ SP / IPVA", endpoint: "sefaz/sp/ipva-zero-km" },
  { name: "SEFAZ RJ / IPVA", endpoint: "sefaz/rj/ipva/darj" },
  { name: "SEFAZ MG / IPVA", endpoint: "sefaz/mg/debitos-ipva" },
  { name: "Portal da Transparência / Bolsa Família", endpoint: "portal-transparencia/bolsa" },
  { name: "Portal da Transparência / Servidor", endpoint: "portal-transparencia/servidor" },
  { name: "Buscador / Google", endpoint: "buscador/google" },
  { name: "OFAC / Sanções Internacionais", endpoint: "ofac/sancoes" }
];

const detectInputType = (name: string, endpoint: string): InputType => {
  const n = name.toLowerCase();
  const e = endpoint.toLowerCase();
  if (e.includes('telefone') || e.includes('celular')) return 'TELEFONE';
  if (e.includes('cep')) return 'CEP';
  if (e.includes('processo') || e.includes('mandado') || e.includes('cndt') || e.includes('tribunal')) return 'PROCESSO';
  if (e.includes('veiculo') || e.includes('placa') || e.includes('multa') || e.includes('chassi') || e.includes('renavam') || e.includes('detran') || e.includes('antt/veiculo')) return 'PLACA';
  if (e.includes('cnpj') || e.includes('empresa') || e.includes('mei') || e.includes('simples') || e.includes('anp/') || e.includes('anvisa') || e.includes('cadastur')) return 'CNPJ';
  if (e.includes('cpf') || e.includes('pessoa') || e.includes('cnh') || e.includes('antecedentes') || e.includes('titulo') || e.includes('eleitoral') || e.includes('bolsa') || e.includes('servidor')) return 'CPF';
  if (e.includes('google') || e.includes('nome')) return 'TEXTO';
  return 'GENERICO';
};

const SERVICE_CATALOG: ServiceDefinition[] = RAW_CATALOG.map(item => ({
  ...item,
  category: item.name.split('/')[0].trim(),
  inputType: detectInputType(item.name, item.endpoint)
}));

const SERVICE_NAMES = SERVICE_CATALOG.map(s => s.name);
const CATEGORIES = ['Todos', ...Array.from(new Set(SERVICE_CATALOG.map(s => s.category))).sort()];

const Services: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedService, setSelectedService] = useState<ServiceDefinition | null>(null);
  const [primaryInput, setPrimaryInput] = useState('');
  const [secondaryInput, setSecondaryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [autoFilled, setAutoFilled] = useState(false);

  const filteredServices = useMemo(() => {
    return SERVICE_CATALOG.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            service.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Todos' || service.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const handleSelectService = (serviceName: string) => {
    setSearchTerm(serviceName);
    const match = SERVICE_CATALOG.find(s => s.name === serviceName);
    if(match) openServiceModal(match);
  };

  const openServiceModal = (service: ServiceDefinition) => {
      setSelectedService(service);
      setResult(null);
      setError('');
      setAutoFilled(false);
      let savedValue = '';
      if (service.inputType === 'CPF') savedValue = getContext('last_cpf');
      else if (service.inputType === 'CNPJ') savedValue = getContext('last_cnpj');
      else if (service.inputType === 'PLACA') savedValue = getContext('last_plate');
      else if (service.inputType === 'PROCESSO') savedValue = getContext('last_process');

      if (savedValue) {
          setPrimaryInput(savedValue);
          setAutoFilled(true);
          setTimeout(() => setAutoFilled(false), 5000);
      } else {
          setPrimaryInput('');
      }
      setSecondaryInput('');
  };

  const handleExecute = async () => {
    if (!selectedService || !primaryInput) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const params: Record<string, string> = {};
      const type = selectedService.inputType;
      if (type === 'CPF') {
         params['cpf'] = primaryInput;
         if (secondaryInput) params['data_nascimento'] = secondaryInput; 
      } else if (type === 'CNPJ') params['cnpj'] = primaryInput;
      else if (type === 'PLACA') {
         params['placa'] = primaryInput;
         if (secondaryInput) params['renavam'] = secondaryInput;
      } else if (type === 'TELEFONE') params['telefone'] = primaryInput;
      else if (type === 'CEP') params['cep'] = primaryInput;
      else if (type === 'PROCESSO') { params['processo'] = primaryInput; params['numero'] = primaryInput; }
      else { params['term'] = primaryInput; params['q'] = primaryInput; params['nome'] = primaryInput; }

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
    if (c.includes('receita') || c.includes('fazenda')) return Building2;
    if (c.includes('detran') || c.includes('denatran') || c.includes('prf') || c.includes('antt')) return Car;
    if (c.includes('tribunal') || c.includes('cnj') || c.includes('tj')) return Scale;
    if (c.includes('correios')) return MapPin;
    if (c.includes('anatel')) return Phone;
    if (c.includes('antecedentes')) return ShieldCheck;
    if (c.includes('banco') || c.includes('b3')) return Briefcase;
    return Globe;
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Catálogo de Serviços</h1>
          <p className="text-slate-400 text-lg">Acesso universal a {SERVICE_CATALOG.length} endpoints API.</p>
        </div>
        <div className="relative w-full md:w-96 z-20">
          <AutocompleteInput
            value={searchTerm}
            onChange={setSearchTerm}
            onSelect={handleSelectService}
            options={SERVICE_NAMES}
            placeholder="Buscar serviço (ex: antt, inpi...)"
            className="w-full"
            icon={Search}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-white/10">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              whitespace-nowrap px-4 py-2 rounded-t-lg text-xs font-bold uppercase tracking-wider transition-all border-b-2
              ${activeCategory === cat 
                ? 'border-blue-500 text-blue-400 bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredServices.map((service, idx) => {
          const Icon = getIconForCategory(service.category);
          return (
            <div 
              key={idx}
              onClick={() => openServiceModal(service)}
              className="glass-card group p-4 rounded-xl hover:border-blue-500/40 transition-all cursor-pointer flex items-start gap-4 border border-white/5"
            >
              <div className="p-3 bg-slate-900/50 text-slate-400 rounded-lg group-hover:bg-blue-600/20 group-hover:text-blue-300 transition-colors border border-white/5">
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-200 text-sm truncate group-hover:text-white" title={service.name}>
                  {service.name.split('/').pop()?.trim()}
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{service.category}</p>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] px-1.5 py-0.5 bg-slate-950 border border-white/10 rounded text-slate-500 font-mono truncate w-full block">
                     {service.endpoint}
                   </span>
                </div>
              </div>
              <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 self-start font-mono">
                 {service.inputType}
              </div>
            </div>
          )
        })}
      </div>

      {selectedService && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedService(null)}></div>
          
          <div className="bg-slate-900 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col animate-fade-in-up border border-white/10">
            <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedService.name}</h2>
                <p className="text-xs text-slate-400 font-mono mt-1">{selectedService.endpoint}</p>
              </div>
              <button onClick={() => setSelectedService(null)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900">
              <div className="grid gap-6">
                 <div className="flex flex-col sm:flex-row gap-4 relative">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                            {selectedService.inputType === 'CPF' ? 'CPF do Alvo' :
                             selectedService.inputType === 'CNPJ' ? 'CNPJ da Empresa' :
                             selectedService.inputType === 'PLACA' ? 'Placa do Veículo' :
                             selectedService.inputType} *
                        </label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={primaryInput}
                                onChange={(e) => setPrimaryInput(e.target.value)}
                                className={`w-full bg-slate-950 border p-4 rounded-xl outline-none focus:border-blue-500 transition-all font-mono text-white ${autoFilled ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/10'}`}
                                placeholder="Digite aqui..."
                            />
                            {autoFilled && (
                                <div className="absolute -top-8 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 animate-bounce shadow-md">
                                    <Sparkles size={10} /> Recuperado do Histórico
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {selectedService.inputType === 'CPF' && (
                        <div className="flex-1">
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Data Nascimento</label>
                            <input 
                                type="text" 
                                value={secondaryInput}
                                onChange={(e) => setSecondaryInput(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500 transition-all font-mono text-white"
                                placeholder="DD/MM/AAAA"
                            />
                        </div>
                    )}
                    
                    <button 
                        onClick={handleExecute}
                        disabled={loading || !primaryInput}
                        className="h-[58px] self-end px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2 transition-all uppercase tracking-wide text-sm"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Executar'}
                    </button>
                 </div>

                 {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="shrink-0 mt-0.5" />
                        <div className="text-sm">{error}</div>
                    </div>
                 )}

                 {result && (
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20">
                            <CheckCircle size={20} />
                            <div>
                                <p className="font-bold text-sm">Sucesso (Código {result.code})</p>
                                <p className="text-[10px] opacity-70 font-mono">{result.code_message}</p>
                            </div>
                        </div>

                        {/* Dados Principais Formatados */}
                        {result.data && Array.isArray(result.data) && result.data.length > 0 && (
                            <div className="grid gap-3">
                                {result.data.map((item: any, i: number) => (
                                    <div key={i} className="bg-slate-950 border border-white/5 rounded-xl p-4 text-sm space-y-2">
                                        <h4 className="font-bold text-slate-400 border-b border-white/5 pb-2 mb-2 text-xs uppercase">Resultado #{i + 1}</h4>
                                        {Object.entries(item).map(([k, v]) => {
                                            if (typeof v === 'object' || v === null) return null;
                                            return (
                                                <div key={k} className="flex justify-between hover:bg-white/5 p-1 rounded transition-colors">
                                                    <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}:</span>
                                                    <span className="font-medium text-slate-200 text-right truncate max-w-[250px]" title={String(v)}>{String(v)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="mt-4">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Terminal size={10}/> Payload RAW</span>
                             </div>
                             <div className="bg-black rounded-xl p-4 overflow-x-auto max-h-[300px] custom-scrollbar border border-white/10">
                                <pre className="text-xs text-emerald-500 font-mono">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                             </div>
                        </div>

                        {result.site_receipts && result.site_receipts.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {result.site_receipts.map((url: string, i: number) => (
                                    <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-blue-400 text-sm hover:bg-white/10 transition-colors">
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
