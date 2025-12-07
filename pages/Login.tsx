
import React, { useState } from 'react';
import { Car, ArrowRight, Lock, Mail, Loader2, UserCheck, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  const handleDemoLogin = () => {
    setEmail('demo@kwcar.com');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/20 to-slate-950 z-0 pointer-events-none"></div>
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-[460px] p-6 relative z-10">
        
        {/* Floating Glass Card */}
        <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
          
          {/* Top Line Gradient */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/50 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Car size={40} className="text-white fill-white/10" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">KWcar <span className="text-blue-400 font-light">ID</span></h1>
            <p className="text-slate-400 text-sm">Acesso seguro à plataforma de inteligência.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Email Corporativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={20} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Chave de Acesso</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900" />
                Manter conectado
              </label>
              <a href="#" className="hover:text-blue-400 transition-colors">Recuperar senha</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-900/30 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Iniciar Sessão <ArrowRight size={20} />
                </>
              )}
            </button>
            
            {!email && !password && (
                <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-white/20"
                >
                <UserCheck size={16} /> Preencher Demo
                </button>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wide">
                <Shield size={12} /> Ambiente Seguro 256-bit
             </div>
             <p className="mt-4 text-xs text-slate-500">
               © 2024 KWcar Intelligence. <Link to="/contact-sales" className="text-slate-400 hover:text-white hover:underline">Contato</Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
