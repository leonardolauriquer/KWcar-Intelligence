
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, Gauge, AlertTriangle, FileText, Banknote, History, ShieldAlert, Lock, CheckCircle2, Star, Printer, Share2, Copy, CheckCircle } from 'lucide-react';
import { generateVehicleReport } from '../services/geminiService';
import { getFipeData, isFipeCodeFormat } from '../services/brasilApiService';
import { getVeiculoDenatran, getInfracoesDenatran } from '../services/denatranService';
import { getVeiculoInfosimples } from '../services/infosimplesService';
import { VehicleReport } from '../types';
import { addToHistory } from '../services/historyService';
import { toggleWatchlist, isInWatchlist } from '../services/watchlistService';
import { saveContext, copyToClipboard, generateShareText } from '../utils/contextUtils';

const VehicleQuery: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<VehicleReport | null>(null);
  const [fipeHistory, setFipeHistory] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Auto-search se vier da URL (ex: ?q=ABC1234)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
        setQuery(q);
        executeSearch(q);
    }
  }, [searchParams]);

  // Verifica favorito quando o relatório muda
  useEffect(() => {
    if (report) {
        // Usa a placa ou o modelo como ID único simples para o MVP
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
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = (text: string, label: string) => {
      copyToClipboard(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
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
      
      // Salva contexto da Placa
      if (!isFipeCodeFormat(searchQuery)) {
          saveContext('last_plate', cleanQuery);
      }

      // 1. Verifica se é Código FIPE
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
          
          addToHistory({
             type: 'VEHICLE',
             title: latest.marca + ' ' + latest.modelo,
             subtitle: 'FIPE: ' + latest.codigoFipe,
             status: 'success'
          });
        } else {
            alert("Código FIPE não encontrado.");
        }
      } 
      // 2. Busca Veículo (Infosimples -> Denatran -> IA)
      else {
        
        // Tenta Infosimples primeiro
        try {
            const infoData = await getVeiculoInfosimples(cleanQuery);
            if (infoData.data) {
                const d = infoData.data;
                const modeloDesc = d.marca_modelo || `${d.marca || ''} ${d.modelo || ''}`.trim();
                
                const newReport: VehicleReport = {
                    model: modeloDesc || 'Veículo Identificado',
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
                
                addToHistory({
                    type: 'VEHICLE',
                    title: newReport.model,
                    subtitle: `Placa: ${cleanQuery}`,
                    status: 'success'
                });
                
                setLoading(false);
                return;
            }
        } catch(infoError) {
            console.warn("Infosimples Veículo falhou", infoError);
        }

        // Tenta Denatran
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
            
            addToHistory({
                type: 'VEHICLE',
                title: newReport.model,
                subtitle: `Placa: ${cleanQuery}`,
                status: 'success'
            });

            setLoading(false);
            return;
          }
        } catch (denatranError) {
          console.log("Denatran inacessível ou sem certificado, fallback para IA");
        }

        // 3. Fallback: Simulação IA
        const result = await generateVehicleReport(searchQuery);
        setReport({ ...result, source: 'IA' });
        
        addToHistory({
            type: 'VEHICLE',
            title: result.model,
            subtitle: `Placa: ${cleanQuery} (IA)`,
            status: 'success'
        });
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao buscar veículo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="print:hidden">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Consulta Veicular 360º</h1>
        <p className="text-slate-500">
           Busque por <span className="text-slate-700 font-bold">Código FIPE</span>, <span className="text-slate-700 font-bold">Placa</span> ou <span className="text-slate-700 font-bold">Chassi</span>.
           <br/><span className="text-xs opacity-70">O sistema prioriza a base oficial Infosimples/Denatran. Se indisponível, utiliza inteligência artificial preditiva.</span>
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-4 print:hidden">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite: Placa (ABC-1234) ou FIPE (001004-9)"
            className="w-full bg-white border border-slate-200 text-slate-800 p-4 pl-12 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none uppercase placeholder:normal-case shadow-xl shadow-slate-200/50 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>
        <button 
          type="submit"
          disabled={loading || !query}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Buscar'}
        </button>
      </form>

      {report && (
        <div className="animate-fade-in-up">
            {/* Toolbar de Ações */}
            <div className="flex justify-end gap-2 mb-4 print:hidden">
                <button 
                    onClick={handleFavorite}
                    className={`p-2 rounded-lg border transition-all flex items-center gap-2 text-sm font-bold ${isFavorite ? 'bg-yellow-100 text-yellow-600 border-yellow-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                    <Star size={16} fill={isFavorite ? "currentColor" : "none"} /> {isFavorite ? 'Monitorado' : 'Monitorar'}
                </button>
                <button 
                    onClick={handleShare}
                    className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all flex items-center gap-2 text-sm font-bold"
                    title="Enviar para WhatsApp"
                >
                     <Share2 size={16} /> WhatsApp
                </button>
                <button 
                    onClick={handlePrint}
                    className="p-2 bg-white text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 text-sm font-bold"
                >
                    <Printer size={16} /> Imprimir
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cartão Principal */}
            <div className="lg:col-span-2 space-y-6">
                <div className={`border p-8 rounded-2xl relative overflow-hidden shadow-sm ${
                    report.source === 'Denatran' || report.source === 'Infosimples' ? 'bg-white border-emerald-200' : 'bg-white border-slate-200'
                }`}>
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-slate-900">
                    <Gauge size={150} />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-3xl font-bold text-slate-800 max-w-[80%]">{report.model}</h2>
                        <div className="flex flex-col items-end gap-1">
                            {report.source === 'BrasilAPI' && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded border border-green-200 font-bold">Oficial FIPE</span>}
                            {report.source === 'Denatran' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded border border-emerald-200 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Denatran</span>}
                            {report.source === 'Infosimples' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded border border-emerald-200 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Infosimples</span>}
                            {report.source === 'IA' && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded border border-yellow-200 font-bold">Simulação IA</span>}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium border border-slate-200">
                        {report.year}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-sm font-mono font-medium border border-slate-200">
                                {query.toUpperCase()}
                            </span>
                            <button onClick={() => handleCopy(query.toUpperCase(), 'Placa')} className="text-slate-400 hover:text-blue-500" title="Copiar Placa">
                              <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {report.specs.map((spec, i) => (
                        <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600 text-sm truncate" title={spec}>
                            {spec}
                        </div>
                        ))}
                    </div>
                </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative group">
                    <button onClick={() => handleCopy(report.history, 'Histórico')} className="absolute top-4 right-4 text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy size={16} />
                    </button>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-blue-500" /> 
                        {report.source === 'BrasilAPI' ? 'Informações da Tabela' : 'Histórico & Proprietário'}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                        {report.history}
                    </p>
                </div>
                
                {/* Histórico FIPE se for BrasilAPI */}
                {report.source === 'BrasilAPI' && fipeHistory.length > 1 && (
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <History size={20} className="text-purple-500" /> Histórico de Preços (Últimos Meses)
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {fipeHistory.slice(1).map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm border border-slate-100">
                                    <span className="text-slate-500">{item.mesReferencia}</span>
                                    <span className="text-emerald-600 font-mono font-bold">{item.valor}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar de Informações */}
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-emerald-600">
                    <Banknote size={20} />
                    <span className="font-bold">
                        {report.source === 'BrasilAPI' ? 'Valor Tabela FIPE' : 'Estimativa de Preço'}
                    </span>
                </div>
                <p className="text-3xl font-bold text-emerald-800">{report.priceEstimate}</p>
                <p className="text-xs text-emerald-600/80 mt-2">
                    {report.source === 'BrasilAPI' ? 'Referência Mês Atual' : 'Baseado na tabela FIPE (Simulado)'}
                </p>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    {report.source === 'Denatran' ? <ShieldAlert size={20} className="text-orange-500" /> : <AlertTriangle size={20} className="text-orange-500" />}
                    {report.source === 'Denatran' ? 'Situação Legal' : 'Problemas Comuns'}
                </h3>
                <ul className="space-y-3">
                    {report.commonIssues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className={`block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${issue.includes('ALERTA') ? 'bg-red-500' : 'bg-orange-400'}`} />
                        {issue}
                    </li>
                    ))}
                </ul>
                </div>
            </div>
            </div>
        </div>
      )}
      
      {/* Toast de Cópia */}
      {copiedField && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-xl animate-fade-in-up flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            {copiedField} copiado!
        </div>
      )}
    </div>
  );
};

export default VehicleQuery;
