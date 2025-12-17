
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
  Activity,
  History,
  Building2,
  Swords,
  Command,
  Eye,
  Cpu
} from 'lucide-react';
import { getHistory, HistoryItem } from '../services/historyService';
import AutocompleteInput from '../components/AutocompleteInput';
import { GLOBAL_ACTIONS, getPathForAction } from '../data/appActions';
import { getWatchlist, WatchlistItem } from '../services/watchlistService';

// Definição dos Aplicativos/Módulos do Sistema
interface AppItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  path: string;
  color: string;
  popular?: boolean;
}

const SYSTEM_APPS: AppItem[] = [
  {
    id: 'consult_cpf',
    title: 'Dossiê PF',
    description: 'Varredura RFB, Score e Criminal.',
    icon: Users,
    path: '/person',
    color: 'text-purple-400',
    popular: true
  },
  {
    id: 'consult_vehicle',
    title: 'Radar Veicular',
    description: 'Decodificador Chassi e FIPE.',
    icon: Car,
    path: '/vehicle',
    color: 'text-blue-400',
    popular: true
  },
  {
    id: 'vehicle_compare',
    title: 'Comparativo',
    description: 'Comparativo técnico IA.',
    icon: Swords,
    path: '/compare',
    color: 'text-red-400',
    popular: true
  },
  {
    id: 'scanner_ai',
    title: 'Vision AI',
    description: 'Diagnóstico visual e OCR.',
    icon: ScanLine,
    path: '/scanner',
    color: 'text-emerald-400'
  },
  {
    id: 'fipe_table',
    title: 'Mercado',
    description: 'Valuation histórico.',
    icon: Activity,
    path: '/vehicle',
    color: 'text-orange-400'
  },
  {
    id: 'cnpj_data',
    title: 'Intel PJ',
    description: 'QSA e Riscos Corp.',
    icon: Briefcase,
    path: '/person',
    color: 'text-slate-400'
  },
  {
    id: 'address_finder',
    title: 'Geo Location',
    description: 'Precisão de endereço.',
    icon: MapPin,
    path: '/utilities',
    color: 'text-pink-400'
  },
  {
    id: 'services_catalog',
    title: 'API Gateway',
    description: 'Acesso a 300+ endpoints.',
    icon: Search,
    path: '/services',
    color: 'text-violet-400'
  }
];

