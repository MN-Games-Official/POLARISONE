'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import {
  Key,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface RobloxKeyStatus {
  has_key: boolean;
  key_prefix?: string;
  is_active?: boolean;
  last_used?: string;
}

interface PolarisKey {
  id: number;
  key_prefix: string;
  name: string | null;
  is_active: boolean;
  last_used: string | null;
  created_at: string;
}

export default function ApiKeysPage() {
  const [robloxStatus, setRobloxStatus] = useState<RobloxKeyStatus | null>(null);
  const [polarisKeys, setPolarisKeys] = useState<PolarisKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [robloxData, polarisData] = await Promise.all([
          api.get<{ success: boolean } & RobloxKeyStatus>('/api-keys/roblox'),
          api.get<{ success: boolean; keys: PolarisKey[] }>('/api-keys/polaris'),
        ]);
        setRobloxStatus(robloxData);
        setPolarisKeys(polarisData.keys ?? []);
      } catch {
        setError('Failed to load API key information');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading variant="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">API Keys</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your Roblox Cloud API key and Polaris API keys
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Roblox API Key Card */}
        <Card className="group relative overflow-hidden p-6 transition-all duration-200 hover:border-[#ff4b6e]/30">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(255,75,110,0.04) 0%, transparent 70%)' }}
          />
          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Shield size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Roblox Cloud API Key</h3>
                <p className="text-sm text-gray-400">Required for group operations</p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-400">Status:</span>
              {robloxStatus?.has_key ? (
                <Badge variant="success" size="sm">
                  <CheckCircle size={12} className="mr-1" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="danger" size="sm">
                  <XCircle size={12} className="mr-1" />
                  Not Set
                </Badge>
              )}
            </div>

            {robloxStatus?.key_prefix && (
              <p className="mb-4 text-sm text-gray-500">
                Key: {robloxStatus.key_prefix}...
              </p>
            )}

            <Link href="/api-keys/roblox">
              <Button variant="outline" className="w-full" iconRight={<ArrowRight size={16} />}>
                {robloxStatus?.has_key ? 'Manage Key' : 'Set Up Key'}
              </Button>
            </Link>
          </div>
        </Card>

        {/* Polaris API Keys Card */}
        <Card className="group relative overflow-hidden p-6 transition-all duration-200 hover:border-[#ff4b6e]/30">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(255,75,110,0.04) 0%, transparent 70%)' }}
          />
          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <Sparkles size={24} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Polaris API Keys</h3>
                <p className="text-sm text-gray-400">For external integrations</p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-400">Active Keys:</span>
              <Badge variant="secondary" size="sm">
                {polarisKeys.filter((k) => k.is_active).length}
              </Badge>
            </div>

            {polarisKeys.length > 0 && (
              <div className="mb-4 space-y-2">
                {polarisKeys.slice(0, 2).map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between rounded-lg border border-[#2d3748] bg-[#0f1419] px-3 py-2"
                  >
                    <span className="text-xs text-gray-300">
                      {key.name ?? key.key_prefix}...
                    </span>
                    <Badge
                      variant={key.is_active ? 'success' : 'danger'}
                      size="sm"
                    >
                      {key.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <Link href="/api-keys/polaris">
              <Button variant="outline" className="w-full" iconRight={<ArrowRight size={16} />}>
                Manage Keys
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Usage info */}
      <Card className="mt-6 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key size={20} className="text-[#ff4b6e]" />
          <h3 className="text-lg font-semibold text-white">API Key Usage</h3>
        </div>
        <div className="rounded-lg border border-[#2d3748] bg-[#0f1419] p-4">
          <p className="text-sm text-gray-400 leading-relaxed">
            <strong className="text-gray-300">Roblox Cloud API Key</strong> is required for
            managing group memberships and ranks. You need this to enable automatic promotions
            when applicants pass their applications.
          </p>
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">
            <strong className="text-gray-300">Polaris API Keys</strong> are used for external
            integrations, such as embedding application widgets in your Roblox game or connecting
            third-party services.
          </p>
        </div>
      </Card>
    </div>
  );
}
