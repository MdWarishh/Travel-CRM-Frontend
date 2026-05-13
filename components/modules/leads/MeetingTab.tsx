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
  Plus, Users, Clock, CheckCircle2, XCircle, Loader2, Trash2,
  MapPin, Link, Calendar,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  SCHEDULED:  { label: 'Scheduled',  cls: 'bg-blue-50 text-blue-600 border-blue-200'      },
  COMPLETED:  { label: 'Completed',  cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  CANCELLED:  { label: 'Cancelled',  cls: 'bg-slate-100 text-slate-500 border-slate-200'  },
  NO_SHOW:    { label: 'No Show',    cls: 'bg-red-50 text-red-500 border-red-200'         },
};

export function MeetingTab({ lead }: { lead: PipelineLead }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', scheduledAt: '',
    duration: '', location: '', meetingLink: '', notes: '',
  });

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['lead-meetings', lead.id],
    queryFn: () => leadsService.getMeetings(lead.id),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => leadsService.createMeeting(lead.id, data),
    onSuccess: () => {
      toast.success('Meeting scheduled');
      qc.invalidateQueries({ queryKey: ['lead-meetings', lead.id] });
      setShowForm(false);
      setForm({ title: '', description: '', scheduledAt: '', duration: '', location: '', meetingLink: '', notes: '' });
    },
    onError: () => toast.error('Failed to schedule meeting'),
  });

  const updateMut = useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: string; data: any }) =>
      leadsService.updateMeeting(lead.id, meetingId, data),
    onSuccess: () => {
      toast.success('Meeting updated');
      qc.invalidateQueries({ queryKey: ['lead-meetings', lead.id] });
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: (meetingId: string) => leadsService.deleteMeeting(lead.id, meetingId),
    onSuccess: () => {
      toast.success('Meeting deleted');
      qc.invalidateQueries({ queryKey: ['lead-meetings', lead.id] });
    },
    onError: () => toast.error('Failed to delete'),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{meetings.length} Meeting{meetings.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}
          className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Schedule Meeting
        </Button>
      </div>

      {showForm && (
        <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">New Meeting</p>
          <div className="space-y-1">
            <Label className="text-xs text-slate-600">Title <span className="text-red-500">*</span></Label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Meeting title…" className="h-8 text-xs border-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Scheduled At <span className="text-red-500">*</span></Label>
              <Input type="datetime-local" value={form.scheduledAt}
                onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                className="h-8 text-xs border-slate-200" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Duration (mins)</Label>
              <Input type="number" value={form.duration}
                onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 30" className="h-8 text-xs border-slate-200" min={1} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Location</Label>
              <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="Office / Zoom…" className="h-8 text-xs border-slate-200" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Meeting Link</Label>
              <Input value={form.meetingLink} onChange={(e) => setForm((p) => ({ ...p, meetingLink: e.target.value }))}
                placeholder="https://…" className="h-8 text-xs border-slate-200" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-600">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Meeting notes…" rows={2} className="text-xs border-slate-200 resize-none" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="h-7 text-xs">Cancel</Button>
            <Button size="sm" disabled={createMut.isPending} onClick={() => {
              if (!form.title.trim() || !form.scheduledAt) { toast.error('Title and date are required'); return; }
              const payload: any = { ...form };
              if (form.duration) payload.duration = Number(form.duration);
              else delete payload.duration;
              createMut.mutate(payload);
            }} className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              {createMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Users className="w-10 h-10 mb-3 text-slate-200" />
          <p className="text-sm font-medium text-slate-500">No meetings scheduled</p>
        </div>
      ) : (
        <div className="space-y-2">
          {meetings.map((meeting: any) => {
            const st = STATUS_CONFIG[meeting.status] ?? STATUS_CONFIG.SCHEDULED;
            return (
              <div key={meeting.id} className="border border-slate-200 rounded-xl p-3.5 bg-white hover:shadow-sm transition-all space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{meeting.title}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(meeting.scheduledAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {meeting.duration && ` · ${meeting.duration} min`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Select value={meeting.status} onValueChange={(v) => updateMut.mutate({ meetingId: meeting.id, data: { status: v } })}>
                      <SelectTrigger className={cn('h-5 text-[10px] px-1.5 gap-1 w-auto border', st.cls)}>
                        <span>{st.label}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button onClick={() => deleteMut.mutate(meeting.id)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                  {meeting.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{meeting.location}</span>
                  )}
                  {meeting.meetingLink && (
                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-indigo-600 hover:underline">
                      <Link className="w-2.5 h-2.5" />Join Link
                    </a>
                  )}
                </div>
                {meeting.notes && (
                  <p className="text-[12px] text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">{meeting.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}