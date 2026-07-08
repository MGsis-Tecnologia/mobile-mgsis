import type { NavigatorScreenParams } from '@react-navigation/native';

export type ClientesStackParamList = {
  ClientesLista: undefined;
  ClienteDetalhe: { clienteId: string };
  NovoPedido: undefined;
};

export type CrmStackParamList = {
  Funil: undefined;
  NovoLead: undefined;
};

export type PedidosStackParamList = {
  PedidosLista: undefined;
  NovoPedido: undefined;
};

export type TabParamList = {
  ClientesTab: NavigatorScreenParams<ClientesStackParamList>;
  Produtos: undefined;
  PedidosTab: NavigatorScreenParams<PedidosStackParamList>;
  CrmTab: NavigatorScreenParams<CrmStackParamList>;
};

export type RootStackParamList = {
  Login: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
};
