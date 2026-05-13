// app/invoice/settings/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CompanySettings, InvoiceNumberFormat, GstType } from '@/types/invoice';
import { invoiceService } from '@/services/invoice.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  ArrowLeft, Save, Loader2, Building2, BadgeIndianRupee,
  FileDigit, CreditCard, FileText, AlertTriangle, RefreshCw,
  Upload, X, PenLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function SectionCard({
  icon: Icon, title, subtitle, children,
}: {
  icon: any; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-sm">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// Reusable image upload box
function ImageUploadBox({
  label, hint, preview, onFile, onClear, accept = 'image/*',
}: {
  label: string;
  hint: string;
  preview: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
  accept?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          'relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-colors',
          preview ? 'border-violet-300 bg-violet-50' : 'border-muted-foreground/30 hover:border-violet-400 bg-muted/30'
        )}
        onClick={() => ref.current?.click()}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="h-full w-full object-contain p-1" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="absolute top-0.5 right-0.5 rounded-full bg-black/40 p-0.5 text-white hover:bg-black/60"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </>
        ) : (
          <Upload className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 2 * 1024 * 1024) { toast.error(`${label} must be under 2MB`); return; }
          onFile(file);
          e.target.value = '';
        }}
      />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
        <Button
          type="button" variant="outline" size="sm"
          className="mt-2 h-7 gap-1.5 text-xs"
          onClick={() => ref.current?.click()}
        >
          <Upload className="h-3 w-3" />
          {preview ? `Change ${label}` : `Upload ${label}`}
        </Button>
      </div>
    </div>
  );
}

const GST_RATES = [0, 5, 12, 18, 28];

