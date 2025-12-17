
import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Shield, CreditCard, Check, 
  Palette, Smartphone, Zap, Crown, CheckCircle2,
  AlertCircle, LogOut, FileText, Scale, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { logout } = useAuth();
  
  // Estado do Usuário (Simulado)
  const [user, setUser] = useState({
    name: 'Admin KWcar',
    email: 'admin@kwcar.com',
    role: 'Gestor de Frota',
    avatar: 'https://i.pravatar.cc/150?u=kwcar'
  });

  // Estado do Plano
  const [currentPlan, setCurrentPlan] = useState('pro');

  // Estado da Skin (Tema) - Controlado via CSS Hue Rotate no body
  const [themeHue, setThemeHue] = useState(() => {
    return localStorage.getItem('kw_theme_hue') || '0';
  });

  useEffect(() => {
    // Aplica o filtro de cor ao elemento HTML principal
    const root = document.documentElement;
    root.style.filter = `hue-rotate(${themeHue}deg)`;
    localStorage.setItem('kw_theme_hue', themeHue);
    
    // Cleanup ao desmontar
    return () => {
      // root.style.filter = 'none'; // Mantemos para persistir a navegação
    };
  }, [themeHue]);

  const themes = [
    { name: 'Original Blue', hue: '0', color: 'bg-blue-600' },
    { name: 'Cyber Purple', hue: '45', color: 'bg-purple-600' },
    { name: 'Forest Green', hue: '-100', color: 'bg-emerald-600' },
    { name: 'Sunset Orange', hue: '150', color: 'bg-orange-600' },
    { name: 'Midnight', hue: '200', color: 'bg-slate-700' },
  ];

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'Grátis',
      features: ['5 Consultas/dia', 'Tabela FIPE', 'Busca CEP', 'Suporte por Email'],
      icon: User,
      color: 'bg-slate-500'
    },
    {
      id: 'pro',
      name: 'KWcar Pro',
      price: 'R$ 99/mês',
      features: ['50 Consultas/dia', 'Infosimples & Detran', 'IA Scanner (Básico)', 'Suporte Prioritário', 'Sem anúncios'],
      icon: Zap,
      color: 'bg-blue-600',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Sob Consulta',
      features: ['API Ilimitada', 'Consultas Massivas', 'Gestor Dedicado', 'IA Scanner Pro', 'Webhooks', 'SSO'],
      icon: Crown,
      color: 'bg-purple-600'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">Configurações</h1>
        <p className="text-slate-400 text-lg">Gerencie seu perfil, aparência e assinatura.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Perfil e Aparência */}
        <div className="space-y-8 xl:col-span-1">
          
          {/* Card de Perfil */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-900/50 to-purple-900/50 opacity-90 border-b border-white/5"></div>
            
            <div className="relative z-10 flex flex-col items-center mt-4">
              <div className="w-24 h-24 rounded-full border-4 border-slate-900 shadow-2xl overflow-hidden mb-4 relative">
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-slate-900 rounded-full"></div>
              </div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-slate-400 text-sm mb-6 flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                 {user.role}
              </p>
              
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <Mail size={18} className="text-slate-400" />
                  <span className="text-sm text-slate-300 truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <Shield size={18} className="text-emerald-400" />
                  <span className="text-sm text-slate-300">Conta Verificada</span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-3 mt-6">
                <button className="py-2.5 border border-white/10 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors bg-white/5">
                  Editar
                </button>
                <button 
                  onClick={logout}
                  className="py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={14} /> Sair
                </button>
              </div>
            </div>
          </div>

          {/* Card de Aparência (Skin) */}
          <div className="glass-card p-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="text-blue-400" size={20} />
              <h3 className="text-lg font-bold text-white">Aparência do App</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">Personalize a cor predominante da interface.</p>
            
            <div className="grid grid-cols-5 gap-2">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setThemeHue(t.hue)}
                  className={`
                    w-full aspect-square rounded-xl ${t.color} shadow-lg transition-transform hover:scale-110 flex items-center justify-center relative
                    ${themeHue === t.hue ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110' : 'opacity-80 hover:opacity-100'}
                  `}
                  title={t.name}
                >
                  {themeHue === t.hue && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Planos e Legal */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <CreditCard className="text-slate-400" /> Planos & Assinatura
            </h3>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-mono shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              Renovação em: 15/06/2024
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const Icon = plan.icon;
              
              return (
                <div 
                  key={plan.id}
                  className={`
                    relative p-6 rounded-2xl border transition-all duration-300 flex flex-col
                    ${isCurrent 
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.15)] z-10' 
                      : 'bg-slate-900/40 border-white/5 hover:bg-white/5 hover:border-white/10'}
                  `}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/40 border border-blue-400">
                      Mais Popular
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.color} text-white shadow-lg`}>
                    <Icon size={24} />
                  </div>

                  <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                  <p className="text-2xl font-bold text-slate-200 my-2">{plan.price}</p>

                  <ul className="space-y-3 mt-4 mb-8 flex-1">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                        <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${isCurrent ? 'text-blue-400' : 'text-slate-600'}`} />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setCurrentPlan(plan.id)}
                    disabled={isCurrent}
                    className={`
                      w-full py-3 rounded-xl font-bold text-sm transition-all
                      ${isCurrent 
                        ? 'bg-blue-500 text-white cursor-default shadow-lg shadow-blue-500/20' 
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'}
                    `}
                  >
                    {isCurrent ? 'Plano Atual' : 'Selecionar'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Seção de Compliance e Legal (Novo para MVP) */}
          <div className="mt-8 pt-8 border-t border-white/5">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Scale className="text-slate-400" /> Compliance & Privacidade
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><FileText size={18} /></div>
                          <h4 className="font-bold text-slate-200 text-sm">Termos de Uso</h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                          Ao utilizar a plataforma, você concorda que os dados são para fins de análise de risco e não devem ser utilizados para propósitos ilegais ou discriminatórios.
                      </p>
                      <button className="text-xs font-bold text-blue-400 hover:text-white transition-colors uppercase tracking-wide">Ler Termos Completos</button>
                  </div>

                  <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><ShieldCheck size={18} /></div>
                          <h4 className="font-bold text-slate-200 text-sm">LGPD & Proteção de Dados</h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                          O KWcar atua em conformidade com a Lei nº 13.709/2018. Todos os dados consultados são provenientes de fontes públicas ou autorizadas.
                      </p>
                      <button className="text-xs font-bold text-emerald-400 hover:text-white transition-colors uppercase tracking-wide">Política de Privacidade</button>
                  </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-white/5 flex gap-4 items-center">
                  <AlertCircle size={24} className="text-slate-600 shrink-0" />
                  <p className="text-xs text-slate-500">
                      <strong>Disclaimer:</strong> O KWcar Intelligence é uma ferramenta agregadora de dados. Não nos responsabilizamos pela veracidade absoluta das informações providas por APIs de terceiros (Detran/Receita Federal).
                  </p>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
