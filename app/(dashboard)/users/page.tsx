'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { UserStatsCards } from './_components/UserStatsCards';
import { UserFilters } from './_components/UserFilters';
import { UserTable } from './_components/UserTable';
import { UserFormDialog } from './_components/UserFormDialog';
import { DeleteConfirmDialog } from './_components/DeleteConfirmDialog';
import { UserDetailSheet } from './_components/UserDetailSheet';
import { PermissionMatrixDialog } from './_components/PermissionMatrixDialog';
import { TablePagination } from './_components/TablePagination';

import { usersService, rolesService } from '@/services/user.service';
import { useAuthStore } from '@/store/auth.store';
import {
  User, UserStats, UserQueryParams, PaginationMeta, RolePermission,
  PermissionModule, PermissionAction, CreateUserPayload, UpdateUserPayload,
} from '@/types/users';

type FormValues = {
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'MANAGER' | 'AGENT' | 'VENDOR';
  department?: string;
  status: 'ACTIVE' | 'INACTIVE';
  password?: string;
};

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();

  // ─── Data State ───────────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<UserQueryParams>({ page: 1, limit: 20 });
  const [isLoading, setIsLoading] = useState(false);

  // ─── Dialog State ─────────────────────────────────────────────────────────
  const [formDialog, setFormDialog] = useState<{ open: boolean; user?: User | null }>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user?: User | null }>({ open: false });
  const [detailSheet, setDetailSheet] = useState<{ open: boolean; user?: User | null }>({ open: false });
  const [permDialog, setPermDialog] = useState<{
    open: boolean;
    user?: User | null;
    permissions?: RolePermission[];
  }>({ open: false });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPermSaving, setIsPermSaving] = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await usersService.getAll(filters);
      setUsers(res.data);
      setPagination(res.pagination);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchStats = async () => {
    try {
      const data = await usersService.getStats();
      setStats(data);
    } catch { /* non-blocking */ }
  };

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchStats(); }, []);

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  const handleCreate = async (data: FormValues) => {
    setIsSaving(true);
    try {
      await usersService.create(data as CreateUserPayload);
      toast.success('User created successfully');
      setFormDialog({ open: false });
      fetchUsers(); fetchStats();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to create user');
    } finally { setIsSaving(false); }
  };

  const handleUpdate = async (data: FormValues) => {
    if (!formDialog.user) return;
    setIsSaving(true);
    try {
      const { password, ...rest } = data;
      const payload: UpdateUserPayload = { ...rest };
      if (password && password.trim().length > 0) {
        (payload as UpdateUserPayload & { password: string }).password = password;
      }
      await usersService.update(formDialog.user.id, payload);
      toast.success('User updated successfully');
      setFormDialog({ open: false });
      fetchUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to update user');
    } finally { setIsSaving(false); }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const updated = await usersService.toggleStatus(user.id);
      toast.success(`${user.name} ${updated.status === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      fetchUsers(); fetchStats();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async () => {
    if (!deleteDialog.user) return;
    setIsDeleting(true);
    try {
      await usersService.delete(deleteDialog.user.id);
      toast.success('User deleted');
      setDeleteDialog({ open: false });
      fetchUsers(); fetchStats();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to delete user');
    } finally { setIsDeleting(false); }
  };

  // ─── Permission Handlers ──────────────────────────────────────────────────

  const handleOpenPermissions = async (user: User) => {
    setPermDialog({ open: true, user, permissions: undefined });
    try {
      const perms = await usersService.getPermissions(user.id);
      setPermDialog({ open: true, user, permissions: perms });
    } catch {
      toast.error('Failed to load permissions');
      setPermDialog({ open: false });
    }
  };

  const handleSavePermissions = async (
    perms: Array<{ module: PermissionModule; action: PermissionAction; allowed: boolean }>
  ) => {
    const { user } = permDialog;
    if (!user) return;

    setIsPermSaving(true);

    try {
      // ── Case 1: User ka customRoleId nahi hai (system role user) ──────────
      // Flow: custom role create → user ko assign → done
      // (permissions create time pe hi set ho jaate hain via createRoleSchema)
      if (!user.customRoleId) {
        toast.loading('Creating custom role...', { id: 'perm-toast' });

        // Step A: Custom role banao with permissions already included
        const newRole = await rolesService.create({
          name: `${user.name.replace(/\s+/g, '_')}_custom`,
          description: `Custom role for ${user.name}`,
          permissions: perms,
        });

        toast.loading('Assigning role to user...', { id: 'perm-toast' });

        // Step B: User ko naya customRoleId assign karo
        // Backend ke update endpoint pe customRoleId field bhejo
        await usersService.update(user.id, {
          customRoleId: newRole.id,
        } as unknown as UpdateUserPayload);

        toast.dismiss('perm-toast');
        toast.success('Permissions saved successfully!');

        // permDialog ka user update karo taaki agli baar edit pe customRoleId mile
        setPermDialog((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, customRoleId: newRole.id } : prev.user,
          open: false,
        }));

        fetchUsers();
        return;
      }

      // ── Case 2: customRoleId already hai — directly permissions update karo ─
      await rolesService.updatePermissions(user.customRoleId, { permissions: perms });
      toast.success('Permissions saved successfully');
      setPermDialog({ open: false });
      fetchUsers();

    } catch (err: unknown) {
      toast.dismiss('perm-toast');
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to save permissions');
    } finally {
      setIsPermSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage team members, roles, and access permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchUsers} disabled={isLoading} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setFormDialog({ open: true })} className="gap-2">
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      {stats && <UserStatsCards stats={stats} />}

      <Card className="border-0 shadow-sm">
        <div className="border-b border-gray-100 p-4">
          <UserFilters filters={filters} onChange={setFilters} />
        </div>
        <div className="p-1">
          <UserTable
            users={users}
            isLoading={isLoading}
            currentUserId={currentUser?.id}
            onView={(user) => setDetailSheet({ open: true, user })}
            onEdit={(user) => setFormDialog({ open: true, user })}
            onToggleStatus={handleToggleStatus}
            onDelete={(user) => setDeleteDialog({ open: true, user })}
            onViewPermissions={handleOpenPermissions}
          />
        </div>
        {pagination && (
          <div className="border-t border-gray-100 px-4 py-3">
            <TablePagination
              pagination={pagination}
              onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
            />
          </div>
        )}
      </Card>

      <UserFormDialog
        open={formDialog.open}
        user={formDialog.user}
        isLoading={isSaving}
        onClose={() => setFormDialog({ open: false })}
        onSubmit={formDialog.user ? handleUpdate : handleCreate}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        user={deleteDialog.user}
        isLoading={isDeleting}
        onClose={() => setDeleteDialog({ open: false })}
        onConfirm={handleDelete}
      />

      <UserDetailSheet
        open={detailSheet.open}
        user={detailSheet.user}
        onClose={() => setDetailSheet({ open: false })}
      />

      {/* readOnly completely hata diya — ab har user editable hai */}
      <PermissionMatrixDialog
        open={permDialog.open}
        roleName={permDialog.user?.name}
        permissions={permDialog.permissions ?? []}
        isLoading={permDialog.open && permDialog.permissions === undefined}
        isSaving={isPermSaving}
        onClose={() => setPermDialog({ open: false })}
        onSave={handleSavePermissions}
      />
    </div>
  );
}