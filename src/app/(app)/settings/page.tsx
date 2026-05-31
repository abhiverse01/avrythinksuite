'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User, Palette, Bell, Keyboard, Trash2, Sun, Moon, Monitor,
  FileEdit, Type, Gauge, Move, Minus, Plus, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { keyboardRegistry } from '@/lib/keyboard-registry';
import { cn, getInitials } from '@/lib/utils';
import type { ThemeMode, DensityMode, FontSizeMode } from '@/lib/types';

/* ── Brand Color ── */
const BRAND = '#FF3333';

/* ── Animation ── */

const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/* ── Kbd component ── */

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-2 py-0.5 text-xs font-mono text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)]">
      {children}
    </kbd>
  );
}

/* ── Key display mapping ── */

const KEY_DISPLAY: Record<string, string> = {
  cmd: '⌘', command: '⌘', mod: '⌘',
  ctrl: '⌃', alt: '⌥', option: '⌥', shift: '⇧',
  enter: '↵', tab: '⇥', backspace: '⌫', delete: '⌦',
  escape: 'esc', esc: 'esc',
};

/* ── Shortcut Row ── */

function ShortcutRow({
  keysStr,
  description,
}: {
  keysStr: string;
  description: string;
}) {
  const parts = keysStr.split('+').map((key) => {
    const normalized = key.trim().toLowerCase();
    return KEY_DISPLAY[normalized] || key.trim().toUpperCase();
  });

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[var(--color-text-secondary)]">{description}</span>
      <div className="flex items-center gap-1">
        {parts.map((key, i) => (
          <span key={`${keysStr}-${i}`} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-xs text-[var(--color-text-tertiary)]">+</span>
            )}
            <Kbd>{key}</Kbd>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Theme Option Config ── */

interface ThemeOption {
  value: ThemeMode;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    icon: <Sun size={14} />,
    bgColor: '#FAFAF9',
    textColor: '#1C1B19',
    description: 'Clean, bright default',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: <Moon size={14} />,
    bgColor: '#111111',
    textColor: '#F0F0F0',
    description: 'Easy on the eyes at night',
  },
  {
    value: 'system',
    label: 'System',
    icon: <Monitor size={14} />,
    bgColor: '#888888',
    textColor: '#FFFFFF',
    description: 'Follows your OS setting',
  },
  {
    value: 'avrythink-dark',
    label: 'Avrythink Dark',
    icon: <Moon size={14} />,
    bgColor: '#0A0A0A',
    textColor: '#FF3333',
    description: 'High contrast dark mode',
  },
  {
    value: 'soft-light',
    label: 'Soft Light',
    icon: <Sun size={14} />,
    bgColor: '#F7F5F0',
    textColor: '#2A2620',
    description: 'Warm, low-contrast feel',
  },
];

/* ── Density Options ── */

const DENSITY_OPTIONS: { value: DensityMode; label: string; description: string }[] = [
  { value: 'comfortable', label: 'Comfortable', description: 'Default spacing' },
  { value: 'compact', label: 'Compact', description: 'Tighter layout' },
  { value: 'spacious', label: 'Spacious', description: 'More breathing room' },
];

/* ── Font Size Options ── */

const FONT_SIZE_OPTIONS: { value: FontSizeMode; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'default', label: 'Default' },
  { value: 'large', label: 'Large' },
];

/* ── Editor Preference Options ── */

const DOC_FONT_OPTIONS = ['Inter', 'Georgia', 'Courier New'];
const DOC_FONT_SIZE_OPTIONS = ['12px', '14px', '16px'];
const SPELLCHECK_OPTIONS = ['Always', 'In documents only', 'Off'];
const AUTOSAVE_OPTIONS = ['30s', '1min', '2min', 'Manual only'];

/* ── Left Nav Tab Definition ── */

