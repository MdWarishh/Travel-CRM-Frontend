'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { User } from '@/types/users';

// ─── Schemas ──────────────────────────────────────────────────────────────────
// Single base schema — password is always optional at the type level.
// Validation (required vs optional) is enforced via superRefine per mode.

const formSchema = z.object({
  name: z.string().min(2, 'Minimum 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'AGENT', 'VENDOR']),
  department: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Runtime schema factories (called inside component so isEditing is in scope)
const makeSchema = (isEditing: boolean) =>
  formSchema.superRefine((data, ctx) => {
    if (!isEditing) {
      // Create mode: password required, min 8
      if (!data.password || data.password.trim().length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Password is required', path: ['password'] });
      } else if (data.password.length < 8) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Min 8 characters', path: ['password'] });
      }
    } else {
      // Edit mode: password optional, but if filled must be min 8
      if (data.password && data.password.length > 0 && data.password.length < 8) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Min 8 characters', path: ['password'] });
      }
    }
  });

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  user?: User | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserFormDialog({ open, user, isLoading, onClose, onSubmit }: Props) {
  const isEditing = !!user;

  const form = useForm<FormValues>({
    resolver: zodResolver(makeSchema(isEditing)),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'AGENT',
      department: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        user
          ? { name: user.name, email: user.email, phone: user.phone ?? '', password: '', role: user.role, department: user.department ?? '', status: user.status }
          : { name: '', email: '', phone: '', password: '', role: 'AGENT', department: '', status: 'ACTIVE' }
      );
    }
  }, [open, user, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? 'Edit User' : 'Add New User'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input placeholder="john@company.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone + Department */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+91-9999999999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Sales" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="AGENT">Agent</SelectItem>
                      <SelectItem value="VENDOR">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEditing ? 'New Password (leave blank to keep)' : 'Password *'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={isEditing ? '••••••••' : 'Min 8 chars, 1 uppercase, 1 number'}
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Toggle — div wrapper instead of FormItem className to avoid type error */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                    <div>
                    <div className="text-sm font-medium">
  <FormLabel>Active Status</FormLabel>
</div>
                      <p className="text-xs text-gray-500">User can login when active</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 'ACTIVE'}
                        onCheckedChange={(checked) => field.onChange(checked ? 'ACTIVE' : 'INACTIVE')}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}