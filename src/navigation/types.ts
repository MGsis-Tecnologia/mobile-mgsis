import type { NavigatorScreenParams } from '@react-navigation/native';

export type ClientesStackParamList = {
  ClientesLista: undefined;
  ClienteDetalhe: { clienteId: string };
  NovoPedido: { clienteId: string };
};

export type CrmStackParamList = {
  Funil: undefined;
  NovoLead: undefined;
};

export type TabParamList = {
  ClientesTab: NavigatorScreenParams<ClientesStackParamList>;
  Produtos: undefined;
  CrmTab: NavigatorScreenParams<CrmStackParamList>;
};

export type RootStackParamList = {
  Login: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
};