// Componente AppCard Estilo HUD
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
      className="glass-card group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-white/[0.03] overflow-hidden border border-white/5 hover:border-blue-500/30"
    >
      {/* Scanning Line Effect on Hover */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-blue-500/10 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-slate-900/50 border border-white/10 group-hover:border-blue-500/50 transition-colors ${app.color}`}>
            <Icon size={24} />
        </div>
        <button 
            onClick={(e) => onToggleFav(e, app.id)}
            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10 ${isFav ? 'text-yellow-400 opacity-100' : 'text-slate-500'}`}
        >
            <Star size={16} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>

      <h3 className="font-bold text-white text-lg mb-1 group-hover:text-blue-300 transition-colors font-sans">{app.title}</h3>
      <p className="text-slate-500 text-xs font-mono leading-relaxed line-clamp-2">
        {app.description}
      </p>

      <div className="mt-4 flex items-center text-xs text-slate-600 font-bold uppercase tracking-widest group-hover:text-blue-400 transition-colors">
         Acessar <ArrowUpRight size={12} className="ml-1" />
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
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    localStorage.setItem('kw_user_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    setHistory(getHistory());
    setWatchlist(getWatchlist());
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
    setTimeout(() => navigate(path), 300);
  };

  const navigateToWatchItem = (item: WatchlistItem) => {
      if (item.type === 'VEHICLE') {
          navigate(`/vehicle?q=${item.value}`);
      } else {
          navigate('/person');
      }
  }

  const favoriteApps = SYSTEM_APPS.filter(app => favorites.includes(app.id));
  const popularApps = SYSTEM_APPS.filter(app => app.popular);
  const allApps = SYSTEM_APPS;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      
      {/* Hero Section Holographic */}
      <div className="relative overflow-hidden rounded-[2rem] p-8 md:p-12 border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.1)] group">
         <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl z-0"></div>
         <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-purple-900/40 z-0"></div>
         <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 animate-pulse-slow"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="flex-1 w-full max-w-3xl">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 backdrop-blur-md text-[10px] font-bold mb-6 text-blue-300 uppercase tracking-widest">
                  <Zap size={10} className="fill-blue-300" /> System Online v2.4
               </div>
               <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white">
                 {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Admin</span>
               </h1>
               
               {/* Global Smart Search */}
               <div className="mt-8 relative z-20 group w-full">
                  <AutocompleteInput 
                    value={globalQuery}
                    onChange={setGlobalQuery}
                    onSelect={handleGlobalSelect}
                    options={GLOBAL_ACTIONS}
                    placeholder="Comando Inicial (Ex: Consultar Placa...)"
                    icon={Command}
                    className="w-full"
                  />
                  <div className="mt-3 flex gap-4 text-[10px] font-mono text-slate-400 opacity-70 pl-4 uppercase tracking-wider">
                     <span>CMD: "Placa ABC1234"</span>
                     <span>CMD: "CPF 000..."</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Principal: Módulos */}
        <div className="lg:col-span-2 space-y-10">
            {/* Favoritos */}
            <div>
                <h2 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2 font-mono uppercase tracking-widest pl-2">
                    <Star className="text-yellow-500" size={14} /> Acesso Prioritário
                </h2>
                
                {favoriteApps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center bg-white/5">
                    <p className="text-slate-500 text-sm font-mono">Slot Vazio. Adicione módulos.</p>
                </div>
                )}
            </div>

             {/* Destaques */}
            <div>
                <h2 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2 font-mono uppercase tracking-widest pl-2">
                    <Cpu className="text-blue-500" size={14} /> Módulos de Inteligência
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Coluna Lateral: Widgets */}
        <div className="space-y-6">
            
            {/* Widget Watchlist */}
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden flex flex-col h-fit">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-mono uppercase tracking-wider">
                        <Eye size={14} className="text-amber-500" /> Frota Alvo
                    </h3>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-mono">{watchlist.length}</span>
                </div>
                
                <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {watchlist.length > 0 ? watchlist.map((item) => (
                        <div key={item.id} onClick={() => navigateToWatchItem(item)} className="group p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-all border border-transparent hover:border-white/5">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-bold text-white font-mono text-sm">{item.value}</h4>
                                <ArrowUpRight size={12} className="text-slate-500 group-hover:text-amber-400" />
                            </div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wide truncate">{item.title}</p>
                        </div>
                    )) : (
                        <div className="p-6 text-center text-xs text-slate-600 font-mono">
                            Nenhum alvo monitorado.
                        </div>
                    )}
                </div>
            </div>

            {/* Widget Histórico */}
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden flex flex-col flex-1">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-mono uppercase tracking-wider">
                        <History size={14} className="text-slate-400" /> Log de Atividade
                    </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                    {history.length > 0 ? history.map((item) => (
                        <div key={item.id} className="group p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                item.type === 'VEHICLE' ? 'bg-blue-500/20 text-blue-400' : 
                                item.type === 'COMPANY' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'
                            }`}>
                                {item.type === 'VEHICLE' ? <Car size={14}/> : <Users size={14}/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-300 text-xs truncate font-mono">{item.title}</h4>
                                <p className="text-[10px] text-slate-500 truncate">{item.subtitle}</p>
                            </div>
                            <div className="text-[10px] text-slate-600 font-mono">
                                {formatTime(item.timestamp)}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center p-8 text-slate-600 text-xs font-mono">
                            Sem registros recentes.
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>

      {/* Footer Grid */}
      <div className="pt-8 border-t border-white/5">
        <h2 className="text-xs font-bold text-slate-500 mb-6 font-mono uppercase tracking-widest pl-2">
           Módulos Secundários
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
