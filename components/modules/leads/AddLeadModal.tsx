'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadsService, leadStagesService } from '@/services/leads.service';
import type { LeadStage } from '@/types/leads.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Flame,
  Zap,
  Snowflake,
  Globe,
  Loader2,
  ChevronRight,
  Layers,
  MessageSquare,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddLeadFormData {
  // Required
  name: string;
  phone: string;
  // Optional
  email: string;
  source: string;
  priority: string;
  stageId: string;
  destination: string;
  estimatedBudget: string;
  travelDate: string;
  numberOfTravelers: string;
  notes: string;
  assignedToId: string;
}

const INITIAL_FORM: AddLeadFormData = {
  name: '',
  phone: '',
  email: '',
  source: 'MANUAL',
  priority: 'WARM',
  stageId: '',
  destination: '',
  estimatedBudget: '',
  travelDate: '',
  numberOfTravelers: '',
  notes: '',
  assignedToId: '',
};

// ─── Config ───────────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS = [
  {
    value: 'HOT',
    label: 'Hot',
    icon: Flame,
    badge: 'bg-red-50 text-red-600 border-red-200',
    dot: '#ef4444',
  },
  {
    value: 'WARM',
    label: 'Warm',
    icon: Zap,
    badge: 'bg-orange-50 text-orange-600 border-orange-200',
    dot: '#f97316',
  },
  {
    value: 'COLD',
    label: 'Cold',
    icon: Snowflake,
    badge: 'bg-blue-50 text-blue-600 border-blue-200',
    dot: '#3b82f6',
  },
] as const;

const SOURCE_OPTIONS = [
  { value: 'MANUAL', label: 'Manual Entry' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'MESSENGER', label: 'Messenger' },
  { value: 'PHONE', label: 'Phone Call' },
  { value: 'OTHER', label: 'Other' },
];

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-indigo-600" />
      </div>
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
    </div>
  );
}

// ─── Field Wrapper ────────────────────────────────────────────────────────────

