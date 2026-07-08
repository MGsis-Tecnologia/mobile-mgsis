import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { buscarClientes } from '../api/clientes';
import { buscarProdutos } from '../api/produtos';
import { criarPedido } from '../api/pedidos';
import { ClientesStackParamList } from '../navigation/types';
import { PedidoItem, Produto, Cliente, CondicaoPagamento } from '../types';

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

type Etapa = 'cliente' | 'produtos' | 'pagamento';

export default function NovoPedidoScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientesStackParamList, 'NovoPedido'>>();
  const queryClient = useQueryClient();

  const [etapa, setEtapa] = useState<Etapa>('cliente');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [buscaProduto, setBuscaProduto] = useState('');
  const [itens, setItens] = useState<PedidoItem[]>([]);
  const [quantidades, setQuantidades] = useState<Record<string, string>>({});
  const [showModalPagamento, setShowModalPagamento] = useState(false);

  const { data: clientes = [], isLoading: carregandoClientes } = useQuery({
    queryKey: ['clientes-busca', buscaCliente],
    queryFn: () => buscarClientes(buscaCliente),
    enabled: etapa === 'cliente',
  });

  const { data: produtos = [], isLoading: carregandoProdutos } = useQuery({
    queryKey: ['produtos-busca', buscaProduto],
    queryFn: () => buscarProdutos(buscaProduto),
    enabled: etapa === 'produtos',
  });

  const total = useMemo(() => itens.reduce((acc, item) => acc + item.quantidade * item.precoUnitario, 0), [itens]);

  const { mutate, isPending } = useMutation({
    mutationFn: criarPedido,
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: ['timeline', clienteSelecionado?.id] });
      Alert.alert('Pedido criado', `Pedido #${pedido.numero} registrado com sucesso.`);
      navigation.goBack();
    },
    onError: () => Alert.alert('Erro', 'Não foi possível criar o pedido.'),
  });

  function selecionarCliente(cliente: Cliente) {
    setClienteSelecionado(cliente);
    setEtapa('produtos');
  }

  function adicionarItem(produto: Produto) {
    const quantidade = Number(quantidades[produto.id] ?? '1') || 1;
    setItens((atual) => {
      const existente = atual.find((i) => i.produtoId === produto.id);
      if (existente) {
        return atual.map((i) => (i.produtoId === produto.id ? { ...i, quantidade: i.quantidade + quantidade } : i));
      }
      return [...atual, { produtoId: produto.id, produtoNome: produto.nome, quantidade, precoUnitario: produto.precoTabela }];
    });
    setQuantidades((atual) => ({ ...atual, [produto.id]: '' }));
  }

  function removerItem(produtoId: string) {
    setItens((atual) => atual.filter((i) => i.produtoId !== produtoId));
  }

  function confirmarPedido(condicaoPagamento: CondicaoPagamento) {
    if (!clienteSelecionado) {
      Alert.alert('Erro', 'Nenhum cliente selecionado.');
      return;
    }
    if (itens.length === 0) {
      Alert.alert('Pedido vazio', 'Adicione ao menos um item antes de confirmar.');
      return;
    }
    mutate({ clienteId: clienteSelecionado.id, itens, condicaoPagamento });
    setShowModalPagamento(false);
  }

  if (etapa === 'cliente') {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-white border-b border-gray-200 p-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Buscar Cliente</Text>
          <TextInput
            placeholder="Nome, CNPJ ou RUC..."
            value={buscaCliente}
            onChangeText={setBuscaCliente}
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
          />
        </View>

        {carregandoClientes ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#1d4ed8" />
          </View>
        ) : (
          <FlatList
            data={clientes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => selecionarCliente(item)}
                className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
              >
                <Text className="text-base font-semibold text-gray-900">{item.nome}</Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {item.cnpjCpf} {item.ruc && `• ${item.ruc}`}
                </Text>
                <Text className="text-xs text-gray-400 mt-2">
                  Limite: {formatarMoeda(item.limiteCredito)} | Saldo devedor: {formatarMoeda(item.saldoDevedor)}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text className="text-center text-gray-400 mt-10">
                {buscaCliente ? 'Nenhum cliente encontrado.' : 'Digite para buscar clientes.'}
              </Text>
            }
          />
        )}
      </View>
    );
  }

  if (etapa === 'produtos') {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-blue-700 p-4 flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-white font-semibold">{clienteSelecionado?.nome}</Text>
            <Text className="text-blue-100 text-xs mt-1">{clienteSelecionado?.cnpjCpf}</Text>
          </View>
          <Pressable onPress={() => setEtapa('cliente')} className="bg-blue-600 rounded-lg px-3 py-1">
            <Text className="text-white text-xs font-medium">Trocar</Text>
          </Pressable>
        </View>

        <View className="bg-white border-b border-gray-200 p-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Buscar Produtos</Text>
          <TextInput
            placeholder="Código, código fabricante ou descrição..."
            value={buscaProduto}
            onChangeText={setBuscaProduto}
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
          />
        </View>

        {itens.length > 0 && (
          <View className="bg-white border-b border-gray-200 p-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">Carrinho ({itens.length} itens)</Text>
            <FlatList
              data={itens}
              keyExtractor={(item) => item.produtoId}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View className="flex-row justify-between items-center mb-2 pb-2 border-b border-gray-100">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900">{item.produtoNome}</Text>
                    <Text className="text-xs text-gray-500">
                      {item.quantidade}x • {formatarMoeda(item.precoUnitario)} un.
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm font-semibold text-gray-900 mr-3">
                      {formatarMoeda(item.quantidade * item.precoUnitario)}
                    </Text>
                    <Pressable onPress={() => removerItem(item.produtoId)}>
                      <Text className="text-red-600 text-xs font-medium">Remover</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
            <View className="flex-row justify-between mt-3 pt-2 border-t border-gray-200">
              <Text className="font-semibold text-gray-900">Total</Text>
              <Text className="font-bold text-blue-700">{formatarMoeda(total)}</Text>
            </View>
          </View>
        )}

        {carregandoProdutos ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#1d4ed8" />
          </View>
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <Text className="text-base font-semibold text-gray-900">{item.nome}</Text>
                    <Text className="text-xs text-gray-500 mt-1">Cód. Fabricante: {item.codigoFabricante}</Text>
                    <Text className="text-xs text-gray-500">SKU: {item.sku}</Text>
                  </View>
                  <Text className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {item.estoque} em estoque
                  </Text>
                </View>
                <Text className="text-sm text-gray-600 mb-3">{item.descricao}</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-blue-700">{formatarMoeda(item.precoTabela)}</Text>
                  <View className="flex-row items-center">
                    <TextInput
                      keyboardType="numeric"
                      placeholder="Qtd"
                      value={quantidades[item.id] ?? ''}
                      onChangeText={(texto) => setQuantidades((atual) => ({ ...atual, [item.id]: texto }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-16 mr-2"
                    />
                    <Pressable onPress={() => adicionarItem(item)} className="bg-blue-700 rounded-lg px-4 py-2">
                      <Text className="text-white font-medium text-sm">Adicionar</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text className="text-center text-gray-400 mt-10">
                {buscaProduto ? 'Nenhum produto encontrado.' : 'Digite para buscar produtos.'}
              </Text>
            }
          />
        )}

        <View className="bg-white border-t border-gray-200 p-4 flex-row gap-3">
          <Pressable
            onPress={() => setEtapa('cliente')}
            className="flex-1 border border-gray-300 rounded-lg py-3 items-center"
          >
            <Text className="text-gray-900 font-semibold">Voltar</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowModalPagamento(true)}
            disabled={itens.length === 0}
            className={`flex-1 rounded-lg py-3 items-center ${itens.length === 0 ? 'bg-gray-300' : 'bg-green-700'}`}
          >
            <Text className="text-white font-semibold">Confirmar Pedido</Text>
          </Pressable>
        </View>

        <Modal visible={showModalPagamento} transparent animationType="slide">
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <Text className="text-2xl font-bold text-gray-900 mb-2">Forma de Pagamento</Text>
              <Text className="text-gray-600 mb-6">Total: {formatarMoeda(total)}</Text>

              <View className="gap-3">
                <Pressable
                  onPress={() => confirmarPedido('vista')}
                  disabled={isPending}
                  className="bg-green-700 rounded-lg py-4 items-center"
                >
                  {isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-lg">À Vista</Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => confirmarPedido('prazo')}
                  disabled={isPending}
                  className="bg-blue-700 rounded-lg py-4 items-center"
                >
                  {isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-lg">A Prazo</Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => setShowModalPagamento(false)}
                  disabled={isPending}
                  className="border border-gray-300 rounded-lg py-3 items-center"
                >
                  <Text className="text-gray-900 font-semibold">Cancelar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return null;
}
