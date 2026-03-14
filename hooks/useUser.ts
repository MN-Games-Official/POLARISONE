'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { ProfileUpdateInput, ChangePasswordInput } from '@/lib/validation';

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<UserProfile>('/users/profile');
      if (mountedRef.current) setUser(data);
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof ApiError ? err.message : 'Failed to fetch user profile'
        );
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchUser();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchUser]);

  const updateProfile = useCallback(
    async (data: ProfileUpdateInput) => {
      const updated = await api.put<UserProfile>(
        '/users/profile/update',
        data
      );
      if (mountedRef.current) setUser(updated);
      return updated;
    },
    []
  );

  const changePassword = useCallback(
    async (data: ChangePasswordInput) => {
      return api.post('/users/change-password', data);
    },
    []
  );

  return {
    user,
    loading,
    error,
    updateProfile,
    changePassword,
    refetch: fetchUser,
  };
}
