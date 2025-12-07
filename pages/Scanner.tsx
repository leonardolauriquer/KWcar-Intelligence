import React, { useState, useRef } from 'react';
import { Camera, Upload, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const Scanner: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAnalysis(null); // Clear previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;

    setLoading(true);
    try {
      // Extract base64 content and mimetype
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imagePreview.split(';')[0].split(':')[1];
      
      const result = await analyzeImage(base64Data, mimeType);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      alert("Erro ao analisar imagem. Tente uma imagem mais clara.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      
      {/* Área de Input / Visualização */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Scanner Visual AI</h1>
            <p className="text-slate-500 text-sm">Analise carros ou documentos (CNH/CRLV)</p>
          </div>
        </div>

        <div className="flex-1 bg-white border-2 border-dashed border-slate-300 rounded-2xl relative overflow-hidden group hover:border-blue-500 transition-colors flex items-center justify-center shadow-sm">
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Camera size={32} />
              </div>
              <p className="text-slate-600 font-medium mb-1">Arraste uma foto ou clique para upload</p>
              <p className="text-slate-400 text-sm">Suporta JPG, PNG</p>
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
                if(fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute top-4 right-4 p-2 bg-white text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm border border-slate-200"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!imagePreview || loading}
          className={`
            w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
            ${!imagePreview || loading 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/20'}
          `}
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" /> Analisando com Gemini Pro...
            </>
          ) : (
            <>
              <Upload size={20} /> Processar Imagem
            </>
          )}
        </button>
      </div>

      {/* Área de Resultado */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden h-full shadow-lg shadow-slate-200/50">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Check size={18} className="text-emerald-500" /> Resultado da Análise
          </h2>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-white">
          {!analysis && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
              <AlertCircle size={48} className="mb-4" />
              <p className="text-center max-w-xs">
                O resultado da análise aparecerá aqui após o processamento da imagem.
              </p>
            </div>
          )}
          
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-32 bg-slate-200 rounded w-full"></div>
            </div>
          )}

          {analysis && (
            <div className="prose prose-slate prose-sm max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;