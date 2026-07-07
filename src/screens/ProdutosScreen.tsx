import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { listarProdutos } from '../api/produtos';

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProdutosScreen() {
  const { data: produtos, isLoading } = useQuery({ queryKey: ['produtos'], queryFn: listarProdutos });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <FlatList
      data={produtos}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3 flex-row justify-between items-center">
          <View className="flex-1 pr-2">
            <Text className="text-base font-semibold text-gray-900">{item.nome}</Text>
            <Text className="text-sm text-gray-500 mt-0.5">SKU {item.sku} · {item.estoque} em estoque</Text>
          </View>
          <Text className="text-base font-semibold text-blue-700">{formatarMoeda(item.precoTabela)}</Text>
        </View>
      )}
      ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">Nenhum produto cadastrado.</Text>}
    />
  );
}
