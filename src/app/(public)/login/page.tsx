'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { isValidEmail } from '@/lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function LoginPage() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useAuthStore((s) => s.hydrate);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  // Hydrate session on mount, redirect if already authenticated
  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!email.trim()) {
      next.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      next.email = 'Enter a valid email address';
    }
    if (!password) {
      next.password = 'Password is required';
    } else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    try {
      await signIn(email, password);
      router.push('/home');
    } catch {
      setErrors({ general: 'Invalid email or password. Please try again.' });
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--color-bg-base)] px-4 py-12">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(91,87,230,0.08),transparent)]" />

      <motion.div
        className="relative w-full max-w-md"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: 'easeOut' as const }}
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/avrythink-logo.png"
            alt="Avrythink"
            width={48}
            height={48}
            className="drop-shadow-sm"
            priority
          />
          <Link href="/" className="text-xl font-semibold tracking-tight text-[var(--color-brand)]">
            AvrythinkSuite
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-[var(--shadow-lg)]">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
              Sign in to your account
            </p>
          </div>

          {/* General error */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]"
            >
              {errors.general}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--color-text-secondary)]">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@admina.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    if (errors.general) setErrors((prev) => ({ ...prev, general: undefined }));
                  }}
                  className={`pl-10 bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] ${
                    errors.email ? 'border-[var(--color-danger)] focus-visible:border-[var(--color-danger)]' : ''
                  }`}
                  aria-invalid={!!errors.email}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--color-text-secondary)]">
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    if (errors.general) setErrors((prev) => ({ ...prev, general: undefined }));
                  }}
                  className={`pl-10 bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] ${
                    errors.password ? 'border-[var(--color-danger)] focus-visible:border-[var(--color-danger)]' : ''
                  }`}
                  aria-invalid={!!errors.password}
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="mt-2 h-11 w-full rounded-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <Separator className="bg-[var(--color-border)]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-bg-surface)] px-3 text-xs text-[var(--color-text-tertiary)]">
              or continue with
            </span>
          </div>

          {/* Google (disabled with tooltip) */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-lg font-medium bg-transparent border-[var(--color-border)] text-[var(--color-text-tertiary)] cursor-not-allowed"
            disabled
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
            <span className="ml-1.5 text-[10px]">(coming soon)</span>
          </Button>
        </div>

        {/* Bottom link */}
        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
