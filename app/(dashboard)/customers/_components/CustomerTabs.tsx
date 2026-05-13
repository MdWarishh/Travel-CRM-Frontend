'use client';

import { Customer, CustomerTimeline } from '@/types/customer.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingsTab } from './BookingsTab';
import { ItinerariesTab } from './ItinerariesTab';
import { PaymentsTab } from './PaymentsTab';
import { NotesTab } from './NotesTab';
import { ActivityTab } from './ActivityTab';
import { OverviewTab } from './OverviewTab';

interface Props {
  customer: Customer;
  timeline?: CustomerTimeline;
  timelineLoading: boolean;
  onRefetch: () => void;
}

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'bookings', label: 'Bookings' },
  { value: 'itineraries', label: 'Itineraries' },
  { value: 'payments', label: 'Payments' },
  { value: 'notes', label: 'Notes' },
  { value: 'activity', label: 'Activity' },
];

export function CustomerTabs({ customer, timeline, timelineLoading, onRefetch }: Props) {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="bg-muted/50 h-9">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-4">
        <TabsContent value="overview" className="m-0">
          <OverviewTab customer={customer} timeline={timeline} isLoading={timelineLoading} />
        </TabsContent>

        <TabsContent value="bookings" className="m-0">
          <BookingsTab
            bookings={timeline?.bookings ?? []}
            isLoading={timelineLoading}
            customerId={customer.id}
          />
        </TabsContent>

        <TabsContent value="itineraries" className="m-0">
          <ItinerariesTab
            itineraries={timeline?.itineraries ?? []}
            isLoading={timelineLoading}
            customerId={customer.id}
          />
        </TabsContent>

        <TabsContent value="payments" className="m-0">
          <PaymentsTab
            payments={timeline?.payments ?? []}
            summary={timeline?.paymentSummary}
            isLoading={timelineLoading}
          />
        </TabsContent>

        <TabsContent value="notes" className="m-0">
          <NotesTab customerId={customer.id} onRefetch={onRefetch} />
        </TabsContent>

        <TabsContent value="activity" className="m-0">
          <ActivityTab
            logs={timeline?.activityLogs ?? []}
            isLoading={timelineLoading}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}