'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  UserPlus,
  MoreHorizontal,
  Trash2,
  ChevronDown,
  ChevronUp,
  Send,
  X,
  Users,
  Shield,
  Clock,
  Mail,
  MailCheck,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { cn, formatDate, formatRelativeTime, getInitials } from '@/lib/utils';
import type { OrgRole } from '@/lib/types';

/* ── Types ── */

interface Member {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: OrgRole;
  joined_at: string;
  lastActive: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: OrgRole;
  sent_at: string;
}

/* ── Mock Data ── */

const MOCK_MEMBERS: Member[] = [
  { id: 'm-1', name: 'Alex Rivera', email: 'alex.rivera@acme.co', avatar_url: null, role: 'owner', joined_at: '2024-06-15T10:00:00Z', lastActive: '2025-01-15T14:20:00Z' },
  { id: 'm-2', name: 'Sarah Mitchell', email: 'sarah.m@acme.co', avatar_url: null, role: 'admin', joined_at: '2024-07-20T14:00:00Z', lastActive: '2025-01-15T11:00:00Z' },
  { id: 'm-3', name: 'Marcus Johnson', email: 'marcus.j@acme.co', avatar_url: null, role: 'admin', joined_at: '2024-08-10T09:30:00Z', lastActive: '2025-01-14T16:30:00Z' },
  { id: 'm-4', name: 'Emily Zhang', email: 'emily.z@acme.co', avatar_url: null, role: 'member', joined_at: '2024-09-05T11:15:00Z', lastActive: '2025-01-14T10:15:00Z' },
  { id: 'm-5', name: 'David Park', email: 'david.p@acme.co', avatar_url: null, role: 'member', joined_at: '2024-10-01T08:45:00Z', lastActive: '2025-01-13T09:00:00Z' },
  { id: 'm-6', name: 'Olivia Brown', email: 'olivia.b@acme.co', avatar_url: null, role: 'member', joined_at: '2024-10-22T16:00:00Z', lastActive: '2025-01-12T15:30:00Z' },
  { id: 'm-7', name: 'James Wilson', email: 'james.w@acme.co', avatar_url: null, role: 'viewer', joined_at: '2024-11-15T10:30:00Z', lastActive: '2025-01-11T09:15:00Z' },
  { id: 'm-8', name: 'Nina Kowalski', email: 'nina.k@acme.co', avatar_url: null, role: 'viewer', joined_at: '2024-12-03T13:20:00Z', lastActive: '2025-01-10T14:00:00Z' },
  { id: 'm-9', name: 'Tom Harris', email: 'tom.h@acme.co', avatar_url: null, role: 'member', joined_at: '2024-12-15T08:00:00Z', lastActive: '2025-01-09T11:45:00Z' },
];

const INITIAL_PENDING_INVITES: PendingInvite[] = [
  { id: 'inv-1', email: 'new.recruit@acme.co', role: 'member', sent_at: '2025-01-14T10:00:00Z' },
  { id: 'inv-2', email: 'contractor@external.dev', role: 'viewer', sent_at: '2025-01-13T15:30:00Z' },
  { id: 'inv-3', email: 'intern.summer@university.edu', role: 'viewer', sent_at: '2025-01-12T09:00:00Z' },
];

/* ── Helpers ── */

const ROLE_CONFIG: Record<OrgRole, { label: string; className: string }> = {
  owner: { label: 'Owner', className: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] border-[var(--color-accent)]/30' },
  admin: { label: 'Admin', className: 'bg-[#FF3333]/10 text-[#FF3333] border-[#FF3333]/30' },
  member: { label: 'Member', className: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border-[var(--color-border)]' },
  viewer: { label: 'Viewer', className: 'bg-[var(--color-bg-base)] text-[var(--color-text-tertiary)] border-[var(--color-border)]' },
};

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

/* ── Filter Pills ── */

const MEMBER_FILTERS: { value: 'all' | 'admin' | 'member' | 'viewer'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'admin', label: 'Admins' },
  { value: 'member', label: 'Members' },
  { value: 'viewer', label: 'Viewers' },
];

