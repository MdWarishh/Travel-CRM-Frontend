// app/invoice/_components/InvoicePdfTemplate.tsx
// A4 single-page premium travel CRM invoice

import { GstInvoice, CompanySettings } from '@/types/invoice';
import { formatCurrency, formatDate, numberToWords } from '@/lib/invoiceUtils';

interface Props {
  invoice: GstInvoice;
  company: CompanySettings;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PAID:      { bg: '#dcfce7', color: '#15803d', label: 'PAID' },
  PARTIAL:   { bg: '#fef9c3', color: '#a16207', label: 'PARTIAL' },
  UNPAID:    { bg: '#fee2e2', color: '#b91c1c', label: 'UNPAID' },
  SENT:      { bg: '#dbeafe', color: '#1d4ed8', label: 'SENT' },
  DRAFT:     { bg: '#f1f5f9', color: '#475569', label: 'DRAFT' },
  CANCELLED: { bg: '#fee2e2', color: '#991b1b', label: 'CANCELLED' },
};

export function InvoicePdfTemplate({ invoice, company }: Props) {
  const comp = (invoice.companySnapshot as CompanySettings) ?? company;
  const statusStyle = STATUS_STYLES[invoice.status] ?? STATUS_STYLES.DRAFT;

  // Compact font sizes to fit single A4 page
  const fs = {
    xs:  '7pt',
    sm:  '7.5pt',
    base:'8.5pt',
    md:  '9.5pt',
    lg:  '11pt',
    xl:  '18pt',
  };

  return (
    <div
      id="invoice-pdf-root"
      style={{
        width: '210mm',
        height: '297mm',
        padding: '10mm 12mm 8mm',
        fontFamily: "'Noto Sans', 'Segoe UI', sans-serif",
        fontSize: fs.base,
        lineHeight: 1.45,
        boxSizing: 'border-box',
        background: '#ffffff',
        color: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ══ TOP ACCENT BAR ══════════════════════════════════════ */}
      <div style={{
        height: '4px',
        background: 'linear-gradient(90deg, #6d28d9, #8b5cf6, #c4b5fd)',
        borderRadius: '2px',
        marginBottom: '6mm',
        flexShrink: 0,
      }} />

      {/* ══ HEADER: Logo+Company | Invoice Meta ════════════════ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5mm', flexShrink: 0 }}>

        {/* Left — Logo + Company Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            {comp.logoUrl ? (
              <img src={comp.logoUrl} alt="logo" style={{ height: '40px', maxWidth: '80px', objectFit: 'contain' }} />
            ) : (
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: fs.lg,
              }}>
                {comp.companyName?.charAt(0) ?? 'C'}
              </div>
            )}
            <div>
              <p style={{ fontWeight: 800, fontSize: fs.lg, margin: 0, color: '#1e293b', letterSpacing: '-0.3px' }}>
                {comp.companyName}
              </p>
              {comp.tagline && (
                <p style={{ fontSize: fs.xs, color: '#64748b', margin: '1px 0 0', fontStyle: 'italic' }}>
                  {comp.tagline}
                </p>
              )}
            </div>
          </div>

          <div style={{ fontSize: fs.sm, color: '#475569', lineHeight: 1.6 }}>
            {[comp.address, comp.city, comp.state, comp.pincode].filter(Boolean).join(', ') && (
              <p style={{ margin: 0 }}>📍 {[comp.address, comp.city, comp.state, comp.pincode].filter(Boolean).join(', ')}</p>
            )}
            {comp.phone && <p style={{ margin: 0 }}>📞 {comp.phone}</p>}
            {comp.email && <p style={{ margin: 0 }}>✉ {comp.email}</p>}
            <div style={{ display: 'flex', gap: '16px', marginTop: '1px' }}>
              {comp.gstin && <span><strong style={{ color: '#374151' }}>GSTIN:</strong> {comp.gstin}</span>}
              {comp.pan   && <span><strong style={{ color: '#374151' }}>PAN:</strong> {comp.pan}</span>}
            </div>
          </div>
        </div>

        {/* Right — Invoice Title + Meta */}
        <div style={{ textAlign: 'right', minWidth: '140px' }}>
          <p style={{
            fontSize: fs.xl, fontWeight: 900, color: '#6d28d9',
            letterSpacing: '-1px', margin: '0 0 4px', lineHeight: 1,
          }}>
            INVOICE
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: fs.md, fontWeight: 700, margin: '0 0 4px', color: '#1e293b' }}>
            #{invoice.invoiceNumber}
          </p>

          <div style={{ fontSize: fs.sm, color: '#64748b', lineHeight: 1.8 }}>
            <p style={{ margin: 0 }}>
              <strong style={{ color: '#374151' }}>Issue:</strong> {formatDate(invoice.issueDate)}
            </p>
            {invoice.dueDate && (
              <p style={{ margin: 0, color: invoice.dueAmount > 0 ? '#dc2626' : '#64748b' }}>
                <strong>Due:</strong> {formatDate(invoice.dueDate)}
              </p>
            )}
          </div>

          {/* Status pill */}
          <div style={{
            display: 'inline-block', marginTop: '5px',
            padding: '2px 10px', borderRadius: '99px',
            fontSize: fs.xs, fontWeight: 700, letterSpacing: '0.8px',
            background: statusStyle.bg, color: statusStyle.color,
            border: `1px solid ${statusStyle.color}30`,
          }}>
            {statusStyle.label}
          </div>
        </div>
      </div>

      {/* ══ DIVIDER ═════════════════════════════════════════════ */}
      <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '4mm', flexShrink: 0 }} />

      {/* ══ BILL TO ═════════════════════════════════════════════ */}
      <div style={{
        background: '#f8fafc', borderRadius: '6px', padding: '6px 10px',
        marginBottom: '4mm', flexShrink: 0,
        borderLeft: '3px solid #6d28d9',
      }}>
        <p style={{ fontSize: fs.xs, fontWeight: 700, color: '#6d28d9', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 2px' }}>
          Bill To
        </p>
        <p style={{ fontWeight: 700, fontSize: fs.md, margin: '0 0 1px', color: '#1e293b' }}>{invoice.billingName}</p>
        <div style={{ fontSize: fs.sm, color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '0 16px' }}>
          {invoice.billingPhone   && <span>📞 {invoice.billingPhone}</span>}
          {invoice.billingEmail   && <span>✉ {invoice.billingEmail}</span>}
          {invoice.billingAddress && <span>📍 {invoice.billingAddress}{invoice.billingState ? `, ${invoice.billingState}` : ''}</span>}
          {invoice.customerGstin  && <span><strong>GSTIN:</strong> {invoice.customerGstin}</span>}
        </div>
      </div>

      {/* ══ ITEMS TABLE ═════════════════════════════════════════ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4mm', flexShrink: 0 }}>
        <thead>
          <tr style={{ background: 'linear-gradient(90deg, #5b21b6, #7c3aed)', color: '#fff' }}>
            {['#', 'Description', 'HSN/SAC', 'Qty', 'Unit', 'Rate (₹)', 'Amount (₹)'].map((h, i) => (
              <th key={h} style={{
                padding: '5px 7px',
                fontSize: fs.xs, fontWeight: 700, letterSpacing: '0.3px',
                textAlign: i === 0 ? 'center' : i <= 1 ? 'left' : i >= 5 ? 'right' : 'center',
                borderRadius: i === 0 ? '4px 0 0 4px' : i === 6 ? '0 4px 4px 0' : undefined,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={item.id ?? i} style={{
              background: i % 2 === 0 ? '#f8fafc' : '#ffffff',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <td style={{ padding: '4px 7px', fontSize: fs.sm, color: '#94a3b8', textAlign: 'center' }}>{i + 1}</td>
              <td style={{ padding: '4px 7px', fontSize: fs.sm, fontWeight: 500, color: '#1e293b' }}>{item.description}</td>
              <td style={{ padding: '4px 7px', fontSize: fs.sm, color: '#64748b', textAlign: 'center' }}>{item.hsn ?? '—'}</td>
              <td style={{ padding: '4px 7px', fontSize: fs.sm, textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '4px 7px', fontSize: fs.sm, color: '#64748b', textAlign: 'center' }}>{item.unit ?? '—'}</td>
              <td style={{ padding: '4px 7px', fontSize: fs.sm, textAlign: 'right', fontFamily: 'monospace' }}>
                {item.price < 0
                  ? `−${Math.abs(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  : item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td style={{ padding: '4px 7px', fontSize: fs.sm, textAlign: 'right', fontFamily: 'monospace', fontWeight: 600,
                color: item.total < 0 ? '#dc2626' : '#1e293b' }}>
                {item.total < 0
                  ? `−${Math.abs(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  : item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ══ TOTALS + AMOUNT IN WORDS (side by side) ════════════ */}
      <div style={{ display: 'flex', gap: '8mm', marginBottom: '4mm', flexShrink: 0 }}>

        {/* Left — Amount in words + Bank */}
        <div style={{ flex: 1 }}>
          {/* Amount in words */}
          <div style={{
            background: '#f5f3ff', border: '1px solid #ddd6fe',
            borderRadius: '6px', padding: '5px 8px', marginBottom: '3mm', fontSize: fs.sm,
          }}>
            <strong style={{ color: '#5b21b6' }}>Amount in Words: </strong>
            <span style={{ color: '#4c1d95' }}>{numberToWords(invoice.totalAmount)}</span>
          </div>

          {/* Bank Details */}
          {(comp.bankName || comp.upiId) && (
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: '6px', padding: '5px 8px', fontSize: fs.sm,
            }}>
              <p style={{ fontWeight: 700, margin: '0 0 3px', color: '#374151', fontSize: fs.xs, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Bank Details
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 12px', color: '#475569' }}>
                {comp.bankName      && <span><strong>Bank:</strong> {comp.bankName}</span>}
                {comp.accountName   && <span><strong>A/C Name:</strong> {comp.accountName}</span>}
                {comp.accountNumber && <span><strong>A/C No:</strong> {comp.accountNumber}</span>}
                {comp.ifscCode      && <span><strong>IFSC:</strong> {comp.ifscCode}</span>}
                {comp.upiId         && <span><strong>UPI:</strong> {comp.upiId}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Right — Totals box */}
        <div style={{ width: '200px', flexShrink: 0 }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Rows */}
            {[
              { label: 'Subtotal', value: formatCurrency(invoice.subtotal), color: '#475569' },
              ...(invoice.discountAmount && invoice.discountAmount > 0
                ? [{ label: 'Discount', value: `− ${formatCurrency(invoice.discountAmount)}`, color: '#dc2626' }]
                : []),
              ...(invoice.gstType === 'CGST_SGST' ? [
                { label: `CGST (${invoice.cgstRate}%)`, value: formatCurrency(invoice.cgstAmount), color: '#475569' },
                { label: `SGST (${invoice.sgstRate}%)`, value: formatCurrency(invoice.sgstAmount), color: '#475569' },
              ] : []),
              ...(invoice.gstType === 'IGST'
                ? [{ label: `IGST (${invoice.igstRate}%)`, value: formatCurrency(invoice.igstAmount), color: '#475569' }]
                : []),
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '3px 8px', fontSize: fs.sm, color, borderBottom: '1px solid #f1f5f9',
              }}>
                <span>{label}</span>
                <span style={{ fontFamily: 'monospace' }}>{value}</span>
              </div>
            ))}

            {/* Total row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '5px 8px', fontSize: fs.md, fontWeight: 800,
              background: 'linear-gradient(90deg, #5b21b6, #7c3aed)', color: '#fff',
            }}>
              <span>Total</span>
              <span style={{ fontFamily: 'monospace' }}>{formatCurrency(invoice.totalAmount)}</span>
            </div>

            {/* Paid */}
            {invoice.paidAmount > 0 && (
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '3px 8px', fontSize: fs.sm, color: '#059669', borderBottom: '1px solid #f1f5f9',
              }}>
                <span>✓ Paid</span>
                <span style={{ fontFamily: 'monospace' }}>{formatCurrency(invoice.paidAmount)}</span>
              </div>
            )}

            {/* Balance due */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '4px 8px', fontSize: fs.sm, fontWeight: 700,
              background: invoice.dueAmount <= 0 ? '#dcfce7' : '#fef2f2',
              color: invoice.dueAmount <= 0 ? '#15803d' : '#dc2626',
            }}>
              <span>Balance Due</span>
              <span style={{ fontFamily: 'monospace' }}>{formatCurrency(Math.max(0, invoice.dueAmount))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ NOTES & TERMS ═══════════════════════════════════════ */}
      {(invoice.notes || invoice.terms) && (
        <div style={{ display: 'flex', gap: '8mm', marginBottom: '3mm', fontSize: fs.sm, color: '#475569', flexShrink: 0 }}>
          {invoice.notes && (
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#374151' }}>Notes: </strong>{invoice.notes}
            </div>
          )}
          {invoice.terms && (
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#374151' }}>Terms & Conditions: </strong>{invoice.terms}
            </div>
          )}
        </div>
      )}

      {/* ══ SPACER (pushes footer to bottom) ════════════════════ */}
      <div style={{ flex: 1 }} />

      {/* ══ FOOTER ══════════════════════════════════════════════ */}
      <div style={{
        borderTop: '1px solid #e2e8f0', paddingTop: '4mm', flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        {/* Left — computer generated note */}
        <div style={{ fontSize: fs.xs, color: '#94a3b8' }}>
          <p style={{ margin: 0 }}>This is a computer-generated invoice.</p>
          {comp.website && <p style={{ margin: '1px 0 0' }}>{comp.website}</p>}
        </div>

        {/* Right — Signature */}
        <div style={{ textAlign: 'center', minWidth: '130px' }}>
          {comp.signatureUrl ? (
            <img
              src={comp.signatureUrl}
              alt="Signature"
              style={{ height: '36px', maxWidth: '120px', objectFit: 'contain', marginBottom: '3px' }}
            />
          ) : (
            <div style={{ height: '36px' }} /> // empty space for handwritten sig
          )}
          <div style={{ borderTop: '1px solid #374151', paddingTop: '3px' }}>
            <p style={{ fontSize: fs.xs, fontWeight: 700, color: '#374151', margin: 0 }}>Authorised Signatory</p>
            <p style={{ fontSize: fs.xs, color: '#64748b', margin: '1px 0 0' }}>{comp.companyName}</p>
          </div>
        </div>
      </div>

      {/* ══ BOTTOM ACCENT BAR ═══════════════════════════════════ */}
      <div style={{
        height: '3px',
        background: 'linear-gradient(90deg, #6d28d9, #8b5cf6, #c4b5fd)',
        borderRadius: '2px',
        marginTop: '4mm',
        flexShrink: 0,
      }} />
    </div>
  );
}