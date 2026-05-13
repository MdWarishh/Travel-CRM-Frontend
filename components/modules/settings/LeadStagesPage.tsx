'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Plus, Pencil, Trash2, GripVertical, Check, X,
  Loader2, AlertTriangle, Layers,
} from 'lucide-react';
import { LeadStage, CreateStageData } from '@/types/leads.types';
import { leadStagesService } from '@/services/leads.service';
import { cn } from '@/utils/helpers';

// ── Preset colors (same as your Add Status modal) ────────────────────────────
const PRESET_COLORS = [
  '#b08080', '#7c2020', '#3b5bdb', '#4a7c1f', '#e67700', '#9c36b5',
  '#e03131', '#000000', '#c92a2a', '#1c1c8a', '#d4a017', '#6b7a1a',
  '#0f7c6e', '#4b3fa0', '#3a9a3a', '#2d6e2d', '#dc2626',
];

// ── Drag state ref type ───────────────────────────────────────────────────────
interface DragState {
  draggedId: string;
  overId: string | null;
}

export default function LeadStagesPage() {
  const [stages, setStages] = useState<LeadStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add modal state
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<CreateStageData>({ title: '', color: PRESET_COLORS[2] });
  const [addError, setAddError] = useState('');

  // Edit inline state
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; color: string }>({ title: '', color: '' });

  // Delete confirm state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Drag state
  const dragState = useRef<DragState | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchStages = async () => {
    try {
      setLoading(true);
      const data = await leadStagesService.getAll();
      setStages(data);
    } catch {
      setError('Failed to load stages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStages(); }, []);

  // ── Add ──────────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!addForm.title.trim()) { setAddError('Title is required'); return; }
    try {
      setSaving(true);
      const created = await leadStagesService.create(addForm);
      setStages((p) => [...p, created]);
      setShowAdd(false);
      setAddForm({ title: '', color: PRESET_COLORS[2] });
      setAddError('');
    } catch (e: any) {
      setAddError(e?.response?.data?.message || 'Failed to create stage');
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const startEdit = (stage: LeadStage) => {
    setEditId(stage.id);
    setEditForm({ title: stage.title, color: stage.color });
  };

  const handleEdit = async (id: string) => {
    try {
      setSaving(true);
      const updated = await leadStagesService.update(id, editForm);
      setStages((p) => p.map((s) => (s.id === id ? updated : s)));
      setEditId(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await leadStagesService.delete(id);
      setStages((p) => p.filter((s) => s.id !== id));
      setDeleteId(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to delete stage');
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── Drag & Drop (HTML5) ──────────────────────────────────────────────────────
  const onDragStart = (id: string) => {
    dragState.current = { draggedId: id, overId: null };
    setDraggingId(id);
  };

  const onDragOver = (e: React.DragEvent, id: string, idx: number) => {
    e.preventDefault();
    if (!dragState.current || dragState.current.draggedId === id) return;
    dragState.current.overId = id;
    setOverIdx(idx);
  };

  const onDrop = async () => {
    if (!dragState.current) return;
    const { draggedId, overId } = dragState.current;
    if (!overId || draggedId === overId) {
      setDraggingId(null); setOverIdx(null);
      return;
    }

    const reordered = [...stages];
    const fromIdx = reordered.findIndex((s) => s.id === draggedId);
    const toIdx   = reordered.findIndex((s) => s.id === overId);
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    setStages(reordered);
    setDraggingId(null);
    setOverIdx(null);
    dragState.current = null;

    try {
      await leadStagesService.reorder(reordered.map((s) => s.id));
    } catch {
      fetchStages(); // revert on fail
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Lead Settings</h1>
            <p className="text-sm text-slate-400">Manage your pipeline stages</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Status
        </button>
      </div>

      {/* Global error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Stages List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pipeline Stages</span>
          <span className="text-xs text-slate-600">{stages.length} stages · drag to reorder</span>
        </div>

        {stages.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No stages yet. Add your first one!
          </div>
        ) : (
          <ul className="divide-y divide-slate-800">
            {stages.map((stage, idx) => (
              <li
                key={stage.id}
                draggable
                onDragStart={() => onDragStart(stage.id)}
                onDragOver={(e) => onDragOver(e, stage.id, idx)}
                onDrop={onDrop}
                onDragEnd={() => { setDraggingId(null); setOverIdx(null); dragState.current = null; }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 transition-all duration-150',
                  draggingId === stage.id && 'opacity-40',
                  overIdx === idx && draggingId !== stage.id && 'border-t-2 border-blue-500'
                )}
              >
                {/* Drag handle */}
                <GripVertical className="w-4 h-4 text-slate-600 cursor-grab active:cursor-grabbing flex-shrink-0" />

                {/* Color dot */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stage.color }}
                />

                {/* Position badge */}
                <span className="text-xs text-slate-600 w-5 text-center flex-shrink-0">{idx + 1}</span>

                {editId === stage.id ? (
                  /* ── Edit Mode ── */
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      autoFocus
                      value={editForm.title}
                      onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(stage.id); if (e.key === 'Escape') setEditId(null); }}
                      className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-1">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setEditForm((p) => ({ ...p, color: c }))}
                          className={cn(
                            'w-5 h-5 rounded-full border-2 transition-transform hover:scale-110',
                            editForm.color === c ? 'border-white scale-110' : 'border-transparent'
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleEdit(stage.id)}
                      disabled={saving}
                      className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  /* ── View Mode ── */
                  <>
                    <span className="flex-1 text-sm text-white font-medium">{stage.title}</span>
                    {stage._count !== undefined && (
                      <span className="text-xs text-slate-500 mr-2">{stage._count.leads} leads</span>
                    )}
                    {stage.isDefault && (
                      <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full mr-1">Default</span>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(stage)}
                        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(stage.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        disabled={stage.isDefault}
                        title={stage.isDefault ? 'Cannot delete default stage' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pipeline Preview */}
      <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">Pipeline Preview</p>
        <div className="flex gap-2 flex-wrap">
          {stages.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: s.color + '33', border: `1px solid ${s.color}55` }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.title}
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Modal ───────────────────────────────────────────────────────────── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white">Add Status</h2>
              <button onClick={() => { setShowAdd(false); setAddError(''); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  autoFocus
                  placeholder="Enter Status"
                  value={addForm.title}
                  onChange={(e) => { setAddForm((p) => ({ ...p, title: e.target.value })); setAddError(''); }}
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
                />
                {addError && <p className="text-red-400 text-xs mt-1">{addError}</p>}
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Position</label>
                <input
                  type="number"
                  placeholder="Leave empty for last"
                  onChange={(e) => setAddForm((p) => ({ ...p, position: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Color <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setAddForm((p) => ({ ...p, color: c }))}
                      className={cn(
                        'w-full aspect-square rounded-lg border-2 transition-all hover:scale-105',
                        addForm.color === c ? 'border-white scale-105 shadow-lg' : 'border-transparent'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex gap-3 justify-end">
              <button
                onClick={() => { setShowAdd(false); setAddError(''); }}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Delete Stage?</h3>
                <p className="text-xs text-slate-400">
                  {stages.find((s) => s.id === deleteId)?._count?.leads
                    ? `${stages.find((s) => s.id === deleteId)?._count?.leads} leads will be affected`
                    : 'This action cannot be undone'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 text-sm text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}