function FieldGroup({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  defaultStageId?: string;
}

export function AddLeadModal({ open, onClose, defaultStageId }: AddLeadModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState<AddLeadFormData>({
    ...INITIAL_FORM,
    stageId: defaultStageId ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddLeadFormData, string>>>({});

  // ── Stages query ──────────────────────────────────────────────────────────
  const { data: stages = [] } = useQuery<LeadStage[]>({
    queryKey: ['lead-stages'],
    queryFn: leadStagesService.getAll,
    enabled: open,
  });

  // ── Create mutation ───────────────────────────────────────────────────────
  const createMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => leadsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads-pipeline'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead added successfully!');
      handleClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        'Failed to create lead. Please try again.';
      toast.error(msg);
    },
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const set = (key: keyof AddLeadFormData, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AddLeadFormData, string>> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      newErrors.name = 'Name must be at least 2 characters';
    if (!form.phone.trim() || form.phone.trim().length < 7)
      newErrors.phone = 'Please enter a valid phone number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Please enter a valid email';
    if (form.estimatedBudget && isNaN(Number(form.estimatedBudget)))
      newErrors.estimatedBudget = 'Budget must be a number';
    if (form.numberOfTravelers && isNaN(Number(form.numberOfTravelers)))
      newErrors.numberOfTravelers = 'Must be a valid number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      source: form.source,
      priority: form.priority,
    };
    if (form.email.trim()) payload.email = form.email.trim();
    if (form.stageId) payload.stageId = form.stageId;
    if (form.destination.trim()) payload.destination = form.destination.trim();
    if (form.estimatedBudget) payload.estimatedBudget = Number(form.estimatedBudget);
    if (form.travelDate) payload.travelDate = form.travelDate;
    if (form.numberOfTravelers) payload.numberOfTravelers = Number(form.numberOfTravelers);
    if (form.notes.trim()) payload.notes = form.notes.trim();
    if (form.assignedToId) payload.assignedToId = form.assignedToId;

    createMut.mutate(payload);
  };

  const handleClose = () => {
    setForm({ ...INITIAL_FORM, stageId: defaultStageId ?? '' });
    setErrors({});
    onClose();
  };

  const selectedPriority = PRIORITY_OPTIONS.find((p) => p.value === form.priority) ?? PRIORITY_OPTIONS[1];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden border-slate-200 shadow-xl">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-violet-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-[15px] font-bold text-white">Add New Lead</DialogTitle>
              <p className="text-[12px] text-indigo-200 mt-0.5">Fill in the details to create a new lead</p>
            </div>
            {/* Priority live badge */}
            <Badge
              variant="outline"
              className={cn(
                'ml-auto text-[11px] h-6 px-2.5 gap-1 border font-semibold bg-white/10 backdrop-blur-sm',
                'text-white border-white/30',
              )}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: selectedPriority.dot }}
              />
              {selectedPriority.label}
            </Badge>
          </div>
        </DialogHeader>

        {/* ── Form Body ────────────────────────────────────────────────────── */}
        <ScrollArea className="max-h-[65vh]">
          <div className="px-6 py-5 space-y-6">

            {/* Section 1 — Contact Info */}
            <div>
              <SectionHeader icon={User} title="Contact Information" />
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Full Name" required error={errors.name}>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      className={cn(
                        'pl-9 h-9 text-sm border-slate-200 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400',
                        errors.name && 'border-red-300 focus-visible:border-red-400',
                      )}
                    />
                  </div>
                </FieldGroup>

                <FieldGroup label="Phone Number" required error={errors.phone}>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      className={cn(
                        'pl-9 h-9 text-sm border-slate-200 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 font-mono',
                        errors.phone && 'border-red-300 focus-visible:border-red-400',
                      )}
                    />
                  </div>
                </FieldGroup>

                <FieldGroup label="Email Address" error={errors.email}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      placeholder="rahul@example.com"
                      type="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      className={cn(
                        'pl-9 h-9 text-sm border-slate-200 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400',
                        errors.email && 'border-red-300 focus-visible:border-red-400',
                      )}
                    />
                  </div>
                </FieldGroup>

                <FieldGroup label="Lead Source">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 z-10 pointer-events-none" />
                    <Select value={form.source} onValueChange={(v) => set('source', v)}>
                      <SelectTrigger className="pl-9 h-9 text-sm border-slate-200 focus:ring-indigo-500/30 focus:border-indigo-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCE_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value} className="text-sm">
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FieldGroup>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Section 2 — Lead Classification */}
            <div>
              <SectionHeader icon={Tag} title="Lead Classification" />
              <div className="grid grid-cols-2 gap-4">

                {/* Priority — custom radio buttons */}
                <FieldGroup label="Priority">
                  <div className="flex gap-2">
                    {PRIORITY_OPTIONS.map((p) => {
                      const Icon = p.icon;
                      const isSelected = form.priority === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => set('priority', p.value)}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border text-[12px] font-semibold transition-all',
                            isSelected
                              ? cn(p.badge, 'border-current shadow-sm')
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50',
                          )}
                        >
                          <Icon className={cn('w-3.5 h-3.5', isSelected ? '' : 'text-slate-400')} />
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </FieldGroup>

                {/* Stage */}
                <FieldGroup label="Pipeline Stage">
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 z-10 pointer-events-none" />
                    <Select
                      value={form.stageId}
                      onValueChange={(v) => set('stageId', v)}
                    >
                      <SelectTrigger className="pl-9 h-9 text-sm border-slate-200 focus:ring-indigo-500/30 focus:border-indigo-400">
                        <SelectValue placeholder="Auto (first stage)" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id} className="text-sm">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: stage.color }}
                              />
                              {stage.title}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FieldGroup>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Section 3 — Travel Details */}
            <div>
              <SectionHeader icon={MapPin} title="Travel Details" />
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Destination">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      placeholder="e.g. Goa, Bali, Dubai"
                      value={form.destination}
                      onChange={(e) => set('destination', e.target.value)}
                      className="pl-9 h-9 text-sm border-slate-200 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400"
                    />
                  </div>
                </FieldGroup>

                <FieldGroup label="Travel Date">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 z-10 pointer-events-none" />
                    <Input
                      type="date"
                      value={form.travelDate}
                      onChange={(e) => set('travelDate', e.target.value)}
                      className="pl-9 h-9 text-sm border-slate-200 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400"
                    />
                  </div>
                </FieldGroup>

                <FieldGroup label="Estimated Budget (₹)" error={errors.estimatedBudget}>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      placeholder="e.g. 50000"
                      value={form.estimatedBudget}
                      onChange={(e) => set('estimatedBudget', e.target.value)}
                      className={cn(
                        'pl-9 h-9 text-sm border-slate-200 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400',
                        errors.estimatedBudget && 'border-red-300',
                      )}
                    />
                  </div>
                </FieldGroup>

                <FieldGroup label="Number of Travelers" error={errors.numberOfTravelers}>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      placeholder="e.g. 4"
                      value={form.numberOfTravelers}
                      onChange={(e) => set('numberOfTravelers', e.target.value)}
                      className={cn(
                        'pl-9 h-9 text-sm border-slate-200 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400',
                        errors.numberOfTravelers && 'border-red-300',
                      )}
                    />
                  </div>
                </FieldGroup>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Section 4 — Notes */}
            <div>
              <SectionHeader icon={MessageSquare} title="Notes" />
              <FieldGroup label="Additional Notes">
                <Textarea
                  placeholder="Any important details, requirements, or context about this lead…"
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  rows={3}
                  className="text-sm border-slate-200 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 resize-none"
                />
              </FieldGroup>
            </div>

          </div>
        </ScrollArea>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 gap-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mr-auto">
            <span className="text-red-500">*</span> Required fields
          </div>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createMut.isPending}
            className="h-9 text-sm border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMut.isPending}
            className="h-9 text-sm bg-indigo-600 hover:bg-indigo-700 text-white gap-2 min-w-[130px] shadow-sm"
          >
            {createMut.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                Create Lead
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}