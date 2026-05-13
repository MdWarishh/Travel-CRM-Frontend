'use client';

import { Loader2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { User } from '@/types/users';

interface Props {
  open: boolean;
  user?: User | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ open, user, isLoading, onClose, onConfirm }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-gray-600">
            You are about to delete{' '}
            <span className="font-semibold text-gray-900">{user?.name}</span> (
            {user?.email}). This action cannot be undone.
            <br />
            <br />
            <span className="text-amber-600">
              ⚠️ Users with active lead or customer assignments cannot be deleted.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}