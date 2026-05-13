// app/invoice/_components/InvoiceStatusBadge.tsx

import { InvoiceStatus } from '@/types/invoice';
import { STATUS_CONFIG } from '@/lib/invoiceUtils';
import { cn } from '@/lib/utils';

interface Props {
  status: InvoiceStatus;
  size?: 'sm' | 'md';
}

export function InvoiceStatusBadge({ status, size = 'md' }: Props) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        cfg.color, cfg.bg, cfg.border,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}