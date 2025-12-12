
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, Sparkles, Bot, User, ArrowRight, Loader2, Database, Mic, MicOff } from 'lucide-react';
import { createChatSession } from '../services/aiAssistantService';
import { generatePersonProfile, generateVehicleReport } from '../services/geminiService';
import { getCepData } from '../services/brasilApiService';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

// Declaração global para evitar erro de TS com WebkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou o KW-AI. Posso consultar placas, documentos ou te ajudar a navegar. Experimente dizer: "Consulte a placa ABC-1234".' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [statusText, setStatusText] = useState(''); // Feedback visual de ação
  const [isListening, setIsListening] = useState(false); // Estado do microfone
  
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  // Lógica do Agente Executivo: Conecta a intenção da IA com o Serviço Real
  const performQuery = async (type: string, value: string) => {
    try {
      if (type === 'VEHICLE') {
        setStatusText("Acessando base Detran/FIPE...");
        // Usa o serviço híbrido (API + IA Fallback)
        const data = await generateVehicleReport(value);
        return { 
          found: true, 
          data: {
             modelo: data.model,
             ano: data.year,
             valor: data.priceEstimate,
             historico: data.history,
             alertas: data.commonIssues
          }
        };
      } else if (type === 'PERSON' || type === 'COMPANY') {
        setStatusText("Consultando Receita Federal...");
        // Usa o serviço híbrido
        const data = await generatePersonProfile(value);
        return {
           found: true,
           data: {
             nome: data.name,
             documento: data.cpf,
             status: data.status,
             score: data.score,
             bens_vinculados: data.vehicles.length > 0 ? data.vehicles : 'Nenhum'
           }
        };
      } else if (type === 'CEP') {
        setStatusText("Geolocalizando...");
        const data = await getCepData(value);
        return { found: true, data };
      }
      return { found: false, message: "Tipo de consulta não suportado via chat." };
    } catch (error) {
      return { found: false, message: "Erro de conexão com a base de dados. Tente pelo menu principal." };
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const textToSend = overrideText || input;
    
    if (!textToSend.trim()) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsTyping(true);
    setStatusText('');

    try {
      const chat = chatSessionRef.current;
      
      let result = await chat.sendMessage(textToSend);
      let response = result.response;
      
      // Processamento de Tools (Function Calling)
      const functionCalls = response.functionCalls();
      
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        let functionResult = {};

        // 1. Navegação
        if (call.name === 'navigate_to_page') {
          const { route, reason } = call.args;
          if (location.pathname !== route) {
            navigate(route);
            functionResult = { status: "success", message: `Navegado para ${route}.` };
            setStatusText(`Navegando: ${reason || 'Acessando área solicitada'}`);
          } else {
             functionResult = { status: "info", message: "Usuário já está nesta página." };
          }
        } 
        // 2. Conhecimento Geral
        else if (call.name === 'get_app_info') {
             functionResult = { info: "KWcar v1.2.0 - Plataforma de Inteligência Veicular." };
        }
        // 3. Execução de Consulta (Agente Ativo)
        else if (call.name === 'execute_query') {
             const { type, value } = call.args;
             functionResult = await performQuery(type, value);
        }

        // Devolve o resultado (JSON) para a IA gerar a resposta em linguagem natural
        result = await chat.sendMessage([{
            functionResponse: {
              name: call.name,
              response: functionResult
            }
        }]);
        response = result.response;
      }

      setMessages(prev => [...prev, { role: 'model', text: response.text() }]);

    } catch (error) {
      console.error("Erro no chat:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Desculpe, tive uma instabilidade na conexão neural. Pode repetir?" }]);
    } finally {
      setIsTyping(false);
      setStatusText('');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Opcional: Auto-envio após terminar de falar
      setTimeout(() => handleSendMessage(undefined, transcript), 500);
    };

    recognition.onerror = (event: any) => {
      console.error("Erro no reconhecimento de voz", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <>
      {/* Botão Flutuante (FAB) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-110 transition-transform group animate-fade-in-up"
        >
          <Sparkles className="text-white group-hover:rotate-12 transition-transform" size={24} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[85vh] flex flex-col glass-card rounded-3xl shadow-2xl border border-white/60 animate-fade-in-up overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">KW-AI Assistant</h3>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50 backdrop-blur-sm custom-scrollbar">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
                  ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'}
                `}>
                  {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                </div>
                
                <div className={`
                  max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-white text-slate-700 rounded-tr-none border border-slate-100' 
                    : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-tl-none'}
                `}>
                  {msg.role === 'model' ? (
                     <ReactMarkdown className="prose prose-invert prose-xs">
                        {msg.text}
                     </ReactMarkdown>
                  ) : (
                     msg.text
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex flex-col gap-2 animate-fade-in-up">
                 <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                        <Sparkles size={14} className="text-white" />
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center h-10">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-200"></span>
                    </div>
                 </div>
                 {statusText && (
                   <p className="text-[10px] font-mono text-blue-600 ml-12 animate-pulse flex items-center gap-1.5 bg-blue-50 w-fit px-2 py-0.5 rounded border border-blue-100">
                     <Loader2 size={10} className="animate-spin" /> {statusText}
                   </p>
                 )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={(e) => handleSendMessage(e)} className="p-3 bg-white border-t border-slate-200">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ex: Consultar placa OOO-0000"
                    className="w-full bg-slate-100 text-slate-700 placeholder-slate-400 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                />
                <button 
                    type="button"
                    onClick={toggleListening}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-blue-500 hover:bg-slate-200'}`}
                    title="Comando de Voz"
                >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </div>
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-md shrink-0"
              >
                {isTyping ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </form>

        </div>
      )}
    </>
  );
};

export default AiAssistant;
