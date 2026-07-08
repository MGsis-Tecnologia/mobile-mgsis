import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PedidosStackParamList } from '../navigation/types';

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function PedidosScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PedidosStackParamList, 'PedidosLista'>>();
  const [busca, setBusca] = useState('');

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8081/api/clientes/1/pedidos').catch(() => ({ json: async () => [] }));
      return response.json ? response.json() : [];
    },
  });

  const pedidosFiltrados = useMemo(() => {
    if (!busca) return pedidos;
    return pedidos.filter((p: any) =>
      p.numero.toLowerCase().includes(busca.toLowerCase()) ||
      p.clienteNome?.toLowerCase().includes(busca.toLowerCase())
    );
  }, [pedidos, busca]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 p-4">
        <TextInput
          placeholder="Buscar por número ou cliente..."
          value={busca}
          onChangeText={setBusca}
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 mb-3"
        />
        <Pressable
          onPress={() => navigation.navigate('NovoPedido')}
          className="bg-green-700 rounded-lg py-3 items-center"
        >
          <Text className="text-white font-semibold">+ Novo Pedido</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1d4ed8" />
        </View>
      ) : (
        <FlatList
          data={pedidosFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">Pedido #{item.numero}</Text>
                  <Text className="text-sm text-gray-500 mt-1">{item.clienteNome}</Text>
                </View>
                <View className="bg-blue-100 rounded-full px-3 py-1">
                  <Text className="text-blue-700 text-xs font-semibold capitalize">{item.status}</Text>
                </View>
              </View>
              <View className="flex-row justify-between items-center border-t border-gray-100 pt-2 mt-2">
                <Text className="text-sm text-gray-500">{formatarData(item.criadoEm)}</Text>
                <Text className="text-lg font-bold text-green-700">{formatarMoeda(item.total)}</Text>
              </View>
              <Text className="text-xs text-gray-400 mt-2">
                Pagamento: {item.condicaoPagamento === 'vista' ? 'À Vista' : 'A Prazo'}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-10">
              {busca ? 'Nenhum pedido encontrado.' : 'Nenhum pedido registrado ainda.'}
            </Text>
          }
        />
      )}
    </View>
  );
}
