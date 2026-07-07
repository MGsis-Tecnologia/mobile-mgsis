import { useMemo } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fecharGanha, listarOportunidades, moverEtapa } from '../api/crm';
import { CrmStackParamList } from '../navigation/types';
import { EtapaFunil, Oportunidade } from '../types';

const ETAPAS: { chave: EtapaFunil; titulo: string }[] = [
  { chave: 'novo', titulo: 'Novo' },
  { chave: 'qualificacao', titulo: 'Qualificação' },
  { chave: 'proposta', titulo: 'Proposta' },
  { chave: 'negociacao', titulo: 'Negociação' },
  { chave: 'ganho', titulo: 'Ganho' },
  { chave: 'perdido', titulo: 'Perdido' },
];

const PROXIMA_ETAPA: Partial<Record<EtapaFunil, EtapaFunil>> = {
  novo: 'qualificacao',
  qualificacao: 'proposta',
  proposta: 'negociacao',
  negociacao: 'ganho',
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function FunilScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CrmStackParamList, 'Funil'>>();
  const queryClient = useQueryClient();

  const { data: oportunidades, isLoading } = useQuery({ queryKey: ['oportunidades'], queryFn: listarOportunidades });

  const porEtapa = useMemo(() => {
    const mapa: Record<EtapaFunil, Oportunidade[]> = {
      novo: [],
      qualificacao: [],
      proposta: [],
      negociacao: [],
      ganho: [],
      perdido: [],
    };
    oportunidades?.forEach((o) => mapa[o.etapa].push(o));
    return mapa;
  }, [oportunidades]);

  const moverMutation = useMutation({
    mutationFn: ({ id, etapa }: { id: string; etapa: EtapaFunil }) => moverEtapa(id, etapa),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oportunidades'] }),
    onError: () => Alert.alert('Erro', 'Não foi possível mover a oportunidade.'),
  });

  const fecharGanhaMutation = useMutation({
    mutationFn: fecharGanha,
    onSuccess: (resultado, oportunidadeId) => {
      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
      const oportunidade = oportunidades?.find((o) => o.id === oportunidadeId);
      if (oportunidade) {
        queryClient.invalidateQueries({ queryKey: ['timeline', oportunidade.clienteId] });
      }
      Alert.alert('Negócio fechado!', `Pedido #${resultado.pedidoNumero} gerado automaticamente no ERP.`);
    },
    onError: () => Alert.alert('Erro', 'Não foi possível fechar a oportunidade como ganha.'),
  });

  function avancar(oportunidade: Oportunidade) {
    const proxima = PROXIMA_ETAPA[oportunidade.etapa];
    if (!proxima) return;
    if (proxima === 'ganho') {
      Alert.alert('Fechar como ganho?', `Isso vai gerar um pedido no ERP para ${oportunidade.clienteNome}.`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => fecharGanhaMutation.mutate(oportunidade.id) },
      ]);
      return;
    }
    moverMutation.mutate({ id: oportunidade.id, etapa: proxima });
  }

  function perder(oportunidade: Oportunidade) {
    moverMutation.mutate({ id: oportunidade.id, etapa: 'perdido' });
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
      <Pressable onPress={() => navigation.navigate('NovoLead')} className="bg-blue-700 rounded-lg py-3 items-center mx-4 mt-4">
        <Text className="text-white font-semibold">+ Novo Lead</Text>
      </Pressable>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {ETAPAS.map((etapa) => {
          const itens = porEtapa[etapa.chave];
          if (etapa.chave === 'perdido' && itens.length === 0) return null;
          return (
            <View key={etapa.chave} className="mb-5">
              <Text className="text-sm font-semibold text-gray-500 uppercase mb-2">
                {etapa.titulo} ({itens.length})
              </Text>
              {itens.length === 0 ? (
                <Text className="text-gray-400 text-sm mb-2">Nenhuma oportunidade aqui.</Text>
              ) : (
                itens.map((oportunidade) => (
                  <View key={oportunidade.id} className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
                    <Text className="text-base font-semibold text-gray-900">{oportunidade.titulo}</Text>
                    <Text className="text-sm text-gray-500 mt-0.5">{oportunidade.clienteNome}</Text>
                    <Text className="text-sm text-blue-700 font-medium mt-1">{formatarMoeda(oportunidade.valorEstimado)}</Text>

                    {PROXIMA_ETAPA[oportunidade.etapa] ? (
                      <View className="flex-row mt-3">
                        <Pressable onPress={() => avancar(oportunidade)} className="bg-blue-50 rounded-lg px-3 py-2 mr-2">
                          <Text className="text-blue-700 text-sm font-medium">
                            {PROXIMA_ETAPA[oportunidade.etapa] === 'ganho' ? 'Fechar como Ganho' : 'Avançar etapa'}
                          </Text>
                        </Pressable>
                        <Pressable onPress={() => perder(oportunidade)} className="bg-red-50 rounded-lg px-3 py-2">
                          <Text className="text-red-700 text-sm font-medium">Perder</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
