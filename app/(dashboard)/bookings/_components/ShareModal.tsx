'use client';

import { useState, useEffect } from 'react';
import {
  MessageCircle, Mail, Loader2, Send, Copy,
  Check, Download, Phone, FileText, X,
  User, MapPin, Calendar, IndianRupee, Edit3, Eye,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { bookingsService } from '@/services/bookings.service';
import { Booking } from '@/types/booking';
import { toast } from 'sonner';
import api from '@/lib/api';

const WA_TYPES = [
  { value: 'TRIP_START', label: '🚀 Trip Start (Day Before)', desc: 'Sent the day before trip begins' },
  { value: 'DAILY',      label: '📅 Daily Update',            desc: 'Send during the trip each day' },
  { value: 'FINAL_DAY',  label: '🌟 Final Day',               desc: 'Last day of the trip' },
  { value: 'POST_TRIP',  label: '💌 Post Trip Feedback',      desc: 'Request review after trip' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  booking: Booking;
  defaultTab?: 'whatsapp' | 'email';
}

function BookingSummaryStrip({ booking }: { booking: Booking }) {
  const nights = booking.travelStart && booking.travelEnd
    ? Math.ceil((new Date(booking.travelEnd).getTime() - new Date(booking.travelStart).getTime()) / 86400000)
    : null;
  const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const balance = (booking.totalAmount ?? 0) - (booking.advancePaid ?? 0);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {booking.customer?.name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 truncate">{booking.customer?.name}</p>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            {booking.customer?.phone && (
              <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                <Phone className="h-2.5 w-2.5" />{booking.customer.phone}
              </span>
            )}
            {booking.customer?.email && (
              <span className="text-xs text-slate-400 truncate flex items-center gap-1">
                <Mail className="h-2.5 w-2.5" />{booking.customer.email}
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded-lg shrink-0">
          #{booking.id.slice(-8).toUpperCase()}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
        {[
          { icon: Calendar,    label: 'Travel',  value: booking.travelStart ? fmt(booking.travelStart) : '—', sub: nights ? `${nights}N ${nights + 1}D` : undefined },
          { icon: User,        label: 'Guests',  value: `${booking.adults ?? 0} Adults${booking.children ? `, ${booking.children} Child` : ''}`, sub: booking.childAge || undefined },
          { icon: IndianRupee, label: 'Total',   value: booking.totalAmount ? `₹${booking.totalAmount.toLocaleString('en-IN')}` : '—', sub: booking.advancePaid ? `Adv: ₹${booking.advancePaid.toLocaleString('en-IN')}` : undefined },
          { icon: MapPin,      label: 'Balance', value: booking.totalAmount ? `₹${Math.max(0, balance).toLocaleString('en-IN')}` : '—', sub: balance <= 0 ? '✓ Fully paid' : 'Pending' },
        ].map((item) => (
          <div key={item.label} className="px-3 py-2.5 flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
              <item.icon className="h-2.5 w-2.5" />{item.label}
            </div>
            <p className="text-xs font-bold text-slate-800 truncate">{item.value}</p>
            {item.sub && <p className="text-[10px] text-slate-400">{item.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShareModal({ open, onClose, booking, defaultTab = 'whatsapp' }: Props) {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email'>(defaultTab);

  useEffect(() => {
    if (open) setActiveTab(defaultTab);
  }, [open, defaultTab]);

  // WhatsApp state
  const [waType, setWaType]         = useState('TRIP_START');
  const [waPhone, setWaPhone]       = useState(booking.customer?.phone ?? '');
  const [waMessage, setWaMessage]   = useState('');
  const [waOriginal, setWaOriginal] = useState('');
  const [waLoading, setWaLoading]   = useState(false);
  const [waEditing, setWaEditing]   = useState(false);
  const [copied, setCopied]         = useState(false);

  // Email state
  const [emailTo, setEmailTo]           = useState(booking.customer?.email ?? '');
  const [emailPhone, setEmailPhone]     = useState(booking.customer?.phone ?? '');
  const [emailSubject, setEmailSubject] = useState(`Booking Confirmation — ${booking.customer?.name ?? ''}`);
  const [emailBody, setEmailBody]       = useState('');
  const [emailPdf, setEmailPdf]         = useState(true);
  const [emailSending, setEmailSending] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  // Load WA template
  useEffect(() => {
    if (!open || activeTab !== 'whatsapp') return;
    (async () => {
      try {
        setWaLoading(true);
        setWaEditing(false);
        const result = await bookingsService.getWhatsappMessage(booking.id, waType);
        setWaMessage(result.message);
        setWaOriginal(result.message);
        if (!waPhone && result.phone) setWaPhone(result.phone);
      } catch {
        toast.error('Failed to load message template');
      } finally {
        setWaLoading(false);
      }
    })();
  }, [open, waType, booking.id, activeTab]);

  // Auto-generate email body
  useEffect(() => {
    if (activeTab !== 'email' || emailBody) return;
    const nights = booking.travelStart && booking.travelEnd
      ? Math.ceil((new Date(booking.travelEnd).getTime() - new Date(booking.travelStart).getTime()) / 86400000)
      : null;
    const fmt = (d?: string | null) =>
      d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
    setEmailBody(
`Dear ${booking.customer?.name ?? 'Valued Customer'},

Thank you for booking with us! Here are your trip details:

📋 Booking ID: #${booking.id.slice(-8).toUpperCase()}
📅 Travel Dates: ${fmt(booking.travelStart)} → ${fmt(booking.travelEnd)}${nights ? ` (${nights}N ${nights + 1}D)` : ''}
👥 Guests: ${booking.adults ?? 0} Adults${booking.children ? `, ${booking.children} Child` : ''}
${booking.startDetails ? `🚀 Pickup: ${booking.startDetails}` : ''}
${booking.endDetails ? `🏁 Drop: ${booking.endDetails}` : ''}

💰 Total Amount: ₹${(booking.totalAmount ?? 0).toLocaleString('en-IN')}
${booking.advancePaid ? `✅ Advance Paid: ₹${booking.advancePaid.toLocaleString('en-IN')}` : ''}
${(booking.totalAmount ?? 0) - (booking.advancePaid ?? 0) > 0 ? `⏳ Balance Due: ₹${((booking.totalAmount ?? 0) - (booking.advancePaid ?? 0)).toLocaleString('en-IN')}` : ''}

Please find your booking voucher attached. For any queries, feel free to contact us.

Warm regards,
Your Travel Team`
    );
  }, [activeTab, booking]);

  const handleCopy = async () => {
    if (!waMessage) return;
    await navigator.clipboard.writeText(waMessage);
    setCopied(true);
    toast.success('Message copied!');
    setTimeout(() => setCopied(false), 2500);
  };

  // ✅ Single click → WhatsApp opens with full message pre-filled
  const handleSendWhatsApp = () => {
    if (!waMessage || !waPhone) return;
    const phone = waPhone.replace(/\D/g, '');
    const normalized = phone.startsWith('91') ? phone : `91${phone}`;
    window.open(`https://wa.me/${normalized}?text=${encodeURIComponent(waMessage)}`, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const handleDownloadPdf = async () => {
    try {
      setPdfDownloading(true);
      await bookingsService.downloadVoucher(booking.id);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Failed to download PDF');
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo) { toast.error('Email address is required'); return; }
    try {
      setEmailSending(true);
      await api.post(`/bookings/${booking.id}/send-email`, {
        to: emailTo,
        subject: emailSubject,
        body: emailBody || undefined,
        attachPdf: emailPdf,
      });
      toast.success(`Email sent to ${emailTo}${emailPdf ? ' with PDF' : ''}!`);
      onClose();
    } catch (e: unknown) {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Failed to send email'
      );
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full rounded-3xl p-0 overflow-hidden border-0 shadow-2xl gap-0">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <Send className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Share Booking</h2>
                <p className="text-xs text-slate-400">Send details via WhatsApp or Email</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <BookingSummaryStrip booking={booking} />

          {/* Tab switcher */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-[#25D366] text-white shadow-md shadow-green-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'email'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Mail className="h-4 w-4" /> Email
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto max-h-[55vh] px-6 py-5 space-y-5">

          {/* ══ WHATSAPP ══ */}
          {activeTab === 'whatsapp' && (
            <>
              {/* Message type selector */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Type</Label>
                <Select value={waType} onValueChange={setWaType}>
                  <SelectTrigger className="rounded-xl border-slate-200 h-11 text-sm font-medium bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WA_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-sm">
                        <p className="font-semibold">{t.label}</p>
                        <p className="text-xs text-slate-400">{t.desc}</p>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone number */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Send To (Phone)</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="tel"
                    placeholder="e.g. 9812345678"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    className="pl-10 rounded-xl border-slate-200 h-11 text-sm font-mono bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-400">+91 added automatically if not present</p>
              </div>

              {/* Message — editable */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</Label>
                  <div className="flex items-center gap-2">
                    {waEditing && waMessage !== waOriginal && (
                      <button
                        onClick={() => { setWaMessage(waOriginal); setWaEditing(false); }}
                        className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      onClick={() => setWaEditing((p) => !p)}
                      className={`flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 font-semibold transition-colors ${
                        waEditing ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {waEditing ? <Eye className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
                      {waEditing ? 'Preview' : 'Edit'}
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg px-2.5 py-1.5 font-semibold transition-colors"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {waLoading ? (
                  <div className="h-40 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                      <p className="text-xs text-slate-400">Loading template...</p>
                    </div>
                  </div>
                ) : waEditing ? (
                  <Textarea
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    className="rounded-2xl border-slate-200 text-sm font-sans leading-relaxed resize-none bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 min-h-[200px]"
                    rows={10}
                    autoFocus
                  />
                ) : (
                  <div className="relative bg-[#e9fbe9] border border-green-200 rounded-2xl p-5 min-h-[120px]">
                    <MessageCircle className="absolute top-3 right-3 h-4 w-4 text-green-300" />
                    <pre className="text-sm text-slate-800 whitespace-pre-wrap font-sans leading-[1.7] pr-6">
                      {waMessage}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══ EMAIL ══ */}
          {activeTab === 'email' && (
            <>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  To (Email) <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type="email" placeholder="customer@example.com" value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="pl-10 rounded-xl border-slate-200 h-11 text-sm bg-white" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type="tel" value={emailPhone} onChange={(e) => setEmailPhone(e.target.value)}
                    className="pl-10 rounded-xl border-slate-200 h-11 text-sm font-mono bg-white" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</Label>
                <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
                  className="rounded-xl border-slate-200 h-11 text-sm bg-white" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Body</Label>
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">editable</span>
                </div>
                <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)}
                  className="rounded-xl border-slate-200 text-sm resize-none bg-white leading-relaxed focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                  rows={10} />
              </div>

              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Attach PDF Voucher</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {emailPdf ? `booking-voucher-${booking.id.slice(-8).toUpperCase()}.pdf will be attached` : 'PDF will not be attached'}
                    </p>
                  </div>
                </div>
                <Switch checked={emailPdf} onCheckedChange={setEmailPdf} />
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Send Summary</p>
                {[
                  { label: 'To',      value: emailTo || '—' },
                  { label: 'Subject', value: emailSubject },
                  { label: 'PDF',     value: emailPdf ? '✓ Will be attached' : '✗ Not attached' },
                  { label: 'Guest',   value: `${booking.customer?.name ?? '—'} · ${booking.adults ?? 0} Adults` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="text-slate-400 w-16 shrink-0 text-xs font-bold">{row.label}</span>
                    <span className="text-slate-700 truncate text-sm">{row.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white">
          {activeTab === 'whatsapp' ? (
            <div className="flex gap-3">
              {/* Copy message */}
              <button
                onClick={handleCopy}
                disabled={!waMessage}
                className="h-12 px-4 rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-40 shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>

              {/* ONE CLICK → WhatsApp opens with message ready to send */}
              <button
                onClick={handleSendWhatsApp}
                disabled={!waMessage || !waPhone}
                className="flex-1 h-12 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-200/60 disabled:opacity-40"
              >
                <MessageCircle className="h-5 w-5" />
                Share on WhatsApp
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleDownloadPdf}
                disabled={pdfDownloading}
                className="h-12 px-5 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold flex items-center gap-2 transition-all shrink-0 disabled:opacity-40"
              >
                {pdfDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                PDF
              </button>
              <button
                onClick={handleSendEmail}
                disabled={emailSending || !emailTo}
                className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200/60 disabled:opacity-40"
              >
                {emailSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {emailSending ? 'Sending...' : `Send Email${emailPdf ? ' + PDF' : ''}`}
              </button>
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}