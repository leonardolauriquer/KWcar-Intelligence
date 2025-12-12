
/**
 * Calcula a distância de Levenshtein entre duas strings.
 * Retorna o número de edições (inserções, remoções, substituições) necessárias para transformar a em b.
 */
const levenshteinDistance = (a: string, b: string): number => {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          Math.min(
            matrix[i][j - 1] + 1, // inserção
            matrix[i - 1][j] + 1 // remoção
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Normaliza string removendo acentos e caixa alta.
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

/**
 * Filtra e ordena uma lista de opções baseada na similaridade com o termo de busca.
 * Prioriza:
 * 1. StartsWith (Começa com)
 * 2. Includes (Contém)
 * 3. Fuzzy (Palavras parecidas/erros de digitação)
 */
export const fuzzySearch = (options: string[], term: string, limit = 6): string[] => {
  const normalizedTerm = normalizeText(term);
  if (!normalizedTerm) return [];

  const scoredOptions = options.map(option => {
    const normalizedOption = normalizeText(option);
    
    // Score base (quanto menor melhor)
    let score = 100;

    // Regra 1: Match Exato ou Começa com (Alta prioridade)
    if (normalizedOption.startsWith(normalizedTerm)) {
      score = 0; 
    } 
    // Regra 2: Contém a palavra (Média prioridade)
    else if (normalizedOption.includes(normalizedTerm)) {
      score = 10 + normalizedOption.indexOf(normalizedTerm); // Penaliza se estiver muito no final
    } 
    // Regra 3: Fuzzy / Levenshtein (Baixa prioridade, para typos)
    else {
      const distance = levenshteinDistance(normalizedTerm, normalizedOption);
      // Só aceita se a distância for pequena relativa ao tamanho da palavra (evita matches absurdos)
      if (distance <= 3 && distance < normalizedTerm.length) {
        score = 50 + distance;
      } else {
        score = 1000; // Descarte
      }
    }

    return { option, score };
  });

  return scoredOptions
    .filter(item => item.score < 1000)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(item => item.option);
};
