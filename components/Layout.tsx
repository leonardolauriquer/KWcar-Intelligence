
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  ScanLine, 
  Menu, 
  X,
  Briefcase,
  LogOut,
  Grid,
  Settings as SettingsIcon,
  ChevronRight,
  Swords,
  Cpu
} from 'lucide-react';
import AiAssistant from './AiAssistant';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Serviços API', path: '/services', icon: Grid },
    { name: 'Dossiê Pessoa', path: '/person', icon: Users },
    { name: 'Dossiê Veículo', path: '/vehicle', icon: Car },
    { name: 'Battle Mode', path: '/compare', icon: Swords }, 
    { name: 'Utilitários', path: '/utilities', icon: Briefcase },
    { name: 'Vision AI', path: '/scanner', icon: ScanLine },
    { name: 'Sistema', path: '/settings', icon: SettingsIcon },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200 font-sans text-slate-200">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* FLOATING SIDEBAR HUD */}
      <aside className={`
        fixed md:relative z-50 w-72 h-[96vh] my-[2vh] ml-4 rounded-3xl
        glass-panel border border-white/5 shadow-2xl
        transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[110%] md:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo Section */}
        <div className="p-8 pb-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"></div>
          
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-500 animate-pulse-slow"></div>
                <div className="relative w-12 h-12 bg-slate-900 rounded-2xl border border-white/10 flex items-center justify-center shadow-inner">
                    <Car size={24} className="text-blue-400 transform -scale-x-100 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white block leading-none font-sans">KWcar</span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest uppercase flex items-center gap-1">
                <Cpu size={10} /> Intelligence
              </span>
            </div>
          </div>
          <button 
            className="md:hidden absolute top-8 right-6 text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden font-medium border
                  ${active 
                    ? 'bg-blue-600/10 border-blue-500/50 text-white shadow-[0_0_20px_rgba(37,99,235,0.15)]' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/5'}
                `}
              >
                {/* Active Indicator Bar */}
                {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-cyan-400"></div>
                )}

                <div className="flex items-center gap-3 relative z-10">
                    <item.icon 
                    size={20} 
                    className={`transition-colors ${active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} 
                    />
                    <span className={active ? 'font-bold tracking-wide' : ''}>{item.name}</span>
                </div>
                {active && <ChevronRight size={16} className="text-cyan-400 animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* User Status Card */}
        <div className="p-4 mx-4 mb-4 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div>
              <p className="text-[10px] text-slate-500 font-bold font-mono uppercase tracking-wider">System Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 box-shadow-[0_0_10px_#10b981]"></span>
                </span>
                <p className="text-xs font-bold text-emerald-400 font-mono">ONLINE</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-600 border border-slate-700 px-1.5 rounded">v2.4.1</span>
          </div>

          <button 
            onClick={onLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all py-2 border border-white/5 hover:border-red-500/20 uppercase tracking-wide"
          >
            <LogOut size={14} /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Header Mobile */}
        <header className="md:hidden h-16 glass-card border-b border-white/10 flex items-center px-4 justify-between sticky top-0 z-30 m-4 rounded-2xl mb-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-300 hover:bg-white/10 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg text-white tracking-tight">KWcar HUD</span>
          <div className="w-8" />
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-[1600px] mx-auto w-full pb-20">
            {children}
          </div>
        </div>

        {/* AI Assistant Floating Widget */}
        <AiAssistant />
      </main>
    </div>
  );
};

export default Layout;
