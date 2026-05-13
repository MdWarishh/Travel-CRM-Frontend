'use client';

import { Customer } from '@/types/customer.types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn, getInitials } from '@/lib/utils';

const TAG_STYLES: Record<string, string> = {
  VIP: 'bg-amber-50 text-amber-700 border-amber-200',
  Repeat: 'bg-blue-50 text-blue-700 border-blue-200',
  New: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

interface Props {
  customer: Customer;
}

export function CustomerDetailHeader({ customer }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 py-4">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => router.push('/customers')}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {getInitials(customer.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-lg font-semibold leading-tight">{customer.name}</h1>
          {customer.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded border',
                TAG_STYLES[tag] ?? 'bg-muted text-muted-foreground border-border'
              )}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-0.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {customer.phone}
          </span>
          {customer.email && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              {customer.email}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}