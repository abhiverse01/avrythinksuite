'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Users, GraduationCap, User, ClipboardList, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Types ── */

type Category = 'All' | 'Business' | 'Education' | 'Personal' | 'Reports';

interface DocTemplate {
  id: string;
  name: string;
  category: Exclude<Category, 'All'>;
  icon: React.ElementType;
  html: string;
}

interface DocTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (html: string) => void;
}

/* ── Templates ── */

const TEMPLATES: DocTemplate[] = [
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    category: 'Business',
    icon: Users,
    html: `<h1>Meeting Notes</h1>
<h2>Meeting Details</h2>
<table><tr><th>Date</th><td><p>${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></td></tr><tr><th>Time</th><td><p></p></td></tr><tr><th>Location</th><td><p></p></td></tr><tr><th>Facilitator</th><td><p></p></td></tr></table>
<h2>Attendees</h2>
<ul><li></li><li></li><li></li></ul>
<h2>Agenda</h2>
<ol><li></li><li></li><li></li></ol>
<h2>Discussion Notes</h2>
<h3></h3><p></p>
<h3></h3><p></p>
<h2>Action Items</h2>
<table><tr><th>Task</th><th>Assignee</th><th>Due Date</th></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td></tr></table>
<h2>Next Meeting</h2>
<p></p>`,
  },
  {
    id: 'project-brief',
    name: 'Project Brief',
    category: 'Business',
    icon: Briefcase,
    html: `<h1>Project Brief</h1>
<h2>Project Overview</h2>
<p></p>
<h2>Goals &amp; Objectives</h2>
<ul><li></li><li></li><li></li></ul>
<h2>Target Audience</h2>
<p></p>
<h2>Timeline</h2>
<table><tr><th>Phase</th><th>Start</th><th>End</th><th>Status</th></tr><tr><td><p>Discovery</p></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><p>Design</p></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><p>Development</p></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><p>Launch</p></td><td><p></p></td><td><p></p></td><td><p></p></td></tr></table>
<h2>Key Stakeholders</h2>
<ul><li></li><li></li></ul>
<h2>Budget</h2>
<p></p>
<h2>Success Metrics</h2>
<ul><li></li><li></li><li></li></ul>`,
  },
  {
    id: 'weekly-report',
    name: 'Weekly Report',
    category: 'Reports',
    icon: ClipboardList,
    html: `<h1>Weekly Report</h1>
<p><em>Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</em></p>
<h2>Summary</h2>
<p></p>
<h2>Key Accomplishments</h2>
<ul><li></li><li></li><li></li></ul>
<h2>In Progress</h2>
<ul><li></li><li></li></ul>
<h2>Blockers &amp; Challenges</h2>
<ul><li></li><li></li></ul>
<h2>Metrics</h2>
<table><tr><th>Metric</th><th>Target</th><th>Actual</th></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td></tr></table>
<h2>Plans for Next Week</h2>
<ol><li></li><li></li><li></li></ol>
<h2>Notes</h2>
<p></p>`,
  },
  {
    id: 'lesson-plan',
    name: 'Lesson Plan',
    category: 'Education',
    icon: GraduationCap,
    html: `<h1>Lesson Plan</h1>
<h2>Lesson Information</h2>
<table><tr><th>Subject</th><td><p></p></td></tr><tr><th>Grade Level</th><td><p></p></td></tr><tr><th>Duration</th><td><p></p></td></tr><tr><th>Date</th><td><p></p></td></tr></table>
<h2>Learning Objectives</h2>
<p>By the end of this lesson, students will be able to:</p>
<ul><li></li><li></li><li></li></ul>
<h2>Materials Needed</h2>
<ul><li></li><li></li><li></li></ul>
<h2>Lesson Procedure</h2>
<h3>Introduction (10 min)</h3><p></p>
<h3>Direct Instruction (15 min)</h3><p></p>
<h3>Guided Practice (15 min)</h3><p></p>
<h3>Independent Practice (10 min)</h3><p></p>
<h3>Closure (5 min)</h3><p></p>
<h2>Assessment</h2>
<p></p>
<h2>Differentiation</h2>
<p></p>`,
  },
  {
    id: 'research-paper',
    name: 'Research Paper',
    category: 'Education',
    icon: GraduationCap,
    html: `<h1>Research Paper Title</h1>
<p><em>Author Name — Institution — Date</em></p>
<h2>Abstract</h2>
<p></p>
<h2>1. Introduction</h2>
<p></p>
<h2>2. Literature Review</h2>
<h3>2.1 Background</h3><p></p>
<h3>2.2 Related Work</h3><p></p>
<h2>3. Methodology</h2>
<h3>3.1 Research Design</h3><p></p>
<h3>3.2 Data Collection</h3><p></p>
<h3>3.3 Analysis</h3><p></p>
<h2>4. Findings</h2>
<h3>4.1 Results</h3><p></p>
<h3>4.2 Discussion</h3><p></p>
<h2>5. Conclusion</h2>
<p></p>
<h2>6. References</h2>
<p></p>`,
  },
  {
    id: 'resume',
    name: 'Resume',
    category: 'Personal',
    icon: User,
    html: `<h1>First Last</h1>
<p>email@example.com | (555) 123-4567 | City, State | linkedin.com/in/yourname</p>
<h2>Professional Summary</h2>
<p></p>
<h2>Experience</h2>
<h3>Job Title — Company Name</h3>
<p><em>Month Year – Present</em></p>
<ul><li></li><li></li><li></li></ul>
<h3>Job Title — Previous Company</h3>
<p><em>Month Year – Month Year</em></p>
<ul><li></li><li></li><li></li></ul>
<h2>Education</h2>
<h3>Degree — University Name</h3>
<p><em>Graduation Year</em></p>
<p></p>
<h2>Skills</h2>
<ul><li></li><li></li><li></li><li></li><li></li></ul>
<h2>Awards &amp; Certifications</h2>
<ul><li></li><li></li></ul>`,
  },
  {
    id: 'invoice',
    name: 'Invoice',
    category: 'Business',
    icon: FileText,
    html: `<h1>Invoice</h1>
<table><tr><th style="width:50%">From</th><th style="width:50%">Bill To</th></tr><tr><td><p><strong>Company Name</strong></p><p>123 Business St</p><p>City, State ZIP</p></td><td><p><strong>Client Name</strong></p><p>456 Client Ave</p><p>City, State ZIP</p></td></tr></table>
<p><strong>Invoice #:</strong> 001 &nbsp;&nbsp; <strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &nbsp;&nbsp; <strong>Due:</strong> </p>
<table><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td><td><p></p></td></tr></table>
<p style="text-align:right"><strong>Subtotal: $</strong></p>
<p style="text-align:right"><strong>Tax: $</strong></p>
<p style="text-align:right"><strong>Total Due: $</strong></p>
<h2>Terms &amp; Conditions</h2>
<p>Payment is due within 30 days of invoice date. Late payments may be subject to a 2% monthly fee.</p>`,
  },
  {
    id: 'letter',
    name: 'Letter',
    category: 'Personal',
    icon: FileText,
    html: `<h1>Your Name</h1>
<p>123 Your Street<br/>City, State ZIP<br/>email@example.com<br/>(555) 123-4567</p>
<p>${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
<p>Recipient Name<br/>Title<br/>Company Name<br/>456 Company Ave<br/>City, State ZIP</p>
<h2>Dear Recipient,</h2>
<p></p>
<p></p>
<p></p>
<p></p>
<p></p>
<p>Sincerely,</p>
<p></p>
<p><strong>Your Name</strong></p>`,
  },
  {
    id: 'blog-post',
    name: 'Blog Post',
    category: 'Personal',
    icon: FileText,
    html: `<h1>Your Blog Post Title Goes Here</h1>
<p><em>By Author Name · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · X min read</em></p>
<hr/>
<p></p>
<h2>Introduction</h2>
<p></p>
<p></p>
<h2>Section One</h2>
<p></p>
<p></p>
<h3>Subsection</h3>
<p></p>
<h2>Section Two</h2>
<p></p>
<p></p>
<h2>Conclusion</h2>
<p></p>
<p></p>
<hr/>
<p><em>Have thoughts on this topic? Share them below or reach out on social media.</em></p>`,
  },
  {
    id: 'proposal',
    name: 'Proposal',
    category: 'Business',
    icon: Briefcase,
    html: `<h1>Proposal</h1>
<p><em>Prepared for: Client Name — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</em></p>
<h2>Executive Summary</h2>
<p></p>
<h2>Problem Statement</h2>
<p></p>
<h2>Proposed Solution</h2>
<h3>Approach</h3><p></p>
<h3>Deliverables</h3>
<ul><li></li><li></li><li></li></ul>
<h2>Pricing</h2>
<table><tr><th>Item</th><th>Description</th><th>Cost</th></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td></tr></table>
<p><strong>Total: $</strong></p>
<h2>Timeline</h2>
<table><tr><th>Phase</th><th>Duration</th><th>Description</th></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td></tr></table>
<h2>Next Steps</h2>
<ol><li></li><li></li><li></li></ol>`,
  },
];

