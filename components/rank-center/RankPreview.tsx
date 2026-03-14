'use client';

import React from 'react';
import clsx from 'clsx';
import { Crown, DollarSign, Globe, Tag } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface RankEntry {
  id: string;
  rank_id: number;
  gamepass_id: number;
  name: string;
  description: string;
  price: number;
  is_for_sale: boolean;
  regional_pricing: boolean;
}

interface RankPreviewProps {
  name: string;
  ranks: RankEntry[];
}

function getTierColor(rankId: number) {
  if (rankId >= 200) return { bg: 'from-amber-500/20 to-yellow-600/10', border: 'border-amber-500/40', text: 'text-amber-400', label: 'Elite' };
  if (rankId >= 100) return { bg: 'from-purple-500/20 to-indigo-600/10', border: 'border-purple-500/30', text: 'text-purple-400', label: 'Senior' };
  if (rankId >= 50) return { bg: 'from-blue-500/20 to-cyan-600/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Mid' };
  return { bg: 'from-slate-500/20 to-gray-600/10', border: 'border-slate-500/20', text: 'text-slate-400', label: 'Junior' };
}

export default function RankPreview({ name, ranks }: RankPreviewProps) {
  const sorted = [...ranks].sort((a, b) => b.rank_id - a.rank_id);

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-[#2d3748] bg-[#1a1f25] p-8 text-center">
        <Crown className="mx-auto mb-3 h-10 w-10 text-[#4a5568]" />
        <p className="text-sm text-[#a0aec0]">No ranks to preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#e2e8f0]">{name || 'Rank Center'} Preview</h3>
      <div className="space-y-3">
        {sorted.map((rank, i) => {
          const tier = getTierColor(rank.rank_id);
          return (
            <div
              key={rank.id}
              className={clsx(
                'rounded-xl border bg-gradient-to-r p-4 transition-all duration-300 hover:scale-[1.02]',
                tier.bg,
                tier.border
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg font-bold', tier.text, 'bg-black/20')}>
                    {rank.rank_id}
                  </div>
                  <div>
                    <p className="font-semibold text-[#e2e8f0]">{rank.name}</p>
                    <p className="text-xs text-[#a0aec0]">{rank.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {rank.is_for_sale && <Badge variant="success" size="sm">For Sale</Badge>}
                  {rank.regional_pricing && (
                    <Badge variant="info" size="sm">
                      <Globe className="mr-1 h-3 w-3" />
                      Regional
                    </Badge>
                  )}
                  <div className={clsx('flex items-center gap-1 text-sm font-medium', rank.price > 0 ? 'text-amber-400' : 'text-[#a0aec0]')}>
                    {rank.price > 0 ? (
                      <>
                        <DollarSign className="h-3.5 w-3.5" />
                        {rank.price.toLocaleString()} R$
                      </>
                    ) : (
                      <>
                        <Tag className="h-3.5 w-3.5" />
                        Free
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { RankPreview };
