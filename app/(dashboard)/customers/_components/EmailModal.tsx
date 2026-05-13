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
import { Input } from '@/components/ui/input';
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
import { Mail, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  customer: Customer;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmailModal({ open, customer, onClose, onSuccess }: Props) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Fetch email templates
  const { data: templates = [] } = useQuery({
    queryKey: ['templates', 'EMAIL'],
    queryFn: () => customersService.getTemplates('EMAIL'),
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

  const applyTemplate = (template: CommunicationTemplate) => {
    const vars: Record<string, string> = {
      name: customer.name,
      email: customer.email ?? '',
      phone: customer.phone,
    };
    setSubject(template.subject ? resolveTemplate(template.subject, vars) : '');
    setBody(resolveTemplate(template.body, vars));
  };

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const tpl = templates.find((t) => t.id === id);
    if (tpl) applyTemplate(tpl);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      customersService.sendEmail({
        customerId: customer.id,
        subject,
        message: body,
        templateId: selectedTemplateId || null,
      } as any),
    onSuccess: () => {
      toast.success('Email sent successfully');
      onSuccess();
    },
    onError: () => toast.error('Failed to send email'),
  });

  const handleClose = () => {
    setSelectedTemplateId('');
    setSubject('');
    setBody('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600" />
            Send Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Recipient */}
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground text-xs">To: </span>
            <span className="font-medium">{customer.name}</span>
            {customer.email ? (
              <span className="text-muted-foreground ml-2">{customer.email}</span>
            ) : (
              <span className="text-destructive text-xs ml-2">No email on file</span>
            )}
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

          {/* Subject */}
          <div className="space-y-1.5">
            <Label className="text-xs">Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label className="text-xs">Message</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="Type your message..."
              className="resize-none text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              Variables like {`{{name}}`} are auto-filled from customer data.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            className="gap-2"
            onClick={() => mutate()}
            disabled={!subject.trim() || !body.trim() || !customer.email || isPending}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}