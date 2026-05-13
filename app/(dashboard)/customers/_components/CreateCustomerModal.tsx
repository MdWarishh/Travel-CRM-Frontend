'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { customersService } from '@/services/customers.service';
import { CreateCustomerPayload } from '@/types/customer.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL: CreateCustomerPayload = {
  name: '', phone: '', email: '', city: '', country: '', notes: '',
};

export function CreateCustomerModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<CreateCustomerPayload>(INITIAL);

  const { mutate, isPending } = useMutation({
    mutationFn: () => customersService.create(form),
    onSuccess: () => {
      toast.success('Customer created');
      setForm(INITIAL);
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Something went wrong');
    },
  });

  const set = (field: keyof CreateCustomerPayload) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Customer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Full Name *</Label>
              <Input placeholder="Rahul Sharma" value={form.name} onChange={set('name')} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input placeholder="rahul@email.com" value={form.email} onChange={set('email')} />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input placeholder="Mumbai" value={form.city} onChange={set('city')} />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input placeholder="India" value={form.country} onChange={set('country')} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Notes</Label>
              <Textarea placeholder="Travel preferences, notes..." value={form.notes} onChange={set('notes')} rows={3} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !form.name || !form.phone}
          >
            {isPending ? 'Creating...' : 'Create Customer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}