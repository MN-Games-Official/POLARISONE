'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Rank {
  id: string;
  name: string;
  rank_id: number;
  role_id: string;
}

export default function NewRankCenterPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [ranks, setRanks] = useState<Rank[]>([]);

  function addRank() {
    setRanks((prev) => [
      ...prev,
      { id: `r${Date.now()}`, name: '', rank_id: 0, role_id: '' },
    ]);
  }

  function updateRank(id: string, updates: Partial<Rank>) {
    setRanks((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }

  function removeRank(id: string) {
    setRanks((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleSave() {
    if (!name || !groupId) {
      setError('Name and Group ID are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const data = await api.post<{ success: boolean; rankCenter: { id: string } }>(
        '/rank-centers',
        {
          name,
          description,
          group_id: groupId,
          ranks,
        }
      );
      router.push(`/rank-center/${data.rankCenter.id}`);
    } catch {
      setError('Failed to save rank center');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/rank-center">
          <Button variant="ghost" size="sm" iconLeft={<ArrowLeft size={16} />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">New Rank Center</h1>
          <p className="text-sm text-gray-400">Configure rank promotions for your group</p>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Basic Information</h2>
          <div className="space-y-4">
            <Input
              label="Rank Center Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Staff Ranks"
              required
            />
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this rank center..."
              rows={3}
            />
            <Input
              label="Roblox Group ID"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              placeholder="e.g., 123456"
              required
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Ranks ({ranks.length})
            </h2>
            <Button variant="outline" size="sm" onClick={addRank} iconLeft={<Plus size={14} />}>
              Add Rank
            </Button>
          </div>

          <div className="space-y-4">
            {ranks.length === 0 && (
              <div className="rounded-lg border border-dashed border-[#2d3748] p-8 text-center">
                <p className="text-sm text-gray-500">
                  No ranks configured. Click &quot;Add Rank&quot; to get started.
                </p>
              </div>
            )}

            {ranks.map((rank, index) => (
              <div key={rank.id} className="rounded-lg border border-[#2d3748] bg-[#0f1419] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">
                    Rank {index + 1}
                  </span>
                  <button
                    onClick={() => removeRank(rank.id)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Input
                    label="Rank Name"
                    value={rank.name}
                    onChange={(e) => updateRank(rank.id, { name: e.target.value })}
                    placeholder="e.g., Moderator"
                  />
                  <Input
                    label="Rank ID"
                    type="number"
                    value={rank.rank_id.toString()}
                    onChange={(e) => updateRank(rank.id, { rank_id: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 218"
                  />
                  <Input
                    label="Role ID"
                    value={rank.role_id}
                    onChange={(e) => updateRank(rank.id, { role_id: e.target.value })}
                    placeholder="e.g., 38353811"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} iconLeft={<Save size={16} />}>
            Save Rank Center
          </Button>
        </div>
      </div>
    </div>
  );
}
