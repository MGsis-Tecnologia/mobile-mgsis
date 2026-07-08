import { AtividadeCRM, Cliente, Oportunidade, Pedido, Produto, Usuario } from '../../types';

export const usuarioMock: Usuario = {
  id: 'u1',
  nome: 'Rogerio Costa',
  email: 'vendedor@mgsis.com.br',
  papel: 'vendedor',
};

export const clientesMock: Cliente[] = [
  { id: 'c1', nome: 'Comercial Silva Ltda', cnpjCpf: '12.345.678/0001-90', telefone: '(11) 98888-1111', email: 'contato@silva.com.br', limiteCredito: 50000, saldoDevedor: 12000, status: 'ativo' },
  { id: 'c2', nome: 'Distribuidora Norte', cnpjCpf: '23.456.789/0001-11', telefone: '(11) 97777-2222', email: 'financeiro@norte.com.br', limiteCredito: 30000, saldoDevedor: 31500, status: 'inadimplente' },
  { id: 'c3', nome: 'Mercado Bom Preço', cnpjCpf: '34.567.890/0001-22', telefone: '(11) 96666-3333', email: 'compras@bompreco.com.br', limiteCredito: 15000, saldoDevedor: 0, status: 'ativo' },
  { id: 'c4', nome: 'Auto Peças Rápida', cnpjCpf: '45.678.901/0001-33', telefone: '(11) 95555-4444', email: 'financeiro@autorapida.com.br', limiteCredito: 20000, saldoDevedor: 20000, status: 'bloqueado' },
  { id: 'c5', nome: 'Transportes Paraguai', cnpjCpf: '', ruc: '123.456.789-1', telefone: '+595 21 123-4567', email: 'compras@transportes.py', limiteCredito: 25000, saldoDevedor: 5000, status: 'ativo' },
];

export const produtosMock: Produto[] = [
  { id: 'p1', nome: 'Parafuso Sextavado 8mm', sku: 'PSX-008', codigoFabricante: 'DIN933-M8', descricao: 'Parafuso de aço carbono com rosca métrica', precoTabela: 0.35, estoque: 12000 },
  { id: 'p2', nome: 'Chapa de Aço 2mm', sku: 'CAC-002', codigoFabricante: 'ASTM-A36', descricao: 'Chapa de aço carbono laminada a quente', precoTabela: 89.9, estoque: 340 },
  { id: 'p3', nome: 'Tinta Industrial Cinza 18L', sku: 'TIC-018', codigoFabricante: 'TINP-0018', descricao: 'Tinta epóxi cinza para acabamento industrial', precoTabela: 245.0, estoque: 58 },
  { id: 'p4', nome: 'Correia Transportadora 10m', sku: 'CTR-010', codigoFabricante: 'CONTI-PRO', descricao: 'Correia de borracha com reforço de nylon', precoTabela: 1120.0, estoque: 9 },
  { id: 'p5', nome: 'Rolamento 6204', sku: 'ROL-6204', codigoFabricante: 'NSK-6204', descricao: 'Rolamento de esferas de contato profundo', precoTabela: 18.5, estoque: 430 },
];

export const oportunidadesMock: Oportunidade[] = [
  { id: 'o1', clienteId: 'c1', clienteNome: 'Comercial Silva Ltda', titulo: 'Reposição trimestral parafusos', valorEstimado: 8500, etapa: 'novo', responsavel: 'Rogerio Costa', criadoEm: '2026-06-20T10:00:00Z', atualizadoEm: '2026-06-20T10:00:00Z' },
  { id: 'o2', clienteId: 'c3', clienteNome: 'Mercado Bom Preço', titulo: 'Tinta para reforma da loja', valorEstimado: 4200, etapa: 'qualificacao', responsavel: 'Rogerio Costa', criadoEm: '2026-06-25T14:30:00Z', atualizadoEm: '2026-07-01T09:00:00Z' },
  { id: 'o3', clienteId: 'c1', clienteNome: 'Comercial Silva Ltda', titulo: 'Ampliação linha de produção', valorEstimado: 32000, etapa: 'proposta', responsavel: 'Rogerio Costa', criadoEm: '2026-06-10T08:00:00Z', atualizadoEm: '2026-07-02T16:00:00Z' },
  { id: 'o4', clienteId: 'c2', clienteNome: 'Distribuidora Norte', titulo: 'Renovação contrato anual', valorEstimado: 58000, etapa: 'negociacao', responsavel: 'Rogerio Costa', criadoEm: '2026-05-30T11:00:00Z', atualizadoEm: '2026-07-05T13:00:00Z' },
];

export const atividadesMock: AtividadeCRM[] = [
  { id: 'a1', clienteId: 'c1', tipo: 'ligacao', descricao: 'Cliente confirmou interesse em ampliar pedido mensal.', data: '2026-07-01T15:00:00Z', autor: 'Rogerio Costa' },
  { id: 'a2', clienteId: 'c1', tipo: 'pedido', descricao: 'Pedido #4821 faturado - R$ 6.320,00', data: '2026-06-15T09:00:00Z' },
  { id: 'a3', clienteId: 'c1', tipo: 'oportunidade', descricao: 'Oportunidade "Ampliação linha de produção" movida para Proposta.', data: '2026-07-02T16:00:00Z' },
  { id: 'a4', clienteId: 'c2', tipo: 'nota', descricao: 'Financeiro sinalizou atraso de 45 dias em duas faturas.', data: '2026-06-28T10:00:00Z', autor: 'Rogerio Costa' },
];

export const pedidosMock: Pedido[] = [
  { id: 'pd1', clienteId: 'c1', numero: '4821', itens: [{ produtoId: 'p1', produtoNome: 'Parafuso Sextavado 8mm', quantidade: 5000, precoUnitario: 0.32 }], total: 1600, condicaoPagamento: 'prazo', status: 'faturado', criadoEm: '2026-06-15T09:00:00Z' },
];
