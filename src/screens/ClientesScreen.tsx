import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { listarClientes } from '../api/clientes';
import { ClientesStackParamList } from '../navigation/types';
import { StatusBadge } from '../components/StatusBadge';

export default function ClientesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientesStackParamList, 'ClientesLista'>>();
  const { data: clientes, isLoading } = useQuery({ queryKey: ['clientes'], queryFn: listarClientes });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <FlatList
      data={clientes}
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
              <Text className="text-sm text-gray-500 mt-0.5">{item.cnpjCpf}</Text>
            </View>
            <StatusBadge status={item.status} />
          </View>
        </Pressable>
      )}
      ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">Nenhum cliente encontrado.</Text>}
    />
  );
}
