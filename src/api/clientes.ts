import { api } from './client';
import { Cliente } from '../types';

export async function listarClientes(): Promise<Cliente[]> {
  const { data } = await api.get<Cliente[]>('/clientes');
  return data;
}

export async function buscarCliente(id: string): Promise<Cliente> {
  const { data } = await api.get<Cliente>(`/clientes/${id}`);
  return data;
}

export async function buscarClientes(termo: string): Promise<Cliente[]> {
  const { data } = await api.get<Cliente[]>('/clientes/buscar', { params: { termo } });
  return data;
}
