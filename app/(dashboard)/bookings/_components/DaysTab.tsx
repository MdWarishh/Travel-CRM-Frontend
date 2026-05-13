'use client';

import { useState } from 'react';
import {
  Plus, Loader2, CheckCircle2, Circle, Clock,
  ChevronDown, ChevronUp, Calendar, Sparkles,
  Pencil, Check, X, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { BookingDay } from '@/types/booking';
import { bookingsService } from '@/services/bookings.service';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const STATUS_CFG = {
  PENDING:     { icon: Circle,       color: 'text-slate-400',   bg: 'bg-slate-50 border-slate-200',     label: 'Pending' },
  IN_PROGRESS: { icon: Clock,        color: 'text-amber-500',   bg: 'bg-amber-50 border-amber-200',     label: 'In Progress' },
  COMPLETED:   { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200', label: 'Completed' },
} as const;

// ── DayCard ────────────────────────────────────────────────────
function DayCard({ day, bookingId, onUpdate, onDelete }: {
  day: BookingDay; bookingId: string;
  onUpdate: (d: BookingDay) => void; onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded]     = useState(false);
  const [editTitle, setEditTitle]   = useState(false);
  const [titleVal, setTitleVal]     = useState(day.title ?? '');
  const [editDesc, setEditDesc]     = useState(false);
  const [descVal, setDescVal]       = useState(day.description ?? '');
  const [editNotes, setEditNotes]   = useState(false);
  const [notesVal, setNotesVal]     = useState(day.notes ?? '');
  const [saving, setSaving]         = useState(false);

  const cfg = STATUS_CFG[day.status];
  const Icon = cfg.icon;

  const save = async (patch: Partial<BookingDay>) => {
    try { setSaving(true); onUpdate(await bookingsService.updateDay(bookingId, day.id, patch)); }
    catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  return (
    <div className={cn('bg-white rounded-2xl border shadow-sm overflow-hidden transition-all',
      day.status === 'COMPLETED' ? 'border-emerald-100' :
      day.status === 'IN_PROGRESS' ? 'border-amber-200' : 'border-slate-100'
    )}>
      <div className="flex items-center gap-3 px-4 py-3.5 group">
        {/* Day number badge */}
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm',
          day.status === 'COMPLETED' ? 'bg-emerald-500 text-white' :
          day.status === 'IN_PROGRESS' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white'
        )}>
          {String(day.dayNumber).padStart(2, '0')}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {editTitle ? (
            <div className="flex items-center gap-2">
              <Input value={titleVal} onChange={(e) => setTitleVal(e.target.value)}
                className="h-8 text-sm rounded-xl border-slate-200 flex-1" autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') { save({ title: titleVal }); setEditTitle(false); } if (e.key === 'Escape') setEditTitle(false); }} />
              <button onClick={() => { save({ title: titleVal }); setEditTitle(false); }}
                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
                <Check className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setEditTitle(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <p className={cn('text-sm font-semibold truncate', day.status === 'COMPLETED' && 'text-slate-400 line-through')}>
                {day.title || `Day ${day.dayNumber}`}
              </p>
              <button onClick={() => setEditTitle(true)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-all shrink-0">
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}
          {day.date && <p className="text-xs text-slate-400 mt-0.5">{format(new Date(day.date), 'EEE, dd MMM yyyy')}</p>}
        </div>

        {/* Status select */}
        <Select value={day.status} onValueChange={(v) => save({ status: v as BookingDay['status'] })}>
          <SelectTrigger className={cn('w-36 h-8 rounded-xl border text-xs font-medium shrink-0', cfg.bg)}>
            <div className="flex items-center gap-1.5">
              <Icon className={cn('h-3.5 w-3.5 shrink-0', cfg.color)} />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>

        <button onClick={() => onDelete(day.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all shrink-0">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => setExpanded((p) => !p)}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-slate-50 space-y-4">
          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Day Plan / Activities</Label>
              {!editDesc && <button onClick={() => { setEditDesc(true); setDescVal(day.description ?? ''); }}
                className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 font-medium">
                <Pencil className="h-3 w-3" /> Edit
              </button>}
            </div>
            {editDesc ? (
              <div className="space-y-2">
                <Textarea value={descVal} onChange={(e) => setDescVal(e.target.value)}
                  placeholder="Pickup from station, hotel check-in, sightseeing..."
                  className="rounded-xl border-slate-200 text-sm resize-none" rows={4} autoFocus />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { save({ description: descVal }); setEditDesc(false); }} disabled={saving}
                    className="rounded-xl h-7 text-xs bg-slate-900 hover:bg-slate-800 gap-1">
                    {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditDesc(false)} className="rounded-xl h-7 text-xs">Cancel</Button>
                </div>
              </div>
            ) : day.description ? (
              <div className="bg-slate-50 rounded-xl px-3 py-2.5 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {day.description}
              </div>
            ) : (
              <button onClick={() => setEditDesc(true)}
                className="w-full text-left text-xs text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl px-3 py-2.5 transition-colors border border-dashed border-slate-200">
                + Click to add day plan / activities...
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Internal Notes</Label>
              {!editNotes && <button onClick={() => { setEditNotes(true); setNotesVal(day.notes ?? ''); }}
                className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 font-medium">
                <Pencil className="h-3 w-3" /> Edit
              </button>}
            </div>
            {editNotes ? (
              <div className="space-y-2">
                <Textarea value={notesVal} onChange={(e) => setNotesVal(e.target.value)}
                  placeholder="Internal notes..." className="rounded-xl border-slate-200 text-sm resize-none" rows={2} autoFocus />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { save({ notes: notesVal }); setEditNotes(false); }} disabled={saving}
                    className="rounded-xl h-7 text-xs bg-slate-900 hover:bg-slate-800 gap-1">
                    {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditNotes(false)} className="rounded-xl h-7 text-xs">Cancel</Button>
                </div>
              </div>
            ) : day.notes ? (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-800 italic">📝 {day.notes}</div>
            ) : (
              <button onClick={() => setEditNotes(true)}
                className="w-full text-left text-xs text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl px-3 py-2 transition-colors border border-dashed border-slate-200">
                + Add internal notes...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── AddDayForm ─────────────────────────────────────────────────
function AddDayForm({ bookingId, nextDayNumber, travelStart, onAdd, onCancel }: {
  bookingId: string; nextDayNumber: number;
  travelStart?: string; onAdd: (day: BookingDay) => void; onCancel: () => void;
}) {
  const getDate = (n: number) => {
    if (!travelStart) return '';
    const d = new Date(travelStart);
    d.setDate(d.getDate() + (n - 1));
    return d.toISOString().slice(0, 10);
  };

  const [form, setForm] = useState({ dayNumber: nextDayNumber, title: '', description: '', date: getDate(nextDayNumber) });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    try {
      setSaving(true);
      const res = await api.post(`/bookings/${bookingId}/days`, {
        dayNumber: form.dayNumber,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        date: form.date || undefined,
      });
      onAdd(res.data.data);
      toast.success(`Day ${form.dayNumber} added`);
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add day');
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <Plus className="h-4 w-4 text-white" />
        </div>
        <h4 className="text-sm font-semibold text-blue-900">Add Day Manually</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Day Number</Label>
          <Input type="number" min={1} value={form.dayNumber}
            onChange={(e) => {
              const n = parseInt(e.target.value) || 1;
              setForm((p) => ({ ...p, dayNumber: n, date: getDate(n) }));
            }}
            className="rounded-xl border-slate-200 h-9 text-sm bg-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Date (optional)</Label>
          <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            className="rounded-xl border-slate-200 h-9 text-sm bg-white" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Day Title <span className="text-red-500">*</span></Label>
        <Input placeholder="e.g. Chandigarh to Shimla by Dezire Cab"
          value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="rounded-xl border-slate-200 h-9 text-sm bg-white" autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Description</Label>
        <Textarea placeholder="Pickup from station, hotel check-in, sightseeing plan..."
          value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          className="rounded-xl border-slate-200 text-sm resize-none bg-white" rows={3} />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleAdd} disabled={saving || !form.title.trim()}
          className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 gap-2 h-9 text-sm">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Add Day {form.dayNumber}
        </Button>
        <Button variant="outline" onClick={onCancel} className="rounded-xl h-9 text-sm bg-white">Cancel</Button>
      </div>
    </div>
  );
}

// ── Progress ───────────────────────────────────────────────────
function DaysProgress({ days }: { days: BookingDay[] }) {
  const completed = days.filter((d) => d.status === 'COMPLETED').length;
  const ongoing   = days.filter((d) => d.status === 'IN_PROGRESS').length;
  const pct       = days.length ? Math.round((completed / days.length) * 100) : 0;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /><strong className="text-emerald-600">{completed}</strong> completed</span>
          {ongoing > 0 && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-500" /><strong className="text-amber-600">{ongoing}</strong> ongoing</span>}
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" />{days.length} total</span>
        </div>
        <span className={cn('text-sm font-bold', pct === 100 ? 'text-emerald-600' : 'text-slate-600')}>{pct}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', pct === 100 ? 'bg-emerald-500' : pct > 60 ? 'bg-blue-500' : 'bg-amber-400')}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────
export function DaysTab({ bookingId, days, hasItinerary, travelStart, onChange }: {
  bookingId: string; days: BookingDay[];
  hasItinerary: boolean; travelStart?: string;
  onChange: (days: BookingDay[]) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteId, setDeleteId]       = useState<string | null>(null);

  const nextDay    = days.length > 0 ? Math.max(...days.map((d) => d.dayNumber)) + 1 : 1;
  const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const gen = await bookingsService.generateDays(bookingId);
      onChange(gen);
      toast.success(`${gen.length} days generated`);
    } catch { toast.error('No itinerary days found. Add days to the itinerary first.'); }
    finally { setGenerating(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/bookings/${bookingId}/days/${deleteId}`);
      onChange(days.filter((d) => d.id !== deleteId));
      toast.success('Day removed');
    } catch { toast.error('Failed to delete'); }
    finally { setDeleteId(null); }
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {hasItinerary && (
          <Button onClick={handleGenerate} disabled={generating} size="sm" variant="outline"
            className="rounded-xl gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-9 font-medium">
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {days.length > 0 ? 'Re-generate from Itinerary' : 'Generate from Itinerary'}
          </Button>
        )}
        <Button onClick={() => setShowAddForm((p) => !p)} size="sm"
          className={cn('rounded-xl gap-2 h-9 font-medium',
            showAddForm ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-900 hover:bg-slate-800 text-white')}>
          {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showAddForm ? 'Cancel' : 'Add Day Manually'}
        </Button>
        {days.length > 0 && (
          <Badge variant="outline" className="ml-auto text-xs border-slate-200 text-slate-500">
            {days.length} day{days.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {days.length > 0 && <DaysProgress days={days} />}

      {showAddForm && (
        <AddDayForm bookingId={bookingId} nextDayNumber={nextDay} travelStart={travelStart}
          onAdd={(d) => { onChange([...days, d].sort((a, b) => a.dayNumber - b.dayNumber)); setShowAddForm(false); }}
          onCancel={() => setShowAddForm(false)} />
      )}

      {days.length === 0 && !showAddForm && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1.5">No days added yet</h3>
          <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto leading-relaxed">
            {hasItinerary ? 'Auto-generate from itinerary, or add manually.' : 'Add days manually to track trip execution.'}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {hasItinerary && (
              <Button onClick={handleGenerate} disabled={generating} variant="outline" size="sm"
                className="rounded-xl gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Generate from Itinerary
              </Button>
            )}
            <Button onClick={() => setShowAddForm(true)} size="sm" className="rounded-xl gap-2 bg-slate-900 hover:bg-slate-800">
              <Plus className="h-3.5 w-3.5" /> Add First Day
            </Button>
          </div>
        </div>
      )}

      {sortedDays.length > 0 && (
        <div className="space-y-3">
          {sortedDays.map((day) => (
            <DayCard key={day.id} day={day} bookingId={bookingId}
              onUpdate={(u) => onChange(days.map((d) => d.id === u.id ? u : d))}
              onDelete={setDeleteId} />
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this day?</AlertDialogTitle>
            <AlertDialogDescription>This day will be permanently deleted from the booking.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 rounded-xl">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}