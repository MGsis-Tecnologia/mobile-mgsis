import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { buscarCliente } from '../api/clientes';
import { buscarTimelineCliente } from '../api/crm';
import { ClientesStackParamList } from '../navigation/types';
import { StatusBadge } from '../components/StatusBadge';
import { AtividadeCRM } from '../types';

const TIPO_ICON: Record<AtividadeCRM['tipo'], string> = {
  ligacao: '📞',
  email: '✉️',
  visita: '📍',
  nota: '📝',
  pedido: '📦',
  oportunidade: '🎯',
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function ClienteDetalheScreen() {
  const route = useRoute<RouteProp<ClientesStackParamList, 'ClienteDetalhe'>>();
  const navigation = useNavigation<NativeStackNavigationProp<ClientesStackParamList, 'ClienteDetalhe'>>();
  const { clienteId } = route.params;

  const { data: cliente, isLoading: carregandoCliente } = useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: () => buscarCliente(clienteId),
  });

  const { data: timeline, isLoading: carregandoTimeline } = useQuery({
    queryKey: ['timeline', clienteId],
    queryFn: () => buscarTimelineCliente(clienteId),
  });

  if (carregandoCliente || !cliente) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  const limiteDisponivel = cliente.limiteCredito - cliente.saldoDevedor;
  const semLimite = limiteDisponivel <= 0;

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      <View className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-xl font-bold text-gray-900 flex-1 pr-2">{cliente.nome}</Text>
          <StatusBadge status={cliente.status} />
        </View>
        <Text className="text-sm text-gray-500 mb-3">{cliente.cnpjCpf}</Text>

        <View className="flex-row justify-between border-t border-gray-100 pt-3">
          <View>
            <Text className="text-xs text-gray-400">Limite de crédito</Text>
            <Text className="text-base font-semibold text-gray-900">{formatarMoeda(cliente.limiteCredito)}</Text>
          </View>
          <View>
            <Text className="text-xs text-gray-400">Saldo devedor</Text>
            <Text className="text-base font-semibold text-gray-900">{formatarMoeda(cliente.saldoDevedor)}</Text>
          </View>
          <View>
            <Text className="text-xs text-gray-400">Disponível</Text>
            <Text className={`text-base font-semibold ${semLimite ? 'text-red-600' : 'text-green-600'}`}>
              {formatarMoeda(limiteDisponivel)}
            </Text>
          </View>
        </View>

        {semLimite ? (
          <View className="bg-red-50 rounded-lg px-3 py-2 mt-3">
            <Text className="text-red-700 text-sm">
              Cliente sem limite disponível — confirme a situação financeira antes de negociar.
            </Text>
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={() => navigation.navigate('NovoPedido')}
        className="bg-blue-700 rounded-lg py-3 items-center mb-6"
      >
        <Text className="text-white font-semibold">Novo Pedido</Text>
      </Pressable>

      <Text className="text-base font-semibold text-gray-900 mb-3">Linha do tempo (CRM + ERP)</Text>

      {carregandoTimeline ? (
        <ActivityIndicator color="#1d4ed8" />
      ) : (
        <View>
          {timeline?.length ? (
            timeline.map((item) => (
              <View key={item.id} className="flex-row mb-4">
                <Text className="text-lg mr-3">{TIPO_ICON[item.tipo]}</Text>
                <View className="flex-1">
                  <Text className="text-sm text-gray-900">{item.descricao}</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">{formatarData(item.data)}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-gray-400">Nenhuma atividade registrada ainda.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}
