
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, Gauge, AlertTriangle, FileText, Banknote, History, ShieldAlert, Lock, CheckCircle2, Star, Printer, Share2, Copy } from 'lucide-react';
import { generateVehicleReport } from '../services/geminiService';
import { getFipeData, isFipeCodeFormat } from '../services/brasilApiService';
import { getVeiculoDenatran, getInfracoesDenatran } from '../services/denatranService';
import { getVeiculoInfosimples } from '../services/infosimplesService';
import { VehicleReport } from '../types';
import { addToHistory } from '../services/historyService';
import { toggleWatchlist, isInWatchlist } from '../services/watchlistService';
import { saveContext, copyToClipboard, generateShareText } from '../utils/contextUtils';
import { useToast } from '../contexts/ToastContext';

const VehicleQuery: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<VehicleReport | null>(null);
  const [fipeHistory, setFipeHistory] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { addToast } = useToast();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
        setQuery(q);
        executeSearch(q);
    }
  }, [searchParams]);

  useEffect(() => {
    if (report) {
        const id = query.toUpperCase(); 
        setIsFavorite(isInWatchlist(id));
    }
  }, [report, query]);

  const handleFavorite = () => {
    if (!report) return;
    const id = query.toUpperCase();
    const added = toggleWatchlist({
        id,
        type: 'VEHICLE',
        value: query,
        title: report.model
    });
    setIsFavorite(added);
    addToast(added ? 'success' : 'info', added ? 'Adicionado ao Monitoramento' : 'Removido do Monitoramento');
  };

  const handlePrint = () => window.print();

  const handleCopy = (text: string, label: string) => {
      copyToClipboard(text);
      addToast('success', `${label} copiado!`);
  };

  const handleShare = () => {
      if(!report) return;
      const text = generateShareText(report.model, {
          "Placa/FIPE": query.toUpperCase(),
          "Ano": report.year,
          "Valor Estimado": report.priceEstimate,
          "Restrições": report.commonIssues.filter(i => i.includes('ALERTA')).length > 0 ? 'SIM' : 'NÃO',
          "Detalhes": report.commonIssues.join(', ')
      });
      window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery) return;

    setLoading(true);
    setReport(null);
    setFipeHistory([]);

    try {
      const cleanQuery = searchQuery.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (!isFipeCodeFormat(searchQuery)) {
          saveContext('last_plate', cleanQuery);
      }

      if (isFipeCodeFormat(searchQuery)) {
        const fipeDataList = await getFipeData(searchQuery);
        if (fipeDataList && fipeDataList.length > 0) {
          const latest = fipeDataList[0];
          const newReport: VehicleReport = {
            model: `${latest.marca} ${latest.modelo}`,
            year: latest.anoModelo === 32000 ? 'Zero KM' : latest.anoModelo.toString(),
            priceEstimate: latest.valor,
            specs: [`Combustível: ${latest.combustivel}`, `Código FIPE: ${latest.codigoFipe}`],
            commonIssues: ["Consulte um mecânico para avaliação específica deste modelo."],
            history: "Dados oficiais da Tabela FIPE. Valores de referência de mercado.",
            source: 'BrasilAPI'
          };
          setReport(newReport);
          setFipeHistory(fipeDataList);
          
          addToHistory({ type: 'VEHICLE', title: latest.marca + ' ' + latest.modelo, subtitle: 'FIPE: ' + latest.codigoFipe, status: 'success' });
          addToast('success', 'Dados FIPE encontrados');
        } else {
            addToast('error', 'Código FIPE não encontrado.');
        }
      } 
      else {
        // ... (Lógica de busca mantida igual, apenas logs de erro substituídos por toasts)
        
        try {
            const infoData = await getVeiculoInfosimples(cleanQuery);
            if (infoData.data) {
                const d = infoData.data;
                const newReport: VehicleReport = {
                    model: d.marca_modelo || `${d.marca || ''} ${d.modelo || ''}`.trim() || 'Veículo Identificado',
                    year: d.ano_fabricacao && d.ano_modelo ? `${d.ano_fabricacao}/${d.ano_modelo}` : (d.ano || 'Ano N/A'),
                    priceEstimate: d.preco_fipe || "Consulte FIPE",
                    specs: [
                        `Cor: ${d.cor || 'N/A'}`,
                        `Combustível: ${d.combustivel || 'N/A'}`,
                        `Município: ${d.municipio && d.uf ? `${d.municipio}-${d.uf}` : 'N/A'}`,
                        `Chassi: ${d.chassi || '***'}`,
                        `Renavam: ${d.renavam || '***'}`
                    ],
                    commonIssues: [
                        d.situacao_roubo_furto ? `ALERTA: ${d.situacao_roubo_furto}` : "Sem registro de roubo",
                        d.restricoes_judiciais ? "ALERTA: Restrição Judicial" : "Sem restrições"
                    ],
                    history: `Proprietário Atual: ${d.proprietario_nome || d.nome_proprietario || 'Consultar Detalhado'}\nSituação: ${d.situacao_veiculo || 'Regular'}`,
                    source: 'Infosimples'
                };
                setReport(newReport);
                addToHistory({ type: 'VEHICLE', title: newReport.model, subtitle: `Placa: ${cleanQuery}`, status: 'success' });
                setLoading(false);
                addToast('success', 'Veículo localizado na base Infosimples');
                return;
            }
        } catch(infoError) { console.warn("Infosimples Veículo falhou", infoError); }

        try {
          const denatranData = await getVeiculoDenatran(cleanQuery);
          const infracoes = await getInfracoesDenatran(cleanQuery);

          if (denatranData) {
            const newReport: VehicleReport = {
              model: `${denatranData.marcaModelo}`,
              year: `${denatranData.anoFabricacao}/${denatranData.anoModelo}`,
              priceEstimate: "Consulte FIPE",
              specs: [
                `Cor: ${denatranData.cor}`,
                `Combustível: ${denatranData.combustivel}`,
                `Município: ${denatranData.municipio}-${denatranData.uf}`,
                `Renavam: ${denatranData.renavam}`,
                `Chassi: ${denatranData.chassi}`
              ],
              commonIssues: [
                denatranData.restricoes.rouboFurto ? "ALERTA: Registro de Roubo/Furto ativo" : "Sem registro de roubo",
                denatranData.restricoes.judicial ? "ALERTA: Restrição Judicial (Renajud)" : "Sem restrições judiciais",
                infracoes.length > 0 ? `${infracoes.length} infrações encontradas` : "Nada consta de multas"
              ],
              history: `Proprietário Atual: ${denatranData.nomeProprietario}\nDocumento: ${denatranData.documentoProprietario}`,
              source: 'Denatran'
            };
            setReport(newReport);
            addToHistory({ type: 'VEHICLE', title: newReport.model, subtitle: `Placa: ${cleanQuery}`, status: 'success' });
            setLoading(false);
            addToast('success', 'Veículo localizado na base Denatran');
            return;
          }
        } catch (denatranError) { console.log("Denatran inacessível ou sem certificado, fallback para IA"); }

        const result = await generateVehicleReport(searchQuery);
        setReport({ ...result, source: 'IA' });
        addToHistory({ type: 'VEHICLE', title: result.model, subtitle: `Placa: ${cleanQuery} (IA)`, status: 'success' });
        addToast('warning', 'Dados gerados via IA (Simulação)', 'Base oficial indisponível no momento.');
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Falha na consulta', 'Verifique a conexão ou a placa digitada.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="print:hidden flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            Radar Veicular 360º
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></div>
        </h1>
        <p className="text-slate-400 text-lg">
           Busque por <span className="text-slate-200 font-bold">Código FIPE</span>, <span className="text-slate-200 font-bold">Placa</span> ou <span className="text-slate-200 font-bold">Chassi</span>.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-4 print:hidden">
        <div className="relative flex-1 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite: Placa (ABC-1234) ou FIPE (001004-9)"
                className="w-full bg-slate-900/90 border border-white/10 text-white p-4 pl-12 rounded-xl focus:border-cyan-500 outline-none uppercase placeholder:normal-case shadow-2xl font-mono text-lg transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          </div>
        </div>
        <button 
          type="submit"
          disabled={loading || !query}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide border border-blue-500/50"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Rastrear'}
        </button>
      </form>

      {report && (
        <div className="animate-fade-in-up">
            {/* Toolbar */}
            <div className="flex justify-end gap-2 mb-4 print:hidden">
                <button 
                    onClick={handleFavorite}
                    className={`p-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${isFavorite ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
                >
                    <Star size={16} fill={isFavorite ? "currentColor" : "none"} /> {isFavorite ? 'Monitorado' : 'Monitorar'}
                </button>
                <button 
                    onClick={handleShare}
                    className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
                >
                     <Share2 size={16} /> WhatsApp
                </button>
                <button 
                    onClick={handlePrint}
                    className="p-2 bg-white/5 text-slate-300 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
                >
                    <Printer size={16} /> Print
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cartão Principal */}
            <div className="lg:col-span-2 space-y-6">
                <div className={`glass-card p-8 rounded-2xl relative overflow-hidden shadow-2xl ${
                    report.source === 'Denatran' || report.source === 'Infosimples' ? 'border-emerald-500/30' : 'border-white/10'
                }`}>
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-white">
                    <Gauge size={180} />
                </div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-3xl font-black text-white max-w-[80%] font-sans tracking-tight">{report.model}</h2>
                        <div className="flex flex-col items-end gap-1">
                            {report.source === 'BrasilAPI' && <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-1 rounded border border-emerald-500/30 font-bold uppercase">Oficial FIPE</span>}
                            {report.source === 'Denatran' && <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-1 rounded border border-emerald-500/30 font-bold flex items-center gap-1 uppercase"><CheckCircle2 size={10}/> Denatran</span>}
                            {report.source === 'Infosimples' && <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-1 rounded border border-emerald-500/30 font-bold flex items-center gap-1 uppercase"><CheckCircle2 size={10}/> Infosimples</span>}
                            {report.source === 'IA' && <span className="bg-yellow-500/20 text-yellow-300 text-[10px] px-2 py-1 rounded border border-yellow-500/30 font-bold uppercase">IA Simulation</span>}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm font-bold border border-white/10">
                        {report.year}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-slate-900 text-cyan-400 text-sm font-mono font-bold border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                                {query.toUpperCase()}
                            </span>
                            <button onClick={() => handleCopy(query.toUpperCase(), 'Placa')} className="text-slate-500 hover:text-white transition-colors" title="Copiar Placa">
                              <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {report.specs.map((spec, i) => (
                        <div key={i} className="bg-slate-800/50 p-3 rounded-lg border border-white/5 text-slate-300 text-xs font-mono truncate" title={spec}>
                            {spec}
                        </div>
                        ))}
                    </div>
                </div>
                </div>

                <div className="glass-card border border-white/10 p-6 rounded-2xl relative group hover:border-blue-500/30 transition-colors">
                    <button onClick={() => handleCopy(report.history, 'Histórico')} className="absolute top-4 right-4 text-slate-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy size={16} />
                    </button>
                    <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                        <FileText size={16} className="text-blue-500" /> 
                        {report.source === 'BrasilAPI' ? 'Dados Tabela FIPE' : 'Histórico & Proprietário'}
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line font-mono">
                        {report.history}
                    </p>
                </div>
                
                {report.source === 'BrasilAPI' && fipeHistory.length > 1 && (
                    <div className="glass-card border border-white/10 p-6 rounded-2xl">
                        <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                            <History size={16} className="text-purple-500" /> Evolução de Preço
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {fipeHistory.slice(1).map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg text-sm border border-white/5">
                                    <span className="text-slate-400">{item.mesReferencia}</span>
                                    <span className="text-emerald-400 font-mono font-bold">{item.valor}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-900/10 border border-emerald-500/20 p-6 rounded-2xl shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                    <Banknote size={18} />
                    <span className="font-bold text-xs uppercase tracking-widest">
                        {report.source === 'BrasilAPI' ? 'Tabela FIPE' : 'Valuation'}
                    </span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{report.priceEstimate}</p>
                <p className="text-[10px] text-emerald-400/70 mt-2 font-mono uppercase">
                    {report.source === 'BrasilAPI' ? 'Referência Mês Atual' : 'Estimativa de Mercado'}
                </p>
                </div>

                <div className="glass-card border border-white/10 p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                    {report.source === 'Denatran' ? <ShieldAlert size={16} className="text-orange-500" /> : <AlertTriangle size={16} className="text-orange-500" />}
                    {report.source === 'Denatran' ? 'Situação Legal' : 'Alertas'}
                </h3>
                <ul className="space-y-3">
                    {report.commonIssues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300 font-medium">
                        <span className={`block w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${issue.includes('ALERTA') ? 'bg-red-500 animate-pulse' : 'bg-orange-400'}`} />
                        {issue}
                    </li>
                    ))}
                </ul>
                </div>
            </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default VehicleQuery;
