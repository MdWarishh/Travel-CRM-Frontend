'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Landmark, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AccountPayload, ItineraryAccount } from '@/types/itinerary.types';

interface Props {
  accounts: ItineraryAccount[];
  onSave: (accounts: AccountPayload[]) => Promise<void>;
  loading?: boolean;
}

type DraftAccount = AccountPayload & { _id: string };

export function AccountsManager({ accounts, onSave, loading }: Props) {
  const [drafts, setDrafts] = useState<DraftAccount[]>(
    accounts.map((a, i) => ({
      _id: `existing-${i}`,
      bankName: a.bankName ?? '',
      accountName: a.accountName ?? '',
      accountNumber: a.accountNumber ?? '',
      ifscCode: a.ifscCode ?? '',
      upiId: a.upiId ?? '',
      upiQrImageUrl: a.upiQrImageUrl ?? '',
      isDefault: a.isDefault,
    }))
  );

  const addAccount = () => {
    setDrafts((prev) => [
      ...prev,
      {
        _id: `new-${Date.now()}`,
        bankName: '',
        accountName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: '',
        upiQrImageUrl: '',
        isDefault: prev.length === 0,
      },
    ]);
  };

  const removeAccount = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d._id !== id));
  };

  const updateField = (id: string, key: keyof AccountPayload, value: string | boolean) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d._id !== id) return d;
        if (key === 'isDefault' && value === true) {
          // only one default allowed — we'll handle below
        }
        return { ...d, [key]: value };
      })
    );
  };

  const setDefault = (id: string) => {
    setDrafts((prev) =>
      prev.map((d) => ({ ...d, isDefault: d._id === id }))
    );
  };

  const handleSave = async () => {
    const payload = drafts.map(({ _id: _, ...rest }) => rest);
    await onSave(payload);
  };

  return (
    <Card className="border border-slate-200 shadow-none">
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Landmark className="h-4 w-4 text-slate-500" />
            Payment Accounts
          </CardTitle>
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addAccount}>
            <Plus className="h-3 w-3" /> Add Account
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        {drafts.length === 0 && (
          <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center">
            <Landmark className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No accounts added yet</p>
            <Button type="button" variant="ghost" size="sm" className="mt-2 h-7 text-xs" onClick={addAccount}>
              <Plus className="h-3 w-3 mr-1" /> Add your first account
            </Button>
          </div>
        )}

        {drafts.map((acc, idx) => (
          <div key={acc._id} className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Account {idx + 1}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDefault(acc._id)}
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                    acc.isDefault
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'text-slate-400 hover:text-amber-600'
                  }`}
                >
                  <Star className={`h-3 w-3 ${acc.isDefault ? 'fill-amber-400 text-amber-400' : ''}`} />
                  {acc.isDefault ? 'Default' : 'Set default'}
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => removeAccount(acc._id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'bankName', label: 'Bank Name', placeholder: 'e.g. HDFC Bank' },
                { key: 'accountName', label: 'Account Name', placeholder: 'Account holder name' },
                { key: 'accountNumber', label: 'Account Number', placeholder: '0000 0000 0000' },
                { key: 'ifscCode', label: 'IFSC Code', placeholder: 'HDFC0001234' },
                { key: 'upiId', label: 'UPI ID', placeholder: 'name@upi' },
                { key: 'upiQrImageUrl', label: 'UPI QR Image URL', placeholder: 'https://cloudinary.com/...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label className="text-xs font-medium text-slate-600 mb-1.5 block">{label}</Label>
                  <Input
                    value={(acc as any)[key]}
                    onChange={(e) => updateField(acc._id, key as keyof AccountPayload, e.target.value)}
                    placeholder={placeholder}
                    className="h-9 text-sm"
                  />
                </div>
              ))}
            </div>

            {/* QR preview */}
            {acc.upiQrImageUrl && (
              <div className="flex items-center gap-3 mt-1">
                <img
                  src={acc.upiQrImageUrl}
                  alt="QR"
                  className="h-16 w-16 object-contain border border-slate-200 rounded-lg"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                />
                <span className="text-xs text-slate-400">QR Preview</span>
              </div>
            )}
          </div>
        ))}

        {drafts.length > 0 && (
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white"
          >
            {loading ? 'Saving...' : 'Save Accounts'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}