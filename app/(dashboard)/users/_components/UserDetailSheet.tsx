'use client';

import { format } from 'date-fns';
import { Phone, Mail, Building2, Calendar, Clock, ShieldCheck } from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, ROLE_COLORS, STATUS_COLORS } from '@/types/users';

interface Props {
  open: boolean;
  user?: User | null;
  onClose: () => void;
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-gray-100">
        <Icon className="h-3.5 w-3.5 text-gray-500" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export function UserDetailSheet({ open, user, onClose }: Props) {
  if (!user) return null;

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] overflow-y-auto sm:w-[480px]">
        <SheetHeader className="mb-6">
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>

        {/* Profile Header */}
        <div className="mb-6 flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-gray-100">
            <AvatarImage src={user.profileImage ?? undefined} />
            <AvatarFallback className="bg-indigo-50 text-xl font-semibold text-indigo-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline" className={`text-xs ${ROLE_COLORS[user.role]}`}>
                {user.role}
              </Badge>
              <Badge variant="outline" className={`text-xs ${STATUS_COLORS[user.status]}`}>
                <span className={`mr-1 h-1.5 w-1.5 rounded-full inline-block ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                {user.status}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Details Grid */}
        <div className="space-y-4">
          <Row icon={Phone} label="Phone" value={user.phone} />
          <Row icon={Mail} label="Email" value={user.email} />
          <Row icon={Building2} label="Department" value={user.department} />
          <Row icon={ShieldCheck} label="Role" value={user.role} />
          <Row
            icon={Calendar}
            label="Member Since"
            value={format(new Date(user.createdAt), 'dd MMM yyyy')}
          />
          <Row
            icon={Clock}
            label="Last Login"
            value={user.lastLogin ? format(new Date(user.lastLogin), 'dd MMM yyyy, hh:mm a') : 'Never logged in'}
          />
        </div>

        {user._count && (
          <>
            <Separator className="my-6" />
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Assignments
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Leads', value: user._count.assignedLeads },
                  { label: 'Customers', value: user._count.assignedCustomers },
                  { label: 'Tasks', value: user._count.assignedTasks },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-gray-50 p-3 text-center">
                    <p className="text-xl font-bold text-gray-900">{item.value}</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}