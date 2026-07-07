import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('vendedor@mgsis.com.br');
  const [senha, setSenha] = useState('123456');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleEntrar() {
    setErro(null);
    setCarregando(true);
    try {
      await entrar({ email, senha });
    } catch {
      setErro('Não foi possível entrar. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white justify-center px-6"
    >
      <Text className="text-3xl font-bold text-blue-700 mb-1">mgsis</Text>
      <Text className="text-base text-gray-500 mb-8">ERP + CRM em um só lugar</Text>

      <Text className="text-sm text-gray-600 mb-1">E-mail</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
      />

      <Text className="text-sm text-gray-600 mb-1">Senha</Text>
      <TextInput
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
      />

      {erro ? <Text className="text-red-600 mb-2">{erro}</Text> : null}

      <Pressable onPress={handleEntrar} disabled={carregando} className="bg-blue-700 rounded-lg py-3 items-center mt-4">
        {carregando ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Entrar</Text>}
      </Pressable>

      <Text className="text-xs text-gray-400 mt-6 text-center">
        Ambiente de simulação — dados fictícios (mock local)
      </Text>
    </KeyboardAvoidingView>
  );
}
