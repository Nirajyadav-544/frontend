
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { api, ApiError } from './api';
import type { User } from './api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

/**
 * Authentication is managed by the backend using an HttpOnly cookie.
 * Never store authentication tokens in localStorage or sessionStorage.
 */
export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const currentUser = await api<User>('/auth/me');
      setUser(currentUser);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
      } else {
        console.error('Unable to refresh authentication:', error);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const authenticatedUser = await api<User>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      setUser(authenticatedUser);
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    await api<void>('/auth/logout', {
      method: 'POST',
    });

    setUser(null);
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const context = useContext(Ctx);

  if (context === null) {
    throw new Error(
      'useAuth must be used inside an AuthProvider.',
    );
  }

  return context;
}
