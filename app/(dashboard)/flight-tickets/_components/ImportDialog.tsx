'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ticketImportService } from '@/services/ticket.service';
import type { BulkImportResult, ImportType, ImportSource } from '@/types/ticket.types';

const SELLER_FIELDS = [
  { key: 'brokerName', label: 'Broker Name', required: true },
  { key: 'phone', label: 'Phone', required: true },
  { key: 'fromCity', label: 'From City', required: true },
  { key: 'toCity', label: 'To City', required: true },
  { key: 'travelDate', label: 'Travel Date (YYYY-MM-DD)', required: true },
  { key: 'departureTime', label: 'Departure Time (HH:MM)', required: true },
  { key: 'arrivalTime', label: 'Arrival Time (HH:MM)', required: true },
  { key: 'seatsAvailable', label: 'Seats Available', required: true },
  { key: 'pricePerSeat', label: 'Price Per Seat', required: true },
  { key: 'airline', label: 'Airline', required: false },
  { key: 'flightNumber', label: 'Flight Number', required: false },
  { key: 'pnr', label: 'PNR', required: false },
  { key: 'purchasePrice', label: 'Purchase Price', required: false },
  { key: 'notes', label: 'Notes', required: false },
];

const BUYER_FIELDS = [
  { key: 'brokerName', label: 'Broker Name', required: true },
  { key: 'phone', label: 'Phone', required: true },
  { key: 'fromCity', label: 'From City', required: true },
  { key: 'toCity', label: 'To City', required: true },
  { key: 'travelDate', label: 'Travel Date (YYYY-MM-DD)', required: true },
  { key: 'preferredTimeFrom', label: 'Preferred Time From (HH:MM)', required: true },
  { key: 'preferredTimeTo', label: 'Preferred Time To (HH:MM)', required: true },
  { key: 'seatsRequired', label: 'Seats Required', required: true },
  { key: 'budgetPerSeat', label: 'Budget Per Seat', required: true },
  { key: 'passengerNames', label: 'Passenger Names', required: false },
  { key: 'notes', label: 'Notes', required: false },
];

const CSV_SELLER_SAMPLE = `brokerName,phone,fromCity,toCity,travelDate,departureTime,arrivalTime,seatsAvailable,pricePerSeat,airline,flightNumber,pnr
Rajesh Sharma,9876543210,Delhi,Mumbai,2026-06-15,06:30,08:45,4,8500,IndiGo,6E-234,ABC123
Sunita Verma,9812345678,Delhi,Bangalore,2026-06-20,14:00,17:15,2,12000,Air India,AI-502,XYZ789`;

const CSV_BUYER_SAMPLE = `brokerName,phone,fromCity,toCity,travelDate,preferredTimeFrom,preferredTimeTo,seatsRequired,budgetPerSeat,passengerNames
Amit Kumar,9898989898,Delhi,Mumbai,2026-06-15,06:00,10:00,4,9000,Amit Kumar,Priya Kumar
Neha Singh,9911223344,Delhi,Bangalore,2026-06-20,12:00,18:00,2,11500,Neha Singh`;

