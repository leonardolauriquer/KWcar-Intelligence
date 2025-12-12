
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Search, 
  Car, 
  Users, 
  ScanLine, 
  MapPin, 
  Briefcase, 
  Zap, 
  ArrowUpRight,
  ShieldCheck,
  Activity,
  CreditCard,
  Clock,
  History,
  Building2,
  Swords,
  Command
} from 'lucide-react';
import { getHistory, HistoryItem } from '../services/historyService';
import AutocompleteInput from '../components/AutocompleteInput';
import { GLOBAL_ACTIONS, getPathForAction } from '../data/appActions';

// Definição dos Aplicativos/Módulos do Sistema
interface AppItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  path: string;
  gradient: string;
  textColor: string;
  popular?: boolean;
}

const SYSTEM_APPS: AppItem[] = [
  {
    id: 'consult_cpf',
    title: 'Dossiê Pessoa Física',
    description: 'Varredura completa RFB, Score e Antecedentes.',
    icon: Users,
    path: '/person',
    gradient: 'from-purple-500 to-indigo-600',
    textColor: 'text-purple-600',
    popular: true
  },
  {
    id: 'consult_vehicle',
    title: 'Radar Veicular 360º',
    description: 'Decodificador de Chassi, FIPE e Restrições.',
    icon: Car,
    path: '/vehicle',
    gradient: 'from-blue-500 to-cyan-500',
    textColor: 'text-blue-600',
    popular: true
  },
  {
    id: 'vehicle_compare',
    title: 'Modo Batalha',
    description: 'Comparativo técnico e mercadológico IA.',
    icon: Swords,
    path: '/compare',
    gradient: 'from-red-500 to-orange-500',
    textColor: 'text-red-600',
    popular: true
  },
  {
    id: 'scanner_ai',
    title: 'Vision AI Scanner',
    description: 'Diagnóstico visual e OCR via Inteligência Artificial.',
    icon: ScanLine,
    path: '/scanner',
    gradient: 'from-emerald-400 to-teal-600',
    textColor: 'text-teal-600'
  },
  {
    id: 'fipe_table',
    title: 'Mercado & FIPE',
    description: 'Valuation histórico e tendências.',
    icon: Activity,
    path: '/vehicle',
    gradient: 'from-orange-400 to-amber-500',
    textColor: 'text-orange-600'
  },
  {
    id: 'cnpj_data',
    title: 'Inteligência PJ',
    description: 'QSA, Dívida Ativa e Riscos Corporativos.',
    icon: Briefcase,
    path: '/person',
    gradient: 'from-slate-600 to-slate-800',
    textColor: 'text-slate-600'
  },
  {
    id: 'address_finder',
    title: 'Geo Location',
    description: 'Precisão de endereço via CEP e Coordenadas.',
    icon: MapPin,
    path: '/utilities',
    gradient: 'from-pink-500 to-rose-500',
    textColor: 'text-pink-600'
  },
  {
    id: 'services_catalog',
    title: 'API Gateway',
    description: 'Acesso direto a 300+ endpoints governamentais.',
    icon: Search,
    path: '/services',
    gradient: 'from-violet-500 to-fuchsia-600',
    textColor: 'text-violet-600'
  }
];

