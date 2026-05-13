'use client';
// app/(dashboard)/reports/page.tsx

import { useState } from 'react';
import { TrendingUp, RefreshCw, Calendar, CreditCard, UserCheck } from 'lucide-react';
import { ReportHeader }   from './_components/ReportHeader';
import { LeadsTab }       from './_components/LeadsTab';
import { ConversionsTab } from './_components/ConversionsTab';
import { BookingsTab }    from './_components/BookingsTab';
import { PaymentsTab }    from './_components/PaymentsTab';
import { AgentsTab }      from './_components/AgentsTab';

type TabKey = 'leads' | 'conversions' | 'bookings' | 'payments' | 'agents';

const TABS = [
  { key: 'leads'       as TabKey, label: 'Lead Report',        icon: TrendingUp  },
  { key: 'conversions' as TabKey, label: 'Conversions',        icon: RefreshCw   },
  { key: 'bookings'    as TabKey, label: 'Bookings',           icon: Calendar    },
  { key: 'payments'    as TabKey, label: 'Payments',           icon: CreditCard  },
  { key: 'agents'      as TabKey, label: 'Agent Performance',  icon: UserCheck   },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('leads');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Only pass non-empty values to avoid sending empty query params
  const params = Object.fromEntries(
    Object.entries(dateRange).filter(([, v]) => Boolean(v))
  ) as Record<string, string>;

  return (
    <div className="space-y-5 pb-10">
      {/* Page header + date filter */}
      <ReportHeader dateRange={dateRange} onChange={setDateRange} />

      {/* Tab navigation */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all
              ${activeTab === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'}
            `}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div className="min-h-[400px]">
        {activeTab === 'leads'       && <LeadsTab       params={params} />}
        {activeTab === 'conversions' && <ConversionsTab params={params} />}
        {activeTab === 'bookings'    && <BookingsTab    params={params} />}
        {activeTab === 'payments'    && <PaymentsTab    params={params} />}
        {activeTab === 'agents'      && <AgentsTab      params={params} />}
      </div>
    </div>
  );
}