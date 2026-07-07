import { api } from './client';
import { Produto } from '../types';

export async function listarProdutos(): Promise<Produto[]> {
  const { data } = await api.get<Produto[]>('/produtos');
  return data;
}
