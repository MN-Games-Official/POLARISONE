'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import clsx from 'clsx';
import {
  Save,
  X,
  Plus,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit3,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
  Palette,
  Settings,
  FileText,
  HelpCircle,
  ListChecks,
  ToggleLeft,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import QuestionEditor from './QuestionEditor';
import PreviewPanel from './PreviewPanel';
import AIFormGenerator from './AIFormGenerator';

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

interface ApplicationBuilderProps {
  initialData?: ApplicationData;
  onSave: (data: ApplicationData) => void;
  onCancel: () => void;
}

type FormValues = Omit<ApplicationData, 'questions'>;

const QUESTION_TYPE_ICON: Record<Question['type'], React.ReactNode> = {
  multiple_choice: <ListChecks className="h-4 w-4" />,
  short_answer: <MessageSquare className="h-4 w-4" />,
  true_false: <ToggleLeft className="h-4 w-4" />,
};

const QUESTION_TYPE_LABEL: Record<Question['type'], string> = {
  multiple_choice: 'Multiple Choice',
  short_answer: 'Short Answer',
  true_false: 'True / False',
};

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({
  icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-[#2d3748] bg-[#1a1f25] transition-colors hover:border-[#2d3748]/80">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center gap-2.5 px-5 py-4 text-left"
      >
        <span className="text-[#ff4b6e]">{icon}</span>
        <span className="flex-1 text-sm font-semibold text-[#e2e8f0]">
          {title}
        </span>
        <ChevronDown
          className={clsx(
            'h-4 w-4 text-[#a0aec0] transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        className={clsx(
          'grid transition-[grid-template-rows] duration-300',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 px-5 pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Field helpers                                                      */
/* ------------------------------------------------------------------ */

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-[#a0aec0]">
      {children}
      {hint && <span className="ml-1 font-normal text-[#4a5568]">({hint})</span>}
    </label>
  );
}

function FieldInput({
  className,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div>
      <input
        {...props}
        className={clsx(
          'w-full rounded-lg border bg-[#0f1419] px-3 py-2 text-sm text-[#e2e8f0] outline-none transition placeholder:text-[#4a5568]',
          error
            ? 'border-red-500/60 focus:border-red-500'
            : 'border-[#2d3748] focus:border-[#ff4b6e]/50 focus:ring-1 focus:ring-[#ff4b6e]/30',
          className,
        )}
      />
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

function FieldTextarea({
  className,
  maxLength,
  value,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  const len = typeof value === 'string' ? value.length : 0;
  return (
    <div>
      <textarea
        {...props}
        value={value}
        maxLength={maxLength}
        className={clsx(
          'w-full resize-none rounded-lg border bg-[#0f1419] px-3 py-2 text-sm text-[#e2e8f0] outline-none transition placeholder:text-[#4a5568]',
          error
            ? 'border-red-500/60 focus:border-red-500'
            : 'border-[#2d3748] focus:border-[#ff4b6e]/50 focus:ring-1 focus:ring-[#ff4b6e]/30',
          className,
        )}
      />
      <div className="mt-1 flex items-center justify-between">
        {error ? (
          <p className="flex items-center gap-1 text-xs text-red-400">
            <AlertCircle className="h-3 w-3" /> {error}
          </p>
        ) : (
          <span />
        )}
        {maxLength && (
          <span
            className={clsx(
              'text-xs',
              len > maxLength * 0.9 ? 'text-amber-400' : 'text-[#4a5568]',
            )}
          >
            {len}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Question summary card                                              */
/* ------------------------------------------------------------------ */

function QuestionCard({
  question,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: {
  question: Question;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-start gap-3 rounded-xl border border-[#2d3748] bg-[#0f1419]/60 p-4 transition-all duration-200 hover:border-[#ff4b6e]/20 hover:bg-[#0f1419]">
      {/* Drag handle & reorder */}
      <div className="flex flex-col items-center gap-0.5 pt-0.5">
        <GripVertical className="h-4 w-4 text-[#4a5568]" />
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="rounded p-0.5 text-[#a0aec0] transition hover:text-[#ff4b6e] disabled:opacity-30"
          aria-label="Move up"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="rounded p-0.5 text-[#a0aec0] transition hover:text-[#ff4b6e] disabled:opacity-30"
          aria-label="Move down"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-[#ff4b6e]/10 text-[#ff4b6e]">
            {QUESTION_TYPE_ICON[question.type]}
          </span>
          <Badge variant="outline" size="xs">
            {QUESTION_TYPE_LABEL[question.type]}
          </Badge>
          <Badge variant="secondary" size="xs">
            {question.max_score} pts
          </Badge>
        </div>
        <p className="line-clamp-2 text-sm text-[#e2e8f0]">{question.text}</p>
        {question.type === 'multiple_choice' && question.options && (
          <p className="mt-1 text-xs text-[#4a5568]">
            {question.options.length} option{question.options.length !== 1 && 's'}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#a0aec0] transition hover:bg-[#ff4b6e]/10 hover:text-[#ff4b6e]"
          aria-label="Edit question"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#a0aec0] transition hover:bg-red-500/10 hover:text-red-400"
          aria-label="Delete question"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Color picker field                                                 */
/* ------------------------------------------------------------------ */

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-9 w-9 shrink-0 rounded-lg border border-[#2d3748] shadow-inner"
        style={{ backgroundColor: value }}
      />
      <div className="flex-1">
        <FieldLabel>{label}</FieldLabel>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-0 w-0 opacity-0"
          id={`color-${label}`}
        />
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-[#2d3748] bg-[#0f1419] px-2 py-1.5 font-mono text-xs text-[#e2e8f0] outline-none transition focus:border-[#ff4b6e]/50"
          />
          <label
            htmlFor={`color-${label}`}
            className="cursor-pointer rounded-md border border-[#2d3748] bg-[#1a1f25] p-1.5 text-[#a0aec0] transition hover:border-[#ff4b6e]/40 hover:text-[#ff4b6e]"
          >
            <Palette className="h-3.5 w-3.5" />
          </label>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Validation warnings                                                */
/* ------------------------------------------------------------------ */

function ValidationWarnings({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
        <AlertCircle className="h-3.5 w-3.5" /> Validation warnings
      </div>
      <ul className="space-y-0.5 text-xs text-amber-300/80">
        {warnings.map((w, i) => (
          <li key={i} className="flex items-start gap-1">
            <span className="mt-0.5 shrink-0">•</span> {w}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const DEFAULT_DATA: ApplicationData = {
  name: '',
  description: '',
  group_id: '',
  target_role: '',
  pass_score: 70,
  primary_color: '#ff4b6e',
  secondary_color: '#1a1f25',
  questions: [],
};

export default function ApplicationBuilder({
  initialData,
  onSave,
  onCancel,
}: ApplicationBuilderProps) {
  const base = initialData ?? DEFAULT_DATA;

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      name: base.name,
      description: base.description,
      group_id: base.group_id,
      target_role: base.target_role,
      pass_score: base.pass_score,
      primary_color: base.primary_color,
      secondary_color: base.secondary_color,
    },
  });

  const [questions, setQuestions] = useState<Question[]>(base.questions);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>();
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const watched = watch();

  // Track unsaved changes
  useEffect(() => {
    setHasUnsaved(isDirty || questions !== base.questions);
  }, [isDirty, questions, base.questions]);

  // Warn before leaving
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsaved]);

  /* ---- Question operations ---- */
  const addQuestion = useCallback((q: Question) => {
    setQuestions((prev) => [...prev, { ...q, id: uid() }]);
    setShowQuestionEditor(false);
  }, []);

  const updateQuestion = useCallback((q: Question) => {
    setQuestions((prev) => prev.map((p) => (p.id === q.id ? q : p)));
    setEditingQuestion(undefined);
    setShowQuestionEditor(false);
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const moveQuestion = useCallback((idx: number, dir: -1 | 1) => {
    setQuestions((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  /* ---- Validation warnings ---- */
  const warnings = useMemo(() => {
    const w: string[] = [];
    if (questions.length === 0) w.push('Add at least one question.');
    if (!watched.name?.trim()) w.push('Application name is required.');
    if (!watched.group_id?.trim()) w.push('Roblox group ID is required.');
    if (!watched.target_role?.trim()) w.push('Target role is required.');
    const totalScore = questions.reduce((s, q) => s + q.max_score, 0);
    if (totalScore > 0 && watched.pass_score > totalScore) {
      w.push(`Pass score (${watched.pass_score}) exceeds total (${totalScore}).`);
    }
    return w;
  }, [questions, watched]);

  const shortAnswerCount = useMemo(
    () => questions.filter((q) => q.type === 'short_answer').length,
    [questions],
  );

  /* ---- Submit ---- */
  const handleFormSubmit = (data: FormValues) => {
    onSave({ ...data, id: initialData?.id, questions });
  };

  /* ---- AI import ---- */
  const handleAIImport = useCallback(
    (imported: Question[], mode: 'replace' | 'merge') => {
      if (mode === 'replace') {
        setQuestions(imported.map((q) => ({ ...q, id: uid() })));
      } else {
        setQuestions((prev) => [
          ...prev,
          ...imported.map((q) => ({ ...q, id: uid() })),
        ]);
      }
      setShowAIGenerator(false);
    },
    [],
  );

  /* ---- Preview data ---- */
  const previewData = useMemo(
    () => ({
      name: watched.name || 'Untitled Application',
      description: watched.description || '',
      primary_color: watched.primary_color || '#ff4b6e',
      secondary_color: watched.secondary_color || '#1a1f25',
      questions,
    }),
    [watched, questions],
  );

  return (
    <>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex min-h-[calc(100vh-200px)] flex-col lg:flex-row"
      >
        {/* ======== LEFT: Editor ======== */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 lg:max-w-xl lg:border-r lg:border-[#2d3748] lg:p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#e2e8f0]">
                {initialData ? 'Edit Application' : 'New Application'}
              </h2>
              {hasUnsaved && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                  Unsaved
                </span>
              )}
            </div>
          </div>

          {/* ---- Basic Info ---- */}
          <Section icon={<FileText className="h-4 w-4" />} title="Basic Info">
            <div>
              <FieldLabel htmlFor="name">Application Name</FieldLabel>
              <FieldInput
                id="name"
                placeholder="e.g. Staff Application"
                error={errors.name?.message}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 3, message: 'Min 3 characters' },
                  maxLength: { value: 100, message: 'Max 100 characters' },
                })}
              />
            </div>
            <div>
              <FieldLabel htmlFor="description" hint="optional">
                Description
              </FieldLabel>
              <Controller
                control={control}
                name="description"
                rules={{ maxLength: { value: 500, message: 'Max 500 characters' } }}
                render={({ field }) => (
                  <FieldTextarea
                    id="description"
                    rows={3}
                    maxLength={500}
                    placeholder="Describe the purpose of this application…"
                    error={errors.description?.message}
                    {...field}
                  />
                )}
              />
            </div>
          </Section>

          {/* ---- Roblox Settings ---- */}
          <Section icon={<Settings className="h-4 w-4" />} title="Roblox Settings">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="group_id">Group ID</FieldLabel>
                <FieldInput
                  id="group_id"
                  placeholder="123456"
                  error={errors.group_id?.message}
                  {...register('group_id', { required: 'Required' })}
                />
              </div>
              <div>
                <FieldLabel htmlFor="target_role">Target Role</FieldLabel>
                <FieldInput
                  id="target_role"
                  placeholder="e.g. Member"
                  error={errors.target_role?.message}
                  {...register('target_role', { required: 'Required' })}
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="pass_score">
                Pass Score: {watched.pass_score}%
              </FieldLabel>
              <Controller
                control={control}
                name="pass_score"
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-[#2d3748] accent-[#ff4b6e] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ff4b6e] [&::-webkit-slider-thumb]:shadow-md"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    <span className="w-10 text-right font-mono text-xs text-[#a0aec0]">
                      {field.value}%
                    </span>
                  </div>
                )}
              />
            </div>
          </Section>

          {/* ---- Style ---- */}
          <Section icon={<Palette className="h-4 w-4" />} title="Style">
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="primary_color"
                render={({ field }) => (
                  <ColorField
                    label="Primary"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="secondary_color"
                render={({ field }) => (
                  <ColorField
                    label="Secondary"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </Section>

          {/* ---- Questions ---- */}
          <Section icon={<HelpCircle className="h-4 w-4" />} title="Questions">
            {questions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#2d3748] p-6 text-center">
                <HelpCircle className="mx-auto mb-2 h-8 w-8 text-[#4a5568]" />
                <p className="text-sm text-[#a0aec0]">
                  No questions yet. Add your first question below.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    index={i}
                    total={questions.length}
                    onMoveUp={() => moveQuestion(i, -1)}
                    onMoveDown={() => moveQuestion(i, 1)}
                    onEdit={() => {
                      setEditingQuestion(q);
                      setShowQuestionEditor(true);
                    }}
                    onDelete={() => deleteQuestion(q.id)}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                iconLeft={<Plus className="h-4 w-4" />}
                onClick={() => {
                  setEditingQuestion(undefined);
                  setShowQuestionEditor(true);
                }}
              >
                Add Question
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                iconLeft={<Sparkles className="h-4 w-4" />}
                onClick={() => setShowAIGenerator(true)}
                className="text-[#ff4b6e]"
              >
                Generate with AI
              </Button>
            </div>
          </Section>

          {/* Validation */}
          <ValidationWarnings warnings={warnings} />

          {/* ---- Footer ---- */}
          <div className="sticky bottom-0 flex items-center gap-3 border-t border-[#2d3748] bg-[#0f1419]/80 py-4 backdrop-blur-sm">
            <Button
              type="submit"
              variant="primary"
              iconLeft={<Save className="h-4 w-4" />}
              className="shadow-md shadow-[#ff4b6e]/20"
              disabled={warnings.length > 0}
            >
              {initialData ? 'Save Changes' : 'Create Application'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              iconLeft={<X className="h-4 w-4" />}
              onClick={onCancel}
            >
              Cancel
            </Button>
            {warnings.length === 0 && questions.length > 0 && (
              <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready to save
              </span>
            )}
          </div>
        </div>

        {/* ======== RIGHT: Preview ======== */}
        <div className="hidden flex-1 overflow-y-auto bg-[#0f1419] lg:block">
          <div className="p-6">
            <div className="mb-3 flex items-center gap-2 text-xs text-[#a0aec0]">
              <Info className="h-3.5 w-3.5" /> Live preview — updates as you
              edit
            </div>
            <PreviewPanel
              name={previewData.name}
              description={previewData.description}
              primary_color={previewData.primary_color}
              secondary_color={previewData.secondary_color}
              questions={previewData.questions}
            />
          </div>
        </div>
      </form>

      {/* ---- Question editor modal ---- */}
      {showQuestionEditor && (
        <QuestionEditor
          question={editingQuestion}
          questionCount={questions.length}
          shortAnswerCount={shortAnswerCount}
          onSave={editingQuestion ? updateQuestion : addQuestion}
          onClose={() => {
            setShowQuestionEditor(false);
            setEditingQuestion(undefined);
          }}
        />
      )}

      {/* ---- AI generator modal ---- */}
      {showAIGenerator && (
        <AIFormGenerator
          applicationData={{
            ...watched,
            questions,
          }}
          onImport={handleAIImport}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </>
  );
}
