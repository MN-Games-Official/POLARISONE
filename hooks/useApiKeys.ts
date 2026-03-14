'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, ApiError } from '@/lib/api-client';

export interface RobloxKey {
  id: string;
  api_key: string;
  validated: boolean;
  created_at: string;
}

export interface PolarisKey {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  expires_at?: string;
  created_at: string;
}

export function useApiKeys() {
  const [robloxKeys, setRobloxKeys] = useState<RobloxKey[]>([]);
  const [polarisKeys, setPolarisKeys] = useState<PolarisKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [roblox, polaris] = await Promise.all([
        api.get<RobloxKey[]>('/api-keys/roblox'),
        api.get<PolarisKey[]>('/api-keys/polaris'),
      ]);
      if (mountedRef.current) {
        setRobloxKeys(roblox);
        setPolarisKeys(polaris);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof ApiError ? err.message : 'Failed to fetch API keys'
        );
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchKeys();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchKeys]);

  const saveRobloxKey = useCallback(
    async (data: { api_key: string; validate?: boolean }) => {
      const saved = await api.post<RobloxKey>('/api-keys/roblox', data);
      if (mountedRef.current) {
        setRobloxKeys((prev) => [...prev, saved]);
      }
      return saved;
    },
    []
  );

  const validateRobloxKey = useCallback(async () => {
    return api.post<{ valid: boolean }>('/api-keys/roblox/validate');
  }, []);

  const generatePolarisKey = useCallback(
    async (data: { name: string; scopes: string[]; expires_in?: string }) => {
      const generated = await api.post<PolarisKey>('/api-keys/polaris', data);
      if (mountedRef.current) {
        setPolarisKeys((prev) => [...prev, generated]);
      }
      return generated;
    },
    []
  );

  const deleteKey = useCallback(
    async (type: 'roblox' | 'polaris', id?: string) => {
      const endpoint = id
        ? `/api-keys/${type}/${id}`
        : `/api-keys/${type}`;
      await api.delete(endpoint);
      if (mountedRef.current) {
        if (type === 'roblox') {
          setRobloxKeys((prev) =>
            id ? prev.filter((k) => k.id !== id) : []
          );
        } else {
          setPolarisKeys((prev) =>
            id ? prev.filter((k) => k.id !== id) : []
          );
        }
      }
    },
    []
  );

  return {
    robloxKeys,
    polarisKeys,
    loading,
    error,
    saveRobloxKey,
    validateRobloxKey,
    generatePolarisKey,
    deleteKey,
    refetch: fetchKeys,
  };
}
