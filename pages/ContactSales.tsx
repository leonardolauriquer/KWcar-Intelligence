
import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle, Mail, Phone, Building, Zap, ShieldCheck, BarChart3, Car } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactSales: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulação de envio
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col font-sans text-slate-200">
      
      {/* Background Dynamic Elements (Igual ao Login) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/10 to-slate-950 z-0 pointer-events-none"></div>
      
      {/* Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-6 py-8 relative z-10 flex-1 flex flex-col">
        
        {/* Header Simples */}
        <div className="flex justify-between items-center mb-12 animate-fade-in-up">
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium px-4 py-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10">
                <ArrowLeft size={20} /> Voltar
            </Link>
            
            <div className="flex items-center gap-2 opacity-50">
                <Car size={20} />
                <span className="font-bold tracking-tight">KWcar Intelligence</span>
            </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center flex-1">
            
            {/* Coluna Esquerda: Copywriting */}
            <div className="space-y-10 animate-fade-in-up">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wide mb-6">
                        <Zap size={12} /> Soluções Enterprise
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
                        Inteligência que <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">blinda sua operação.</span>
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                        Concessionárias, Seguradoras e Gestores de Frotas usam o KWcar para reduzir riscos em até 40%. Solicite uma demo técnica.
                    </p>
                </div>

                <div className="space-y-4">
                    <BenefitItem 
                        icon={Zap} 
                        title="Decisões em Milissegundos" 
                        desc="APIs de alta performance para consulta de CPF/CNPJ e Veículos."
                    />
                    <BenefitItem 
                        icon={ShieldCheck} 
                        title="Compliance & LGPD" 
                        desc="Dados validados em bases oficiais governamentais e higienizados."
                    />
                    <BenefitItem 
                        icon={BarChart3} 
                        title="IA Preditiva" 
                        desc="Detecte fraudes e inconsistências antes de fechar o negócio."
                    />
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-slate-400">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/5"><Mail size={18}/></div>
                        <span className="text-sm font-medium">enterprise@kwcar.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/5"><Phone size={18}/></div>
                        <span className="text-sm font-medium">0800 123 4567</span>
                    </div>
                </div>
            </div>

            {/* Coluna Direita: Formulário */}
            <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                <div className="bg-white/5 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                    
                    {/* Hover Glow Effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[2.5rem] blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
                    
                    <div className="relative z-10">
                        {sent ? (
                            <div className="text-center py-20 space-y-6">
                                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                                    <CheckCircle size={48} className="text-emerald-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Solicitação Recebida!</h2>
                                <p className="text-slate-400 max-w-xs mx-auto">
                                    Nossa equipe de especialistas entrará em contato em breve.
                                </p>
                                <button 
                                    onClick={() => setSent(false)} 
                                    className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-bold transition-all"
                                >
                                    Enviar nova mensagem
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">Fale com Vendas</h2>
                                    <p className="text-slate-400 text-sm">Preencha os dados abaixo para receber contato.</p>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nome Completo</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-700 p-4 rounded-xl text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        placeholder="Ex: João Silva"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                                        <input 
                                            type="email" 
                                            required
                                            className="w-full bg-slate-900/50 border border-slate-700 p-4 rounded-xl text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            placeholder="corporativo@"
                                            value={formData.email}
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Empresa</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full bg-slate-900/50 border border-slate-700 p-4 rounded-xl text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            placeholder="Nome Ltda"
                                            value={formData.company}
                                            onChange={e => setFormData({...formData, company: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mensagem</label>
                                    <textarea 
                                        className="w-full bg-slate-900/50 border border-slate-700 p-4 rounded-xl text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all h-32 resize-none custom-scrollbar"
                                        placeholder="Tenho interesse no plano..."
                                        value={formData.message}
                                        onChange={e => setFormData({...formData, message: e.target.value})}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    {sending ? 'Enviando...' : <>Enviar Solicitação <Send size={18} /></>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const BenefitItem = ({ icon: Icon, title, desc }: any) => (
    <div className="flex gap-4 items-start group">
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl shadow-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <Icon size={24} className="text-blue-400 group-hover:text-white" />
        </div>
        <div>
            <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mt-1">{desc}</p>
        </div>
    </div>
);

export default ContactSales;
