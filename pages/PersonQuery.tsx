
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, User, ShieldCheck, AlertCircle, CarFront, Building2, MapPin, Users, Info, FileCheck, Calendar, Printer, ArrowRight, Copy, Share2, CheckCircle, Sparkles, Key, Car } from 'lucide-react';
import { generatePersonProfile } from '../services/geminiService';
import { getCnpjData } from '../services/brasilApiService';
import { getCondutorDenatran } from '../services/denatranService';
import { getCpfInfosimples, getCnpjInfosimples, getVeiculosPorProprietario } from '../services/infosimplesService';
import { PersonProfile } from '../types';
import { addToHistory } from '../services/historyService';
import { saveContext, copyToClipboard, generateShareText } from '../utils/contextUtils';
import { useToast } from '../contexts/ToastContext';

const PersonQuery: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'cnpj' | 'cpf'>('cnpj');
  const [query, setQuery] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PersonProfile | null>(null);
  
  const { addToast } = useToast();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    if (v.length > 4) v = `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;
    else if (v.length > 2) v = `${v.substring(0, 2)}/${v.substring(2)}`;
    setBirthDate(v);
  };

  const handlePrint = () => window.print();

  const handleCopy = (text: string, label: string) => {
      copyToClipboard(text);
      addToast('success', `${label} copiado!`);
  };

  const handleShare = () => {
      if(!data) return;
      const text = generateShareText(data.name, {
          "Documento": data.cpf,
          "Status": data.status,
          "Score": data.score,
          "Endereço": data.address ? `${data.address.street}, ${data.address.number}` : 'N/A'
      });
      window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const navigateToVehicle = (plate: string) => {
      const cleanPlate = plate.replace(/[^a-zA-Z0-9]/g, '');
      navigate(`/vehicle?q=${cleanPlate}`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setData(null);

    try {
      const cleanQuery = query.replace(/[^\d]/g, '');
      if (activeTab === 'cnpj') saveContext('last_cnpj', cleanQuery);
      else saveContext('last_cpf', cleanQuery);

      let vehiclesFound: any[] = [];

      // 1. Tentar buscar veículos (Independente do sucesso, prosseguimos para o perfil)
      try {
        const veiculosRes = await getVeiculosPorProprietario(cleanQuery);
        if (veiculosRes.data && Array.isArray(veiculosRes.data)) {
            vehiclesFound = veiculosRes.data.map((v: any) => ({
                model: `${v.marca || ''} ${v.modelo || 'Veículo Identificado'}`,
                plate: v.placa || v.placa_veiculo,
                status: v.situacao || 'Consultar'
            }));
        }
      } catch (vehError) {
        console.warn("Frota: Endpoint indisponível ou sem bens vinculados.");
      }

      // 2. Consulta de Perfil Principal
      if (activeTab === 'cnpj') {
        if (cleanQuery.length !== 14) throw new Error("CNPJ deve conter 14 dígitos.");

        try {
          const infoData = await getCnpjInfosimples(cleanQuery);
          if (infoData.data) {
             const d = infoData.data;
             const profile: PersonProfile = {
               name: d.razao_social || d.nome_empresarial,
               cpf: d.cnpj,
               status: d.situacao_cadastral,
               score: 1000,
               vehicles: vehiclesFound,
               notes: `Natureza Jurídica: ${d.natureza_juridica}\nAbertura: ${d.data_abertura}\nCapital Social: ${d.capital_social}`,
               address: {
                 street: d.logradouro,
                 number: d.numero,
                 city: d.municipio,
                 state: d.uf
               },
               partners: d.qsa?.map((s: any) => s.nome_socio),
               source: 'Infosimples'
             };
             setData(profile);
             addToHistory({ type: 'COMPANY', title: profile.name, subtitle: `CNPJ: ${profile.cpf}`, status: 'success' });
             addToast('success', 'CNPJ localizado com sucesso');
             return;
          }
        } catch (infoError) { 
            console.warn("Infosimples PJ falhou, tentando BrasilAPI..."); 
        }

        const cnpjData = await getCnpjData(cleanQuery);
        const profile: PersonProfile = {
          name: cnpjData.nome_fantasia || cnpjData.razao_social,
          cpf: cnpjData.cnpj,
          status: cnpjData.descricao_situacao_cadastral === 'ATIVA' ? 'Ativa' : 'Suspenso',
          score: 1000, 
          vehicles: vehiclesFound,
          notes: `Razão Social: ${cnpjData.razao_social}\nAtividade Principal: ${cnpjData.cnae_fiscal_descricao}`,
          address: { street: cnpjData.logradouro, number: cnpjData.numero, city: cnpjData.municipio, state: cnpjData.uf },
          partners: cnpjData.qsa?.map(q => q.nome_socio) || [],
          source: 'BrasilAPI'
        };
        setData(profile);
        addToHistory({ type: 'COMPANY', title: profile.name, subtitle: `CNPJ: ${profile.cpf}`, status: 'success' });
        addToast('success', 'Dados da Receita obtidos (BrasilAPI)');

      } else {
        // Fluxo CPF
        if(!birthDate || birthDate.length !== 10) throw new Error("Para consulta completa de CPF, a Data de Nascimento é obrigatória.");

        try {
          const infoCpf = await getCpfInfosimples(cleanQuery, birthDate);
          if (infoCpf && infoCpf.data) {
            const d = infoCpf.data;
            const profile: PersonProfile = {
               name: d.nome,
               cpf: d.cpf,
               status: d.situacao_cadastral,
               score: 980, 
               vehicles: vehiclesFound,
               notes: `Data Nascimento: ${d.data_nascimento}\nOrigem: Receita Federal\nProtocolo: ${infoCpf.header.client}`,
               source: 'Infosimples'
            };
            setData(profile);
            addToHistory({ type: 'PERSON', title: profile.name, subtitle: `CPF: ${profile.cpf}`, status: 'success' });
            addToast('success', 'CPF Validado na Receita Federal');
            return;
          }
        } catch (e: any) {
           console.warn("Infosimples CPF indisponível, tentando Denatran/IA. Erro:", e.message);
        }

        try {
           const denatranData = await getCondutorDenatran(cleanQuery);
           if (denatranData) {
             const profile: PersonProfile = {
               name: denatranData.nome,
               cpf: denatranData.cpf,
               status: (denatranData.statusCnh as PersonProfile['status']) || 'Regular',
               score: 950,
               vehicles: vehiclesFound,
               notes: `Registro CNH: ${denatranData.registroCnh}\nCategoria: ${denatranData.categoria}`,
               cnhData: denatranData,
               source: 'Denatran'
             };
             setData(profile);
             addToHistory({ type: 'PERSON', title: profile.name, subtitle: `CPF: ${profile.cpf}`, status: 'success' });
             addToast('success', 'Dados de CNH Localizados');
             return;
           }
        } catch (denatranError) { 
            console.warn("Falha no Denatran, usando fallback IA"); 
        }

        // Fallback final IA
        const result = await generatePersonProfile(query);
        const finalVehicles = vehiclesFound.length > 0 ? vehiclesFound : result.vehicles;
        const profile: PersonProfile = { 
            name: result.name, cpf: result.cpf, status: result.status as PersonProfile['status'], score: result.score, vehicles: finalVehicles, notes: result.notes, source: 'IA' 
        };
        setData(profile);
        addToHistory({ type: 'PERSON', title: profile.name, subtitle: `CPF: ${profile.cpf} (IA)`, status: 'success' });
        addToast('warning', 'Dados Simulados (IA)', 'Serviços oficiais indisponíveis ou dados não encontrados.');
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Erro na Consulta', err.message || "Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-10">
      <div className="flex flex-col gap-2 print:hidden">
        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            Investigação Cadastral
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
        </h1>
        <p className="text-slate-400 text-lg">Consulte dados de pessoas e seus bens (Infosimples + Detran).</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6 print:hidden">
          
          <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-white/10 flex shadow-inner">
            <button
              onClick={() => { setActiveTab('cnpj'); setQuery(''); setBirthDate(''); setData(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'cnpj' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 size={18} />
              CNPJ
            </button>
            <button
              onClick={() => { setActiveTab('cpf'); setQuery(''); setBirthDate(''); setData(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'cpf' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User size={18} />
              CPF
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative group space-y-4">
            <div className={`absolute -inset-1 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 ${activeTab === 'cnpj' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}></div>
            
            <div className="relative flex flex-col gap-4 p-5 glass-card rounded-2xl border border-white/10">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={activeTab === 'cnpj' ? "Digite o CNPJ" : "Digite o CPF"}
                        className="w-full bg-slate-900/80 border border-white/10 text-white p-4 pl-12 rounded-xl text-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 font-mono"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                </div>

                {activeTab === 'cpf' && (
                     <div className="relative animate-fade-in-up">
                        <input
                            type="text"
                            value={birthDate}
                            onChange={handleDateChange}
                            placeholder="Data de Nascimento (DD/MM/AAAA)"
                            maxLength={10}
                            className="w-full bg-slate-900/80 border border-white/10 text-white p-4 pl-12 rounded-xl text-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-600 font-mono"
                        />
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <p className="text-[10px] text-slate-500 mt-1 ml-1 flex items-center gap-1"><Info size={10}/> Obrigatório para RFB</p>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading || !query}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white shadow-lg ${
                    activeTab === 'cnpj' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-blue-500/20' 
                        : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:shadow-purple-500/20'
                    }`}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Consultar Base Oficial'}
                </button>
            </div>
          </form>
        </div>

        <div className="flex-[1.5]">
          {!data && !loading && (
            <div className="h-full min-h-[300px] glass-card rounded-3xl flex flex-col items-center justify-center text-slate-500 p-8 text-center border-dashed border border-white/5 bg-transparent print:hidden">
               <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-slate-900/50 border border-white/5`}>
                 {activeTab === 'cnpj' ? <Building2 size={32} className="text-blue-500/50" /> : <User size={32} className="text-purple-500/50" />}
               </div>
               <h3 className="text-lg font-medium text-slate-400 mb-2">Aguardando Parâmetros</h3>
               <p className="max-w-xs text-sm text-slate-600">Preencha os dados ao lado para revelar o perfil completo.</p>
            </div>
          )}

          {data && (
            <div className="glass-card rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up border border-white/10">
               <div className="flex justify-end p-4 bg-white/5 border-b border-white/10 print:hidden gap-2">
                   <button 
                    onClick={handleShare}
                    className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
                   >
                     <Share2 size={14} /> WhatsApp
                   </button>
                   <button 
                    onClick={handlePrint}
                    className="p-2 bg-white/5 text-slate-300 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
                   >
                     <Printer size={14} /> PDF
                   </button>
               </div>

              <div className="p-8 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20 ${data.source === 'IA' ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                
                <div className="flex justify-between items-start gap-4 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border border-white/20 shadow-xl ${
                      data.source !== 'IA' ? 'bg-emerald-600' : 'bg-purple-600'
                    }`}>
                      {data.source === 'BrasilAPI' || data.source === 'Infosimples' ? <Building2 size={32} className="text-white" /> : <User size={32} className="text-white" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white leading-tight">{data.name}</h2>
                      <div className="flex items-center gap-2 mt-2">
                          <p className="text-slate-300 font-mono text-sm bg-slate-950/50 px-2 py-0.5 rounded border border-white/10">{data.cpf}</p>
                          <button onClick={() => handleCopy(data.cpf, 'Documento')} className="text-slate-500 hover:text-blue-400" title="Copiar">
                              <Copy size={14} />
                          </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        data.source !== 'IA'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}>
                        {data.source === 'IA' ? 'IA Simulation' : `Source: ${data.source}`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <div className="bg-slate-900/50 p-4 rounded-xl flex-1 border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Situação Cadastral</p>
                    <div className="flex items-center gap-2">
                      {['Regular', 'Ativa', 'REGULAR'].includes(data.status) 
                        ? <ShieldCheck size={18} className="text-emerald-400" /> 
                        : <AlertCircle size={18} className="text-red-400" />}
                      <span className={`font-bold text-lg ${['Regular', 'Ativa', 'REGULAR'].includes(data.status) ? 'text-emerald-400' : 'text-red-400'}`}>{data.status}</span>
                    </div>
                  </div>
                  
                  {data.source === 'IA' && (
                    <div className="bg-slate-900/50 p-4 rounded-xl flex-1 border border-white/10 backdrop-blur-md">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Score de Crédito</p>
                      <div className="flex items-center gap-2">
                        <Sparkles size={18} className={data.score > 700 ? 'text-blue-400' : 'text-yellow-400'} />
                        <span className={`font-bold text-lg font-mono ${data.score > 700 ? 'text-blue-400' : 'text-yellow-400'}`}>
                            {data.score}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 space-y-8">
                {(data.source === 'BrasilAPI' || (data.source === 'Infosimples' && activeTab === 'cnpj')) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-slate-800/30 p-5 rounded-2xl border border-white/5 relative group/card hover:bg-slate-800/50 transition-colors">
                        <button onClick={() => data.address && handleCopy(`${data.address.street}, ${data.address.number}`, 'Endereço')} className="absolute top-4 right-4 text-slate-500 hover:text-blue-400 opacity-0 group-hover/card:opacity-100 transition-opacity">
                            <Copy size={16} />
                        </button>
                        <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                          <MapPin size={14}/> Endereço Registrado
                        </h3>
                        {data.address ? (
                          <p className="text-slate-300 leading-relaxed text-sm font-medium">
                            {data.address.street}, {data.address.number}<br/>
                            {data.address.city} - {data.address.state}
                          </p>
                        ) : <p className="text-slate-500 italic text-sm">Não informado</p>}
                     </div>
                     <div className="bg-slate-800/30 p-5 rounded-2xl border border-white/5">
                        <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                          <Users size={14}/> Quadro Societário
                        </h3>
                        {data.partners && data.partners.length > 0 ? (
                          <ul className="text-slate-300 text-sm space-y-2">
                            {data.partners.map((p, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-blue-500"></div> {p}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-500 text-sm italic">Sem sócios listados ou MEI.</p>
                        )}
                     </div>
                  </div>
                )}

                <section className="bg-slate-900/30 rounded-2xl border border-white/10 p-6 shadow-inner">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <CarFront size={16} className="text-blue-400" /> Veículos Vinculados ao Documento
                    </h3>
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-1 rounded border border-blue-500/30">
                        {data.vehicles.length} Encontrados
                    </span>
                  </div>
                  
                  {data.vehicles.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {data.vehicles.map((car, idx) => (
                        <div 
                           key={idx} 
                           onClick={() => navigateToVehicle(car.plate)}
                           className="bg-slate-800/40 p-4 rounded-xl border border-white/5 flex justify-between items-center hover:bg-slate-800/60 hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors">
                                <Car size={20} className="text-slate-500 group-hover:text-blue-400" />
                             </div>
                             <div>
                                <p className="font-bold text-slate-200 group-hover:text-blue-300 transition-colors">{car.model}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                                        <Key size={10} /> {car.plate}
                                    </p>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-1 rounded border font-semibold ${car.status === 'Em dia' || car.status === 'Consultar' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                {car.status}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <ArrowRight size={14} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                        <p className="text-slate-500 text-sm font-mono">Nenhum veículo encontrado nesta base ou acesso restrito.</p>
                    </div>
                  )}
                </section>

                <section>
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                     {data.source === 'BrasilAPI' ? 'Dados da Receita' : 'Análise Preliminar'}
                   </h3>
                   <div className="bg-slate-950/30 p-5 rounded-2xl border border-white/5 text-slate-400 text-sm leading-relaxed whitespace-pre-line font-mono">
                     {data.notes}
                   </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonQuery;
