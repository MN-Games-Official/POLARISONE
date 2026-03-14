'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { loginSchema, type LoginInput } from '@/lib/validation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginForm() {
  const router = useRouter();
  const { login, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      if (rememberMe) {
        localStorage.setItem('polaris_remember_me', 'true');
      } else {
        localStorage.removeItem('polaris_remember_me');
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
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
          className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#ff4b6e]/5 blur-3xl"
          style={{ animation: 'float 8s ease-in-out infinite' }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#ff4b6e]/5 blur-3xl"
          style={{ animation: 'float 10s ease-in-out infinite reverse' }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff4b6e]/3 blur-3xl"
          style={{ animation: 'pulse 6s ease-in-out infinite' }}
        />
      </div>

      {/* Card container with gradient border */}
      <div
        className="relative w-full max-w-md"
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
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#e2e8f0]">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-[#a0aec0]">
              Sign in to your{' '}
              <span className="font-semibold text-[#ff4b6e]">Polaris</span>{' '}
              account
            </p>
          </div>

          {/* Success state */}
          {success && (
            <div
              className="mb-6"
              style={{ animation: 'slideUp 0.3s ease-out' }}
            >
              <Alert type="success" title="Login successful!">
                Redirecting you to the dashboard...
              </Alert>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div
              className="mb-6"
              style={{ animation: 'shake 0.4s ease-out' }}
            >
              <Alert type="error" title="Authentication failed" dismissible onDismiss={() => setError(null)}>
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
            <div className="group">
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
            </div>

            {/* Password field */}
            <div className="group">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
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
                autoComplete="current-password"
                disabled={isSubmitting}
                {...register('password')}
              />
            </div>

            {/* Remember me & Forgot password row */}
            <div className="flex items-center justify-between">
              <label className="group/check flex cursor-pointer items-center gap-2.5">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-5 rounded-md border border-[#2d3748] bg-[#0f1419] transition-all duration-200 peer-checked:border-[#ff4b6e] peer-checked:bg-[#ff4b6e] peer-focus-visible:ring-2 peer-focus-visible:ring-[#ff4b6e]/30 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-[#0f1419] group-hover/check:border-[#4a5568]">
                    <svg
                      className="h-5 w-5 scale-0 text-white transition-transform duration-200 peer-checked:scale-100"
                      style={{
                        transform: rememberMe ? 'scale(1)' : 'scale(0)',
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
                <span className="text-sm text-[#a0aec0] transition-colors duration-200 group-hover/check:text-[#e2e8f0]">
                  Remember me
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#ff4b6e] transition-all duration-200 hover:text-[#ff6b8a] hover:underline hover:underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full text-base font-semibold shadow-lg shadow-[#ff4b6e]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#ff4b6e]/30"
              iconRight={!isSubmitting ? <ArrowRight size={18} /> : undefined}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
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

          {/* Sign up link */}
          <p
            className="text-center text-sm text-[#a0aec0]"
            style={{ animation: 'fadeIn 0.8s ease-out 0.8s both' }}
          >
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 font-semibold text-[#ff4b6e] transition-all duration-200 hover:text-[#ff6b8a] hover:underline hover:underline-offset-4"
            >
              Create account
              <LogIn size={14} />
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
