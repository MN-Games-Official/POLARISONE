'use client';

import { useState } from 'react';
import clsx from 'clsx';
import {
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  Circle,
  ListChecks,
  MessageSquare,
  ToggleLeft,
  Award,
} from 'lucide-react';

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

interface PreviewPanelProps {
  name: string;
  description: string;
  primary_color: string;
  secondary_color: string;
  questions: Question[];
}

type DeviceSize = 'mobile' | 'tablet' | 'desktop';

const DEVICE_WIDTH: Record<DeviceSize, string> = {
  mobile: 'max-w-[375px]',
  tablet: 'max-w-[768px]',
  desktop: 'max-w-full',
};

const DEVICE_ICONS: { size: DeviceSize; icon: React.ReactNode; label: string }[] = [
  { size: 'mobile', icon: <Smartphone className="h-4 w-4" />, label: 'Mobile' },
  { size: 'tablet', icon: <Tablet className="h-4 w-4" />, label: 'Tablet' },
  { size: 'desktop', icon: <Monitor className="h-4 w-4" />, label: 'Desktop' },
];

const QUESTION_TYPE_ICON: Record<Question['type'], React.ReactNode> = {
  multiple_choice: <ListChecks className="h-3.5 w-3.5" />,
  short_answer: <MessageSquare className="h-3.5 w-3.5" />,
  true_false: <ToggleLeft className="h-3.5 w-3.5" />,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(255,75,110,${alpha})`;
  return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${alpha})`;
}

/* ------------------------------------------------------------------ */
/*  Question renderers                                                 */
/* ------------------------------------------------------------------ */

function MCQuestion({
  q,
  primary,
}: {
  q: Question;
  primary: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {(q.options ?? []).map((opt, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setSelected(i)}
          className={clsx(
            'flex w-full items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-all duration-200',
            selected === i
              ? 'text-white shadow-sm'
              : 'border-[#2d3748] text-[#a0aec0] hover:border-opacity-60',
          )}
          style={
            selected === i
              ? {
                  borderColor: primary,
                  backgroundColor: hexToRgba(primary, 0.12),
                  color: primary,
                }
              : undefined
          }
        >
          <span
            className={clsx(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition',
            )}
            style={
              selected === i
                ? { borderColor: primary, backgroundColor: primary }
                : { borderColor: '#4a5568' }
            }
          >
            {selected === i && <CheckCircle2 className="h-3 w-3 text-white" />}
          </span>
          {opt || <span className="italic text-[#4a5568]">Option {i + 1}</span>}
        </button>
      ))}
    </div>
  );
}

function SAQuestion({ primary }: { primary: string }) {
  return (
    <textarea
      readOnly
      rows={3}
      placeholder="Type your answer here…"
      className="w-full resize-none rounded-lg border border-[#2d3748] bg-[#0f1419]/50 px-3 py-2 text-sm text-[#a0aec0] outline-none transition placeholder:text-[#4a5568]"
      style={{ '--tw-ring-color': hexToRgba(primary, 0.3) } as React.CSSProperties}
    />
  );
}

