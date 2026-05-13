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
// import { Loader2, Ticket, Plane, CreditCard, Radio } from 'lucide-react';
// import type { TicketSeller, CreateSellerPayload } from '@/types/ticket.types';
// import { format } from 'date-fns';

// // ─── Schema ───────────────────────────────────────────────────────────────────

// const sellerSchema = z.object({
//   // Core
//   brokerName:     z.string().min(2, 'Broker name is required'),
//   phone:          z.string().min(7, 'Valid phone number required'),
//   email:          z.string().email().optional().or(z.literal('')),
//   fromCity:       z.string().min(2, 'From city is required'),
//   toCity:         z.string().min(2, 'To city is required'),
//   departureTime:  z.string().min(1, 'Departure time is required'),
//   arrivalTime:    z.string().min(1, 'Arrival time is required'),
//   travelDate:     z.string().min(1, 'Travel date is required'),
//   seatsAvailable: z.coerce.number().int().min(1, 'At least 1 seat required'),
//   pricePerSeat:   z.coerce.number().min(1, 'Price must be > 0'),
//   // Airline & booking
//   airline:        z.string().optional(),
//   flightNumber:   z.string().optional(),
//   bookingRef:     z.string().optional(),
//   ticketClass:    z.enum(['ECONOMY', 'BUSINESS', 'FIRST']).optional(),
//   pnr:            z.string().optional(),
//   // Purchase tracking
//   purchasePrice:  z.coerce.number().min(0).optional().or(z.literal('')),
//   purchasedFrom:  z.string().optional(),
//   purchasedAt:    z.string().optional(),
//   // Source
//   sourceChannel:  z.enum(['EMAIL', 'WHATSAPP', 'PHONE', 'WALK_IN', 'ONLINE']).optional(),
//   emailSource:    z.string().optional(),
//   notes:          z.string().optional(),
// });

// type SellerFormValues = z.infer<typeof sellerSchema>;

// const EMPTY_DEFAULTS: SellerFormValues = {
//   brokerName: '', phone: '', email: '',
//   fromCity: '', toCity: '',
//   departureTime: '', arrivalTime: '', travelDate: '',
//   seatsAvailable: 1, pricePerSeat: 0,
//   airline: '', flightNumber: '', bookingRef: '', pnr: '',
//   purchasedFrom: '', notes: '',
// };

// interface SellerFormDialogProps {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (data: CreateSellerPayload) => Promise<void>;
//   defaultValues?: TicketSeller | null;
//   loading?: boolean;
// }

// // ─── Section header ───────────────────────────────────────────────────────────
// function Section({ icon, title }: { icon: React.ReactNode; title: string }) {
//   return (
//     <div className="flex items-center gap-2 pt-1">
//       <div className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground">
//         {icon}
//       </div>
//       <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
//         {title}
//       </span>
//       <div className="h-px flex-1 bg-border" />
//     </div>
//   );
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// export default function SellerFormDialog({
//   open, onClose, onSubmit, defaultValues, loading,
// }: SellerFormDialogProps) {
//   const form = useForm<SellerFormValues>({
//     resolver: zodResolver(sellerSchema),
//     defaultValues: EMPTY_DEFAULTS,
//     mode: 'onSubmit',
//     reValidateMode: 'onChange',
//   });

//   useEffect(() => {
//     if (!open) return;
//     if (defaultValues) {
//       form.reset({
//         brokerName:     defaultValues.brokerName,
//         phone:          defaultValues.phone,
//         email:          defaultValues.email ?? '',
//         fromCity:       defaultValues.fromCity,
//         toCity:         defaultValues.toCity,
//         departureTime:  defaultValues.departureTime,
//         arrivalTime:    defaultValues.arrivalTime,
//         travelDate:     format(new Date(defaultValues.travelDate), 'yyyy-MM-dd'),
//         seatsAvailable: defaultValues.seatsAvailable,
//         pricePerSeat:   defaultValues.pricePerSeat,
//         airline:        defaultValues.airline ?? '',
//         flightNumber:   defaultValues.flightNumber ?? '',
//         bookingRef:     defaultValues.bookingRef ?? '',
//         ticketClass:    defaultValues.ticketClass,
//         pnr:            defaultValues.pnr ?? '',
//         purchasePrice:  defaultValues.purchasePrice ?? '',
//         purchasedFrom:  defaultValues.purchasedFrom ?? '',
//         purchasedAt:    defaultValues.purchasedAt
//           ? format(new Date(defaultValues.purchasedAt), 'yyyy-MM-dd') : '',
//         sourceChannel:  defaultValues.sourceChannel,
//         emailSource:    defaultValues.emailSource ?? '',
//         notes:          defaultValues.notes ?? '',
//       });
//     } else {
//       form.reset(EMPTY_DEFAULTS);
//     }
//   }, [open, defaultValues]); // eslint-disable-line

//   const handleClose = () => { form.reset(EMPTY_DEFAULTS); onClose(); };
//   const handleSubmit = async (values: SellerFormValues) => {
//     const payload = { ...values } as CreateSellerPayload;
//     if (!payload.email) delete payload.email;
//     await onSubmit(payload);
//   };

