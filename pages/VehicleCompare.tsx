
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
        <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-3">
          <Swords className="text-red-500" size={40} />
          BATTLE MODE
        </h1>
        <p className="text-slate-500 text-lg">Comparativo Técnico & Mercadológico via IA</p>
      </div>

      {/* Input Area */}
      <form onSubmit={handleCompare} className="relative z-20">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            
            {/* Car A Input */}
            <div className="w-full max-w-md">
                <label className="block text-xs font-bold text-blue-600 uppercase mb-2 ml-1">Desafiante 1</label>
                <AutocompleteInput
                    value={carA}
                    onChange={setCarA}
                    options={POPULAR_CARS}
                    placeholder="Ex: Honda Civic Touring"
                    icon={Car}
                />
            </div>

            {/* VS Badge */}
            <div className="z-10 mt-6 bg-slate-900 text-white font-black text-xl w-14 h-14 rounded-full flex items-center justify-center border-4 border-white shadow-xl transform md:scale-125 shrink-0">
                VS
            </div>

            {/* Car B Input */}
            <div className="w-full max-w-md">
                <label className="block text-xs font-bold text-red-600 uppercase mb-2 ml-1">Desafiante 2</label>
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
                className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-slate-900/30 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
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
                <div className="glass-card p-8 rounded-3xl border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-50 to-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Trophy size={120} className="text-yellow-600" />
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <Trophy className="text-yellow-500" /> Veredito Final
                    </h3>
                    
                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg text-slate-700 leading-relaxed font-medium">
                            {result.verdict.reason}
                        </p>
                        <div className="mt-6 p-4 bg-white/60 rounded-xl border border-yellow-200">
                             <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">Perfil de Compra</p>
                             <p className="text-slate-800">{result.verdict.bestFor}</p>
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
        ? 'border-blue-200 bg-blue-50/50 from-blue-500 to-cyan-500 text-blue-700' 
        : 'border-red-200 bg-red-50/50 from-red-500 to-orange-500 text-red-700';
    
    const iconColor = color === 'blue' ? 'text-blue-500' : 'text-red-500';

    return (
        <div className={`relative rounded-3xl border-2 p-6 transition-all duration-500 ${isWinner ? `scale-105 shadow-2xl ${color === 'blue' ? 'shadow-blue-500/20 border-blue-500' : 'shadow-red-500/20 border-red-500'} bg-white z-10` : `${theme} grayscale-[0.3] hover:grayscale-0`}`}>
            {isWinner && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-black px-4 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wider text-sm">
                    <Trophy size={14} /> Vencedor
                </div>
            )}
            
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">{data.name}</h2>
            <p className={`text-center font-mono font-bold text-lg mb-6 ${iconColor}`}>{data.price}</p>

            <div className="space-y-4 mb-8">
                <SpecRow icon={Settings} label="Motor" value={data.specs.engine} />
                <SpecRow icon={Zap} label="Potência" value={data.specs.power} />
                <SpecRow icon={Fuel} label="Consumo" value={data.specs.consumption} />
            </div>

            <div className="space-y-4">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-700 text-xs uppercase mb-2 flex items-center gap-1">
                        <ThumbsUp size={12} /> Pontos Fortes
                    </h4>
                    <ul className="space-y-1">
                        {data.pros.map((p: string, i: number) => (
                            <li key={i} className="text-xs text-emerald-800 flex items-start gap-1">
                                <span className="block w-1 h-1 bg-emerald-500 rounded-full mt-1.5 shrink-0"></span> {p}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-700 text-xs uppercase mb-2 flex items-center gap-1">
                        <ThumbsDown size={12} /> Pontos Fracos
                    </h4>
                    <ul className="space-y-1">
                        {data.cons.map((p: string, i: number) => (
                            <li key={i} className="text-xs text-rose-800 flex items-start gap-1">
                                <span className="block w-1 h-1 bg-rose-500 rounded-full mt-1.5 shrink-0"></span> {p}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const SpecRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Icon size={16} /> {label}
        </div>
        <span className="font-semibold text-slate-700 text-sm">{value}</span>
    </div>
);

export default VehicleCompare;