/* ════════════════════════════════════════════════════
   MEMBER MANAGEMENT PAGE
   ════════════════════════════════════════════════════ */

export default function OrgMembersPage() {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(INITIAL_PENDING_INVITES);
  const [showPending, setShowPending] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member' | 'viewer'>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  /* ── Invite Dialog ── */
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgRole>('member');
  const [inviteOpen, setInviteOpen] = useState(false);

  const handleInvite = () => {
    const emails = inviteEmails
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (emails.length === 0) return;
    const newInvites: PendingInvite[] = emails.map((email) => ({
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      email,
      role: inviteRole,
      sent_at: new Date().toISOString(),
    }));
    setPendingInvites((prev) => [...newInvites, ...prev]);
    setInviteEmails('');
    setInviteRole('member');
    setInviteOpen(false);
  };

  /* ── Filtered Members ── */
  const filteredMembers = useMemo(() => {
    let result = members;
    if (roleFilter === 'admin') result = result.filter((m) => m.role === 'admin' || m.role === 'owner');
    else if (roleFilter === 'member') result = result.filter((m) => m.role === 'member');
    else if (roleFilter === 'viewer') result = result.filter((m) => m.role === 'viewer');

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [members, roleFilter, search]);

  /* ── Role Change ── */
  const handleRoleChange = (memberId: string, newRole: OrgRole) => {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
    if (selectedMember?.id === memberId) {
      setSelectedMember((prev) => prev ? { ...prev, role: newRole } : null);
    }
  };

  /* ── Remove Member ── */
  const handleRemoveMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (selectedMember?.id === memberId) setSelectedMember(null);
  };

  /* ── Pending actions ── */
  const handleRevokeInvite = (inviteId: string) => {
    setPendingInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
  };

  const handleResendInvite = (inviteId: string) => {
    setPendingInvites((prev) =>
      prev.map((inv) =>
        inv.id === inviteId ? { ...inv, sent_at: new Date().toISOString() } : inv
      )
    );
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="pb-16 pt-8 px-6 sm:px-10"
    >
      {/* ── Breadcrumb ── */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/org" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                Organization
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Members</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Members
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {members.length} members &middot; {pendingInvites.length} pending invites
          </p>
        </div>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF3333] hover:bg-[#FF3333]/90 text-white">
              <UserPlus size={16} strokeWidth={2} className="mr-2" />
              Invite members
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite members</DialogTitle>
              <DialogDescription>
                Send invitations to join your organization. Separate multiple emails with commas.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium text-[var(--color-text-primary)] mb-1.5 block">
                  Email addresses
                </label>
                <Textarea
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  placeholder="colleague@company.com, another@company.com"
                  rows={3}
                  className="bg-[var(--color-bg-base)] border-[var(--color-border)] resize-none"
                />
                <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">
                  Separate multiple email addresses with commas
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--color-text-primary)] mb-1.5 block">
                  Role
                </label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrgRole)}>
                  <SelectTrigger className="w-full bg-[var(--color-bg-base)] border-[var(--color-border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={!inviteEmails.trim()}
                className="bg-[#FF3333] hover:bg-[#FF3333]/90 text-white"
              >
                <Send size={14} className="mr-1.5" />
                Send invite{inviteEmails.includes(',') ? 's' : ''}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9 h-9 text-sm bg-[var(--color-bg-base)] border-[var(--color-border)]"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {MEMBER_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                roleFilter === f.value
                  ? 'bg-[#FF3333]/10 border-[#FF3333]/30 text-[#FF3333]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)]'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Member Grid (3 columns) ── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6"
      >
        {filteredMembers.map((member) => {
          const roleConfig = ROLE_CONFIG[member.role];
          return (
            <motion.div key={member.id} variants={fadeUp}>
              <Card
                className={cn(
                  'rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:border-[var(--color-border-strong)] hover:shadow-sm transition-all cursor-pointer group',
                  selectedMember?.id === member.id && 'border-[#FF3333]/40 shadow-sm'
                )}
                onClick={() => setSelectedMember(member)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarFallback className="text-xs bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                          {member.name}
                        </h3>
                        <Badge variant="outline" className={cn('text-[10px] font-semibold uppercase tracking-wider shrink-0', roleConfig.className)}>
                          {roleConfig.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--color-text-tertiary)] truncate mt-0.5">
                        {member.email}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-[var(--color-text-tertiary)]">
                        <Clock size={10} />
                        {formatRelativeTime(member.lastActive)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Member Detail Panel ── */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="rounded-xl border-[#FF3333]/20 bg-[var(--color-bg-surface)] overflow-hidden mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Member Details</h2>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)} className="h-8 w-8 p-0">
                    <X size={14} />
                  </Button>
                </div>

                <div className="flex items-start gap-4">
                  <Avatar className="size-16 shrink-0">
                    <AvatarFallback className="text-sm bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                      {getInitials(selectedMember.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{selectedMember.name}</h3>
                    <p className="text-sm text-[var(--color-text-tertiary)]">{selectedMember.email}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-secondary)]">
                      <span>Joined {formatDate(selectedMember.joined_at)}</span>
                      <span>&middot;</span>
                      <span>Last active {formatRelativeTime(selectedMember.lastActive)}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-[var(--color-border)] my-4" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm text-[var(--color-text-secondary)]">Role:</span>
                    {selectedMember.role === 'owner' ? (
                      <Badge variant="outline" className={cn('text-[10px] font-semibold uppercase tracking-wider', ROLE_CONFIG.owner.className)}>
                        {ROLE_CONFIG.owner.label}
                      </Badge>
                    ) : (
                      <Select value={selectedMember.role} onValueChange={(v) => handleRoleChange(selectedMember.id, v as OrgRole)}>
                        <SelectTrigger className="w-[120px] h-8 text-xs bg-[var(--color-bg-base)] border-[var(--color-border)]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  {selectedMember.role !== 'owner' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleRemoveMember(selectedMember.id)}
                    >
                      <Trash2 size={12} className="mr-1.5" />
                      Remove member
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pending Invites ── */}
      {pendingInvites.length > 0 && (
        <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPending(!showPending)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--color-bg-overlay)]/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[var(--color-text-secondary)]" />
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Pending Invites
              </h2>
              <Badge variant="outline" className="text-[10px]">
                {pendingInvites.length}
              </Badge>
            </div>
            {showPending ? (
              <ChevronUp size={16} className="text-[var(--color-text-tertiary)]" />
            ) : (
              <ChevronDown size={16} className="text-[var(--color-text-tertiary)]" />
            )}
          </button>

          <AnimatePresence>
            {showPending && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-[var(--color-border)]/50 divide-y divide-[var(--color-border)]/50">
                  {pendingInvites.map((invite) => {
                    const roleConfig = ROLE_CONFIG[invite.role];
                    return (
                      <motion.div
                        key={invite.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 px-6 py-3.5"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                          <MailCheck size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--color-text-primary)] truncate">{invite.email}</p>
                          <p className="text-xs text-[var(--color-text-tertiary)]">
                            Sent {formatDate(invite.sent_at)}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn('text-[10px] font-semibold uppercase tracking-wider shrink-0', roleConfig.className)}>
                          {roleConfig.label}
                        </Badge>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-[var(--color-text-secondary)]"
                            onClick={() => handleResendInvite(invite.id)}
                          >
                            <Send size={12} className="mr-1" />
                            Resend
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-[var(--color-text-tertiary)] hover:text-red-600"
                            onClick={() => handleRevokeInvite(invite.id)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
    </motion.div>
  );
}
