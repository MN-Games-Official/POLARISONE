'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import clsx from 'clsx';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Edit3,
  Trash2,
  ChevronDown,
  Calendar,
  Users,
  Target,
  ArrowUpDown,
  FileText,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ApplicationSummary {
  id: string;
  name: string;
  description: string;
  group_id: string;
  created_at: string;
  updated_at?: string;
  status: 'active' | 'draft';
  submission_count: number;
  pass_rate: number;
}

type SortField = 'name' | 'created_at' | 'updated_at' | 'submission_count';
type SortDir = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

interface ApplicationListProps {
  applications: ApplicationSummary[];
  onDelete: (id: string) => void;
  onNavigate: (id: string | null) => void;
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function SkeletonCard({ view }: { view: ViewMode }) {
  const shimmer =
    'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[#ffffff08] before:to-transparent';

  if (view === 'list') {
    return (
      <div
        className={clsx(
          'flex items-center gap-4 rounded-xl border border-[#2d3748] bg-[#1a1f25] p-4',
          shimmer,
        )}
      >
        <div className="h-5 w-40 rounded bg-[#2d3748]" />
        <div className="hidden h-4 w-60 rounded bg-[#2d3748] md:block" />
        <div className="ml-auto flex gap-2">
          <div className="h-8 w-8 rounded bg-[#2d3748]" />
          <div className="h-8 w-8 rounded bg-[#2d3748]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex flex-col gap-3 rounded-xl border border-[#2d3748] bg-[#1a1f25] p-5',
        shimmer,
      )}
    >
      <div className="h-5 w-3/4 rounded bg-[#2d3748]" />
      <div className="h-4 w-full rounded bg-[#2d3748]" />
      <div className="h-4 w-1/2 rounded bg-[#2d3748]" />
      <div className="mt-2 flex gap-3">
        <div className="h-6 w-16 rounded-full bg-[#2d3748]" />
        <div className="h-6 w-20 rounded-full bg-[#2d3748]" />
      </div>
      <div className="mt-auto flex gap-2 pt-3">
        <div className="h-8 w-8 rounded bg-[#2d3748]" />
        <div className="h-8 w-8 rounded bg-[#2d3748]" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-6">
        <div className="absolute -inset-4 animate-pulse rounded-full bg-[#ff4b6e]/10" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-[#2d3748] bg-[#1a1f25]">
          <FileText className="h-10 w-10 text-[#ff4b6e]" />
        </div>
      </div>
      <h3 className="mb-2 text-xl font-semibold text-[#e2e8f0]">
        No applications yet
      </h3>
      <p className="mb-6 max-w-sm text-sm text-[#a0aec0]">
        Build your first application form to start collecting submissions from
        applicants for your Roblox group.
      </p>
      <Button
        variant="primary"
        iconLeft={<Plus className="h-4 w-4" />}
        onClick={onCreate}
      >
        Create Application
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Delete confirmation modal                                          */
/* ------------------------------------------------------------------ */

function DeleteConfirmModal({
  open,
  name,
  onConfirm,
  onClose,
}: {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Application" size="sm">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>
        <p className="text-sm text-[#a0aec0]">
          Are you sure you want to delete{' '}
          <span className="font-medium text-[#e2e8f0]">{name}</span>? This
          action cannot be undone and all associated submissions will be lost.
        </p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Sort dropdown                                                      */
/* ------------------------------------------------------------------ */

const SORT_OPTIONS: { label: string; field: SortField }[] = [
  { label: 'Name', field: 'name' },
  { label: 'Created', field: 'created_at' },
  { label: 'Updated', field: 'updated_at' },
  { label: 'Submissions', field: 'submission_count' },
];

function SortDropdown({
  value,
  direction,
  onChange,
}: {
  value: SortField;
  direction: SortDir;
  onChange: (f: SortField, d: SortDir) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = SORT_OPTIONS.find((o) => o.field === value)!;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 rounded-lg border border-[#2d3748] bg-[#1a1f25] px-3 py-2 text-xs text-[#a0aec0] transition hover:border-[#ff4b6e]/40 hover:text-[#e2e8f0]"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        {current.label}
        <ChevronDown
          className={clsx(
            'h-3.5 w-3.5 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 min-w-[160px] animate-[fadeIn_0.15s_ease] rounded-lg border border-[#2d3748] bg-[#1a1f25] py-1 shadow-xl">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.field}
              type="button"
              onClick={() => {
                const newDir =
                  opt.field === value
                    ? direction === 'asc'
                      ? 'desc'
                      : 'asc'
                    : 'asc';
                onChange(opt.field, newDir);
                setOpen(false);
              }}
              className={clsx(
                'flex w-full items-center justify-between px-3 py-2 text-xs transition',
                opt.field === value
                  ? 'text-[#ff4b6e]'
                  : 'text-[#a0aec0] hover:bg-[#ffffff06] hover:text-[#e2e8f0]',
              )}
            >
              {opt.label}
              {opt.field === value && (
                <span className="text-[10px] uppercase tracking-wider opacity-70">
                  {direction}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Application card (grid)                                            */
/* ------------------------------------------------------------------ */

function ApplicationCard({
  app,
  index,
  onEdit,
  onDelete,
}: {
  app: ApplicationSummary;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group flex flex-col rounded-xl border border-[#2d3748] bg-[#1a1f25] p-5 transition-all duration-300 hover:border-[#ff4b6e]/30 hover:shadow-lg hover:shadow-[#ff4b6e]/5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* header */}
      <div className="mb-3 flex items-start justify-between">
        <h3 className="line-clamp-1 text-base font-semibold text-[#e2e8f0] transition-colors group-hover:text-[#ff4b6e]">
          {app.name}
        </h3>
        <Badge
          variant={app.status === 'active' ? 'success' : 'secondary'}
          size="xs"
          dot
          pulse={app.status === 'active'}
        >
          {app.status}
        </Badge>
      </div>

      {/* description */}
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#a0aec0]">
        {app.description || 'No description provided.'}
      </p>

      {/* stats */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[#a0aec0]">
          <Target className="h-3.5 w-3.5 text-[#ff4b6e]/60" />
          Group {app.group_id}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#a0aec0]">
          <Calendar className="h-3.5 w-3.5 text-[#ff4b6e]/60" />
          {new Date(app.created_at).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#a0aec0]">
          <Users className="h-3.5 w-3.5 text-[#ff4b6e]/60" />
          {app.submission_count} submissions
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#a0aec0]">
          <div
            className={clsx(
              'h-2 w-2 rounded-full',
              app.pass_rate >= 70
                ? 'bg-emerald-400'
                : app.pass_rate >= 40
                  ? 'bg-amber-400'
                  : 'bg-red-400',
            )}
          />
          {app.pass_rate}% pass rate
        </div>
      </div>

      {/* actions */}
      <div className="mt-auto flex gap-2 border-t border-[#2d3748]/60 pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a0aec0] transition hover:bg-[#ff4b6e]/10 hover:text-[#ff4b6e]"
          aria-label="Edit"
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a0aec0] transition hover:bg-red-500/10 hover:text-red-400"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Application row (list)                                             */
/* ------------------------------------------------------------------ */

function ApplicationRow({
  app,
  index,
  onEdit,
  onDelete,
}: {
  app: ApplicationSummary;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group flex flex-wrap items-center gap-3 rounded-xl border border-[#2d3748] bg-[#1a1f25] px-4 py-3 transition-all duration-300 hover:border-[#ff4b6e]/30 hover:shadow-md hover:shadow-[#ff4b6e]/5 md:flex-nowrap"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-[#e2e8f0] transition-colors group-hover:text-[#ff4b6e]">
            {app.name}
          </span>
          <Badge
            variant={app.status === 'active' ? 'success' : 'secondary'}
            size="xs"
            dot
            pulse={app.status === 'active'}
          >
            {app.status}
          </Badge>
        </div>
        <p className="mt-0.5 hidden truncate text-xs text-[#a0aec0] md:block">
          {app.description || 'No description'}
        </p>
      </div>

      <div className="hidden items-center gap-6 lg:flex">
        <span className="whitespace-nowrap text-xs text-[#a0aec0]">
          <Users className="mr-1 inline h-3.5 w-3.5 text-[#ff4b6e]/60" />
          {app.submission_count}
        </span>
        <span className="whitespace-nowrap text-xs text-[#a0aec0]">
          {app.pass_rate}% pass
        </span>
        <span className="whitespace-nowrap text-xs text-[#a0aec0]">
          {new Date(app.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a0aec0] transition hover:bg-[#ff4b6e]/10 hover:text-[#ff4b6e]"
          aria-label="Edit"
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a0aec0] transition hover:bg-red-500/10 hover:text-red-400"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ApplicationList({
  applications,
  onDelete,
  onNavigate,
}: ApplicationListProps) {
  const [view, setView] = useState<ViewMode>('grid');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deleteTarget, setDeleteTarget] = useState<ApplicationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate initial load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Filtered & sorted list
  const filtered = useMemo(() => {
    let items = [...applications];

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      items = items.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.group_id.includes(q),
      );
    }

    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'created_at':
          cmp =
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          cmp =
            new Date(a.updated_at ?? a.created_at).getTime() -
            new Date(b.updated_at ?? b.created_at).getTime();
          break;
        case 'submission_count':
          cmp = a.submission_count - b.submission_count;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return items;
  }, [applications, debouncedQuery, sortField, sortDir]);

  const handleDelete = useCallback(() => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, onDelete]);

  /* ---- loading skeletons ---- */
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-9 w-64 rounded-lg bg-[#2d3748]" />
          <div className="h-9 w-32 rounded-lg bg-[#2d3748]" />
        </div>
        <div
          className={clsx(
            view === 'grid'
              ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-3',
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} view={view} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ---- Toolbar ---- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* search */}
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a0aec0]" />
          <input
            type="text"
            placeholder="Search applications…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[#2d3748] bg-[#1a1f25] py-2 pl-9 pr-8 text-sm text-[#e2e8f0] placeholder-[#4a5568] outline-none transition focus:border-[#ff4b6e]/50 focus:ring-1 focus:ring-[#ff4b6e]/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a0aec0] hover:text-[#e2e8f0]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <SortDropdown
            value={sortField}
            direction={sortDir}
            onChange={(f, d) => {
              setSortField(f);
              setSortDir(d);
            }}
          />

          {/* view toggle */}
          <div className="flex overflow-hidden rounded-lg border border-[#2d3748]">
            {(['grid', 'list'] as ViewMode[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={clsx(
                  'flex h-9 w-9 items-center justify-center transition',
                  view === v
                    ? 'bg-[#ff4b6e]/10 text-[#ff4b6e]'
                    : 'bg-[#1a1f25] text-[#a0aec0] hover:text-[#e2e8f0]',
                )}
                aria-label={v}
              >
                {v === 'grid' ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>

          {/* create */}
          <Button
            variant="primary"
            size="sm"
            iconLeft={<Plus className="h-4 w-4" />}
            onClick={() => onNavigate(null)}
            className="relative overflow-hidden shadow-md shadow-[#ff4b6e]/20 transition-shadow hover:shadow-lg hover:shadow-[#ff4b6e]/30"
          >
            New Application
          </Button>
        </div>
      </div>

      {/* ---- Content ---- */}
      {filtered.length === 0 && !loading ? (
        applications.length === 0 ? (
          <EmptyState onCreate={() => onNavigate(null)} />
        ) : (
          <div className="py-16 text-center">
            <Search className="mx-auto mb-3 h-8 w-8 text-[#4a5568]" />
            <p className="text-sm text-[#a0aec0]">
              No applications match &ldquo;{debouncedQuery}&rdquo;
            </p>
          </div>
        )
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app, i) => (
            <ApplicationCard
              key={app.id}
              app={app}
              index={i}
              onEdit={() => onNavigate(app.id)}
              onDelete={() => setDeleteTarget(app)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((app, i) => (
            <ApplicationRow
              key={app.id}
              app={app}
              index={i}
              onEdit={() => onNavigate(app.id)}
              onDelete={() => setDeleteTarget(app)}
            />
          ))}
        </div>
      )}

      {/* ---- Delete modal ---- */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* ---- Keyframe styles ---- */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
