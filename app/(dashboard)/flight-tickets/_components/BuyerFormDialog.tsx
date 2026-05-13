// 'use client';

// import { useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import {
//   Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
// } from '@/components/ui/dialog';
// import {
//   Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
// } from '@/components/ui/form';
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from '@/components/ui/select';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Button } from '@/components/ui/button';
// import { Loader2, UserSearch, CreditCard, Radio, Users } from 'lucide-react';
// import { TicketBuyer, CreateBuyerPayload } from '@/types/ticket.types';
// import { format } from 'date-fns';

// // ─── Schema ───────────────────────────────────────────────────────────────────

// const buyerSchema = z.object({
//   brokerName:        z.string().min(2, 'Broker name required'),
//   phone:             z.string().min(7, 'Valid phone required'),
//   email:             z.string().email().optional().or(z.literal('')),
//   fromCity:          z.string().min(2, 'From city required'),
//   toCity:            z.string().min(2, 'To city required'),
//   preferredTimeFrom: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:MM format'),
//   preferredTimeTo:   z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:MM format'),
//   travelDate:        z.string().min(1, 'Travel date required'),
//   seatsRequired:     z.coerce.number().int().min(1, 'At least 1 seat'),
//   budgetPerSeat:     z.coerce.number().min(1, 'Budget must be > 0'),
//   // Passenger
//   passengerCount:    z.coerce.number().int().min(1).optional().or(z.literal('')),
//   passengerNames:    z.string().optional(),
//   // Payment
//   agreedPricePerSeat: z.coerce.number().min(0).optional().or(z.literal('')),
//   totalCollected:     z.coerce.number().min(0).optional().or(z.literal('')),
//   paymentMethod:      z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CARD']).optional(),
//   paymentStatus:      z.enum(['PENDING', 'PARTIAL', 'PAID']).optional(),
//   paymentDate:        z.string().optional(),
//   paymentRef:         z.string().optional(),
//   // Source
//   sourceChannel:      z.enum(['EMAIL', 'WHATSAPP', 'PHONE', 'WALK_IN', 'ONLINE']).optional(),
//   emailSource:        z.string().optional(),
//   notes:              z.string().optional(),
// });

// type BuyerFormValues = z.infer<typeof buyerSchema>;

// const EMPTY_DEFAULTS: BuyerFormValues = {
//   brokerName: '', phone: '', email: '',
//   fromCity: '', toCity: '',
//   preferredTimeFrom: '', preferredTimeTo: '', travelDate: '',
//   seatsRequired: 1, budgetPerSeat: 0,
//   passengerNames: '', paymentRef: '', emailSource: '', notes: '',
// };

// interface BuyerFormDialogProps {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (data: CreateBuyerPayload) => Promise<void>;
//   defaultValues?: TicketBuyer | null;
//   loading?: boolean;
// }

// function Section({ icon, title }: { icon: React.ReactNode; title: string }) {
//   return (
//     <div className="flex items-center gap-2 pt-1">
//       <div className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground">{icon}</div>
//       <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</span>
//       <div className="h-px flex-1 bg-border" />
//     </div>
//   );
// }

// export default function BuyerFormDialog({
//   open, onClose, onSubmit, defaultValues, loading,
// }: BuyerFormDialogProps) {
//   const form = useForm<BuyerFormValues>({
//     resolver: zodResolver(buyerSchema),
//     defaultValues: EMPTY_DEFAULTS,
//     mode: 'onSubmit',
//     reValidateMode: 'onChange',
//   });