//   return (
//     <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <div className="flex items-center gap-2">
//             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10">
//               <Ticket className="h-4 w-4 text-sky-400" />
//             </div>
//             <DialogTitle className="text-base font-semibold">
//               {defaultValues ? 'Edit Seller Listing' : 'New Seller Listing'}
//             </DialogTitle>
//           </div>
//         </DialogHeader>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-1" noValidate>

//             {/* ── Broker Info ── */}
//             <Section icon={<Ticket className="h-3.5 w-3.5" />} title="Broker Info" />
//             <div className="grid grid-cols-2 gap-3">
//               <FormField control={form.control} name="brokerName" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Broker Name *</FormLabel>
//                   <FormControl><Input placeholder="Rajesh Kumar" {...field} /></FormControl>
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
//                 <FormControl><Input placeholder="broker@example.com" type="email" {...field} /></FormControl>
//                 <FormMessage className="text-xs" />
//               </FormItem>
//             )} />

//             {/* ── Route ── */}
//             <Section icon={<Plane className="h-3.5 w-3.5" />} title="Route & Schedule" />
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
//               <FormField control={form.control} name="departureTime" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Departure *</FormLabel>
//                   <FormControl><Input type="time" {...field} /></FormControl>
//                   <FormMessage className="text-xs" />
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="arrivalTime" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Arrival *</FormLabel>
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
//               <FormField control={form.control} name="seatsAvailable" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Seats Available *</FormLabel>
//                   <FormControl>
//                     <Input type="number" min={1} {...field} onChange={e => field.onChange(e.target.value)} />
//                   </FormControl>
//                   <FormMessage className="text-xs" />
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="pricePerSeat" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Selling Price / Seat (₹) *</FormLabel>
//                   <FormControl>
//                     <Input type="number" min={0} {...field} onChange={e => field.onChange(e.target.value)} />
//                   </FormControl>
//                   <FormMessage className="text-xs" />
//                 </FormItem>
//               )} />
//             </div>

//             {/* ── Airline Details ── */}
//             <Section icon={<Plane className="h-3.5 w-3.5" />} title="Airline & Booking" />
//             <div className="grid grid-cols-3 gap-3">
//               <FormField control={form.control} name="airline" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Airline</FormLabel>
//                   <FormControl><Input placeholder="IndiGo" {...field} /></FormControl>
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="flightNumber" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Flight No.</FormLabel>
//                   <FormControl><Input placeholder="6E-201" {...field} /></FormControl>
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="ticketClass" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Class</FormLabel>
//                   <Select value={field.value ?? ''} onValueChange={field.onChange}>
//                     <FormControl>
//                       <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="ECONOMY">Economy</SelectItem>
//                       <SelectItem value="BUSINESS">Business</SelectItem>
//                       <SelectItem value="FIRST">First</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </FormItem>
//               )} />
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <FormField control={form.control} name="pnr" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">PNR</FormLabel>
//                   <FormControl><Input placeholder="ABCD12" {...field} /></FormControl>
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="bookingRef" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Booking Ref</FormLabel>
//                   <FormControl><Input placeholder="BK-78901" {...field} /></FormControl>
//                 </FormItem>
//               )} />
//             </div>

//             {/* ── Purchase Cost ── */}
//             <Section icon={<CreditCard className="h-3.5 w-3.5" />} title="Purchase / Cost Tracking" />
//             <div className="grid grid-cols-3 gap-3">
//               <FormField control={form.control} name="purchasePrice" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Our Cost / Seat (₹)</FormLabel>
//                   <FormControl>
//                     <Input type="number" min={0} placeholder="3800" {...field}
//                       onChange={e => field.onChange(e.target.value)} />
//                   </FormControl>
//                   <FormMessage className="text-xs" />
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="purchasedFrom" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Purchased From</FormLabel>
//                   <FormControl><Input placeholder="Vendor name" {...field} /></FormControl>
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="purchasedAt" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Purchase Date</FormLabel>
//                   <FormControl><Input type="date" {...field} /></FormControl>
//                 </FormItem>
//               )} />
//             </div>

//             {/* ── Source ── */}
//             <Section icon={<Radio className="h-3.5 w-3.5" />} title="Source" />
//             <div className="grid grid-cols-2 gap-3">
//               <FormField control={form.control} name="sourceChannel" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs text-muted-foreground">Source Channel</FormLabel>
//                   <Select value={field.value ?? ''} onValueChange={field.onChange}>
//                     <FormControl>
//                       <SelectTrigger><SelectValue placeholder="How did this come in?" /></SelectTrigger>
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
//                   <FormLabel className="text-xs text-muted-foreground">Email Source (if EMAIL)</FormLabel>
//                   <FormControl><Input placeholder="noreply@airline.com" {...field} /></FormControl>
//                 </FormItem>
//               )} />
//             </div>

//             {/* ── Notes ── */}
//             <FormField control={form.control} name="notes" render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="text-xs text-muted-foreground">Notes (optional)</FormLabel>
//                 <FormControl>
//                   <Textarea placeholder="Any additional info..." rows={2} className="resize-none" {...field} />
//                 </FormControl>
//               </FormItem>
//             )} />

//             <DialogFooter className="pt-2">
//               <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
//               <Button type="submit" disabled={loading} className="gap-2 bg-sky-600 hover:bg-sky-700 text-white">
//                 {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
//                 {defaultValues ? 'Update Listing' : 'Add Listing'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }