
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  addToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto dismiss
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto w-80 p-4 rounded-xl border backdrop-blur-md shadow-2xl flex gap-3 items-start animate-fade-in-up transition-all
              ${toast.type === 'success' ? 'bg-emerald-900/80 border-emerald-500/30 text-emerald-100' : ''}
              ${toast.type === 'error' ? 'bg-red-900/80 border-red-500/30 text-red-100' : ''}
              ${toast.type === 'warning' ? 'bg-amber-900/80 border-amber-500/30 text-amber-100' : ''}
              ${toast.type === 'info' ? 'bg-blue-900/80 border-blue-500/30 text-blue-100' : ''}
            `}
          >
            <div className="mt-0.5 shrink-0">
                {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-400" />}
                {toast.type === 'error' && <AlertCircle size={18} className="text-red-400" />}
                {toast.type === 'warning' && <AlertTriangle size={18} className="text-amber-400" />}
                {toast.type === 'info' && <Info size={18} className="text-blue-400" />}
            </div>
            
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm leading-tight">{toast.title}</h4>
                {toast.message && <p className="text-xs mt-1 opacity-90 leading-relaxed">{toast.message}</p>}
            </div>

            <button 
                onClick={() => removeToast(toast.id)}
                className="opacity-60 hover:opacity-100 transition-opacity"
            >
                <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
