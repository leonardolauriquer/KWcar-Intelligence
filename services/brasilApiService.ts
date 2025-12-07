import { BrasilApiCNPJ, BrasilApiFipe, BrasilApiCep, BrasilApiDdd, BrasilApiBank, BrasilApiTaxa } from "../types";

const BASE_URL = 'https://brasilapi.com.br/api';

/**
 * Busca dados de uma empresa pelo CNPJ.
 */
export const getCnpjData = async (cnpj: string): Promise<BrasilApiCNPJ> => {
  const cleanCnpj = cnpj.replace(/[^\d]/g, '');
  const response = await fetch(`${BASE_URL}/cnpj/v1/${cleanCnpj}`);
  if (!response.ok) throw new Error(`Erro CNPJ: ${response.status}`);
  return await response.json();
};

/**
 * Busca dados de preço de veículo pelo código FIPE.
 */
export const getFipeData = async (fipeCode: string): Promise<BrasilApiFipe[]> => {
  const response = await fetch(`${BASE_URL}/fipe/preco/v1/${fipeCode}`);
  if (!response.ok) throw new Error(`Erro FIPE: ${response.status}`);
  return await response.json();
};

/**
 * Busca endereço por CEP (v2 com coordenadas se disponível, ou v1).
 */
export const getCepData = async (cep: string): Promise<BrasilApiCep> => {
  const cleanCep = cep.replace(/[^\d]/g, '');
  const response = await fetch(`${BASE_URL}/cep/v1/${cleanCep}`);
  if (!response.ok) throw new Error(`Erro CEP: ${response.status}`);
  return await response.json();
};

/**
 * Busca cidades e estado por DDD.
 */
export const getDddData = async (ddd: string): Promise<BrasilApiDdd> => {
  const cleanDdd = ddd.replace(/[^\d]/g, '');
  const response = await fetch(`${BASE_URL}/ddd/v1/${cleanDdd}`);
  if (!response.ok) throw new Error(`Erro DDD: ${response.status}`);
  return await response.json();
};

/**
 * Busca lista de bancos (pode filtrar por código se passar argumento, mas aqui pegamos todos).
 */
export const getBanksData = async (): Promise<BrasilApiBank[]> => {
  const response = await fetch(`${BASE_URL}/banks/v1`);
  if (!response.ok) throw new Error(`Erro Bancos: ${response.status}`);
  return await response.json();
};

/**
 * Busca taxas financeiras (Selic, CDI, etc).
 */
export const getTaxasData = async (): Promise<BrasilApiTaxa[]> => {
  const response = await fetch(`${BASE_URL}/taxas/v1`);
  if (!response.ok) throw new Error(`Erro Taxas: ${response.status}`);
  return await response.json();
};

// --- Validators ---

export const isCnpjFormat = (text: string): boolean => {
  const clean = text.replace(/[^\d]/g, '');
  return clean.length === 14;
};

export const isFipeCodeFormat = (text: string): boolean => {
  return /^[0-9]{6}-[0-9]$/.test(text);
};

export const isCepFormat = (text: string): boolean => {
  const clean = text.replace(/[^\d]/g, '');
  return clean.length === 8;
};

export const isDddFormat = (text: string): boolean => {
  const clean = text.replace(/[^\d]/g, '');
  return clean.length === 2;
};