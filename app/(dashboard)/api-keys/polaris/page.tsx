'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Plus, Trash2, Copy, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface PolarisKey {
  id: number;
  key_prefix: string;
  name: string | null;
  is_active: boolean;
  last_used: string | null;
  created_at: string;
}

export default function PolarisKeysPage() {
  const [keys, setKeys] = useState<PolarisKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      const data = await api.get<{ success: boolean; keys: PolarisKey[] }>('/api-keys/polaris');
      setKeys(data.keys ?? []);
    } catch {
      setError('Failed to load keys');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    setError(null);
    setNewKeyValue(null);
    try {
      const data = await api.post<{ success: boolean; key: PolarisKey; raw_key: string }>(
        '/api-keys/polaris',
        { name: newKeyName || undefined }
      );
      setKeys((prev) => [data.key, ...prev]);
      setNewKeyValue(data.raw_key);
      setNewKeyName('');
      setShowCreateForm(false);
      setSuccess('Key created! Copy it now — it won\'t be shown again.');
    } catch {
      setError('Failed to create key');
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: number) {
    if (!confirm('Are you sure you want to revoke this key?')) return;
    try {
      await api.post('/api-keys/polaris/regenerate', { key_id: id, action: 'revoke' });
      setKeys((prev) => prev.filter((k) => k.id !== id));
      setSuccess('Key revoked successfully');
    } catch {
      setError('Failed to revoke key');
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setSuccess('Key copied to clipboard');
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading variant="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/api-keys">
          <Button variant="ghost" size="sm" iconLeft={<ArrowLeft size={16} />}>
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Polaris API Keys</h1>
          <p className="text-sm text-gray-400">Generate and manage your Polaris API keys</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          iconLeft={<Plus size={16} />}
        >
          New Key
        </Button>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}
      {success && (
        <div className="mb-6">
          <Alert type="success" dismissible onDismiss={() => setSuccess(null)}>
            {success}
          </Alert>
        </div>
      )}

      {/* New key value display */}
      {newKeyValue && (
        <Card className="mb-6 border-emerald-500/30 p-6">
          <h3 className="mb-2 text-sm font-semibold text-emerald-400">
            🎉 Your New API Key
          </h3>
          <p className="mb-3 text-xs text-gray-400">
            Copy this key now. It will not be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-[#2d3748] bg-[#0f1419] px-4 py-2.5 font-mono text-sm text-emerald-300">
              {newKeyValue}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(newKeyValue)}
              iconLeft={<Copy size={14} />}
            >
              Copy
            </Button>
          </div>
        </Card>
      )}

      {/* Create form */}
      {showCreateForm && (
        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Create New Key</h3>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label="Key Name (optional)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production Game Server"
              />
            </div>
            <Button onClick={handleCreate} loading={creating} iconLeft={<Sparkles size={16} />}>
              Generate
            </Button>
            <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Keys list */}
      {keys.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Sparkles size={48} className="mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-300">No API keys yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Generate your first Polaris API key to enable external integrations
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {key.name ?? 'Unnamed Key'}
                    </span>
                    <Badge
                      variant={key.is_active ? 'success' : 'danger'}
                      size="sm"
                    >
                      {key.is_active ? 'Active' : 'Revoked'}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-mono">{key.key_prefix}...</span>
                    <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                    {key.last_used && (
                      <span>Last used {new Date(key.last_used).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {key.is_active && (
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      title="Revoke key"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
