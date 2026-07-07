import MockAdapter from 'axios-mock-adapter';
import type { AxiosInstance } from 'axios';
import { atividadesMock, clientesMock, oportunidadesMock, pedidosMock, produtosMock, usuarioMock } from './data';
import type { AtividadeCRM, Oportunidade, Pedido } from '../../types';

// Estado simulado em memória — reseta a cada reinício do app.
let oportunidades: Oportunidade[] = [...oportunidadesMock];
let atividades: AtividadeCRM[] = [...atividadesMock];
let pedidos: Pedido[] = [...pedidosMock];
let proximoNumeroPedido = 4822;

export function attachMockAdapter(instance: AxiosInstance) {
  const mock = new MockAdapter(instance, { delayResponse: 400 });

  mock.onPost('/auth/login').reply((config) => {
    const body = JSON.parse(config.data ?? '{}');
    if (!body.email || !body.senha) {
      return [400, { mensagem: 'Informe e-mail e senha.' }];
    }
    return [200, { token: 'mock-token-123', usuario: usuarioMock }];
  });

  mock.onGet('/clientes').reply(200, clientesMock);

  mock.onGet(/\/clientes\/[\w-]+$/).reply((config) => {
    const id = config.url!.split('/').pop();
    const cliente = clientesMock.find((c) => c.id === id);
    return cliente ? [200, cliente] : [404, { mensagem: 'Cliente não encontrado.' }];
  });

  mock.onGet(/\/clientes\/[\w-]+\/pedidos$/).reply((config) => {
    const id = config.url!.split('/')[2];
    return [200, pedidos.filter((p) => p.clienteId === id)];
  });

  mock.onGet('/produtos').reply(200, produtosMock);

  mock.onGet(/\/crm\/clientes\/[\w-]+\/timeline$/).reply((config) => {
    const id = config.url!.split('/')[3];
    const itens = atividades
      .filter((a) => a.clienteId === id)
      .sort((a, b) => (a.data < b.data ? 1 : -1));
    return [200, itens];
  });

  mock.onGet('/crm/oportunidades').reply(200, oportunidades);

  mock.onPost('/crm/oportunidades').reply((config) => {
    const body = JSON.parse(config.data ?? '{}');
    const cliente = clientesMock.find((c) => c.id === body.clienteId);
    const agora = new Date().toISOString();
    const nova: Oportunidade = {
      id: `o${Date.now()}`,
      clienteId: body.clienteId,
      clienteNome: cliente?.nome ?? 'Cliente',
      titulo: body.titulo,
      valorEstimado: Number(body.valorEstimado) || 0,
      etapa: 'novo',
      responsavel: usuarioMock.nome,
      criadoEm: agora,
      atualizadoEm: agora,
    };
    oportunidades = [nova, ...oportunidades];
    atividades = [
      {
        id: `a${Date.now()}`,
        clienteId: nova.clienteId,
        tipo: 'oportunidade',
        descricao: `Novo lead: "${nova.titulo}".`,
        data: agora,
        autor: usuarioMock.nome,
      },
      ...atividades,
    ];
    return [201, nova];
  });

  mock.onPatch(/\/crm\/oportunidades\/[\w-]+\/etapa$/).reply((config) => {
    const id = config.url!.split('/')[3];
    const { etapa } = JSON.parse(config.data ?? '{}');
    const oportunidade = oportunidades.find((o) => o.id === id);
    if (!oportunidade) return [404, { mensagem: 'Oportunidade não encontrada.' }];
    oportunidade.etapa = etapa;
    oportunidade.atualizadoEm = new Date().toISOString();
    return [200, oportunidade];
  });

  // Simula o que a procedure fecharGanha fará no backend real: fecha a
  // oportunidade e gera o pedido correspondente no ERP.
  mock.onPost(/\/crm\/oportunidades\/[\w-]+\/fechar-ganha$/).reply((config) => {
    const id = config.url!.split('/')[3];
    const oportunidade = oportunidades.find((o) => o.id === id);
    if (!oportunidade) return [404, { mensagem: 'Oportunidade não encontrada.' }];

    oportunidade.etapa = 'ganho';
    oportunidade.atualizadoEm = new Date().toISOString();

    const numero = String(proximoNumeroPedido++);
    const pedido: Pedido = {
      id: `pd${Date.now()}`,
      clienteId: oportunidade.clienteId,
      numero,
      itens: [],
      total: oportunidade.valorEstimado,
      status: 'aberto',
      criadoEm: new Date().toISOString(),
      origemOportunidadeId: oportunidade.id,
    };
    pedidos = [pedido, ...pedidos];

    atividades = [
      {
        id: `a${Date.now()}`,
        clienteId: oportunidade.clienteId,
        tipo: 'pedido',
        descricao: `Oportunidade ganha! Pedido #${numero} gerado automaticamente.`,
        data: pedido.criadoEm,
      },
      ...atividades,
    ];

    return [200, { oportunidadeId: oportunidade.id, pedidoId: pedido.id, pedidoNumero: pedido.numero }];
  });

  mock.onPost('/pedidos').reply((config) => {
    const body = JSON.parse(config.data ?? '{}');
    const itens = body.itens ?? [];
    const pedido: Pedido = {
      id: `pd${Date.now()}`,
      clienteId: body.clienteId,
      numero: String(proximoNumeroPedido++),
      itens,
      total: itens.reduce((acc: number, item: { quantidade: number; precoUnitario: number }) => acc + item.quantidade * item.precoUnitario, 0),
      status: 'aberto',
      criadoEm: new Date().toISOString(),
    };
    pedidos = [pedido, ...pedidos];
    return [201, pedido];
  });

  mock.onAny().passThrough();
}
