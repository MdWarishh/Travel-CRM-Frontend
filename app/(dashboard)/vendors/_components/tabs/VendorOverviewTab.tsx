'use client';

// app/(dashboard)/vendors/_components/tabs/VendorOverviewTab.tsx

import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { VendorDetail } from '@/types/vendors';
import { formatDate, getTypeEmoji, VENDOR_TYPE_COLORS } from '../vendor.constants';

// ── Reusable sub-components ───────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 space-y-0.5">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
        {title}
      </p>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  copyable,
}: {
  label: string;
  value?: string | number | null;
  mono?: boolean;
  copyable?: boolean;
}) {
  if (!value && value !== 0) return null;
  const strVal = String(value);

  const copy = () => {
    navigator.clipboard.writeText(strVal);
    toast.success('Copied!');
  };

  return (
    <div className="flex items-start py-2 border-b border-slate-100 last:border-0 gap-3">
      <span className="text-[11px] text-slate-400 w-36 shrink-0 pt-0.5 font-medium">{label}</span>
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span
          className={`text-sm text-slate-700 font-medium break-all ${mono ? 'font-mono text-xs' : ''}`}
        >
          {strVal}
        </span>
        {copyable && (
          <button
            onClick={copy}
            className="shrink-0 p-0.5 text-slate-300 hover:text-blue-500 transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function VendorOverviewTab({ vendor }: { vendor: VendorDetail }) {
  const types = vendor.types?.length ? vendor.types : [vendor.serviceType];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Basic Details */}
      <SectionCard title="Basic Details">
        <InfoRow label="Vendor Name" value={vendor.name} />
        <div className="flex items-start py-2 border-b border-slate-100 gap-3">
          <span className="text-[11px] text-slate-400 w-36 shrink-0 pt-0.5 font-medium">Service Types</span>
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <span
                key={t}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium border
                  ${VENDOR_TYPE_COLORS[t as keyof typeof VENDOR_TYPE_COLORS] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
              >
                {getTypeEmoji(t as any)} {t.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
        <InfoRow label="City"       value={vendor.city} />
        <InfoRow label="Country"    value={vendor.country} />
        <InfoRow label="Address"    value={vendor.address} />
        <InfoRow label="Member Since" value={formatDate(vendor.createdAt)} />
      </SectionCard>

      {/* Contact */}
      <SectionCard title="Contact Information">
        <InfoRow label="Contact Person" value={vendor.contactPerson} />
        <InfoRow label="Phone"          value={vendor.phone}  copyable />
        <InfoRow label="Email"          value={vendor.email}  copyable />
      </SectionCard>

      {/* GST & Legal */}
      <SectionCard title="GST & Legal">
        {!vendor.gstin && !vendor.pan ? (
          <p className="text-xs text-slate-400 py-2">No GST/PAN details added.</p>
        ) : (
          <>
            <InfoRow label="GSTIN" value={vendor.gstin} mono copyable />
            <InfoRow label="PAN"   value={vendor.pan}   mono copyable />
          </>
        )}
      </SectionCard>

      {/* Financial */}
      <SectionCard title="Financial Details">
        <InfoRow
          label="Commission"
          value={
            vendor.commissionPercentage
              ? `${vendor.commissionPercentage}%`
              : vendor.commissionRate
              ? `${vendor.commissionRate}%`
              : null
          }
        />
        <InfoRow label="Negotiated Rates"   value={vendor.negotiatedRates} />
        <InfoRow label="Availability Notes" value={vendor.availabilityNotes} />
      </SectionCard>

      {/* Bank Details */}
      <SectionCard title="Bank Details">
        {!vendor.bankName && !vendor.accountNumber && !vendor.upiId ? (
          <p className="text-xs text-slate-400 py-2">No bank details added.</p>
        ) : (
          <>
            <InfoRow label="Bank Name"     value={vendor.bankName} />
            <InfoRow label="Account Name"  value={vendor.accountName} />
            <InfoRow label="Account No."   value={vendor.accountNumber} mono copyable />
            <InfoRow label="IFSC"          value={vendor.ifscCode}      mono copyable />
            <InfoRow label="UPI ID"        value={vendor.upiId}         copyable />
          </>
        )}
      </SectionCard>

      {/* Internal Notes */}
      {vendor.notes && (
        <SectionCard title="Internal Notes">
          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed pt-1">
            {vendor.notes}
          </p>
        </SectionCard>
      )}
    </div>
  );
}