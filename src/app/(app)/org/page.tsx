'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  FileText,
  HardDrive,
  Settings,
  CreditCard,
  ChevronRight,
  ArrowUpRight,
  Activity,
  UserPlus,
  FilePlus,
  Shield,
  Pencil,
  Star,
  ClipboardCheck,
  Plus,
  Mail,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { cn, formatRelativeTime, getInitials } from '@/lib/utils';

/* ── Mock Org Data ── */

const ORG = {
  name: 'Acme Corp',
  slug: 'acme-corp',
  plan: 'pro' as const,
  memberCount: 12,
  fileCount: 47,
  examCount: 8,
  storageUsed: 2.4,
  storageLimit: 10,
  storageUsedLabel: '2.4 GB',
  storageLimitLabel: '10 GB',
  createdAt: '2024-06-15T10:00:00Z',
};

/* ── Mock Activity ── */

interface ActivityItem {
  id: string;
  icon: React.ElementType;
  userName: string;
  userInitials: string;
  action: string;
  target: string;
  time: string;
  iconColor: string;
  type: 'member' | 'file' | 'exam' | 'all';
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    icon: UserPlus,
    userName: 'Sarah Mitchell',
    userInitials: 'SM',
    action: 'joined the organization',
    target: '',
    time: '2025-01-15T14:20:00Z',
    iconColor: 'text-emerald-600 bg-emerald-50',
    type: 'member',
  },
  {
    id: 'act-2',
    icon: FilePlus,
    userName: 'John Doe',
    userInitials: 'JD',
    action: "created",
    target: 'Q3 Roadmap',
    time: '2025-01-15T11:45:00Z',
    iconColor: 'text-blue-600 bg-blue-50',
    type: 'file',
  },
  {
    id: 'act-3',
    icon: Shield,
    userName: 'Admin',
    userInitials: 'AD',
    action: 'promoted',
    target: 'David Park',
    time: '2025-01-14T16:30:00Z',
    iconColor: 'text-amber-600 bg-amber-50',
    type: 'member',
  },
  {
    id: 'act-4',
    icon: Pencil,
    userName: 'Emily Zhang',
    userInitials: 'EZ',
    action: 'updated',
    target: 'Marketing Budget 2025',
    time: '2025-01-14T10:15:00Z',
    iconColor: 'text-violet-600 bg-violet-50',
    type: 'file',
  },
  {
    id: 'act-5',
    icon: Star,
    userName: 'Marcus Johnson',
    userInitials: 'MJ',
    action: 'starred',
    target: 'Frontend Developer Assessment',
    time: '2025-01-13T09:00:00Z',
    iconColor: 'text-orange-600 bg-orange-50',
    type: 'exam',
  },
  {
    id: 'act-6',
    icon: ClipboardCheck,
    userName: 'Olivia Brown',
    userInitials: 'OB',
    action: 'created exam',
    target: 'Product Knowledge Quiz',
    time: '2025-01-12T15:30:00Z',
    iconColor: 'text-rose-600 bg-rose-50',
    type: 'exam',
  },
  {
    id: 'act-7',
    icon: FilePlus,
    userName: 'James Wilson',
    userInitials: 'JW',
    action: 'created',
    target: 'Sprint Planning Notes',
    time: '2025-01-12T11:00:00Z',
    iconColor: 'text-blue-600 bg-blue-50',
    type: 'file',
  },
  {
    id: 'act-8',
    icon: UserPlus,
    userName: 'Nina Kowalski',
    userInitials: 'NK',
    action: 'joined the organization',
    target: '',
    time: '2025-01-11T09:15:00Z',
    iconColor: 'text-emerald-600 bg-emerald-50',
    type: 'member',
  },
];

/* ── Animation ── */

const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/* ── Overview Card ── */

function OverviewCard({
  value,
  label,
  trend,
}: {
  value: string | number;
  label: string;
  trend?: string;
}) {
  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <CardContent className="p-5">
        <p className="text-3xl font-bold text-[#FF3333]">{value}</p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{label}</p>
        {trend && (
          <p className="text-[10px] text-emerald-600 mt-1">+{trend} this week</p>
        )}
      </CardContent>
    </Card>
  );
}

/* ════════════════════════════════════════════════════
   ORG OVERVIEW PAGE
   ════════════════════════════════════════════════════ */

