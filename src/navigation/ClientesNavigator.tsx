import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClientesStackParamList } from './types';
import ClientesScreen from '../screens/ClientesScreen';
import ClienteDetalheScreen from '../screens/ClienteDetalheScreen';
import NovoPedidoScreen from '../screens/NovoPedidoScreen';

const Stack = createNativeStackNavigator<ClientesStackParamList>();

export default function ClientesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="ClientesLista" component={ClientesScreen} options={{ title: 'Clientes' }} />
      <Stack.Screen name="ClienteDetalhe" component={ClienteDetalheScreen} options={{ title: 'Cliente' }} />
      <Stack.Screen name="NovoPedido" component={NovoPedidoScreen} options={{ title: 'Novo Pedido' }} />
    </Stack.Navigator>
  );
}