//   useEffect(() => {
//     if (!open) return;
//     if (defaultValues) {
//       form.reset({
//         brokerName:         defaultValues.brokerName,
//         phone:              defaultValues.phone,
//         email:              defaultValues.email ?? '',
//         fromCity:           defaultValues.fromCity,
//         toCity:             defaultValues.toCity,
//         preferredTimeFrom:  defaultValues.preferredTimeFrom,
//         preferredTimeTo:    defaultValues.preferredTimeTo,
//         travelDate:         format(new Date(defaultValues.travelDate), 'yyyy-MM-dd'),
//         seatsRequired:      defaultValues.seatsRequired,
//         budgetPerSeat:      defaultValues.budgetPerSeat,
//         passengerCount:     defaultValues.passengerCount ?? '',
//         passengerNames:     defaultValues.passengerNames ?? '',
//         agreedPricePerSeat: defaultValues.agreedPricePerSeat ?? '',
//         totalCollected:     defaultValues.totalCollected ?? '',
//         paymentMethod:      defaultValues.paymentMethod,
//         paymentStatus:      defaultValues.paymentStatus as any,
//         paymentDate:        defaultValues.paymentDate
//           ? format(new Date(defaultValues.paymentDate), 'yyyy-MM-dd') : '',
//         paymentRef:         defaultValues.paymentRef ?? '',
//         sourceChannel:      defaultValues.sourceChannel,
//         emailSource:        defaultValues.emailSource ?? '',
//         notes:              defaultValues.notes ?? '',
//       });
//     } else {
//       form.reset(EMPTY_DEFAULTS);
//     }
//   }, [open, defaultValues]); // eslint-disable-line

//   const handleClose = () => { form.reset(EMPTY_DEFAULTS); onClose(); };
//   const handleSubmit = async (values: BuyerFormValues) => {
//     await onSubmit(values as CreateBuyerPayload);
//   };

//   return (
//     <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <div className="flex items-center gap-2">
//             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
//               <UserSearch className="h-4 w-4 text-violet-400" />
//             </div>
//             <DialogTitle className="text-base font-semibold">
//               {defaultValues ? 'Edit Buyer Request' : 'New Buyer Request'}
//             </DialogTitle>
//           </div>
//         </DialogHeader>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-1" noValidate>

//             {/* ── Broker Info ── */}
//             <Section icon={<UserSearch className="h-3.5 w-3.5" />} title="Broker Info" />
//             <div className="grid grid-cols-2 gap-3">
//               <FormField control={form.control} name="brokerName" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Broker Name *</FormLabel>
//                   <FormControl><Input placeholder="Suresh Mehta" {...field} /></FormControl>
//                   <FormMessage className="text-xs" />
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="phone" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Phone *</FormLabel>
//                   <FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl>
//                   <FormMessage className="text-xs" />
//                 </FormItem>
//               )} />
//             </div>
//             <FormField control={form.control} name="email" render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="text-xs text-muted-foreground">Email (optional)</FormLabel>
//                 <FormControl><Input placeholder="buyer@example.com" type="email" {...field} /></FormControl>
//               </FormItem>
//             )} />

//             {/* ── Route ── */}
//             <Section icon={<UserSearch className="h-3.5 w-3.5" />} title="Route & Preferences" />
//             <div className="grid grid-cols-2 gap-3">
//               <FormField control={form.control} name="fromCity" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">From City *</FormLabel>
//                   <FormControl><Input placeholder="Delhi" {...field} /></FormControl>
//                   <FormMessage className="text-xs" />
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="toCity" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">To City *</FormLabel>
//                   <FormControl><Input placeholder="Mumbai" {...field} /></FormControl>
//                   <FormMessage className="text-xs" />
//                 </FormItem>
//               )} />
//             </div>
//             <div className="grid grid-cols-3 gap-3">
//               <FormField control={form.control} name="preferredTimeFrom" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Preferred From *</FormLabel>
//                   <FormControl><Input type="time" {...field} /></FormControl>
//                   <FormMessage className="text-xs" />
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="preferredTimeTo" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Preferred To *</FormLabel>
//                   <FormControl><Input type="time" {...field} /></FormControl>
//                   <FormMessage className="text-xs" />
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="travelDate" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Travel Date *</FormLabel>
//                   <FormControl><Input type="date" {...field} /></FormControl>
//                   <FormMessage className="text-xs" />
//                 </FormItem>
//               )} />
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <FormField control={form.control} name="seatsRequired" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Seats Required *</FormLabel>
//                   <FormControl>
//                     <Input type="number" min={1} {...field} onChange={e => field.onChange(e.target.value)} />
//                   </FormControl>
//                   <FormMessage className="text-xs" />
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="budgetPerSeat" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Budget / Seat (₹) *</FormLabel>
//                   <FormControl>
//                     <Input type="number" min={0} {...field} onChange={e => field.onChange(e.target.value)} />
//                   </FormControl>
//                   <FormMessage className="text-xs" />
//                 </FormItem>
//               )} />
//             </div>

