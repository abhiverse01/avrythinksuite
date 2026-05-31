'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Upload,
  Building2,
  CreditCard,
  Shield,
  Zap,
  ArrowUpRight,
  AlertTriangle,
  Trash2,
  Globe,
  Users,
  HardDrive,
  FileText,
  Image,
  Video,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

/* ── Mock Data ── */

const ORG_INITIAL = {
  name: 'Acme Corp',
  slug: 'acme-corp',
  plan: 'pro' as const,
  logoUrl: null as string | null,
  description: 'A fast-growing technology company building next-generation products.',
};

const STORAGE_BREAKDOWN = [
  { type: 'Documents', size: '1.2 GB', icon: FileText, color: 'text-blue-600 bg-blue-50', percent: 50 },
  { type: 'Images', size: '580 MB', icon: Image, color: 'text-violet-600 bg-violet-50', percent: 24 },
  { type: 'Videos', size: '320 MB', icon: Video, color: 'text-rose-600 bg-rose-50', percent: 13 },
  { type: 'Other', size: '300 MB', icon: HardDrive, color: 'text-gray-600 bg-gray-50', percent: 13 },
];

const LARGE_FILES = [
  { name: 'Brand Assets Pack.zip', size: '245 MB', type: 'Archive', date: '2025-01-10' },
  { name: 'Q4 Presentation Recording.mp4', size: '180 MB', type: 'Video', date: '2025-01-05' },
  { name: 'Product Demo - Final Cut.mov', size: '140 MB', type: 'Video', date: '2024-12-20' },
  { name: 'Design System Export.fig', size: '96 MB', type: 'Design', date: '2024-12-15' },
  { name: 'Team Photo Archive.zip', size: '78 MB', type: 'Archive', date: '2024-12-10' },
];

/* ── Animation ── */

const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

/* ════════════════════════════════════════════════════
   ORG SETTINGS PAGE — Tabbed Layout
   ════════════════════════════════════════════════════ */

