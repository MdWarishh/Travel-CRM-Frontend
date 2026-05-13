'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followupsService } from '@/services/index';
import { FollowUp } from '@/types';
import { PageHeader, Button, Card, Badge, Spinner, EmptyState, Table, Th, Td, Modal, Select } from '@/components/ui/index';
import { Plus, CalendarClock, Phone, MessageSquare, Video, Mail, Check, X, Pencil, Trash2 } from 'lucide-react';
import { formatDateTime, cn } from '@/utils/helpers';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const TYPE_ICONS: Record<string, React.ElementType> = { CALL: Phone, MESSAGE: MessageSquare, MEETING: Video, EMAIL: Mail };
const TYPE_COLORS: Record<string, string> = { CALL: 'bg-blue-100 text-blue-700', MESSAGE: 'bg-purple-100 text-purple-700', MEETING: 'bg-green-100 text-green-700', EMAIL: 'bg-orange-100 text-orange-700' };
const STATUS_COLORS: Record<string, string> = { PENDING: 'bg-yellow-100 text-yellow-700', COMPLETED: 'bg-green-100 text-green-700', MISSED: 'bg-red-100 text-red-700' };

export default function FollowUpsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<FollowUp | null>(null);
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['followups', filters, page],
    queryFn: () => followupsService.getAll({ page: String(page), limit: '20', ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }),
  });

  const { data: todayData } = useQuery({ queryKey: ['followups', 'today'], queryFn: followupsService.getToday });

  const createMutation = useMutation({ mutationFn: followupsService.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['followups'] }); toast.success('Follow-up scheduled!'); setShowModal(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<FollowUp> }) => followupsService.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['followups'] }); toast.success('Updated!'); setShowModal(false); setEditItem(null); } });
  const deleteMutation = useMutation({ mutationFn: followupsService.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ['followups'] }); toast.success('Deleted'); } });

  const { register, handleSubmit, reset, setValue } = useForm<FollowUp>();
  const openCreate = () => { reset(); setEditItem(null); setShowModal(true); };
  const openEdit = (fu: FollowUp) => { setEditItem(fu); (Object.entries(fu) as [keyof FollowUp, unknown][]).forEach(([k, v]) => setValue(k, v as string)); setShowModal(true); };
  const onSubmit = (formData: FollowUp) => { if (editItem) updateMutation.mutate({ id: editItem.id, data: formData }); else createMutation.mutate(formData); };

  const followUps = (data?.data || []) as FollowUp[];
  const pagination = data?.pagination;
  const todayFollowUps = (todayData || []) as FollowUp[];

  return (
    <div className="space-y-6">
      <PageHeader title="Follow-ups" subtitle={`${pagination?.total || 0} total`} action={<Button icon={Plus} onClick={openCreate}>Schedule Follow-up</Button>} />

      {todayFollowUps.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-2 mb-3"><CalendarClock className="w-4 h-4 text-yellow-600" /><h2 className="text-sm font-semibold text-yellow-800">Due Today ({todayFollowUps.length})</h2></div>
          <div className="flex flex-wrap gap-2">
            {todayFollowUps.map((fu) => {
              const Icon = TYPE_ICONS[fu.type] || Phone;
              return (
                <div key={fu.id} className="flex items-center gap-2 bg-white border border-yellow-200 rounded-lg px-3 py-2 shadow-sm">
                  <Icon className="w-3.5 h-3.5 text-yellow-600" />
                  <div><p className="text-xs font-semibold text-slate-800">{fu.lead?.name || fu.customer?.name || 'Unknown'}</p><p className="text-xs text-slate-500">{fu.type} · {formatDateTime(fu.dueAt)}</p></div>
                  <button onClick={() => updateMutation.mutate({ id: fu.id, data: { status: 'COMPLETED' } })} className="ml-1 p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors"><Check className="w-3.5 h-3.5" /></button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap gap-3">
          {[{ key: 'status', opts: [['', 'All Statuses'], ['PENDING', 'Pending'], ['COMPLETED', 'Completed'], ['MISSED', 'Missed']] }, { key: 'type', opts: [['', 'All Types'], ['CALL', 'Call'], ['MESSAGE', 'Message'], ['MEETING', 'Meeting'], ['EMAIL', 'Email']] }].map(({ key, opts }) => (
            <select key={key} className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none" value={filters[key as keyof typeof filters]} onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}>
              {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          {Object.values(filters).some(Boolean) && <button onClick={() => setFilters({ status: '', type: '' })} className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">Clear</button>}
        </div>
      </Card>

      <Card padding={false}>
        {isLoading ? <Spinner /> : followUps.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No follow-ups found" description="Schedule a follow-up for a lead or customer" action={<Button icon={Plus} onClick={openCreate}>Schedule</Button>} />
        ) : (
          <>
            <Table>
              <thead><tr><Th>Contact</Th><Th>Type</Th><Th>Due At</Th><Th>Status</Th><Th>Assigned To</Th><Th>Notes</Th><Th>Actions</Th></tr></thead>
              <tbody>
                {followUps.map((fu) => {
                  const Icon = TYPE_ICONS[fu.type] || Phone;
                  const isPast = new Date(fu.dueAt) < new Date() && fu.status === 'PENDING';
                  return (
                    <tr key={fu.id} className={cn('hover:bg-slate-50', isPast && 'bg-red-50/40')}>
                      <Td><div><p className="font-medium text-slate-900">{fu.lead?.name || fu.customer?.name || '—'}</p><p className="text-xs text-slate-400">{fu.lead ? 'Lead' : 'Customer'}</p></div></Td>
                      <Td><span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', TYPE_COLORS[fu.type])}><Icon className="w-3 h-3" />{fu.type}</span></Td>
                      <Td><p className={cn('text-sm', isPast ? 'text-red-600 font-medium' : '')}>{formatDateTime(fu.dueAt)}{isPast && <span className="block text-xs text-red-500">Overdue</span>}</p></Td>
                      <Td><Badge label={fu.status} className={STATUS_COLORS[fu.status]} /></Td>
                      <Td>{fu.assignedTo ? <span className="text-xs text-blue-600 font-medium">{fu.assignedTo.name}</span> : '—'}</Td>
                      <Td><p className="text-xs text-slate-500 max-w-40 truncate">{fu.notes || '—'}</p></Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          {fu.status === 'PENDING' && (<>
                            <button onClick={() => updateMutation.mutate({ id: fu.id, data: { status: 'COMPLETED' } })} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Complete"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => updateMutation.mutate({ id: fu.id, data: { status: 'MISSED' } })} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Missed"><X className="w-3.5 h-3.5" /></button>
                          </>)}
                          <button onClick={() => openEdit(fu)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(fu.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>}
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">{(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}</p>
                <div className="flex gap-2">
                  <button disabled={!pagination.hasPrev} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50">Previous</button>
                  <button disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Follow-up' : 'Schedule Follow-up'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" {...register('type')} options={[{ value: 'CALL', label: '📞 Call' }, { value: 'MESSAGE', label: '💬 Message' }, { value: 'MEETING', label: '🤝 Meeting' }, { value: 'EMAIL', label: '📧 Email' }]} />
            <Select label="Status" {...register('status')} options={[{ value: 'PENDING', label: 'Pending' }, { value: 'COMPLETED', label: 'Completed' }, { value: 'MISSED', label: 'Missed' }]} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Due Date & Time *</label>
            <input type="datetime-local" {...register('dueAt', { required: true })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea {...register('notes')} rows={3} placeholder="What to discuss..." className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => { setShowModal(false); setEditItem(null); }}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>{editItem ? 'Update' : 'Schedule'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}