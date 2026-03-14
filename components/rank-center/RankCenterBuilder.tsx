'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import clsx from 'clsx';
import {
  Save,
  Plus,
  Trash2,
  Edit3,
  ChevronUp,
  ChevronDown,
  Crown,
  AlertTriangle,
  GripVertical,
  DollarSign,
  Tag,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import RanksEditor from './RanksEditor';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface RankEntry {
  id: string;
  rank_id: number;
  gamepass_id: number;
  name: string;
  description: string;
  price: number;
  is_for_sale: boolean;
  regional_pricing: boolean;
}

export interface RankCenterFormData {
  name: string;
  group_id: number;
  universe_id: number;
  ranks: RankEntry[];
}

export interface RankCenterBuilderProps {
  initialData?: Partial<RankCenterFormData>;
  onSave: (data: RankCenterFormData) => void | Promise<void>;
  onCancel: () => void;
}

/* ------------------------------------------------------------------ */
/*  Delete Confirmation                                                */
/* ------------------------------------------------------------------ */

function DeleteRankModal({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
        onClick={onCancel}
      />
      <div
        className={clsx(
          'relative z-10 w-full max-w-sm rounded-2xl border border-[#2d3748] bg-[#1a1f25] p-6',
          'shadow-2xl shadow-black/40 animate-[scaleIn_200ms_ease-out]',
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-[#e2e8f0]">Remove Rank</h3>
        </div>
        <p className="text-sm text-[#a0aec0] mb-5">
          Remove <span className="font-medium text-[#e2e8f0]">&ldquo;{name}&rdquo;</span> from
          this rank center? This won&apos;t take effect until you save.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>Remove</Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Rank Summary Card                                                  */
/* ------------------------------------------------------------------ */

function RankSummaryCard({
  rank,
  index,
  total,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  rank: RankEntry;
  index: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 50);
    return () => clearTimeout(t);
  }, [index]);

  const priceLabel = rank.price === 0 ? 'Free' : `R$ ${rank.price.toLocaleString()}`;
  const isPaid = rank.price > 0;

  return (
    <div
      className={clsx(
        'group relative flex items-center gap-3 rounded-xl border bg-[#0f1419] p-4',
        'transition-all duration-300 ease-out',
        isPaid
          ? 'border-amber-500/20 hover:border-amber-500/40'
          : 'border-[#2d3748] hover:border-[#ff4b6e]/30',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      )}
    >
      {/* reorder handle + arrows */}
      <div className="flex flex-col items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className={clsx(
            'p-0.5 rounded text-[#718096] transition-colors',
            index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-[#e2e8f0] hover:bg-[#2d3748]',
          )}
          title="Move up"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <GripVertical className="w-3.5 h-3.5 text-[#4a5568]" />
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className={clsx(
            'p-0.5 rounded text-[#718096] transition-colors',
            index === total - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-[#e2e8f0] hover:bg-[#2d3748]',
          )}
          title="Move down"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* rank id badge */}
      <div
        className={clsx(
          'flex items-center justify-center w-10 h-10 rounded-lg shrink-0 font-bold text-sm',
          isPaid
            ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/20'
            : 'bg-[#1a1f25] text-[#a0aec0] border border-[#2d3748]',
        )}
      >
        {rank.rank_id}
      </div>

      {/* info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-sm font-semibold text-[#e2e8f0] truncate">{rank.name}</h4>
          {rank.is_for_sale && (
            <Badge variant="success" size="xs">For Sale</Badge>
          )}
          {rank.regional_pricing && (
            <Badge variant="info" size="xs">Regional</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#718096]">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {priceLabel}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            GP: {rank.gamepass_id}
          </span>
        </div>
        {rank.description && (
          <p className="text-xs text-[#4a5568] mt-1 truncate max-w-xs">{rank.description}</p>
        )}
      </div>

      {/* actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 rounded-md text-[#718096] hover:text-[#e2e8f0] hover:bg-[#2d3748] transition-colors"
          title="Edit rank"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 rounded-md text-[#718096] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Remove rank"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section Wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#2d3748] bg-[#1a1f25] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#2d3748] bg-[#0f1419]/50">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#ff4b6e]/10 border border-[#ff4b6e]/20">
          <Icon className="w-4 h-4 text-[#ff4b6e]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#e2e8f0]">{title}</h2>
          {description && <p className="text-xs text-[#718096] mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Field Wrapper                                                      */
/* ------------------------------------------------------------------ */

function Field({
  label,
  error,
  required,
  children,
  hint,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-[#cbd5e0]">
        {label}
        {required && <span className="text-[#ff4b6e]">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="flex items-center gap-1 text-xs text-[#4a5568]">
          <Info className="w-3 h-3" />
          {hint}
        </p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function RankCenterBuilder({
  initialData,
  onSave,
  onCancel,
}: RankCenterBuilderProps) {
  const [saving, setSaving] = useState(false);
  const [editorRankIndex, setEditorRankIndex] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [deleteRankIndex, setDeleteRankIndex] = useState<number | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<RankCenterFormData>({
    defaultValues: {
      name: initialData?.name ?? '',
      group_id: initialData?.group_id ?? 0,
      universe_id: initialData?.universe_id ?? 0,
      ranks: initialData?.ranks ?? [],
    },
  });

  const { fields, append, remove, swap, update } = useFieldArray({
    control,
    name: 'ranks',
  });

  const ranks = watch('ranks');
  const isEdit = !!initialData?.name;

  /* ---- Submit ---- */
  const onSubmit = useCallback(
    async (data: RankCenterFormData) => {
      setSaving(true);
      try {
        await onSave(data);
      } finally {
        setSaving(false);
      }
    },
    [onSave],
  );

  /* ---- Rank editor callbacks ---- */
  const handleOpenAddRank = () => {
    setEditorMode('add');
    setEditorRankIndex(-1);
  };

  const handleOpenEditRank = (idx: number) => {
    setEditorMode('edit');
    setEditorRankIndex(idx);
  };

  const handleSaveRank = (rank: RankEntry) => {
    if (editorMode === 'add') {
      append(rank);
    } else if (editorRankIndex !== null && editorRankIndex >= 0) {
      update(editorRankIndex, rank);
    }
    setEditorRankIndex(null);
  };

  const handleConfirmDeleteRank = () => {
    if (deleteRankIndex !== null) {
      remove(deleteRankIndex);
      setDeleteRankIndex(null);
    }
  };

  const handleMoveUp = (idx: number) => {
    if (idx > 0) swap(idx, idx - 1);
  };

  const handleMoveDown = (idx: number) => {
    if (idx < fields.length - 1) swap(idx, idx + 1);
  };

  /* ---- Input class ---- */
  const inputClass = (hasError?: boolean) =>
    clsx(
      'w-full px-3 py-2 rounded-lg text-sm',
      'bg-[#0f1419] border text-[#e2e8f0] placeholder-[#4a5568]',
      'focus:outline-none focus:ring-1 transition-colors duration-200',
      hasError
        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
        : 'border-[#2d3748] focus:border-[#ff4b6e] focus:ring-[#ff4b6e]/30',
    );

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ---- Header ---- */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#e2e8f0]">
              {isEdit ? 'Edit Rank Center' : 'Create Rank Center'}
            </h1>
            <p className="text-sm text-[#718096] mt-1">
              {isEdit
                ? 'Update your rank center configuration and ranks.'
                : 'Set up a new rank center for your Roblox group.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isDirty ? 'warning' : 'secondary'} size="sm">
              {isDirty ? 'Unsaved changes' : 'No changes'}
            </Badge>
          </div>
        </div>

        {/* ---- Basic Info ---- */}
        <Section
          title="Basic Information"
          description="Configure the core details of this rank center."
          icon={ShieldCheck}
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Name" required error={errors.name?.message}>
              <input
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  maxLength: { value: 64, message: 'Name must be 64 characters or less' },
                })}
                placeholder="My Rank Center"
                className={inputClass(!!errors.name)}
              />
            </Field>

            <Field
              label="Group ID"
              required
              error={errors.group_id?.message}
              hint="Your Roblox group ID"
            >
              <input
                type="number"
                {...register('group_id', {
                  required: 'Group ID is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Must be a positive number' },
                })}
                placeholder="123456"
                className={inputClass(!!errors.group_id)}
              />
            </Field>

            <Field
              label="Universe ID"
              required
              error={errors.universe_id?.message}
              hint="The Roblox universe / experience ID"
            >
              <input
                type="number"
                {...register('universe_id', {
                  required: 'Universe ID is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Must be a positive number' },
                })}
                placeholder="789012"
                className={inputClass(!!errors.universe_id)}
              />
            </Field>
          </div>
        </Section>

        {/* ---- Ranks Section ---- */}
        <Section
          title="Ranks"
          description={`${fields.length} rank${fields.length !== 1 ? 's' : ''} configured`}
          icon={Crown}
        >
          {fields.length === 0 ? (
            /* empty ranks */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ff4b6e]/5 border border-[#ff4b6e]/10 mb-4">
                <Crown className="w-7 h-7 text-[#ff4b6e]/40" />
              </div>
              <h3 className="text-base font-semibold text-[#e2e8f0] mb-1">No ranks added</h3>
              <p className="text-sm text-[#718096] max-w-xs mb-6">
                Add ranks to define the hierarchy and pricing for your rank center.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                iconLeft={<Plus className="w-4 h-4" />}
                onClick={handleOpenAddRank}
              >
                Add First Rank
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, idx) => (
                <RankSummaryCard
                  key={field.id}
                  rank={ranks[idx] ?? field as unknown as RankEntry}
                  index={idx}
                  total={fields.length}
                  onEdit={() => handleOpenEditRank(idx)}
                  onDelete={() => setDeleteRankIndex(idx)}
                  onMoveUp={() => handleMoveUp(idx)}
                  onMoveDown={() => handleMoveDown(idx)}
                />
              ))}

              <button
                type="button"
                onClick={handleOpenAddRank}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl',
                  'border-2 border-dashed border-[#2d3748] text-[#718096]',
                  'hover:border-[#ff4b6e]/40 hover:text-[#ff4b6e] hover:bg-[#ff4b6e]/5',
                  'transition-all duration-200 text-sm font-medium',
                )}
              >
                <Plus className="w-4 h-4" />
                Add Rank
              </button>
            </div>
          )}
        </Section>

        {/* ---- Stats / summary bar ---- */}
        {fields.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#2d3748] bg-[#1a1f25] px-6 py-4">
            <div className="text-sm text-[#a0aec0]">
              <span className="font-semibold text-[#e2e8f0]">{fields.length}</span> ranks
            </div>
            <div className="w-px h-5 bg-[#2d3748]" />
            <div className="text-sm text-[#a0aec0]">
              <span className="font-semibold text-emerald-400">
                {ranks.filter((r) => r?.is_for_sale).length}
              </span>{' '}
              for sale
            </div>
            <div className="w-px h-5 bg-[#2d3748]" />
            <div className="text-sm text-[#a0aec0]">
              Total revenue potential:{' '}
              <span className="font-semibold text-amber-400">
                R$ {ranks.reduce((sum, r) => sum + (r?.price ?? 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* ---- Footer ---- */}
        <div
          className={clsx(
            'sticky bottom-0 z-30 -mx-1 px-1 pt-4 pb-2',
            'bg-gradient-to-t from-[#0f1419] via-[#0f1419] to-transparent',
          )}
        >
          <div className="flex items-center justify-between rounded-xl border border-[#2d3748] bg-[#1a1f25] px-6 py-4">
            <p className="text-xs text-[#718096] hidden sm:block">
              {isDirty
                ? 'You have unsaved changes. Save to apply them.'
                : 'All changes saved.'}
            </p>
            <div className="flex items-center gap-3 ml-auto">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                iconLeft={<Save className="w-4 h-4" />}
                loading={saving}
              >
                {isEdit ? 'Save Changes' : 'Create Rank Center'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* ---- Rank Editor Modal ---- */}
      {editorRankIndex !== null && (
        <RanksEditor
          rank={editorMode === 'edit' && editorRankIndex >= 0 ? ranks[editorRankIndex] : undefined}
          onSave={handleSaveRank}
          onClose={() => setEditorRankIndex(null)}
        />
      )}

      {/* ---- Delete Rank Modal ---- */}
      {deleteRankIndex !== null && (
        <DeleteRankModal
          name={ranks[deleteRankIndex]?.name ?? 'this rank'}
          onConfirm={handleConfirmDeleteRank}
          onCancel={() => setDeleteRankIndex(null)}
        />
      )}
    </>
  );
}
