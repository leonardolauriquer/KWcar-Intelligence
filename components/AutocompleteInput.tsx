
import React, { useState, useRef, useEffect } from 'react';
import { Search, Command, ChevronRight } from 'lucide-react';
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

  return (
    <div ref={wrapperRef} className={`relative group ${className}`}>
      {/* Input Field with Glowing Border Effect */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
        
        <div className="relative bg-slate-900 rounded-xl flex items-center border border-white/10 overflow-hidden">
            <div className="pl-4 text-blue-400">
                {Icon ? <Icon size={20} /> : <Search size={20} />}
            </div>
            
            <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => value.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            className="w-full bg-transparent text-white p-4 outline-none font-medium placeholder:text-slate-500 font-mono"
            />
            
            <div className="pr-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-slate-500 flex items-center gap-1">
                <Command size={14} /> <span className="text-[10px]">K</span>
            </div>
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
          <ul className="py-1 max-h-[300px] overflow-y-auto custom-scrollbar">
            {filteredOptions.map((option, idx) => (
              <li 
                key={idx}
                onClick={() => handleSelectOption(option)}
                className="px-4 py-3 hover:bg-blue-600/20 cursor-pointer flex items-center justify-between group transition-colors border-b border-white/5 last:border-0"
              >
                <span className="text-slate-300 font-medium group-hover:text-white text-sm font-mono flex items-center gap-2">
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-blue-400 transition-all -ml-4 group-hover:ml-0" />
                  {option}
                </span>
              </li>
            ))}
          </ul>
          <div className="bg-slate-950/50 px-3 py-1.5 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Sugestões AI</span>
            <span className="text-[10px] text-slate-500">ESC fecha</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
