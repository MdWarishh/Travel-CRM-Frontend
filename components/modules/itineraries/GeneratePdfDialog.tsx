'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FileDown, Loader2, User, Calendar, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { itinerariesService } from '@/services/itineraries.service';
import { GeneratePdfPayload } from '@/types/itinerary.types';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  itineraryId: string;
  itineraryTitle: string;
}

type FormValues = {
  customerName: string;
  leadId: string;
  travelDate: string;
  numberOfTravelers: string;
};

type UIState = 'idle' | 'loading' | 'success' | 'error';

export function GeneratePdfDialog({ open, onClose, itineraryId, itineraryTitle }: Props) {
  const [uiState, setUiState] = useState<UIState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  // AbortController ref — cancels in-flight request if dialog closes
  const abortRef = useRef<AbortController | null>(null);

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { customerName: '', leadId: '', travelDate: '', numberOfTravelers: '' },
  });

  // Reset state whenever dialog opens
  useEffect(() => {
    if (open) {
      setUiState('idle');
      setErrorMsg('');
      reset();
    }
    // On close, abort any pending request
    return () => {
      abortRef.current?.abort();
    };
  }, [open, reset]);

  const handleClose = () => {
    if (uiState === 'loading') {
      abortRef.current?.abort();
    }
    setUiState('idle');
    setErrorMsg('');
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    setUiState('loading');
    setErrorMsg('');

    // Fresh AbortController for this request
    abortRef.current = new AbortController();

    try {
      const payload: GeneratePdfPayload = {
        // Pass raw values — service will clean & coerce them
        customerName: values.customerName || undefined,
        leadId: values.leadId || undefined,
        travelDate: values.travelDate || undefined,
        numberOfTravelers: values.numberOfTravelers
          ? Number(values.numberOfTravelers)
          : undefined,
      };

      const filename = `${itineraryTitle.replace(/\s+/g, '-').toLowerCase()}-itinerary`;

      await itinerariesService.downloadPdf(
        itineraryId,
        filename,
        payload,
        abortRef.current.signal
      );

      setUiState('success');
      toast.success('PDF downloaded successfully!');

      // Auto-close after brief success flash
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err: any) {
      // Ignore abort errors (user cancelled)
      if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'PDF generation failed. Please try again.';

      setUiState('error');
      setErrorMsg(msg);
    }
  };

  const isLoading = uiState === 'loading';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-100">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <FileDown className="h-4 w-4 text-slate-500" />
            Generate PDF
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          {/* Itinerary badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <p className="text-xs text-slate-500 mb-0.5">Itinerary</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{itineraryTitle}</p>
          </div>

          {/* Error alert */}
          {uiState === 'error' && (
            <Alert variant="destructive" className="py-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {/* Success state */}
          {uiState === 'success' && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm font-medium">PDF downloaded!</p>
            </div>
          )}

          <Separator />

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Customer Details
              </p>
              <p className="text-xs text-slate-400">
                Leave blank for a generic template PDF.
              </p>
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-600 mb-1.5 block">
                Lead ID <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Input
                {...register('leadId')}
                placeholder="Paste Lead UUID"
                className="h-9 font-mono text-sm"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-600 mb-1.5 block">
                Customer Name <span className="text-slate-400 font-normal">(optional override)</span>
              </Label>
              <Input
                {...register('customerName')}
                placeholder="e.g. Mr. & Mrs. Sharma"
                className="h-9"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  <Calendar className="h-3 w-3 inline mr-1" />Travel Date
                </Label>
                <Input
                  type="date"
                  {...register('travelDate')}
                  className="h-9"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  <Users className="h-3 w-3 inline mr-1" />Travelers
                </Label>
                <Input
                  type="number"
                  min={1}
                  {...register('numberOfTravelers')}
                  placeholder="e.g. 4"
                  className="h-9"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="h-9"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading || uiState === 'success'}
            className="h-9 bg-slate-900 hover:bg-slate-800 text-white gap-2 min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : uiState === 'success' ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Done!
              </>
            ) : (
              <>
                <FileDown className="h-3.5 w-3.5" />
                Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}