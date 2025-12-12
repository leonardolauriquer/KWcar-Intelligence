
export interface HistoryItem {
  id: string;
  type: 'VEHICLE' | 'PERSON' | 'COMPANY';
  title: string; // Placa ou Nome
  subtitle: string; // Modelo ou CPF/CNPJ
  timestamp: number;
  status: 'success' | 'warning' | 'error';
}

const STORAGE_KEY = 'kw_query_history';

export const getHistory = (): HistoryItem[] => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

export const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
  try {
    const history = getHistory();
    
    // Evita duplicatas consecutivas idênticas no topo
    if (history.length > 0 && history[0].title === item.title && history[0].type === item.type) {
        return;
    }

    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    
    // Mantém apenas os últimos 10 itens
    const updated = [newItem, ...history].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Erro ao salvar histórico", e);
  }
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};
