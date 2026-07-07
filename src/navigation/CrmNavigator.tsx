import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CrmStackParamList } from './types';
import FunilScreen from '../screens/FunilScreen';
import NovoLeadScreen from '../screens/NovoLeadScreen';

const Stack = createNativeStackNavigator<CrmStackParamList>();

export default function CrmNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Funil" component={FunilScreen} options={{ title: 'Funil de Vendas' }} />
      <Stack.Screen name="NovoLead" component={NovoLeadScreen} options={{ title: 'Novo Lead' }} />
    </Stack.Navigator>
  );
}
