import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PedidosScreen from '../screens/PedidosScreen';
import NovoPedidoScreen from '../screens/NovoPedidoScreen';

const Stack = createNativeStackNavigator();

export default function PedidosNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Voltar',
      }}
    >
      <Stack.Screen name="PedidosLista" component={PedidosScreen} options={{ title: 'Pedidos' }} />
      <Stack.Screen name="NovoPedido" component={NovoPedidoScreen} options={{ title: 'Novo Pedido' }} />
    </Stack.Navigator>
  );
}
