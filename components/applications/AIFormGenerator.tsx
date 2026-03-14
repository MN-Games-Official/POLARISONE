'use client';

import { useState, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import {
  Sparkles,
  X,
  Download,


  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ListChecks,
  MessageSquare,
  ToggleLeft,
  Wand2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Question {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  text: string;
  options?: string[];
  correct_answer?: number | string | boolean;
  max_score: number;
  grading_criteria?: string;
}

interface ApplicationData {
  id?: string;
  name: string;
  description: string;
  group_id: string;
  target_role: string;
  pass_score: number;
  primary_color: string;
  secondary_color: string;
  questions: Question[];
}

interface AIFormGeneratorProps {
  applicationData: ApplicationData;
  onImport: (questions: Question[], mode: 'replace' | 'merge') => void;
  onClose: () => void;
}

type Vibe = 'professional' | 'casual' | 'strict' | 'fun';

const VIBES: { value: Vibe; label: string; emoji: string; desc: string }[] = [
  {
    value: 'professional',
    label: 'Professional',
    emoji: '💼',
    desc: 'Formal & structured',
  },
  {
    value: 'casual',
    label: 'Casual',
    emoji: '😊',
    desc: 'Friendly & relaxed',
  },
  {
    value: 'strict',
    label: 'Strict',
    emoji: '🔒',
    desc: 'Thorough & demanding',
  },
  { value: 'fun', label: 'Fun', emoji: '🎮', desc: 'Playful & creative' },
];

const TYPE_ICON: Record<Question['type'], React.ReactNode> = {
  multiple_choice: <ListChecks className="h-3.5 w-3.5" />,
  short_answer: <MessageSquare className="h-3.5 w-3.5" />,
  true_false: <ToggleLeft className="h-3.5 w-3.5" />,
};

const TYPE_LABEL: Record<Question['type'], string> = {
  multiple_choice: 'Multiple Choice',
  short_answer: 'Short Answer',
  true_false: 'True / False',
};

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/* ------------------------------------------------------------------ */
/*  Thinking animation                                                 */
/* ------------------------------------------------------------------ */

function ThinkingAnimation() {
  const STEPS = [
    'Analyzing application context…',
    'Generating question ideas…',
    'Scoring & calibrating difficulty…',
    'Polishing final questions…',
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((p) => (p < STEPS.length - 1 ? p + 1 : p));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center py-10">
      {/* Animated orb */}
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-[#ff4b6e]/20" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-[#ff4b6e]/10" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#ff4b6e] to-[#ff4b6e]/70 shadow-lg shadow-[#ff4b6e]/30">
          <Sparkles className="h-6 w-6 animate-pulse text-white" />
        </div>
      </div>

      <p className="mb-3 text-sm font-medium text-[#e2e8f0]">
        AI is generating questions
      </p>

      {/* Steps */}
      <div className="space-y-2">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={clsx(
              'flex items-center gap-2 text-xs transition-all duration-500',
              i < step
                ? 'text-emerald-400'
                : i === step
                  ? 'animate-pulse text-[#ff4b6e]'
                  : 'text-[#4a5568]',
            )}
          >
            {i < step ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : i === step ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span className="h-3.5 w-3.5 rounded-full border border-[#4a5568]" />
            )}
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Generated question card                                            */
/* ------------------------------------------------------------------ */

function GeneratedQuestionCard({
  question,
  selected,
  onToggle,
}: {
  question: Question;
  selected: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={clsx(
        'rounded-xl border p-4 transition-all duration-200',
        selected
          ? 'border-[#ff4b6e]/40 bg-[#ff4b6e]/5'
          : 'border-[#2d3748] bg-[#0f1419]/40 opacity-60',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={onToggle}
          className={clsx(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition',
            selected
              ? 'border-[#ff4b6e] bg-[#ff4b6e] text-white'
              : 'border-[#4a5568] hover:border-[#a0aec0]',
          )}
        >
          {selected && <CheckCircle2 className="h-3 w-3" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" size="xs">
              <span className="mr-1">{TYPE_ICON[question.type]}</span>
              {TYPE_LABEL[question.type]}
            </Badge>
            <Badge variant="secondary" size="xs">
              {question.max_score} pts
            </Badge>
          </div>

          <p className="text-sm text-[#e2e8f0]">{question.text}</p>

          {/* Expandable details */}
          {(question.options || question.grading_criteria) && (
            <>
              <button
                type="button"
                onClick={() => setExpanded((p) => !p)}
                className="mt-2 flex items-center gap-1 text-xs text-[#a0aec0] hover:text-[#e2e8f0]"
              >
                Details
                <ChevronDown
                  className={clsx(
                    'h-3 w-3 transition-transform',
                    expanded && 'rotate-180',
                  )}
                />
              </button>

              {expanded && (
                <div className="mt-2 animate-[fadeIn_0.2s_ease] space-y-1 text-xs text-[#a0aec0]">
                  {question.options?.map((o, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span
                        className={clsx(
                          'h-1.5 w-1.5 rounded-full',
                          question.correct_answer === i
                            ? 'bg-emerald-400'
                            : 'bg-[#4a5568]',
                        )}
                      />
                      {o}
                      {question.correct_answer === i && (
                        <span className="text-emerald-400">(correct)</span>
                      )}
                    </div>
                  ))}
                  {question.grading_criteria && (
                    <p className="italic text-[#4a5568]">
                      Criteria: {question.grading_criteria}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function AIFormGenerator({
  applicationData,
  onImport,
  onClose,
}: AIFormGeneratorProps) {
  const [count, setCount] = useState(5);
  const [vibe, setVibe] = useState<Vibe>('professional');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Question[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* ---- Generate ---- */
  const handleGenerate = useCallback(async () => {
    if (!applicationData.id) {
      setError('Application ID is missing. Please save the application first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/applications/${applicationData.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionCount: count, vibe, customInstructions: instructions }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      const questionsWithIds = data.questions.map((q: any) => ({ ...q, id: uid() }));

      setGenerated(questionsWithIds);
      setSelected(new Set(questionsWithIds.map((q: Question) => q.id)));
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [count, vibe, instructions, applicationData.id]);

  /* ---- Regenerate ---- */
  const handleRegenerate = useCallback(() => {
    setGenerated(null);
    setSelected(new Set());
    handleGenerate();
  }, [handleGenerate]);

  /* ---- Toggle selection ---- */
  const toggleQuestion = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* ---- Import ---- */
  const handleImport = useCallback(
    (mode: 'replace' | 'merge') => {
      if (!generated) return;
      const selectedQuestions = generated.filter((q) => selected.has(q.id));
      onImport(selectedQuestions, mode);
    },
    [generated, selected, onImport],
  );

  const selectedCount = selected.size;

  return (
    <Modal open onClose={onClose} title="" size="lg">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff4b6e] to-[#ff4b6e]/70 shadow-md shadow-[#ff4b6e]/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#e2e8f0]">
            AI Question Generator
          </h2>
          <p className="text-xs text-[#a0aec0]">
            Let AI craft the perfect questions for your application
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-lg p-1.5 text-[#a0aec0] transition hover:bg-[#2d3748] hover:text-[#e2e8f0]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {loading ? (
        <ThinkingAnimation />
      ) : generated ? (
        /* ---- Results ---- */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#a0aec0]">
              Generated{' '}
              <span className="font-medium text-[#e2e8f0]">
                {generated.length}
              </span>{' '}
              questions •{' '}
              <span className="font-medium text-[#ff4b6e]">
                {selectedCount}
              </span>{' '}
              selected
            </p>
            <Button
              variant="ghost"
              size="xs"
              iconLeft={<RefreshCw className="h-3.5 w-3.5" />}
              onClick={handleRegenerate}
            >
              Regenerate
            </Button>
          </div>

          <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
            {generated.map((q) => (
              <GeneratedQuestionCard
                key={q.id}
                question={q}
                selected={selected.has(q.id)}
                onToggle={() => toggleQuestion(q.id)}
              />
            ))}
          </div>

          {/* Import actions */}
          <div className="flex flex-col gap-2 border-t border-[#2d3748] pt-4 sm:flex-row">
            <Button
              variant="primary"
              size="sm"
              disabled={selectedCount === 0}
              onClick={() => handleImport('merge')}
              className="flex-1 shadow-md shadow-[#ff4b6e]/20"
            >
              <Download className="mr-1.5 h-4 w-4" />
              Merge with existing ({selectedCount})
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedCount === 0}
              onClick={() => handleImport('replace')}
              className="flex-1"
            >
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Replace all ({selectedCount})
            </Button>
          </div>
        </div>
      ) : (
        /* ---- Configuration ---- */
        <div className="space-y-5">
          {/* Question count slider */}
          <div>
            <label className="mb-2 block text-xs font-medium text-[#a0aec0]">
              Number of Questions:{' '}
              <span className="text-[#ff4b6e]">{count}</span>
            </label>
            <input
              type="range"
              min={3}
              max={10}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#2d3748] accent-[#ff4b6e] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ff4b6e] [&::-webkit-slider-thumb]:shadow-md"
            />
            <div className="mt-1 flex justify-between text-[10px] text-[#4a5568]">
              <span>3</span>
              <span>10</span>
            </div>
          </div>

          {/* Vibe selector */}
          <div>
            <label className="mb-2 block text-xs font-medium text-[#a0aec0]">
              Vibe
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {VIBES.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setVibe(v.value)}
                  className={clsx(
                    'flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all duration-200',
                    vibe === v.value
                      ? 'border-[#ff4b6e]/50 bg-[#ff4b6e]/10 text-[#ff4b6e] shadow-sm shadow-[#ff4b6e]/10'
                      : 'border-[#2d3748] text-[#a0aec0] hover:border-[#ff4b6e]/30 hover:text-[#e2e8f0]',
                  )}
                >
                  <span className="text-xl">{v.emoji}</span>
                  <span className="text-xs font-medium">{v.label}</span>
                  <span className="text-[10px] text-[#4a5568]">{v.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom instructions */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#a0aec0]">
              Custom Instructions{' '}
              <span className="text-[#4a5568]">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Focus on teamwork, include a scenario question, avoid personal questions…"
              className="w-full resize-none rounded-lg border border-[#2d3748] bg-[#0f1419] px-3 py-2 text-sm text-[#e2e8f0] outline-none transition placeholder:text-[#4a5568] focus:border-[#ff4b6e]/50 focus:ring-1 focus:ring-[#ff4b6e]/30"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {/* Generate button */}
          <Button
            variant="primary"
            onClick={handleGenerate}
            className="w-full shadow-lg shadow-[#ff4b6e]/20"
            iconLeft={<Wand2 className="h-4 w-4" />}
          >
            Generate Questions
          </Button>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Modal>
  );
}
