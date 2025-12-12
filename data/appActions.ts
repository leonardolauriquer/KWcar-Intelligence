
export const GLOBAL_ACTIONS = [
    // Consultas
    "Consultar Placa Veicular",
    "Consultar Chassi",
    "Consultar CPF (Pessoa Física)",
    "Consultar CNPJ (Empresa)",
    "Consultar CNH (Condutor)",
    "Consultar Multas e Débitos",
    "Consultar Tabela FIPE",
    
    // Navegação
    "Ir para Dashboard",
    "Ir para Catálogo de Serviços",
    "Ir para Scanner Visual",
    "Ir para Comparativo de Veículos",
    "Ir para Configurações",
    "Ir para Utilitários (CEP/Bancos)",
    
    // Utilitários Específicos
    "Buscar CEP / Endereço",
    "Buscar Bancos e Códigos ISPB",
    "Buscar Taxas (Selic/CDI)",
    "Buscar Cidades por DDD",
    
    // Serviços Específicos (Atalhos)
    "Serviço: Antecedentes Criminais",
    "Serviço: Processos Jurídicos",
    "Serviço: Situação Eleitoral",
    "Serviço: Certidão Negativa",
    "Serviço: Rastreamento Correios"
];

export const getPathForAction = (action: string): string => {
    if (action.includes("Placa") || action.includes("Chassi") || action.includes("FIPE") || action.includes("Multas")) return "/vehicle";
    if (action.includes("CPF") || action.includes("CNPJ") || action.includes("Pessoa") || action.includes("Empresa") || action.includes("CNH")) return "/person";
    if (action.includes("Scanner")) return "/scanner";
    if (action.includes("Comparativo")) return "/compare";
    if (action.includes("Configurações")) return "/settings";
    if (action.includes("Serviço") || action.includes("Catálogo")) return "/services";
    if (action.includes("CEP") || action.includes("Bancos") || action.includes("Taxas") || action.includes("DDD") || action.includes("Utilitários")) return "/utilities";
    
    return "/";
};
