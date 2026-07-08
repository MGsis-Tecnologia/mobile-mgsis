import { api } from './client';
import { Produto } from '../types';

export async function listarProdutos(): Promise<Produto[]> {
  const { data } = await api.get<Produto[]>('/produtos');
  return data;
}

export async function buscarProdutos(termo: string): Promise<Produto[]> {
  const { data } = await api.get<Produto[]>('/produtos/buscar', { params: { termo } });
  return data;
}
