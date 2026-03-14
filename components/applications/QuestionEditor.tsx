'use client';

import { useState, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import {
  ListChecks,
  MessageSquare,
  ToggleLeft,
  Plus,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

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

interface QuestionEditorProps {
  question?: Question;
  shortAnswerCount: number;
  onSave: (question: Question) => void;
  onClose: () => void;
}

type QuestionType = Question['type'];

const TYPE_OPTIONS: {
  type: QuestionType;
  label: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
  {
    type: 'multiple_choice',
    label: 'Multiple Choice',
    icon: <ListChecks className="h-5 w-5" />,
    desc: 'Applicant picks one option',
  },
  {
    type: 'short_answer',
    label: 'Short Answer',
    icon: <MessageSquare className="h-5 w-5" />,
    desc: 'Free-text response (max 3)',
  },
  {
    type: 'true_false',
    label: 'True / False',
    icon: <ToggleLeft className="h-5 w-5" />,
    desc: 'Binary true or false answer',
  },
];

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/* ------------------------------------------------------------------ */
/*  Question preview                                                   */
/* ------------------------------------------------------------------ */

function QuestionPreview({ data }: { data: Partial<Question> }) {
  return (
    <div className="rounded-lg border border-[#2d3748] bg-[#0f1419]/60 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#4a5568]">
        <Eye className="h-3 w-3" /> Preview
      </div>

      {data.text ? (
        <p className="mb-3 text-sm font-medium text-[#e2e8f0]">{data.text}</p>
      ) : (
        <p className="mb-3 text-sm italic text-[#4a5568]">
          Question text will appear here…
        </p>
      )}

      {data.type === 'multiple_choice' &&
        data.options &&
        data.options.length > 0 && (
          <div className="space-y-1.5">
            {data.options.map((opt, i) => (
              <label
                key={i}
                className={clsx(
                  'flex cursor-default items-center gap-2 rounded-lg border px-3 py-2 text-sm transition',
                  data.correct_answer === i
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                    : 'border-[#2d3748] text-[#a0aec0]',
                )}
              >
                <span
                  className={clsx(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                    data.correct_answer === i
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-[#4a5568]',
                  )}
                >
                  {data.correct_answer === i && (
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  )}
                </span>
                {opt || <span className="italic text-[#4a5568]">Empty option</span>}
              </label>
            ))}
          </div>
        )}

      {data.type === 'short_answer' && (
        <div className="rounded-lg border border-dashed border-[#2d3748] p-3 text-xs text-[#4a5568]">
          Applicant will type their answer here…
        </div>
      )}

      {data.type === 'true_false' && (
        <div className="flex gap-2">
          {['True', 'False'].map((v) => (
            <div
              key={v}
              className={clsx(
                'flex-1 rounded-lg border px-3 py-2 text-center text-sm transition',
                String(data.correct_answer) === v.toLowerCase()
                  ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                  : 'border-[#2d3748] text-[#a0aec0]',
              )}
            >
              {v}
            </div>
          ))}
        </div>
      )}

      {data.max_score !== undefined && data.max_score > 0 && (
        <div className="mt-3 text-right text-xs text-[#4a5568]">
          Max score: <span className="text-[#a0aec0]">{data.max_score} pts</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function QuestionEditor({
  question,
  shortAnswerCount,
  onSave,
  onClose,
}: QuestionEditorProps) {
  const isEdit = !!question;

  const [type, setType] = useState<QuestionType>(question?.type ?? 'multiple_choice');
  const [text, setText] = useState(question?.text ?? '');
  const [options, setOptions] = useState<string[]>(
    question?.options ?? ['', ''],
  );
  const [correctMC, setCorrectMC] = useState<number>(
    typeof question?.correct_answer === 'number' ? question.correct_answer : 0,
  );
  const [correctTF, setCorrectTF] = useState<boolean>(
    typeof question?.correct_answer === 'boolean'
      ? question.correct_answer
      : true,
  );
  const [gradingCriteria, setGradingCriteria] = useState(
    question?.grading_criteria ?? '',
  );
  const [maxScore, setMaxScore] = useState(question?.max_score ?? 10);

  /* ---- Validation ---- */
  const validationErrors = useMemo(() => {
    const errs: string[] = [];
    if (!text.trim()) errs.push('Question text is required.');
    if (maxScore < 0) errs.push('Max score must be >= 0.');
    if (
      type === 'short_answer' &&
      !isEdit &&
      shortAnswerCount >= 3
    ) {
      errs.push('Maximum 3 short-answer questions allowed per application.');
    }
    if (type === 'multiple_choice') {
      if (options.length < 2) errs.push('At least 2 options are required.');
      if (options.some((o) => !o.trim()))
        errs.push('All options must have text.');
    }
    return errs;
  }, [text, maxScore, type, options, shortAnswerCount, isEdit]);

  const canSave = validationErrors.length === 0;

  /* ---- Option management ---- */
  const addOption = useCallback(() => {
    setOptions((prev) => [...prev, '']);
  }, []);

  const removeOption = useCallback(
    (idx: number) => {
      setOptions((prev) => prev.filter((_, i) => i !== idx));
      if (correctMC >= options.length - 1) setCorrectMC(0);
    },
    [correctMC, options.length],
  );

  const updateOption = useCallback((idx: number, val: string) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));
  }, []);

  /* ---- Save handler ---- */
  const handleSave = () => {
    if (!canSave) return;

    const q: Question = {
      id: question?.id ?? uid(),
      type,
      text: text.trim(),
      max_score: maxScore,
    };

    if (type === 'multiple_choice') {
      q.options = options;
      q.correct_answer = correctMC;
    } else if (type === 'true_false') {
      q.correct_answer = correctTF;
    } else {
      q.grading_criteria = gradingCriteria;
    }

    onSave(q);
  };

  /* ---- Build preview data ---- */
  const previewData: Partial<Question> = {
    type,
    text,
    max_score: maxScore,
    ...(type === 'multiple_choice' && { options, correct_answer: correctMC }),
    ...(type === 'true_false' && { correct_answer: correctTF }),
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Edit Question' : 'Add Question'}
      size="lg"
    >
      <div className="space-y-5">
        {/* ---- Type selector ---- */}
        <div>
          <p className="mb-2 text-xs font-medium text-[#a0aec0]">
            Question Type
          </p>
          <div className="grid grid-cols-3 gap-2">
            {TYPE_OPTIONS.map((opt) => {
              const disabled =
                opt.type === 'short_answer' &&
                !isEdit &&
                shortAnswerCount >= 3;

              return (
                <button
                  key={opt.type}
                  type="button"
                  disabled={disabled}
                  onClick={() => setType(opt.type)}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-200',
                    type === opt.type
                      ? 'border-[#ff4b6e]/50 bg-[#ff4b6e]/10 text-[#ff4b6e] shadow-sm shadow-[#ff4b6e]/10'
                      : disabled
                        ? 'cursor-not-allowed border-[#2d3748] text-[#4a5568] opacity-50'
                        : 'border-[#2d3748] text-[#a0aec0] hover:border-[#ff4b6e]/30 hover:text-[#e2e8f0]',
                  )}
                >
                  {opt.icon}
                  <span className="text-xs font-medium">{opt.label}</span>
                  <span className="text-[10px] leading-tight text-[#4a5568]">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---- Question text ---- */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[#a0aec0]">
            Question Text
          </label>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your question…"
            className="w-full resize-none rounded-lg border border-[#2d3748] bg-[#0f1419] px-3 py-2 text-sm text-[#e2e8f0] outline-none transition placeholder:text-[#4a5568] focus:border-[#ff4b6e]/50 focus:ring-1 focus:ring-[#ff4b6e]/30"
          />
        </div>

        {/* ---- Conditional fields ---- */}

        {/* Multiple choice options */}
        {type === 'multiple_choice' && (
          <div>
            <label className="mb-2 block text-xs font-medium text-[#a0aec0]">
              Options{' '}
              <span className="text-[#4a5568]">
                (select the correct answer)
              </span>
            </label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectMC(i)}
                    className={clsx(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition',
                      correctMC === i
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-[#4a5568] hover:border-[#a0aec0]',
                    )}
                    aria-label={`Mark option ${i + 1} as correct`}
                  >
                    {correctMC === i && (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 rounded-lg border border-[#2d3748] bg-[#0f1419] px-3 py-1.5 text-sm text-[#e2e8f0] outline-none transition placeholder:text-[#4a5568] focus:border-[#ff4b6e]/50"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="rounded p-1 text-[#a0aec0] transition hover:text-red-400"
                      aria-label="Remove option"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="mt-2 flex items-center gap-1 text-xs text-[#ff4b6e] transition hover:text-[#e8435f]"
            >
              <Plus className="h-3.5 w-3.5" /> Add option
            </button>
          </div>
        )}

        {/* Short answer grading criteria */}
        {type === 'short_answer' && (
          <div>
            <label className="mb-1 block text-xs font-medium text-[#a0aec0]">
              Grading Criteria{' '}
              <span className="text-[#4a5568]">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={gradingCriteria}
              onChange={(e) => setGradingCriteria(e.target.value)}
              placeholder="Describe what constitutes a good answer…"
              className="w-full resize-none rounded-lg border border-[#2d3748] bg-[#0f1419] px-3 py-2 text-sm text-[#e2e8f0] outline-none transition placeholder:text-[#4a5568] focus:border-[#ff4b6e]/50 focus:ring-1 focus:ring-[#ff4b6e]/30"
            />
          </div>
        )}

        {/* True/false selector */}
        {type === 'true_false' && (
          <div>
            <label className="mb-2 block text-xs font-medium text-[#a0aec0]">
              Correct Answer
            </label>
            <div className="flex gap-3">
              {[
                { label: 'True', value: true },
                { label: 'False', value: false },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setCorrectTF(value)}
                  className={clsx(
                    'flex-1 rounded-xl border py-3 text-sm font-medium transition-all duration-200',
                    correctTF === value
                      ? 'border-[#ff4b6e]/50 bg-[#ff4b6e]/10 text-[#ff4b6e] shadow-sm shadow-[#ff4b6e]/10'
                      : 'border-[#2d3748] text-[#a0aec0] hover:border-[#ff4b6e]/30 hover:text-[#e2e8f0]',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---- Max score ---- */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[#a0aec0]">
            Max Score
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={maxScore}
            onChange={(e) => setMaxScore(Number(e.target.value))}
            className="w-24 rounded-lg border border-[#2d3748] bg-[#0f1419] px-3 py-1.5 text-sm text-[#e2e8f0] outline-none transition focus:border-[#ff4b6e]/50 focus:ring-1 focus:ring-[#ff4b6e]/30"
          />
        </div>

        {/* ---- Preview ---- */}
        <QuestionPreview data={previewData} />

        {/* ---- Validation errors ---- */}
        {validationErrors.length > 0 && (
          <div className="space-y-1">
            {validationErrors.map((err, i) => (
              <p
                key={i}
                className="flex items-center gap-1 text-xs text-red-400"
              >
                <AlertCircle className="h-3 w-3 shrink-0" /> {err}
              </p>
            ))}
          </div>
        )}

        {/* ---- Actions ---- */}
        <div className="flex justify-end gap-3 border-t border-[#2d3748] pt-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="mr-1 h-4 w-4" /> Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!canSave}
            className="shadow-md shadow-[#ff4b6e]/20"
          >
            <Save className="mr-1 h-4 w-4" />{' '}
            {isEdit ? 'Update Question' : 'Add Question'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
