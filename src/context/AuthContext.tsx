import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginPayload, login as loginRequest } from '../api/auth';
import { TOKEN_STORAGE_KEY, setOnUnauthorized } from '../api/client';
import { Usuario } from '../types';

const USER_STORAGE_KEY = '@mgsis:usuario';

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (payload: LoginPayload) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const sair = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
    setUsuario(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => setUsuario(null));

    (async () => {
      const [[, token], [, usuarioSalvo]] = await AsyncStorage.multiGet([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
      if (token && usuarioSalvo) {
        setUsuario(JSON.parse(usuarioSalvo));
      }
      setCarregando(false);
    })();
  }, []);

  const entrar = useCallback(async (payload: LoginPayload) => {
    const { token, usuario: usuarioLogado } = await loginRequest(payload);
    await AsyncStorage.multiSet([
      [TOKEN_STORAGE_KEY, token],
      [USER_STORAGE_KEY, JSON.stringify(usuarioLogado)],
    ]);
    setUsuario(usuarioLogado);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
