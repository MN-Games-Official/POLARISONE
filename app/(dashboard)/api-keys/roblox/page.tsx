'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Save, Shield, Trash2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function RobloxKeyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [hasKey, setHasKey] = useState(false);
  const [keyPrefix, setKeyPrefix] = useState('');
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const data = await api.get<{ success: boolean; has_key: boolean; key_prefix?: string }>(
          '/api-keys/roblox'
        );
        setHasKey(data.has_key);
        setKeyPrefix(data.key_prefix ?? '');
      } catch {
        setError('Failed to load key status');
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  async function handleSave() {
    if (!newKey.trim()) {
      setError('Please enter your Roblox Cloud API key');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/api-keys/roblox', { key: newKey });
      setHasKey(true);
      setKeyPrefix(newKey.slice(0, 8));
      setNewKey('');
      setSuccess('Roblox API key saved successfully');
    } catch {
      setError('Failed to save key');
    } finally {
      setSaving(false);
    }
  }

  async function handleValidate() {
    setValidating(true);
    setValidationResult(null);
    try {
      const data = await api.post<{ success: boolean; valid: boolean; message: string }>(
        '/api-keys/roblox/validate'
      );
      setValidationResult({ valid: data.valid, message: data.message });
    } catch {
      setValidationResult({ valid: false, message: 'Validation failed' });
    } finally {
      setValidating(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to remove your Roblox API key?')) return;
    setDeleting(true);
    setError(null);
    try {
      await api.delete('/api-keys/roblox');
      setHasKey(false);
      setKeyPrefix('');
      setSuccess('Key removed successfully');
    } catch {
      setError('Failed to remove key');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading variant="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/api-keys">
          <Button variant="ghost" size="sm" iconLeft={<ArrowLeft size={16} />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Roblox Cloud API Key</h1>
          <p className="text-sm text-gray-400">Configure your Roblox Open Cloud API key</p>
        </div>
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

      <div className="space-y-6">
        {/* Current status */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={20} className="text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Current Status</h3>
          </div>

          {hasKey ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="success">
                  <CheckCircle size={12} className="mr-1" />
                  Key Configured
                </Badge>
                <span className="text-sm text-gray-400">
                  Prefix: {keyPrefix}...
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleValidate}
                  loading={validating}
                >
                  Validate Key
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  loading={deleting}
                  iconLeft={<Trash2 size={14} />}
                >
                  Remove Key
                </Button>
              </div>

              {validationResult && (
                <Alert type={validationResult.valid ? 'success' : 'error'}>
                  {validationResult.message}
                </Alert>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No Roblox API key configured. Enter your key below.
            </p>
          )}
        </Card>

        {/* Set/update key */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            {hasKey ? 'Update Key' : 'Set Up Key'}
          </h3>
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Roblox Cloud API Key"
                type={showKey ? 'text' : 'password'}
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Enter your Roblox Open Cloud API key"
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-gray-400 hover:text-white"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>
            <Button onClick={handleSave} loading={saving} iconLeft={<Save size={16} />}>
              Save Key
            </Button>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">How to Get Your API Key</h3>
          <ol className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff4b6e]/10 text-xs font-bold text-[#ff4b6e]">1</span>
              <span>Go to the <strong className="text-gray-300">Roblox Creator Dashboard</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff4b6e]/10 text-xs font-bold text-[#ff4b6e]">2</span>
              <span>Navigate to <strong className="text-gray-300">Open Cloud &gt; API Keys</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff4b6e]/10 text-xs font-bold text-[#ff4b6e]">3</span>
              <span>Create a new key with <strong className="text-gray-300">Group Membership</strong> permissions</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff4b6e]/10 text-xs font-bold text-[#ff4b6e]">4</span>
              <span>Copy and paste the key above</span>
            </li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
