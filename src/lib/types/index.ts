/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AVRYTHINK SUITE — Shared TypeScript Types
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ── User & Auth ──

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

// ── Organization ──

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';
export type OrgPlan = 'free' | 'pro' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan: OrgPlan;
  created_by: string;
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  joined_at: string;
  profile?: User;
}

// ── Files ──

export type FileType = 'doc' | 'sheet' | 'slide' | 'canvas' | 'exam';
export type FilePermission = 'view' | 'comment' | 'edit';

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  content: Record<string, unknown>;
  owner_id: string;
  org_id: string | null;
  parent_id: string | null;
  is_deleted: boolean;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
  owner?: User;
}

export interface FileCollaborator {
  id: string;
  file_id: string;
  user_id: string;
  permission: FilePermission;
  profile?: User;
}

// ── Exams ──

export type QuestionType =
  | 'multiple_choice'
  | 'multiple_select'
  | 'short_answer'
  | 'long_answer'
  | 'true_false'
  | 'rating_scale'
  | 'dropdown'
  | 'ranking'
  | 'file_upload'
  | 'date'
  | 'linear_scale'
  | 'matrix'
  | 'section_header';

export interface MCQOption {
  id: string;
  text: string;
}

export interface MatrixColumn {
  id: string;
  text: string;
}

export interface MatrixRow {
  id: string;
  text: string;
}

export interface RankingItem {
  id: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  text: string;
  description?: string;
  options?: MCQOption[];
  correctAnswer?: string | string[];
  points: number;
  maxLength?: number;
  minWords?: number;
  maxWords?: number;
  min?: number;
  max?: number;
  step?: number;
  labels?: string[];
  allowedTypes?: string[];
  maxFileSize?: number;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
  /** For matrix type */
  matrixRows?: MatrixRow[];
  matrixColumns?: MatrixColumn[];
  /** For ranking type */
  rankingItems?: RankingItem[];
  /** For section_header */
  sectionTitle?: string;
  sectionDescription?: string;
}

export interface ExamSettings {
  timeLimit?: number | null;
  shuffleQuestions: boolean;
  showResults: boolean;
  allowRetake: boolean;
  maxAttempts?: number | null;
  showCorrectAnswers?: boolean;
  requireName?: boolean;
  requireEmail?: boolean;
}

export interface Exam {
  id: string;
  file_id: string;
  title: string;
  description: string | null;
  questions: ExamQuestion[];
  settings: ExamSettings;
  share_token: string;
  isPublished: boolean;
  created_by: string;
  org_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExamSubmission {
  id: string;
  exam_id: string;
  respondent_name: string;
  respondent_email: string;
  answers: Record<string, unknown>;
  score: number | null;
  totalPoints: number;
  submitted_at: string;
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  totalResponses: number;
  correctResponses: number;
  correctPercentage: number;
  optionBreakdown?: { label: string; count: number; percentage: number }[];
}

// ── Notifications ──

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'comment' | 'share' | 'exam' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
  action_url?: string;
  /** Avatar initials or emoji shown in notification panel */
  avatar?: string;
  /** Author / actor display name */
  actorName?: string;
  /** Human-readable label for the notification category */
  category?: 'comment' | 'share' | 'exam' | 'system' | 'general';
}

// ── UI State ──

export type ThemeMode = 'light' | 'dark' | 'system' | 'avrythink-dark' | 'soft-light';
export type DensityMode = 'comfortable' | 'compact' | 'spacious';
export type FontSizeMode = 'small' | 'default' | 'large';
export type ViewMode = 'grid' | 'list';
export type SortField = 'name' | 'updated_at' | 'created_at';
export type FilterPreset = 'all' | 'mine' | 'shared' | 'starred';

export interface FileFilter {
  preset: FilterPreset;
  sort: SortField;
  view: ViewMode;
  search: string;
}

// ── Editor ──

export type SyncStatus = 'connecting' | 'synced' | 'offline';

export interface EditorState {
  isDirty: boolean;
  lastSaved: string | null;
  syncStatus: SyncStatus;
  wordCount: number;
  charCount: number;
}

// ── Command Palette ──

export type CommandItemType = 'file' | 'action' | 'navigation';

export interface CommandItem {
  id: string;
  type: CommandItemType;
  label: string;
  secondaryText?: string;
  icon?: string;
  action: () => void;
  keywords?: string[];
}

// ── Navigation ──

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  section: 'app' | 'personal' | 'system';
}
