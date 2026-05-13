'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService } from '@/services/customers.service';
import { CustomerNote } from '@/types/customer.types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const NOTE_TYPE_STYLES: Record<string, string> = {
  GENERAL: 'bg-slate-100 text-slate-600',
  PREFERENCE: 'bg-blue-50 text-blue-600',
  INTERNAL: 'bg-amber-50 text-amber-600',
};

interface Props {
  customerId: string;
  onRefetch?: () => void;
}

export function NotesTab({ customerId }: Props) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<CustomerNote['type']>('GENERAL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: notes, isLoading } = useQuery({
    queryKey: ['customer-notes', customerId],
    queryFn: () => customersService.getNotes(customerId),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['customer-notes', customerId] });

  const addMutation = useMutation({
    mutationFn: () => customersService.addNote(customerId, { content: newContent, type: newType }),
    onSuccess: () => { invalidate(); setAdding(false); setNewContent(''); toast.success('Note added'); },
    onError: () => toast.error('Failed to add note'),
  });

  const updateMutation = useMutation({
    mutationFn: (noteId: string) => customersService.updateNote(customerId, noteId, { content: editContent }),
    onSuccess: () => { invalidate(); setEditingId(null); toast.success('Note updated'); },
    onError: () => toast.error('Failed to update note'),
  });

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => customersService.deleteNote(customerId, noteId),
    onSuccess: () => { invalidate(); toast.success('Note deleted'); },
    onError: () => toast.error('Failed to delete note'),
  });

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div className="space-y-3">
      {/* Add note */}
      {adding ? (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <Textarea
            placeholder="Write a note..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="flex items-center justify-between">
            <Select value={newType} onValueChange={(v) => setNewType(v as CustomerNote['type'])}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENERAL">General</SelectItem>
                <SelectItem value="PREFERENCE">Preference</SelectItem>
                <SelectItem value="INTERNAL">Internal</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                onClick={() => addMutation.mutate()}
                disabled={!newContent.trim() || addMutation.isPending}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setAdding(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Note
        </Button>
      )}

      {/* Notes list */}
      {(!notes || notes.length === 0) && !adding ? (
        <div className="py-16 text-center bg-card border border-border rounded-xl">
          <p className="text-sm text-muted-foreground">No notes yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(notes ?? []).map((note) => (
            <div key={note.id} className="bg-card border border-border rounded-xl p-4">
              {editingId === note.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateMutation.mutate(note.id)}
                      disabled={updateMutation.isPending}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-relaxed flex-1">{note.content}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => deleteMutation.mutate(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', NOTE_TYPE_STYLES[note.type])}>
                      {note.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {note.createdBy?.name} · {formatDate(note.createdAt)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}