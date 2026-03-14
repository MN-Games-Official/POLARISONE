'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { RankCenterInput } from '@/lib/validation';

export interface RankCenter {
  id: string;
  name: string;
  group_id: string;
  universe_id?: string;
  ranks: unknown[];
  created_at: string;
  updated_at: string;
}

export function useRankCenters() {
  const [rankCenters, setRankCenters] = useState<RankCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchRankCenters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<RankCenter[]>('/rank-centers');
      if (mountedRef.current) setRankCenters(data);
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof ApiError
            ? err.message
            : 'Failed to fetch rank centers'
        );
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchRankCenters();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchRankCenters]);

  const createRankCenter = useCallback(
    async (data: RankCenterInput) => {
      const created = await api.post<RankCenter>('/rank-centers', data);
      if (mountedRef.current) {
        setRankCenters((prev) => [...prev, created]);
      }
      return created;
    },
    []
  );

  const updateRankCenter = useCallback(
    async (id: string, data: Partial<RankCenterInput>) => {
      const updated = await api.put<RankCenter>(`/rank-centers/${id}`, data);
      if (mountedRef.current) {
        setRankCenters((prev) =>
          prev.map((rc) => (rc.id === id ? updated : rc))
        );
      }
      return updated;
    },
    []
  );

  const deleteRankCenter = useCallback(async (id: string) => {
    await api.delete(`/rank-centers/${id}`);
    if (mountedRef.current) {
      setRankCenters((prev) => prev.filter((rc) => rc.id !== id));
    }
  }, []);

  return {
    rankCenters,
    loading,
    error,
    create: createRankCenter,
    update: updateRankCenter,
    delete: deleteRankCenter,
    refetch: fetchRankCenters,
  };
}