function parseCSV(csv: string): Record<string, unknown>[] {
  const lines = csv.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? '';
    });
    return obj;
  });
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ImportDialog({ open, onClose }: Props) {
  const [importType, setImportType] = useState<ImportType>('SELLER');
  const [source, setSource] = useState<ImportSource>('CSV');
  const [sourceEmail, setSourceEmail] = useState('');
  const [csvText, setCsvText] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [inputMode, setInputMode] = useState<'csv' | 'json'>('csv');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fields = importType === 'SELLER' ? SELLER_FIELDS : BUYER_FIELDS;
  const sampleCSV = importType === 'SELLER' ? CSV_SELLER_SAMPLE : CSV_BUYER_SAMPLE;

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Please upload a CSV or TXT file');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => setCsvText(e.target?.result as string ?? '');
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleImport = async () => {
    let records: Record<string, unknown>[] = [];

    if (inputMode === 'csv') {
      if (!csvText.trim()) {
        toast.error('Please paste or upload CSV data');
        return;
      }
      records = parseCSV(csvText);
    } else {
      try {
        records = JSON.parse(jsonText);
        if (!Array.isArray(records)) throw new Error();
      } catch {
        toast.error('Invalid JSON — must be an array of objects');
        return;
      }
    }

    if (records.length === 0) {
      toast.error('No valid records found');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await ticketImportService.bulkImport({
        type: importType,
        source,
        sourceEmail: sourceEmail || undefined,
        importBatch: `batch-${Date.now()}`,
        records,
      });
      setResult(res);
      toast.success(`Import complete: ${res.success} added, ${res.failed} failed`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setCsvText('');
    setJsonText('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <DialogTitle>Bulk Import</DialogTitle>
          <DialogDescription>
            Import multiple seller or buyer records at once from CSV or JSON
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-5">

            {/* Type + Source */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Import As</Label>
                <Select value={importType} onValueChange={v => setImportType(v as ImportType)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SELLER">✈️ Sellers (Ticket Listings)</SelectItem>
                    <SelectItem value="BUYER">🛒 Buyers (Ticket Requests)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Data Source</Label>
                <Select value={source} onValueChange={v => setSource(v as ImportSource)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSV">📄 CSV File</SelectItem>
                    <SelectItem value="EMAIL">📧 Email</SelectItem>
                    <SelectItem value="MANUAL">✍️ Manual Entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {source === 'EMAIL' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Source Email Address</Label>
                <Input
                  placeholder="e.g. listings@broker.com"
                  className="h-9"
                  value={sourceEmail}
                  onChange={e => setSourceEmail(e.target.value)}
                />
              </div>
            )}

            <Separator />

            {/* Field Reference */}
            <div className="rounded-xl border bg-muted/30 p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-blue-500" />
                <p className="text-xs font-semibold">Required & Optional Fields for {importType === 'SELLER' ? 'Sellers' : 'Buyers'}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {fields.map(f => (
                  <span
                    key={f.key}
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-mono',
                      f.required
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-muted text-muted-foreground border border-border'
                    )}
                  >
                    {f.key}{f.required ? '*' : ''}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">Fields marked with * are required</p>
            </div>

            {/* Input Mode Toggle */}
            <Tabs value={inputMode} onValueChange={v => setInputMode(v as 'csv' | 'json')}>
              <TabsList className="w-full h-8">
                <TabsTrigger value="csv" className="flex-1 text-xs">CSV / Paste</TabsTrigger>
                <TabsTrigger value="json" className="flex-1 text-xs">JSON</TabsTrigger>
              </TabsList>

              {/* CSV Tab */}
              <TabsContent value="csv" className="space-y-3 mt-3">
                {/* Drag & Drop Zone */}
                <div
                  className={cn(
                    'border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
                    dragOver
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/50 hover:bg-muted/20'
                  )}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('csv-file-input')?.click()}
                >
                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Drop CSV file here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">.csv or .txt files accepted</p>
                  <input
                    id="csv-file-input"
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-2 text-xs text-muted-foreground">or paste CSV below</span>
                  </div>
                </div>

                <Textarea
                  rows={8}
                  className="font-mono text-xs resize-none"
                  placeholder={`Paste CSV here...\n\nExample:\n${sampleCSV}`}
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setCsvText(sampleCSV)}
                >
                  <FileText className="h-3 w-3 mr-1" /> Load Sample Data
                </Button>
              </TabsContent>

              {/* JSON Tab */}
              <TabsContent value="json" className="mt-3">
                <Textarea
                  rows={10}
                  className="font-mono text-xs resize-none"
                  placeholder={`Paste JSON array here...\n[\n  {\n    "brokerName": "Rajesh",\n    "phone": "9876543210",\n    ...\n  }\n]`}
                  value={jsonText}
                  onChange={e => setJsonText(e.target.value)}
                />
              </TabsContent>
            </Tabs>

            {/* Result */}
            {result && (
              <div className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm font-semibold">Import Complete</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.success}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Successfully imported</p>
                  </div>
                  <div className={cn(
                    'rounded-lg border p-3 text-center',
                    result.failed > 0
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                      : 'bg-muted border-border'
                  )}>
                    <p className={cn(
                      'text-2xl font-bold',
                      result.failed > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                    )}>
                      {result.failed}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Failed</p>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Errors
                    </p>
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {result.errors.map((err, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-2"
                          >
                            <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                Row {i + 1}:
                              </span>{' '}
                              {err.error}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              className="flex-1"
              onClick={handleImport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {importType === 'SELLER' ? 'Sellers' : 'Buyers'}
                </>
              )}
            </Button>
          )}
          {result && result.success > 0 && (
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => {
                setResult(null);
                setCsvText('');
                setJsonText('');
              }}
            >
              Import More
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}