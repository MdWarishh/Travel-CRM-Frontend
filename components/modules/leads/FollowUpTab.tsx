'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/services/leads.service';
import { PipelineLead } from '@/types/leads.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Plus, Phone, MessageSquare, Users, Mail,
  Clock, CheckCircle2, XCircle, Trash2, Loader2, AlertCircle,
} from 'lucide-react';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  CALL:    { icon: Phone,        color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',    label: 'Call'    },
  MESSAGE: { icon: MessageSquare,color: 'text-green-600',  bg: 'bg-green-50 border-green-200',  label: 'Message' },
  MEETING: { icon: Users,        color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200',label: 'Meeting' },
  EMAIL:   { icon: Mail,         color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200',label: 'Email'   },
};

const STATUS_CONFIG: Record<string, { label: string; icon: any; cls: string }> = {
  PENDING:   { label: 'Pending',   icon: Clock,        cls: 'bg-amber-50 text-amber-600 border-amber-200'   },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  MISSED:    { label: 'Missed',    icon: XCircle,      cls: 'bg-red-50 text-red-600 border-red-200'         },
};

export function FollowUpTab({ lead }: { lead: PipelineLead }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'CALL', dueAt: '', notes: '' });

  const { data: followUps = [], isLoading } = useQuery({
    queryKey: ['lead-followups', lead.id],
    queryFn: () => leadsService.getFollowUps(lead.id),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => leadsService.createFollowUp(lead.id, data),
    onSuccess: () => {
      toast.success('Follow-up created');
      qc.invalidateQueries({ queryKey: ['lead-followups', lead.id] });
      setShowForm(false);
      setForm({ type: 'CALL', dueAt: '', notes: '' });
    },
    onError: () => toast.error('Failed to create follow-up'),
  });

  const updateMut = useMutation({
    mutationFn: ({ fuId, data }: { fuId: string; data: any }) =>
      leadsService.updateFollowUp(lead.id, fuId, data),
    onSuccess: () => {
      toast.success('Follow-up updated');
      qc.invalidateQueries({ queryKey: ['lead-followups', lead.id] });
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: (fuId: string) => leadsService.deleteFollowUp(lead.id, fuId),
    onSuccess: () => {
      toast.success('Follow-up deleted');
      qc.invalidateQueries({ queryKey: ['lead-followups', lead.id] });
    },
    onError: () => toast.error('Failed to delete'),
  });

  const handleSubmit = () => {
    if (!form.dueAt) { toast.error('Due date is required'); return; }
    createMut.mutate(form);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{followUps.length} Follow-up{followUps.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}
          className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Follow-up
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">New Follow-up</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                <SelectTrigger className="h-8 text-xs border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Due Date & Time <span className="text-red-500">*</span></Label>
              <Input
                type="datetime-local"
                value={form.dueAt}
                onChange={(e) => setForm((p) => ({ ...p, dueAt: e.target.value }))}
                className="h-8 text-xs border-slate-200"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-600">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Follow-up notes…"
              rows={2}
              className="text-xs border-slate-200 resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="h-7 text-xs">Cancel</Button>
            <Button size="sm" onClick={handleSubmit} disabled={createMut.isPending}
              className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              {createMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {/* Follow-up List */}
      {followUps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Clock className="w-10 h-10 mb-3 text-slate-200" />
          <p className="text-sm font-medium text-slate-500">No follow-ups yet</p>
          <p className="text-xs mt-1">Add a follow-up to track this lead</p>
        </div>
      ) : (
        <div className="space-y-2">
          {followUps.map((fu: any) => {
            const type = TYPE_CONFIG[fu.type] ?? TYPE_CONFIG.CALL;
            const status = STATUS_CONFIG[fu.status] ?? STATUS_CONFIG.PENDING;
            const TypeIcon = type.icon;
            const StatusIcon = status.icon;
            const overdue = fu.status === 'PENDING' && new Date(fu.dueAt) < new Date();

            return (
              <div key={fu.id} className={cn(
                'border rounded-xl p-3.5 space-y-2 transition-all',
                overdue ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-white hover:shadow-sm',
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-7 h-7 rounded-lg border flex items-center justify-center', type.bg)}>
                      <TypeIcon className={cn('w-3.5 h-3.5', type.color)} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{type.label}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(fu.dueAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {overdue && <span className="text-red-500 font-semibold ml-1">• Overdue</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={cn('text-[10px] h-5 px-1.5 gap-0.5 font-medium', status.cls)}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {status.label}
                    </Badge>
                    {fu.status === 'PENDING' && (
                      <button
                        onClick={() => updateMut.mutate({ fuId: fu.id, data: { status: 'COMPLETED' } })}
                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium transition-colors"
                      >
                        Done
                      </button>
                    )}
                    <button
                      onClick={() => deleteMut.mutate(fu.id)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {fu.notes && (
                  <p className="text-[12px] text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    {fu.notes}
                  </p>
                )}
                {fu.assignedTo && (
                  <p className="text-[11px] text-slate-400">Assigned to: <span className="font-medium text-slate-600">{fu.assignedTo.name}</span></p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}