export default function OrgOverviewPage() {
  const [memberCount] = useState(ORG.memberCount);
  const [activityFilter, setActivityFilter] = useState<'all' | 'member' | 'file' | 'exam'>('all');
  const [visibleCount, setVisibleCount] = useState(5);

  const filteredActivities = MOCK_ACTIVITIES.filter(
    (a) => activityFilter === 'all' || a.type === activityFilter
  );

  const visibleActivities = filteredActivities.slice(0, visibleCount);
  const hasMore = visibleCount < filteredActivities.length;

  const storagePercent = (ORG.storageUsed / ORG.storageLimit) * 100;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="pb-16 pt-8 px-6 sm:px-10"
    >
      {/* ── Org Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#FF3333]/10 text-[#FF3333]">
            <Building2 size={28} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] truncate">
                {ORG.name}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  'uppercase text-[10px] tracking-wider font-bold',
                  ORG.plan === 'pro'
                    ? 'border-[#FF3333]/30 bg-[#FF3333]/10 text-[#FF3333]'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                )}
              >
                {ORG.plan === 'pro' ? 'PRO' : 'Free'}
              </Badge>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              {memberCount} members &middot; @{ORG.slug}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" asChild>
          <Link href="/org/settings">
            <Settings size={14} strokeWidth={2} className="mr-1.5" />
            Manage
          </Link>
        </Button>
      </div>

      {/* ── Overview Cards (4 in a row) ── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={fadeUp}>
          <OverviewCard value={ORG.fileCount} label="Total files" trend="5" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <OverviewCard value={memberCount} label="Active members" trend="2" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <OverviewCard value={ORG.examCount} label="Exams created" trend="3" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <OverviewCard value={ORG.storageUsedLabel} label="Storage used" />
        </motion.div>
      </motion.div>

      {/* ── Storage Meter ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-[var(--color-text-secondary)]" />
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Storage</span>
              </div>
              <span className="text-xs text-[var(--color-text-tertiary)]">
                {ORG.storageUsedLabel} of {ORG.storageLimitLabel} used
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${storagePercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[#FF3333] to-[#FF6666]"
              />
            </div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2">
              {(ORG.storageLimit - ORG.storageUsed).toFixed(1)} GB remaining
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Main Content: Activity Feed + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Recent Activity Feed (60%) ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-3">
          <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            <CardContent className="p-0">
              <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[var(--color-text-secondary)]" />
                  <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Recent Activity</h2>
                </div>
                <div className="flex gap-1">
                  {(['all', 'mine', 'file', 'exam'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => { setActivityFilter(f); setVisibleCount(5); }}
                      className={cn(
                        'px-2 py-1 rounded-full text-[10px] font-medium transition-colors border capitalize',
                        activityFilter === f
                          ? 'bg-[#FF3333]/10 border-[#FF3333]/30 text-[#FF3333]'
                          : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)]'
                      )}
                    >
                      {f === 'mine' ? 'My activity' : f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-[var(--color-border)]/50">
                {visibleActivities.map((activity) => {
                  const IconComp = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 px-6 py-3.5 hover:bg-[var(--color-bg-overlay)]/30 transition-colors"
                    >
                      <Avatar className="size-8 shrink-0">
                        <AvatarFallback className="text-[10px] bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]">
                          {activity.userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--color-text-primary)] truncate">
                          <span className="font-medium">{activity.userName}</span>{' '}
                          {activity.action}
                          {activity.target && (
                            <span className="font-medium text-[#FF3333]">&lsquo;{activity.target}&rsquo;</span>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--color-text-tertiary)] shrink-0">
                        {formatRelativeTime(activity.time)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="px-6 py-3 border-t border-[var(--color-border)]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-[var(--color-text-secondary)]"
                    onClick={() => setVisibleCount((v) => v + 5)}
                  >
                    Load more
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Quick Actions Panel (40%) ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--color-border)] hover:bg-[#FF3333] hover:text-white hover:border-[#FF3333] transition-colors group">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--color-bg-elevated)] group-hover:bg-white/20 transition-colors">
                    <FilePlus size={18} className="text-[var(--color-text-secondary)] group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-white transition-colors">New shared document</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] group-hover:text-white/70 transition-colors">Create a collaborative doc</p>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-[var(--color-text-tertiary)] group-hover:text-white transition-colors" />
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--color-border)] hover:bg-[#FF3333] hover:text-white hover:border-[#FF3333] transition-colors group">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--color-bg-elevated)] group-hover:bg-white/20 transition-colors">
                    <ClipboardCheck size={18} className="text-[var(--color-text-secondary)] group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-white transition-colors">New shared exam</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] group-hover:text-white/70 transition-colors">Create a team assessment</p>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-[var(--color-text-tertiary)] group-hover:text-white transition-colors" />
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--color-border)] hover:bg-[#FF3333] hover:text-white hover:border-[#FF3333] transition-colors group">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--color-bg-elevated)] group-hover:bg-white/20 transition-colors">
                    <UserPlus size={18} className="text-[var(--color-text-secondary)] group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-white transition-colors">Invite member</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] group-hover:text-white/70 transition-colors">Add someone to the team</p>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-[var(--color-text-tertiary)] group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Quick Links */}
              <Separator className="bg-[var(--color-border)] my-5" />
              <div className="space-y-2">
                <Link
                  href="/org/members"
                  className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[#FF3333] transition-colors"
                >
                  <Users size={14} />
                  Manage members
                  <ChevronRight size={12} className="ml-auto" />
                </Link>
                <Link
                  href="/org/teams"
                  className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[#FF3333] transition-colors"
                >
                  <Building2 size={14} />
                  Teams
                  <ChevronRight size={12} className="ml-auto" />
                </Link>
                <Link
                  href="/org/settings"
                  className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[#FF3333] transition-colors"
                >
                  <Settings size={14} />
                  Settings
                  <ChevronRight size={12} className="ml-auto" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
