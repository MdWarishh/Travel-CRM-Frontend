'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, Phone, Mail, Calendar, User, Users, DollarSign,
  Flame, Zap, Snowflake, FileText, Clock,
  MessageSquare, Bell, Briefcase, Copy, ClipboardList,
  MoreHorizontal, Pencil, Send, Navigation,
  UserPlus, RotateCcw, Trash2,
  ExternalLink, CheckCircle, Loader2, Save,
  Globe, TrendingUp, ArrowRight, AlertTriangle, Star,
} from 'lucide-react';
import { PipelineLead, LeadStage } from '@/types/leads.types';
import { leadsService } from '@/services/leads.service';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { FollowUpTab } from './FollowUpTab';
import { TaskTab } from './TaskTab';
import { MeetingTab } from './MeetingTab';
import { HistoryTab, QuotationTab, InvoiceTab } from './OtherTabs';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LeadDetailModalProps {
  lead: PipelineLead;
  stages: LeadStage[];
  onClose: () => void;
  onMoveStage: (leadId: string, stageId: string) => void;
}

type TabId = 'details' | 'followup' | 'history' | 'task' | 'meeting' | 'quotation' | 'invoice';

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  HOT:  { icon: Flame,     label: 'Hot',  cls: 'bg-red-100 text-red-700 border-red-300'       },
  WARM: { icon: Zap,       label: 'Warm', cls: 'bg-amber-100 text-amber-700 border-amber-300'  },
  COLD: { icon: Snowflake, label: 'Cold', cls: 'bg-sky-100 text-sky-700 border-sky-300'        },
} as const;

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'details',   label: 'Details',   icon: User          },
  { id: 'followup',  label: 'Follow Up', icon: Bell          },
  { id: 'history',   label: 'History',   icon: Clock         },
  { id: 'task',      label: 'Tasks',     icon: ClipboardList },
  { id: 'meeting',   label: 'Meetings',  icon: Briefcase     },
  { id: 'quotation', label: 'Quotation', icon: FileText      },
  { id: 'invoice',   label: 'Invoice',   icon: DollarSign    },
];

const WHATSAPP_TEMPLATES = [
  { id: 'greeting',  label: '👋 Initial Greeting',
    message: (l: PipelineLead) => `Hi ${l.name}! 👋 Thank you for your interest in traveling to *${l.destination || 'your dream destination'}*. I'm your dedicated travel consultant. When would you like to travel?` },
  { id: 'followup',  label: '😊 Follow-up',
    message: (l: PipelineLead) => `Hi ${l.name}! 😊 Just checking in on your travel plans. Have you had a chance to review the details we discussed?` },
  { id: 'itinerary', label: '🗺️ Itinerary Ready',
    message: (l: PipelineLead) => `Hi ${l.name}! 🗺️ Great news — your personalized itinerary for *${l.destination || 'your trip'}* is ready! Please let me know a good time to walk you through it.` },
  { id: 'payment',   label: '💳 Payment Reminder',
    message: (l: PipelineLead) => `Hi ${l.name}! 💳 Your booking for *${l.destination || 'your trip'}* is almost confirmed. Please complete the payment to secure your dates!` },
];

const EMAIL_TEMPLATES = [
  { id: 'quote', label: 'Package Quote',
    subject: (l: PipelineLead) => `Your Customized Travel Package – ${l.destination || 'Dream Destination'}`,
    body:    (l: PipelineLead) => `Dear ${l.name},\n\nThank you for reaching out! We're excited to help you plan your trip to ${l.destination || 'your chosen destination'}.\n\nWarm regards,\nTravel CRM Team`,
  },
  { id: 'followup', label: 'Follow-up',
    subject: () => `Following Up on Your Travel Inquiry`,
    body: (l: PipelineLead) => `Dear ${l.name},\n\nI hope this email finds you well! I wanted to follow up on your travel inquiry.\n\nBest regards,\nTravel CRM Team`,
  },
];

