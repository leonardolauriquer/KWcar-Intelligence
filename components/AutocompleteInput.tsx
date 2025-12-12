
import React, { useState, useRef, useEffect } from 'react';
import { Search, Command } from 'lucide-react';
import { fuzzySearch } from '../utils/textUtils';

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  icon?: any;
  autoFocus?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteProps> = ({ 
  value, 
  onChange, 
  onSelect,
  options, 
  placeholder, 
  className = "",
  icon: Icon,
  autoFocus = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
     if (autoFocus && inputRef.current) {
         inputRef.current.focus();
     }
  }, [autoFocus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    onChange(inputVal);

    if (inputVal.length > 0) {
      const filtered = fuzzySearch(options, inputVal);
      setFilteredOptions(filtered);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectOption = (option: string) => {
    onChange(option);
    if (onSelect) onSelect(option);
    setIsOpen(false);
  };

  const highlightMatch = (text: string, term: string) => {
    // Função simples para destacar visualmente (opcional, pode ser expandida)
    return text; 
  };

  return (
    <div ref={wrapperRef} className={`relative group ${className}`}>
      {/* Input Field */}
      <div className="relative">
        {Icon ? (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">
                <Icon size={20} />
            </div>
        ) : (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 z-10 pointer-events-none">
                <Search size={20} />
            </div>
        )}
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full bg-white/80 backdrop-blur-md border border-slate-200 text-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold placeholder:font-normal placeholder-slate-400 shadow-sm ${Icon ? 'pl-12' : 'pl-12'}`}
        />
        
        {/* Visual Kbd shortcut hint style if needed */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
           <Command size={14} className="text-slate-300" />
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up ring-1 ring-black/5">
          <ul className="py-1 max-h-[300px] overflow-y-auto custom-scrollbar">
            {filteredOptions.map((option, idx) => (
              <li 
                key={idx}
                onClick={() => handleSelectOption(option)}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-colors border-b border-slate-100 last:border-0"
              >
                <span className="text-slate-700 font-medium group-hover:text-blue-700 text-sm">
                  {option}
                </span>
                <Search size={14} className="text-slate-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
            ))}
          </ul>
          <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-mono">Sugestões inteligentes</span>
            <span className="text-[10px] text-slate-400">Esc para fechar</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