function TFQuestion({ primary }: { primary: string }) {
  const [selected, setSelected] = useState<boolean | null>(null);

  return (
    <div className="grid grid-cols-2 gap-2">
      {[true, false].map((val) => {
        const isSelected = selected === val;
        return (
          <button
            key={String(val)}
            type="button"
            onClick={() => setSelected(val)}
            className={clsx(
              'rounded-lg border py-2.5 text-center text-sm font-medium transition-all duration-200',
              isSelected
                ? 'shadow-sm'
                : 'border-[#2d3748] text-[#a0aec0] hover:border-opacity-60',
            )}
            style={
              isSelected
                ? {
                    borderColor: primary,
                    backgroundColor: hexToRgba(primary, 0.12),
                    color: primary,
                  }
                : undefined
            }
          >
            {val ? 'True' : 'False'}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function PreviewPanel({
  name,
  description,
  primary_color,
  secondary_color,
  questions,
}: PreviewPanelProps) {
  const [device, setDevice] = useState<DeviceSize>('desktop');

  const totalScore = questions.reduce((s, q) => s + q.max_score, 0);

  return (
    <div className="flex flex-col items-center">
      {/* Device toggle */}
      <div className="mb-4 inline-flex overflow-hidden rounded-lg border border-[#2d3748]">
        {DEVICE_ICONS.map(({ size, icon, label }) => (
          <button
            key={size}
            type="button"
            onClick={() => setDevice(size)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs transition',
              device === size
                ? 'bg-[#ff4b6e]/10 text-[#ff4b6e]'
                : 'text-[#a0aec0] hover:text-[#e2e8f0]',
            )}
            aria-label={label}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Preview frame */}
      <div
        className={clsx(
          'w-full rounded-2xl border border-[#2d3748] shadow-xl transition-all duration-500',
          DEVICE_WIDTH[device],
        )}
        style={{ backgroundColor: secondary_color }}
      >
        {/* ---- Header ---- */}
        <div
          className="relative overflow-hidden rounded-t-2xl px-6 pb-8 pt-10"
          style={{
            background: `linear-gradient(135deg, ${primary_color}, ${hexToRgba(primary_color, 0.7)})`,
          }}
        >
          {/* decorative circles */}
          <div
            className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20"
            style={{ backgroundColor: secondary_color }}
          />
          <div
            className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full opacity-10"
            style={{ backgroundColor: secondary_color }}
          />

          <h2 className="relative text-xl font-bold text-white">
            {name || 'Application Form'}
          </h2>
          {description && (
            <p className="relative mt-2 text-sm leading-relaxed text-white/80">
              {description}
            </p>
          )}
        </div>

        {/* ---- Body ---- */}
        <div className="space-y-5 px-6 py-6">
          {questions.length === 0 ? (
            <div className="py-12 text-center">
              <Circle className="mx-auto mb-3 h-10 w-10 text-[#4a5568]" />
              <p className="text-sm text-[#4a5568]">
                Questions will appear here as you add them.
              </p>
            </div>
          ) : (
            questions.map((q, i) => (
              <div
                key={q.id}
                className="animate-[fadeInUp_0.4s_ease_both] rounded-xl border border-[#2d3748] bg-[#0f1419]/40 p-4"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Question header */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-white"
                      style={{ backgroundColor: primary_color }}
                    >
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    </span>
                    <p className="text-sm font-medium text-[#e2e8f0]">
                      {q.text || 'Untitled question'}
                    </p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-[10px] text-[#4a5568]">
                    {QUESTION_TYPE_ICON[q.type]}
                  </span>
                </div>

                {/* Question body */}
                {q.type === 'multiple_choice' && (
                  <MCQuestion q={q} primary={primary_color} />
                )}
                {q.type === 'short_answer' && (
                  <SAQuestion primary={primary_color} />
                )}
                {q.type === 'true_false' && (
                  <TFQuestion primary={primary_color} />
                )}

                {/* Score tag */}
                <div className="mt-3 text-right">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: hexToRgba(primary_color, 0.1),
                      color: primary_color,
                    }}
                  >
                    {q.max_score} pts
                  </span>
                </div>
              </div>
            ))
          )}

          {/* ---- Score summary ---- */}
          {questions.length > 0 && (
            <div
              className="flex items-center justify-between rounded-xl border p-4"
              style={{
                borderColor: hexToRgba(primary_color, 0.3),
                backgroundColor: hexToRgba(primary_color, 0.05),
              }}
            >
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" style={{ color: primary_color }} />
                <span className="text-sm font-medium text-[#e2e8f0]">
                  Total Score
                </span>
              </div>
              <span
                className="text-lg font-bold"
                style={{ color: primary_color }}
              >
                {totalScore} pts
              </span>
            </div>
          )}

          {/* Submit button */}
          {questions.length > 0 && (
            <button
              type="button"
              className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: primary_color,
                boxShadow: `0 4px 14px ${hexToRgba(primary_color, 0.35)}`,
              }}
            >
              Submit Application
            </button>
          )}
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
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
