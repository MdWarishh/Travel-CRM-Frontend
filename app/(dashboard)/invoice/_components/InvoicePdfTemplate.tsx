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
  // Always prefer live company data, fallback to snapshot
  const snap = invoice.companySnapshot as CompanySettings | null;
  const comp: CompanySettings = {
    ...company,
    ...(snap ?? {}),
    // Always take signature + logo from live company (latest upload wins)
    signatureUrl: company.signatureUrl ?? snap?.signatureUrl ?? null,
    logoUrl:      company.logoUrl ?? snap?.logoUrl ?? null,
  };

  const st = STATUS_STYLES[invoice.status] ?? STATUS_STYLES.DRAFT;

  // Warm sandy travel palette
  const SAND    = '#f5ede0';
  const SAND2   = '#eedfc8';
  const TEAL    = '#1a6b8a';
  const TEAL2   = '#145570';
  const AMBER   = '#e8a020';
  const DARK    = '#1c2b3a';
  const MUTED   = '#5c7080';

  return (
    <div
      id="invoice-pdf-root"
      style={{
        width: '210mm',
        height: '297mm',
        maxHeight: '297mm',
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize: '7.5pt',
        lineHeight: 1.4,
        boxSizing: 'border-box',
        background: '#fff',
        color: DARK,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >

      {/* ══ TOP HEADER BAND (sandy background) ═══════════════════════════════ */}
      <div style={{
        background: SAND,
        padding: '7mm 10mm 5mm',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative wave top-right */}
        <svg style={{ position: 'absolute', top: 0, right: 0, opacity: 0.18 }}
          width="160" height="80" viewBox="0 0 160 80">
          <path d="M160,0 Q120,40 80,20 Q40,0 0,30 L0,0 Z" fill={TEAL} />
          <path d="M160,0 Q130,50 90,30 Q50,10 10,40 L0,20 L0,0 Z" fill={AMBER} opacity="0.5"/>
        </svg>
        {/* Decorative circle bottom-left */}
        <div style={{
          position: 'absolute', bottom: -20, left: -20,
          width: 80, height: 80, borderRadius: '50%',
          background: TEAL2, opacity: 0.12,
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>

          {/* Left: Logo + company */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              {comp.logoUrl ? (
                <img src={comp.logoUrl} alt="logo"
                  style={{ height: '40px', maxWidth: '80px', objectFit: 'contain' }} />
              ) : (
                <div style={{
                  width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                  background: `linear-gradient(135deg, ${TEAL}, ${TEAL2})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 900, fontSize: '15pt',
                }}>
                  {comp.companyName?.charAt(0) ?? 'T'}
                </div>
              )}
              <div>
                <p style={{
                  fontWeight: 900, fontSize: '13pt', margin: 0,
                  color: TEAL2, letterSpacing: '-0.3px', textTransform: 'uppercase',
                }}>
                  {comp.companyName}
                </p>
                {comp.tagline && (
                  <p style={{ fontSize: '7pt', color: AMBER, margin: '1px 0 0', fontStyle: 'italic', fontWeight: 600 }}>
                    {comp.tagline}
                  </p>
                )}
              </div>
            </div>
            <div style={{ fontSize: '7pt', color: MUTED, lineHeight: 1.7, marginTop: '2px' }}>
              {[comp.address, comp.city, comp.state, comp.pincode].filter(Boolean).length > 0 && (
                <p style={{ margin: 0 }}>
                  {[comp.address, comp.city, comp.state, comp.pincode].filter(Boolean).join(', ')}
                </p>
              )}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {comp.phone && <span>✆ {comp.phone}</span>}
                {comp.email && <span>✉ {comp.email}</span>}
                {comp.website && <span>🌐 {comp.website}</span>}
              </div>
              {(comp.gstin || comp.pan) && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  {comp.gstin && <span><strong style={{ color: DARK }}>GSTIN:</strong> {comp.gstin}</span>}
                  {comp.pan   && <span><strong style={{ color: DARK }}>PAN:</strong> {comp.pan}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Right: INVOICE title + meta */}
          <div style={{ textAlign: 'right', minWidth: '110px' }}>
            <p style={{
              fontSize: '22pt', fontWeight: 900, color: AMBER,
              letterSpacing: '-1px', margin: '0 0 2px', lineHeight: 1,
              textTransform: 'uppercase',
            }}>INVOICE</p>
            <p style={{
              fontFamily: 'monospace', fontSize: '8.5pt', fontWeight: 700,
              margin: '0 0 4px', color: TEAL2,
            }}>#{invoice.invoiceNumber}</p>
            <div style={{ fontSize: '7pt', color: MUTED, lineHeight: 1.75 }}>
              <p style={{ margin: 0 }}>
                <strong style={{ color: DARK }}>Issue:</strong> {formatDate(invoice.issueDate)}
              </p>
              {invoice.dueDate && (
                <p style={{ margin: 0, color: invoice.dueAmount > 0 ? '#dc2626' : MUTED }}>
                  <strong>Due:</strong> {formatDate(invoice.dueDate)}
                </p>
              )}
            </div>
            {/* Status badge */}
            <div style={{
              display: 'inline-block', marginTop: '4px',
              padding: '2px 9px', borderRadius: '99px',
              fontSize: '6.5pt', fontWeight: 700, letterSpacing: '0.6px',
              background: st.bg, color: st.color, border: `1px solid ${st.border}`,
            }}>
              {invoice.status}
            </div>
          </div>
        </div>
      </div>

      {/* ══ WAVY DIVIDER SVG ══════════════════════════════════════════════════ */}
      <svg width="100%" height="12" viewBox="0 0 800 12" preserveAspectRatio="none"
        style={{ flexShrink: 0, display: 'block', marginBottom: '0' }}>
        <path d="M0,6 Q100,0 200,6 Q300,12 400,6 Q500,0 600,6 Q700,12 800,6 L800,12 L0,12 Z"
          fill={SAND} />
      </svg>

      {/* ══ INVOICE TO + PAYMENT INFO ROW ════════════════════════════════════ */}
      <div style={{
        display: 'flex', gap: '5mm',
        padding: '3mm 10mm 3mm',
        flexShrink: 0, background: '#fff',
      }}>
        {/* Bill To */}
        <div style={{
          flex: 1,
          borderLeft: `3px solid ${TEAL}`,
          paddingLeft: '6px',
        }}>
          <p style={{
            fontSize: '6.5pt', fontWeight: 700, color: TEAL,
            letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 2px',
          }}>Invoice To</p>
          <p style={{ fontWeight: 800, fontSize: '9pt', margin: '0 0 1px', color: DARK }}>
            {invoice.billingName}
          </p>
          <div style={{ fontSize: '7pt', color: MUTED, lineHeight: 1.6 }}>
            {invoice.billingPhone   && <p style={{ margin: 0 }}>✆ {invoice.billingPhone}</p>}
            {invoice.billingEmail   && <p style={{ margin: 0 }}>✉ {invoice.billingEmail}</p>}
            {invoice.billingAddress && (
              <p style={{ margin: 0 }}>
                📍 {invoice.billingAddress}{invoice.billingState ? `, ${invoice.billingState}` : ''}
              </p>
            )}
            {invoice.customerGstin  && <p style={{ margin: 0 }}><strong>GSTIN:</strong> {invoice.customerGstin}</p>}
          </div>
        </div>

        {/* Payment Info */}
        {(comp.bankName || comp.accountNumber || comp.upiId) && (
          <div style={{
            flex: 1,
            borderLeft: `3px solid ${AMBER}`,
            paddingLeft: '6px',
          }}>
            <p style={{
              fontSize: '6.5pt', fontWeight: 700, color: AMBER,
              letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 2px',
            }}>Payment Information</p>
            <div style={{ fontSize: '7pt', color: MUTED, lineHeight: 1.7 }}>
              {comp.bankName      && <p style={{ margin: 0 }}><strong style={{ color: DARK }}>Bank:</strong> {comp.bankName}</p>}
              {comp.accountNumber && <p style={{ margin: 0 }}><strong style={{ color: DARK }}>A/C No:</strong> {comp.accountNumber}</p>}
              {comp.accountName   && <p style={{ margin: 0 }}><strong style={{ color: DARK }}>Name:</strong> {comp.accountName}</p>}
              {comp.ifscCode      && <p style={{ margin: 0 }}><strong style={{ color: DARK }}>IFSC:</strong> {comp.ifscCode}</p>}
              {comp.upiId         && <p style={{ margin: 0 }}><strong style={{ color: DARK }}>UPI:</strong> {comp.upiId}</p>}
            </div>
          </div>
        )}
      </div>

      {/* ══ ITEMS TABLE ══════════════════════════════════════════════════════ */}
      <div style={{ padding: '0 10mm', flexShrink: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${SAND2}` }}>
          <thead>
            <tr style={{ background: TEAL, color: '#fff' }}>
              {[
                { h: 'Item Description', a: 'left',   w: 'auto'  },
                { h: 'Price',            a: 'right',  w: '52px'  },
                { h: 'Qty.',             a: 'center', w: '28px'  },
                { h: 'Total',            a: 'right',  w: '58px'  },
              ].map(({ h, a, w }, i) => (
                <th key={h} style={{
                  padding: '5px 7px', fontSize: '7pt', fontWeight: 700,
                  textAlign: a as any, width: w, letterSpacing: '0.4px',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={item.id ?? i} style={{
                background: i % 2 === 0 ? '#fff' : SAND,
                borderBottom: `1px solid ${SAND2}`,
              }}>
                <td style={{ padding: '4px 7px', fontSize: '7.5pt' }}>
                  <span style={{ fontWeight: 500, color: DARK }}>{item.description}</span>
                  {item.hsn && <span style={{ color: MUTED, fontSize: '6.5pt', marginLeft: '5px' }}>HSN: {item.hsn}</span>}
                </td>
                <td style={{ padding: '4px 7px', fontSize: '7.5pt', textAlign: 'right', fontFamily: 'monospace' }}>
                  {item.price < 0
                    ? `−${Math.abs(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '4px 7px', fontSize: '7.5pt', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{
                  padding: '4px 7px', fontSize: '7.5pt', textAlign: 'right',
                  fontFamily: 'monospace', fontWeight: 600,
                  color: item.total < 0 ? '#dc2626' : DARK,
                }}>
                  {item.total < 0
                    ? `−${Math.abs(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ══ TOTALS + AMOUNT WORDS ═════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end',
        padding: '2.5mm 10mm 2mm',
        flexShrink: 0,
      }}>
        <div style={{ width: '175px', border: `1px solid ${SAND2}`, borderRadius: '6px', overflow: 'hidden' }}>
          {[
            { label: 'Subtotal',  value: formatCurrency(invoice.subtotal), color: MUTED, show: true },
            { label: `Discount`, value: `− ${formatCurrency(invoice.discountAmount ?? 0)}`, color: '#dc2626', show: (invoice.discountAmount ?? 0) > 0 },
            { label: `CGST (${invoice.cgstRate}%)`, value: formatCurrency(invoice.cgstAmount), color: MUTED, show: invoice.gstType === 'CGST_SGST' },
            { label: `SGST (${invoice.sgstRate}%)`, value: formatCurrency(invoice.sgstAmount), color: MUTED, show: invoice.gstType === 'CGST_SGST' },
            { label: `IGST (${invoice.igstRate}%)`, value: formatCurrency(invoice.igstAmount), color: MUTED, show: invoice.gstType === 'IGST' },
            { label: `Tax Rate`, value: `${invoice.cgstRate ? invoice.cgstRate * 2 : invoice.igstRate ?? 0}%`, color: MUTED, show: invoice.gstType === 'NONE' || (!invoice.cgstAmount && !invoice.igstAmount) },
          ].filter(r => r.show).map(({ label, value, color }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '2.5px 8px', fontSize: '7.5pt', color,
              borderBottom: `1px solid ${SAND2}`,
            }}>
              <span>{label}</span>
              <span style={{ fontFamily: 'monospace' }}>{value}</span>
            </div>
          ))}
          {/* TOTAL row — teal background */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '5px 8px', fontWeight: 800, fontSize: '9pt',
            background: TEAL, color: '#fff',
          }}>
            <span>TOTAL</span>
            <span style={{ fontFamily: 'monospace' }}>{formatCurrency(invoice.totalAmount)}</span>
          </div>
          {invoice.paidAmount > 0 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '2.5px 8px', fontSize: '7.5pt', color: '#059669',
              borderBottom: `1px solid ${SAND2}`,
            }}>
              <span>✓ Paid</span>
              <span style={{ fontFamily: 'monospace' }}>{formatCurrency(invoice.paidAmount)}</span>
            </div>
          )}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '3px 8px', fontSize: '8pt', fontWeight: 700,
            background: invoice.dueAmount <= 0 ? '#dcfce7' : '#fef2f2',
            color: invoice.dueAmount <= 0 ? '#15803d' : '#dc2626',
          }}>
            <span>Balance Due</span>
            <span style={{ fontFamily: 'monospace' }}>{formatCurrency(Math.max(0, invoice.dueAmount))}</span>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <div style={{ padding: '0 10mm 2mm', flexShrink: 0 }}>
        <div style={{
          background: SAND, borderRadius: '5px',
          padding: '3px 8px', fontSize: '7pt',
          border: `1px solid ${SAND2}`,
          display: 'inline-block',
        }}>
          <strong style={{ color: TEAL2 }}>Amount in Words: </strong>
          <span style={{ color: DARK }}>{numberToWords(invoice.totalAmount)}</span>
        </div>
      </div>

      {/* Notes & Terms */}
      {(invoice.notes || invoice.terms) && (
        <div style={{
          display: 'flex', gap: '6mm', padding: '0 10mm 2mm',
          fontSize: '7pt', color: MUTED, flexShrink: 0,
        }}>
          {invoice.notes && (
            <div style={{ flex: 1 }}>
              <strong style={{ color: DARK }}>Notes: </strong>{invoice.notes}
            </div>
          )}
          {invoice.terms && (
            <div style={{ flex: 1 }}>
              <strong style={{ color: DARK }}>Terms & Conditions: </strong>{invoice.terms}
            </div>
          )}
        </div>
      )}

      {/* ══ FLEX SPACER ══════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, minHeight: 0 }} />

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <div style={{ flexShrink: 0 }}>
        {/* Wavy top of footer */}
        <svg width="100%" height="12" viewBox="0 0 800 12" preserveAspectRatio="none"
          style={{ display: 'block' }}>
          <path d="M0,6 Q100,12 200,6 Q300,0 400,6 Q500,12 600,6 Q700,0 800,6 L800,12 L0,12 Z"
            fill={SAND} />
        </svg>

        <div style={{
          background: SAND,
          padding: '3mm 10mm 4mm',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          {/* Left footer text */}
          <div style={{ fontSize: '6.5pt', color: MUTED }}>
            <p style={{ margin: 0, fontWeight: 600 }}>This is a computer-generated invoice.</p>
            {comp.website && (
              <p style={{ margin: '2px 0 0', color: TEAL, fontWeight: 600 }}>{comp.website}</p>
            )}
          </div>

          {/* ── SIGNATURE — always from live company.signatureUrl ── */}
          <div style={{ textAlign: 'center', minWidth: '110px' }}>
            {comp.signatureUrl ? (
              <img
                src={comp.signatureUrl}
                alt="Authorised Signature"
                style={{
                  height: '42px',
                  maxWidth: '120px',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto 3px',
                }}
              />
            ) : (
              <div style={{ height: '42px' }} />
            )}
            <div style={{ borderTop: `1.5px solid ${TEAL2}`, paddingTop: '3px' }}>
              <p style={{ fontSize: '7pt', fontWeight: 700, color: TEAL2, margin: 0 }}>
                Authorised Sign
              </p>
              <p style={{ fontSize: '6.5pt', color: MUTED, margin: '1px 0 0' }}>
                {comp.companyName}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}