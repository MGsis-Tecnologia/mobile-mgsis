import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';
import { TabParamList } from './types';
import { useAuth } from '../context/AuthContext';
import ClientesNavigator from './ClientesNavigator';
import ProdutosScreen from '../screens/ProdutosScreen';
import PedidosNavigator from './PedidosNavigator';
import CrmNavigator from './CrmNavigator';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { sair } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => (
          <Pressable onPress={() => sair()} className="mr-4 px-3 py-2 bg-red-600 rounded-lg">
            <Text className="text-white text-sm font-semibold">Sair</Text>
          </Pressable>
        ),
      }}
    >
      <Tab.Screen
        name="ClientesTab"
        component={ClientesNavigator}
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Produtos"
        component={ProdutosScreen}
        options={{
          title: 'Produtos',
          tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="PedidosTab"
        component={PedidosNavigator}
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="CrmTab"
        component={CrmNavigator}
        options={{
          title: 'CRM',
          tabBarIcon: ({ color, size }) => <Ionicons name="trending-up-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
