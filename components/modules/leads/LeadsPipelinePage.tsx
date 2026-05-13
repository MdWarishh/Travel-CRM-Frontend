'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { leadsService, leadStagesService } from '@/services/leads.service';
import type { PipelineColumn, PipelineLead, LeadStage, CreateStageData } from '@/types/leads.types';
import { AddLeadModal } from '@/components/modules/leads/AddLeadModal';
import { ImportLeadModal } from '@/components/modules/leads/ImportLeadModal';
import {
  Plus, X, Phone, Mail, MapPin, Calendar, Users, DollarSign,
  Flame, Zap, Snowflake, MoreHorizontal, Search, RefreshCw,
  Pencil, Trash2, AlertCircle, Loader2, Star, Tag,
  TrendingUp, UserPlus, RotateCcw, Navigation, ChevronDown,
  SlidersHorizontal, CheckCircle2, FileSpreadsheet,
  Share2, Copy, ExternalLink, Link2, Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { toast } from 'sonner';
import { LeadDetailModal } from '@/components/modules/leads/LeadDetailModal';

// ─── Priority Config ──────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  HOT:  { icon: Flame,     label: 'Hot',  dot: '#ef4444', badge: 'bg-red-50 text-red-600 border-red-200'     },
  WARM: { icon: Zap,       label: 'Warm', dot: '#f97316', badge: 'bg-orange-50 text-orange-600 border-orange-200' },
  COLD: { icon: Snowflake, label: 'Cold', dot: '#3b82f6', badge: 'bg-blue-50 text-blue-600 border-blue-200'   },
} as const;

const SOURCE_MAP: Record<string, string> = {
  WEBSITE: 'Website', MANUAL: 'Manual', WHATSAPP: 'WhatsApp',
  FACEBOOK: 'Facebook', INSTAGRAM: 'Instagram', MESSENGER: 'Messenger',
  PHONE: 'Phone', OTHER: 'Other',
};

const initials = (name: string) =>
  name.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const fmtBudget = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}k`;

// ─── Interactive Star Rating ──────────────────────────────────────────────────
function StarRating({
  value = 0,
  max = 5,
  editable = false,
  onRate,
  size = 'sm',
}: {
  value?: number;
  max?: number;
  editable?: boolean;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'xs';
}) {
  const [hover, setHover] = useState(0);
  const iconSize = size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < (editable ? hover || value : value);
        return (
          <Star
            key={i}
            className={cn(
              iconSize,
              'transition-colors',
              filled ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200',
              editable && 'cursor-pointer hover:fill-amber-300 hover:text-amber-300',
            )}
            onMouseEnter={() => editable && setHover(i + 1)}
            onMouseLeave={() => editable && setHover(0)}
            onClick={(e) => {
              if (!editable) return;
              e.stopPropagation();
              onRate?.(i + 1 === value ? 0 : i + 1); // click same star = unrate
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Share / Google Form Modal ────────────────────────────────────────────────
function ShareFormModal({ onClose }: { onClose: () => void }) {
  const webhookSecret = process.env.NEXT_PUBLIC_WEBHOOK_SECRET || '';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const webhookUrl = `${baseUrl}/api/leads/webhook/google-form`;
  const [copied, setCopied] = useState<'webhook' | 'guide' | null>(null);

  const copyText = (text: string, type: 'webhook' | 'guide') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied!');
  };

  const googleFormSteps = `Google Form Setup Steps:
1. Go to forms.google.com → Create new form
2. Add these question fields (exact names matter):
   - "name" or "Full Name"  (Short answer — Required)
   - "phone" or "Phone Number" (Short answer)
   - "email" or "Email" (Short answer)
   - "destination" or "Destination" (Short answer)
   - "budget" or "Estimated Budget" (Short answer)
   - "travelDate" or "Travel Date" (Date)
   - "numberOfTravelers" or "Travelers" (Short answer)
   - "notes" or "Message" (Paragraph)
3. Go to Responses tab → Click "..." → Script editor
4. Paste this Apps Script code and deploy as web app`;

  const appsScriptCode = `// Google Apps Script — paste in Tools > Script editor
function onFormSubmit(e) {
  var responses = e.namedValues;
  
  var payload = {
    name: (responses['name'] || responses['Full Name'] || [''])[0],
    phone: (responses['phone'] || responses['Phone Number'] || [''])[0],
    email: (responses['email'] || responses['Email'] || [''])[0],
    destination: (responses['destination'] || responses['Destination'] || [''])[0],
    budget: (responses['budget'] || responses['Estimated Budget'] || [''])[0],
    travelDate: (responses['travelDate'] || responses['Travel Date'] || [''])[0],
    numberOfTravelers: (responses['numberOfTravelers'] || responses['Travelers'] || [''])[0],
    notes: (responses['notes'] || responses['Message'] || [''])[0]
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: {
      'x-webhook-secret': '${webhookSecret}'
    },
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch('${webhookUrl}', options);
    Logger.log('Lead created: ' + response.getContentText());
  } catch(err) {
    Logger.log('Error: ' + err.toString());
  }
}

