'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft, Save, Loader2, Plus, FileDown, Copy,
  Trash2, MoreVertical, MapPin, Calendar, Users, IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import { itinerariesService } from '@/services/itineraries.service';
import { DayCard } from '@/components/modules/itineraries/DayCard';
import { DayFormDialog } from '@/components/modules/itineraries/DayFormDialog';
import { ThemeEditor } from '@/components/modules/itineraries/ThemeEditor';
import { PoliciesForm } from '@/components/modules/itineraries/PoliciesForm';
import { AccountsManager } from '@/components/modules/itineraries/AccountsManager';
import { ThankYouEditor } from '@/components/modules/itineraries/ThankYouEditor';
import { ItineraryStatusBadge } from '@/components/modules/itineraries/ItineraryStatusBadge';
import { GeneratePdfDialog } from '@/components/modules/itineraries/GeneratePdfDialog';
import { Itinerary, ItineraryDay, UpdateItineraryPayload } from '@/types/itinerary.types';

type InfoFormValues = {
  title: string;
  destination: string;
  startPoint: string;
  endPoint: string;
  durationLabel: string;
  startDate: string;
  endDate: string;
  totalDays: string;
  numberOfTravelers: string;
  totalPrice: string;
  heroImageUrl: string;
  inclusions: string;
  exclusions: string;
  notes: string;
  status: string;
};

