'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Users,
  X,
  ChevronRight,
  Building2,
  Clock,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { cn, formatRelativeTime, getInitials } from '@/lib/utils';

/* ── Types ── */

interface Team {
  id: string;
  name: string;
  description: string;
  color: string;
  memberCount: number;
  lastActivity: string;
  members: TeamMember[];
}

interface TeamMember {
  id: string;
  name: string;
  role: 'lead' | 'member';
}

/* ── Color Options ── */

const COLOR_OPTIONS = [
  { value: '#FF3333', label: 'Red' },
  { value: '#FF9500', label: 'Orange' },
  { value: '#FFCC00', label: 'Yellow' },
  { value: '#34C759', label: 'Green' },
  { value: '#007AFF', label: 'Blue' },
  { value: '#AF52DE', label: 'Purple' },
  { value: '#FF2D55', label: 'Pink' },
  { value: '#5856D6', label: 'Indigo' },
];

/* ── Mock Data ── */

const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Engineering',
    description: 'Full-stack engineering team responsible for core product development.',
    color: '#FF3333',
    memberCount: 5,
    lastActivity: '2025-01-15T14:00:00Z',
    members: [
      { id: 'm-1', name: 'Alex Rivera', role: 'lead' },
      { id: 'm-2', name: 'Sarah Mitchell', role: 'member' },
      { id: 'm-3', name: 'Marcus Johnson', role: 'member' },
      { id: 'm-4', name: 'Emily Zhang', role: 'member' },
      { id: 'm-5', name: 'David Park', role: 'member' },
    ],
  },
  {
    id: 'team-2',
    name: 'Design',
    description: 'UI/UX design team crafting beautiful user experiences.',
    color: '#AF52DE',
    memberCount: 3,
    lastActivity: '2025-01-14T11:30:00Z',
    members: [
      { id: 'm-6', name: 'Olivia Brown', role: 'lead' },
      { id: 'm-7', name: 'James Wilson', role: 'member' },
      { id: 'm-8', name: 'Nina Kowalski', role: 'member' },
    ],
  },
  {
    id: 'team-3',
    name: 'Marketing',
    description: 'Growth marketing team focused on user acquisition and engagement.',
    color: '#007AFF',
    memberCount: 4,
    lastActivity: '2025-01-13T09:45:00Z',
    members: [
      { id: 'm-9', name: 'Tom Harris', role: 'lead' },
      { id: 'm-10', name: 'Lisa Chen', role: 'member' },
      { id: 'm-11', name: 'Ryan Moore', role: 'member' },
      { id: 'm-12', name: 'Kate Adams', role: 'member' },
    ],
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

/* ════════════════════════════════════════════════════
   TEAMS MANAGEMENT PAGE
   ════════════════════════════════════════════════════ */

export default function OrgTeamsPage() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#FF3333');

  const handleCreate = () => {
    if (!newName.trim()) return;
    const team: Team = {
      id: `team-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim(),
      color: newColor,
      memberCount: 1,
      lastActivity: new Date().toISOString(),
      members: [{ id: 'm-1', name: 'Alex Rivera', role: 'lead' }],
    };
    setTeams((prev) => [team, ...prev]);
    setNewName('');
    setNewDesc('');
    setNewColor('#FF3333');
    setCreateOpen(false);
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
            <BreadcrumbPage>Teams</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Teams
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {teams.length} team{teams.length !== 1 ? 's' : ''} &middot; {teams.reduce((acc, t) => acc + t.memberCount, 0)} total members
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF3333] hover:bg-[#FF3333]/90 text-white">
              <Plus size={16} strokeWidth={2} className="mr-2" />
              New team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new team</DialogTitle>
              <DialogDescription>
                Teams help you organize members by department, project, or function.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-sm font-medium text-[var(--color-text-primary)] mb-1.5 block">
                  Team name
                </Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Engineering, Design, Marketing"
                  className="bg-[var(--color-bg-base)] border-[var(--color-border)]"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-[var(--color-text-primary)] mb-1.5 block">
                  Description (optional)
                </Label>
                <Textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What does this team do?"
                  rows={3}
                  className="bg-[var(--color-bg-base)] border-[var(--color-border)] resize-none"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-[var(--color-text-primary)] mb-1.5 block">
                  Team color
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNewColor(color.value)}
                      className={cn(
                        'flex size-8 rounded-full transition-all',
                        newColor === color.value
                          ? 'ring-2 ring-offset-2 ring-[var(--color-text-primary)] scale-110'
                          : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="bg-[#FF3333] hover:bg-[#FF3333]/90 text-white"
              >
                Create team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Teams Grid ── */}
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] mb-4">
            <Building2 size={28} />
          </div>
          <p className="text-base font-medium text-[var(--color-text-primary)]">No teams yet</p>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1 text-center max-w-sm">
            Create your first team to organize members by department, project, or function.
          </p>
          <Button
            className="mt-4 bg-[#FF3333] hover:bg-[#FF3333]/90 text-white"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={16} className="mr-1.5" />
            Create first team
          </Button>
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {teams.map((team) => (
            <motion.div key={team.id} variants={fadeUp}>
              <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:border-[var(--color-border-strong)] hover:shadow-sm transition-all group h-full">
                <CardContent className="p-5">
                  {/* Color swatch + name */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${team.color}15`, color: team.color }}
                    >
                      <Users size={20} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {team.name}
                      </h3>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                        {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div
                      className="size-4 rounded-full shrink-0"
                      style={{ backgroundColor: team.color }}
                    />
                  </div>

                  {/* Description */}
                  {team.description && (
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-3">
                      {team.description}
                    </p>
                  )}

                  {/* Member avatars */}
                  <div className="flex items-center mb-3">
                    <div className="flex -space-x-1.5">
                      {team.members.slice(0, 4).map((member) => (
                        <Avatar key={member.id} className="size-6 border-2 border-[var(--color-bg-surface)]">
                          <AvatarFallback className="text-[8px] bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {team.members.length > 4 && (
                        <div className="flex size-6 items-center justify-center rounded-full border-2 border-[var(--color-bg-surface)] bg-[var(--color-bg-elevated)] text-[8px] text-[var(--color-text-tertiary)] font-medium">
                          +{team.members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-tertiary)]">
                      <Clock size={10} />
                      {formatRelativeTime(team.lastActivity)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-[var(--color-text-secondary)] hover:text-[#FF3333]"
                    >
                      Open
                      <ChevronRight size={12} className="ml-0.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
