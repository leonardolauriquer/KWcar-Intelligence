
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
  ChevronRight
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
    { name: 'Utilitários', path: '/utilities', icon: Briefcase },
    { name: 'Scanner Vision', path: '/scanner', icon: ScanLine },
    { name: 'Sistema', path: '/settings', icon: SettingsIcon },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden relative selection:bg-cyan-200 selection:text-cyan-900 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* FLOATING SIDEBAR HUD */}
      <aside className={`
        fixed md:relative z-50 w-72 h-[95vh] my-auto ml-4 rounded-3xl
        glass-panel border border-white/40 shadow-2xl
        transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[110%] md:translate-x-0'}
        flex flex-col mt-[2.5vh]
      `}>
        <div className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                    <Car size={24} className="text-blue-600 transform -scale-x-100" />
                </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-800 block leading-none">KWcar</span>
              <span className="text-[10px] font-mono text-blue-600 font-bold tracking-widest uppercase">Intelligence</span>
            </div>
          </div>
          <button 
            className="md:hidden absolute top-8 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-2 px-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden font-medium
                  ${active 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/30' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/60 hover:shadow-sm'}
                `}
              >
                <div className="flex items-center gap-3 relative z-10">
                    <item.icon 
                    size={20} 
                    className={`transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`} 
                    />
                    <span>{item.name}</span>
                </div>
                {active && <ChevronRight size={16} className="text-white/70 animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* User Status Card */}
        <div className="p-4 mx-4 mb-4 rounded-2xl bg-gradient-to-br from-white/40 to-white/10 border border-white/50 backdrop-blur-md">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] text-slate-500 font-bold font-mono uppercase">API Status</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-xs font-bold text-slate-700">Online</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">v2.4</span>
          </div>

          <button 
            onClick={onLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all py-2 border border-transparent hover:border-red-100"
          >
            <LogOut size={14} /> ENCERRAR SESSÃO
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Header Mobile */}
        <header className="md:hidden h-16 glass-card border-b border-white/30 flex items-center px-4 justify-between sticky top-0 z-30 m-4 rounded-2xl">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-white/50 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg text-slate-800 tracking-tight">KWcar HUD</span>
          <div className="w-8" />
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full pb-20">
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
