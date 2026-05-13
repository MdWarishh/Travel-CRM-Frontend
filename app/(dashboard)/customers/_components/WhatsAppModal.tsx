'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { customersService } from '@/services/customers.service';
import { Customer, CommunicationTemplate } from '@/types/customer.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { resolveTemplate } from '@/lib/format';
import { MessageCircle, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  customer: Customer;
  onClose: () => void;
  onSuccess: () => void;
}

export function WhatsAppModal({ open, customer, onClose, onSuccess }: Props) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [message, setMessage] = useState('');

  // Fetch WhatsApp templates
  const { data: templates = [] } = useQuery({
    queryKey: ['templates', 'WHATSAPP'],
    queryFn: () => customersService.getTemplates('WHATSAPP'),
    enabled: open,
  });

  // Auto-select first default template on open
  useEffect(() => {
    if (open && templates.length > 0 && !selectedTemplateId) {
      const def = templates.find((t) => t.isDefault) ?? templates[0];
      setSelectedTemplateId(def.id);
      applyTemplate(def);
    }
  }, [open, templates]);

  // When template changes, resolve variables
  const applyTemplate = (template: CommunicationTemplate) => {
    const vars: Record<string, string> = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? '',
    };
    setMessage(resolveTemplate(template.body, vars));
  };

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const tpl = templates.find((t) => t.id === id);
    if (tpl) applyTemplate(tpl);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      customersService.sendWhatsApp({
        customerId: customer.id,
        message,
        templateId: selectedTemplateId || null,
      }),
    onSuccess: (data) => {
      // Open WhatsApp in new tab
      window.open(data.whatsappUrl, '_blank');
      toast.success('WhatsApp opened successfully');
      onSuccess();
    },
    onError: () => toast.error('Failed to send WhatsApp'),
  });

  const handleClose = () => {
    setSelectedTemplateId('');
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-green-600" />
            Send WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Recipient */}
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground text-xs">To: </span>
            <span className="font-medium">{customer.name}</span>
            <span className="text-muted-foreground ml-2">{customer.phone}</span>
          </div>

          {/* Template selector */}
          <div className="space-y-1.5">
            <Label className="text-xs">Template</Label>
            <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} {t.isDefault && '⭐'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Editable message */}
          <div className="space-y-1.5">
            <Label className="text-xs">Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              placeholder="Type your message..."
              className="resize-none text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              You can edit the message before sending. Variables like {`{{name}}`} are auto-filled.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => mutate()}
            disabled={!message.trim() || isPending}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}
            Open WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}