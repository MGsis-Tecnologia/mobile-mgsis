import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOKEN_STORAGE_KEY = '@mgsis:token';

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.exemplo.com.br';
const usarMock = (process.env.EXPO_PUBLIC_USE_MOCK ?? 'true') !== 'false';

export const api = axios.create({ baseURL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

// Backend real ainda não está disponível: enquanto EXPO_PUBLIC_USE_MOCK !== "false",
// as chamadas são interceptadas e respondidas com dados simulados (ver ./mock).
if (usarMock) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('./mock/mockAdapter').attachMockAdapter(api);
}
