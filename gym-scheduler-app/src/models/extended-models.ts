/**
 * Extended React Native Models
 * TypeScript interfaces and classes for all trainer, member, and admin features
 */

// Trainer Features Models
export interface WorkingHour {
  id?: number;
  trainer_id: number;
  day_of_week: number; // 0-6 (Monday-Sunday)
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TimeOff {
  id?: number;
  trainer_id: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  reason: 'vacation' | 'medical' | 'personal';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  description?: string;
  approved_by?: number;
  notes?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SessionNote {
  id?: number;
  booking_id: number;
  trainer_id: number;
  member_id: number;
  content: string;
  focus_areas?: string[];
  performance?: number; // 1-5 rating
  next_focus?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutPlan {
  id?: number;
  trainer_id: number;
  member_id: number;
  title: string;
  content: string;
  duration?: number; // in weeks
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TrainerEarning {
  id?: number;
  trainer_id: number;
  total_earnings: number;
  completed_sessions: number;
  pending_sessions: number;
  cancelled_sessions: number;
  withdrawal_balance: number;
  commission_rate?: number;
  created_at?: string;
  updated_at?: string;
}

// Member Features Models
export interface WaitlistEntry {
  id?: number;
  member_id: number;
  item_type: 'class' | 'trainer';
  item_id: number;
  position: number;
  notified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MembershipFreeze {
  id?: number;
  member_id: number;
  start_date: string;
  end_date: string;
  reason: 'vacation' | 'medical' | 'personal';
  status: 'pending' | 'approved' | 'cancelled' | 'active' | 'expired';
  approved_by?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;

  // Computed property
  get frozenDays(): number {
    if (!this.start_date || !this.end_date) return 0;
    const start = new Date(this.start_date);
    const end = new Date(this.end_date);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
}

export interface MemberCard {
  id?: number;
  member_id: number;
  card_number: string;
  qr_code: string; // Base64 encoded image
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BookingCancellation {
  id?: number;
  booking_id: number;
  member_id: number;
  reason: string;
  cancelled_at: string;
  penalty: number;
  refund_amount: number;
  status: 'pending' | 'processed' | 'failed';
  created_at?: string;
  updated_at?: string;
}

// Admin Features Models
export interface Voucher {
  id?: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses?: number;
  used_count: number;
  min_order_amount?: number;
  valid_from: string;
  valid_until: string;
  applicable_to: 'all' | 'new_members' | 'specific_packages';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;

  // Computed properties
  get isExpired(): boolean {
    return new Date(this.valid_until) < new Date();
  }

  get isExhausted(): boolean {
    return this.max_uses ? this.used_count >= this.max_uses : false;
  }

  get isValid(): boolean {
    return this.is_active && !this.isExpired && !this.isExhausted;
  }
}

export interface PushCampaign {
  id?: number;
  title: string;
  message: string;
  target_audience: 'all' | 'new_members' | 'inactive';
  send_at?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipient_count: number;
  success_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface RefundRequest {
  id?: number;
  booking_id: number;
  member_id: number;
  reason: string;
  requested_amount: number;
  approved_amount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  approved_by?: number;
  refund_method?: 'wallet' | 'bank_transfer';
  notes?: string;
  processed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionReport {
  id?: number;
  date: string;
  member_id?: number;
  trainer_id?: number;
  type: string;
  amount: number;
  description: string;
  details?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// Combined Type for easier imports
export type TrainerModel = WorkingHour | TimeOff | SessionNote | WorkoutPlan | TrainerEarning;
export type MemberModel = WaitlistEntry | MembershipFreeze | MemberCard | BookingCancellation;
export type AdminModel = Voucher | PushCampaign | RefundRequest | TransactionReport;

// Helper class for model creation
export class ModelFactory {
  static createWorkingHour(data: Partial<WorkingHour>): WorkingHour {
    return {
      trainer_id: data.trainer_id || 0,
      day_of_week: data.day_of_week || 0,
      start_time: data.start_time || '09:00',
      end_time: data.end_time || '17:00',
      is_active: data.is_active ?? true,
      ...data,
    };
  }

  static createTimeOff(data: Partial<TimeOff>): TimeOff {
    return {
      trainer_id: data.trainer_id || 0,
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      reason: data.reason || 'vacation',
      status: data.status || 'pending',
      ...data,
    };
  }

  static createVoucher(data: Partial<Voucher>): Voucher {
    return {
      code: data.code || '',
      discount_type: data.discount_type || 'percentage',
      discount_value: data.discount_value || 0,
      used_count: data.used_count || 0,
      valid_from: data.valid_from || new Date().toISOString().split('T')[0],
      valid_until: data.valid_until || new Date().toISOString().split('T')[0],
      applicable_to: data.applicable_to || 'all',
      is_active: data.is_active ?? true,
      ...data,
    };
  }
}
