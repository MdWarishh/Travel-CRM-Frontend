// app/invoice/_components/InvoicePdfTemplate.tsx

import { GstInvoice, CompanySettings } from '@/types/invoice';
import { formatCurrency, formatDate, numberToWords } from '@/lib/invoiceUtils';

interface Props {
  invoice: GstInvoice;
  company: CompanySettings;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  PAID:      { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  PARTIAL:   { bg: '#fef9c3', color: '#a16207', border: '#fde047' },
  UNPAID:    { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
  SENT:      { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
  DRAFT:     { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  CANCELLED: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
};

export function InvoicePdfTemplate({ invoice, company }: Props) {
  // ── CRITICAL FIX: always merge live company so signatureUrl is available ──
  // companySnapshot was saved at invoice-creation time and may not have signatureUrl
  const snap = invoice.companySnapshot as CompanySettings | null;
  const comp: CompanySettings = {
    ...company,
    ...(snap ?? {}),
    // Always take these from live company (may be newer than snapshot)
    signatureUrl: company.signatureUrl ?? snap?.signatureUrl ?? null,
    logoUrl:      snap?.logoUrl ?? company.logoUrl ?? null,
  };

  const st = STATUS_STYLES[invoice.status] ?? STATUS_STYLES.DRAFT;

  return (
    <div
      id="invoice-pdf-root"
      style={{
        width: '210mm',
        height: '297mm',
        maxHeight: '297mm',
        padding: '8mm 11mm 6mm',
        fontFamily: "'Noto Sans', 'Segoe UI', Arial, sans-serif",
        fontSize: '8pt',
        lineHeight: 1.4,
        boxSizing: 'border-box',
        background: '#ffffff',
        color: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ══ TOP ACCENT ══════════════════════════════════════════ */}
      <div style={{
        height: '3px', flexShrink: 0, marginBottom: '5mm',
        background: 'linear-gradient(90deg, #4c1d95, #7c3aed, #a78bfa)',
        borderRadius: '2px',
      }} />

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '4mm', flexShrink: 0,
      }}>
        {/* Company Info */}
        <div style={{ flex: 1, paddingRight: '8mm' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
            {comp.logoUrl ? (
              <img src={comp.logoUrl} alt="logo"
                style={{ height: '36px', maxWidth: '70px', objectFit: 'contain' }} />
            ) : (
              <div style={{
                width: '36px', height: '36px', borderRadius: '7px', flexShrink: 0,
                background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '14pt',
              }}>
                {comp.companyName?.charAt(0) ?? 'C'}
              </div>
            )}
            <div>
              <p style={{ fontWeight: 800, fontSize: '12pt', margin: 0, color: '#1e293b' }}>
                {comp.companyName}
              </p>
              {comp.tagline && (
                <p style={{ fontSize: '7pt', color: '#64748b', margin: '1px 0 0', fontStyle: 'italic' }}>
                  {comp.tagline}
                </p>
              )}
            </div>
          </div>
          <div style={{ fontSize: '7.5pt', color: '#475569', lineHeight: 1.65 }}>
            {[comp.address, comp.city, comp.state, comp.pincode].filter(Boolean).length > 0 && (
              <p style={{ margin: 0 }}>{[comp.address, comp.city, comp.state, comp.pincode].filter(Boolean).join(', ')}</p>
            )}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {comp.phone && <span>📞 {comp.phone}</span>}
              {comp.email && <span>✉ {comp.email}</span>}
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '1px' }}>
              {comp.gstin && <span><strong style={{ color: '#374151' }}>GSTIN:</strong> {comp.gstin}</span>}
              {comp.pan   && <span><strong style={{ color: '#374151' }}>PAN:</strong> {comp.pan}</span>}
            </div>
          </div>
        </div>

        {/* Invoice meta box */}
        <div style={{
          textAlign: 'right', minWidth: '130px',
          background: '#faf5ff', borderRadius: '8px',
          padding: '8px 10px', border: '1px solid #ede9fe',
        }}>
          <p style={{
            fontSize: '20pt', fontWeight: 900, color: '#6d28d9',
            letterSpacing: '-1.5px', margin: '0 0 2px', lineHeight: 1,
          }}>INVOICE</p>
          <p style={{
            fontFamily: 'monospace', fontSize: '9pt', fontWeight: 700,
            margin: '0 0 4px', color: '#1e293b',
          }}>#{invoice.invoiceNumber}</p>
          <div style={{ fontSize: '7.5pt', color: '#64748b', lineHeight: 1.7 }}>
            <p style={{ margin: 0 }}>
              <strong style={{ color: '#374151' }}>Issue:</strong> {formatDate(invoice.issueDate)}
            </p>
            {invoice.dueDate && (
              <p style={{ margin: 0, color: invoice.dueAmount > 0 ? '#dc2626' : '#64748b' }}>
                <strong>Due:</strong> {formatDate(invoice.dueDate)}
              </p>
            )}
          </div>
          <div style={{
            display: 'inline-block', marginTop: '5px',
            padding: '2px 8px', borderRadius: '99px',
            fontSize: '7pt', fontWeight: 700, letterSpacing: '0.8px',
            background: st.bg, color: st.color, border: `1px solid ${st.border}`,
          }}>
            {invoice.status}
          </div>
        </div>
      </div>

      {/* ══ DIVIDER ═════════════════════════════════════════════ */}
      <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '3.5mm', flexShrink: 0 }} />

      {/* ══ BILL TO ═════════════════════════════════════════════ */}
      <div style={{
        background: '#f8fafc', borderRadius: '5px', padding: '5px 9px',
        marginBottom: '3.5mm', flexShrink: 0, borderLeft: '3px solid #7c3aed',
      }}>
        <p style={{
          fontSize: '6.5pt', fontWeight: 700, color: '#7c3aed',
          letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 2px',
        }}>Bill To</p>
        <p style={{ fontWeight: 700, fontSize: '9pt', margin: '0 0 1px', color: '#1e293b' }}>
          {invoice.billingName}
        </p>
        <div style={{ fontSize: '7.5pt', color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '0 14px' }}>
          {invoice.billingPhone   && <span>📞 {invoice.billingPhone}</span>}
          {invoice.billingEmail   && <span>✉ {invoice.billingEmail}</span>}
          {invoice.billingAddress && (
            <span>📍 {invoice.billingAddress}{invoice.billingState ? `, ${invoice.billingState}` : ''}</span>
          )}
          {invoice.customerGstin  && <span><strong>GSTIN:</strong> {invoice.customerGstin}</span>}
        </div>
      </div>

      {/* ══ ITEMS TABLE ═════════════════════════════════════════ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3.5mm', flexShrink: 0 }}>
        <thead>
          <tr style={{ background: 'linear-gradient(90deg, #4c1d95, #6d28d9)', color: '#fff' }}>
            {[
              { h: '#',           a: 'center', w: '18px'  },
              { h: 'Description', a: 'left',   w: 'auto'  },
              { h: 'HSN/SAC',     a: 'center', w: '50px'  },
              { h: 'Qty',         a: 'center', w: '26px'  },
              { h: 'Unit',        a: 'center', w: '28px'  },
              { h: 'Rate (₹)',    a: 'right',  w: '56px'  },
              { h: 'Amount (₹)', a: 'right',  w: '60px'  },
            ].map(({ h, a, w }, i) => (
              <th key={h} style={{
                padding: '4px 5px', fontSize: '7pt', fontWeight: 700,
                textAlign: a as any, width: w,
                borderRadius: i === 0 ? '4px 0 0 4px' : i === 6 ? '0 4px 4px 0' : undefined,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={item.id ?? i} style={{
              background: i % 2 === 0 ? '#f8fafc' : '#fff',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <td style={{ padding: '3px 5px', fontSize: '7.5pt', color: '#94a3b8', textAlign: 'center' }}>{i + 1}</td>
              <td style={{ padding: '3px 5px', fontSize: '7.5pt', fontWeight: 500 }}>{item.description}</td>
              <td style={{ padding: '3px 5px', fontSize: '7.5pt', color: '#64748b', textAlign: 'center' }}>{item.hsn ?? '—'}</td>
              <td style={{ padding: '3px 5px', fontSize: '7.5pt', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '3px 5px', fontSize: '7.5pt', color: '#64748b', textAlign: 'center' }}>{item.unit ?? '—'}</td>
              <td style={{ padding: '3px 5px', fontSize: '7.5pt', textAlign: 'right', fontFamily: 'monospace' }}>
                {item.price < 0
                  ? `−${Math.abs(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  : item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td style={{
                padding: '3px 5px', fontSize: '7.5pt', textAlign: 'right',
                fontFamily: 'monospace', fontWeight: 600,
                color: item.total < 0 ? '#dc2626' : '#1e293b',
              }}>
                {item.total < 0
                  ? `−${Math.abs(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  : item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ══ TOTALS ROW ══════════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: '5mm', marginBottom: '3mm', flexShrink: 0 }}>

        {/* Left: words + bank */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2mm' }}>
          <div style={{
            background: '#f5f3ff', border: '1px solid #ddd6fe',
            borderRadius: '5px', padding: '4px 7px', fontSize: '7.5pt',
          }}>
            <strong style={{ color: '#5b21b6' }}>Amount in Words: </strong>
            <span style={{ color: '#4c1d95' }}>{numberToWords(invoice.totalAmount)}</span>
          </div>

          {(comp.bankName || comp.upiId) && (
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: '5px', padding: '4px 7px', fontSize: '7.5pt', flex: 1,
            }}>
              <p style={{
                fontWeight: 700, margin: '0 0 2px', color: '#374151',
                fontSize: '6.5pt', textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>Bank Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 10px', color: '#475569' }}>
                {comp.bankName      && <span><strong>Bank:</strong> {comp.bankName}</span>}
                {comp.accountName   && <span><strong>A/C:</strong> {comp.accountName}</span>}
                {comp.accountNumber && <span><strong>No:</strong> {comp.accountNumber}</span>}
                {comp.ifscCode      && <span><strong>IFSC:</strong> {comp.ifscCode}</span>}
                {comp.upiId         && <span><strong>UPI:</strong> {comp.upiId}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Right: totals */}
        <div style={{ width: '180px', flexShrink: 0 }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '7px', overflow: 'hidden' }}>
            {[
              { label: 'Subtotal',              value: formatCurrency(invoice.subtotal),       color: '#475569', show: true },
              { label: 'Discount',              value: `− ${formatCurrency(invoice.discountAmount ?? 0)}`, color: '#dc2626', show: (invoice.discountAmount ?? 0) > 0 },
              { label: `CGST (${invoice.cgstRate}%)`, value: formatCurrency(invoice.cgstAmount), color: '#475569', show: invoice.gstType === 'CGST_SGST' },
              { label: `SGST (${invoice.sgstRate}%)`, value: formatCurrency(invoice.sgstAmount), color: '#475569', show: invoice.gstType === 'CGST_SGST' },
              { label: `IGST (${invoice.igstRate}%)`, value: formatCurrency(invoice.igstAmount), color: '#475569', show: invoice.gstType === 'IGST' },
            ].filter(r => r.show).map(({ label, value, color }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '2.5px 7px', fontSize: '7.5pt', color,
                borderBottom: '1px solid #f1f5f9',
              }}>
                <span>{label}</span>
                <span style={{ fontFamily: 'monospace' }}>{value}</span>
              </div>
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between', padding: '4px 7px',
              fontSize: '9pt', fontWeight: 800, color: '#fff',
              background: 'linear-gradient(90deg, #4c1d95, #6d28d9)',
            }}>
              <span>Total</span>
              <span style={{ fontFamily: 'monospace' }}>{formatCurrency(invoice.totalAmount)}</span>
            </div>
            {invoice.paidAmount > 0 && (
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '2.5px 7px', fontSize: '7.5pt', color: '#059669',
                borderBottom: '1px solid #f1f5f9',
              }}>
                <span>✓ Paid</span>
                <span style={{ fontFamily: 'monospace' }}>{formatCurrency(invoice.paidAmount)}</span>
              </div>
            )}
            <div style={{
              display: 'flex', justifyContent: 'space-between', padding: '3px 7px',
              fontSize: '8pt', fontWeight: 700,
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
        <div style={{
          display: 'flex', gap: '6mm', marginBottom: '2.5mm',
          fontSize: '7.5pt', color: '#475569', flexShrink: 0,
        }}>
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

      {/* ══ FLEX SPACER ═════════════════════════════════════════ */}
      <div style={{ flex: 1, minHeight: 0 }} />

      {/* ══ FOOTER ══════════════════════════════════════════════ */}
      <div style={{
        borderTop: '1px solid #e2e8f0', paddingTop: '3mm', flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div style={{ fontSize: '7pt', color: '#94a3b8' }}>
          <p style={{ margin: 0 }}>This is a computer-generated invoice.</p>
          {comp.website && <p style={{ margin: '1px 0 0', color: '#6d28d9' }}>{comp.website}</p>}
        </div>

        {/* ── SIGNATURE — uses live company.signatureUrl ── */}
        <div style={{ textAlign: 'center', minWidth: '120px' }}>
          {comp.signatureUrl ? (
            <img
              src={comp.signatureUrl}
              alt="Signature"
              style={{
                height: '38px', maxWidth: '115px', objectFit: 'contain',
                display: 'block', margin: '0 auto 3px',
              }}
            />
          ) : (
            <div style={{ height: '38px' }} />
          )}
          <div style={{ borderTop: '1px solid #374151', paddingTop: '2px' }}>
            <p style={{ fontSize: '7pt', fontWeight: 700, color: '#374151', margin: 0 }}>
              Authorised Signatory
            </p>
            <p style={{ fontSize: '7pt', color: '#64748b', margin: '1px 0 0' }}>
              {comp.companyName}
            </p>
          </div>
        </div>
      </div>

      {/* ══ BOTTOM ACCENT ═══════════════════════════════════════ */}
      <div style={{
        height: '3px', flexShrink: 0, marginTop: '3mm',
        background: 'linear-gradient(90deg, #4c1d95, #7c3aed, #a78bfa)',
        borderRadius: '2px',
      }} />
    </div>
  );
}