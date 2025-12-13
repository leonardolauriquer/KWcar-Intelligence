
// Gerenciamento de Contexto (Smart Memory)
export const saveContext = (key: 'last_cpf' | 'last_cnpj' | 'last_plate' | 'last_process', value: string) => {
    if (!value) return;
    localStorage.setItem(`kw_context_${key}`, value);
};

export const getContext = (key: 'last_cpf' | 'last_cnpj' | 'last_plate' | 'last_process'): string => {
    return localStorage.getItem(`kw_context_${key}`) || '';
};

// Utilitário de Cópia
export const copyToClipboard = async (text: string, label: string = 'Dado') => {
    try {
        await navigator.clipboard.writeText(text);
        // Em um app real, aqui dispararia um Toast Notification global
        return true;
    } catch (err) {
        console.error('Falha ao copiar', err);
        return false;
    }
};

// Gerador de Resumo para WhatsApp
export const generateShareText = (title: string, data: Record<string, any>) => {
    let text = `*KWcar Intelligence - Relatório*\n`;
    text += `*${title}*\n\n`;
    
    Object.entries(data).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
            text += `*${key}:* ${value}\n`;
        } else if (Array.isArray(value)) {
             text += `*${key}:* ${value.length} itens\n`;
        }
    });
    
    text += `\n_Gerado em ${new Date().toLocaleString()}_`;
    return encodeURIComponent(text);
};
