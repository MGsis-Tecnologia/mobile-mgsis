import { Text, View } from 'react-native';
import { Cliente } from '../types';

const STATUS_MAP: Record<Cliente['status'], { label: string; bg: string; text: string }> = {
  ativo: { label: 'Ativo', bg: 'bg-green-100', text: 'text-green-700' },
  inadimplente: { label: 'Inadimplente', bg: 'bg-red-100', text: 'text-red-700' },
  bloqueado: { label: 'Bloqueado', bg: 'bg-gray-200', text: 'text-gray-700' },
};

export function StatusBadge({ status }: { status: Cliente['status'] }) {
  const config = STATUS_MAP[status];
  return (
    <View className={`px-2 py-1 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.text}`}>{config.label}</Text>
    </View>
  );
}
