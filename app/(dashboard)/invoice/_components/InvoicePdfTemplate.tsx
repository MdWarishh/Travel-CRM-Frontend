// app/invoice/_components/InvoicePdfTemplate.tsx
// This component is used BOTH for preview and PDF print (A4)

import { GstInvoice, CompanySettings } from '@/types/invoice';
import { formatCurrency, formatDate, numberToWords, GST_TYPE_LABELS } from '@/lib/invoiceUtils';

interface Props {
  invoice: GstInvoice;
  company: CompanySettings;
}

export function InvoicePdfTemplate({ invoice, company }: Props) {
  const comp = (invoice.companySnapshot as CompanySettings) ?? company;

  return (
    <div
      id="invoice-pdf-root"
      className="bg-white text-gray-900 font-sans"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '12mm 14mm',
        fontFamily: "'Noto Sans', sans-serif",
        fontSize: '10pt',
        lineHeight: 1.5,
        boxSizing: 'border-box',
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
        {/* Left: Logo + Company */}
        <div style={{ flex: 1 }}>
          {comp.logoUrl ? (
            <img src={comp.logoUrl} alt="Logo" style={{ height: '48px', marginBottom: '6px', objectFit: 'contain' }} />
          ) : (
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '48px', height: '48px', borderRadius: '8px',
              background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '20pt',
              marginBottom: '6px',
            }}>
              {comp.companyName?.charAt(0) ?? 'C'}
            </div>
          )}
          <p style={{ fontWeight: 700, fontSize: '13pt', margin: '2px 0 1px' }}>{comp.companyName}</p>
          {comp.tagline && <p style={{ color: '#6b7280', fontSize: '8pt' }}>{comp.tagline}</p>}
          <p style={{ color: '#374151', fontSize: '8.5pt', marginTop: '4px' }}>
            {[comp.address, comp.city, comp.state, comp.pincode].filter(Boolean).join(', ')}
          </p>
          {comp.phone && <p style={{ color: '#374151', fontSize: '8.5pt' }}>📞 {comp.phone}</p>}
          {comp.email && <p style={{ color: '#374151', fontSize: '8.5pt' }}>✉ {comp.email}</p>}
          {comp.gstin && (
            <p style={{ color: '#374151', fontSize: '8.5pt', marginTop: '2px' }}>
              <strong>GSTIN:</strong> {comp.gstin}
            </p>
          )}
          {comp.pan && (
            <p style={{ color: '#374151', fontSize: '8.5pt' }}>
              <strong>PAN:</strong> {comp.pan}
            </p>
          )}
        </div>

        {/* Right: Invoice Meta */}
        <div style={{ textAlign: 'right', minWidth: '120px' }}>
          <p style={{
            fontSize: '20pt', fontWeight: 800, color: '#7c3aed',
            letterSpacing: '-0.5px', margin: 0,
          }}>INVOICE</p>
          <p style={{ fontFamily: 'monospace', fontSize: '11pt', fontWeight: 700, color: '#1f2937', margin: '4px 0 2px' }}>
            #{invoice.invoiceNumber}
          </p>
          <p style={{ fontSize: '8.5pt', color: '#6b7280' }}>
            <strong>Issue:</strong> {formatDate(invoice.issueDate)}
          </p>
          {invoice.dueDate && (
            <p style={{ fontSize: '8.5pt', color: '#dc2626' }}>
              <strong>Due:</strong> {formatDate(invoice.dueDate)}
            </p>
          )}
          {/* Status pill */}
          <div style={{
            display: 'inline-block', marginTop: '6px',
            padding: '2px 10px', borderRadius: '99px',
            fontSize: '8pt', fontWeight: 700, letterSpacing: '0.5px',
            background: invoice.status === 'PAID' ? '#d1fae5' : invoice.status === 'PARTIAL' ? '#fef3c7' : '#fee2e2',
            color: invoice.status === 'PAID' ? '#065f46' : invoice.status === 'PARTIAL' ? '#92400e' : '#991b1b',
          }}>
            {invoice.status}
          </div>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, #7c3aed, #a78bfa, #e0e7ff)', borderRadius: '1px', marginBottom: '6mm' }} />

      {/* ── BILL TO ── */}
      <div style={{ display: 'flex', gap: '20mm', marginBottom: '6mm' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '7.5pt', fontWeight: 700, color: '#7c3aed', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '3px' }}>
            Bill To
          </p>
          <p style={{ fontWeight: 700, fontSize: '11pt', margin: '0 0 2px' }}>{invoice.billingName}</p>
          {invoice.billingAddress && <p style={{ color: '#4b5563', fontSize: '8.5pt' }}>{invoice.billingAddress}</p>}
          {invoice.billingState && <p style={{ color: '#4b5563', fontSize: '8.5pt' }}>{invoice.billingState}</p>}
          {invoice.billingPhone && <p style={{ color: '#4b5563', fontSize: '8.5pt' }}>📞 {invoice.billingPhone}</p>}
          {invoice.billingEmail && <p style={{ color: '#4b5563', fontSize: '8.5pt' }}>✉ {invoice.billingEmail}</p>}
          {invoice.customerGstin && (
            <p style={{ color: '#4b5563', fontSize: '8.5pt' }}>
              <strong>GSTIN:</strong> {invoice.customerGstin}
            </p>
          )}
        </div>
      </div>

      {/* ── ITEMS TABLE ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm' }}>
        <thead>
          <tr style={{ background: '#7c3aed', color: '#fff' }}>
            <th style={{ padding: '5px 8px', textAlign: 'left', fontSize: '8pt', fontWeight: 700, borderRadius: '4px 0 0 4px' }}>#</th>
            <th style={{ padding: '5px 8px', textAlign: 'left', fontSize: '8pt', fontWeight: 700 }}>Description</th>
            <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: '8pt', fontWeight: 700 }}>HSN/SAC</th>
            <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: '8pt', fontWeight: 700 }}>Qty</th>
            <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: '8pt', fontWeight: 700 }}>Unit</th>
            <th style={{ padding: '5px 8px', textAlign: 'right', fontSize: '8pt', fontWeight: 700 }}>Rate (₹)</th>
            <th style={{ padding: '5px 8px', textAlign: 'right', fontSize: '8pt', fontWeight: 700, borderRadius: '0 4px 4px 0' }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr
              key={item.id}
              style={{ background: i % 2 === 0 ? '#f9fafb' : '#ffffff', borderBottom: '1px solid #e5e7eb' }}
            >
              <td style={{ padding: '5px 8px', fontSize: '8.5pt', color: '#6b7280' }}>{i + 1}</td>
              <td style={{ padding: '5px 8px', fontSize: '8.5pt', fontWeight: 500 }}>{item.description}</td>
              <td style={{ padding: '5px 8px', fontSize: '8.5pt', textAlign: 'center', color: '#6b7280' }}>{item.hsn ?? '—'}</td>
              <td style={{ padding: '5px 8px', fontSize: '8.5pt', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '5px 8px', fontSize: '8.5pt', textAlign: 'center', color: '#6b7280' }}>{item.unit ?? '—'}</td>
              <td style={{ padding: '5px 8px', fontSize: '8.5pt', textAlign: 'right', fontFamily: 'monospace' }}>
                {item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td style={{ padding: '5px 8px', fontSize: '8.5pt', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                {item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── TOTALS ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6mm' }}>
        <div style={{ width: '220px' }}>
          {/* Subtotal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '9pt' }}>
            <span style={{ color: '#6b7280' }}>Subtotal</span>
            <span style={{ fontFamily: 'monospace' }}>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {/* Discount */}
          {(invoice.discountAmount ?? 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '9pt' }}>
              <span style={{ color: '#dc2626' }}>Discount</span>
              <span style={{ color: '#dc2626', fontFamily: 'monospace' }}>− {formatCurrency(invoice.discountAmount ?? 0)}</span>
            </div>
          )}
          {/* GST lines */}
          {invoice.gstType === 'CGST_SGST' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '9pt' }}>
                <span style={{ color: '#6b7280' }}>CGST ({invoice.cgstRate}%)</span>
                <span style={{ fontFamily: 'monospace' }}>{formatCurrency(invoice.cgstAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '9pt' }}>
                <span style={{ color: '#6b7280' }}>SGST ({invoice.sgstRate}%)</span>
                <span style={{ fontFamily: 'monospace' }}>{formatCurrency(invoice.sgstAmount)}</span>
              </div>
            </>
          )}
          {invoice.gstType === 'IGST' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '9pt' }}>
              <span style={{ color: '#6b7280' }}>IGST ({invoice.igstRate}%)</span>
              <span style={{ fontFamily: 'monospace' }}>{formatCurrency(invoice.igstAmount)}</span>
            </div>
          )}
          {/* Separator */}
          <div style={{ borderTop: '2px solid #7c3aed', margin: '4px 0' }} />
          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: 700, fontSize: '11pt' }}>
            <span>Total</span>
            <span style={{ color: '#7c3aed', fontFamily: 'monospace' }}>{formatCurrency(invoice.totalAmount)}</span>
          </div>
          {/* Paid */}
          {invoice.paidAmount > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '9pt' }}>
                <span style={{ color: '#059669' }}>Paid</span>
                <span style={{ color: '#059669', fontFamily: 'monospace' }}>{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '9pt', fontWeight: 700 }}>
                <span style={{ color: '#dc2626' }}>Balance Due</span>
                <span style={{ color: '#dc2626', fontFamily: 'monospace' }}>{formatCurrency(invoice.dueAmount)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── AMOUNT IN WORDS ── */}
      <div style={{
        background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '6px',
        padding: '6px 10px', marginBottom: '6mm', fontSize: '8.5pt',
      }}>
        <strong>Amount in Words: </strong>
        <span style={{ color: '#5b21b6' }}>{numberToWords(invoice.totalAmount)}</span>
      </div>

      {/* ── BANK DETAILS ── */}
      {(comp.bankName || comp.upiId) && (
        <div style={{
          background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px',
          padding: '8px 10px', marginBottom: '6mm', fontSize: '8.5pt',
        }}>
          <p style={{ fontWeight: 700, marginBottom: '4px', color: '#374151' }}>Bank Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
            {comp.bankName && <span><strong>Bank:</strong> {comp.bankName}</span>}
            {comp.accountName && <span><strong>Account Name:</strong> {comp.accountName}</span>}
            {comp.accountNumber && <span><strong>Account No:</strong> {comp.accountNumber}</span>}
            {comp.ifscCode && <span><strong>IFSC:</strong> {comp.ifscCode}</span>}
            {comp.upiId && <span><strong>UPI:</strong> {comp.upiId}</span>}
          </div>
        </div>
      )}

      {/* ── NOTES & TERMS ── */}
      {(invoice.notes || invoice.terms) && (
        <div style={{ marginBottom: '6mm', fontSize: '8.5pt' }}>
          {invoice.notes && (
            <div style={{ marginBottom: '4px' }}>
              <strong style={{ color: '#374151' }}>Notes: </strong>
              <span style={{ color: '#6b7280' }}>{invoice.notes}</span>
            </div>
          )}
          {invoice.terms && (
            <div>
              <strong style={{ color: '#374151' }}>Terms & Conditions: </strong>
              <span style={{ color: '#6b7280' }}>{invoice.terms}</span>
            </div>
          )}
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{
        borderTop: '1px solid #e5e7eb', paddingTop: '6mm',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        fontSize: '8pt', color: '#9ca3af',
      }}>
        <div>
          <p>This is a computer-generated invoice.</p>
          {comp.website && <p>{comp.website}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ borderTop: '1px solid #374151', width: '120px', marginLeft: 'auto', marginBottom: '4px' }} />
          <p style={{ color: '#374151', fontWeight: 600 }}>Authorised Signatory</p>
          <p>{comp.companyName}</p>
        </div>
      </div>
    </div>
  );
}