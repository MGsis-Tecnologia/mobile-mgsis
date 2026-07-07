import { api } from './client';
import { Pedido, PedidoItem } from '../types';

export interface NovoPedidoPayload {
  clienteId: string;
  itens: PedidoItem[];
}

export async function criarPedido(payload: NovoPedidoPayload): Promise<Pedido> {
  const { data } = await api.post<Pedido>('/pedidos', payload);
  return data;
}

export async function listarPedidosDoCliente(clienteId: string): Promise<Pedido[]> {
  const { data } = await api.get<Pedido[]>(`/clientes/${clienteId}/pedidos`);
  return data;
}
