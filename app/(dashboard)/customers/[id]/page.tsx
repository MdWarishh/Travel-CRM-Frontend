'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customersService } from '@/services/customers.service';
import { CustomerDetailHeader } from '../_components/CustomerDetailHeader';
import { CustomerStatsRow } from '../_components/CustomerStatsRow';
import { CustomerActionBar } from '../_components/CustomerActionBar';
import { CustomerTabs } from '../_components/CustomerTabs';
import { WhatsAppModal } from '../_components/WhatsAppModal';
import { EmailModal } from '../_components/EmailModal';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({ params }: Props) {
  const { id } = use(params);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const { data: customer, isLoading, refetch } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersService.getById(id),
  });

  const { data: timeline, isLoading: timelineLoading, refetch: refetchTimeline } = useQuery({
    queryKey: ['customer-timeline', id],
    queryFn: () => customersService.getTimeline(id),
    enabled: !!id,
  });

  if (isLoading) return <CustomerDetailSkeleton />;
  if (!customer) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky top section */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CustomerDetailHeader customer={customer} />
          <CustomerActionBar
            customer={customer}
            onWhatsApp={() => setWhatsappOpen(true)}
            onEmail={() => setEmailOpen(true)}
            onRefresh={refetch}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <CustomerStatsRow customer={customer} />

        <CustomerTabs
          customer={customer}
          timeline={timeline}
          timelineLoading={timelineLoading}
          onRefetch={() => { refetch(); refetchTimeline(); }}
        />
      </div>

      {/* Modals */}
      <WhatsAppModal
        open={whatsappOpen}
        customer={customer}
        onClose={() => setWhatsappOpen(false)}
        onSuccess={() => { setWhatsappOpen(false); refetchTimeline(); }}
      />
      <EmailModal
        open={emailOpen}
        customer={customer}
        onClose={() => setEmailOpen(false)}
        onSuccess={() => { setEmailOpen(false); refetchTimeline(); }}
      />
    </div>
  );
}

function CustomerDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}