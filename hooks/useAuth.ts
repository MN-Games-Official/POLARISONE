'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api-client';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshToken = useCallback(async () => {
    try {
      const data = await api.get<{ user: User }>('/auth/refresh-token');
      setUser(data.user);
    } catch (err) {
      setUser(null);
      // Re-throw non-401 errors so callers can handle network failures
      if (err instanceof ApiError && err.status !== 401) {
        throw err;
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get<{ user: User }>('/auth/refresh-token');
        if (mounted) setUser(data.user);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ user: User }>('/auth/login', {
      email,
      password,
    });
    setUser(data.user);
  }, []);

  const signup = useCallback(
    async (body: {
      email: string;
      username: string;
      password: string;
      full_name?: string;
    }) => {
      const data = await api.post<{ user: User }>('/auth/signup', body);
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const value: AuthContextValue = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshToken,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
