import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { listarProdutos } from '../api/produtos';

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProdutosScreen() {
  const [busca, setBusca] = useState('');
  const { data: produtos = [], isLoading } = useQuery({ queryKey: ['produtos'], queryFn: listarProdutos });

  const produtosFiltrados = useMemo(() => {
    if (!busca) return produtos;
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.sku.toLowerCase().includes(busca.toLowerCase()) ||
        p.codigoFabricante.toLowerCase().includes(busca.toLowerCase()) ||
        p.descricao.toLowerCase().includes(busca.toLowerCase())
    );
  }, [produtos, busca]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 p-4">
        <TextInput
          placeholder="Buscar por nome, código, fabricante..."
          value={busca}
          onChangeText={setBusca}
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
        />
      </View>

      <FlatList
        data={produtosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
            <Text className="text-base font-semibold text-gray-900">{item.nome}</Text>
            <Text className="text-xs text-gray-500 mt-1">Cód. Fab: {item.codigoFabricante}</Text>
            <Text className="text-xs text-gray-500">SKU: {item.sku}</Text>
            <Text className="text-sm text-gray-600 mt-2">{item.descricao}</Text>
            <View className="flex-row justify-between items-center mt-3 border-t border-gray-100 pt-3">
              <Text className="text-xs text-gray-500">{item.estoque} em estoque</Text>
              <Text className="text-base font-semibold text-blue-700">{formatarMoeda(item.precoTabela)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-10">
            {busca ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
          </Text>
        }
      />
    </View>
  );
}
