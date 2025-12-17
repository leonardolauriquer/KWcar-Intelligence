
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Building, TrendingUp, Search, Loader2, Navigation, ArrowRight, Share2, Wallet } from 'lucide-react';
import { getCepData, getDddData, getBanksData, getTaxasData, isCepFormat, isDddFormat } from '../services/brasilApiService';
import { BrasilApiCep, BrasilApiDdd, BrasilApiBank, BrasilApiTaxa } from '../types';

const Utilities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cep' | 'ddd' | 'bancos' | 'taxas'>('cep');
  
  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">Hub de Dados Públicos</h1>
        <p className="text-slate-400 text-lg">Acesse bases governamentais e financeiras em tempo real.</p>
      </div>

      {/* Modern Pill Navigation Dark */}
      <div className="flex justify-center md:justify-start">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-md gap-1 overflow-x-auto max-w-full">
          <TabButton active={activeTab === 'cep'} onClick={() => setActiveTab('cep')} icon={MapPin} label="Endereço" />
          <TabButton active={activeTab === 'ddd'} onClick={() => setActiveTab('ddd')} icon={Phone} label="DDD/Cidades" />
          <TabButton active={activeTab === 'bancos'} onClick={() => setActiveTab('bancos')} icon={Wallet} label="Bancos" />
          <TabButton active={activeTab === 'taxas'} onClick={() => setActiveTab('taxas')} icon={TrendingUp} label="Indicadores" />
        </div>
      </div>

      <div className="min-h-[400px] transition-all duration-300">
        {activeTab === 'cep' && <CepTool />}
        {activeTab === 'ddd' && <DddTool />}
        {activeTab === 'bancos' && <BanksTool />}
        {activeTab === 'taxas' && <TaxasTool />}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm whitespace-nowrap
      ${active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'}
    `}
  >
    <Icon size={16} className={active ? 'text-white' : 'text-slate-500'} />
    {label}
  </button>
);

const CepTool = () => {
  const [cep, setCep] = useState('');
  const [data, setData] = useState<BrasilApiCep | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCepFormat(cep)) {
      setError('Formato inválido. Use 8 dígitos.');
      return;
    }
    setLoading(true);
    setError('');
    setData(null);
    try {
      const result = await getCepData(cep);
      setData(result);
    } catch (err) {
      setError('CEP não encontrado ou erro na busca.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div className="glass-card p-8 rounded-3xl border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Localizar Endereço</h3>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative group">
            <input 
              type="text" 
              value={cep} 
              onChange={(e) => setCep(e.target.value)}
              placeholder=" "
              className="peer w-full bg-slate-900/50 border border-white/10 text-white pt-6 pb-2 px-4 rounded-xl outline-none focus:border-blue-500 transition-all focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <label className="absolute left-4 top-4 text-slate-500 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-slate-500 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-blue-500 pointer-events-none">
              Digite o CEP (ex: 01001000)
            </label>
            <Search className="absolute right-4 top-3.5 text-slate-500 peer-focus:text-blue-500 transition-colors" size={20} />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !cep}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 border border-blue-400/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Buscar <ArrowRight size={18} /></>}
          </button>
        </form>
        {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"/> {error}</div>}
      </div>

      {data ? (
        <div className="glass-card p-0 rounded-3xl overflow-hidden relative group animate-fade-in-up border border-white/10">
           {/* Decorative Map BG - Usando um pattern escuro ou transparente */}
           <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] opacity-5 bg-cover bg-center invert filter brightness-200"></div>
           <div className="absolute top-0 right-0 p-6 opacity-20"><Navigation size={120} className="text-blue-500" /></div>

           <div className="p-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-4">
                 <MapPin size={12} /> ENDEREÇO ENCONTRADO
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{data.street}</h2>
              <p className="text-lg text-slate-400 mb-8">{data.neighborhood}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Cidade</p>
                  <p className="text-slate-200 font-semibold">{data.city}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Estado</p>
                  <p className="text-slate-200 font-semibold">{data.state}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 col-span-2">
                   <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">CEP</p>
                      <p className="text-xl font-mono text-blue-400 tracking-wider font-bold">{data.cep}</p>
                    </div>
                    <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                      <Share2 size={18} />
                    </button>
                   </div>
                </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="h-full border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-slate-500 gap-4 p-8 bg-white/5">
           <MapPin size={48} className="opacity-50" />
           <p className="text-sm">O resultado aparecerá aqui.</p>
        </div>
      )}
    </div>
  );
};

const DddTool = () => {
  const [ddd, setDdd] = useState('');
  const [data, setData] = useState<BrasilApiDdd | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDddFormat(ddd)) return;
    setLoading(true);
    try {
      const result = await getDddData(ddd);
      setData(result);
    } catch (err) {
      alert('DDD não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card p-6 rounded-3xl mb-8 flex flex-col md:flex-row items-center gap-6 border border-white/10">
        <div className="flex-1 w-full">
           <h3 className="text-lg font-bold text-white mb-1">Consultar Cidades por DDD</h3>
           <p className="text-slate-400 text-sm">Descubra a área de cobertura de um código.</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-3 w-full md:w-auto">
          <input 
            type="text" 
            value={ddd} 
            onChange={(e) => setDdd(e.target.value)}
            placeholder="DDD (Ex: 11)"
            maxLength={2}
            className="w-32 bg-slate-900/50 border border-white/10 text-white text-center text-xl font-bold p-3 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
          />
          <button type="submit" disabled={loading || ddd.length < 2} className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 border border-blue-400/20">
            {loading ? <Loader2 className="animate-spin" /> : 'Listar'}
          </button>
        </form>
      </div>

      {data && (
        <div className="animate-fade-in-up">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 font-bold text-xl">
                 {data.state}
              </div>
              <div>
                 <h2 className="text-2xl font-bold text-white">Estado: {data.state}</h2>
                 <p className="text-slate-400">{data.cities.length} cidades cobertas pelo DDD {ddd}</p>
              </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
             {data.cities.map((city, i) => (
               <div key={i} className="bg-slate-900/40 p-3 rounded-lg border border-white/5 hover:bg-white/5 hover:border-blue-500/30 transition-all text-sm text-slate-300 truncate cursor-default group relative shadow-sm">
                 <span className="relative z-10">{city}</span>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

const BanksTool = () => {
  const [banks, setBanks] = useState<BrasilApiBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getBanksData().then(setBanks).finally(() => setLoading(false));
  }, []);

  const filtered = banks.filter(b => 
    b.name?.toLowerCase().includes(filter.toLowerCase()) || 
    b.code?.toString().includes(filter)
  );

  return (
    <div className="space-y-6">
       <div className="relative max-w-lg mx-auto mb-8">
         <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-slate-500" size={20} />
         </div>
         <input 
            type="text" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Busque por nome do banco ou código..."
            className="w-full bg-slate-900/50 border border-white/10 text-white py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-lg shadow-xl"
         />
       </div>

       {loading ? (
         <div className="flex flex-col items-center justify-center p-20 gap-4">
           <Loader2 className="animate-spin text-blue-500" size={40} />
           <p className="text-slate-500">Carregando sistema bancário...</p>
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {filtered.slice(0, 48).map((bank) => (
             <div key={bank.ispb} className="group bg-slate-900/40 p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
               
               <div className="flex justify-between items-start mb-3 relative z-10">
                 <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-slate-400 font-bold border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {bank.code || '?'}
                 </div>
                 <span className="text-[10px] text-slate-500 font-mono bg-slate-950 px-2 py-1 rounded border border-white/5">ISPB: {bank.ispb}</span>
               </div>
               
               <h4 className="font-bold text-slate-200 text-sm line-clamp-2 min-h-[40px] relative z-10 group-hover:text-blue-300 transition-colors" title={bank.fullName}>
                 {bank.name || bank.fullName}
               </h4>
             </div>
           ))}
         </div>
       )}
    </div>
  );
};

const TaxasTool = () => {
  const [taxas, setTaxas] = useState<BrasilApiTaxa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTaxasData().then(setTaxas).finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading ? (
        <div className="col-span-3 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
      ) : (
        taxas.map((taxa, i) => (
          <div key={i} className="glass-card p-8 rounded-3xl flex flex-col justify-between group hover:border-emerald-500/30 transition-colors relative overflow-hidden bg-slate-900/30 border-white/10 shadow-sm">
             {/* Background glow */}
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all opacity-50"></div>
             
             <div className="flex justify-between items-start mb-4">
                <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">{taxa.nome}</p>
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                   <TrendingUp size={20} />
                </div>
             </div>
             
             <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white tracking-tighter">
                  {taxa.valor.toLocaleString('pt-BR')}
                </span>
                <span className="text-xl text-emerald-500 font-medium">%</span>
             </div>
             <p className="text-xs text-slate-500 mt-2">Taxa anualizada / Valor atual</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Utilities;
