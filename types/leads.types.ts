// ─── Lead Types ───────────────────────────────────────────────────────────────

export type LeadPriority = 'HOT' | 'WARM' | 'COLD';
export type LeadSource =
  | 'WEBSITE' | 'MANUAL' | 'WHATSAPP' | 'FACEBOOK'
  | 'INSTAGRAM' | 'MESSENGER' | 'PHONE' | 'OTHER';

export interface LeadStage {
  id: string;
  title: string;
  color: string;
  position: number;
  isDefault: boolean;
  isWon?: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { leads: number };
}

export interface LeadLabel {
  id: string;
  name: string;
  color: string;
}

export interface LeadLabelAssignment {
  id: string;
  labelId: string;
  label: LeadLabel;
}

export interface AssignedUser {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface FollowUp {
  id: string;
  leadId?: string;
  type: 'CALL' | 'MESSAGE' | 'MEETING' | 'EMAIL';
  status: 'PENDING' | 'COMPLETED' | 'MISSED';
  dueAt: string;
  notes?: string;
  assignedToId?: string;
  assignedTo?: AssignedUser;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  content: string;
  createdAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  userId?: string;
  user?: AssignedUser;
  action: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface LeadTask {
  id: string;
  leadId: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedToId?: string;
  assignedTo?: AssignedUser;
  createdById?: string;
  createdBy?: AssignedUser;
  dueAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadMeeting {
  id: string;
  leadId: string;
  title: string;
  description?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  scheduledAt: string;
  duration?: number;
  location?: string;
  meetingLink?: string;
  assignedToId?: string;
  assignedTo?: AssignedUser;
  createdById?: string;
  createdBy?: AssignedUser;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface LeadQuotation {
  id: string;
  leadId: string;
  quotationNumber: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  validUntil?: string;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  notes?: string;
  termsConditions?: string;
  createdById?: string;
  createdBy?: AssignedUser;
  items: QuotationItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface LeadInvoice {
  id: string;
  leadId: string;
  invoiceNumber: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  dueDate?: string;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  paidAmount: number;
  notes?: string;
  createdById?: string;
  createdBy?: AssignedUser;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Main Lead Type ───────────────────────────────────────────────────────────
export interface PipelineLead {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  source: LeadSource;
  stageId?: string | null;
  stage?: LeadStage | null;
  priority: LeadPriority;
  rating: number;                     // 0–5 stars
  destination?: string | null;
  estimatedBudget?: number | null;
  travelDate?: string | null;
  numberOfTravelers?: number | null;
  notes?: string | null;
  assignedToId?: string | null;
  assignedTo?: AssignedUser | null;
  convertedCustomerId?: string | null;
  labels?: LeadLabelAssignment[];
  followUps?: FollowUp[];
  leadNotes?: LeadNote[];
  activities?: LeadActivity[];
  createdAt: string;
  updatedAt: string;
}

// ─── Pipeline Column ──────────────────────────────────────────────────────────
export interface PipelineColumn {
  stage: LeadStage;
  leads: PipelineLead[];
  count: number;
}

// ─── Create / Update DTOs ─────────────────────────────────────────────────────
export interface CreateLeadData {
  name: string;
  phone: string;
  email?: string;
  source?: LeadSource;
  priority?: LeadPriority;
  stageId?: string;
  destination?: string;
  estimatedBudget?: number;
  travelDate?: string;
  numberOfTravelers?: number;
  notes?: string;
  assignedToId?: string;
  rating?: number;
}

export interface CreateStageData {
  title: string;
  color: string;
  position?: number;
  isWon?: boolean;
}