type SettingsTab = 'appearance' | 'profile' | 'editor' | 'notifications' | 'shortcuts' | 'danger';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'appearance', label: 'Appearance', icon: <Palette size={16} strokeWidth={1.5} /> },
  { id: 'profile', label: 'Profile', icon: <User size={16} strokeWidth={1.5} /> },
  { id: 'editor', label: 'Editor', icon: <FileEdit size={16} strokeWidth={1.5} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} strokeWidth={1.5} /> },
  { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard size={16} strokeWidth={1.5} /> },
  { id: 'danger', label: 'Danger Zone', icon: <Trash2 size={16} strokeWidth={1.5} /> },
];

/* ── SectionIcon helper ── */

function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex size-7 items-center justify-center rounded-md" style={{ background: 'rgba(255,51,51,0.1)' }}>
      <span style={{ color: BRAND }}>{children}</span>
    </div>
  );
}

/* ── RadioOption ── */

function RadioOption<T extends string>({
  value,
  selected,
  onChange,
  children,
}: {
  value: T;
  selected: T;
  onChange: (v: T) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected === value}
      onClick={() => onChange(value)}
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-150 w-full cursor-pointer',
        'hover:border-[var(--color-border-strong)]',
        selected === value
          ? 'border-[#FF3333] ring-1 ring-[#FF3333] bg-[rgba(255,51,51,0.03)]'
          : 'border-[var(--color-border)]'
      )}
    >
      <div
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          selected === value ? 'border-[#FF3333]' : 'border-[var(--color-border-strong)]'
        )}
      >
        {selected === value && (
          <div className="size-2.5 rounded-full bg-[#FF3333]" />
        )}
      </div>
      <div className="flex-1">{children}</div>
    </button>
  );
}

/* ── SegmentedControl ── */

