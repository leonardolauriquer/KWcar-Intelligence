import React, { useState } from 'react';
import { Search, Loader2, User, ShieldCheck, AlertCircle, CarFront, Building2, MapPin, Users, Info, FileCheck, Calendar } from 'lucide-react';
import { generatePersonProfile } from '../services/geminiService';
import { getCnpjData } from '../services/brasilApiService';
import { getCondutorDenatran } from '../services/denatranService';
import { getCpfInfosimples, getCnpjInfosimples, getVeiculosPorProprietario } from '../services/infosimplesService';
import { PersonProfile } from '../types';

const PersonQuery: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cnpj' | 'cpf'>('cnpj');
  const [query, setQuery] = useState('');
  const [birthDate, setBirthDate] = useState(''); // Estado para Data de Nascimento
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PersonProfile | null>(null);
  const [error, setError] = useState('');

  // Formata data para o padrão exigido (DD/MM/AAAA) ou remove caracteres
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    if (v.length > 4) v = `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;
    else if (v.length > 2) v = `${v.substring(0, 2)}/${v.substring(2)}`;
    setBirthDate(v);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setData(null);
    setError('');

    try {
      const cleanQuery = query.replace(/[^\d]/g, '');
      let vehiclesFound: any[] = [];

      // --- BUSCA PARALELA DE VEÍCULOS (Busca de Bens Detran) ---
      // A API 'veiculos-proprietario' tenta achar carros no CPF/CNPJ
      try {
        const veiculosRes = await getVeiculosPorProprietario(cleanQuery);
        if (veiculosRes.data && Array.isArray(veiculosRes.data)) {
            vehiclesFound = veiculosRes.data.map((v: any) => ({
                model: `${v.marca || ''} ${v.modelo || 'Veículo Identificado'}`,
                plate: v.placa,
                status: v.situacao || 'Consultar'
            }));
        }
      } catch (vehError) {
        // Ignora erro aqui para não bloquear o fluxo principal (muitos CPFs não têm carros)
        console.log("Busca de veículos: Sem retorno ou restrito.");
      }

      // --- CNPJ ---
      if (activeTab === 'cnpj') {
        if (cleanQuery.length !== 14) throw new Error("CNPJ deve conter 14 dígitos.");

        try {
          // 1. Tenta Infosimples
          const infoData = await getCnpjInfosimples(cleanQuery);
          if (infoData.data) {
             const d = infoData.data;
             setData({
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
             });
             return;
          }
        } catch (infoError) {
          console.warn("Infosimples PJ falhou, tentando BrasilAPI...");
        }

        // 2. Fallback BrasilAPI
        const cnpjData = await getCnpjData(cleanQuery);
        setData({
          name: cnpjData.nome_fantasia || cnpjData.razao_social,
          cpf: cnpjData.cnpj,
          status: cnpjData.descricao_situacao_cadastral === 'ATIVA' ? 'Ativa' : 'Suspenso',
          score: 1000, 
          vehicles: vehiclesFound.length > 0 ? vehiclesFound : [],
          notes: `Razão Social: ${cnpjData.razao_social}\nAtividade Principal: ${cnpjData.cnae_fiscal_descricao}`,
          address: {
            street: cnpjData.logradouro,
            number: cnpjData.numero,
            city: cnpjData.municipio,
            state: cnpjData.uf
          },
          partners: cnpjData.qsa?.map(q => q.nome_socio) || [],
          source: 'BrasilAPI'
        });

      } else {
        // --- CPF ---
        
        // Validação
        if(!birthDate || birthDate.length !== 10) {
           throw new Error("Para consulta completa de CPF, a Data de Nascimento é obrigatória.");
        }

        try {
          // 1. Tenta Infosimples CPF (Receita Federal)
          const infoCpf = await getCpfInfosimples(cleanQuery, birthDate);
          
          if (infoCpf && infoCpf.data) {
            const d = infoCpf.data;
            setData({
               name: d.nome,
               cpf: d.cpf,
               status: d.situacao_cadastral,
               score: 980, 
               vehicles: vehiclesFound, // Veículos reais vindos do Detran
               notes: `Data Nascimento: ${d.data_nascimento}\nOrigem: Receita Federal\nProtocolo: ${infoCpf.header.client}`,
               source: 'Infosimples'
            });
            return;
          }
        } catch (e: any) {
           // Se o erro for explícito da API (ex: data errada), mostramos
           if (e.message.includes("Infosimples API Error")) {
              throw e;
           }
           console.warn("Infosimples CPF indisponível, tentando Denatran/IA");
        }

        // 2. Tenta Denatran (Fallback Condutor)
        try {
           const denatranData = await getCondutorDenatran(cleanQuery);
           if (denatranData) {
             setData({
               name: denatranData.nome,
               cpf: denatranData.cpf,
               status: denatranData.statusCnh || 'Regular',
               score: 950,
               vehicles: vehiclesFound.length > 0 ? vehiclesFound : [],
               notes: `Registro CNH: ${denatranData.registroCnh}\nCategoria: ${denatranData.categoria}`,
               cnhData: denatranData,
               source: 'Denatran'
             });
             return;
           }
        } catch (denatranError) {
           console.warn("Falha no Denatran, usando fallback IA");
        }

        // 3. Fallback IA
        const result = await generatePersonProfile(query);
        const finalVehicles = vehiclesFound.length > 0 ? vehiclesFound : result.vehicles;
        
        setData({ 
            ...result, 
            vehicles: finalVehicles,
            source: 'IA' 
        });
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Não foi possível realizar a consulta. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Investigação Cadastral</h1>
        <p className="text-slate-500 text-lg">Consulte dados de pessoas e seus bens (Infosimples + Detran).</p>
      </div>

      {/* Tabs de Seleção */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex shadow-sm">
            <button
              onClick={() => { setActiveTab('cnpj'); setQuery(''); setBirthDate(''); setData(null); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'cnpj' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Building2 size={18} />
              Empresa (CNPJ)
            </button>
            <button
              onClick={() => { setActiveTab('cpf'); setQuery(''); setBirthDate(''); setData(null); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'cpf' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <User size={18} />
              Pessoa (CPF)
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative group space-y-3">
            <div className={`absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${activeTab === 'cnpj' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}></div>
            
            <div className="relative flex flex-col gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50">
                {/* Input Principal (CPF/CNPJ) */}
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={activeTab === 'cnpj' ? "Digite o CNPJ" : "Digite o CPF"}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-4 pl-12 rounded-lg text-lg outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>

                {/* Input Data de Nascimento (Apenas CPF) */}
                {activeTab === 'cpf' && (
                     <div className="relative animate-fade-in-up">
                        <input
                            type="text"
                            value={birthDate}
                            onChange={handleDateChange}
                            placeholder="Data de Nascimento (DD/MM/AAAA)"
                            maxLength={10}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-4 pl-12 rounded-lg text-lg outline-none focus:border-purple-500 focus:bg-white transition-all placeholder:text-slate-400"
                        />
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <p className="text-[10px] text-slate-400 mt-1 ml-1">* Obrigatório para consulta na Receita Federal</p>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading || !query}
                    className={`w-full py-3 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white ${
                    activeTab === 'cnpj' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-purple-600 hover:bg-purple-500'
                    }`}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Consultar Dados Completos'}
                </button>
            </div>
          </form>

          {/* Info Cards */}
          {activeTab === 'cnpj' ? (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm">
              <Info className="shrink-0 mt-0.5" size={18} />
              <p>Conectado à <strong>Infosimples</strong> (Receita Federal). Dados oficiais e atualizados.</p>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 text-sm">
              <Info className="shrink-0 mt-0.5" size={18} />
              <p>
                <strong>Busca Profunda:</strong> Ao fornecer CPF e Data de Nascimento, consultamos a <strong>Receita Federal</strong> e simultaneamente buscamos <strong>Veículos no Detran</strong> vinculados ao documento.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3 animate-fade-in-up">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="flex-[1.5]">
          {!data && !loading && (
            <div className="h-full min-h-[300px] glass-card rounded-3xl flex flex-col items-center justify-center text-slate-400 p-8 text-center border-dashed border-2 border-slate-200 bg-transparent">
               <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${activeTab === 'cnpj' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                 {activeTab === 'cnpj' ? <Building2 size={32} /> : <User size={32} />}
               </div>
               <h3 className="text-lg font-medium text-slate-600 mb-2">Aguardando Consulta</h3>
               <p className="max-w-xs text-sm">Preencha os dados ao lado para revelar o perfil completo e bens vinculados.</p>
            </div>
          )}

          {data && (
            <div className="glass-card rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up border border-slate-200">
              {/* Header do Cartão */}
              <div className={`p-8 border-b border-white/10 bg-gradient-to-r ${
                data.source === 'BrasilAPI' || data.source === 'Denatran' || data.source === 'Infosimples'
                  ? 'from-emerald-50 to-slate-50' 
                  : 'from-purple-50 to-slate-50'
              }`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border border-white/20 shadow-xl ${
                      data.source !== 'IA' ? 'bg-emerald-600' : 'bg-purple-600'
                    }`}>
                      {data.source === 'BrasilAPI' || data.source === 'Infosimples' ? <Building2 size={32} className="text-white" /> : <User size={32} className="text-white" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 leading-tight">{data.name}</h2>
                      <p className="text-slate-500 font-mono mt-1 text-sm bg-white px-2 py-0.5 rounded inline-block border border-slate-200">{data.cpf}</p>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    data.source !== 'IA'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                      : 'bg-purple-100 text-purple-700 border-purple-200'
                  }`}>
                    {data.source === 'IA' ? 'IA SIMULADA' : `DADO REAL (${data.source})`}
                  </span>
                </div>

                <div className="flex gap-4 mt-6">
                  <div className="bg-white p-3 rounded-xl flex-1 border border-slate-200 shadow-sm">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Situação</p>
                    <div className="flex items-center gap-2">
                      {['Regular', 'Ativa', 'REGULAR'].includes(data.status) 
                        ? <ShieldCheck size={16} className="text-emerald-500" /> 
                        : <AlertCircle size={16} className="text-red-500" />}
                      <span className="font-semibold text-slate-800">{data.status}</span>
                    </div>
                  </div>
                  
                  {data.source === 'Denatran' && data.cnhData && (
                    <div className="bg-white p-3 rounded-xl flex-1 border border-slate-200 shadow-sm">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">CNH</p>
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        {data.cnhData.registroCnh} 
                        <span className="text-xs bg-slate-100 px-1.5 rounded text-slate-600">Cat {data.cnhData.categoria}</span>
                      </span>
                    </div>
                  )}
                  {data.source === 'IA' && (
                    <div className="bg-white p-3 rounded-xl flex-1 border border-slate-200 shadow-sm">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Score</p>
                      <span className={`font-bold text-lg ${data.score > 700 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {data.score}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-8 space-y-8 bg-white/50">
                
                {/* Se for BrasilAPI ou Infosimples PJ */}
                {(data.source === 'BrasilAPI' || (data.source === 'Infosimples' && activeTab === 'cnpj')) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <h3 className="text-slate-800 font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-blue-600">
                          <MapPin size={16}/> Endereço Registrado
                        </h3>
                        {data.address ? (
                          <p className="text-slate-600 leading-relaxed">
                            {data.address.street}, {data.address.number}<br/>
                            {data.address.city} - {data.address.state}
                          </p>
                        ) : <p className="text-slate-400 italic">Não informado</p>}
                     </div>
                     <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <h3 className="text-slate-800 font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-blue-600">
                          <Users size={16}/> Quadro Societário
                        </h3>
                        {data.partners && data.partners.length > 0 ? (
                          <ul className="text-slate-600 text-sm space-y-2">
                            {data.partners.map((p, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {p}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-400 text-sm italic">Sem sócios listados ou MEI.</p>
                        )}
                     </div>
                  </div>
                )}

                {/* Dados Denatran */}
                {data.source === 'Denatran' && data.cnhData && (
                   <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                      <h3 className="text-emerald-700 font-bold mb-4 flex items-center gap-2">
                        <FileCheck size={18} /> Dados Oficiais do Condutor (Base Nacional)
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                         <div>
                           <p className="text-slate-500 text-xs">Primeira Habilitação</p>
                           <p className="text-slate-800 font-medium">{data.cnhData.dataPrimeiraHabilitacao}</p>
                         </div>
                         <div>
                           <p className="text-slate-500 text-xs">Validade CNH</p>
                           <p className="text-slate-800 font-medium">{data.cnhData.dataValidade}</p>
                         </div>
                         <div className="col-span-2">
                           <p className="text-slate-500 text-xs">Bloqueios / Impedimentos</p>
                           {data.cnhData.bloqueios && data.cnhData.bloqueios.length > 0 ? (
                             <div className="mt-1 flex flex-wrap gap-2">
                               {data.cnhData.bloqueios.map((b, i) => (
                                 <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs border border-red-200">{b}</span>
                               ))}
                             </div>
                           ) : (
                             <p className="text-emerald-600 mt-1 font-medium flex items-center gap-1"><ShieldCheck size={14}/> Nada Consta</p>
                           )}
                         </div>
                      </div>
                   </div>
                )}

                {/* Veículos Encontrados */}
                {data.vehicles.length > 0 ? (
                  <section>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CarFront size={16} className="text-blue-600" /> Veículos Vinculados ({data.vehicles.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {data.vehicles.map((car, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm hover:border-blue-300 transition-colors">
                          <div>
                            <p className="font-bold text-slate-800">{car.model}</p>
                            <p className="text-xs text-slate-500 font-mono mt-1 bg-slate-100 px-2 py-0.5 rounded inline-block">{car.plate}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded border ${car.status === 'Em dia' || car.status === 'Consultar' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                            {car.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <section className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-slate-500 text-sm italic">
                    Nenhum veículo encontrado neste documento ou base do Detran indisponível no momento.
                  </section>
                )}

                {/* Notas */}
                <section>
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
                     {data.source === 'BrasilAPI' ? 'Atividade Econômica' : 'Análise de Perfil'}
                   </h3>
                   <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-slate-600 text-sm leading-relaxed whitespace-pre-line shadow-inner">
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