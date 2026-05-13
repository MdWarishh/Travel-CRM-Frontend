'use client';

import { useState, useEffect } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ALL_MODULES, ALL_ACTIONS, MODULE_LABELS,
  PermissionModule, PermissionAction, RolePermission,
} from '@/types/users';

interface Props {
  open: boolean;
  roleName?: string;
  permissions?: RolePermission[];
  isLoading?: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (perms: Array<{ module: PermissionModule; action: PermissionAction; allowed: boolean }>) => void;
}

type Matrix = Record<PermissionModule, Record<PermissionAction, boolean>>;

function buildMatrix(permissions: RolePermission[]): Matrix {
  const matrix = {} as Matrix;
  for (const mod of ALL_MODULES) {
    matrix[mod] = { view: false, create: false, edit: false, delete: false };
  }
  for (const p of permissions) {
    if (matrix[p.module as PermissionModule]) {
      matrix[p.module as PermissionModule][p.action as PermissionAction] = p.allowed;
    }
  }
  return matrix;
}

function flattenMatrix(matrix: Matrix) {
  const result: Array<{ module: PermissionModule; action: PermissionAction; allowed: boolean }> = [];
  for (const mod of ALL_MODULES) {
    for (const action of ALL_ACTIONS) {
      result.push({ module: mod, action, allowed: matrix[mod][action] });
    }
  }
  return result;
}

const ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete',
};

export function PermissionMatrixDialog({
  open, roleName, permissions = [], isLoading, isSaving, onClose, onSave,
}: Props) {
  const [matrix, setMatrix] = useState<Matrix>(() => buildMatrix([]));

  useEffect(() => {
    if (open) setMatrix(buildMatrix(permissions));
  }, [open, permissions]);

  const toggle = (mod: PermissionModule, action: PermissionAction) => {
    setMatrix((prev) => ({
      ...prev,
      [mod]: { ...prev[mod], [action]: !prev[mod][action] },
    }));
  };

  const toggleRow = (mod: PermissionModule) => {
    const allOn = ALL_ACTIONS.every((a) => matrix[mod][a]);
    setMatrix((prev) => ({
      ...prev,
      [mod]: Object.fromEntries(ALL_ACTIONS.map((a) => [a, !allOn])) as Record<PermissionAction, boolean>,
    }));
  };

  const toggleCol = (action: PermissionAction) => {
    const allOn = ALL_MODULES.every((m) => matrix[m][action]);
    const updated = { ...matrix };
    for (const mod of ALL_MODULES) {
      updated[mod] = { ...updated[mod], [action]: !allOn };
    }
    setMatrix(updated);
  };

  const allSelected = ALL_MODULES.every((mod) => ALL_ACTIONS.every((a) => matrix[mod][a]));
  const someSelected = !allSelected && ALL_MODULES.some((mod) => ALL_ACTIONS.some((a) => matrix[mod][a]));

  const toggleSelectAll = () => {
    const newVal = !allSelected;
    const updated = {} as Matrix;
    for (const mod of ALL_MODULES) {
      updated[mod] = Object.fromEntries(ALL_ACTIONS.map((a) => [a, newVal])) as Record<PermissionAction, boolean>;
    }
    setMatrix(updated);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Permission Matrix</DialogTitle>
              {roleName && (
                <p className="text-xs text-gray-500">
                  Editing permissions for{' '}
                  <span className="font-medium text-gray-700">{roleName}</span>
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                        onCheckedChange={toggleSelectAll}
                      />
                      <span>Module</span>
                    </div>
                  </th>
                  {ALL_ACTIONS.map((action) => (
                    <th key={action} className="px-3 py-3 text-center">
                      <button
                        onClick={() => toggleCol(action)}
                        className="rounded px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                        title={`Toggle all ${action}`}
                      >
                        {ACTION_LABELS[action]}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_MODULES.map((mod, idx) => {
                  const rowAllOn = ALL_ACTIONS.every((a) => matrix[mod][a]);
                  return (
                    <tr
                      key={mod}
                      className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-indigo-50/30`}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleRow(mod)}
                          className="flex items-center gap-2 font-medium text-gray-800 hover:text-indigo-600"
                          title="Toggle all actions for this module"
                        >
                          {MODULE_LABELS[mod]}
                          {rowAllOn && (
                            <Badge className="bg-indigo-100 text-[10px] text-indigo-600 hover:bg-indigo-100">
                              Full
                            </Badge>
                          )}
                        </button>
                      </td>
                      {ALL_ACTIONS.map((action) => (
                        <td key={action} className="px-3 py-3 text-center">
                          <Switch
                            checked={matrix[mod][action]}
                            onCheckedChange={() => toggle(mod, action)}
                            className="mx-auto"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-gray-400">
          💡 Header checkbox = select all · Column header = toggle column · Row name = toggle row
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(flattenMatrix(matrix))} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}