function SegmentedControl({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            'flex-1 flex items-center justify-center px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer',
            'border-r border-[var(--color-border)] last:border-r-0',
            selected === opt
              ? 'bg-[rgba(255,51,51,0.08)] text-[var(--color-text-primary)]'
              : 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   TAB PANELS
   ════════════════════════════════════════════════════ */

/* ── Appearance Tab ── */

function AppearancePanel() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const density = useUIStore((s) => s.density);
  const setDensity = useUIStore((s) => s.setDensity);
  const fontSize = useUIStore((s) => s.fontSize);
  const setFontSize = useUIStore((s) => s.setFontSize);
  const reduceMotion = useUIStore((s) => s.reduceMotion);
  const setReduceMotion = useUIStore((s) => s.setReduceMotion);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem('avrythink-theme', newTheme);
  };

  const handleDensityChange = (newDensity: DensityMode) => {
    setDensity(newDensity);
    localStorage.setItem('avrythink-density', newDensity);
  };

  const handleFontSizeChange = (newSize: FontSizeMode) => {
    setFontSize(newSize);
    localStorage.setItem('avrythink-font-size', newSize);
  };

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <SectionIcon><Palette size={14} strokeWidth={1.5} /></SectionIcon>
              <CardTitle className="text-base">Theme</CardTitle>
            </div>
            <CardDescription>Choose your preferred color scheme</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={theme === opt.value}
                  onClick={() => handleThemeChange(opt.value)}
                  className={cn(
                    'group flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all duration-150 cursor-pointer',
                    'hover:shadow-md',
                    theme === opt.value
                      ? 'border-[#FF3333] shadow-sm'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                  )}
                >
                  {/* Color preview circle */}
                  <div
                    className="relative flex size-12 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-[var(--color-bg-surface)] transition-all"
                    style={{
                      backgroundColor: opt.bgColor,
                      color: opt.textColor,
                      boxShadow: theme === opt.value ? `0 0 0 2px ${BRAND}` : `0 0 0 2px var(--color-border)`,
                    }}
                  >
                    {opt.icon}
                    {theme === opt.value && (
                      <div
                        className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full"
                        style={{ backgroundColor: BRAND }}
                      >
                        <Check size={9} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={cn(
                        'text-xs font-medium transition-colors',
                        theme === opt.value ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
                      )}
                    >
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
                      {opt.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Density Selector */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <SectionIcon><Gauge size={14} strokeWidth={1.5} /></SectionIcon>
              <CardTitle className="text-base">Density</CardTitle>
            </div>
            <CardDescription>Control spacing and padding throughout the app</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {DENSITY_OPTIONS.map((opt) => (
                <RadioOption
                  key={opt.value}
                  value={opt.value}
                  selected={density}
                  onChange={handleDensityChange}
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{opt.label}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{opt.description}</p>
                  </div>
                </RadioOption>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Font Size + Reduce Motion Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Font Size */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-2">
                <SectionIcon><Type size={14} strokeWidth={1.5} /></SectionIcon>
                <CardTitle className="text-base">Font Size</CardTitle>
              </div>
              <CardDescription>Adjust the base text size</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
                {FONT_SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleFontSizeChange(opt.value)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer',
                      'border-r border-[var(--color-border)] last:border-r-0',
                      fontSize === opt.value
                        ? 'bg-[rgba(255,51,51,0.08)] text-[var(--color-text-primary)]'
                        : 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]'
                    )}
                  >
                    {opt.value === 'small' && <Minus size={12} style={{ color: fontSize === opt.value ? BRAND : undefined }} />}
                    <span>{opt.label}</span>
                    {opt.value === 'large' && <Plus size={12} style={{ color: fontSize === opt.value ? BRAND : undefined }} />}
                  </button>
                ))}
              </div>
              {fontSize === 'small' && (
                <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">–1px from default (13px)</p>
              )}
              {fontSize === 'large' && (
                <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">+1px from default (15px)</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Reduce Motion */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-2">
                <SectionIcon><Move size={14} strokeWidth={1.5} /></SectionIcon>
                <CardTitle className="text-base">Reduce Motion</CardTitle>
              </div>
              <CardDescription>Minimize animations and transitions</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    Enable reduced motion
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Disables animations &amp; transitions
                  </p>
                </div>
                <Switch
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                  className="data-[state=checked]:bg-[#FF3333]"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Profile Tab ── */

function ProfilePanel() {
  const user = useAuthStore((s) => s.user);

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <SectionIcon><User size={14} strokeWidth={1.5} /></SectionIcon>
            <CardTitle className="text-base">Profile</CardTitle>
          </div>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="space-y-1.5">
            <Label>Avatar</Label>
            <div className="flex items-center gap-3">
              <div
                className="flex size-14 items-center justify-center rounded-full text-lg font-semibold"
                style={{ backgroundColor: BRAND, color: '#FFFFFF' }}
              >
                {user ? getInitials(user.full_name || user.email) : '?'}
              </div>
              <Button variant="outline" size="sm" className="text-[var(--color-text-secondary)]">
                Change avatar
              </Button>
            </div>
          </div>
          <Separator />
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" defaultValue={user?.full_name ?? ''} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" defaultValue={user?.email ?? ''} />
            </div>
          </div>
          <Separator />
          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Input id="bio" placeholder="Tell us about yourself" />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              style={{ backgroundColor: BRAND, color: '#FFFFFF' }}
              className="hover:opacity-90 transition-opacity"
            >
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Editor Preferences Tab ── */

function EditorPanel() {
  const [editorPrefs, setEditorPrefs] = useState({
    docFont: 'Inter',
    docFontSize: '14px',
    spellcheck: 'In documents only',
    autosave: '1min',
  });

  return (
    <div className="space-y-6">
      {/* Default Font for Docs */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <SectionIcon><FileEdit size={14} strokeWidth={1.5} /></SectionIcon>
              <CardTitle className="text-base">Document Defaults</CardTitle>
            </div>
            <CardDescription>Set the default appearance for new documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Font Family */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Default Font</Label>
              <div className="space-y-2">
                {DOC_FONT_OPTIONS.map((font) => (
                  <RadioOption
                    key={font}
                    value={font}
                    selected={editorPrefs.docFont}
                    onChange={(v) => setEditorPrefs((p) => ({ ...p, docFont: v }))}
                  >
                    <span
                      className="text-sm text-[var(--color-text-primary)]"
                      style={{
                        fontFamily: font === 'Courier New'
                          ? '"Courier New", monospace'
                          : font === 'Georgia'
                            ? 'Georgia, serif'
                            : 'inherit',
                      }}
                    >
                      {font}
                    </span>
                  </RadioOption>
                ))}
              </div>
            </div>

            <Separator />

            {/* Font Size */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Default Font Size</Label>
              <SegmentedControl
                options={DOC_FONT_SIZE_OPTIONS}
                selected={editorPrefs.docFontSize}
                onChange={(v) => setEditorPrefs((p) => ({ ...p, docFontSize: v }))}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Spellcheck & Auto-save */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <SectionIcon><Type size={14} strokeWidth={1.5} /></SectionIcon>
              <CardTitle className="text-base">Editing Behavior</CardTitle>
            </div>
            <CardDescription>Control spellcheck and auto-save settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Spellcheck */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Spellcheck</Label>
              <SegmentedControl
                options={SPELLCHECK_OPTIONS}
                selected={editorPrefs.spellcheck}
                onChange={(v) => setEditorPrefs((p) => ({ ...p, spellcheck: v }))}
              />
            </div>

            <Separator />

            {/* Auto-save */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Auto-save Frequency</Label>
              <SegmentedControl
                options={AUTOSAVE_OPTIONS}
                selected={editorPrefs.autosave}
                onChange={(v) => setEditorPrefs((p) => ({ ...p, autosave: v }))}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ── Notifications Tab ── */

function NotificationsPanel() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    mentions: true,
  });

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <SectionIcon><Bell size={14} strokeWidth={1.5} /></SectionIcon>
            <CardTitle className="text-base">Notifications</CardTitle>
          </div>
          <CardDescription>Choose what you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Email notifications</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Receive updates via email</p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(v) => setNotifications((n) => ({ ...n, email: v }))}
              className="data-[state=checked]:bg-[#FF3333]"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Push notifications</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Get push alerts in your browser</p>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(v) => setNotifications((n) => ({ ...n, push: v }))}
              className="data-[state=checked]:bg-[#FF3333]"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Mention alerts</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Get notified when someone mentions you</p>
            </div>
            <Switch
              checked={notifications.mentions}
              onCheckedChange={(v) => setNotifications((n) => ({ ...n, mentions: v }))}
              className="data-[state=checked]:bg-[#FF3333]"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Keyboard Shortcuts Tab ── */

function ShortcutsPanel() {
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card className="border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <SectionIcon><Keyboard size={14} strokeWidth={1.5} /></SectionIcon>
            <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
          </div>
          <CardDescription>Boost your productivity with keyboard shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-[var(--color-border)]">
            {keyboardRegistry.getAll().map((shortcut) => (
              <ShortcutRow
                key={shortcut.keys}
                keysStr={shortcut.keys}
                description={shortcut.description}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Danger Zone Tab ── */

function DangerPanel() {
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card className="border-red-200 bg-[var(--color-bg-surface)]">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <Trash2 size={18} strokeWidth={1.5} className="text-red-500" />
            <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-red-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-red-600">Delete account</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Permanently remove your account and all data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 size={14} strokeWidth={1.5} />
                  Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and
                    remove all of your files from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive">Delete account</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════
   SETTINGS PAGE
   ════════════════════════════════════════════════════ */

export default function SettingsPage() {
  const setTheme = useUIStore((s) => s.setTheme);
  const setDensity = useUIStore((s) => s.setDensity);
  const setFontSize = useUIStore((s) => s.setFontSize);
  const setReduceMotion = useUIStore((s) => s.setReduceMotion);

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  /* ── Hydrate all settings from localStorage on mount ── */
  useEffect(() => {
    const storedTheme = localStorage.getItem('avrythink-theme');
    if (storedTheme && ['light', 'dark', 'system', 'avrythink-dark', 'soft-light'].includes(storedTheme)) {
      setTheme(storedTheme as ThemeMode);
    }

    const storedDensity = localStorage.getItem('avrythink-density');
    if (storedDensity && ['comfortable', 'compact', 'spacious'].includes(storedDensity)) {
      setDensity(storedDensity as DensityMode);
    }

    const storedFontSize = localStorage.getItem('avrythink-font-size');
    if (storedFontSize && ['small', 'default', 'large'].includes(storedFontSize)) {
      setFontSize(storedFontSize as FontSizeMode);
    }

    const storedMotion = localStorage.getItem('avrythink-reduce-motion');
    if (storedMotion === 'true') {
      setReduceMotion(true);
    }
  }, [setTheme, setDensity, setFontSize, setReduceMotion]);

  /* ── Apply theme classes on mount and when changed ── */
  const applyTheme = useCallback((t: ThemeMode) => {
    const root = document.documentElement;
    const allThemeClasses = ['dark', 'theme-avrythink-dark', 'theme-soft-light'];
    allThemeClasses.forEach((cls) => root.classList.remove(cls));

    switch (t) {
      case 'dark':
        root.classList.add('dark');
        break;
      case 'system': {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
        break;
      }
      case 'avrythink-dark':
        root.classList.add('theme-avrythink-dark');
        break;
      case 'soft-light':
        root.classList.add('theme-soft-light');
        break;
      default:
        break;
    }
  }, []);

  const theme = useUIStore((s) => s.theme);
  const density = useUIStore((s) => s.density);
  const fontSize = useUIStore((s) => s.fontSize);
  const reduceMotion = useUIStore((s) => s.reduceMotion);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  /* ── Apply density classes ── */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('density-compact', 'density-spacious');
    if (density === 'compact') root.classList.add('density-compact');
    if (density === 'spacious') root.classList.add('density-spacious');
  }, [density]);

  /* ── Apply font size ── */
  useEffect(() => {
    const map: Record<FontSizeMode, string> = { small: '13px', default: '14px', large: '15px' };
    document.documentElement.style.setProperty('--font-size-base', map[fontSize]);
  }, [fontSize]);

  /* ── Apply reduce motion ── */
  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [reduceMotion]);

  /* ── System theme media query listener ── */
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  /* ── Tab panel renderer ── */
  const renderPanel = () => {
    switch (activeTab) {
      case 'appearance':
        return <AppearancePanel />;
      case 'profile':
        return <ProfilePanel />;
      case 'editor':
        return <EditorPanel />;
      case 'notifications':
        return <NotificationsPanel />;
      case 'shortcuts':
        return <ShortcutsPanel />;
      case 'danger':
        return <DangerPanel />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="pb-16 pt-8 px-6 sm:px-10"
    >
      <div className="flex gap-8 max-w-4xl mx-auto">
        {/* ── Left Nav (desktop) ── */}
        <nav className="hidden sm:flex flex-col w-52 shrink-0 sticky top-8 self-start">
          <div className="mb-4">
            <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              Settings
            </h1>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Manage your preferences
            </p>
          </div>
          <div className="flex flex-col gap-0.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 text-left cursor-pointer',
                  activeTab === tab.id
                    ? 'bg-[rgba(255,51,51,0.08)] text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)]'
                )}
              >
                <span
                  className={cn(
                    'transition-colors',
                    activeTab === tab.id ? 'text-[#FF3333]' : ''
                  )}
                >
                  {tab.icon}
                </span>
                {tab.label}
                {activeTab === tab.id && (
                  <div
                    className="ml-auto size-1.5 rounded-full"
                    style={{ backgroundColor: BRAND }}
                  />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Mobile Tab Bar ── */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <div className="flex justify-around py-2 px-1">
            {TABS.slice(0, 5).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1 rounded-md transition-colors cursor-pointer min-w-0',
                  activeTab === tab.id
                    ? 'text-[#FF3333]'
                    : 'text-[var(--color-text-tertiary)]'
                )}
              >
                <span className="shrink-0">{tab.icon}</span>
                <span className="text-[10px] truncate max-w-[60px]">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0 max-w-2xl">
          {renderPanel()}
        </main>
      </div>
    </motion.div>
  );
}