export default function OrgSettingsPage() {
  /* ── General State ── */
  const [orgName, setOrgName] = useState(ORG_INITIAL.name);
  const [orgDesc, setOrgDesc] = useState(ORG_INITIAL.description);
  const [slug] = useState(ORG_INITIAL.slug);
  const [logoPreview, setLogoPreview] = useState<string | null>(ORG_INITIAL.logoUrl);

  /* ── Members Tab State ── */
  const [defaultRole, setDefaultRole] = useState('member');
  const [emailDomains, setEmailDomains] = useState('acme.co');
  const [requireApproval, setRequireApproval] = useState(false);

  /* ── Notification toggles ── */
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [memberJoinAlerts, setMemberJoinAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  /* ── Logo upload mock ── */
  const handleLogoUpload = useCallback(() => {
    setLogoPreview(
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(orgName)}&backgroundColor=c084fc&textColor=ffffff`
    );
  }, [orgName]);

  const handleRemoveLogo = () => {
    setLogoPreview(null);
  };

  /* ── Plan ── */
  const currentPlan = ORG_INITIAL.plan;
  const planLabel = currentPlan === 'pro' ? 'Pro' : 'Free';
  const planPrice = currentPlan === 'pro' ? '$12/month' : '$0/month';

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
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage your organization&apos;s configuration and preferences
        </p>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-transparent p-0 border-b border-[var(--color-border)] rounded-none h-auto gap-0 w-full justify-start">
          <TabsTrigger
            value="general"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF3333] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] data-[state=active]:text-[#FF3333] -mb-px"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF3333] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] data-[state=active]:text-[#FF3333] -mb-px"
          >
            Members
          </TabsTrigger>
          <TabsTrigger
            value="storage"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF3333] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] data-[state=active]:text-[#FF3333] -mb-px"
          >
            Storage
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF3333] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] data-[state=active]:text-[#FF3333] -mb-px"
          >
            Billing
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════
           TAB: General
           ═══════════════════════════════════════════ */}
        <TabsContent value="general" className="space-y-6 max-w-3xl mt-6">
          <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">General</h2>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                  Organization name, slug, and branding
                </p>
              </div>

              <Separator className="bg-[var(--color-border)]" />

              {/* Org name */}
              <div className="space-y-2">
                <Label htmlFor="org-name" className="text-sm font-medium text-[var(--color-text-primary)]">
                  Organization name
                </Label>
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="bg-[var(--color-bg-base)] border-[var(--color-border)]"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="org-desc" className="text-sm font-medium text-[var(--color-text-primary)]">
                  Description
                </Label>
                <textarea
                  id="org-desc"
                  value={orgDesc}
                  onChange={(e) => setOrgDesc(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-2 text-sm ring-offset-[var(--color-bg-base)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF3333] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Describe your organization..."
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="org-slug" className="text-sm font-medium text-[var(--color-text-primary)]">
                  Slug
                </Label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                  <Input
                    id="org-slug"
                    value={slug}
                    readOnly
                    className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-tertiary)] cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">
                  The slug is auto-generated from the organization name and cannot be changed.
                </p>
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[var(--color-text-primary)]">
                  Logo
                </Label>
                {logoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] overflow-hidden flex items-center justify-center shrink-0">
                      <img src={logoPreview} alt="Organization logo" className="size-full object-cover" />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRemoveLogo}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleLogoUpload}
                    className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[#FF3333]/50 hover:bg-[#FF3333]/5 transition-colors cursor-pointer"
                  >
                    <Upload size={20} className="text-[var(--color-text-tertiary)] mb-2" />
                    <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                      Click to upload a logo
                    </p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
                      SVG, PNG, or JPG (max 2MB)
                    </p>
                  </button>
                )}
              </div>

              {/* Save button */}
              <div className="flex justify-end">
                <Button onClick={() => {}} className="bg-[#FF3333] hover:bg-[#FF3333]/90 text-white">
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="rounded-xl border-red-200 bg-red-50/50 overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-base font-semibold text-red-800">Danger Zone</h2>
                <p className="text-xs text-red-600/70 mt-0.5">
                  Irreversible actions that affect your entire organization
                </p>
              </div>

              <Separator className="bg-red-200/50" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-red-800">Delete organization</p>
                  <p className="text-xs text-red-600/70 mt-0.5 max-w-md">
                    Permanently delete this organization, all its files, exams, and member associations. This action cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="shrink-0 bg-red-600 hover:bg-red-700 text-white">
                      <Trash2 size={14} className="mr-1.5" />
                      Delete org
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete &ldquo;{orgName}&rdquo; and all associated data, including files, exams, and member records.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-600">
                        Delete organization
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════
           TAB: Members
           ═══════════════════════════════════════════ */}
        <TabsContent value="members" className="space-y-6 max-w-3xl mt-6">
          {/* Default Role */}
          <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Default Member Role</h2>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                  Set the default role assigned to new members when they join.
                </p>
              </div>
              <Separator className="bg-[var(--color-border)]" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Default role</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">New members will receive this role by default.</p>
                </div>
                <Select value={defaultRole} onValueChange={setDefaultRole}>
                  <SelectTrigger className="w-[140px] bg-[var(--color-bg-base)] border-[var(--color-border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => {}} className="bg-[#FF3333] hover:bg-[#FF3333]/90 text-white">
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invitation Settings */}
          <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Invitation Settings</h2>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                  Control who can send invitations and require approvals.
                </p>
              </div>
              <Separator className="bg-[var(--color-border)]" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Require approval for new members</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Admins must approve all join requests before members are added.
                  </p>
                </div>
                <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
              </div>
              <Separator className="bg-[var(--color-border)]" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Email notifications</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">Receive important updates via email.</p>
                </div>
                <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
              </div>
              <Separator className="bg-[var(--color-border)]" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Member join alerts</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">Get notified when someone joins.</p>
                </div>
                <Switch checked={memberJoinAlerts} onCheckedChange={setMemberJoinAlerts} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => {}} className="bg-[#FF3333] hover:bg-[#FF3333]/90 text-white">
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Domain Restriction */}
          <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Domain Restriction</h2>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                  Limit who can join to specific email domains.
                </p>
              </div>
              <Separator className="bg-[var(--color-border)]" />
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[var(--color-text-primary)]">Allowed domains</Label>
                <Input
                  value={emailDomains}
                  onChange={(e) => setEmailDomains(e.target.value)}
                  placeholder="company.com, team.org"
                  className="bg-[var(--color-bg-base)] border-[var(--color-border)]"
                />
                <p className="text-[10px] text-[var(--color-text-tertiary)]">
                  Separate multiple domains with commas. Leave empty to allow any domain.
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => {}} className="bg-[#FF3333] hover:bg-[#FF3333]/90 text-white">
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════
           TAB: Storage
           ═══════════════════════════════════════════ */}
        <TabsContent value="storage" className="space-y-6 max-w-3xl mt-6">
          {/* Storage Overview */}
          <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Storage Overview</h2>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                  2.4 GB of 10 GB used (24%)
                </p>
              </div>
              <Separator className="bg-[var(--color-border)]" />

              {/* Progress bar */}
              <div>
                <Progress value={24} className="h-3" />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">2.4 GB used</span>
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">10 GB total</span>
                </div>
              </div>

              {/* Breakdown by type */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Breakdown by type</p>
                {STORAGE_BREAKDOWN.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.type} className="flex items-center gap-3">
                      <div className={cn('flex size-8 items-center justify-center rounded-lg shrink-0', item.color)}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-[var(--color-text-primary)]">{item.type}</span>
                          <span className="text-xs text-[var(--color-text-tertiary)]">{item.size}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#FF3333]"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Large Files */}
          <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Large Files</h2>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                  Files over 50 MB that are taking up significant storage.
                </p>
              </div>
              <Separator className="bg-[var(--color-border)]" />
              <div className="divide-y divide-[var(--color-border)]/50">
                {LARGE_FILES.map((file) => (
                  <div key={file.name} className="flex items-center gap-3 py-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]">
                      <HardDrive size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--color-text-primary)] truncate">{file.name}</p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">{file.type} &middot; {file.date}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0 border-[var(--color-border)]">
                      {file.size}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] text-red-600 hover:text-red-700 shrink-0">
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════
           TAB: Billing
           ═══════════════════════════════════════════ */}
        <TabsContent value="billing" className="space-y-6 max-w-3xl mt-6">
          {/* Current Plan */}
          <Card className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden">
            <CardContent className="p-0">
              {/* Plan card header gradient */}
              <div className={cn(
                'px-6 py-5 border-b',
                currentPlan === 'pro'
                  ? 'bg-gradient-to-r from-[#FF3333]/5 to-[#FF6666]/5 border-[#FF3333]/10'
                  : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-100'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex size-10 items-center justify-center rounded-lg',
                      currentPlan === 'pro'
                        ? 'bg-[#FF3333]/10 text-[#FF3333]'
                        : 'bg-gray-200 text-gray-600'
                    )}>
                      {currentPlan === 'pro' ? (
                        <Zap size={20} strokeWidth={1.5} />
                      ) : (
                        <Building2 size={20} strokeWidth={1.5} />
                      )}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[var(--color-text-primary)]">
                        {planLabel} Plan
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{planPrice}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'uppercase text-[10px] tracking-wider font-bold',
                      currentPlan === 'pro'
                        ? 'border-[#FF3333]/30 bg-white text-[#FF3333]'
                        : 'border-gray-300 bg-white text-gray-600'
                    )}
                  >
                    Current Plan
                  </Badge>
                </div>
              </div>

              {/* Plan details */}
              <div className="p-6 space-y-4">
                {currentPlan === 'pro' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: 'Members', value: 'Up to 50' },
                        { label: 'Storage', value: '10 GB' },
                        { label: 'Exams', value: 'Unlimited' },
                        { label: 'API Access', value: 'Included' },
                      ].map((feature) => (
                        <div key={feature.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)]">
                          <span className="text-xs text-[var(--color-text-secondary)]">{feature.label}</span>
                          <span className="text-xs font-medium text-[var(--color-text-primary)]">{feature.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        <CreditCard size={14} className="mr-1.5" />
                        Manage billing
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Upgrade to Pro for more members, storage, and advanced features.
                    </p>
                    <Button size="sm" className="bg-[#FF3333] hover:bg-[#FF3333]/90 text-white">
                      <ArrowUpRight size={14} className="mr-1.5" />
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upgrade CTA Card */}
          <Card className="rounded-xl border-2 border-[#FF3333]/20 bg-gradient-to-br from-[#FF3333]/5 to-transparent overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#FF3333]/10 text-[#FF3333]">
                  <Zap size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Upgrade to Enterprise</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    Get unlimited members, 100 GB storage, SSO, advanced analytics, and priority support.
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <Button className="bg-[#FF3333] hover:bg-[#FF3333]/90 text-white">
                      <ArrowUpRight size={14} className="mr-1.5" />
                      Contact sales
                    </Button>
                    <span className="text-xs text-[var(--color-text-tertiary)]">Starting at $49/month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
