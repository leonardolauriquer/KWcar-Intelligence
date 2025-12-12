
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  icon?: any;
}

const AutocompleteInput: React.FC<AutocompleteProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  className = "",
  icon: Icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fecha o dropdown se clicar fora
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    onChange(inputVal);

    if (inputVal.length > 1) {
      // Lógica de busca "fuzzy" simples (case insensitive + remove acentos)
      const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const term = normalize(inputVal);
      
      const filtered = options.filter(opt => normalize(opt).includes(term));
      setFilteredOptions(filtered.slice(0, 6)); // Limita a 6 sugestões
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectOption = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative group ${className}`}>
      {/* Input Field */}
      <div className="relative">
        {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                <Icon size={20} />
            </div>
        )}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length > 1 && setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full bg-white/80 backdrop-blur-md border border-slate-200 text-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-semibold placeholder:font-normal placeholder-slate-400 shadow-sm ${Icon ? 'pl-12' : ''}`}
        />
        {/* Glow effect on focus */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition duration-500 pointer-events-none"></div>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border border-white/50 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
          <ul className="py-1">
            {filteredOptions.map((option, idx) => (
              <li 
                key={idx}
                onClick={() => handleSelectOption(option)}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-colors border-b border-slate-100 last:border-0"
              >
                <span className="text-slate-700 font-medium group-hover:text-blue-700">
                  {/* Realça a parte que o usuário digitou (opcional, aqui simplificado) */}
                  {option}
                </span>
                <Search size={14} className="text-slate-300 group-hover:text-blue-400" />
              </li>
            ))}
          </ul>
          <div className="bg-slate-50 px-3 py-1 text-[10px] text-slate-400 text-right font-mono">
            Sugestões inteligentes
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
