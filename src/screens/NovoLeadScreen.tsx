import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { listarClientes } from '../api/clientes';
import { criarOportunidade } from '../api/crm';
import { CrmStackParamList } from '../navigation/types';
import { Cliente } from '../types';

export default function NovoLeadScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CrmStackParamList, 'NovoLead'>>();
  const queryClient = useQueryClient();

  const { data: clientes, isLoading } = useQuery({ queryKey: ['clientes'], queryFn: listarClientes });
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [titulo, setTitulo] = useState('');
  const [valorEstimado, setValorEstimado] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: criarOportunidade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
      Alert.alert('Lead criado', 'A oportunidade foi adicionada ao funil.');
      navigation.goBack();
    },
    onError: () => Alert.alert('Erro', 'Não foi possível criar o lead.'),
  });

  function confirmar() {
    if (!clienteSelecionado) {
      Alert.alert('Selecione um cliente', 'Escolha o cliente para vincular ao lead.');
      return;
    }
    if (!titulo.trim()) {
      Alert.alert('Informe um título', 'Descreva brevemente a oportunidade.');
      return;
    }
    mutate({
      clienteId: clienteSelecionado.id,
      titulo: titulo.trim(),
      valorEstimado: Number(valorEstimado.replace(',', '.')) || 0,
    });
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-sm text-gray-600 mb-2">Cliente</Text>
      <View className="mb-4">
        {clientes?.map((cliente) => (
          <Pressable
            key={cliente.id}
            onPress={() => setClienteSelecionado(cliente)}
            className={`border rounded-lg px-4 py-3 mb-2 ${
              clienteSelecionado?.id === cliente.id ? 'border-blue-700 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <Text className="text-gray-900">{cliente.nome}</Text>
          </Pressable>
        ))}
      </View>

      <Text className="text-sm text-gray-600 mb-1">Título da oportunidade</Text>
      <TextInput
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Ex: Reposição trimestral"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
      />

      <Text className="text-sm text-gray-600 mb-1">Valor estimado (R$)</Text>
      <TextInput
        value={valorEstimado}
        onChangeText={setValorEstimado}
        keyboardType="numeric"
        placeholder="0,00"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
      />

      <Pressable onPress={confirmar} disabled={isPending} className="bg-blue-700 rounded-lg py-3 items-center">
        {isPending ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Criar Lead</Text>}
      </Pressable>
    </ScrollView>
  );
}
