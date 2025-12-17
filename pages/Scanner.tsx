import React, { useState, useRef } from 'react';
import { Camera, Upload, RefreshCw, AlertCircle, Check, Search, Scan, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyzeImage } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [detectedPlate, setDetectedPlate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAnalysis(null);
        setDetectedPlate(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;

    setLoading(true);
    setDetectedPlate(null);
    
    try {
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imagePreview.split(';')[0].split(':')[1];
      
      const result = await analyzeImage(base64Data, mimeType);
      setAnalysis(result);

      // Regex simples para tentar achar placa no texto Markdown (Padrão Mercosul ou antigo)
      // Ex: ABC1234 ou ABC-1234
      const plateRegex = /[A-Z]{3}[-]?[0-9][0-9A-Z][0-9]{2}/g;
      const match = result?.match(plateRegex);
      if (match && match.length > 0) {
          setDetectedPlate(match[0].replace('-', ''));
      }

    } catch (error) {
      console.error(error);
      alert("Erro ao analisar imagem. Tente uma imagem mais clara.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickInvestigate = () => {
      if (detectedPlate) {
          navigate(`/vehicle?q=${detectedPlate}`);
      }
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 animate-fade-in-up">
      
      {/* Área de Input / Visualização */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                <Scan className="text-blue-500" /> Scanner Visual AI
            </h1>
            <p className="text-slate-400 text-sm mt-1">Analise danos em veículos ou faça OCR de documentos (CNH/CRLV)</p>
          </div>
        </div>

        <div className="flex-1 bg-slate-900/50 border-2 border-dashed border-white/10 rounded-3xl relative overflow-hidden group hover:border-blue-500/50 transition-colors flex items-center justify-center shadow-inner">
          {imagePreview ? (
            <div className="relative w-full h-full p-4 flex items-center justify-center">
                 <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none rounded-2xl"></div>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500 border border-white/5 group-hover:scale-110 transition-transform">
                <Camera size={40} />
              </div>
              <p className="text-slate-300 font-bold mb-2 text-lg">Arraste uma foto ou clique</p>
              <p className="text-slate-500 text-sm font-mono">Suporta JPG, PNG, WEBP</p>
            </div>
          )}
          
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {imagePreview && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setImagePreview(null);
                setAnalysis(null);
                setDetectedPlate(null);
                if(fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute top-6 right-6 p-3 bg-slate-900 text-slate-400 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-colors shadow-lg border border-white/10"
            >
              <RefreshCw size={20} />
            </button>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!imagePreview || loading}
          className={`
            w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg
            ${!imagePreview || loading 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-blue-500/20 hover:scale-[1.01] border border-blue-500/50'}
          `}
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" /> Analisando com Gemini Pro Vision...
            </>
          ) : (
            <>
              <Upload size={20} /> Processar Imagem
            </>
          )}
        </button>
      </div>

      {/* Área de Resultado */}
      <div className="flex-1 glass-card border border-white/10 rounded-3xl flex flex-col overflow-hidden h-full shadow-2xl relative bg-slate-900/60 backdrop-blur-xl">
        <div className="p-5 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Check size={18} className="text-emerald-400" /> Resultado da Análise
          </h2>
          {analysis && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase font-bold tracking-wider">Processado</span>}
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-transparent pb-24">
          {!analysis && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
              <Scan size={64} className="mb-6 opacity-20" />
              <p className="text-center max-w-xs text-sm">
                O diagnóstico da IA aparecerá aqui.<br/>Identifique veículos, placas ou leia documentos.
              </p>
            </div>
          )}
          
          {loading && (
            <div className="space-y-6 animate-pulse p-2">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="space-y-3 mt-8">
                 <div className="h-2 bg-white/5 rounded w-full"></div>
                 <div className="h-2 bg-white/5 rounded w-full"></div>
                 <div className="h-2 bg-white/5 rounded w-5/6"></div>
              </div>
            </div>
          )}

          {analysis && (
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-blue-300 prose-strong:text-white prose-p:text-slate-300">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Action Button Overlay */}
        {detectedPlate && (
            <div className="absolute bottom-6 left-6 right-6 z-20">
                <button 
                    onClick={handleQuickInvestigate}
                    className="w-full bg-slate-800 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between hover:bg-slate-700 transition-all animate-fade-in-up border border-white/10 hover:border-blue-500/50 group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20">
                            <Search size={24} className="text-blue-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Placa Detectada</p>
                            <p className="text-xl font-black font-mono tracking-wide">{detectedPlate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-300 pr-2">
                        Investigar Agora <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;