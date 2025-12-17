
import React, { useState } from 'react';
import { Swords, Loader2, Trophy, ThumbsUp, ThumbsDown, Zap, Fuel, Settings, AlertTriangle, Car } from 'lucide-react';
import { compareVehicles } from '../services/geminiService';
import AutocompleteInput from '../components/AutocompleteInput';
import { POPULAR_CARS } from '../data/carList';

const VehicleCompare: React.FC = () => {
  const [carA, setCarA] = useState('');
  const [carB, setCarB] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carA || !carB) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await compareVehicles(carA, carB);
      setResult(data);
    } catch (error) {
      alert("Erro ao comparar veículos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-10">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-3">
          <Swords className="text-red-500" size={40} />
          COMPARATIVO
        </h1>
        <p className="text-slate-400 text-lg">Comparativo Técnico & Mercadológico via IA</p>
      </div>

      {/* Input Area */}
      <form onSubmit={handleCompare} className="relative z-20">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            
            {/* Car A Input */}
            <div className="w-full max-w-md">
                <label className="block text-xs font-bold text-blue-400 uppercase mb-2 ml-1">Desafiante 1</label>
                <AutocompleteInput
                    value={carA}
                    onChange={setCarA}
                    options={POPULAR_CARS}
                    placeholder="Ex: Honda Civic Touring"
                    icon={Car}
                />
            </div>

            {/* VS Badge */}
            <div className="z-10 mt-6 bg-slate-900 text-white font-black text-xl w-14 h-14 rounded-full flex items-center justify-center border-4 border-slate-700 shadow-[0_0_20px_rgba(239,68,68,0.5)] transform md:scale-125 shrink-0 animate-pulse-slow">
                VS
            </div>

            {/* Car B Input */}
            <div className="w-full max-w-md">
                <label className="block text-xs font-bold text-red-400 uppercase mb-2 ml-1">Desafiante 2</label>
                <AutocompleteInput
                    value={carB}
                    onChange={setCarB}
                    options={POPULAR_CARS}
                    placeholder="Ex: Toyota Corolla XEi"
                    icon={Car}
                />
            </div>
        </div>

        <div className="flex justify-center mt-10">
            <button
                type="submit"
                disabled={loading || !carA || !carB}
                className="px-10 py-4 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-red-900 hover:to-slate-900 border border-white/10 hover:border-red-500/50 text-white font-bold rounded-2xl shadow-lg shadow-black/50 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 uppercase tracking-widest"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'INICIAR BATALHA'}
            </button>
        </div>
      </form>

      {/* Results Area */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 animate-fade-in-up">
            
            {/* Card Car A */}
            <CarCard 
                data={result.carA} 
                isWinner={result.verdict.winner === 'A'} 
                color="blue"
            />

            {/* Card Car B */}
            <CarCard 
                data={result.carB} 
                isWinner={result.verdict.winner === 'B'} 
                color="red"
            />

            {/* Verdict - Full Width */}
            <div className="lg:col-span-2 mt-8">
                <div className="glass-card p-8 rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-yellow-900/10 to-transparent relative overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Trophy size={120} className="text-yellow-500" />
                    </div>
                    
                    <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <Trophy className="text-yellow-500" /> Veredito Final
                    </h3>
                    
                    <div className="prose prose-invert max-w-none">
                        <p className="text-lg text-slate-300 leading-relaxed font-medium border-l-4 border-yellow-500/50 pl-4">
                            {result.verdict.reason}
                        </p>
                        <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-yellow-500/20">
                             <p className="text-xs font-bold text-yellow-500/70 uppercase tracking-wide mb-1">Perfil de Compra Ideal</p>
                             <p className="text-slate-200">{result.verdict.bestFor}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// Subcomponente para o Card do Veículo
const CarCard = ({ data, isWinner, color }: any) => {
    const theme = color === 'blue' 
        ? 'border-blue-500/30 bg-blue-900/10 text-blue-200' 
        : 'border-red-500/30 bg-red-900/10 text-red-200';
    
    const winnerTheme = color === 'blue'
        ? 'border-blue-400 bg-gradient-to-b from-blue-900/40 to-slate-900/80 shadow-[0_0_40px_rgba(59,130,246,0.2)]'
        : 'border-red-400 bg-gradient-to-b from-red-900/40 to-slate-900/80 shadow-[0_0_40px_rgba(239,68,68,0.2)]';

    const baseClasses = "relative rounded-3xl border p-6 transition-all duration-500 backdrop-blur-md";
    
    const finalClasses = isWinner 
        ? `${baseClasses} ${winnerTheme} scale-105 z-10` 
        : `${baseClasses} ${theme} opacity-60 hover:opacity-100 grayscale-[0.5] hover:grayscale-0 scale-95`;

    return (
        <div className={finalClasses}>
            {isWinner && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-950 font-black px-4 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wider text-sm border-2 border-slate-900">
                    <Trophy size={14} /> Vencedor
                </div>
            )}
            
            <h2 className="text-2xl font-bold text-white text-center mb-1 drop-shadow-md">{data.name}</h2>
            <p className={`text-center font-mono font-bold text-lg mb-6 ${color === 'blue' ? 'text-blue-400' : 'text-red-400'}`}>{data.price}</p>

            <div className="space-y-4 mb-8">
                <SpecRow icon={Settings} label="Motor" value={data.specs.engine} />
                <SpecRow icon={Zap} label="Potência" value={data.specs.power} />
                <SpecRow icon={Fuel} label="Consumo" value={data.specs.consumption} />
            </div>

            <div className="space-y-4">
                <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                    <h4 className="font-bold text-emerald-400 text-xs uppercase mb-2 flex items-center gap-1">
                        <ThumbsUp size={12} /> Pontos Fortes
                    </h4>
                    <ul className="space-y-1">
                        {data.pros.map((p: string, i: number) => (
                            <li key={i} className="text-xs text-emerald-200/80 flex items-start gap-1">
                                <span className="block w-1 h-1 bg-emerald-400 rounded-full mt-1.5 shrink-0"></span> {p}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                    <h4 className="font-bold text-rose-400 text-xs uppercase mb-2 flex items-center gap-1">
                        <ThumbsDown size={12} /> Pontos Fracos
                    </h4>
                    <ul className="space-y-1">
                        {data.cons.map((p: string, i: number) => (
                            <li key={i} className="text-xs text-rose-200/80 flex items-start gap-1">
                                <span className="block w-1 h-1 bg-rose-400 rounded-full mt-1.5 shrink-0"></span> {p}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const SpecRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Icon size={16} /> {label}
        </div>
        <span className="font-semibold text-slate-200 text-sm text-right">{value}</span>
    </div>
);

export default VehicleCompare;
