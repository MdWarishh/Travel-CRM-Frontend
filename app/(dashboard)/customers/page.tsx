'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customersService } from '@/services/customers.service';
import { CustomerListParams } from '@/types/customer.types';
import { CustomerListHeader } from './_components/CustomerListHeader';
import { CustomerFilters } from './_components/CustomerFilters';
import { CustomerGrid } from './_components/CustomerGrid';
import { CreateCustomerModal } from './_components/CreateCustomerModal';

export default function CustomersPage() {
  const [params, setParams] = useState<CustomerListParams>({
    page: 1,
    limit: 12,
    sort: 'latest',
  });
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersService.getAll(params),
  });

  const updateParams = (updates: Partial<CustomerListParams>) => {
    setParams((prev) => ({ ...prev, ...updates, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <CustomerListHeader
          total={data?.pagination?.total}
          onCreateClick={() => setCreateOpen(true)}
        />

        <CustomerFilters params={params} onChange={updateParams} />

        <CustomerGrid
          customers={data?.data ?? []}
          isLoading={isLoading}
          pagination={data?.pagination}
          page={params.page ?? 1}
          onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
        />

        <CreateCustomerModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { setCreateOpen(false); refetch(); }}
        />
      </div>
    </div>
  );
}