const SOURCES = ['WEBSITE','MANUAL','WHATSAPP','FACEBOOK','INSTAGRAM','MESSENGER','PHONE','OTHER'];

const fmtBudget = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const initials  = (name: string) => name.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

// ─── Interactive Star Rating ──────────────────────────────────────────────────
function StarRatingInput({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hover, setHover] = useState(0);
  const sz = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= (hover || value);
        return (
          <Star
            key={i}
            className={cn(
              sz, 'cursor-pointer transition-all duration-100',
              filled ? 'fill-amber-400 text-amber-400 scale-110' : 'fill-slate-200 text-slate-200 hover:fill-amber-300 hover:text-amber-300',
            )}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i === value ? 0 : i)}
          />
        );
      })}
      {value > 0 && (
        <span className="text-xs text-amber-600 font-bold ml-1">{value}/5</span>
      )}
    </div>
  );
}

// ─── Portal Overlay ───────────────────────────────────────────────────────────
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler); };
  }, [onClose]);

  if (typeof window === 'undefined') return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full bg-white flex flex-col rounded-2xl overflow-hidden"
        style={{
          maxWidth: '1200px',
          width: '100%',
          maxHeight: '92vh',
          boxShadow: '0 40px 120px rgba(0,0,0,0.32), 0 0 0 1px rgba(0,0,0,0.06)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

// ─── Small Modal ──────────────────────────────────────────────────────────────
function SmallModal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open || typeof window === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 overflow-y-auto"
        style={{ maxHeight: '90vh', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

// ─── Info Field Card ──────────────────────────────────────────────────────────
function InfoField({ label, value, icon: Icon, accent = false, fullWidth = false }: {
  label: string; value?: string | null; icon?: any; accent?: boolean; fullWidth?: boolean;
}) {
  return (
    <div className={cn(
      'flex flex-col gap-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all duration-200',
      fullWidth && 'col-span-full'
    )}>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">{label}</span>
      </div>
      <span className={cn(
        'text-[14px] font-semibold leading-snug break-words',
        value ? (accent ? 'text-indigo-700' : 'text-slate-800') : 'text-slate-300 italic text-sm font-normal'
      )}>
        {value || 'Not provided'}
      </span>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, icon: Icon }: { title: string; icon?: any }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      {Icon && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Icon className="w-4 h-4 text-white" />
        </div>
      )}
      <h3 className="text-[13px] font-black text-slate-600 tracking-[0.08em] uppercase">{title}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
    </div>
  );
}

// ─── WhatsApp Panel ───────────────────────────────────────────────────────────
function WhatsAppPanel({ lead }: { lead: PipelineLead }) {
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const send = () => {
    if (!msg.trim()) return;
    window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    setSent(true); setTimeout(() => setSent(false), 3000);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-green-800">WhatsApp Message</p>
          <p className="text-xs text-green-600 font-mono mt-0.5">{lead.phone}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {WHATSAPP_TEMPLATES.map((t) => (
          <button key={t.id} onClick={() => setMsg(t.message(lead))}
            className="text-left px-3 py-2.5 bg-white hover:bg-green-50 border border-slate-200 hover:border-green-300 rounded-xl text-[12px] text-slate-600 transition-all font-semibold shadow-sm">
            {t.label}
          </button>
        ))}
      </div>
      <Textarea rows={5} value={msg} onChange={(e) => setMsg(e.target.value)}
        placeholder="Type your message or pick a template above…"
        className="resize-none text-sm border-slate-200 rounded-xl" />
      {sent && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700 font-semibold">WhatsApp opened!</span>
        </div>
      )}
      <Button onClick={send} disabled={!msg.trim()}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2 rounded-xl h-11 font-semibold">
        <ExternalLink className="w-4 h-4" /> Open WhatsApp & Send
      </Button>
    </div>
  );
}

// ─── Email Panel ──────────────────────────────────────────────────────────────
function EmailPanel({ lead }: { lead: PipelineLead }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const send = () => {
    if (!lead.email) return;
    window.open(`mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-800">Send Email</p>
          {lead.email
            ? <p className="text-xs text-blue-600 mt-0.5">{lead.email}</p>
            : <p className="text-xs text-red-500 font-bold mt-0.5">No email on record</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {EMAIL_TEMPLATES.map((t) => (
          <button key={t.id} onClick={() => { setSubject(t.subject(lead)); setBody(t.body(lead)); }}
            className="text-left px-3 py-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-[12px] text-slate-600 transition-all font-semibold shadow-sm">
            {t.label}
          </button>
        ))}
      </div>
      <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject…"
        className="text-sm border-slate-200 rounded-xl h-11" />
      <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Email body…"
        className="resize-none text-sm border-slate-200 rounded-xl" />
      <Button onClick={send} disabled={!subject.trim() || !body.trim() || !lead.email}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 rounded-xl h-11 font-semibold">
        <ExternalLink className="w-4 h-4" /> Open Email Client
      </Button>
    </div>
  );
}

// ─── Edit Lead Form ───────────────────────────────────────────────────────────
function EditLeadForm({ lead, stages, onDone }: { lead: PipelineLead; stages: LeadStage[]; onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: lead.name ?? '', phone: lead.phone ?? '', email: lead.email ?? '',
    destination: lead.destination ?? '', estimatedBudget: lead.estimatedBudget?.toString() ?? '',
    travelDate: lead.travelDate ? lead.travelDate.split('T')[0] : '',
    numberOfTravelers: lead.numberOfTravelers?.toString() ?? '',
    priority: lead.priority ?? 'WARM', source: lead.source ?? 'MANUAL', notes: lead.notes ?? '',
    rating: lead.rating ?? 0,
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => leadsService.update(lead.id, data),
    onSuccess: () => {
      toast.success('Lead updated');
      qc.invalidateQueries({ queryKey: ['leads-pipeline'] });
      onDone();
    },
    onError: () => toast.error('Failed to update lead'),
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim()) { toast.error('Name and phone required'); return; }
    const p: any = {
      name: form.name, phone: form.phone, source: form.source,
      priority: form.priority, rating: form.rating,
    };
    if (form.email)             p.email             = form.email;
    if (form.destination)       p.destination       = form.destination;
    if (form.estimatedBudget)   p.estimatedBudget   = Number(form.estimatedBudget);
    if (form.travelDate)        p.travelDate        = form.travelDate;
    if (form.numberOfTravelers) p.numberOfTravelers = Number(form.numberOfTravelers);
    if (form.notes)             p.notes             = form.notes;
    updateMut.mutate(p);
  };

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
          <Pencil className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">Edit Lead Details</h3>
          <p className="text-xs text-slate-400">Update info and save changes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { key: 'name',             label: 'Full Name *',      type: 'text',   ph: 'Enter full name'   },
          { key: 'phone',            label: 'Phone Number *',   type: 'tel',    ph: '+91 XXXXX XXXXX'   },
          { key: 'email',            label: 'Email Address',    type: 'email',  ph: 'email@example.com' },
          { key: 'destination',      label: 'Destination',      type: 'text',   ph: 'e.g. Goa, Bali…'  },
          { key: 'estimatedBudget',  label: 'Budget (₹)',       type: 'number', ph: '0'                 },
          { key: 'travelDate',       label: 'Travel Date',      type: 'date',   ph: ''                  },
          { key: 'numberOfTravelers',label: 'No. of Travelers', type: 'number', ph: '1'                 },
        ].map(({ key, label, type, ph }) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</Label>
            <Input type={type} value={(form as any)[key]} onChange={(e) => set(key, e.target.value)} placeholder={ph}
              className="border-slate-200 text-sm h-10 rounded-xl" />
          </div>
        ))}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Source</Label>
          <Select value={form.source} onValueChange={(v) => set('source', v)}>
            <SelectTrigger className="border-slate-200 text-sm h-10 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s} className="text-sm">{s.charAt(0)+s.slice(1).toLowerCase().replace('_',' ')}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Priority</Label>
          <Select value={form.priority} onValueChange={(v) => set('priority', v)}>
            <SelectTrigger className="border-slate-200 text-sm h-10 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="HOT">🔥 Hot</SelectItem>
              <SelectItem value="WARM">⚡ Warm</SelectItem>
              <SelectItem value="COLD">❄️ Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rating in edit form */}
      <div className="space-y-2">
        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Lead Rating</Label>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <StarRatingInput value={form.rating} onChange={(v) => set('rating', v)} size="lg" />
          <p className="text-xs text-slate-400 mt-2">Rate this lead's quality (1 = low, 5 = excellent)</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Notes / Comments</Label>
        <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3}
          placeholder="Add notes about this lead…" className="border-slate-200 text-sm resize-none rounded-xl" />
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
        <Button size="sm" variant="outline" onClick={onDone} className="h-10 px-6 rounded-xl">Cancel</Button>
        <Button size="sm" onClick={handleSave} disabled={updateMut.isPending}
          className="h-10 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white gap-2 rounded-xl shadow-md">
          {updateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function LeadDetailModal({ lead, stages, onClose, onMoveStage }: LeadDetailModalProps) {
  const qc = useQueryClient();
  const [activeTab,      setActiveTab]      = useState<TabId>('details');
  const [isEditing,      setIsEditing]      = useState(false);
  const [whatsappOpen,   setWhatsappOpen]   = useState(false);
  const [emailOpen,      setEmailOpen]      = useState(false);
  const [confirmDelete,  setConfirmDelete]  = useState(false);
  const [confirmConvert, setConfirmConvert] = useState(false);

  const priority   = PRIORITY_CONFIG[lead.priority] ?? PRIORITY_CONFIG.WARM;
  const PIcon      = priority.icon;
  const stageColor = lead.stage?.color ?? '#4f46e5';

  const deleteMut = useMutation({
    mutationFn: () => leadsService.delete(lead.id),
    onSuccess: () => {
      toast.success('Lead deleted');
      qc.invalidateQueries({ queryKey: ['leads-pipeline'] });
      onClose();
    },
    onError: () => toast.error('Failed to delete lead'),
  });

  const convertMut = useMutation({
    mutationFn: () => leadsService.convertToCustomer(lead.id),
    onSuccess: (result) => {
  toast.success('✅ Lead converted to customer!', { duration: 3000 });
   qc.invalidateQueries({ queryKey: ['leads-pipeline'] });
  qc.invalidateQueries({ queryKey: ['customers'] });  // ← YE ADD KARO
   onClose();
 },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Conversion failed'),
  });

  // Inline rating update from detail modal header
  const ratingMut = useMutation({
    mutationFn: (rating: number) => leadsService.updateRating(lead.id, rating),
    onMutate: async (rating) => {
      await qc.cancelQueries({ queryKey: ['leads-pipeline'] });
      // Optimistic update in pipeline
      qc.setQueryData(['leads-pipeline'], (old: any) => {
        if (!old) return old;
        return old.map((col: any) => ({
          ...col,
          leads: col.leads.map((l: any) =>
            l.id === lead.id ? { ...l, rating } : l
          ),
        }));
      });
    },
    onError: () => toast.error('Failed to update rating'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['leads-pipeline'] }),
  });

  const quickWhatsApp = () => {
    const phone = lead.phone.replace(/\D/g, '');
    const msg = [
      `📋 *Lead Details*`, ``,
      `👤 *Name:* ${lead.name}`,
      `📞 *Phone:* ${lead.phone}`,
      lead.email             ? `✉️ *Email:* ${lead.email}` : '',
      lead.destination       ? `📍 *Destination:* ${lead.destination}` : '',
      lead.travelDate        ? `📅 *Travel Date:* ${new Date(lead.travelDate).toLocaleDateString('en-IN')}` : '',
      lead.numberOfTravelers ? `👥 *Travelers:* ${lead.numberOfTravelers}` : '',
      lead.estimatedBudget   ? `💰 *Budget:* ${fmtBudget(lead.estimatedBudget)}` : '',
      ``, `_Sent via Travel CRM_`,
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const quickEmail = () => {
    if (!lead.email) return;
    window.open(`mailto:${lead.email}?subject=${encodeURIComponent(`Lead Details – ${lead.name}`)}`);
  };

  const switchTab = (id: TabId) => { setActiveTab(id); setIsEditing(false); };

  return (
    <>
      <ModalOverlay onClose={onClose}>

        {/* ── HERO HEADER ───────────────────────────────────── */}
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{ background: `linear-gradient(135deg, #1a1760 0%, #2d2a9e 50%, ${stageColor}cc 100%)` }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-14 -right-14 w-72 h-72 rounded-full border border-white/8" />
            <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full border border-white/6" />
          </div>

          <div className="relative px-8 py-7">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-5 min-w-0 flex-1">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0 shadow-xl ring-2 ring-white/20 select-none"
                  style={{ background: `linear-gradient(135deg, ${stageColor}88, ${stageColor})` }}
                >
                  {initials(lead.name)}
                </div>

                <div className="min-w-0 space-y-2 flex-1">
                  <h1 className="text-white text-2xl font-black tracking-tight leading-tight">{lead.name}</h1>

                  <div className="flex items-center gap-5 flex-wrap">
                    <a href={`tel:${lead.phone}`}
                      className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-semibold group">
                      <Phone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span className="font-mono">{lead.phone}</span>
                    </a>
                    {lead.email && (
                      <a href={`mailto:${lead.email}`}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-semibold group">
                        <Mail className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span className="truncate max-w-xs">{lead.email}</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {lead.stage && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-white/15 text-white font-bold border border-white/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/70" />{lead.stage.title}
                      </span>
                    )}
                    <span className={cn('inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full font-bold border', priority.cls)}>
                      <PIcon className="w-3 h-3" />{priority.label}
                    </span>
                    {lead.estimatedBudget && lead.estimatedBudget > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 font-bold border border-emerald-400/25">
                        <DollarSign className="w-3 h-3" />{fmtBudget(lead.estimatedBudget)}
                      </span>
                    )}
                    {lead.convertedCustomerId && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 font-bold border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3" /> Converted
                      </span>
                    )}
                  </div>

                  {/* Star Rating in header */}
                  <div className="flex items-center gap-2 pt-1">
                    <StarRatingInput
                      value={lead.rating ?? 0}
                      onChange={(v) => ratingMut.mutate(v)}
                      size="sm"
                    />
                    {ratingMut.isPending && <Loader2 className="w-3 h-3 animate-spin text-white/60" />}
                  </div>
                </div>
              </div>

              <button onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-all flex-shrink-0 border border-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick info chips */}
            {(lead.destination || lead.travelDate || lead.numberOfTravelers || lead.assignedTo) && (
              <div className="mt-5 flex items-center gap-3 flex-wrap">
                {lead.destination && (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15">
                    <Navigation className="w-3.5 h-3.5 text-white/60" />
                    <span className="text-white text-xs font-bold">{lead.destination}</span>
                  </div>
                )}
                {lead.travelDate && (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15">
                    <Calendar className="w-3.5 h-3.5 text-white/60" />
                    <span className="text-white text-xs font-bold">
                      {new Date(lead.travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
                {lead.numberOfTravelers && (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15">
                    <Users className="w-3.5 h-3.5 text-white/60" />
                    <span className="text-white text-xs font-bold">{lead.numberOfTravelers} Travelers</span>
                  </div>
                )}
                {lead.assignedTo && (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15">
                    <User className="w-3.5 h-3.5 text-white/60" />
                    <span className="text-white text-xs font-bold">{lead.assignedTo.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── ACTION TOOLBAR ────────────────────────────────── */}
        <div className="flex-shrink-0 px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-1 flex-wrap">
          <TooltipProvider>
            {[
              { icon: Pencil,    label: 'Edit Lead',           fn: () => { switchTab('details'); setIsEditing(true); }, color: 'hover:bg-indigo-50 hover:text-indigo-700' },
              { icon: Send,      label: 'WhatsApp',             fn: () => setWhatsappOpen(true),    color: 'hover:bg-green-50 hover:text-green-700' },
              { icon: Mail,      label: 'Send Email',           fn: () => setEmailOpen(true),        color: 'hover:bg-sky-50 hover:text-sky-700' },
              { icon: UserPlus,  label: 'Assign Agent',         fn: undefined,                       color: 'hover:bg-violet-50 hover:text-violet-700' },
              { icon: Trash2,    label: 'Delete Lead',          fn: () => setConfirmDelete(true),    color: 'hover:bg-red-50 hover:text-red-600' },
              { icon: RotateCcw, label: 'Convert to Customer',  fn: lead.convertedCustomerId ? undefined : () => setConfirmConvert(true), color: 'hover:bg-orange-50 hover:text-orange-600' },
            ].map(({ icon: IC, label, fn, color }: any, i) => (
              <div key={label} className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={fn} disabled={!fn}
                      className={cn(
                        'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-500 text-[12.5px] font-semibold transition-all duration-150 disabled:opacity-30',
                        color
                      )}>
                      <IC className="w-[14px] h-[14px] flex-shrink-0" />
                      <span className="hidden lg:inline">{label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs font-medium">{label}</TooltipContent>
                </Tooltip>
                {(i === 0 || i === 2) && <div className="w-px h-5 bg-slate-200 mx-1" />}
              </div>
            ))}
          </TooltipProvider>

          {/* More dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-[12.5px] font-semibold transition-all">
                <MoreHorizontal className="w-4 h-4" />
                <span className="hidden md:inline text-xs">More</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl p-1.5">
              {[
                { fn: () => window.open(`tel:${lead.phone}`), icon: Phone, label: 'Call Lead', bg: 'bg-blue-100 text-blue-600' },
                { fn: quickEmail, icon: Mail, label: 'Send Mail', bg: 'bg-red-100 text-red-600' },
                { fn: quickWhatsApp, icon: MessageSquare, label: 'WhatsApp', bg: 'bg-green-100 text-green-600' },
              ].map(({ fn, icon: I, label, bg }) => (
                <DropdownMenuItem key={label} onClick={fn} className="cursor-pointer gap-3 py-2.5 px-3 rounded-lg">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', bg)}><I className="w-4 h-4" /></div>
                  <span className="text-[13px] font-medium">{label}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="my-1.5" />
              {[
                { fn: () => switchTab('task'),      icon: ClipboardList, label: 'Create Task',      bg: 'bg-blue-100 text-blue-600'      },
                { fn: () => switchTab('meeting'),   icon: Briefcase,     label: 'Schedule Meeting',  bg: 'bg-orange-100 text-orange-600'  },
                { fn: () => switchTab('quotation'), icon: FileText,      label: 'Create Quotation',  bg: 'bg-pink-100 text-pink-600'      },
                { fn: () => switchTab('invoice'),   icon: FileText,      label: 'Create Invoice',    bg: 'bg-emerald-100 text-emerald-600' },
              ].map(({ fn, icon: I, label, bg }) => (
                <DropdownMenuItem key={label} onClick={fn} className="cursor-pointer gap-3 py-2.5 px-3 rounded-lg">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', bg)}><I className="w-4 h-4" /></div>
                  <span className="text-[13px] font-medium">{label}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="my-1.5" />
              <DropdownMenuItem onClick={() => {
                const text = [`Name: ${lead.name}`, `Phone: ${lead.phone}`, lead.email ? `Email: ${lead.email}` : '', lead.destination ? `Dest: ${lead.destination}` : ''].filter(Boolean).join('\n');
                navigator.clipboard.writeText(text);
                toast.success('Copied!');
              }} className="cursor-pointer gap-3 py-2.5 px-3 rounded-lg">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-yellow-100 text-yellow-600"><Copy className="w-4 h-4" /></div>
                <span className="text-[13px] font-medium">Copy Lead Info</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── TAB BAR ───────────────────────────────────────── */}
        <div className="flex-shrink-0 px-6 bg-white border-b border-slate-100 flex items-center overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const TI = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => switchTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3.5 text-[13px] font-semibold border-b-2 whitespace-nowrap transition-all -mb-px flex-shrink-0',
                  active
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/60'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 hover:border-slate-200',
                )}>
                <TI className={cn('w-4 h-4 flex-shrink-0', active ? 'text-indigo-500' : 'text-slate-300')} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT ───────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto" style={{ backgroundColor: '#f8fafc' }}>
          <div className="p-8">

            {activeTab === 'details' && (
              isEditing
                ? <EditLeadForm lead={lead} stages={stages} onDone={() => setIsEditing(false)} />
                : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* Left — Lead Info */}
                    <div>
                      <SectionHeader title="Lead Information" icon={User} />
                      <div className="grid grid-cols-2 gap-3">
                        <InfoField label="Full Name"        value={lead.name}                          icon={User}          accent />
                        <InfoField label="Phone Number"     value={lead.phone}                         icon={Phone}         />
                        <InfoField label="Email Address"    value={lead.email}                         icon={Mail}          />
                        <InfoField label="Destination"      value={lead.destination}                   icon={Navigation}    />
                        <InfoField label="No. of Travelers" value={lead.numberOfTravelers?.toString()} icon={Users}         />
                        <InfoField label="Assigned To"      value={lead.assignedTo?.name}              icon={UserPlus}      />
                        <InfoField label="Notes / Comments" value={lead.notes}                         icon={MessageSquare} fullWidth />
                      </div>

                      {/* Rating card in details */}
                      <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] mb-2 flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-slate-400" /> Lead Rating
                        </p>
                        <StarRatingInput
                          value={lead.rating ?? 0}
                          onChange={(v) => ratingMut.mutate(v)}
                          size="md"
                        />
                        <p className="text-[11px] text-slate-400 mt-1.5">
                          {lead.rating ? `Rated ${lead.rating}/5 stars` : 'Not rated yet — click to rate'}
                        </p>
                      </div>
                    </div>

                    {/* Right — General Info + Stage Mover */}
                    <div className="space-y-8">
                      <div>
                        <SectionHeader title="General Information" icon={FileText} />
                        <div className="grid grid-cols-2 gap-3">
                          <InfoField label="Created At"
                            value={new Date(lead.createdAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            icon={Clock} />
                          <InfoField label="Travel Date"
                            value={lead.travelDate ? new Date(lead.travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined}
                            icon={Calendar} />
                          <InfoField label="Current Stage"    value={lead.stage?.title}     icon={TrendingUp} accent />
                          <InfoField label="Source"
                            value={lead.source ? lead.source.charAt(0) + lead.source.slice(1).toLowerCase().replace('_', ' ') : undefined}
                            icon={Globe} />
                          <InfoField label="Priority"         value={lead.priority}          icon={Flame}      />
                          <InfoField label="Estimated Budget"
                            value={lead.estimatedBudget ? fmtBudget(lead.estimatedBudget) : '₹ 0.00'}
                            icon={DollarSign} accent />
                        </div>
                      </div>

                      {stages.length > 0 && (
                        <div>
                          <SectionHeader title="Move to Stage" icon={ArrowRight} />
                          <div className="flex flex-wrap gap-2">
                            {stages.map((s) => (
                              <button key={s.id} onClick={() => onMoveStage(lead.id, s.id)}
                                className={cn(
                                  'inline-flex items-center gap-2 text-[12px] px-4 py-2 rounded-xl text-white font-bold transition-all duration-150 hover:opacity-90 hover:scale-105 active:scale-95 shadow-sm',
                                  lead.stageId === s.id && 'ring-2 ring-offset-2 ring-white shadow-lg'
                                )}
                                style={{ backgroundColor: s.color }}>
                                {lead.stageId === s.id && <CheckCircle className="w-3.5 h-3.5" />}
                                {s.title}
                                {(s as any).isWon && <span className="text-[9px] bg-white/25 px-1 rounded">WON</span>}
                              </button>
                            ))}
                          </div>
                          {stages.find(s => (s as any).isWon) && !lead.convertedCustomerId && (
                            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                              <span className="text-amber-500">⚡</span>
                              Moving to Won stage will automatically convert this lead to a customer
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
            )}

            {activeTab === 'followup'  && <FollowUpTab lead={lead} />}
            {activeTab === 'history'   && <HistoryTab lead={lead} />}
            {activeTab === 'task'      && <TaskTab lead={lead} />}
            {activeTab === 'meeting'   && <MeetingTab lead={lead} />}
            {activeTab === 'quotation' && <QuotationTab lead={lead} />}
            {activeTab === 'invoice'   && <InvoiceTab lead={lead} />}
          </div>
        </div>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center justify-between px-8 py-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <Button size="sm" variant="outline" onClick={quickWhatsApp}
              className="h-9 gap-2 border-green-200 text-green-700 hover:bg-green-50 rounded-xl px-4 font-semibold">
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </Button>
            <Button size="sm" variant="outline" onClick={quickEmail} disabled={!lead.email}
              className="h-9 gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl px-4 font-semibold disabled:opacity-40">
              <Mail className="w-3.5 h-3.5" /> Email
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.open(`tel:${lead.phone}`)}
              className="h-9 gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-4 font-semibold">
              <Phone className="w-3.5 h-3.5" /> Call
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}
            className="h-9 px-6 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold">
            Close
          </Button>
        </div>
      </ModalOverlay>

      {/* Sub-modals */}
      <SmallModal open={whatsappOpen} onClose={() => setWhatsappOpen(false)} title="Send WhatsApp Message">
        <WhatsAppPanel lead={lead} />
      </SmallModal>
      <SmallModal open={emailOpen} onClose={() => setEmailOpen(false)} title="Send Email">
        <EmailPanel lead={lead} />
      </SmallModal>

      <SmallModal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete Lead">
        <div className="space-y-5">
          <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-100 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed pt-1.5">
              Are you sure you want to delete <span className="font-bold text-slate-800">{lead.name}</span>?
              This action <span className="text-red-600 font-bold">cannot be undone</span>.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setConfirmDelete(false)} className="rounded-xl h-10 px-5">Cancel</Button>
            <Button variant="destructive" disabled={deleteMut.isPending} onClick={() => deleteMut.mutate()} className="rounded-xl h-10 px-5 gap-2">
              {deleteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Lead
            </Button>
          </div>
        </div>
      </SmallModal>

      <SmallModal open={confirmConvert} onClose={() => setConfirmConvert(false)} title="Convert to Customer">
        <div className="space-y-5">
          <div className="flex items-start gap-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed pt-1.5">
              Convert <span className="font-bold text-slate-800">{lead.name}</span> to a customer?
              A new customer profile will be created automatically.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setConfirmConvert(false)} className="rounded-xl h-10 px-5">Cancel</Button>
            <Button disabled={convertMut.isPending} onClick={() => convertMut.mutate()}
              className="rounded-xl h-10 px-5 gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
              {convertMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Convert to Customer
            </Button>
          </div>
        </div>
      </SmallModal>
    </>
  );
}