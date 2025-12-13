
export interface WatchlistItem {
  id: string;
  type: 'VEHICLE' | 'PERSON';
  value: string; // Placa ou CPF/CNPJ
  title: string; // Nome ou Modelo
  addedAt: number;
}

const STORAGE_KEY = 'kw_watchlist';

export const getWatchlist = (): WatchlistItem[] => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

export const toggleWatchlist = (item: Omit<WatchlistItem, 'addedAt'>) => {
  const list = getWatchlist();
  const exists = list.find(i => i.id === item.id);
  
  let newList;
  if (exists) {
    newList = list.filter(i => i.id !== item.id);
  } else {
    newList = [{ ...item, addedAt: Date.now() }, ...list];
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  return !exists; // Retorna true se adicionou, false se removeu
};

export const isInWatchlist = (id: string): boolean => {
  const list = getWatchlist();
  return list.some(i => i.id === id);
};
