'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import clsx from 'clsx';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Crown,
  Users,
  Globe,
  Calendar,
  ChevronRight,
  AlertTriangle,
  X,
  LayoutGrid,
  List,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface RankCenterSummary {
  id: string;
  name: string;
  group_id: number;
  universe_id: number;
  rank_count: number;
  created_at: string;
}

type SortField = 'name' | 'rank_count' | 'created_at';
type SortDir = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export interface RankListProps {
  rankCenters: RankCenterSummary[];
  loading?: boolean;
  onDelete: (id: string) => void | Promise<void>;
  onNavigate: (id: string) => void;
  onCreate?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Skeleton Card                                                      */
/* ------------------------------------------------------------------ */

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-xl border border-[#2d3748] bg-[#1a1f25] p-5',
        'animate-pulse',
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#2d3748]/40 to-transparent animate-[shimmer_1.5s_infinite]" />

      <div className="flex items-start justify-between mb-4">
        <div className="h-6 w-40 rounded-md bg-[#2d3748]" />
        <div className="h-5 w-16 rounded-full bg-[#2d3748]" />
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-[#2d3748]" />
          <div className="h-4 w-28 rounded bg-[#2d3748]" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-[#2d3748]" />
          <div className="h-4 w-32 rounded bg-[#2d3748]" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-[#2d3748]" />
          <div className="h-4 w-24 rounded bg-[#2d3748]" />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-[#2d3748]">
        <div className="h-8 w-20 rounded-lg bg-[#2d3748]" />
        <div className="h-8 w-20 rounded-lg bg-[#2d3748]" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton List Row                                                  */
/* ------------------------------------------------------------------ */

function SkeletonRow({ index }: { index: number }) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-lg border border-[#2d3748] bg-[#1a1f25] px-5 py-4',
        'animate-pulse flex items-center gap-6',
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#2d3748]/40 to-transparent animate-[shimmer_1.5s_infinite]" />
      <div className="h-5 w-44 rounded bg-[#2d3748]" />
      <div className="h-4 w-24 rounded bg-[#2d3748]" />
      <div className="h-4 w-24 rounded bg-[#2d3748]" />
      <div className="h-4 w-16 rounded bg-[#2d3748]" />
      <div className="ml-auto flex gap-2">
        <div className="h-8 w-8 rounded-lg bg-[#2d3748]" />
        <div className="h-8 w-8 rounded-lg bg-[#2d3748]" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Delete Confirmation Modal                                          */
/* ------------------------------------------------------------------ */

function DeleteModal({
  name,
  onConfirm,
  onCancel,
  deleting,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
        onClick={onCancel}
      />

      <div
        className={clsx(
          'relative z-10 w-full max-w-md rounded-2xl border border-[#2d3748] bg-[#1a1f25] p-6',
          'shadow-2xl shadow-black/40',
          'animate-[scaleIn_200ms_ease-out]',
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#e2e8f0]">Delete Rank Center</h3>
        </div>

        <p className="text-[#a0aec0] text-sm leading-relaxed mb-6">
          Are you sure you want to delete{' '}
          <span className="font-medium text-[#e2e8f0]">&ldquo;{name}&rdquo;</span>? This action
          cannot be undone and all associated ranks will be permanently removed.
        </p>

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} loading={deleting}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyState({ filtered, onCreate }: { filtered: boolean; onCreate?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className={clsx(
          'flex items-center justify-center w-20 h-20 rounded-2xl mb-6',
          'bg-gradient-to-br from-[#ff4b6e]/10 to-[#ff4b6e]/5',
          'border border-[#ff4b6e]/20',
        )}
      >
        <Crown className="w-9 h-9 text-[#ff4b6e]/60" />
      </div>

      <h3 className="text-xl font-semibold text-[#e2e8f0] mb-2">
        {filtered ? 'No matching rank centers' : 'No rank centers yet'}
      </h3>

      <p className="text-[#a0aec0] text-sm max-w-sm mb-8 leading-relaxed">
        {filtered
          ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
          : 'Create your first rank center to start managing ranks for your Roblox group.'}
      </p>

      {!filtered && onCreate && (
        <Button
          variant="primary"
          size="md"
          iconLeft={<Plus className="w-4 h-4" />}
          onClick={onCreate}
        >
          Create Rank Center
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Rank Center Card (Grid View)                                       */
/* ------------------------------------------------------------------ */

function RankCenterCard({
  center,
  index,
  onEdit,
  onDelete,
  onNavigate,
}: {
  center: RankCenterSummary;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 70);
    return () => clearTimeout(timer);
  }, [index]);

  const formattedDate = new Date(center.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={clsx(
        'group relative rounded-xl border border-[#2d3748] bg-[#1a1f25] p-5',
        'transition-all duration-300 ease-out',
        'hover:border-[#ff4b6e]/40 hover:shadow-lg hover:shadow-[#ff4b6e]/5',
        'hover:-translate-y-0.5',
        'cursor-pointer',
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-3',
      )}
      style={{ transitionDelay: visible ? '0ms' : `${index * 70}ms` }}
      onClick={onNavigate}
    >
      {/* top accent line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#ff4b6e]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between mb-4">
        <h3 className="text-base font-semibold text-[#e2e8f0] truncate pr-3 group-hover:text-[#ff4b6e] transition-colors duration-200">
          {center.name}
        </h3>
        <Badge variant="primary" size="sm" dot>
          {center.rank_count} {center.rank_count === 1 ? 'rank' : 'ranks'}
        </Badge>
      </div>

      <div className="space-y-2.5 mb-5">
        <div className="flex items-center gap-2 text-sm text-[#a0aec0]">
          <Users className="w-3.5 h-3.5 text-[#718096] shrink-0" />
          <span className="truncate">
            Group: <span className="text-[#cbd5e0] font-medium">{center.group_id}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#a0aec0]">
          <Globe className="w-3.5 h-3.5 text-[#718096] shrink-0" />
          <span className="truncate">
            Universe: <span className="text-[#cbd5e0] font-medium">{center.universe_id}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#a0aec0]">
          <Calendar className="w-3.5 h-3.5 text-[#718096] shrink-0" />
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-[#2d3748] group-hover:border-[#2d3748]/80">
        <Button
          variant="ghost"
          size="xs"
          iconLeft={<Edit3 className="w-3.5 h-3.5" />}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="xs"
          iconLeft={<Trash2 className="w-3.5 h-3.5" />}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          Delete
        </Button>
        <ChevronRight className="w-4 h-4 text-[#718096] ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Rank Center Row (List View)                                        */
/* ------------------------------------------------------------------ */

function RankCenterRow({
  center,
  index,
  onEdit,
  onDelete,
  onNavigate,
}: {
  center: RankCenterSummary;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  const formattedDate = new Date(center.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={clsx(
        'group flex items-center gap-4 lg:gap-6 rounded-lg border border-[#2d3748] bg-[#1a1f25] px-5 py-3.5',
        'transition-all duration-300 ease-out cursor-pointer',
        'hover:border-[#ff4b6e]/40 hover:shadow-md hover:shadow-[#ff4b6e]/5',
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3',
      )}
      onClick={onNavigate}
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#ff4b6e]/10 border border-[#ff4b6e]/20 shrink-0">
        <Crown className="w-4 h-4 text-[#ff4b6e]" />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-semibold text-[#e2e8f0] truncate group-hover:text-[#ff4b6e] transition-colors">
          {center.name}
        </h4>
        <p className="text-xs text-[#718096] mt-0.5">
          Group {center.group_id} &middot; Universe {center.universe_id}
        </p>
      </div>

      <Badge variant="secondary" size="xs">
        {center.rank_count} ranks
      </Badge>

      <span className="hidden md:block text-xs text-[#718096] whitespace-nowrap">{formattedDate}</span>

      <div className="flex items-center gap-1.5 ml-auto shrink-0">
        <button
          className="p-1.5 rounded-md text-[#718096] hover:text-[#e2e8f0] hover:bg-[#2d3748] transition-colors"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          title="Edit"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          className="p-1.5 rounded-md text-[#718096] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <ChevronRight className="w-4 h-4 text-[#718096] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function RankList({
  rankCenters,
  loading = false,
  onDelete,
  onNavigate,
  onCreate,
}: RankListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deleteTarget, setDeleteTarget] = useState<RankCenterSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let result = [...rankCenters];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          String(c.group_id).includes(q) ||
          String(c.universe_id).includes(q),
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'rank_count') cmp = a.rank_count - b.rank_count;
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [rankCenters, searchQuery, sortField, sortDir]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, onDelete]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = sortDir === 'asc' ? SortAsc : SortDesc;

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded-lg bg-[#2d3748] animate-pulse" />
          <div className="h-9 w-36 rounded-lg bg-[#2d3748] animate-pulse" />
        </div>
        <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) =>
            viewMode === 'grid' ? <SkeletonCard key={i} index={i} /> : <SkeletonRow key={i} index={i} />,
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---- Toolbar ---- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* search */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096] pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rank centers..."
            className={clsx(
              'w-full pl-9 pr-9 py-2 rounded-lg text-sm',
              'bg-[#0f1419] border border-[#2d3748] text-[#e2e8f0] placeholder-[#718096]',
              'focus:outline-none focus:border-[#ff4b6e] focus:ring-1 focus:ring-[#ff4b6e]/30',
              'transition-colors duration-200',
            )}
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#e2e8f0] transition-colors"
              onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* sort buttons */}
        <div className="flex items-center gap-2">
          {(['name', 'rank_count', 'created_at'] as SortField[]).map((field) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                sortField === field
                  ? 'bg-[#ff4b6e]/10 text-[#ff4b6e] border border-[#ff4b6e]/20'
                  : 'text-[#718096] hover:text-[#a0aec0] hover:bg-[#1a1f25] border border-transparent',
              )}
            >
              {field === 'name' && 'Name'}
              {field === 'rank_count' && 'Ranks'}
              {field === 'created_at' && 'Date'}
              {sortField === field && <SortIcon className="w-3 h-3" />}
            </button>
          ))}
        </div>

        {/* view toggle + create */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <div className="flex items-center rounded-lg border border-[#2d3748] overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(
                'p-1.5 transition-colors',
                viewMode === 'grid'
                  ? 'bg-[#ff4b6e]/10 text-[#ff4b6e]'
                  : 'text-[#718096] hover:text-[#a0aec0]',
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'p-1.5 transition-colors',
                viewMode === 'list'
                  ? 'bg-[#ff4b6e]/10 text-[#ff4b6e]'
                  : 'text-[#718096] hover:text-[#a0aec0]',
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {onCreate && (
            <Button
              variant="primary"
              size="sm"
              iconLeft={<Plus className="w-4 h-4" />}
              onClick={onCreate}
            >
              New Rank Center
            </Button>
          )}
        </div>
      </div>

      {/* ---- Results count ---- */}
      {rankCenters.length > 0 && (
        <p className="text-xs text-[#718096]">
          Showing {filtered.length} of {rankCenters.length} rank center{rankCenters.length !== 1 ? 's' : ''}
          {searchQuery && (
            <span>
              {' '}matching &ldquo;<span className="text-[#a0aec0]">{searchQuery}</span>&rdquo;
            </span>
          )}
        </p>
      )}

      {/* ---- Content ---- */}
      {filtered.length === 0 ? (
        <EmptyState filtered={searchQuery.length > 0} onCreate={onCreate} />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((center, i) => (
            <RankCenterCard
              key={center.id}
              center={center}
              index={i}
              onEdit={() => onNavigate(center.id)}
              onDelete={() => setDeleteTarget(center)}
              onNavigate={() => onNavigate(center.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((center, i) => (
            <RankCenterRow
              key={center.id}
              center={center}
              index={i}
              onEdit={() => onNavigate(center.id)}
              onDelete={() => setDeleteTarget(center)}
              onNavigate={() => onNavigate(center.id)}
            />
          ))}
        </div>
      )}

      {/* ---- Delete Modal ---- */}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
