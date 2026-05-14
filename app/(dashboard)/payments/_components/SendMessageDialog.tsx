'use client';

import { useState, useEffect } from 'react';
import { Loader2, MessageCircle, Mail, Paperclip } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Payment, CommunicationChannel } from '@/types/payment';
import { unifiedPaymentService as paymentsService } from '@/services/payments.service';
import { toast } from 'sonner';

type Mode = 'reminder' | 'confirmation';

interface SendMessageDialogProps {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  payment: Payment | null;
}

export function SendMessageDialog({ open, onClose, mode, payment }: SendMessageDialogProps) {
  const [channel, setChannel] = useState<CommunicationChannel>('WHATSAPP');
  const [message, setMessage] = useState('');
  const [attachReceipt, setAttachReceipt] = useState(true);
  const [attachInvoice, setAttachInvoice] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load preview message
  useEffect(() => {
    if (!open || !payment) return;
    setIsPreviewLoading(true);

    const load = async () => {
      try {
        if (mode === 'reminder' && payment.bookingId) {
          const data = await paymentsService.previewReminder(payment.bookingId);
          setMessage(data?.message ?? '');
        } else if (mode === 'confirmation') {
          const data = await paymentsService.previewConfirmation(payment.id);
          setMessage(data?.message ?? '');
        }
      } catch {
        // silent
      } finally {
        setIsPreviewLoading(false);
      }
    };

    load();
  }, [open, payment, mode]);

  const handleSend = async () => {
    if (!payment) return;
    setIsSending(true);
    try {
      if (mode === 'reminder' && payment.bookingId) {
        await paymentsService.sendReminder({
          bookingId: payment.bookingId,
          channel,
          message,
          attachInvoice,
          attachReceipt,
          paymentId: payment.id,
        });
      } else {
        await paymentsService.sendConfirmation({
          paymentId: payment.id,
          channel,
          message,
          attachReceipt,
        });
      }
      toast.success(`${mode === 'reminder' ? 'Reminder' : 'Confirmation'} sent via ${channel}`);
      onClose();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {mode === 'reminder' ? '🔔 Send Payment Reminder' : '✅ Send Payment Confirmation'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Channel */}
          <div className="space-y-1.5">
            <Label className="text-xs">Send Via</Label>
            <Tabs value={channel} onValueChange={(v) => setChannel(v as CommunicationChannel)}>
              <TabsList className="h-9 w-full">
                <TabsTrigger value="WHATSAPP" className="flex-1 text-xs gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </TabsTrigger>
                <TabsTrigger value="EMAIL" className="flex-1 text-xs gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Customer info */}
          {payment?.customer && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                {payment.customer.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-medium">{payment.customer.name}</p>
                <p className="text-[11px] text-muted-foreground">{payment.customer.phone}</p>
              </div>
            </div>
          )}

          {/* Editable message */}
          <div className="space-y-1.5">
            <Label className="text-xs">Message <span className="text-muted-foreground">(editable)</span></Label>
            {isPreviewLoading ? (
              <div className="h-24 rounded-md border border-border/50 bg-muted/30 animate-pulse" />
            ) : (
              <Textarea
                className="text-sm min-h-[100px] resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <Paperclip className="w-3 h-3" /> Attachments
            </Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Attach payment receipt</span>
                <Switch checked={attachReceipt} onCheckedChange={setAttachReceipt} />
              </div>
              {mode === 'reminder' && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Attach invoice</span>
                  <Switch checked={attachInvoice} onCheckedChange={setAttachInvoice} />
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSend} disabled={isSending || !message}>
            {isSending && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
            Send {channel === 'WHATSAPP' ? 'WhatsApp' : 'Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}