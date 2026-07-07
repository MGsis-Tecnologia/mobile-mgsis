import { api } from './client';
import { AtividadeCRM, EtapaFunil, FecharGanhaResponse, Oportunidade } from '../types';

export async function listarOportunidades(): Promise<Oportunidade[]> {
  const { data } = await api.get<Oportunidade[]>('/crm/oportunidades');
  return data;
}

export interface NovoLeadPayload {
  clienteId: string;
  titulo: string;
  valorEstimado: number;
}

export async function criarOportunidade(payload: NovoLeadPayload): Promise<Oportunidade> {
  const { data } = await api.post<Oportunidade>('/crm/oportunidades', payload);
  return data;
}

export async function moverEtapa(oportunidadeId: string, etapa: EtapaFunil): Promise<Oportunidade> {
  const { data } = await api.patch<Oportunidade>(`/crm/oportunidades/${oportunidadeId}/etapa`, { etapa });
  return data;
}

// Fecha a oportunidade como ganha: o backend gera o pedido correspondente no ERP
// e devolve o número dele para exibição imediata ao vendedor.
export async function fecharGanha(oportunidadeId: string): Promise<FecharGanhaResponse> {
  const { data } = await api.post<FecharGanhaResponse>(`/crm/oportunidades/${oportunidadeId}/fechar-ganha`);
  return data;
}

export async function buscarTimelineCliente(clienteId: string): Promise<AtividadeCRM[]> {
  const { data } = await api.get<AtividadeCRM[]>(`/crm/clientes/${clienteId}/timeline`);
  return data;
}
