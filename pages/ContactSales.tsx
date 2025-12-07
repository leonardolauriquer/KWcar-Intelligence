import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle, Mail, Phone, Building, Zap, ShieldCheck, BarChart3 } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden flex flex-col">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto px-6 py-12 relative z-10 flex-1 flex flex-col justify-center">
        <div className="mb-8">
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium">
                <ArrowLeft size={20} /> Voltar para Login
            </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Coluna Esquerda: Copywriting */}
            <div className="space-y-8 animate-fade-in-up">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight leading-tight mb-4">
                        Potencialize sua <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Gestão de Risco</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                        O KWcar oferece a inteligência de dados mais avançada do mercado para concessionárias, seguradoras e frotas. Fale com nossos especialistas e solicite uma demonstração personalizada.
                    </p>
                </div>

                <div className="space-y-6">
                    <BenefitItem 
                        icon={Zap} 
                        title="Decisões em Tempo Real" 
                        desc="Consulte dados de CPF/CNPJ e Veículos em milissegundos com nossas APIs de alta performance."
                    />
                    <BenefitItem 
                        icon={ShieldCheck} 
                        title="Compliance Garantido" 
                        desc="Dados 100% adequados à LGPD e validados em bases oficiais governamentais."
                    />
                    <BenefitItem 
                        icon={BarChart3} 
                        title="Inteligência Preditiva" 
                        desc="Nossa IA analisa padrões para prever riscos de inadimplência e fraudes veiculares."
                    />
                </div>

                <div className="flex gap-6 pt-4 text-slate-500">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Mail size={18}/></div>
                        <span className="text-sm font-medium">comercial@kwcar.com.br</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Phone size={18}/></div>
                        <span className="text-sm font-medium">(11) 3003-0000</span>
                    </div>
                </div>
            </div>

            {/* Coluna Direita: Formulário */}
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="glass-card p-8 md:p-10 rounded-[2rem] border border-white/60 shadow-xl bg-white/50 backdrop-blur-xl">
                    {sent ? (
                        <div className="text-center py-12 space-y-4">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={40} className="text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Solicitação Recebida!</h2>
                            <p className="text-slate-500 max-w-xs mx-auto">
                                Nossa equipe comercial entrará em contato com você em até 2 horas comerciais.
                            </p>
                            <button 
                                onClick={() => setSent(false)} 
                                className="mt-6 text-blue-600 font-bold hover:underline"
                            >
                                Enviar outra mensagem
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Fale com Vendas</h2>
                            
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nome Completo</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-white border border-slate-200 p-4 rounded-xl text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="Ex: João Silva"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Corporativo</label>
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full bg-white border border-slate-200 p-4 rounded-xl text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                        placeholder="voce@empresa.com"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Empresa</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full bg-white border border-slate-200 p-4 rounded-xl text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                        placeholder="Nome da Empresa"
                                        value={formData.company}
                                        onChange={e => setFormData({...formData, company: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mensagem</label>
                                <textarea 
                                    className="w-full bg-white border border-slate-200 p-4 rounded-xl text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all h-32 resize-none"
                                    placeholder="Gostaria de saber mais sobre os planos..."
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
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
  );
};

const BenefitItem = ({ icon: Icon, title, desc }: any) => (
    <div className="flex gap-4 items-start">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm shrink-0">
            <Icon size={24} className="text-blue-600" />
        </div>
        <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default ContactSales;