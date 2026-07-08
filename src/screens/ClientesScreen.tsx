import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { listarClientes } from '../api/clientes';
import { ClientesStackParamList } from '../navigation/types';
import { StatusBadge } from '../components/StatusBadge';

export default function ClientesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientesStackParamList, 'ClientesLista'>>();
  const [busca, setBusca] = useState('');
  const { data: clientes = [], isLoading } = useQuery({ queryKey: ['clientes'], queryFn: listarClientes });

  const clientesFiltrados = useMemo(() => {
    if (!busca) return clientes;
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.cnpjCpf.includes(busca) ||
        c.ruc?.includes(busca)
    );
  }, [clientes, busca]);

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
          placeholder="Buscar por nome, CNPJ ou RUC..."
          value={busca}
          onChangeText={setBusca}
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
        />
      </View>

      <FlatList
        data={clientesFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('ClienteDetalhe', { clienteId: item.id })}
            className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-2">
                <Text className="text-base font-semibold text-gray-900">{item.nome}</Text>
                <Text className="text-sm text-gray-500 mt-0.5">{item.cnpjCpf || item.ruc}</Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-10">
            {busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente registrado.'}
          </Text>
        }
      />
    </View>
  );
}
