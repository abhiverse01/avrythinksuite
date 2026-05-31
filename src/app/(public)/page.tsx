'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import {
  FileText,
  Table2,
  Presentation,
  Paintbrush,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ── Logo Component using the actual project logo ── */

function AvryLogo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/avrythink-logo.png"
      alt="Avrythink Suite logo"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      priority
    />
  );
}

/* ── Animation Variants ── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const logoCardVariant: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

/* ── Feature card data ── */

const features = [
  {
    icon: FileText,
    name: 'Docs',
    description: 'Write and collaborate',
    route: '/docs',
  },
  {
    icon: Table2,
    name: 'Sheets',
    description: 'Formulas, data, charts',
    route: '/sheets',
  },
  {
    icon: Presentation,
    name: 'Slides',
    description: 'Present anything',
    route: '/slides',
  },
  {
    icon: Paintbrush,
    name: 'Canvas',
    description: 'Draw and design',
    route: '/canvas',
  },
  {
    icon: ClipboardCheck,
    name: 'Examiner',
    description: 'Build exams, collect answers',
    route: '/examiner',
  },
] as const;

/* ── Footer links ── */

const footerLinks = ['Product', 'Features', 'Pricing', 'Security', 'Privacy'] as const;

/* ── Component ── */

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-base)]">
      {/* ─── Sticky Nav ─── */}
      <nav className="sticky top-0 z-40 h-14 border-b border-[var(--color-border)] bg-[rgba(255,255,255,0.85)] backdrop-blur-xl dark:bg-[rgba(10,10,10,0.90)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          {/* Left: Logo + brand text */}
          <Link href="/" className="flex items-center gap-2">
            <AvryLogo size={28} />
            <span className="text-lg font-semibold text-[var(--color-text-primary)]">
              avrythink
            </span>
            <span className="text-lg font-light text-[var(--color-text-secondary)]">
              suite
            </span>
          </Link>

          {/* Right: Auth buttons */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/login')}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Sign in
            </Button>
            <Button
              size="sm"
              onClick={() => router.push('/signup')}
              className="bg-[#FF3333] text-sm text-white hover:bg-[#E82B2B]"
            >
              Get started
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="flex min-h-[80vh] items-center px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-0 sm:gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: Logo Card (desktop only) */}
          <motion.div
            className="hidden justify-center lg:flex"
            variants={logoCardVariant}
            initial="hidden"
            animate="visible"
          >
            <div className="flex size-[180px] items-center justify-center rounded-[20px] bg-[#0A0A0A] sm:size-[220px]">
              <AvryLogo size={140} className="logo-breathe" />
            </div>
          </motion.div>

          {/* Right: Text Content */}
          <motion.div
            className="flex flex-col"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Mobile-only inline logo */}
            <motion.div
              className="mb-6 flex items-center gap-3 lg:hidden"
              variants={scaleUp}
              transition={{ duration: 0.4 }}
            >
              <AvryLogo size={40} />
              <span className="text-2xl font-semibold text-[#FF3333]">
                avrythink
              </span>
              <span className="text-2xl font-light text-[var(--color-text-secondary)]">
                suite
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              className="flex items-baseline gap-0"
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-3xl font-semibold text-[#FF3333] sm:text-4xl lg:text-[42px]">
                avrythink
              </span>
              <span className="text-3xl font-light text-[var(--color-text-secondary)] sm:text-4xl lg:text-[42px]">
                suite
              </span>
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="mt-4 max-w-[360px] text-sm leading-[1.7] text-[var(--color-text-secondary)] sm:max-w-[420px]"
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              Everything you need to work, in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <Button
                size="lg"
                onClick={() => router.push('/signup')}
                className={cn(
                  'h-11 rounded-lg px-5 font-medium text-white sm:px-7',
                  'bg-[#FF3333] hover:-translate-y-px hover:bg-[#E82B2B]',
                  'transition-all duration-200',
                )}
              >
                Get started free
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={cn(
                  'h-11 rounded-lg border-[1.5px] border-[rgba(255,51,51,0.35)] bg-transparent px-5 font-medium text-[#FF3333] sm:px-7',
                  'hover:-translate-y-px hover:border-[#FF3333] hover:bg-[var(--brand-muted)]',
                  'transition-all duration-200',
                )}
              >
                See what&apos;s inside
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features Strip ─── */}
      <section id="features" className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          {/* Section Heading */}
          <motion.p
            className="mb-10 text-center text-sm uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            EVERYTHING IN ONE SUITE
          </motion.p>

          {/* Feature Cards Grid */}
          <motion.div
            className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {features.map((feature) => (
              <motion.button
                key={feature.name}
                type="button"
                className={cn(
                  'flex cursor-pointer flex-col items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 text-center transition-all duration-200 sm:p-6',
                  'hover:-translate-y-0.5 hover:border-[var(--brand-border)] hover:bg-[var(--brand-muted)]',
                )}
                variants={fadeUp}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => router.push(feature.route)}
              >
                <feature.icon className="mb-2.5 h-5 w-5 text-[#FF3333] sm:mb-3 sm:h-6 sm:w-6" />
                <span className="text-sm font-medium text-[var(--color-text-primary)] sm:text-base">
                  {feature.name}
                </span>
                <span className="mt-0.5 text-[11px] leading-snug text-[var(--color-text-secondary)] sm:mt-1 sm:text-[13px]">
                  {feature.description}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Subtle horizontal rule ─── */}
      <div className="mx-auto max-w-5xl my-10 h-px bg-[var(--color-border)]" />

      {/* ─── Footer ─── */}
      <footer className="mt-auto border-t border-[var(--color-border)] py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:gap-6 sm:px-6">
          {/* Left: Small logo + brand */}
          <Link href="/" className="flex items-center gap-2">
            <AvryLogo size={20} />
            <span className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">
              AvrythinkSuite
            </span>
          </Link>

          {/* Center: Footer links */}
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-6">
            {footerLinks.map((link) => (
              <button
                key={link}
                type="button"
                className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                {link}
              </button>
            ))}
          </nav>

          {/* Right: Copyright */}
          <p className="text-xs text-[var(--color-text-tertiary)]">
            &copy; {new Date().getFullYear()} AvrythinkSuite
          </p>
        </div>
      </footer>
    </div>
  );
}