export default function ItineraryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<ItineraryDay | null>(null);
  const [dayLoading, setDayLoading] = useState(false);
  const [deleteDayId, setDeleteDayId] = useState<string | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [sectionSaving, setSectionSaving] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { isDirty } } = useForm<InfoFormValues>();

  const fetchItinerary = useCallback(async () => {
    try {
      const data = await itinerariesService.getById(id);
      setItinerary(data);
      reset({
        title: data.title,
        destination: data.destination ?? '',
        startPoint: data.startPoint ?? '',
        endPoint: data.endPoint ?? '',
        durationLabel: data.durationLabel ?? '',
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        endDate: data.endDate ? data.endDate.split('T')[0] : '',
        totalDays: data.totalDays?.toString() ?? '',
        numberOfTravelers: data.numberOfTravelers?.toString() ?? '',
        totalPrice: data.totalPrice?.toString() ?? '',
        heroImageUrl: data.heroImageUrl ?? '',
        inclusions: data.inclusions ?? '',
        exclusions: data.exclusions ?? '',
        notes: data.notes ?? '',
        status: data.status,
      });
    } catch {
      toast.error('Failed to load itinerary');
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchItinerary();
  }, [fetchItinerary]);

  const saveInfo = async (values: InfoFormValues) => {
    setSaving(true);
    try {
      const payload: UpdateItineraryPayload = {
        title: values.title,
        status: values.status as any,
        destination: values.destination || undefined,
        startPoint: values.startPoint || undefined,
        endPoint: values.endPoint || undefined,
        durationLabel: values.durationLabel || undefined,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        totalDays: values.totalDays ? Number(values.totalDays) : undefined,
        numberOfTravelers: values.numberOfTravelers ? Number(values.numberOfTravelers) : undefined,
        totalPrice: values.totalPrice ? Number(values.totalPrice) : undefined,
        heroImageUrl: values.heroImageUrl || undefined,
        inclusions: values.inclusions || undefined,
        exclusions: values.exclusions || undefined,
        notes: values.notes || undefined,
      };
      const updated = await itinerariesService.update(id, payload);
      setItinerary(updated);
      toast.success('Saved!');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleUpsertDay = async (data: any) => {
    setDayLoading(true);
    try {
      await itinerariesService.upsertDay(id, data);
      toast.success(editingDay ? 'Day updated' : 'Day added');
      setDayDialogOpen(false);
      setEditingDay(null);
      fetchItinerary();
    } catch {
      toast.error('Failed to save day');
    } finally {
      setDayLoading(false);
    }
  };

  const handleDeleteDay = async () => {
    if (!deleteDayId) return;
    try {
      await itinerariesService.deleteDay(id, deleteDayId);
      toast.success('Day deleted');
      setDeleteDayId(null);
      fetchItinerary();
    } catch {
      toast.error('Failed to delete day');
    }
  };

  const saveSection = async (section: string, data: any) => {
    setSectionSaving(section);
    try {
      await itinerariesService.update(id, { [section]: data });
      toast.success(`${section} saved!`);
      fetchItinerary();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSectionSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 h-16" />
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!itinerary) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-3">
          <Link href="/itineraries">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 truncate">{itinerary.title}</h1>
              <ItineraryStatusBadge status={itinerary.status} />
              {itinerary.isTemplate && (
                <Badge variant="outline" className="text-xs text-violet-700 border-violet-200 bg-violet-50">Template</Badge>
              )}
            </div>
            {itinerary.destination && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" /> {itinerary.destination}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setPdfOpen(true)}
            >
              <FileDown className="h-3.5 w-3.5" /> PDF
            </Button>
            <Button
              onClick={handleSubmit(saveInfo)}
              disabled={saving || !isDirty}
              size="sm"
              className="h-8 bg-slate-900 hover:bg-slate-800 text-white gap-1.5 text-xs"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <Tabs defaultValue="info">
          <TabsList className="bg-white border border-slate-200 h-9 mb-6">
            <TabsTrigger value="info" className="text-xs h-7">Info</TabsTrigger>
            <TabsTrigger value="days" className="text-xs h-7">
              Days
              {itinerary.days.length > 0 && (
                <span className="ml-1.5 bg-slate-100 text-slate-600 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  {itinerary.days.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="theme" className="text-xs h-7">Theme</TabsTrigger>
            <TabsTrigger value="policies" className="text-xs h-7">Policies</TabsTrigger>
            <TabsTrigger value="accounts" className="text-xs h-7">Accounts</TabsTrigger>
            <TabsTrigger value="thankyou" className="text-xs h-7">Thank You</TabsTrigger>
          </TabsList>

          {/* ─── INFO TAB ─── */}
          <TabsContent value="info" className="mt-0">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-5">
                {/* Basic */}
                <Card className="border border-slate-200 shadow-none">
                  <CardHeader className="pb-3 pt-4 px-5">
                    <CardTitle className="text-sm font-semibold">Basic Details</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-4">
                    <div>
                      <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Title</Label>
                      <Input {...register('title')} className="h-9" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Status</Label>
                        <Select defaultValue={itinerary.status} onValueChange={(v) => setValue('status', v, { shouldDirty: true })}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="FINALIZED">Finalized</SelectItem>
                            <SelectItem value="SENT">Sent</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Duration Label</Label>
                        <Input {...register('durationLabel')} placeholder="e.g. 2N/3D" className="h-9" />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Destination</Label>
                        <Input {...register('destination')} className="h-9" />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Total Days</Label>
                        <Input type="number" {...register('totalDays')} className="h-9" />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Start Point</Label>
                        <Input {...register('startPoint')} className="h-9" />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">End Point</Label>
                        <Input {...register('endPoint')} className="h-9" />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Start Date</Label>
                        <Input type="date" {...register('startDate')} className="h-9" />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">End Date</Label>
                        <Input type="date" {...register('endDate')} className="h-9" />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Travelers</Label>
                        <Input type="number" {...register('numberOfTravelers')} className="h-9" />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Total Price (₹)</Label>
                        <Input type="number" {...register('totalPrice')} className="h-9" />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Hero Image URL</Label>
                        <Input {...register('heroImageUrl')} className="h-9" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Inclusions / Exclusions */}
                <Card className="border border-slate-200 shadow-none">
                  <CardHeader className="pb-3 pt-4 px-5">
                    <CardTitle className="text-sm font-semibold">Inclusions & Exclusions</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-4">
                    <div>
                      <Label className="text-xs font-medium text-slate-600 mb-1.5 block">✅ Inclusions</Label>
                      <Textarea {...register('inclusions')} rows={4} className="resize-none text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-600 mb-1.5 block">❌ Exclusions</Label>
                      <Textarea {...register('exclusions')} rows={4} className="resize-none text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-600 mb-1.5 block">📝 Notes</Label>
                      <Textarea {...register('notes')} rows={3} className="resize-none text-sm" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Quick stats */}
                <Card className="border border-slate-200 shadow-none">
                  <CardContent className="p-4 space-y-3">
                    {[
                      { icon: <Calendar className="h-4 w-4 text-slate-400" />, label: 'Days', value: itinerary.days.length },
                      { icon: <Users className="h-4 w-4 text-slate-400" />, label: 'Travelers', value: itinerary.numberOfTravelers ?? '—' },
                      { icon: <IndianRupee className="h-4 w-4 text-slate-400" />, label: 'Price', value: itinerary.totalPrice ? `₹${Number(itinerary.totalPrice).toLocaleString('en-IN')}` : '—' },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {stat.icon} {stat.label}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{stat.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Hero preview */}
                {itinerary.heroImageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <img src={itinerary.heroImageUrl} alt="Hero" className="w-full h-40 object-cover" />
                  </div>
                )}

                {/* Customer */}
                {itinerary.customer && (
                  <Card className="border border-slate-200 shadow-none">
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-500 mb-1">Customer</p>
                      <p className="text-sm font-semibold text-slate-800">{itinerary.customer.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{itinerary.customer.phone}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ─── DAYS TAB ─── */}
          <TabsContent value="days" className="mt-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-700">
                {itinerary.days.length} {itinerary.days.length === 1 ? 'Day' : 'Days'}
              </p>
              <Button
                size="sm"
                className="h-8 bg-slate-900 hover:bg-slate-800 text-white gap-1.5 text-xs"
                onClick={() => { setEditingDay(null); setDayDialogOpen(true); }}
              >
                <Plus className="h-3.5 w-3.5" /> Add Day
              </Button>
            </div>

            {itinerary.days.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-12 text-center bg-white">
                <Calendar className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">No days added yet</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">Add day-by-day itinerary with activities and images</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => { setEditingDay(null); setDayDialogOpen(true); }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add First Day
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {itinerary.days.map((day) => (
                  <DayCard
                    key={day.id}
                    day={day}
                    onEdit={(d) => { setEditingDay(d); setDayDialogOpen(true); }}
                    onDelete={setDeleteDayId}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ─── THEME TAB ─── */}
          <TabsContent value="theme" className="mt-0">
            <div className="max-w-xl">
              <ThemeEditor
                defaultValues={itinerary.theme}
                onSave={(data) => saveSection('theme', data)}
                loading={sectionSaving === 'theme'}
              />
            </div>
          </TabsContent>

          {/* ─── POLICIES TAB ─── */}
          <TabsContent value="policies" className="mt-0">
            <div className="max-w-xl">
              <PoliciesForm
                defaultValues={itinerary.policies}
                onSave={(data) => saveSection('policies', data)}
                loading={sectionSaving === 'policies'}
              />
            </div>
          </TabsContent>

          {/* ─── ACCOUNTS TAB ─── */}
          <TabsContent value="accounts" className="mt-0">
            <AccountsManager
              accounts={itinerary.accounts}
              onSave={(data) => saveSection('accounts', data)}
              loading={sectionSaving === 'accounts'}
            />
          </TabsContent>

          {/* ─── THANK YOU TAB ─── */}
          <TabsContent value="thankyou" className="mt-0">
            <div className="max-w-xl">
              <ThankYouEditor
                defaultValues={itinerary.thankYou}
                onSave={(data) => saveSection('thankYou', data)}
                loading={sectionSaving === 'thankYou'}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Day Form Dialog */}
      <DayFormDialog
        open={dayDialogOpen}
        onClose={() => { setDayDialogOpen(false); setEditingDay(null); }}
        onSave={handleUpsertDay}
        initialData={editingDay}
        nextDayNumber={(itinerary.days.at(-1)?.dayNumber ?? 0) + 1}
        loading={dayLoading}
      />

      {/* Delete day confirm */}
      <AlertDialog open={!!deleteDayId} onOpenChange={() => setDeleteDayId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this day?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the day and all its images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDay} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Dialog */}
      <GeneratePdfDialog
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        itineraryId={itinerary.id}
        itineraryTitle={itinerary.title}
      />
    </div>
  );
}