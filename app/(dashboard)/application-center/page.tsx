'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Search,
  FileText,
  Calendar,
  Send,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';

interface Application {
  id: string;
  name: string;
  description: string | null;
  group_id: string;
  pass_score: number;
  created_at: string;
  updated_at: string;
  _count?: { submissions: number };
}

export default function ApplicationCenterPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const data = await api.get<{ success: boolean; applications: Application[] }>(
        '/applications'
      );
      setApplications(data.applications);
    } catch {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this application?')) return;
    setDeleting(id);
    try {
      await api.delete(`/applications/${id}`);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch {
      setError('Failed to delete application');
    } finally {
      setDeleting(null);
    }
  }

  const filtered = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading variant="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Application Center</h1>
          <p className="mt-1 text-sm text-gray-400">
            Create and manage your application forms
          </p>
        </div>
        <Link href="/application-center/new">
          <Button iconLeft={<Plus size={16} />}>New Application</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          iconLeft={<Search size={18} />}
        />
      </div>

      {/* Applications grid */}
      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <FileText size={48} className="mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-300">
            {searchQuery ? 'No applications found' : 'No applications yet'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchQuery
              ? 'Try a different search term'
              : 'Create your first application to get started'}
          </p>
          {!searchQuery && (
            <Link href="/application-center/new" className="mt-4">
              <Button iconLeft={<Plus size={16} />}>Create Application</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((app) => (
            <Card key={app.id} className="group relative overflow-hidden p-5 transition-all duration-200 hover:border-[#ff4b6e]/30">
              {/* Hover glow */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(ellipse at top right, rgba(255,75,110,0.04) 0%, transparent 70%)' }} />

              <div className="relative">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-base font-semibold text-white">
                      {app.name}
                    </h3>
                    {app.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                        {app.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-2 flex items-center gap-1">
                    <Link href={`/application-center/${app.id}`}>
                      <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
                        <Edit size={14} />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(app.id)}
                      disabled={deleting === app.id}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <Badge variant="default" size="sm">
                    Group: {app.group_id}
                  </Badge>
                  <Badge variant="default" size="sm">
                    Pass: {app.pass_score}%
                  </Badge>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#2d3748] pt-3">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Send size={12} />
                      {app._count?.submissions ?? 0} submissions
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    {new Date(app.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
