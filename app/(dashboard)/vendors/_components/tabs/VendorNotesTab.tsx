'use client';

// app/(dashboard)/vendors/_components/tabs/VendorNotesTab.tsx

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Check, X, StickyNote, AlertTriangle, Info, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { vendorNotesService } from '@/services/vendors.service';
import { VendorNote } from '@/types/vendors';
import { formatDateTime } from '../vendor.constants';

// ── Note category tags ────────────────────────────────────────────────────────

const NOTE_TAGS = [
  { label: '💬 General',     value: 'general' },
  { label: '⚠️ Warning',     value: 'warning' },
  { label: '💰 Pricing',     value: 'pricing' },
  { label: '✅ Quality',     value: 'quality' },
  { label: '📋 Contract',    value: 'contract' },
];

// ── Single note card ──────────────────────────────────────────────────────────

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: VendorNote;
  onEdit: (note: VendorNote) => void;
  onDelete: (noteId: string) => void;
}) {
  // Detect tag prefix like "[warning]" at start
  const tagMatch = note.content.match(/^\[(\w+)\]\s*/);
  const tag = tagMatch ? tagMatch[1] : null;
  const content = tag ? note.content.replace(tagMatch[0], '') : note.content;

  const tagStyle: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    warning: { bg: 'bg-red-50 border-red-100',    text: 'text-red-700',    icon: <AlertTriangle className="w-3 h-3" /> },
    pricing: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700', icon: <Tag className="w-3 h-3" /> },
    quality: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', icon: <Check className="w-3 h-3" /> },
    contract:{ bg: 'bg-blue-50 border-blue-100',  text: 'text-blue-700',   icon: <Info className="w-3 h-3" /> },
  };

  const style = tag ? tagStyle[tag] : null;

  return (
    <div
      className={`group border rounded-xl p-4 transition-all
        ${style ? `${style.bg}` : 'bg-white border-slate-100 hover:border-slate-200'}`}
    >
      {/* Tag badge */}
      {tag && style && (
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold mb-2.5 ${style.text} bg-white/60`}>
          {style.icon}
          {tag.charAt(0).toUpperCase() + tag.slice(1)}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed flex-1">{content}</p>

        {/* Actions — show on hover */}
        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit note"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meta */}
      <p className="text-[11px] text-slate-400 mt-2">
        {note.createdBy?.name ?? 'Unknown'} · {formatDateTime(note.createdAt)}
        {note.updatedAt !== note.createdAt && ' · edited'}
      </p>
    </div>
  );
}

// ── Add / Edit form ───────────────────────────────────────────────────────────

function NoteForm({
  defaultValue = '',
  selectedTag,
  onTagChange,
  onSubmit,
  onCancel,
  isPending,
  isEdit,
}: {
  defaultValue?: string;
  selectedTag: string;
  onTagChange: (t: string) => void;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  isPending: boolean;
  isEdit?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = () => {
    if (!value.trim()) return;
    const prefix = selectedTag ? `[${selectedTag}] ` : '';
    onSubmit(prefix + value.trim());
  };

  return (
    <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-4 space-y-3">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
        {isEdit ? 'Edit Note' : 'Add Note'}
      </p>

      {/* Tag selector */}
      {!isEdit && (
        <div className="flex flex-wrap gap-1.5">
          {NOTE_TAGS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onTagChange(selectedTag === t.value ? '' : t.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all
                ${selectedTag === t.value
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="Service quality remarks, pricing negotiation details, warnings..."
        className="bg-white text-sm resize-none border-slate-200 focus-visible:ring-amber-300/50"
        autoFocus={isEdit}
      />

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="w-3.5 h-3.5 mr-1" /> Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!value.trim() || isPending}
        >
          {isPending ? 'Saving...' : isEdit ? <><Check className="w-3.5 h-3.5 mr-1" /> Save</> : <><Plus className="w-3.5 h-3.5 mr-1" /> Add Note</>}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function VendorNotesTab({
  vendorId,
  notes,
}: {
  vendorId: string;
  notes: VendorNote[];
}) {
  const qc = useQueryClient();
  const [editingNote, setEditingNote] = useState<VendorNote | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState('');

  const invalidate = () => qc.invalidateQueries({ queryKey: ['vendors', vendorId] });

  const addMutation = useMutation({
    mutationFn: (content: string) => vendorNotesService.add(vendorId, { content }),
    onSuccess: () => { invalidate(); toast.success('Note added'); },
    onError: () => toast.error('Failed to add note'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      vendorNotesService.update(vendorId, noteId, { content }),
    onSuccess: () => { invalidate(); setEditingNote(null); toast.success('Note updated'); },
    onError: () => toast.error('Failed to update note'),
  });

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => vendorNotesService.delete(vendorId, noteId),
    onSuccess: () => { invalidate(); setDeleteTarget(null); toast.success('Note deleted'); },
    onError: () => toast.error('Failed to delete note'),
  });

  return (
    <div className="space-y-4">
      {/* Add form */}
      <NoteForm
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        onSubmit={(content) => addMutation.mutate(content)}
        isPending={addMutation.isPending}
      />

      {/* Notes list */}
      <div className="space-y-3">
        {!notes.length && (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <StickyNote className="w-4.5 h-4.5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400">No notes yet. Add your first note above.</p>
          </div>
        )}

        {notes.map((note) =>
          editingNote?.id === note.id ? (
            <NoteForm
              key={note.id}
              defaultValue={note.content.replace(/^\[\w+\]\s*/, '')}
              selectedTag=""
              onTagChange={() => {}}
              onSubmit={(content) => updateMutation.mutate({ noteId: note.id, content })}
              onCancel={() => setEditingNote(null)}
              isPending={updateMutation.isPending}
              isEdit
            />
          ) : (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={setEditingNote}
              onDelete={setDeleteTarget}
            />
          )
        )}
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Note'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}