//             {/* ── Passenger Details ── */}
//             <Section icon={<Users className="h-3.5 w-3.5" />} title="Passenger Details" />
//             <div className="grid grid-cols-2 gap-3">
//               <FormField control={form.control} name="passengerCount" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Passenger Count</FormLabel>
//                   <FormControl>
//                     <Input type="number" min={1} placeholder="2" {...field}
//                       onChange={e => field.onChange(e.target.value)} />
//                   </FormControl>
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="passengerNames" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Passenger Names</FormLabel>
//                   <FormControl><Input placeholder="Ramesh, Suresh" {...field} /></FormControl>
//                 </FormItem>
//               )} />
//             </div>

//             {/* ── Payment ── */}
//             <Section icon={<CreditCard className="h-3.5 w-3.5" />} title="Payment Details" />
//             <div className="grid grid-cols-2 gap-3">
//               <FormField control={form.control} name="agreedPricePerSeat" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Agreed Price / Seat (₹)</FormLabel>
//                   <FormControl>
//                     <Input type="number" min={0} placeholder="4200" {...field}
//                       onChange={e => field.onChange(e.target.value)} />
//                   </FormControl>
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="totalCollected" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Total Collected (₹)</FormLabel>
//                   <FormControl>
//                     <Input type="number" min={0} placeholder="8400" {...field}
//                       onChange={e => field.onChange(e.target.value)} />
//                   </FormControl>
//                 </FormItem>
//               )} />
//             </div>
//             <div className="grid grid-cols-3 gap-3">
//               <FormField control={form.control} name="paymentMethod" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Payment Method</FormLabel>
//                   <Select value={field.value ?? ''} onValueChange={field.onChange}>
//                     <FormControl>
//                       <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="CASH">Cash</SelectItem>
//                       <SelectItem value="UPI">UPI</SelectItem>
//                       <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
//                       <SelectItem value="CARD">Card</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="paymentStatus" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Payment Status</FormLabel>
//                   <Select value={field.value ?? ''} onValueChange={field.onChange}>
//                     <FormControl>
//                       <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="PENDING">Pending</SelectItem>
//                       <SelectItem value="PARTIAL">Partial</SelectItem>
//                       <SelectItem value="PAID">Paid</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="paymentDate" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Payment Date</FormLabel>
//                   <FormControl><Input type="date" {...field} /></FormControl>
//                 </FormItem>
//               )} />
//             </div>
//             <FormField control={form.control} name="paymentRef" render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="text-xs text-muted-foreground">Payment Ref / UTR</FormLabel>
//                 <FormControl><Input placeholder="UTR123456789" {...field} /></FormControl>
//               </FormItem>
//             )} />

//             {/* ── Source ── */}
//             <Section icon={<Radio className="h-3.5 w-3.5" />} title="Source" />
//             <div className="grid grid-cols-2 gap-3">
//               <FormField control={form.control} name="sourceChannel" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Source Channel</FormLabel>
//                   <Select value={field.value ?? ''} onValueChange={field.onChange}>
//                     <FormControl>
//                       <SelectTrigger><SelectValue placeholder="How did they contact?" /></SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="EMAIL">Email</SelectItem>
//                       <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
//                       <SelectItem value="PHONE">Phone</SelectItem>
//                       <SelectItem value="WALK_IN">Walk-In</SelectItem>
//                       <SelectItem value="ONLINE">Online</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="emailSource" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Email Source</FormLabel>
//                   <FormControl><Input placeholder="noreply@booking.com" {...field} /></FormControl>
//                 </FormItem>
//               )} />
//             </div>

//             <FormField control={form.control} name="notes" render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="text-xs text-muted-foreground">Notes (optional)</FormLabel>
//                 <FormControl>
//                   <Textarea placeholder="Any additional requirements..." rows={2} className="resize-none" {...field} />
//                 </FormControl>
//               </FormItem>
//             )} />

//             <DialogFooter className="pt-2">
//               <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
//               <Button type="submit" disabled={loading} className="gap-2 bg-violet-600 hover:bg-violet-700">
//                 {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
//                 {defaultValues ? 'Update Request' : 'Add Request'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }