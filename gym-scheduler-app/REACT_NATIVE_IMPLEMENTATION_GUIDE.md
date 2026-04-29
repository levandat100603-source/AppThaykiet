/**
 * REACT NATIVE GYM-SCHEDULER-APP IMPLEMENTATION GUIDE
 * 
 * This guide provides instructions for implementing the new features
 * in the React Native version of the gym scheduler app (gym-scheduler-app folder)
 * 
 * These mirror the Flutter features added to flutter_gym_scheduler:
 * - Trainer: Availability, Client Management, Earnings
 * - Member: Flexibility (Waitlist, Freeze), Check-in, Cancellation
 * - Admin: Marketing (Vouchers, Campaigns), Reports & Refunds
 */

## 1. Project Structure Setup

Create new directories:

```
gym-scheduler-app/
├── app/
│   ├── trainer/
│   │   ├── availability.tsx
│   │   ├── client-management.tsx
│   │   └── earnings.tsx
│   ├── member/
│   │   ├── flexibility.tsx
│   │   ├── checkin-cancellation.tsx
│   ├── admin/
│   │   ├── marketing.tsx
│   │   └── reports-refunds.tsx
├── src/
│   ├── api/
│   │   ├── trainer-api.ts
│   │   ├── member-api.ts
│   │   └── admin-api.ts
│   ├── models/
│   │   └── extended-models.ts
│   ├── hooks/
│   │   ├── useTrainerManagement.ts
│   │   ├── useMemberFeatures.ts
│   │   └── useAdminManagement.ts
│   ├── context/
│   │   └── [new context files if needed]
│   └── utils/
│       └── api-utils.ts (helpers)
```

## 2. TypeScript Models

Create `src/models/extended-models.ts`:

```typescript
// Trainer Models
export interface WorkingHours {
  id: number;
  trainerId: number;
  dayOfWeek: number; // 0-6
  startTime: string; // "HH:mm"
  endTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeOff {
  id: number;
  trainerId: number;
  startDate: string;
  endDate: string;
  reason: "vacation" | "medical" | "personal";
  status: "pending" | "approved" | "rejected" | "cancelled";
  description?: string;
  approvedBy?: number;
  notes?: string;
  createdAt: Date;
  approvedAt?: Date;
}

export interface SessionNote {
  id: number;
  bookingId: number;
  trainerId: number;
  memberId: number;
  content: string;
  focusAreas?: string[];
  performance?: 1 | 2 | 3 | 4 | 5;
  nextFocus?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutPlan {
  id: number;
  trainerId: number;
  memberId: number;
  title: string;
  content: string;
  duration?: number; // weeks
  difficulty?: "beginner" | "intermediate" | "advanced";
  startDate?: string;
  endDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainerEarnings {
  trainerId: number;
  totalEarnings: number;
  completedSessions: number;
  pendingSessions: number;
  cancelledSessions: number;
  withdrawalBalance: number;
  commissionRate?: number;
}

// Member Models
export interface WaitlistEntry {
  id: number;
  memberId: number;
  itemType: "class" | "trainer";
  itemId: number;
  position: number;
  createdAt: Date;
  notifiedAt?: Date;
}

export interface MembershipFreeze {
  id: number;
  memberId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "active" | "expired";
  approvedBy?: number;
  notes?: string;
  get frozenDays(): number;
}

export interface MemberCard {
  id: number;
  memberId: number;
  cardNumber: string;
  qrCode: string;
  isActive: boolean;
  createdAt: Date;
}

export interface BookingCancellation {
  id: number;
  bookingId: number;
  memberId: number;
  reason: string;
  cancelledAt: Date;
  penalty?: number;
  refundAmount?: number;
  status: "pending" | "approved" | "rejected" | "processed";
}

// Admin Models
export interface Voucher {
  id: number;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  minOrderAmount?: number;
  validFrom: string;
  validUntil: string;
  applicableTo: string;
  isActive: boolean;
  get isExpired(): boolean;
  get isExhausted(): boolean;
  get isValid(): boolean;
}

export interface PushCampaign {
  id: number;
  title: string;
  message: string;
  targetAudience?: string;
  sendAt?: Date;
  sentAt?: Date;
  status: "draft" | "scheduled" | "sent";
  recipientCount?: number;
  successCount?: number;
}

export interface RefundRequest {
  id: number;
  bookingId: number;
  memberId: number;
  reason: string;
  requestedAmount?: number;
  approvedAmount?: number;
  status: "pending" | "approved" | "rejected" | "processed";
  approvedBy?: number;
  refundMethod?: string;
  notes?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface TransactionReport {
  id: number;
  date: string;
  memberId?: number;
  trainerId?: number;
  type: string; // "booking", "membership", "package", "refund"
  amount: number;
  description?: string;
  details?: Record<string, any>;
}
```

## 3. API Services

Create `src/api/trainer-api.ts`:

```typescript
import { apiClient } from "./api-client";
import {
  WorkingHours,
  TimeOff,
  SessionNote,
  WorkoutPlan,
  TrainerEarnings,
} from "@/models/extended-models";

export const trainerApi = {
  // Working Hours
  getWorkingHours: async (trainerId: number): Promise<WorkingHours[]> => {
    const { data } = await apiClient.get(`/trainer/working-hours/${trainerId}`);
    return data;
  },

  saveWorkingHours: async (
    trainerId: number,
    hours: WorkingHours[]
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post("/trainer/working-hours", {
      trainerId,
      workingHours: hours,
    });
    return data;
  },

  updateWorkingHour: async (
    id: number,
    updates: Partial<WorkingHours>
  ): Promise<WorkingHours> => {
    const { data } = await apiClient.put(`/trainer/working-hours/${id}`, updates);
    return data;
  },

  // Time-off
  getTimeOff: async (trainerId: number): Promise<TimeOff[]> => {
    const { data } = await apiClient.get(`/trainer/time-off/${trainerId}`);
    return data;
  },

  requestTimeOff: async (
    trainerId: number,
    startDate: string,
    endDate: string,
    reason: string,
    description?: string
  ): Promise<TimeOff> => {
    const { data } = await apiClient.post("/trainer/time-off/request", {
      trainerId,
      startDate,
      endDate,
      reason,
      description,
    });
    return data;
  },

  // Session Notes
  addSessionNote: async (
    trainerId: number,
    bookingId: number,
    memberId: number,
    content: string,
    focusAreas?: string[],
    performance?: number,
    nextFocus?: string
  ): Promise<SessionNote> => {
    const { data } = await apiClient.post("/trainer/session-notes", {
      trainerId,
      bookingId,
      memberId,
      content,
      focusAreas,
      performance,
      nextFocus,
    });
    return data;
  },

  getSessionNotes: async (
    trainerId: number,
    memberId?: number
  ): Promise<SessionNote[]> => {
    const { data } = await apiClient.get(`/trainer/session-notes/${trainerId}`, {
      params: memberId ? { memberId } : {},
    });
    return data;
  },

  // Workout Plans
  createWorkoutPlan: async (
    trainerId: number,
    memberId: number,
    title: string,
    content: string,
    options?: {
      duration?: number;
      difficulty?: string;
      startDate?: string;
    }
  ): Promise<WorkoutPlan> => {
    const { data } = await apiClient.post("/trainer/workout-plans", {
      trainerId,
      memberId,
      title,
      content,
      ...options,
    });
    return data;
  },

  getWorkoutPlans: async (
    trainerId: number,
    memberId?: number
  ): Promise<WorkoutPlan[]> => {
    const { data } = await apiClient.get(`/trainer/workout-plans/${trainerId}`, {
      params: memberId ? { memberId } : {},
    });
    return data;
  },

  // Earnings
  getEarnings: async (trainerId: number): Promise<TrainerEarnings> => {
    const { data } = await apiClient.get(`/trainer/earnings/${trainerId}`);
    return data;
  },

  requestWithdrawal: async (
    trainerId: number,
    amount: number,
    method: string
  ): Promise<{ success: boolean; requestId: number }> => {
    const { data } = await apiClient.post("/trainer/withdrawal-request", {
      trainerId,
      amount,
      method,
    });
    return data;
  },
};
```

Create `src/api/member-api.ts`:

```typescript
import { apiClient } from "./api-client";
import {
  WaitlistEntry,
  MembershipFreeze,
  MemberCard,
  BookingCancellation,
} from "@/models/extended-models";

export const memberApi = {
  // Waitlist
  getWaitlist: async (memberId: number): Promise<WaitlistEntry[]> => {
    const { data } = await apiClient.get(`/member/waitlist/${memberId}`);
    return data;
  },

  joinWaitlist: async (
    memberId: number,
    itemType: string,
    itemId: number
  ): Promise<WaitlistEntry> => {
    const { data } = await apiClient.post("/member/waitlist/join", {
      memberId,
      itemType,
      itemId,
    });
    return data;
  },

  leaveWaitlist: async (waitlistId: number): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/member/waitlist/${waitlistId}`);
    return data;
  },

  // Membership Freeze
  getFreezeRequests: async (memberId: number): Promise<MembershipFreeze[]> => {
    const { data } = await apiClient.get(`/member/freeze/${memberId}`);
    return data;
  },

  requestFreeze: async (
    memberId: number,
    startDate: string,
    endDate: string,
    reason: string,
    notes?: string
  ): Promise<MembershipFreeze> => {
    const { data } = await apiClient.post("/member/freeze/request", {
      memberId,
      startDate,
      endDate,
      reason,
      notes,
    });
    return data;
  },

  // Member Card
  getMemberCard: async (memberId: number): Promise<MemberCard> => {
    const { data } = await apiClient.get(`/member/card/${memberId}`);
    return data;
  },

  generateMemberCard: async (memberId: number): Promise<MemberCard> => {
    const { data } = await apiClient.post("/member/card/generate", { memberId });
    return data;
  },

  // Check-in
  checkInFacility: async (
    memberId: number,
    qrCode: string
  ): Promise<{ success: boolean; checkedInAt: string }> => {
    const { data } = await apiClient.post("/member/check-in/facility", {
      memberId,
      qrCode,
    });
    return data;
  },

  // Cancellation
  getCancellationPolicy: async (
    bookingId: number
  ): Promise<{
    bookingId: number;
    hoursBeforeCancellation: number;
    refundPercentage: number;
    penalty?: number;
  }> => {
    const { data } = await apiClient.get(
      `/booking/${bookingId}/cancellation-policy`
    );
    return data;
  },

  cancelBooking: async (
    memberId: number,
    bookingId: number,
    reason: string
  ): Promise<{
    success: boolean;
    refundAmount: number;
    penalty?: number;
    cancellationId: number;
  }> => {
    const { data } = await apiClient.post("/booking/cancel", {
      memberId,
      bookingId,
      reason,
    });
    return data;
  },

  getCancellations: async (
    memberId: number
  ): Promise<BookingCancellation[]> => {
    const { data } = await apiClient.get(`/member/cancellations/${memberId}`);
    return data;
  },
};
```

Create `src/api/admin-api.ts`:

```typescript
import { apiClient } from "./api-client";
import {
  Voucher,
  PushCampaign,
  RefundRequest,
  TransactionReport,
} from "@/models/extended-models";

export const adminApi = {
  // Vouchers
  getVouchers: async (): Promise<Voucher[]> => {
    const { data } = await apiClient.get("/admin/vouchers");
    return data;
  },

  createVoucher: async (voucher: Partial<Voucher>): Promise<Voucher> => {
    const { data } = await apiClient.post("/admin/vouchers", voucher);
    return data;
  },

  updateVoucher: async (id: number, updates: Partial<Voucher>): Promise<Voucher> => {
    const { data } = await apiClient.put(`/admin/vouchers/${id}`, updates);
    return data;
  },

  deleteVoucher: async (id: number): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/admin/vouchers/${id}`);
    return data;
  },

  // Campaigns
  getCampaigns: async (): Promise<PushCampaign[]> => {
    const { data } = await apiClient.get("/admin/campaigns");
    return data;
  },

  createCampaign: async (campaign: Partial<PushCampaign>): Promise<PushCampaign> => {
    const { data } = await apiClient.post("/admin/campaigns", campaign);
    return data;
  },

  sendCampaignNow: async (
    campaignId: number
  ): Promise<{ success: boolean; sentCount: number }> => {
    const { data } = await apiClient.post(
      `/admin/campaigns/${campaignId}/send-now`,
      {}
    );
    return data;
  },

  // Refunds
  getRefundRequests: async (): Promise<RefundRequest[]> => {
    const { data } = await apiClient.get("/admin/refund-requests");
    return data;
  },

  approveRefund: async (
    refundId: number,
    amount: number,
    method?: string,
    notes?: string
  ): Promise<RefundRequest> => {
    const { data } = await apiClient.post(
      `/admin/refund-requests/${refundId}/approve`,
      {
        approvedAmount: amount,
        refundMethod: method,
        notes,
      }
    );
    return data;
  },

  rejectRefund: async (refundId: number): Promise<RefundRequest> => {
    const { data } = await apiClient.post(
      `/admin/refund-requests/${refundId}/reject`,
      {}
    );
    return data;
  },

  // Reports
  getTransactionReports: async (
    fromDate?: string,
    toDate?: string
  ): Promise<TransactionReport[]> => {
    const { data } = await apiClient.get("/admin/reports/transactions", {
      params: { fromDate, toDate },
    });
    return data;
  },

  getRevenueStats: async (
    fromDate?: string,
    toDate?: string
  ): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    avgOrderValue: number;
  }> => {
    const { data } = await apiClient.get("/admin/reports/revenue-stats", {
      params: { fromDate, toDate },
    });
    return data;
  },

  exportReport: async (fromDate?: string, toDate?: string): Promise<Blob> => {
    const response = await apiClient.get("/admin/reports/transactions/export", {
      params: { fromDate, toDate, format: "csv" },
      responseType: "blob",
    });
    return response.data;
  },
};
```

## 4. Custom Hooks

Create `src/hooks/useTrainerManagement.ts`:

```typescript
import { useState } from "react";
import { trainerApi } from "@/api/trainer-api";
import {
  WorkingHours,
  TimeOff,
  SessionNote,
  WorkoutPlan,
  TrainerEarnings,
} from "@/models/extended-models";

export function useTrainerManagement(trainerId: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Working Hours
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const fetchWorkingHours = async () => {
    setLoading(true);
    try {
      const data = await trainerApi.getWorkingHours(trainerId);
      setWorkingHours(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching working hours");
    } finally {
      setLoading(false);
    }
  };

  // Time-off
  const [timeOff, setTimeOff] = useState<TimeOff[]>([]);
  const fetchTimeOff = async () => {
    setLoading(true);
    try {
      const data = await trainerApi.getTimeOff(trainerId);
      setTimeOff(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching time-off");
    } finally {
      setLoading(false);
    }
  };

  // Session Notes
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const fetchSessionNotes = async (memberId?: number) => {
    setLoading(true);
    try {
      const data = await trainerApi.getSessionNotes(trainerId, memberId);
      setSessionNotes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching session notes");
    } finally {
      setLoading(false);
    }
  };

  // Workout Plans
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const fetchWorkoutPlans = async (memberId?: number) => {
    setLoading(true);
    try {
      const data = await trainerApi.getWorkoutPlans(trainerId, memberId);
      setWorkoutPlans(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching workout plans");
    } finally {
      setLoading(false);
    }
  };

  // Earnings
  const [earnings, setEarnings] = useState<TrainerEarnings | null>(null);
  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const data = await trainerApi.getEarnings(trainerId);
      setEarnings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching earnings");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    workingHours,
    timeOff,
    sessionNotes,
    workoutPlans,
    earnings,
    fetchWorkingHours,
    fetchTimeOff,
    fetchSessionNotes,
    fetchWorkoutPlans,
    fetchEarnings,
  };
}
```

Similarly create `src/hooks/useMemberFeatures.ts` and `src/hooks/useAdminManagement.ts` following the same pattern.

## 5. Screen Components

Create `app/trainer/availability.tsx`:

```typescript
import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useTrainerManagement } from "@/hooks/useTrainerManagement";

export default function TrainerAvailabilityScreen() {
  const trainerId = 1; // Get from auth context
  const {
    loading,
    workingHours,
    timeOff,
    fetchWorkingHours,
    fetchTimeOff,
  } = useTrainerManagement(trainerId);

  useEffect(() => {
    Promise.all([fetchWorkingHours(), fetchTimeOff()]);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold mb-4">Khung giờ làm việc</Text>

      {/* Working Hours Section */}
      <View className="bg-white rounded-lg p-4 mb-4">
        {workingHours.map((hour) => (
          <View key={hour.id} className="py-2 border-b border-gray-200">
            <Text className="font-semibold">Thứ {hour.dayOfWeek + 1}</Text>
            <Text className="text-gray-600">
              {hour.startTime} - {hour.endTime}
            </Text>
          </View>
        ))}
      </View>

      <Text className="text-2xl font-bold mb-4">Nghỉ phép</Text>

      {/* Time-off Section */}
      <View className="bg-white rounded-lg p-4">
        {timeOff.map((t) => (
          <View key={t.id} className="py-2 border-b border-gray-200">
            <Text className="font-semibold">{t.reason}</Text>
            <Text className="text-gray-600">
              {t.startDate} - {t.endDate}
            </Text>
            <Text
              className={`text-sm mt-1 ${
                t.status === "approved" ? "text-green-600" : "text-orange-600"
              }`}
            >
              {t.status}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
```

## 6. Navigation Setup

Update `app/_layout.tsx` to include new screens:

```typescript
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* Trainer Screens */}
      <Stack.Screen
        name="trainer/availability"
        options={{ title: "Khung giờ làm việc" }}
      />
      <Stack.Screen
        name="trainer/client-management"
        options={{ title: "Quản lý khách hàng" }}
      />
      <Stack.Screen
        name="trainer/earnings"
        options={{ title: "Thu nhập" }}
      />

      {/* Member Screens */}
      <Stack.Screen
        name="member/flexibility"
        options={{ title: "Tính linh hoạt" }}
      />
      <Stack.Screen
        name="member/checkin-cancellation"
        options={{ title: "Check-in & Hủy lịch" }}
      />

      {/* Admin Screens */}
      <Stack.Screen
        name="admin/marketing"
        options={{ title: "Marketing" }}
      />
      <Stack.Screen
        name="admin/reports-refunds"
        options={{ title: "Báo cáo & Hoàn tiền" }}
      />
    </Stack>
  );
}
```

## 7. Implementation Phases

Phase 1: Set up project structure and models
Phase 2: Implement API services (trainer, member, admin)
Phase 3: Create custom hooks for state management
Phase 4: Build screen components (Trainer features first)
Phase 5: Build member feature screens
Phase 6: Build admin feature screens
Phase 7: Add navigation and routing
Phase 8: Testing and bug fixes

## 8. Key Dependencies

Ensure package.json includes:
- react-native
- expo
- expo-router
- axios (or fetch API wrapper)
- zustand or jotai (state management)
- react-query or swr (data fetching)
- react-native-paper (UI components)
- nativewind (Tailwind CSS for React Native)

## 9. Testing

```bash
npm test
npm run lint
npm run type-check
```

## 10. Build for Production

```bash
eas build --platform android
eas build --platform ios
```
