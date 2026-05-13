'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadStagesService } from '@/services/leads.service';
import { LeadStage } from '@/types/leads.types';
import api from '@/lib/api';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Upload, Download, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

interface ImportLeadModalProps {
  open: boolean;
  onClose: () => void;
}

// Sample CSV download template
const downloadTemplate = () => {
  const headers = [
    'name', 'phone', 'email', 'source', 'priority',
    'destination', 'estimatedBudget', 'travelDate', 'numberOfTravelers', 'notes',
  ];
  const sample = [
    'Rahul Sharma', '+919876543210', 'rahul@email.com', 'WEBSITE', 'WARM',
    'Goa', '50000', '2025-12-01', '4', 'Interested in beach package',
  ];
  const csv = [headers.join(','), sample.join(',')].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leads_import_template.csv';
  a.click();
  URL.revokeObjectURL(url);
};

export function ImportLeadModal({ open, onClose }: ImportLeadModalProps) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile]                   = useState<File | null>(null);
  const [source, setSource]               = useState('MANUAL');
  const [priority, setPriority]           = useState('WARM');
  const [stageId, setStageId]             = useState('');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  const { data: stages = [] } = useQuery<LeadStage[]>({
    queryKey: ['lead-stages'],
    queryFn: leadStagesService.getAll,
    enabled: open,
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith('.csv') && !f.name.endsWith('.xlsx')) {
      toast.error('Only CSV or XLSX files are supported');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) {
      const fakeEvent = { target: { files: [f] } } as any;
      handleFile(fakeEvent);
    }
  };

  const handleImport = async () => {
    if (!file) { toast.error('Please select a file first'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source', source);
      formData.append('priority', priority);
      if (stageId) formData.append('stageId', stageId);
      formData.append('removeDuplicates', String(removeDuplicates));

      const res = await api.post('/leads/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data);
      qc.invalidateQueries({ queryKey: ['leads-pipeline'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success(`${res.data.data.imported} leads imported successfully`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Import failed. Please check your file format.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setSource('MANUAL');
    setPriority('WARM');
    setStageId('');
    setRemoveDuplicates(true);
    onClose();
  };

  const SOURCES = [
    { value: 'MANUAL', label: 'Manual' }, { value: 'WEBSITE', label: 'Website' },
    { value: 'WHATSAPP', label: 'WhatsApp' }, { value: 'FACEBOOK', label: 'Facebook' },
    { value: 'INSTAGRAM', label: 'Instagram' }, { value: 'PHONE', label: 'Phone' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-[95vw] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #2d2d7a 0%, #3d3d8f 100%)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg font-bold">Import Leads</DialogTitle>
                <p className="text-white/60 text-xs mt-0.5">Upload CSV or Excel file</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="w-8 h-8 text-white/60 hover:text-white hover:bg-white/15 rounded-xl"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-white">

          {/* Download Template */}
          <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-indigo-700">Need the format?</p>
              <p className="text-[11px] text-indigo-500 mt-0.5">Download sample CSV template</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadTemplate}
              className="h-8 text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-100 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Format
            </Button>
          </div>

          {/* File Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
              file
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50',
            )}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFile}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-700 truncate max-w-[220px]">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="ml-auto text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500">Drop file here or click to browse</p>
                <p className="text-[11px] text-slate-400 mt-1">CSV or XLSX • Max 500 records • Max 5MB</p>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Default Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="border-slate-200 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Default Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="border-slate-200 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOT">🔥 Hot</SelectItem>
                  <SelectItem value="WARM">⚡ Warm</SelectItem>
                  <SelectItem value="COLD">❄️ Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stage */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Default Stage (Optional)</Label>
            <Select value={stageId} onValueChange={setStageId}>
              <SelectTrigger className="border-slate-200 h-9 text-sm">
                <SelectValue placeholder="Auto (first stage)" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remove Duplicates */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-sm font-medium text-slate-700">Remove Duplicate Records</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Skip leads with same phone number</p>
            </div>
            <Switch checked={removeDuplicates} onCheckedChange={setRemoveDuplicates} />
          </div>

          {/* Notes */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Notes
            </p>
            <ul className="text-[11px] text-amber-600 space-y-1 list-disc list-inside">
              <li>Import max 500 records at a time</li>
              <li>Country code is required with contact numbers</li>
              <li>Use <code className="bg-amber-100 px-1 rounded">YYYY-MM-DD</code> format for dates</li>
              <li>Priority values: HOT, WARM, COLD</li>
              <li>Source values: WEBSITE, MANUAL, WHATSAPP, FACEBOOK, INSTAGRAM, PHONE, OTHER</li>
            </ul>
          </div>

          {/* Result */}
          {result && (
            <div className={cn(
              'p-4 rounded-xl border',
              result.errors.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200',
            )}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-semibold text-slate-700">Import Complete</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white rounded-lg p-2 text-center border border-emerald-200">
                  <p className="text-lg font-bold text-emerald-600">{result.imported}</p>
                  <p className="text-slate-500">Imported</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-amber-200">
                  <p className="text-lg font-bold text-amber-500">{result.skipped}</p>
                  <p className="text-slate-500">Skipped</p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-red-600 mb-1">Errors:</p>
                  <ul className="text-[11px] text-red-500 space-y-0.5 list-disc list-inside max-h-20 overflow-y-auto">
                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex-shrink-0 gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading} className="h-9">
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>
              ) : (
                <><Upload className="w-4 h-4" /> Import Leads</>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}