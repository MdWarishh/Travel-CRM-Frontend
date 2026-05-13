'use client';

import { format } from 'date-fns';
import { X, Download, Loader2, Hotel, Plane, Car, ArrowRight, Moon, IndianRupee, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Booking } from '@/types/booking';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  booking: Booking;
  onDownloadPdf: () => void;
  pdfLoading?: boolean;
}

function fmt(d?: string | null, withTime = false) {
  if (!d) return '—';
  try { return format(new Date(d), withTime ? 'dd MMM yyyy, HH:mm' : 'dd MMM yyyy'); }
  catch { return '—'; }
}

function SectionTitle({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="flex items-center gap-1.5">
        {icon}
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">{label}</h3>
      </div>
      <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">{count}</span>
    </div>
  );
}

function EmptySection({ label }: { label: string }) {
  return (
    <p className="text-sm text-slate-400 italic py-3 text-center bg-slate-50 rounded-xl">No {label} added</p>
  );
}

export function BookingPreviewModal({ open, onClose, booking, onDownloadPdf, pdfLoading }: Props) {
  const customer    = booking.customer;
  const hotels      = booking.hotelBookings ?? [];
  const flights     = booking.flightBookings ?? [];
  const transports  = booking.transportBookings ?? [];
  const travellers  = booking.travellers ?? [];
  const payments    = booking.bookingPayments ?? [];

  const totalNights    = hotels.reduce((s, h) => s + (h.nights ?? 0), 0);
  const totalTravelers = (booking.adults ?? 0) + (booking.children ?? 0);
  const includedCount  = transports.filter((t) => t.included).length;
  const totalPaid      = booking.advancePaid ?? 0;
  const totalAmount    = booking.totalAmount ?? 0;
  const dueAmount      = Math.max(0, totalAmount - totalPaid);
  const progressPct    = totalAmount > 0 ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0;

  const nights =
    booking.totalNights ??
    (booking.travelStart && booking.travelEnd
      ? Math.ceil((new Date(booking.travelEnd).getTime() - new Date(booking.travelStart).getTime()) / 86400000)
      : null);

  // Per-person breakdown
  const breakdown: { label: string; unitPrice: number; qty: number; total: number }[] = [];
  if (booking.pricePerAdult && booking.adults) {
    breakdown.push({ label: `${booking.adults} Adult${booking.adults > 1 ? 's' : ''}`, unitPrice: booking.pricePerAdult, qty: booking.adults, total: booking.pricePerAdult * booking.adults });
  }
  if (booking.pricePerChild && booking.children) {
    breakdown.push({ label: `${booking.children} Child${booking.children > 1 ? 'ren' : ''}`, unitPrice: booking.pricePerChild, qty: booking.children, total: booking.pricePerChild * booking.children });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full rounded-2xl p-0 overflow-hidden max-h-[92vh] flex flex-col gap-0">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Booking Preview</h2>
            <p className="text-xs text-slate-400 mt-0.5">Full booking summary — matches PDF voucher</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onDownloadPdf} disabled={pdfLoading} size="sm" className="bg-slate-900 hover:bg-slate-800 rounded-xl gap-2 h-8">
              {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Download PDF
            </Button>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5 bg-slate-50">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">

            {/* ── Voucher Header ── */}
            <div className="bg-slate-900 text-white px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-medium">Travel CRM</p>
                  <h1 className="text-lg font-bold">Booking Confirmation Voucher</h1>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Ref No.</p>
                  <p className="text-base font-mono font-bold text-white mt-0.5">#{booking.id.slice(-8).toUpperCase()}</p>
                  <Badge className={cn('mt-1.5 text-xs font-semibold border',
                    booking.status === 'CONFIRMED' ? 'bg-emerald-500 text-white border-emerald-500' :
                    booking.status === 'PENDING'   ? 'bg-amber-400 text-slate-900 border-amber-400' :
                    booking.status === 'CANCELLED' ? 'bg-red-500 text-white border-red-500' :
                                                     'bg-slate-600 text-white border-slate-600'
                  )}>
                    {booking.status}
                  </Badge>
                </div>
              </div>

              {/* Customer bar */}
              <div className="mt-5 pt-4 border-t border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Customer', value: customer.name },
                  { label: 'Phone', value: customer.phone },
                  {
                    label: 'Travel Dates',
                    value: booking.travelStart && booking.travelEnd
                      ? `${fmt(booking.travelStart)} → ${fmt(booking.travelEnd)}`
                      : '—',
                  },
                  {
                    label: 'Duration',
                    value: booking.tourDays || (nights !== null ? `${nights}N ${(nights ?? 0) + 1}D` : '—'),
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-semibold text-white mt-0.5 leading-snug">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* ── Pickup / Drop ── */}
              {(booking.startDetails || booking.endDetails) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {booking.startDetails && (
                    <div className="bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
                      <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest mb-1">🚀 Pickup</p>
                      <p className="text-sm text-slate-800 font-medium">{booking.startDetails}</p>
                    </div>
                  )}
                  {booking.endDetails && (
                    <div className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                      <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest mb-1">🏁 Drop</p>
                      <p className="text-sm text-slate-800 font-medium">{booking.endDetails}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Hotels ── */}
              <div>
                <SectionTitle icon={<Hotel className="h-4 w-4 text-amber-500" />} label="Hotel Details" count={hotels.length} />
                {hotels.length === 0 ? <EmptySection label="hotels" /> : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-amber-50 border-b border-amber-100">
                          {['City', 'Hotel', 'Check-in', 'Check-out', 'Nights', 'Rooms', 'Type', 'Meal'].map((h) => (
                            <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-amber-800 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {hotels.map((h, i) => (
                          <tr key={h.id} className={cn('border-b border-slate-50 last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                            <td className="px-3 py-2.5 font-medium text-slate-700 whitespace-nowrap">{h.city}</td>
                            <td className="px-3 py-2.5">
                              <p className="font-semibold text-slate-800 whitespace-nowrap">{h.hotelName}</p>
                              {h.extraBed && <p className="text-[10px] text-violet-500 font-medium">+ Extra bed</p>}
                            </td>
                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{fmt(h.checkIn)}</td>
                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{fmt(h.checkOut)}</td>
                            <td className="px-3 py-2.5">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <Moon className="h-2.5 w-2.5" />{h.nights}N
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{h.rooms}R × {h.guests}G</td>
                            <td className="px-3 py-2.5">
                              <Badge variant="outline" className={cn('text-xs border whitespace-nowrap',
                                h.roomType === 'SUITE' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                h.roomType === 'DELUXE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                              )}>{h.roomType}</Badge>
                            </td>
                            <td className="px-3 py-2.5">
                              <Badge variant="outline" className="text-xs border bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
                                {h.mealPlan}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Flights ── */}
              <div>
                <SectionTitle icon={<Plane className="h-4 w-4 text-blue-500" />} label="Flight Details" count={flights.length} />
                {flights.length === 0 ? <EmptySection label="flights" /> : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-blue-50 border-b border-blue-100">
                          {['Route', 'Airline', 'Flight No.', 'Departure', 'Arrival', 'PNR', 'Class', 'Status'].map((h) => (
                            <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-blue-800 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {flights.map((f, i) => (
                          <tr key={f.id} className={cn('border-b border-slate-50 last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                                <span>{f.from}</span>
                                <ArrowRight className="h-3 w-3 text-blue-400" />
                                <span>{f.to}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{f.airline ?? '—'}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{f.flightNumber ?? '—'}</span>
                            </td>
                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{fmt(f.departure, true)}</td>
                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{fmt(f.arrival, true)}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="font-mono font-bold text-blue-600 text-xs">{f.pnr ?? '—'}</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <Badge variant="outline" className={cn('text-xs border whitespace-nowrap',
                                f.travelClass === 'BUSINESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                f.travelClass === 'FIRST' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                              )}>{f.travelClass}</Badge>
                            </td>
                            <td className="px-3 py-2.5">
                              <Badge variant="outline" className={cn('text-xs border whitespace-nowrap',
                                f.status === 'BOOKED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                f.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              )}>{f.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Transport ── */}
              <div>
                <SectionTitle icon={<Car className="h-4 w-4 text-violet-500" />} label="Transport Details" count={transports.length} />
                {transports.length === 0 ? <EmptySection label="transport" /> : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-violet-50 border-b border-violet-100">
                          {['Vehicle', 'Pickup', 'Drop', 'Date & Time', 'Driver', 'Type', 'Included'].map((h) => (
                            <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-violet-800 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {transports.map((t, i) => (
                          <tr key={t.id} className={cn('border-b border-slate-50 last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                            <td className="px-3 py-2.5 font-semibold text-slate-800 whitespace-nowrap">{t.vehicleType}</td>
                            <td className="px-3 py-2.5 text-slate-600 max-w-[130px]"><p className="truncate" title={t.pickup}>{t.pickup}</p></td>
                            <td className="px-3 py-2.5 text-slate-600 max-w-[130px]"><p className="truncate" title={t.drop}>{t.drop}</p></td>
                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{fmt(t.datetime, true)}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              {t.driverName ? (
                                <div>
                                  <p className="text-slate-700 font-medium">{t.driverName}</p>
                                  {t.driverPhone && <p className="text-xs font-mono text-slate-400">{t.driverPhone}</p>}
                                </div>
                              ) : <span className="text-slate-400">—</span>}
                            </td>
                            <td className="px-3 py-2.5">
                              <Badge variant="outline" className={cn('text-xs border whitespace-nowrap',
                                t.transportType === 'PRIVATE' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                              )}>{t.transportType}</Badge>
                            </td>
                            <td className="px-3 py-2.5">
                              <Badge variant="outline" className={cn('text-xs border whitespace-nowrap',
                                t.included ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                              )}>{t.included ? '✓ Yes' : 'No'}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Travellers ── */}
              {travellers.length > 0 && (
                <div>
                  <SectionTitle icon={<span className="text-base">👥</span>} label="Travellers" count={travellers.length} />
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          {['#', 'Name', 'Age', 'Gender', 'ID Proof'].map((h) => (
                            <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {travellers.map((t, i) => (
                          <tr key={t.id} className={cn('border-b border-slate-50 last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                            <td className="px-3 py-2.5 text-slate-400 font-mono text-xs">{i + 1}</td>
                            <td className="px-3 py-2.5 font-semibold text-slate-800">{t.name}</td>
                            <td className="px-3 py-2.5 text-slate-600">{t.age ? `${t.age} yrs` : '—'}</td>
                            <td className="px-3 py-2.5 text-slate-600">{t.gender ?? '—'}</td>
                            <td className="px-3 py-2.5 text-slate-500 font-mono text-xs">{t.idProof ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Payment Summary ── */}
              <div>
                <SectionTitle icon={<IndianRupee className="h-4 w-4 text-emerald-600" />} label="Payment Summary" count={payments.length} />

                {/* Per-person breakdown */}
                {breakdown.length > 0 && (
                  <div className="rounded-xl border border-slate-100 overflow-hidden mb-3">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Per Person Breakdown</p>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {breakdown.map((item) => (
                        <div key={item.label} className="flex items-center justify-between px-4 py-2.5">
                          <div>
                            <p className="text-sm font-medium text-slate-700">{item.label}</p>
                            <p className="text-xs text-slate-400">₹{item.unitPrice.toLocaleString('en-IN')} × {item.qty}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-900">₹{item.total.toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50">
                        <p className="text-sm font-bold text-slate-700">Package Total</p>
                        <p className="text-sm font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment progress */}
                {totalAmount > 0 && (
                  <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3 mb-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Payment Progress</span>
                      <span className="font-semibold">{progressPct}% paid</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', progressPct === 100 ? 'bg-emerald-500' : progressPct > 50 ? 'bg-blue-500' : 'bg-amber-500')}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Total</p>
                        <p className="text-sm font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-emerald-600 uppercase tracking-wide mb-0.5">Paid</p>
                        <p className="text-sm font-bold text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-center">
                        <p className={cn('text-[10px] uppercase tracking-wide mb-0.5', dueAmount > 0 ? 'text-red-500' : 'text-slate-400')}>Due</p>
                        <p className={cn('text-sm font-bold', dueAmount > 0 ? 'text-red-600' : 'text-slate-400')}>
                          ₹{dueAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment history table */}
                {payments.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-emerald-50 border-b border-emerald-100">
                          {['#', 'Amount', 'Mode', 'Date', 'Note'].map((h) => (
                            <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-emerald-800 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p, i) => (
                          <tr key={p.id} className={cn('border-b border-slate-50 last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                            <td className="px-3 py-2.5 text-slate-400 font-mono text-xs">{i + 1}</td>
                            <td className="px-3 py-2.5 font-bold text-slate-800">₹{p.amount.toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2.5">
                              <Badge variant="outline" className="text-xs border border-slate-200 text-slate-500 font-mono">{p.mode}</Badge>
                            </td>
                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{fmt(p.paidAt)}</td>
                            <td className="px-3 py-2.5 text-slate-500 italic text-xs">{p.note ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {payments.length > 1 && (
                      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <TrendingUp className="h-3 w-3 text-emerald-500" /> Total collected
                        </span>
                        <span className="text-sm font-bold text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                )}

                {payments.length === 0 && totalAmount === 0 && (
                  <EmptySection label="payment records" />
                )}
              </div>

              {/* ── Bottom summary cards ── */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                {[
                  { label: 'Total Nights',       value: `${totalNights}N`, sub: `${hotels.length} hotel${hotels.length !== 1 ? 's' : ''}`,    color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100' },
                  { label: 'Travelers',           value: totalTravelers || '—', sub: `${booking.adults ?? 0}A + ${booking.children ?? 0}C`,    color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100' },
                  { label: 'Transfers Included',  value: includedCount, sub: `of ${transports.length} total`,                                  color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
                ].map((card) => (
                  <div key={card.label} className={`rounded-xl border px-4 py-3 ${card.bg}`}>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-1">{card.label}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-slate-600">{booking.notes}</p>
                </div>
              )}

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Computer-generated voucher · Generated on {format(new Date(), 'dd MMM yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}