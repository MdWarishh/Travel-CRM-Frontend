'use client';

import { Customer } from '@/types/customer.types';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  Mail,
  FileText,
  PlusCircle,
  CalendarPlus,
  MoreHorizontal,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  customer: Customer;
  onWhatsApp: () => void;
  onEmail: () => void;
  onRefresh: () => void;
}

export function CustomerActionBar({ customer, onWhatsApp, onEmail }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-none">
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 shrink-0"
        onClick={() => router.push(`/itineraries/create?customerId=${customer.id}`)}
      >
        <CalendarPlus className="h-3.5 w-3.5" />
        Itinerary
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 shrink-0"
        onClick={() => router.push(`/bookings/create?customerId=${customer.id}`)}
      >
        <PlusCircle className="h-3.5 w-3.5" />
        Booking
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 shrink-0 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
        onClick={onWhatsApp}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        WhatsApp
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 shrink-0"
        onClick={onEmail}
      >
        <Mail className="h-3.5 w-3.5" />
        Email
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/customers/${customer.id}/edit`)}>
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileText className="h-3.5 w-3.5 mr-2" />
            Share PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}