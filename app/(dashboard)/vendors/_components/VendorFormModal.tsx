'use client';

// app/(dashboard)/vendors/_components/VendorFormModal.tsx

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

import { vendorsService } from '@/services';
import { Vendor, CreateVendorPayload, VendorServiceType } from '@/types/vendors';
import { VENDOR_TYPE_OPTIONS, VENDOR_TYPE_COLORS } from './vendor.constants';

// ── Section header inside form ────────────────────────────────────────────────
function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
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
      <Label className="text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface VendorFormModalProps {
  open: boolean;
  onClose: () => void;
  editItem?: Vendor | null;
}

export function VendorFormModal({ open, onClose, editItem }: VendorFormModalProps) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateVendorPayload>({
    defaultValues: { types: ['OTHER'], status: 'ACTIVE', isPreferred: false },
  });

  const selectedTypes = watch('types') ?? [];

  // ── Populate on edit ────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      if (editItem) {
        reset({
          name:                editItem.name,
          types:               editItem.types?.length ? editItem.types : [editItem.serviceType],
          contactPerson:       editItem.contactPerson ?? '',
          email:               editItem.email ?? '',
          phone:               editItem.phone ?? '',
          address:             editItem.address ?? '',
          city:                editItem.city ?? '',
          country:             editItem.country ?? '',
          gstin:               editItem.gstin ?? '',
          pan:                 editItem.pan ?? '',
          bankName:            editItem.bankName ?? '',
          accountName:         editItem.accountName ?? '',
          accountNumber:       editItem.accountNumber ?? '',
          ifscCode:            editItem.ifscCode ?? '',
          upiId:               editItem.upiId ?? '',
          commissionPercentage: editItem.commissionPercentage ?? editItem.commissionRate,
          negotiatedRates:     editItem.negotiatedRates ?? '',
          availabilityNotes:   editItem.availabilityNotes ?? '',
          notes:               editItem.notes ?? '',
          status:              editItem.status,
          isPreferred:         editItem.isPreferred,
        });
      } else {
        reset({ types: ['OTHER'], status: 'ACTIVE', isPreferred: false });
      }
    }
  }, [open, editItem, reset]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: vendorsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor created successfully!');
      onClose();
    },
    onError: () => toast.error('Failed to create vendor'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVendorPayload> }) =>
      vendorsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
      if (editItem) qc.invalidateQueries({ queryKey: ['vendors', editItem.id] });
      toast.success('Vendor updated!');
      onClose();
    },
    onError: () => toast.error('Failed to update vendor'),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: CreateVendorPayload) => {
    if (editItem) updateMutation.mutate({ id: editItem.id, data });
    else createMutation.mutate(data);
  };

  // ── Type toggle ─────────────────────────────────────────────────────────────
  const toggleType = (type: VendorServiceType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length === 1) return;
      setValue('types', selectedTypes.filter((t) => t !== type), { shouldValidate: true });
    } else {
      setValue('types', [...selectedTypes, type], { shouldValidate: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
          <DialogTitle className="text-base font-semibold text-slate-900">
            {editItem ? 'Edit Vendor' : 'Add New Vendor'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {editItem
              ? 'Update vendor details, bank info, and settings.'
              : 'Add a new vendor to your supplier network.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[76vh]">
          <form id="vendor-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-6">

              {/* ── Basic Info ──────────────────────────────────── */}
              <FormSection title="Basic Information">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Field label="Vendor Name" required error={errors.name?.message}>
                      <Input
                        {...register('name', { required: 'Name is required' })}
                        placeholder="Grand Palace Hotel"
                        className={errors.name ? 'border-red-300 focus-visible:ring-red-300' : ''}
                      />
                    </Field>
                  </div>
                  <Field label="Contact Person">
                    <Input {...register('contactPerson')} placeholder="Rajesh Patel" />
                  </Field>
                  <Field label="Phone">
                    <Input {...register('phone')} placeholder="+91 98000 00000" />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Email" error={errors.email?.message}>
                      <Input
                        {...register('email', {
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                        })}
                        type="email"
                        placeholder="vendor@example.com"
                      />
                    </Field>
                  </div>
                </div>

                {/* Service Types multi-select */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">
                    Service Types <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {VENDOR_TYPE_OPTIONS.map((opt) => {
                      const active = selectedTypes.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleType(opt.value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                            ${active
                              ? `${VENDOR_TYPE_COLORS[opt.value]} ring-1 ring-current ring-offset-0`
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          {opt.emoji} {opt.label}
                          {active && <span className="text-[10px] opacity-60">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </FormSection>

              <Separator />

              {/* ── Location ────────────────────────────────────── */}
              <FormSection title="Location">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3">
                    <Field label="Address">
                      <Input {...register('address')} placeholder="Shop 12, MG Road, Connaught Place" />
                    </Field>
                  </div>
                  <Field label="City">
                    <Input {...register('city')} placeholder="Jaipur" />
                  </Field>
                  <Field label="Country">
                    <Input {...register('country')} placeholder="India" />
                  </Field>
                  <Field label="Commission %">
                    <Input
                      {...register('commissionPercentage', { valueAsNumber: true })}
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      placeholder="10"
                    />
                  </Field>
                </div>
              </FormSection>

              <Separator />

              {/* ── GST & Legal ─────────────────────────────────── */}
              <FormSection title="GST & Legal" subtitle="Optional — for invoice generation">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="GSTIN" error={errors.gstin?.message}>
                    <Input
                      {...register('gstin', {
                        pattern: {
                          value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                          message: 'Invalid GSTIN format',
                        },
                      })}
                      placeholder="27AAPFU0939F1ZV"
                      className="font-mono text-sm"
                    />
                  </Field>
                  <Field label="PAN" error={errors.pan?.message}>
                    <Input
                      {...register('pan', {
                        pattern: {
                          value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                          message: 'Invalid PAN format',
                        },
                      })}
                      placeholder="AAPFU0939F"
                      className="font-mono text-sm"
                    />
                  </Field>
                </div>
              </FormSection>

              <Separator />

              {/* ── Bank Details ─────────────────────────────────── */}
              <FormSection title="Bank Details" subtitle="For payment tracking and settlements">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Bank Name">
                    <Input {...register('bankName')} placeholder="HDFC Bank" />
                  </Field>
                  <Field label="Account Holder Name">
                    <Input {...register('accountName')} placeholder="Grand Palace Hotel Pvt. Ltd." />
                  </Field>
                  <Field label="Account Number">
                    <Input {...register('accountNumber')} placeholder="1234567890" className="font-mono" />
                  </Field>
                  <Field label="IFSC Code">
                    <Input {...register('ifscCode')} placeholder="HDFC0001234" className="font-mono" />
                  </Field>
                  <div className="col-span-2">
                    <Field label="UPI ID">
                      <Input {...register('upiId')} placeholder="vendor@hdfc" />
                    </Field>
                  </div>
                </div>
              </FormSection>

              <Separator />

              {/* ── Additional Notes ─────────────────────────────── */}
              <FormSection title="Additional Details">
                <div className="space-y-3">
                  <Field label="Negotiated Rates">
                    <Textarea
                      {...register('negotiatedRates')}
                      rows={2}
                      placeholder="Standard: ₹4,500/night · Deluxe: ₹7,500/night · Peak season: +20%"
                      className="resize-none text-sm"
                    />
                  </Field>
                  <Field label="Availability Notes">
                    <Textarea
                      {...register('availabilityNotes')}
                      rows={2}
                      placeholder="Not available Nov–Jan (peak season). Advance booking required..."
                      className="resize-none text-sm"
                    />
                  </Field>
                  <Field label="Internal Notes">
                    <Textarea
                      {...register('notes')}
                      rows={2}
                      placeholder="Good for budget groups. Always negotiate extra 5%..."
                      className="resize-none text-sm"
                    />
                  </Field>
                </div>

                {/* Status + Preferred */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Field label="Status">
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">✅ Active</SelectItem>
                            <SelectItem value="INACTIVE">⏸ Inactive</SelectItem>
                            <SelectItem value="BLACKLISTED">🚫 Blacklisted</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>

                  <div className="flex items-end pb-1">
                    <Controller
                      name="isPreferred"
                      control={control}
                      render={({ field }) => (
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                          />
                          <span className="text-sm text-slate-600">
                            ⭐ Mark as Preferred Vendor
                          </span>
                        </label>
                      )}
                    />
                  </div>
                </div>
              </FormSection>
            </div>
          </form>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="vendor-form" disabled={isPending}>
            {isPending
              ? editItem ? 'Updating...' : 'Creating...'
              : editItem ? 'Update Vendor' : 'Add Vendor'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}