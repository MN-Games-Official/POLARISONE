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
  Shield,
  Calendar,
  Edit,
  Trash2,
} from 'lucide-react';

interface RankCenter {
  id: string;
  name: string;
  description: string | null;
  group_id: string;
  created_at: string;
  updated_at: string;
}

export default function RankCenterPage() {
  const [rankCenters, setRankCenters] = useState<RankCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchRankCenters();
  }, []);

  async function fetchRankCenters() {
    try {
      const data = await api.get<{ success: boolean; rankCenters: RankCenter[] }>(
        '/rank-centers'
      );
      setRankCenters(data.rankCenters);
    } catch {
      setError('Failed to load rank centers');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this rank center?')) return;
    setDeleting(id);
    try {
      await api.delete(`/rank-centers/${id}`);
      setRankCenters((prev) => prev.filter((rc) => rc.id !== id));
    } catch {
      setError('Failed to delete rank center');
    } finally {
      setDeleting(null);
    }
  }

  const filtered = rankCenters.filter(
    (rc) =>
      rc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rc.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Rank Center</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage rank configurations for your Roblox groups
          </p>
        </div>
        <Link href="/rank-center/new">
          <Button iconLeft={<Plus size={16} />}>New Rank Center</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      <div className="mb-6">
        <Input
          placeholder="Search rank centers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          iconLeft={<Search size={18} />}
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Shield size={48} className="mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-300">
            {searchQuery ? 'No rank centers found' : 'No rank centers yet'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchQuery
              ? 'Try a different search term'
              : 'Create your first rank center to manage group ranks'}
          </p>
          {!searchQuery && (
            <Link href="/rank-center/new" className="mt-4">
              <Button iconLeft={<Plus size={16} />}>Create Rank Center</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((rc) => (
            <Card
              key={rc.id}
              className="group relative overflow-hidden p-5 transition-all duration-200 hover:border-[#ff4b6e]/30"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'radial-gradient(ellipse at top right, rgba(255,75,110,0.04) 0%, transparent 70%)' }}
              />
              <div className="relative">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-base font-semibold text-white">
                      {rc.name}
                    </h3>
                    {rc.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                        {rc.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-2 flex items-center gap-1">
                    <Link href={`/rank-center/${rc.id}`}>
                      <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
                        <Edit size={14} />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(rc.id)}
                      disabled={deleting === rc.id}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <Badge variant="default" size="sm">
                  Group: {rc.group_id}
                </Badge>

                <div className="mt-4 flex items-center justify-between border-t border-[#2d3748] pt-3">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    {new Date(rc.updated_at).toLocaleDateString()}
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
