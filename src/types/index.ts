export type EtapaFunil = 'novo' | 'qualificacao' | 'proposta' | 'negociacao' | 'ganho' | 'perdido';
export type CondicaoPagamento = 'vista' | 'prazo';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: string;
}

export interface Cliente {
  id: string;
  nome: string;
  cnpjCpf: string;
  ruc?: string;
  telefone?: string;
  email?: string;
  limiteCredito: number;
  saldoDevedor: number;
  status: 'ativo' | 'inadimplente' | 'bloqueado';
}

export interface Produto {
  id: string;
  nome: string;
  sku: string;
  codigoFabricante: string;
  descricao: string;
  precoTabela: number;
  estoque: number;
}

export interface PedidoItem {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
}

export interface Pedido {
  id: string;
  clienteId: string;
  numero: string;
  itens: PedidoItem[];
  total: number;
  condicaoPagamento: CondicaoPagamento;
  status: 'aberto' | 'faturado' | 'cancelado';
  criadoEm: string;
  origemOportunidadeId?: string;
}

export interface Oportunidade {
  id: string;
  clienteId: string;
  clienteNome: string;
  titulo: string;
  valorEstimado: number;
  etapa: EtapaFunil;
  responsavel: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AtividadeCRM {
  id: string;
  clienteId: string;
  tipo: 'ligacao' | 'email' | 'visita' | 'nota' | 'pedido' | 'oportunidade';
  descricao: string;
  data: string;
  autor?: string;
}

export interface FecharGanhaResponse {
  oportunidadeId: string;
  pedidoId: string;
  pedidoNumero: string;
}
