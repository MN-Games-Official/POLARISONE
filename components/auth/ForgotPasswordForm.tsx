'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Send,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/lib/validation';
import { api } from '@/lib/api-client';

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSentEmail(data.email);
      setEmailSent(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to send reset email. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1419] px-4 py-12">
      {/* Animated background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-[#ff4b6e]/5 blur-3xl"
          style={{ animation: 'float 9s ease-in-out infinite' }}
        />
        <div
          className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-[#ff4b6e]/5 blur-3xl"
          style={{ animation: 'float 11s ease-in-out infinite reverse' }}
        />
      </div>

      {/* Card container */}
      <div
        className="relative w-full max-w-md"
        style={{ animation: 'slideUp 0.6s ease-out' }}
      >
        {/* Gradient border glow */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#ff4b6e]/40 via-[#ff4b6e]/10 to-[#ff4b6e]/40 opacity-60 blur-[1px]" />

        {/* Glass morphism card */}
        <div className="relative rounded-2xl border border-[#2d3748]/60 bg-[#1a1f25]/90 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
          {/* Back to login */}
          <Link
            href="/login"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#a0aec0] transition-colors duration-200 hover:text-[#ff4b6e]"
            style={{ animation: 'fadeIn 0.6s ease-out' }}
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>

          {emailSent ? (
            /* ─── Success state ─── */
            <div
              className="text-center"
              style={{ animation: 'slideUp 0.5s ease-out' }}
            >
              {/* Animated checkmark */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/20">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20"
                  style={{ animation: 'scaleIn 0.5s ease-out 0.2s both' }}
                >
                  <CheckCircle2
                    size={32}
                    className="text-emerald-400"
                    style={{ animation: 'scaleIn 0.4s ease-out 0.4s both' }}
                  />
                </div>
              </div>

              <h2 className="mb-2 text-xl font-bold text-[#e2e8f0]">
                Check your email
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-[#a0aec0]">
                We&apos;ve sent a password reset link to{' '}
                <span className="font-semibold text-[#ff4b6e]">
                  {sentEmail}
                </span>
                . The link will expire in 1 hour.
              </p>

              <Alert type="info" title="Didn't receive the email?">
                Check your spam folder or try again with a different email
                address.
              </Alert>

              <div className="mt-8 flex flex-col gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setEmailSent(false);
                    setSentEmail('');
                  }}
                  iconLeft={<Send size={16} />}
                >
                  Send again
                </Button>
                <Link href="/login" className="block">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full"
                    iconLeft={<ArrowLeft size={16} />}
                  >
                    Return to login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* ─── Form state ─── */
            <>
              {/* Brand section */}
              <div
                className="mb-8 text-center"
                style={{ animation: 'fadeIn 0.8s ease-out 0.2s both' }}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff4b6e] to-[#ff4b6e]/70 shadow-lg shadow-[#ff4b6e]/20">
                  <KeyRound className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#e2e8f0]">
                  Forgot your password?
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[#a0aec0]">
                  No worries! Enter your email and we&apos;ll send you a link to
                  reset your password.
                </p>
              </div>

              {/* Error state */}
              {error && (
                <div
                  className="mb-6"
                  style={{ animation: 'shake 0.4s ease-out' }}
                >
                  <Alert type="error" title="Error" dismissible onDismiss={() => setError(null)}>
                    {error}
                  </Alert>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
                style={{ animation: 'fadeIn 0.8s ease-out 0.4s both' }}
              >
                {/* Email field */}
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  iconLeft={<Mail size={18} />}
                  error={errors.email?.message}
                  autoComplete="email"
                  disabled={isSubmitting}
                  {...register('email')}
                />

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  className="w-full text-base font-semibold shadow-lg shadow-[#ff4b6e]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#ff4b6e]/30"
                  iconRight={
                    !isSubmitting ? <ArrowRight size={18} /> : undefined
                  }
                >
                  {isSubmitting ? 'Sending link...' : 'Send reset link'}
                </Button>
              </form>

              {/* Divider */}
              <div
                className="my-8 flex items-center gap-4"
                style={{ animation: 'fadeIn 0.8s ease-out 0.6s both' }}
              >
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2d3748] to-transparent" />
                <Sparkles size={14} className="text-[#4a5568]" />
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2d3748] to-transparent" />
              </div>

              {/* Back to login */}
              <p
                className="text-center text-sm text-[#a0aec0]"
                style={{ animation: 'fadeIn 0.8s ease-out 0.8s both' }}
              >
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 font-semibold text-[#ff4b6e] transition-all duration-200 hover:text-[#ff6b8a] hover:underline hover:underline-offset-4"
                >
                  Sign in
                  <ArrowRight size={14} />
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          50%,
          90% {
            transform: translateX(-4px);
          }
          30%,
          70% {
            transform: translateX(4px);
          }
        }
      `}</style>
    </div>
  );
}
