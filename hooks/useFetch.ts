'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, ApiError } from '@/lib/api-client';

interface UseFetchOptions {
  enabled?: boolean;
  pollingInterval?: number;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFetch<T = unknown>(
  url: string | null,
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const { enabled = true, pollingInterval } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.get<T>(url);
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof ApiError
            ? err.message
            : 'An unexpected error occurred'
        );
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (enabled && url) {
      fetchData();
    }
  }, [enabled, url, fetchData]);

  useEffect(() => {
    if (!pollingInterval || !enabled || !url) return;

    const intervalId = setInterval(fetchData, pollingInterval);
    return () => clearInterval(intervalId);
  }, [pollingInterval, enabled, url, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