export default function InvoiceSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [form, setForm] = useState<Partial<CompanySettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetNumber, setResetNumber] = useState('0');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  useEffect(() => {
    invoiceService.getCompanySettings()
      .then((data) => {
        setSettings(data);
        setForm(data);
        if (data.logoUrl) setLogoPreview(data.logoUrl);
        if (data.signatureUrl) setSignaturePreview(data.signatureUrl);
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof CompanySettings, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Generic image handler — converts to base64 for preview + stores as URL
  const handleImageFile = (
    file: File,
    setPreview: (v: string | null) => void,
    formKey: keyof CompanySettings
  ) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      set(formKey, dataUrl);
      toast.info('Image selected — save settings to persist');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, createdAt, updatedAt, lastInvoiceNumber, ...payload } = form as any;
      const updated = await invoiceService.updateCompanySettings(payload);
      setSettings(updated);
      setForm(updated);
      toast.success('Settings saved successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetNumbering = async () => {
    const num = parseInt(resetNumber, 10);
    if (isNaN(num) || num < 0) { toast.error('Enter a valid number (0 or above)'); return; }
    try {
      await invoiceService.resetInvoiceNumbering(num);
      toast.success(`Invoice numbering reset. Next invoice will be #${num + 1}`);
      const updated = await invoiceService.getCompanySettings();
      setSettings(updated);
      setForm(updated);
    } catch {
      toast.error('Failed to reset numbering');
    }
  };

  const previewInvoiceNumber = () => {
    const prefix = form.invoicePrefix ?? 'INV';
    const format = form.invoiceNumberFormat ?? 'SIMPLE';
    const next = (settings?.lastInvoiceNumber ?? 0) + 1;
    const padded = String(next).padStart(3, '0');
    if (format === 'YEARLY') return `${prefix}-${new Date().getFullYear()}-${padded}`;
    return `${prefix}-${padded}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-14 w-full" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 min-h-screen bg-muted/30">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 backdrop-blur px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push('/invoice')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-base">Invoice Settings</h1>
            <p className="text-xs text-muted-foreground">Company profile, GST, numbering & defaults</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5 bg-violet-600 hover:bg-violet-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Settings
        </Button>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto w-full max-w-3xl flex flex-col gap-5 px-6 py-6">

        {/* ─── 1. Company Profile ─── */}
        <SectionCard icon={Building2} title="Company Profile" subtitle="Shown on every invoice">
          <div className="space-y-5">

            {/* Logo Upload */}
            <ImageUploadBox
              label="Company Logo"
              hint="PNG or JPG, max 2MB. Shown top-left on invoice."
              preview={logoPreview}
              onFile={(f) => handleImageFile(f, setLogoPreview, 'logoUrl')}
              onClear={() => { setLogoPreview(null); set('logoUrl', null); }}
            />

            <Separator />

            {/* Signature Upload */}
            <ImageUploadBox
              label="Authorised Signature"
              hint="PNG with transparent background recommended. Shown on invoice footer."
              preview={signaturePreview}
              onFile={(f) => handleImageFile(f, setSignaturePreview, 'signatureUrl')}
              onClear={() => { setSignaturePreview(null); set('signatureUrl', null); }}
            />

            <Separator />

            {/* Company Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Company Name *</Label>
                <Input
                  value={form.companyName ?? ''}
                  onChange={(e) => set('companyName', e.target.value)}
                  placeholder="Rauf Travels Pvt. Ltd."
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Tagline</Label>
                <Input
                  value={form.tagline ?? ''}
                  onChange={(e) => set('tagline', e.target.value)}
                  placeholder="Your trusted travel partner"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Address</Label>
                <Input
                  value={form.address ?? ''}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} placeholder="Mumbai" />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input value={form.state ?? ''} onChange={(e) => set('state', e.target.value)} placeholder="Maharashtra" />
              </div>
              <div className="space-y-1.5">
                <Label>Pincode</Label>
                <Input value={form.pincode ?? ''} onChange={(e) => set('pincode', e.target.value)} placeholder="400001" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="hello@company.com" type="email" />
              </div>
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input value={form.website ?? ''} onChange={(e) => set('website', e.target.value)} placeholder="https://company.com" />
              </div>
            </div>

            <Separator />

            {/* GST / PAN */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>GSTIN</Label>
                <Input
                  value={form.gstin ?? ''} onChange={(e) => set('gstin', e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5" className="font-mono uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <Label>PAN</Label>
                <Input
                  value={form.pan ?? ''} onChange={(e) => set('pan', e.target.value.toUpperCase())}
                  placeholder="AAAAA0000A" className="font-mono uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <Label>State Code</Label>
                <Input
                  value={form.stateCode ?? ''} onChange={(e) => set('stateCode', e.target.value)}
                  placeholder="27" className="font-mono"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ─── 2. GST Defaults ─── */}
        <SectionCard icon={BadgeIndianRupee} title="GST Defaults" subtitle="Pre-filled on every new invoice">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Default GST Rate</Label>
              <Select
                value={String(form.defaultGstRate ?? 18)}
                onValueChange={(v) => set('defaultGstRate', Number(v))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GST_RATES.map((r) => (
                    <SelectItem key={r} value={String(r)}>{r}%</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Default GST Type</Label>
              <Select
                value={form.defaultGstType ?? 'CGST_SGST'}
                onValueChange={(v) => set('defaultGstType', v as GstType)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CGST_SGST">CGST + SGST (Same State)</SelectItem>
                  <SelectItem value="IGST">IGST (Inter-State)</SelectItem>
                  <SelectItem value="NONE">No GST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>

        {/* ─── 3. Invoice Numbering ─── */}
        <SectionCard icon={FileDigit} title="Invoice Numbering" subtitle="Format for auto-generated invoice numbers">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Prefix</Label>
                <Input
                  value={form.invoicePrefix ?? 'INV'}
                  onChange={(e) => set('invoicePrefix', e.target.value.toUpperCase())}
                  placeholder="INV" maxLength={10} className="font-mono uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Format</Label>
                <Select
                  value={form.invoiceNumberFormat ?? 'SIMPLE'}
                  onValueChange={(v) => set('invoiceNumberFormat', v as InvoiceNumberFormat)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIMPLE">Simple — INV-001</SelectItem>
                    <SelectItem value="YEARLY">Yearly — INV-2026-001</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg bg-violet-50 border border-violet-100 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Next invoice will be:</span>
              <span className="font-mono font-bold text-violet-700 text-base">{previewInvoiceNumber()}</span>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-destructive flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Reset Invoice Numbering
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Reset the counter. Next invoice will start from the number you set + 1.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number" value={resetNumber}
                  onChange={(e) => setResetNumber(e.target.value)}
                  min={0} className="w-32 font-mono" placeholder="0"
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-1.5">
                      <RefreshCw className="h-4 w-4" /> Reset to #{Number(resetNumber) + 1}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Invoice Numbering?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reset the counter to {resetNumber}. Next invoice will be{' '}
                        <strong>{previewInvoiceNumber()}</strong>. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetNumbering} className="bg-destructive hover:bg-destructive/90">
                        Yes, Reset
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ─── 4. Bank Details ─── */}
        <SectionCard icon={CreditCard} title="Bank Details" subtitle="Shown on invoice for payment">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Bank Name</Label>
              <Input value={form.bankName ?? ''} onChange={(e) => set('bankName', e.target.value)} placeholder="HDFC Bank" />
            </div>
            <div className="space-y-1.5">
              <Label>Account Name</Label>
              <Input value={form.accountName ?? ''} onChange={(e) => set('accountName', e.target.value)} placeholder="My Agency Pvt. Ltd." />
            </div>
            <div className="space-y-1.5">
              <Label>Account Number</Label>
              <Input value={form.accountNumber ?? ''} onChange={(e) => set('accountNumber', e.target.value)} placeholder="1234567890" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label>IFSC Code</Label>
              <Input value={form.ifscCode ?? ''} onChange={(e) => set('ifscCode', e.target.value.toUpperCase())} placeholder="HDFC0001234" className="font-mono uppercase" />
            </div>
            <div className="space-y-1.5">
              <Label>UPI ID</Label>
              <Input value={form.upiId ?? ''} onChange={(e) => set('upiId', e.target.value)} placeholder="agency@upi" />
            </div>
          </div>
        </SectionCard>

        {/* ─── 5. Default Notes & Terms ─── */}
        <SectionCard icon={FileText} title="Default Notes & Terms" subtitle="Pre-filled on every new invoice">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Default Notes</Label>
              <Textarea
                value={form.defaultNotes ?? ''} onChange={(e) => set('defaultNotes', e.target.value)}
                placeholder="Thank you for your business!" rows={4} className="resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Default Terms & Conditions</Label>
              <Textarea
                value={form.defaultTerms ?? ''} onChange={(e) => set('defaultTerms', e.target.value)}
                placeholder="Payment due within 30 days." rows={4} className="resize-none"
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Save bottom ── */}
        <div className="flex justify-end pb-6">
          <Button onClick={handleSave} disabled={saving} className="gap-1.5 bg-violet-600 hover:bg-violet-700 min-w-36">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}