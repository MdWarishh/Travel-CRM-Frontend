'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Filter, RefreshCw, LayoutGrid, List, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { itinerariesService } from '@/services/itineraries.service';
import { ItineraryCard } from '@/components/modules/itineraries/ItineraryCard';
import { GeneratePdfDialog } from '@/components/modules/itineraries/GeneratePdfDialog';
import { Itinerary, ItineraryStatus, ItineraryFilterParams } from '@/types/itinerary.types';

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Status', value: 'all' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Finalized', value: 'FINALIZED' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Archived', value: 'ARCHIVED' },
];

export default function ItinerariesPage() {
  const router = useRouter();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
 const [isTemplate, setIsTemplate] = useState('all');
  const [pdfTarget, setPdfTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItineraries = useCallback(async () => {
    setLoading(true);
    try {
      const params: ItineraryFilterParams = {
        ...(search && { search }),
        ...(status !== 'all' && { status: status as ItineraryStatus }),
        ...(isTemplate !== 'all' && { isTemplate }),
      };
      const res = await itinerariesService.getAll(params);
      setItineraries(res.data);
    } catch {
      toast.error('Failed to load itineraries');
    } finally {
      setLoading(false);
    }
  }, [search, status, isTemplate]);

  useEffect(() => {
    const t = setTimeout(fetchItineraries, 300);
    return () => clearTimeout(t);
  }, [fetchItineraries]);

  const handleDuplicate = async (id: string) => {
    try {
      await itinerariesService.duplicate(id);
      toast.success('Itinerary duplicated');
      fetchItineraries();
    } catch {
      toast.error('Failed to duplicate');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await itinerariesService.delete(deleteTarget);
      toast.success('Itinerary deleted');
      setDeleteTarget(null);
      fetchItineraries();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Itineraries</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {loading ? '—' : `${itineraries.length} itineraries`}
            </p>
          </div>
          <Link href="/itineraries/new">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white h-9 gap-1.5">
              <Plus className="h-4 w-4" /> New Itinerary
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by title, destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-white"
            />
          </div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-40 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={isTemplate} onValueChange={setIsTemplate}>
            <SelectTrigger className="h-9 w-40 bg-white">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
<SelectItem value="true">Templates Only</SelectItem>
<SelectItem value="false">Custom Only</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="h-9 w-9 bg-white" onClick={fetchItineraries}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <Skeleton className="h-36 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : itineraries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Layers className="h-12 w-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">No itineraries found</h3>
            <p className="text-sm text-slate-400 mt-1 mb-6">Create your first itinerary to get started</p>
            <Link href="/itineraries/new">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5">
                <Plus className="h-4 w-4" /> New Itinerary
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {itineraries.map((it) => (
              <ItineraryCard
                key={it.id}
                itinerary={it}
                onDuplicate={handleDuplicate}
                onDelete={setDeleteTarget}
                onGeneratePdf={(id) => setPdfTarget({ id, title: it.title })}
              />
            ))}
          </div>
        )}
      </div>

      {/* PDF Dialog */}
      {pdfTarget && (
        <GeneratePdfDialog
          open={!!pdfTarget}
          onClose={() => setPdfTarget(null)}
          itineraryId={pdfTarget.id}
          itineraryTitle={pdfTarget.title}
        />
      )}

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Itinerary?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The itinerary and all its days will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}