const CATEGORIES: Category[] = ['All', 'Business', 'Education', 'Personal', 'Reports'];

const CATEGORY_COLORS: Record<string, string> = {
  Business: 'bg-amber-50 text-amber-700 border-amber-200',
  Education: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Personal: 'bg-violet-50 text-violet-700 border-violet-200',
  Reports: 'bg-sky-50 text-sky-700 border-sky-200',
};

/* ════════════════════════════════════════════════════
   DOC TEMPLATES MODAL
   ════════════════════════════════════════════════════ */

export function DocTemplatesModal({ open, onOpenChange, onSelect }: DocTemplatesModalProps) {
  const [category, setCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const matchCategory = category === 'All' || t.category === category;
      const matchSearch =
        !search || t.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [category, search]);

  const handleSelect = (html: string) => {
    onSelect(html);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0" showCloseButton>
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-lg">Start with a Template</DialogTitle>
          <DialogDescription className="text-sm">
            Choose a template to get started quickly
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-4 flex flex-col gap-3 overflow-hidden">
          {/* ── Search ── */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
            />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] pl-9 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          {/* ── Category Filter ── */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  category === cat
                    ? 'bg-[#FF3333] text-white'
                    : 'bg-[var(--color-bg-overlay)] text-[var(--color-text-secondary)] hover:bg-[var(--color-active)] hover:text-[var(--color-text-primary)]',
                )}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Template Grid ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText size={32} className="text-[var(--color-text-tertiary)] opacity-40 mb-2" />
              <span className="text-sm text-[var(--color-text-tertiary)]">
                No templates match your search
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((template) => {
                const Icon = template.icon;
                const isHovered = hoveredId === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    className="group relative flex flex-col items-start gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 text-left transition-all hover:border-[var(--color-border-strong)] hover:shadow-sm"
                    onClick={() => handleSelect(template.html)}
                    onMouseEnter={() => setHoveredId(template.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-md bg-[var(--color-bg-overlay)]">
                        <Icon size={16} className="text-[#FF3333]" />
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        {template.name}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('text-[10px] border px-1.5 py-0', CATEGORY_COLORS[template.category])}
                    >
                      {template.category}
                    </Badge>
                    {isHovered && (
                      <span className="absolute bottom-3 right-3 text-[10px] font-medium text-[#FF3333] opacity-0 transition-opacity group-hover:opacity-100">
                        Use template →
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