// Componente AppCard com efeito Holográfico
interface AppCardProps {
  app: AppItem;
  isFav: boolean;
  onToggleFav: (e: React.MouseEvent, appId: string) => void;
  onNavigate: (path: string) => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, isFav, onToggleFav, onNavigate }) => {
  const Icon = app.icon;

  return (
    <div 
      onClick={() => onNavigate(app.path)}
      className="group relative h-full cursor-pointer"
    >
      {/* Background Glow Effect on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-10 blur-xl rounded-3xl transition-opacity duration-500`} />
      
      <div className="glass-card relative h-full p-6 rounded-3xl border border-white/60 hover:border-white transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col justify-between overflow-hidden">
        
        {/* Decorator Gradient Top */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${app.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />

        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={(e) => onToggleFav(e, app.id)}
            className={`p-2 rounded-full transition-all ${isFav ? 'bg-yellow-100 text-yellow-500' : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-50'}`}
          >
            <Star size={18} fill={isFav ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="mb-6 relative z-10">
          <div className={`
             w-14 h-14 rounded-2xl flex items-center justify-center mb-5
             bg-gradient-to-br ${app.gradient} text-white
             shadow-lg shadow-gray-200/50 group-hover:scale-110 transition-transform duration-300
          `}>
            <Icon size={26} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-colors">
            {app.title}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            {app.description}
          </p>
        </div>

        <div className="flex items-center justify-end">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [globalQuery, setGlobalQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kw_user_favorites');
      return saved ? JSON.parse(saved) : ['consult_cpf', 'consult_vehicle', 'vehicle_compare'];
    } catch {
      return ['consult_cpf', 'consult_vehicle'];
    }
  });
  
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    localStorage.setItem('kw_user_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const toggleFavorite = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation(); 
    setFavorites(prev => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const handleGlobalSelect = (action: string) => {
    setGlobalQuery(action);
    const path = getPathForAction(action);
    // Pequeno delay para visual
    setTimeout(() => navigate(path), 300);
  };

  const favoriteApps = SYSTEM_APPS.filter(app => favorites.includes(app.id));
  const popularApps = SYSTEM_APPS.filter(app => app.popular);
  const allApps = SYSTEM_APPS;

  // Saudações Dinâmicas
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getHistoryIcon = (type: string) => {
    if (type === 'VEHICLE') return <Car size={16} />;
    if (type === 'COMPANY') return <Building2 size={16} />;
    return <Users size={16} />;
  }

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="space-y-12 animate-fade-in-up pb-10 font-sans">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-10 text-white shadow-2xl">
         {/* Background complexo */}
         <div className="absolute inset-0 bg-slate-900 z-0"></div>
         <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-80 z-0"></div>
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-50 animate-pulse-slow"></div>
         <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 z-0 mix-blend-overlay"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="flex-1 w-full max-w-2xl">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold mb-6 text-cyan-300">
                  <Zap size={12} className="fill-cyan-300" /> SYSTEM ONLINE v2.4
               </div>
               <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                 {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">Admin</span>
               </h1>
               
               {/* Global Smart Search */}
               <div className="mt-8 relative z-20 group">
                  <AutocompleteInput 
                    value={globalQuery}
                    onChange={setGlobalQuery}
                    onSelect={handleGlobalSelect}
                    options={GLOBAL_ACTIONS}
                    placeholder="O que você deseja investigar hoje?"
                    icon={Command}
                    className="w-full text-slate-900"
                  />
                  <div className="mt-2 flex gap-4 text-xs text-blue-200 font-medium opacity-80 pl-4">
                     <span>Experimente: "Consultar Placa"</span>
                     <span>"Ver Tabela FIPE"</span>
                     <span>"CPF"</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Principal: Favoritos e Destaques */}
        <div className="lg:col-span-2 space-y-10">
            {/* Seção Favoritos (Grid Bento Style) */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 font-mono uppercase tracking-wider">
                <Star className="text-yellow-500" size={20} /> Acesso Rápido
                </h2>
                
                {favoriteApps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favoriteApps.map(app => (
                    <AppCard 
                        key={app.id} 
                        app={app} 
                        isFav={true}
                        onToggleFav={toggleFavorite}
                        onNavigate={(path) => navigate(path)}
                    />
                    ))}
                </div>
                ) : (
                <div className="border-2 border-dashed border-slate-300/60 rounded-3xl p-10 text-center bg-slate-50/50">
                    <p className="text-slate-400 font-medium">Configure seu workspace.</p>
                    <p className="text-slate-400 text-sm mt-1">Favorite apps para acesso imediato.</p>
                </div>
                )}
            </div>

             {/* Seção Inteligência (Destaques) */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 font-mono uppercase tracking-wider">
                <Activity className="text-blue-600" size={20} /> Inteligência Ativa
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {popularApps.map(app => (
                    <AppCard 
                        key={app.id} 
                        app={app} 
                        isFav={favorites.includes(app.id)}
                        onToggleFav={toggleFavorite}
                        onNavigate={(path) => navigate(path)}
                    />
                ))}
                </div>
            </div>
        </div>

        {/* Coluna Lateral: Histórico e Utilidade */}
        <div className="space-y-8">
            {/* Widget Histórico */}
            <div className="glass-card rounded-3xl border border-slate-200 overflow-hidden flex flex-col h-full max-h-[600px]">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <History size={18} className="text-slate-500" /> Atividade Recente
                    </h3>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">{history.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
                    {history.length > 0 ? history.map((item) => (
                        <div key={item.id} className="group p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all cursor-pointer flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                item.type === 'VEHICLE' ? 'bg-blue-100 text-blue-600' : 
                                item.type === 'COMPANY' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'
                            }`}>
                                {getHistoryIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-700 text-sm truncate">{item.title}</h4>
                                <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                                {formatTime(item.timestamp)}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center p-8 text-slate-400 text-sm">
                            Nenhuma consulta recente.
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>

      {/* Todos os Apps (Compact Grid) */}
      <div className="pt-8 border-t border-slate-200/60">
        <h2 className="text-lg font-bold text-slate-600 mb-6 font-mono uppercase tracking-wider opacity-70">
           Módulos Complementares
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allApps.filter(a => !a.popular).map(app => (
            <AppCard 
                key={app.id} 
                app={app} 
                isFav={favorites.includes(app.id)}
                onToggleFav={toggleFavorite}
                onNavigate={(path) => navigate(path)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
