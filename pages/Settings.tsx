
import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Shield, CreditCard, Check, 
  Palette, Smartphone, Zap, Crown, CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Settings: React.FC = () => {
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
    
    // Cleanup ao desmontar (opcional, mas bom para garantir consistência)
    return () => {
      // root.style.filter = 'none'; // Não remover para persistir a navegação
    };
  }, [themeHue]);

  const themes = [
    { name: 'Original Blue', hue: '0', color: 'bg-blue-600' },
    { name: 'Cyber Purple', hue: '45', color: 'bg-purple-600' },
    { name: 'Forest Green', hue: '-100', color: 'bg-emerald-600' },
    { name: 'Sunset Orange', hue: '150', color: 'bg-orange-600' },
    { name: 'Midnight', hue: '200', color: 'bg-slate-800' },
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
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Configurações</h1>
        <p className="text-slate-500 text-lg">Gerencie seu perfil, aparência e assinatura.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Perfil e Aparência */}
        <div className="space-y-8 xl:col-span-1">
          
          {/* Card de Perfil */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
            
            <div className="relative z-10 flex flex-col items-center mt-4">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4">
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
              <p className="text-slate-500 text-sm mb-4">{user.role}</p>
              
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Mail size={18} className="text-slate-400" />
                  <span className="text-sm text-slate-600 truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Shield size={18} className="text-emerald-500" />
                  <span className="text-sm text-slate-600">Conta Verificada</span>
                </div>
              </div>

              <button className="mt-6 w-full py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Editar Perfil
              </button>
            </div>
          </div>

          {/* Card de Aparência (Skin) */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="text-blue-600" size={20} />
              <h3 className="text-lg font-bold text-slate-800">Aparência do App</h3>
            </div>
            <p className="text-sm text-slate-500 mb-6">Personalize a cor predominante da interface.</p>
            
            <div className="grid grid-cols-5 gap-2">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setThemeHue(t.hue)}
                  className={`
                    w-full aspect-square rounded-xl ${t.color} shadow-sm transition-transform hover:scale-110 flex items-center justify-center
                    ${themeHue === t.hue ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}
                  `}
                  title={t.name}
                >
                  {themeHue === t.hue && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Planos */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="text-slate-800" /> Planos & Assinatura
            </h3>
            <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
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
                      ? 'bg-white border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02] z-10' 
                      : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'}
                  `}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      Mais Popular
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.color} text-white shadow-lg`}>
                    <Icon size={24} />
                  </div>

                  <h4 className="text-lg font-bold text-slate-800">{plan.name}</h4>
                  <p className="text-2xl font-bold text-slate-700 my-2">{plan.price}</p>

                  <ul className="space-y-3 mt-4 mb-8 flex-1">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${isCurrent ? 'text-blue-500' : 'text-slate-400'}`} />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setCurrentPlan(plan.id)}
                    disabled={isCurrent}
                    className={`
                      w-full py-2.5 rounded-xl font-bold text-sm transition-all
                      ${isCurrent 
                        ? 'bg-blue-50 text-blue-600 border border-blue-100 cursor-default' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-800 hover:text-white hover:border-slate-800'}
                    `}
                  >
                    {isCurrent ? 'Plano Atual' : 'Selecionar'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Banner de Info */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white flex items-start gap-4 shadow-lg">
            <div className="p-3 bg-white/10 rounded-xl">
              <AlertCircle size={24} className="text-blue-300" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Precisa de mais poder?</h4>
              <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                Para integrações via API dedicada, volumes acima de 10.000 consultas/mês ou acesso a dados brutos do Data Lake, entre em contato com nosso time Enterprise.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
