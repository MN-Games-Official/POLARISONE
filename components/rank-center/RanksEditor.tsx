'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import {
  Save,
  X,
  Hash,
  Type,
  FileText,
  DollarSign,
  Globe,
  Tag,
  ShieldCheck,
  Eye,
  Sparkles,
  Crown,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

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

export interface RanksEditorProps {
  rank?: RankEntry;
  onSave: (rank: RankEntry) => void;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Toggle Switch                                                      */
/* ------------------------------------------------------------------ */

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  icon: Icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ElementType;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={clsx(
        'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300',
        checked
          ? 'border-[#ff4b6e]/40 bg-[#ff4b6e]/5'
          : 'border-[#2d3748] bg-[#0f1419]/60 hover:border-[#4a5568]'
      )}
    >
      {Icon && (
        <div
          className={clsx(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300',
            checked ? 'bg-[#ff4b6e]/15 text-[#ff4b6e]' : 'bg-[#2d3748] text-[#a0aec0]'
          )}
        >
          <Icon size={16} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-[#e2e8f0]">{label}</span>
        {description && (
          <span className="block text-xs text-[#a0aec0] mt-0.5">{description}</span>
        )}
      </div>
      <div
        className={clsx(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300',
          checked ? 'bg-[#ff4b6e]' : 'bg-[#2d3748]'
        )}
      >
        <div
          className={clsx(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          )}
        />
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Preview Card                                                       */
/* ------------------------------------------------------------------ */

function PreviewCard({ rank }: { rank: Partial<RankEntry> }) {
  const tierColor = useMemo(() => {
    const id = rank.rank_id ?? 0;
    if (id >= 200) return { bg: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
    if (id >= 100) return { bg: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/30', text: 'text-blue-400' };
    return { bg: 'from-gray-500/20 to-slate-500/10', border: 'border-gray-500/30', text: 'text-gray-400' };
  }, [rank.rank_id]);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Eye size={14} className="text-[#a0aec0]" />
        <span className="text-xs font-medium uppercase tracking-wider text-[#a0aec0]">
          Preview
        </span>
      </div>
      <div
        className={clsx(
          'rounded-xl border bg-gradient-to-br p-4 transition-all duration-500',
          tierColor.bg,
          tierColor.border
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Crown size={16} className={tierColor.text} />
              <h4 className="text-sm font-bold text-[#e2e8f0] truncate">
                {rank.name || 'Untitled Rank'}
              </h4>
            </div>
            <p className="mt-1 text-xs text-[#a0aec0] line-clamp-2">
              {rank.description || 'No description provided'}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className={clsx('text-xs font-mono', tierColor.text)}>
              #{rank.rank_id ?? 0}
            </span>
            <p className="text-xs font-semibold text-[#e2e8f0] mt-0.5">
              {rank.price ? `R$ ${rank.price.toLocaleString()}` : 'Free'}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {rank.is_for_sale && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              <Tag size={10} /> For Sale
            </span>
          )}
          {rank.regional_pricing && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-400">
              <Globe size={10} /> Regional Pricing
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Validation helpers                                                 */
/* ------------------------------------------------------------------ */

interface FormErrors {
  name?: string;
  rank_id?: string;
  gamepass_id?: string;
  price?: string;
}

function validateForm(data: Partial<RankEntry>): FormErrors {
  const errors: FormErrors = {};

  if (!data.name?.trim()) {
    errors.name = 'Rank name is required';
  }

  if (data.rank_id === undefined || data.rank_id === null) {
    errors.rank_id = 'Rank ID is required';
  } else if (data.rank_id < 0 || data.rank_id > 255) {
    errors.rank_id = 'Rank ID must be between 0 and 255';
  } else if (!Number.isInteger(data.rank_id)) {
    errors.rank_id = 'Rank ID must be a whole number';
  }

  if (data.gamepass_id === undefined || data.gamepass_id === null) {
    errors.gamepass_id = 'Gamepass ID is required';
  } else if (data.gamepass_id < 0) {
    errors.gamepass_id = 'Gamepass ID must be a positive number';
  }

  if (data.price !== undefined && data.price < 0) {
    errors.price = 'Price cannot be negative';
  }

  return errors;
}

/* ------------------------------------------------------------------ */
/*  RanksEditor                                                        */
/* ------------------------------------------------------------------ */

export default function RanksEditor({ rank, onSave, onClose }: RanksEditorProps) {
  const isEditing = Boolean(rank);

  const [name, setName] = useState(rank?.name ?? '');
  const [rankId, setRankId] = useState<number>(rank?.rank_id ?? 0);
  const [gamepassId, setGamepassId] = useState<number>(rank?.gamepass_id ?? 0);
  const [price, setPrice] = useState<number>(rank?.price ?? 0);
  const [description, setDescription] = useState(rank?.description ?? '');
  const [isForSale, setIsForSale] = useState(rank?.is_for_sale ?? false);
  const [regionalPricing, setRegionalPricing] = useState(rank?.regional_pricing ?? false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const currentData: Partial<RankEntry> = useMemo(
    () => ({
      name,
      rank_id: rankId,
      gamepass_id: gamepassId,
      price,
      description,
      is_for_sale: isForSale,
      regional_pricing: regionalPricing,
    }),
    [name, rankId, gamepassId, price, description, isForSale, regionalPricing]
  );

  // Live validation after first submit attempt
  useEffect(() => {
    if (hasAttemptedSubmit) {
      setErrors(validateForm(currentData));
    }
  }, [currentData, hasAttemptedSubmit]);

  const handleSubmit = useCallback(() => {
    setHasAttemptedSubmit(true);
    const validationErrors = validateForm(currentData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSubmitError('Please fix the errors above before saving.');
      return;
    }

    setSubmitError(null);

    const entry: RankEntry = {
      id: rank?.id ?? crypto.randomUUID(),
      rank_id: rankId,
      gamepass_id: gamepassId,
      name: name.trim(),
      description: description.trim(),
      price,
      is_for_sale: isForSale,
      regional_pricing: regionalPricing,
    };

    onSave(entry);
  }, [currentData, rank, rankId, gamepassId, name, description, price, isForSale, regionalPricing, onSave]);

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={
        <span className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#ff4b6e]" />
          {isEditing ? 'Edit Rank' : 'Add New Rank'}
        </span>
      }
      description={
        isEditing
          ? 'Update the rank details below.'
          : 'Fill in the details to create a new rank entry.'
      }
      footer={
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onClose} iconLeft={<X size={16} />}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} iconLeft={<Save size={16} />}>
            {isEditing ? 'Save Changes' : 'Create Rank'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {submitError && (
          <Alert type="error" title="Validation Error" onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}

        {/* Name */}
        <Input
          label="Rank Name"
          placeholder="e.g. Commander"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          iconLeft={<Type size={16} />}
        />

        {/* Rank ID & Gamepass ID */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Rank ID (0–255)"
            type="number"
            min={0}
            max={255}
            placeholder="0"
            value={String(rankId)}
            onChange={(e) => setRankId(Number(e.target.value))}
            error={errors.rank_id}
            iconLeft={<Hash size={16} />}
          />
          <Input
            label="Gamepass ID"
            type="number"
            min={0}
            placeholder="0"
            value={String(gamepassId)}
            onChange={(e) => setGamepassId(Number(e.target.value))}
            error={errors.gamepass_id}
            iconLeft={<ShieldCheck size={16} />}
          />
        </div>

        {/* Price */}
        <Input
          label="Price (Robux)"
          type="number"
          min={0}
          placeholder="0"
          value={String(price)}
          onChange={(e) => setPrice(Number(e.target.value))}
          error={errors.price}
          iconLeft={<DollarSign size={16} />}
          helperText="Set to 0 for a free rank"
        />

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#e2e8f0] flex items-center gap-1.5">
            <FileText size={14} className="text-[#a0aec0]" />
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this rank..."
            rows={3}
            className={clsx(
              'w-full rounded-xl bg-[#0f1419] border border-[#2d3748] px-4 py-2.5 text-sm text-[#e2e8f0]',
              'placeholder:text-[#4a5568] resize-none',
              'transition-all duration-200',
              'focus:border-[#ff4b6e] focus:ring-2 focus:ring-[#ff4b6e]/20 focus:outline-none'
            )}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          <ToggleSwitch
            checked={isForSale}
            onChange={setIsForSale}
            label="For Sale"
            description="Make this rank available for purchase"
            icon={Tag}
          />
          <ToggleSwitch
            checked={regionalPricing}
            onChange={setRegionalPricing}
            label="Regional Pricing"
            description="Enable region-based pricing adjustments"
            icon={Globe}
          />
        </div>

        {/* Preview */}
        <PreviewCard rank={currentData} />
      </div>
    </Modal>
  );
}
