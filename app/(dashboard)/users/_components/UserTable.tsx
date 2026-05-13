'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  MoreHorizontal, Eye, Pencil, Power, Trash2, ShieldCheck, Clock,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { User, ROLE_COLORS, STATUS_COLORS } from '@/types/users';

interface Props {
  users: User[];
  isLoading?: boolean;
  currentUserId?: string;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (user: User) => void;
  onViewPermissions: (user: User) => void;
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function UserTable({
  users, isLoading, currentUserId, onView, onEdit, onToggleStatus, onDelete, onViewPermissions,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <ShieldCheck className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900">No users found</p>
        <p className="mt-1 text-xs text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
            <TableHead className="pl-5 font-semibold text-gray-700">User</TableHead>
            <TableHead className="font-semibold text-gray-700">Role</TableHead>
            <TableHead className="font-semibold text-gray-700">Department</TableHead>
            <TableHead className="font-semibold text-gray-700">Status</TableHead>
            <TableHead className="font-semibold text-gray-700">Last Login</TableHead>
            <TableHead className="font-semibold text-gray-700">Assigned</TableHead>
            <TableHead className="pr-5 text-right font-semibold text-gray-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <TableRow key={user.id} className="group border-gray-100 hover:bg-gray-50/50">
                {/* User Info */}
                <TableCell className="pl-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-gray-200">
                      <AvatarImage src={user.profileImage ?? undefined} />
                      <AvatarFallback className="bg-indigo-50 text-xs font-medium text-indigo-700">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        {isSelf && (
                          <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{user.email}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Role */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${ROLE_COLORS[user.role]}`}
                  >
                    {user.role}
                  </Badge>
                </TableCell>

                {/* Department */}
                <TableCell>
                  <span className="text-sm text-gray-600">{user.department ?? '—'}</span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${STATUS_COLORS[user.status]}`}
                  >
                    <span
                      className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${
                        user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                    />
                    {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>

                {/* Last Login */}
                <TableCell>
                  {user.lastLogin ? (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {format(new Date(user.lastLogin), 'dd MMM, hh:mm a')}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Never</span>
                  )}
                </TableCell>

                {/* Assigned Count */}
                <TableCell>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span title="Leads">{user._count?.assignedLeads ?? 0}L</span>
                    <span>/</span>
                    <span title="Customers">{user._count?.assignedCustomers ?? 0}C</span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="pr-5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onView(user)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewPermissions(user)}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Permissions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={isSelf}
                        onClick={() => onToggleStatus(user)}
                        className={user.status === 'ACTIVE' ? 'text-amber-600' : 'text-emerald-600'}
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={isSelf}
                        onClick={() => onDelete(user)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}