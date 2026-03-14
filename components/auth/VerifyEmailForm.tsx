'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  MailCheck,
  RefreshCw,
  Sparkles,
  Shield,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { api } from '@/lib/api-client';

type VerifyStatus = 'verifying' | 'success' | 'error';

export default function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<VerifyStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const hasVerified = useRef(false);

  const verifyEmail = useCallback(async (verificationToken: string) => {
    try {
      setStatus('verifying');
      setErrorMessage('');
      await api.post('/auth/verify-email', { token: verificationToken });
      setStatus('success');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Email verification failed. The link may be invalid or expired.';
      setErrorMessage(message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (token && !hasVerified.current) {
      hasVerified.current = true;
      verifyEmail(token);
    } else if (!token) {
      setErrorMessage('No verification token provided.');
      setStatus('error');
    }
  }, [token, verifyEmail]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1419] px-4 py-12">
      {/* Animated background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-[#ff4b6e]/5 blur-3xl"
          style={{ animation: 'float 8s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[#ff4b6e]/5 blur-3xl"
          style={{ animation: 'float 10s ease-in-out infinite reverse' }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff4b6e]/3 blur-3xl"
          style={{ animation: 'pulse 6s ease-in-out infinite' }}
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
          {/* ─── Verifying state ─── */}
          {status === 'verifying' && (
            <div className="text-center" style={{ animation: 'fadeIn 0.6s ease-out' }}>
              {/* Animated ring */}
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center">
                <div
                  className="absolute h-24 w-24 rounded-full border-2 border-[#2d3748]"
                  style={{ animation: 'pulseRing 2s ease-out infinite' }}
                />
                <div
                  className="absolute h-24 w-24 rounded-full border-t-2 border-[#ff4b6e]"
                  style={{ animation: 'spin 1s linear infinite' }}
                />
                <MailCheck
                  size={36}
                  className="text-[#ff4b6e]"
                  style={{ animation: 'pulse 2s ease-in-out infinite' }}
                />
              </div>

              <h2 className="mb-2 text-xl font-bold text-[#e2e8f0]">
                Verifying your email
              </h2>
              <p className="mb-6 text-sm text-[#a0aec0]">
                Please wait while we verify your email address...
              </p>

              <Loading variant="dots" />

              {/* Progress bar */}
              <div className="mt-6">
                <Loading variant="bar" indeterminate />
              </div>
            </div>
          )}

          {/* ─── Success state ─── */}
          {status === 'success' && (
            <div
              className="text-center"
              style={{ animation: 'slideUp 0.5s ease-out' }}
            >
              {/* Animated success checkmark */}
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                {/* Outer ring */}
                <div
                  className="absolute h-24 w-24 rounded-full bg-emerald-500/5 ring-2 ring-emerald-500/20"
                  style={{ animation: 'scaleIn 0.6s ease-out' }}
                />
                {/* Inner ring */}
                <div
                  className="absolute h-16 w-16 rounded-full bg-emerald-500/10 ring-2 ring-emerald-500/30"
                  style={{ animation: 'scaleIn 0.6s ease-out 0.15s both' }}
                />
                {/* Circle background */}
                <div
                  className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20"
                  style={{ animation: 'scaleIn 0.5s ease-out 0.3s both' }}
                >
                  <CheckCircle2
                    size={28}
                    className="text-emerald-400"
                    style={{ animation: 'scaleIn 0.4s ease-out 0.5s both' }}
                  />
                </div>
              </div>

              {/* Success particles */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <Sparkles
                    key={i}
                    size={12}
                    className="absolute text-emerald-400/60"
                    style={{
                      left: `${20 + i * 12}%`,
                      top: `${15 + (i % 3) * 10}%`,
                      animation: `particleFloat ${1.5 + i * 0.3}s ease-out ${i * 0.15}s both`,
                    }}
                  />
                ))}
              </div>

              <h2 className="mb-2 text-xl font-bold text-[#e2e8f0]">
                Email verified!
              </h2>
              <p className="mb-2 text-sm text-[#a0aec0]">
                Your email address has been successfully verified. Your account
                is now fully activated.
              </p>

              <div className="mb-8 mt-6">
                <Alert type="success" title="Verification complete">
                  You can now access all features of your Polaris account.
                </Alert>
              </div>

              <Link href="/login" className="block">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-base font-semibold shadow-lg shadow-[#ff4b6e]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#ff4b6e]/30"
                  iconRight={<ArrowRight size={18} />}
                >
                  Continue to login
                </Button>
              </Link>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2d3748] to-transparent" />
                <Shield size={14} className="text-[#4a5568]" />
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2d3748] to-transparent" />
              </div>

              <p className="text-xs text-[#4a5568]">
                You can safely close this page after logging in.
              </p>
            </div>
          )}

          {/* ─── Error state ─── */}
          {status === 'error' && (
            <div
              className="text-center"
              style={{ animation: 'slideUp 0.5s ease-out' }}
            >
              {/* Error icon */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 ring-4 ring-red-500/20">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20"
                  style={{ animation: 'scaleIn 0.5s ease-out 0.2s both' }}
                >
                  <XCircle
                    size={32}
                    className="text-red-400"
                    style={{
                      animation: 'shake 0.4s ease-out 0.5s both',
                    }}
                  />
                </div>
              </div>

              <h2 className="mb-2 text-xl font-bold text-[#e2e8f0]">
                Verification failed
              </h2>
              <p className="mb-6 text-sm text-[#a0aec0]">
                We couldn&apos;t verify your email address. The verification link may
                have expired or is invalid.
              </p>

              <div className="mb-6">
                <Alert type="error" title="What happened?">
                  {errorMessage}
                </Alert>
              </div>

              <div className="flex flex-col gap-3">
                {token && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      hasVerified.current = false;
                      verifyEmail(token);
                    }}
                    iconLeft={<RefreshCw size={16} />}
                  >
                    Try again
                  </Button>
                )}

                <Link href="/login" className="block">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    iconRight={<ArrowRight size={16} />}
                  >
                    Go to login
                  </Button>
                </Link>

                <p className="mt-2 text-xs text-[#4a5568]">
                  If the problem persists, please contact support or try signing
                  up again.
                </p>
              </div>
            </div>
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
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
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
        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
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
            transform: translateX(-3px);
          }
          30%,
          70% {
            transform: translateX(3px);
          }
        }
        @keyframes particleFloat {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-15px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
}
