import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { listarProdutos } from '../api/produtos';
import { criarPedido } from '../api/pedidos';
import { ClientesStackParamList } from '../navigation/types';
import { PedidoItem, Produto } from '../types';

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function NovoPedidoScreen() {
  const route = useRoute<RouteProp<ClientesStackParamList, 'NovoPedido'>>();
  const navigation = useNavigation<NativeStackNavigationProp<ClientesStackParamList, 'NovoPedido'>>();
  const { clienteId } = route.params;
  const queryClient = useQueryClient();

  const { data: produtos, isLoading } = useQuery({ queryKey: ['produtos'], queryFn: listarProdutos });
  const [itens, setItens] = useState<PedidoItem[]>([]);
  const [quantidades, setQuantidades] = useState<Record<string, string>>({});

  const total = useMemo(() => itens.reduce((acc, item) => acc + item.quantidade * item.precoUnitario, 0), [itens]);

  const { mutate, isPending } = useMutation({
    mutationFn: criarPedido,
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: ['timeline', clienteId] });
      Alert.alert('Pedido criado', `Pedido #${pedido.numero} registrado com sucesso.`);
      navigation.goBack();
    },
    onError: () => Alert.alert('Erro', 'Não foi possível criar o pedido.'),
  });

  function adicionarItem(produto: Produto) {
    const quantidade = Number(quantidades[produto.id] ?? '1') || 1;
    setItens((atual) => {
      const existente = atual.find((i) => i.produtoId === produto.id);
      if (existente) {
        return atual.map((i) => (i.produtoId === produto.id ? { ...i, quantidade: i.quantidade + quantidade } : i));
      }
      return [...atual, { produtoId: produto.id, produtoNome: produto.nome, quantidade, precoUnitario: produto.precoTabela }];
    });
  }

  function removerItem(produtoId: string) {
    setItens((atual) => atual.filter((i) => i.produtoId !== produtoId));
  }

  function confirmarPedido() {
    if (itens.length === 0) {
      Alert.alert('Pedido vazio', 'Adicione ao menos um item antes de confirmar.');
      return;
    }
    mutate({ clienteId, itens });
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {itens.length > 0 ? (
        <View className="bg-white border-b border-gray-200 p-4">
          <Text className="text-sm font-semibold text-gray-900 mb-2">Itens do pedido</Text>
          {itens.map((item) => (
            <View key={item.produtoId} className="flex-row justify-between items-center mb-1">
              <Text className="text-sm text-gray-700 flex-1 pr-2">
                {item.quantidade}x {item.produtoNome}
              </Text>
              <Text className="text-sm text-gray-900 mr-3">{formatarMoeda(item.quantidade * item.precoUnitario)}</Text>
              <Pressable onPress={() => removerItem(item.produtoId)}>
                <Text className="text-red-600 text-sm">Remover</Text>
              </Pressable>
            </View>
          ))}
          <View className="flex-row justify-between mt-2 border-t border-gray-100 pt-2">
            <Text className="font-semibold text-gray-900">Total</Text>
            <Text className="font-semibold text-blue-700">{formatarMoeda(total)}</Text>
          </View>
        </View>
      ) : null}

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
            <Text className="text-base font-semibold text-gray-900">{item.nome}</Text>
            <Text className="text-sm text-gray-500 mb-2">
              {formatarMoeda(item.precoTabela)} · {item.estoque} em estoque
            </Text>
            <View className="flex-row items-center">
              <TextInput
                keyboardType="numeric"
                placeholder="Qtd"
                value={quantidades[item.id] ?? ''}
                onChangeText={(texto) => setQuantidades((atual) => ({ ...atual, [item.id]: texto }))}
                className="border border-gray-300 rounded-lg px-3 py-2 w-20 mr-3"
              />
              <Pressable onPress={() => adicionarItem(item)} className="bg-blue-700 rounded-lg px-4 py-2">
                <Text className="text-white font-medium">Adicionar</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <Pressable onPress={confirmarPedido} disabled={isPending} className="bg-green-700 mx-4 mb-6 rounded-lg py-3 items-center">
        {isPending ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Confirmar Pedido</Text>}
      </Pressable>
    </View>
  );
}