// IMPORTANT: After saving, go to:
// Edit > Current project triggers > Add trigger
// Choose: onFormSubmit, On form submit`;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            Google Form → Auto Lead Integration
          </DialogTitle>
          <DialogDescription>
            Create a Google Form for leads. When anyone submits it, they automatically appear in your pipeline.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-1">
          <div className="space-y-5 py-2">

            {/* Step 1 */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                <p className="text-sm font-semibold text-slate-700">Your Webhook URL (Backend endpoint)</p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-slate-900 text-emerald-400 rounded-lg px-3 py-2.5 font-mono overflow-x-auto whitespace-nowrap">
                    {webhookUrl}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyText(webhookUrl, 'webhook')}
                    className="h-9 w-9 p-0 flex-shrink-0"
                  >
                    {copied === 'webhook' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Your <code className="text-indigo-600 bg-indigo-50 px-1 rounded">WEBHOOK_SECRET</code> in .env is used for security — Google Form script must send it as header.
                </p>
              </div>
            </div>

            {/* Step 2 — Google Form field names */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                <p className="text-sm font-semibold text-slate-700">Create Google Form — use these field names</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { field: 'name or Full Name', desc: 'Required — lead name', req: true },
                    { field: 'phone or Phone Number', desc: 'Contact number', req: false },
                    { field: 'email or Email', desc: 'Email address', req: false },
                    { field: 'destination or Destination', desc: 'Travel destination', req: false },
                    { field: 'budget or Estimated Budget', desc: 'Budget amount', req: false },
                    { field: 'travelDate or Travel Date', desc: 'Departure date', req: false },
                    { field: 'numberOfTravelers or Travelers', desc: 'No. of travelers', req: false },
                    { field: 'notes or Message', desc: 'Additional notes', req: false },
                  ].map(({ field, desc, req }) => (
                    <div key={field} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <code className="text-indigo-700 font-mono text-[10px] shrink-0 mt-0.5">{field.split(' or ')[0]}</code>
                      <div>
                        <p className="text-slate-600 text-[11px]">{desc}</p>
                        {req && <span className="text-[10px] text-red-500 font-semibold">Required</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3 — Apps Script */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <p className="text-sm font-semibold text-slate-700">Paste this Apps Script in Google Form</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyText(appsScriptCode, 'guide')}
                  className="h-8 text-xs gap-1.5"
                >
                  {copied === 'guide' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  Copy Script
                </Button>
              </div>
              <div className="p-4">
                <pre className="text-[11px] bg-slate-900 text-slate-300 rounded-lg p-3 overflow-x-auto max-h-64 overflow-y-auto font-mono leading-relaxed">
                  {appsScriptCode}
                </pre>
              </div>
            </div>

            {/* Step 4 — Trigger setup */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-800">Set up the Form Trigger</p>
                  <p className="text-xs text-amber-700">After pasting the script:</p>
                  <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside ml-1">
                    <li>Click <strong>Save</strong> (floppy disk icon)</li>
                    <li>Go to <strong>Edit → Current project triggers</strong></li>
                    <li>Click <strong>Add Trigger</strong> (bottom right)</li>
                    <li>Function: <code className="bg-amber-100 px-1 rounded">onFormSubmit</code></li>
                    <li>Event: <strong>From form → On form submit</strong></li>
                    <li>Click <strong>Save</strong> → authorize permissions</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Quick open Google Forms */}
            <Button
              variant="outline"
              className="w-full gap-2 border-dashed border-slate-300"
              onClick={() => window.open('https://forms.google.com', '_blank')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Google Forms →
            </Button>

          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Label Modal ─────────────────────────────────────────────────────────────
interface LabelModalProps {
  lead: PipelineLead;
  onClose: () => void;
  onSuccess: () => void;
}

function LabelModal({ lead, onClose, onSuccess }: LabelModalProps) {
  const { data: allLabels = [] } = useQuery<{ id: string; name: string; color: string }[]>({
    queryKey: ['lead-labels'],
    queryFn: leadsService.getAllLabels,
  });

  const addMut = useMutation({
    mutationFn: (labelId: string) => leadsService.addLabel(lead.id, labelId),
    onSuccess: () => { toast.success('Label added'); onSuccess(); },
    onError: () => toast.error('Failed to add label'),
  });

  const removeMut = useMutation({
    mutationFn: (labelId: string) => leadsService.removeLabel(lead.id, labelId),
    onSuccess: () => { toast.success('Label removed'); onSuccess(); },
    onError: () => toast.error('Failed to remove label'),
  });

  const leadLabelIds: string[] = (lead as any).labels?.map((l: any) => l.id) ?? [];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Manage Labels — {lead.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allLabels.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No labels created yet</p>
          )}
          {allLabels.map((label) => {
            const isAttached = leadLabelIds.includes(label.id);
            return (
              <div key={label.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }} />
                  <span className="text-sm text-slate-700">{label.name}</span>
                </div>
                <Button
                  size="sm"
                  variant={isAttached ? 'destructive' : 'outline'}
                  className="h-7 text-xs"
                  onClick={() => isAttached ? removeMut.mutate(label.id) : addMut.mutate(label.id)}
                  disabled={addMut.isPending || removeMut.isPending}
                >
                  {isAttached ? 'Remove' : 'Add'}
                </Button>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign Modal ─────────────────────────────────────────────────────────────
function AssignModal({ lead, onClose, onSuccess }: { lead: PipelineLead; onClose: () => void; onSuccess: () => void }) {
  const { data: users = [] } = useQuery<{ id: string; name: string; email: string }[]>({
    queryKey: ['team-members'],
    queryFn: async () => {
      const res = await import('@/lib/api').then(m => m.default.get('/users'));
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // cache 5 min
  });

  const assignMut = useMutation({
    mutationFn: (userId: string) => leadsService.assign(lead.id, userId),
    onSuccess: () => { toast.success('Lead assigned'); onSuccess(); },
    onError: () => toast.error('Failed to assign lead'),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Lead — {lead.name}</DialogTitle>
        </DialogHeader>
        {lead.assignedTo && (
          <p className="text-sm text-slate-500 -mt-2">
            Currently: <span className="font-semibold text-slate-700">{lead.assignedTo.name}</span>
          </p>
        )}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {users.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No team members found</p>}
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 hover:bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-700">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <Button
                size="sm"
                variant={lead.assignedTo?.id === user.id ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={() => { assignMut.mutate(user.id); onClose(); }}
                disabled={assignMut.isPending}
              >
                {lead.assignedTo?.id === user.id ? 'Assigned' : 'Assign'}
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Convert Confirm Modal ────────────────────────────────────────────────────
function ConvertModal({ lead, onClose, onSuccess }: { lead: PipelineLead; onClose: () => void; onSuccess: () => void }) {
  const convertMut = useMutation({
    mutationFn: () => leadsService.convertToCustomer(lead.id),
    onSuccess: () => { toast.success(`${lead.name} converted to customer!`); onSuccess(); onClose(); },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Conversion failed'),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Convert to Customer</DialogTitle></DialogHeader>
        <p className="text-sm text-slate-500">
          Convert <span className="font-semibold text-slate-700">{lead.name}</span> to a customer?
          A new customer profile will be created automatically.
        </p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => convertMut.mutate()} disabled={convertMut.isPending}
            className="bg-orange-500 hover:bg-orange-600 text-white">
            {convertMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RotateCcw className="w-4 h-4 mr-1" />}
            Convert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Activity Modal ───────────────────────────────────────────────────────────
function ActivityModal({ lead, onClose }: { lead: PipelineLead; onClose: () => void }) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['lead-activities', lead.id],
    queryFn: () => leadsService.getActivities(lead.id),
    staleTime: 30 * 1000,
  });

  const ACTION_COLORS: Record<string, string> = {
    created: 'bg-green-100 text-green-700',
    updated: 'bg-blue-100 text-blue-700',
    stage_changed: 'bg-violet-100 text-violet-700',
    note_added: 'bg-amber-100 text-amber-700',
    assigned: 'bg-teal-100 text-teal-700',
    converted: 'bg-orange-100 text-orange-700',
    rating_updated: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Activity — {lead.name}</DialogTitle></DialogHeader>
        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-3 pr-2">
              {activities.map((act: any) => (
                <div key={act.id} className="flex gap-3">
                  <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded h-fit mt-0.5 whitespace-nowrap', ACTION_COLORS[act.action] ?? 'bg-slate-100 text-slate-600')}>
                    {act.action?.replace(/_/g, ' ')}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{act.description ?? act.action}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {act.user?.name && <span className="font-medium">{act.user.name} · </span>}
                      {new Date(act.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <DialogFooter><Button variant="outline" onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Lead Confirm Modal ────────────────────────────────────────────────
function DeleteLeadModal({ lead, onClose, onSuccess }: { lead: PipelineLead; onClose: () => void; onSuccess: () => void }) {
  const deleteMut = useMutation({
    mutationFn: () => leadsService.delete(lead.id),
    onSuccess: () => { toast.success('Lead deleted'); onSuccess(); onClose(); },
    onError: () => toast.error('Failed to delete lead'),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Delete Lead</DialogTitle></DialogHeader>
        <p className="text-sm text-slate-500">Delete <span className="font-semibold text-slate-700">{lead.name}</span>? Cannot be undone.</p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => deleteMut.mutate()} disabled={deleteMut.isPending}>
            {deleteMut.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
            Delete Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Card Actions ─────────────────────────────────────────────────────────────
function CardActions({ lead, onDelete, onAssign, onConvert, onLabel, onActivity, onNavigate }: {
  lead: PipelineLead;
  onDelete?: () => void; onAssign?: () => void; onConvert?: () => void;
  onLabel?: () => void; onActivity?: () => void; onNavigate?: () => void;
}) {
  const actions = [
    { icon: Trash2,     label: 'Delete',   cls: 'hover:text-red-500 hover:bg-red-50',         fn: onDelete   },
    { icon: Tag,        label: 'Label',    cls: 'hover:text-emerald-600 hover:bg-emerald-50',  fn: onLabel    },
    { icon: TrendingUp, label: 'Activity', cls: 'hover:text-blue-600 hover:bg-blue-50',        fn: onActivity },
    { icon: UserPlus,   label: 'Assign',   cls: 'hover:text-violet-600 hover:bg-violet-50',    fn: onAssign   },
    { icon: RotateCcw,  label: 'Convert',  cls: 'hover:text-orange-600 hover:bg-orange-50',    fn: onConvert  },
    { icon: Navigation, label: 'Navigate', cls: 'hover:text-teal-600 hover:bg-teal-50',        fn: onNavigate },
  ];

  return (
    <div className="flex items-center gap-0.5">
      {actions.map(({ icon: Icon, label, cls, fn }) => (
        <TooltipProvider key={label}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => { e.stopPropagation(); fn?.(); }}
                className={cn('w-6 h-6 rounded flex items-center justify-center text-slate-400 transition-colors', cls, !fn && 'opacity-30 cursor-not-allowed')}
                disabled={!fn}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}

// ─── Lead Card ────────────────────────────────────────────────────────────────
interface LeadCardProps {
  lead: PipelineLead;
  onDragStart: (e: React.DragEvent, leadId: string, stageId: string) => void;
  onClick: (lead: PipelineLead) => void;
  isDragging: boolean;
  onDelete?: (lead: PipelineLead) => void;
  onAssign?: (lead: PipelineLead) => void;
  onConvert?: (lead: PipelineLead) => void;
  onLabel?: (lead: PipelineLead) => void;
  onActivity?: (lead: PipelineLead) => void;
  onNavigate?: (lead: PipelineLead) => void;
}

function LeadCard({ lead, onDragStart, onClick, isDragging, onDelete, onAssign, onConvert, onLabel, onActivity, onNavigate }: LeadCardProps) {
  const qc = useQueryClient();
  const priority = PRIORITY_CONFIG[lead.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.WARM;
  const hasOverdue = (lead as any).followUps?.some((f: any) => new Date(f.dueAt) < new Date());

  // Optimistic rating update
  const ratingMut = useMutation({
    mutationFn: (rating: number) => leadsService.updateRating(lead.id, rating),
    onMutate: async (rating) => {
      // Optimistic update — immediately update UI
      await qc.cancelQueries({ queryKey: ['leads-pipeline'] });
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

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id, lead.stageId ?? '')}
      onClick={() => onClick(lead)}
      className={cn(
        'bg-white rounded-lg border border-slate-200 cursor-pointer select-none',
        'hover:shadow-md hover:border-slate-300 transition-all duration-150',
        isDragging && 'opacity-30 scale-95 rotate-1',
        (lead as any).convertedCustomerId && 'border-l-2 border-l-emerald-400',
      )}
    >
      <div className="px-3.5 pt-3.5 pb-2">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-[13px] font-semibold text-slate-800 leading-tight truncate flex-1">{lead.name}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {(lead as any).convertedCustomerId && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
            {hasOverdue && (
              <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-2.5 h-2.5 text-amber-500" />
              </span>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mb-2.5">
          <Phone className="w-3 h-3 text-slate-400" />
          <span className="font-mono">{lead.phone}</span>
        </div>

        {/* Labels row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
          {lead.source && (
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
              {SOURCE_MAP[lead.source] ?? lead.source}
            </span>
          )}
          <Badge variant="outline" className={cn('text-[10px] h-4 px-1.5 gap-0.5 border font-medium', priority.badge)}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: priority.dot }} />
            {priority.label}
          </Badge>
          {(lead as any).followUps?.length > 0 && (
            <span className="text-[10px] bg-violet-50 text-violet-600 border border-violet-200 px-1.5 py-0.5 rounded">
              {(lead as any).followUps.length} follow-up
            </span>
          )}
        </div>

        {/* Meta info */}
        <div className="space-y-1 text-[11px] text-slate-500">
          {lead.destination && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-600">TO:</span>
              <span className="truncate">{lead.destination}</span>
            </div>
          )}
          {lead.travelDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-600">CD:</span>
              <span>{new Date(lead.travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            </div>
          )}
          {lead.assignedTo && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-600">BY:</span>
              <span className="truncate">{lead.assignedTo.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Rating + Budget — interactive stars */}
      <div className="mx-3.5 py-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-400 mb-0.5">Rating</p>
          <StarRating
            value={(lead as any).rating ?? 0}
            editable
            onRate={(r) => ratingMut.mutate(r)}
            size="xs"
          />
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 mb-0.5">Estimated Amount</p>
          <p className="text-[12px] font-semibold text-slate-700">
            {lead.estimatedBudget ? fmtBudget(lead.estimatedBudget) : '₹ 0.00'}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-2.5 py-2 border-t border-slate-100 flex items-center justify-between">
        <CardActions
          lead={lead}
          onDelete={onDelete ? () => onDelete(lead) : undefined}
          onAssign={onAssign ? () => onAssign(lead) : undefined}
          onConvert={onConvert ? () => onConvert(lead) : undefined}
          onLabel={onLabel ? () => onLabel(lead) : undefined}
          onActivity={onActivity ? () => onActivity(lead) : undefined}
          onNavigate={onNavigate ? () => onNavigate(lead) : undefined}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-sm">
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }}>
              <Phone className="w-3.5 h-3.5" /> Call Lead
            </DropdownMenuItem>
            {lead.email && (
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); window.open(`mailto:${lead.email}`); }}>
                <Mail className="w-3.5 h-3.5" /> Send Email
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={(e) => { e.stopPropagation(); onDelete?.(lead); }}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ─── Stage Column ─────────────────────────────────────────────────────────────
interface StageColumnProps {
  column: PipelineColumn;
  allStages: LeadStage[];
  onDragStart: (e: React.DragEvent, leadId: string, stageId: string) => void;
  onDrop: (e: React.DragEvent, targetStageId: string) => void;
  onLeadClick: (lead: PipelineLead) => void;
  onEditStage: (stage: LeadStage) => void;
  onDeleteStage: (stage: LeadStage) => void;
  draggingLeadId: string | null;
  onDeleteLead: (lead: PipelineLead) => void;
  onAssignLead: (lead: PipelineLead) => void;
  onConvertLead: (lead: PipelineLead) => void;
  onLabelLead: (lead: PipelineLead) => void;
  onActivityLead: (lead: PipelineLead) => void;
  onNavigateLead: (lead: PipelineLead) => void;
}

function StageColumn({
  column, onDragStart, onDrop, onLeadClick, onEditStage, onDeleteStage, draggingLeadId,
  onDeleteLead, onAssignLead, onConvertLead, onLabelLead, onActivityLead, onNavigateLead,
}: StageColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { stage, leads, count } = column;

  const totalBudget = leads.reduce((a, l) => a + (l.estimatedBudget ?? 0), 0);

  return (
    <div
      className={cn(
        'flex-shrink-0 w-[280px] flex flex-col rounded-xl overflow-hidden border transition-shadow duration-200',
        isDragOver ? 'shadow-lg' : 'shadow-sm border-slate-200',
      )}
      style={isDragOver ? { boxShadow: `0 0 0 2px ${stage.color}` } : {}}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { setIsDragOver(false); onDrop(e, stage.id); }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2.5 text-white" style={{ backgroundColor: stage.color }}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[13px] font-bold truncate">{stage.title}</span>
          {(stage as any).isWon && (
            <span className="text-[9px] bg-white/20 border border-white/30 text-white px-1.5 py-0.5 rounded-full font-bold">WON</span>
          )}
          <span className="text-[11px] bg-white/20 rounded-full px-1.5 py-0.5 font-bold ml-auto">{count}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-6 h-6 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors ml-1">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-sm">
            <DropdownMenuItem onClick={() => onEditStage(stage)} className="cursor-pointer gap-2">
              <Pencil className="w-3.5 h-3.5" /> Edit Stage
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDeleteStage(stage)} className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50">
              <Trash2 className="w-3.5 h-3.5" /> Delete Stage
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Column Meta */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">{count} lead{count !== 1 ? 's' : ''}</span>
        {totalBudget > 0 && (
          <span className="text-[10px] font-semibold text-slate-500">{fmtBudget(totalBudget)}</span>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50" style={{ minHeight: 80 }}>
        {leads.length === 0 ? (
          <div className={cn('flex items-center justify-center py-6 rounded-lg border-2 border-dashed transition-colors', isDragOver ? 'border-slate-400 bg-white' : 'border-slate-200')}>
            <p className="text-[11px] text-slate-400 font-medium">Drop leads here</p>
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onDragStart={onDragStart}
              onClick={onLeadClick}
              isDragging={draggingLeadId === lead.id}
              onDelete={onDeleteLead}
              onAssign={onAssignLead}
              onConvert={onConvertLead}
              onLabel={onLabelLead}
              onActivity={onActivityLead}
              onNavigate={onNavigateLead}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Stage Form Modal ─────────────────────────────────────────────────────────
function StageFormModal({ stage, onClose, onSave }: {
  stage?: LeadStage; onClose: () => void; onSave: (data: CreateStageData) => void;
}) {
  const [title, setTitle] = useState(stage?.title ?? '');
  const [color, setColor] = useState(stage?.color ?? '#6366f1');
  const [isWon, setIsWon] = useState((stage as any)?.isWon ?? false);

  const COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#06b6d4'];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{stage ? 'Edit Stage' : 'Add Stage'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage Name</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Interested" className="h-10 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className={cn('w-7 h-7 rounded-lg transition-transform', color === c && 'ring-2 ring-offset-1 ring-slate-700 scale-110')}
                  style={{ backgroundColor: c }} />
              ))}
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200" />
            </div>
          </div>

          {/* Won Stage Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div>
              <p className="text-sm font-semibold text-emerald-800">Won Stage</p>
              <p className="text-xs text-emerald-600">Leads auto-convert to customers when moved here</p>
            </div>
            <button
              onClick={() => setIsWon(!isWon)}
              className={cn(
                'w-10 h-5 rounded-full transition-colors relative',
                isWon ? 'bg-emerald-500' : 'bg-slate-300'
              )}
            >
              <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform', isWon ? 'translate-x-5' : 'translate-x-0.5')} />
            </button>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <p className="text-[10px] text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Preview</p>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-white text-xs font-bold" style={{ backgroundColor: color }}>
              {title || 'Stage Name'}
              {isWon && <span className="text-[9px] bg-white/20 px-1 rounded">WON</span>}
            </span>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (title.trim()) { onSave({ title: title.trim(), color, isWon } as any); onClose(); } }}
            disabled={!title.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {stage ? 'Update Stage' : 'Create Stage'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function LeadsPipelinePage() {
  const qc = useQueryClient();
  const router = useRouter();

  const [search, setSearch]           = useState('');
  const [filterPriority, setFilter]   = useState<string>('ALL');
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null);
  const [draggingLeadId, setDragging] = useState<string | null>(null);
  const [addLeadModal, setAddLeadModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [shareModal, setShareModal]   = useState(false);
  const [stageModal, setStageModal]   = useState<{ open: boolean; stage?: LeadStage }>({ open: false });
  const [deleteLead, setDeleteLead]   = useState<PipelineLead | null>(null);
  const [assignLead, setAssignLead]   = useState<PipelineLead | null>(null);
  const [convertLead, setConvertLead] = useState<PipelineLead | null>(null);
  const [labelLead, setLabelLead]     = useState<PipelineLead | null>(null);
  const [activityLead, setActivityLead] = useState<PipelineLead | null>(null);
  const [deleteStage, setDeleteStage] = useState<LeadStage | null>(null);

  const dragData = useRef<{ leadId: string; fromStageId: string } | null>(null);

  const invalidatePipeline = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['leads-pipeline'] });
  }, [qc]);

  // ── Queries ─────────────────────────────────────────────────────────────────
  const { data: pipeline = [], isLoading, refetch } = useQuery<PipelineColumn[]>({
    queryKey: ['leads-pipeline'],
    queryFn: leadsService.getPipeline,
    staleTime: 30 * 1000, // 30 sec stale — don't refetch too often
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // prevent refetch on tab switch
  });

  const stages: LeadStage[] = pipeline.map((c) => c.stage);

  // ── Mutations ────────────────────────────────────────────────────────────────
  const changeStageMut = useMutation({
    mutationFn: ({ leadId, stageId }: { leadId: string; stageId: string }) =>
      leadsService.changeStage(leadId, stageId),
    onMutate: async ({ leadId, stageId }) => {
      await qc.cancelQueries({ queryKey: ['leads-pipeline'] });
      const prev = qc.getQueryData(['leads-pipeline']);

      // Optimistic update — move lead instantly in UI
      qc.setQueryData(['leads-pipeline'], (old: PipelineColumn[] | undefined) => {
        if (!old) return old;
        let movingLead: PipelineLead | null = null;
        const cleaned = old.map((col) => ({
          ...col,
          leads: col.leads.filter((l) => {
            if (l.id === leadId) { movingLead = { ...l, stageId }; return false; }
            return true;
          }),
          count: col.leads.filter((l) => l.id !== leadId).length,
        }));
        return cleaned.map((col) => {
          if (col.stage.id === stageId && movingLead) {
            return { ...col, leads: [movingLead, ...col.leads], count: col.leads.length + 1 };
          }
          return col;
        });
      });

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['leads-pipeline'], ctx.prev);
      toast.error('Failed to move lead');
    },
 onSuccess: (result) => {
   if (result?.autoConverted) {
     const msg = result.alreadyExisted
       ? `✅ Lead moved to Won — linked to existing customer profile!`
       : `🎉 Lead moved to Won — new customer created automatically!`;
    toast.success(msg, { duration: 4000 });

    // ← YE MISSING THA — customers list invalidate karo
    qc.invalidateQueries({ queryKey: ['customers'] });
  }
  qc.invalidateQueries({ queryKey: ['leads-pipeline'] });
 },
  });

  const createStageMut = useMutation({
    mutationFn: (data: CreateStageData) => leadStagesService.create(data),
    onSuccess: () => { toast.success('Stage created'); invalidatePipeline(); },
    onError: () => toast.error('Failed to create stage'),
  });

  const updateStageMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateStageData> }) => leadStagesService.update(id, data),
    onSuccess: () => { toast.success('Stage updated'); invalidatePipeline(); },
    onError: () => toast.error('Failed to update stage'),
  });

  const deleteStageMut = useMutation({
    mutationFn: (id: string) => leadStagesService.delete(id),
    onSuccess: () => { toast.success('Stage deleted'); invalidatePipeline(); },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Cannot delete stage'),
  });

  // ── Drag handlers ────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, leadId: string, stageId: string) => {
    dragData.current = { leadId, fromStageId: stageId };
    setDragging(leadId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    setDragging(null);
    if (!dragData.current) return;
    const { leadId, fromStageId } = dragData.current;
    dragData.current = null;
    if (fromStageId === targetStageId) return;
    changeStageMut.mutate({ leadId, stageId: targetStageId });
  }, [changeStageMut]);

  useEffect(() => {
    const up = () => setDragging(null);
    window.addEventListener('dragend', up);
    return () => window.removeEventListener('dragend', up);
  }, []);

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filteredPipeline = pipeline.map((col) => ({
    ...col,
    leads: col.leads.filter((l) => {
      const matchPriority = filterPriority === 'ALL' || l.priority === filterPriority;
      const matchSearch   = !search || l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search) || (l.email?.toLowerCase().includes(search.toLowerCase()));
      return matchPriority && matchSearch;
    }),
  }));

  const totalLeads = pipeline.reduce((a, c) => a + c.count, 0);

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">Leads Pipeline</h1>
            <p className="text-[11px] text-slate-400">{totalLeads} total leads · {pipeline.length} stages</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads…"
              className="pl-8 h-8 text-xs w-48 border-slate-200 rounded-lg"
            />
          </div>

          {/* Priority filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-600 gap-1.5 hover:bg-slate-50">
                <SlidersHorizontal className="w-3 h-3" />
                {filterPriority === 'ALL' ? 'All' : filterPriority}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-sm">
              {['ALL', 'HOT', 'WARM', 'COLD'].map((p) => (
                <DropdownMenuItem key={p} onClick={() => setFilter(p)} className={cn('cursor-pointer gap-2', filterPriority === p && 'bg-slate-50 font-semibold')}>
                  {p === 'ALL' ? 'All Priorities' : (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p === 'HOT' ? '#ef4444' : p === 'WARM' ? '#f97316' : '#3b82f6' }} />
                      {p}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:bg-slate-50">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>

          {/* Share / Google Form button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareModal(true)}
            className="h-8 text-xs border-indigo-200 text-indigo-600 gap-1.5 hover:bg-indigo-50"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Form
          </Button>

          {/* Add Stage */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-600 gap-1.5 hover:bg-slate-50">
                <Plus className="w-3.5 h-3.5" /> Stage <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-sm">
              <DropdownMenuItem onClick={() => setStageModal({ open: true })} className="cursor-pointer gap-2">
                <Plus className="w-3.5 h-3.5" /> Add Stage
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Import */}
          <Button variant="outline" size="sm" onClick={() => setImportModal(true)} className="h-8 text-xs border-slate-200 text-slate-600 gap-1.5 hover:bg-slate-50">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Import
          </Button>

          {/* Add Lead */}
          <Button size="sm" onClick={() => setAddLeadModal(true)} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm">
            <UserPlus className="w-3.5 h-3.5" /> Add Lead
          </Button>
        </div>
      </div>

      {/* ── Board ──────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
            <p className="text-sm text-slate-400">Loading pipeline…</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-x-auto pb-4">
          <div className="flex gap-3 h-full min-h-[600px] w-max pr-4 pt-3 pl-5">
            {filteredPipeline.length === 0 ? (
              <div className="flex items-center justify-center min-w-[500px] text-slate-400">
                <div className="text-center">
                  <Star className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-500">No stages yet</p>
                  <p className="text-xs text-slate-400 mt-1">Create your first stage to get started</p>
                  <Button size="sm" onClick={() => setStageModal({ open: true })} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Create Stage
                  </Button>
                </div>
              </div>
            ) : (
              filteredPipeline.map((col) => (
                <StageColumn
                  key={col.stage.id}
                  column={col}
                  allStages={stages}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  onLeadClick={setSelectedLead}
                  onEditStage={(s) => setStageModal({ open: true, stage: s })}
                  onDeleteStage={setDeleteStage}
                  draggingLeadId={draggingLeadId}
                  onDeleteLead={setDeleteLead}
                  onAssignLead={setAssignLead}
                  onConvertLead={setConvertLead}
                  onLabelLead={setLabelLead}
                  onActivityLead={setActivityLead}
                  onNavigateLead={(lead) => router.push(`/leads/${lead.id}`)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          stages={stages}
          onClose={() => setSelectedLead(null)}
          onMoveStage={(leadId, stageId) => changeStageMut.mutate({ leadId, stageId })}
        />
      )}

      {deleteLead && <DeleteLeadModal lead={deleteLead} onClose={() => setDeleteLead(null)} onSuccess={invalidatePipeline} />}
      {assignLead && <AssignModal lead={assignLead} onClose={() => setAssignLead(null)} onSuccess={invalidatePipeline} />}
      {convertLead && <ConvertModal lead={convertLead} onClose={() => setConvertLead(null)} onSuccess={invalidatePipeline} />}
      {labelLead && <LabelModal lead={labelLead} onClose={() => setLabelLead(null)} onSuccess={invalidatePipeline} />}
      {activityLead && <ActivityModal lead={activityLead} onClose={() => setActivityLead(null)} />}

      {shareModal && <ShareFormModal onClose={() => setShareModal(false)} />}

      <AddLeadModal
        open={addLeadModal}
        onClose={() => setAddLeadModal(false)}
        onSuccess={() => { setAddLeadModal(false); qc.invalidateQueries({ queryKey: ['leads-pipeline'] }); }}
      />

      <ImportLeadModal
        open={importModal}
        onClose={() => setImportModal(false)}
        onSuccess={() => { setImportModal(false); qc.invalidateQueries({ queryKey: ['leads-pipeline'] }); }}
      />

      {stageModal.open && (
        <StageFormModal
          stage={stageModal.stage}
          onClose={() => setStageModal({ open: false })}
          onSave={(data) => {
            if (stageModal.stage) updateStageMut.mutate({ id: stageModal.stage.id, data });
            else createStageMut.mutate(data);
          }}
        />
      )}

      {deleteStage && (
        <Dialog open onOpenChange={() => setDeleteStage(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete Stage</DialogTitle></DialogHeader>
            <p className="text-sm text-slate-500">
              Delete{' '}
              <span className="font-semibold px-1.5 py-0.5 rounded text-white text-xs" style={{ backgroundColor: deleteStage.color }}>
                {deleteStage.title}
              </span>
              ? Leads in this stage will become unassigned.
            </p>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteStage(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { deleteStageMut.mutate(deleteStage.id); setDeleteStage(null); }}>
                Delete Stage
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}