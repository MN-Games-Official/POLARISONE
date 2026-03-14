'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  User,
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { signupSchema } from '@/lib/validation';
import { useAuth } from '@/hooks/useAuth';

// Extend the signup schema to include confirm_password
const extendedSignupSchema = signupSchema
  .extend({
    confirm_password: z.string().min(1, 'Please confirm your password'),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and conditions' }),
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type ExtendedSignupInput = z.infer<typeof extendedSignupSchema>;

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

export default function SignupForm() {
  const router = useRouter();
  const { signup, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExtendedSignupInput>({
    resolver: zodResolver(extendedSignupSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirm_password: '',
      full_name: '',
      terms: undefined as unknown as true,
    },
  });

  const watchedPassword = watch('password', '');
  const strength = useMemo(
    () => getPasswordStrength(watchedPassword),
    [watchedPassword]
  );

  const onSubmit = async (data: ExtendedSignupInput) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signup({
        email: data.email,
        username: data.username,
        password: data.password,
        full_name: data.full_name || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1419]">
        <Loading variant="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1419] px-4 py-12">
      {/* Animated background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-[#ff4b6e]/5 blur-3xl"
          style={{ animation: 'float 9s ease-in-out infinite' }}
        />
        <div
          className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#ff4b6e]/5 blur-3xl"
          style={{ animation: 'float 11s ease-in-out infinite reverse' }}
        />
        <div
          className="absolute left-1/3 top-1/3 h-48 w-48 rounded-full bg-[#ff4b6e]/3 blur-3xl"
          style={{ animation: 'pulse 7s ease-in-out infinite' }}
        />
      </div>

      {/* Card container */}
      <div
        className="relative w-full max-w-lg"
        style={{ animation: 'slideUp 0.6s ease-out' }}
      >
        {/* Gradient border glow */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#ff4b6e]/40 via-[#ff4b6e]/10 to-[#ff4b6e]/40 opacity-60 blur-[1px]" />

        {/* Glass morphism card */}
        <div className="relative rounded-2xl border border-[#2d3748]/60 bg-[#1a1f25]/90 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
          {/* Brand section */}
          <div
            className="mb-8 text-center"
            style={{ animation: 'fadeIn 0.8s ease-out 0.2s both' }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff4b6e] to-[#ff4b6e]/70 shadow-lg shadow-[#ff4b6e]/20">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#e2e8f0]">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-[#a0aec0]">
              Join{' '}
              <span className="font-semibold text-[#ff4b6e]">Polaris</span>{' '}
              and get started today
            </p>
          </div>

          {/* Success state */}
          {success && (
            <div
              className="mb-6"
              style={{ animation: 'slideUp 0.3s ease-out' }}
            >
              <Alert type="success" title="Account created!">
                Your account has been created successfully. Redirecting...
              </Alert>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div
              className="mb-6"
              style={{ animation: 'shake 0.4s ease-out' }}
            >
              <Alert type="error" title="Registration failed" dismissible onDismiss={() => setError(null)}>
                {error}
              </Alert>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            style={{ animation: 'fadeIn 0.8s ease-out 0.4s both' }}
          >
            {/* Full name field */}
            <Input
              label="Full name"
              type="text"
              placeholder="John Doe"
              iconLeft={<User size={18} />}
              error={errors.full_name?.message}
              autoComplete="name"
              disabled={isSubmitting}
              {...register('full_name')}
            />

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

            {/* Username field */}
            <Input
              label="Username"
              type="text"
              placeholder="Choose a username"
              iconLeft={<User size={18} />}
              error={errors.username?.message}
              helperText="3-20 characters, letters, numbers, and underscores only"
              autoComplete="username"
              disabled={isSubmitting}
              {...register('username')}
            />

            {/* Password field */}
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              iconLeft={<Lock size={18} />}
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="transition-colors duration-200 hover:text-[#ff4b6e]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              error={errors.password?.message}
              autoComplete="new-password"
              disabled={isSubmitting}
              {...register('password')}
            />

            {/* Password strength indicator */}
            {watchedPassword.length > 0 && (
              <div
                className="space-y-3 rounded-lg border border-[#2d3748]/60 bg-[#0f1419]/60 p-4"
                style={{ animation: 'slideUp 0.3s ease-out' }}
              >
                {/* Strength bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#a0aec0]">
                      Password strength
                    </span>
                    <span className={`text-xs font-semibold ${strength.bgColor}`}>
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
                        style={{
                          transitionDelay: `${level * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Requirements checklist */}
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
              label="Confirm password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              iconLeft={<Lock size={18} />}
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="group/check flex cursor-pointer items-start gap-3">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    className="peer sr-only"
                    {...register('terms', {
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        setAcceptedTerms(e.target.checked);
                      },
                    })}
                  />
                  <div className="h-5 w-5 rounded-md border border-[#2d3748] bg-[#0f1419] transition-all duration-200 peer-checked:border-[#ff4b6e] peer-checked:bg-[#ff4b6e] peer-focus-visible:ring-2 peer-focus-visible:ring-[#ff4b6e]/30 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-[#0f1419] group-hover/check:border-[#4a5568]">
                    <svg
                      className="h-5 w-5 text-white transition-transform duration-200"
                      style={{
                        transform: acceptedTerms ? 'scale(1)' : 'scale(0)',
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-sm leading-relaxed text-[#a0aec0] transition-colors duration-200 group-hover/check:text-[#e2e8f0]">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="font-medium text-[#ff4b6e] underline-offset-4 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="font-medium text-[#ff4b6e] underline-offset-4 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={12} />
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <div className="pt-2">
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
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </div>
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
            Already have an account?{' '}
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-semibold text-[#ff4b6e] transition-all duration-200 hover:text-[#ff6b8a] hover:underline hover:underline-offset-4"
            >
              Sign in
              <Shield size={14} />
            </Link>
          </p>
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
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
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
