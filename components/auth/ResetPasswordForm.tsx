'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  KeyRound,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validation';
import { api } from '@/lib/api-client';

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  bgColor: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1)
    return { score, label: 'Weak', color: 'bg-red-500', bgColor: 'text-red-400' };
  if (score <= 2)
    return { score, label: 'Fair', color: 'bg-orange-500', bgColor: 'text-orange-400' };
  if (score <= 3)
    return { score, label: 'Good', color: 'bg-yellow-500', bgColor: 'text-yellow-400' };
  if (score <= 4)
    return { score, label: 'Strong', color: 'bg-emerald-500', bgColor: 'text-emerald-400' };
  return { score, label: 'Very Strong', color: 'bg-emerald-400', bgColor: 'text-emerald-300' };
}

const passwordRequirements = [
  { regex: /.{8,}/, label: 'At least 8 characters' },
  { regex: /[A-Z]/, label: 'One uppercase letter' },
  { regex: /[0-9]/, label: 'One number' },
  { regex: /[^a-zA-Z0-9]/, label: 'One special character' },
];

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      new_password: '',
      confirm_password: '',
    },
  });

  const watchedPassword = watch('new_password', '');
  const strength = useMemo(
    () => getPasswordStrength(watchedPassword),
    [watchedPassword]
  );

  const onSubmit = async (data: ResetPasswordInput) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', {
        token: data.token,
        new_password: data.new_password,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to reset password. The link may have expired.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1419] px-4 py-12">
        <div
          className="relative w-full max-w-md"
          style={{ animation: 'slideUp 0.6s ease-out' }}
        >
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#ff4b6e]/40 via-[#ff4b6e]/10 to-[#ff4b6e]/40 opacity-60 blur-[1px]" />
          <div className="relative rounded-2xl border border-[#2d3748]/60 bg-[#1a1f25]/90 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-4 ring-red-500/20">
              <XCircle size={32} className="text-red-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-[#e2e8f0]">
              Invalid reset link
            </h2>
            <p className="mb-6 text-sm text-[#a0aec0]">
              This password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/forgot-password" className="block">
                <Button variant="primary" size="lg" className="w-full">
                  Request new link
                </Button>
              </Link>
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
        </div>
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
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1419] px-4 py-12">
      {/* Animated background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-[#ff4b6e]/5 blur-3xl"
          style={{ animation: 'float 8s ease-in-out infinite' }}
        />
        <div
          className="absolute -right-32 bottom-1/3 h-80 w-80 rounded-full bg-[#ff4b6e]/5 blur-3xl"
          style={{ animation: 'float 10s ease-in-out infinite reverse' }}
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
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>

          {success ? (
            /* ─── Success state ─── */
            <div
              className="text-center"
              style={{ animation: 'slideUp 0.5s ease-out' }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/20">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20"
                  style={{ animation: 'scaleIn 0.5s ease-out 0.2s both' }}
                >
                  <ShieldCheck
                    size={32}
                    className="text-emerald-400"
                    style={{ animation: 'scaleIn 0.4s ease-out 0.4s both' }}
                  />
                </div>
              </div>

              <h2 className="mb-2 text-xl font-bold text-[#e2e8f0]">
                Password reset successfully!
              </h2>
              <p className="mb-6 text-sm text-[#a0aec0]">
                Your password has been updated. You can now sign in with your new
                password.
              </p>

              <Loading variant="dots" className="mb-4" />
              <p className="text-xs text-[#4a5568]">
                Redirecting to login page...
              </p>

              <div className="mt-6">
                <Link href="/login" className="block">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    iconRight={<ArrowRight size={16} />}
                  >
                    Go to login now
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
                  Set new password
                </h1>
                <p className="mt-2 text-sm text-[#a0aec0]">
                  Choose a strong password to secure your account.
                </p>
              </div>

              {/* Error state */}
              {error && (
                <div
                  className="mb-6"
                  style={{ animation: 'shake 0.4s ease-out' }}
                >
                  <Alert type="error" title="Reset failed" dismissible onDismiss={() => setError(null)}>
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
                {/* Hidden token field */}
                <input type="hidden" {...register('token')} />

                {/* New password field */}
                <Input
                  label="New password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  iconLeft={<Lock size={18} />}
                  iconRight={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="transition-colors duration-200 hover:text-[#ff4b6e]"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  }
                  error={errors.new_password?.message}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...register('new_password')}
                />

                {/* Password strength indicator */}
                {watchedPassword.length > 0 && (
                  <div
                    className="space-y-3 rounded-lg border border-[#2d3748]/60 bg-[#0f1419]/60 p-4"
                    style={{ animation: 'slideUp 0.3s ease-out' }}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#a0aec0]">
                          Password strength
                        </span>
                        <span
                          className={`text-xs font-semibold ${strength.bgColor}`}
                        >
                          {strength.label}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ease-out ${
                              level <= strength.score
                                ? strength.color
                                : 'bg-[#2d3748]'
                            }`}
                            style={{ transitionDelay: `${level * 50}ms` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {passwordRequirements.map((req) => {
                        const met = req.regex.test(watchedPassword);
                        return (
                          <div
                            key={req.label}
                            className="flex items-center gap-1.5"
                          >
                            {met ? (
                              <CheckCircle2
                                size={13}
                                className="shrink-0 text-emerald-400 transition-all duration-300"
                              />
                            ) : (
                              <XCircle
                                size={13}
                                className="shrink-0 text-[#4a5568] transition-all duration-300"
                              />
                            )}
                            <span
                              className={`text-xs transition-colors duration-300 ${
                                met ? 'text-emerald-400' : 'text-[#4a5568]'
                              }`}
                            >
                              {req.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Confirm password field */}
                <Input
                  label="Confirm new password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your new password"
                  iconLeft={<Lock size={18} />}
                  iconRight={
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="transition-colors duration-200 hover:text-[#ff4b6e]"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  }
                  error={errors.confirm_password?.message}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...register('confirm_password')}
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
                  {isSubmitting ? 'Resetting password...' : 'Reset password'}
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

              {/* Login link */}
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
