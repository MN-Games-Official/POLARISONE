'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { ApplicationInput } from '@/lib/validation';

export interface Application {
  id: string;
  name: string;
  description?: string;
  group_id: string;
  target_role: string;
  pass_score: number;
  primary_color: string;
  secondary_color: string;
  questions: unknown[];
  created_at: string;
  updated_at: string;
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Application[]>('/applications');
      if (mountedRef.current) setApplications(data);
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof ApiError
            ? err.message
            : 'Failed to fetch applications'
        );
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchApplications();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchApplications]);

  const createApplication = useCallback(
    async (data: ApplicationInput) => {
      const created = await api.post<Application>('/applications', data);
      if (mountedRef.current) {
        setApplications((prev) => [...prev, created]);
      }
      return created;
    },
    []
  );

  const updateApplication = useCallback(
    async (id: string, data: Partial<ApplicationInput>) => {
      const updated = await api.put<Application>(`/applications/${id}`, data);
      if (mountedRef.current) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? updated : app))
        );
      }
      return updated;
    },
    []
  );

  const deleteApplication = useCallback(async (id: string) => {
    await api.delete(`/applications/${id}`);
    if (mountedRef.current) {
      setApplications((prev) => prev.filter((app) => app.id !== id));
    }
  }, []);

  const generateForm = useCallback(
    async (id: string, params?: unknown) => {
      return api.post<unknown>(`/applications/${id}/generate`, params);
    },
    []
  );

  return {
    applications,
    loading,
    error,
    create: createApplication,
    update: updateApplication,
    delete: deleteApplication,
    generate: generateForm,
    refetch: fetchApplications,
  };
}
