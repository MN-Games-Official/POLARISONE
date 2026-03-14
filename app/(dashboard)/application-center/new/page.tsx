'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  text: string;
  options?: string[];
  correct_answer?: number | string | boolean;
  max_score: number;
  grading_criteria?: string;
}

export default function NewApplicationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [passScore, setPassScore] = useState(70);
  const [primaryColor, setPrimaryColor] = useState('#ff4b6e');
  const [secondaryColor, setSecondaryColor] = useState('#1f2933');
  const [questions, setQuestions] = useState<Question[]>([]);

  function addQuestion(type: Question['type']) {
    const newQ: Question = {
      id: `q${Date.now()}`,
      type,
      text: '',
      max_score: 10,
      ...(type === 'multiple_choice' ? { options: ['', '', '', ''], correct_answer: 0 } : {}),
      ...(type === 'true_false' ? { correct_answer: true } : {}),
      ...(type === 'short_answer' ? { grading_criteria: '' } : {}),
    };
    setQuestions((prev) => [...prev, newQ]);
  }

  function updateQuestion(id: string, updates: Partial<Question>) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateOption(questionId: string, optionIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || !q.options) return q;
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      })
    );
  }

  async function handleGenerate() {
    if (!name) {
      setError('Please enter an application name first');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const data = await api.post<{ success: boolean; form: { questions: Question[] } }>(
        '/applications/generate',
        {
          name,
          description,
          group_id: groupId,
          rank: targetRole,
          questions_count: 6,
          vibe: 'professional',
          primary_color: primaryColor,
          secondary_color: secondaryColor,
        }
      );
      if (data.form?.questions) {
        setQuestions(data.form.questions);
      }
    } catch {
      setError('AI generation failed. Please add questions manually.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!name || !groupId) {
      setError('Name and Group ID are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const data = await api.post<{ success: boolean; application: { id: string } }>(
        '/applications',
        {
          name,
          description,
          group_id: groupId,
          target_role: targetRole,
          pass_score: passScore,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          questions,
        }
      );
      router.push(`/application-center/${data.application.id}`);
    } catch {
      setError('Failed to save application');
    } finally {
      setSaving(false);
    }
  }

  const shortAnswerCount = questions.filter((q) => q.type === 'short_answer').length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/application-center">
          <Button variant="ghost" size="sm" iconLeft={<ArrowLeft size={16} />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">New Application</h1>
          <p className="text-sm text-gray-400">Build your application form</p>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Basic Information</h2>
            <div className="space-y-4">
              <Input
                label="Application Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Moderator Application"
                required
              />
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this application is for..."
                rows={3}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Roblox Group ID"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  placeholder="e.g., 123456"
                  required
                />
                <Input
                  label="Target Role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., rank: 218"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label="Pass Score (%)"
                  type="number"
                  value={passScore.toString()}
                  onChange={(e) => setPassScore(parseInt(e.target.value) || 0)}
                  min={0}
                  max={100}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-lg border border-[#2d3748] bg-[#0f1419]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-lg border border-[#2d3748] bg-[#0f1419]"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Questions */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Questions ({questions.length})
              </h2>
              <Button
                variant="outline"
                size="sm"
                iconLeft={<Sparkles size={14} />}
                loading={generating}
                onClick={handleGenerate}
              >
                AI Generate
              </Button>
            </div>

            {shortAnswerCount >= 3 && (
              <Alert type="warning" className="mb-4">
                Maximum of 3 short answer questions per application.
              </Alert>
            )}

            <div className="space-y-4">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="rounded-lg border border-[#2d3748] bg-[#0f1419] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-400">
                        Q{index + 1} —{' '}
                        {q.type === 'multiple_choice'
                          ? 'Multiple Choice'
                          : q.type === 'short_answer'
                            ? 'Short Answer'
                            : 'True/False'}
                      </span>
                    </div>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <Input
                    label="Question"
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                    placeholder="Enter your question"
                  />

                  {q.type === 'multiple_choice' && q.options && (
                    <div className="mt-3 space-y-2">
                      <label className="text-xs font-medium text-gray-400">Options</label>
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct_${q.id}`}
                            checked={q.correct_answer === i}
                            onChange={() => updateQuestion(q.id, { correct_answer: i })}
                            className="accent-[#ff4b6e]"
                          />
                          <Input
                            value={opt}
                            onChange={(e) => updateOption(q.id, i, e.target.value)}
                            placeholder={`Option ${i + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'true_false' && (
                    <div className="mt-3 flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`tf_${q.id}`}
                          checked={q.correct_answer === true}
                          onChange={() => updateQuestion(q.id, { correct_answer: true })}
                          className="accent-[#ff4b6e]"
                        />
                        <span className="text-sm text-gray-300">True</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`tf_${q.id}`}
                          checked={q.correct_answer === false}
                          onChange={() => updateQuestion(q.id, { correct_answer: false })}
                          className="accent-[#ff4b6e]"
                        />
                        <span className="text-sm text-gray-300">False</span>
                      </label>
                    </div>
                  )}

                  {q.type === 'short_answer' && (
                    <div className="mt-3">
                      <Textarea
                        label="Grading Criteria"
                        value={q.grading_criteria ?? ''}
                        onChange={(e) => updateQuestion(q.id, { grading_criteria: e.target.value })}
                        placeholder="Describe criteria for grading this answer"
                        rows={2}
                      />
                    </div>
                  )}

                  <div className="mt-3">
                    <Input
                      label="Max Score"
                      type="number"
                      value={q.max_score.toString()}
                      onChange={(e) => updateQuestion(q.id, { max_score: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add question buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion('multiple_choice')}
                iconLeft={<Plus size={14} />}
              >
                Multiple Choice
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion('true_false')}
                iconLeft={<Plus size={14} />}
              >
                True/False
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion('short_answer')}
                disabled={shortAnswerCount >= 3}
                iconLeft={<Plus size={14} />}
              >
                Short Answer
              </Button>
            </div>
          </Card>
        </div>

        {/* Preview sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-24 p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Preview
            </h3>
            <div
              className="overflow-hidden rounded-lg border border-[#2d3748]"
              style={{ backgroundColor: secondaryColor }}
            >
              <div className="p-4" style={{ backgroundColor: primaryColor }}>
                <h4 className="text-sm font-bold text-white">
                  {name || 'Application Name'}
                </h4>
                <p className="mt-1 text-xs text-white/70">
                  {description || 'Application description...'}
                </p>
              </div>
              <div className="p-4 space-y-3">
                {questions.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Add questions to see them here
                  </p>
                ) : (
                  questions.slice(0, 3).map((q, i) => (
                    <div key={q.id}>
                      <p className="text-xs font-medium text-gray-300">
                        {i + 1}. {q.text || 'Question text...'}
                      </p>
                    </div>
                  ))
                )}
                {questions.length > 3 && (
                  <p className="text-xs text-gray-500">
                    +{questions.length - 3} more questions
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <Button
                className="w-full"
                onClick={handleSave}
                loading={saving}
                iconLeft={<Save size={16} />}
              >
                Save Application
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
