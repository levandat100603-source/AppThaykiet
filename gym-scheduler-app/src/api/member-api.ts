import { AxiosError, isAxiosError } from 'axios';
import { api } from './client';
import {
  WaitlistEntry,
  MembershipFreeze,
  MemberCard,
  BookingCancellation,
} from '../models/extended-models';

class MemberApi {
  private readonly prefix = '/member';

  // Waitlist
  async getWaitlist(memberId: number): Promise<WaitlistEntry[]> {
    try {
      const response = await api.get(`${this.prefix}/waitlist/${memberId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async joinWaitlist(payload: {
    member_id: number;
    item_type: 'class' | 'trainer';
    item_id: number;
  }): Promise<WaitlistEntry> {
    try {
      const response = await api.post(`${this.prefix}/waitlist/join`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async leaveWaitlist(id: number): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(`${this.prefix}/waitlist/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async notifyWaitlistMember(id: number): Promise<{ notified: boolean }> {
    try {
      const response = await api.post(`${this.prefix}/waitlist/${id}/notify`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Membership Freeze
  async getFreezeRequests(memberId: number): Promise<MembershipFreeze[]> {
    try {
      const response = await api.get(`${this.prefix}/freezes/${memberId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async requestFreeze(payload: {
    member_id: number;
    start_date: string;
    end_date: string;
    reason: string;
    notes?: string;
  }): Promise<MembershipFreeze> {
    try {
      const response = await api.post(`${this.prefix}/freezes`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async approveFreezeRequest(
    id: number,
    payload: {
      status: 'approved' | 'rejected';
      approved_by: number;
      notes?: string;
    }
  ): Promise<MembershipFreeze> {
    try {
      const response = await api.put(`${this.prefix}/freezes/${id}`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelFreezeRequest(id: number): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(`${this.prefix}/freezes/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Member Card
  async getMemberCard(memberId: number): Promise<MemberCard | null> {
    try {
      const response = await api.get(`${this.prefix}/card/${memberId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateMemberCard(memberId: number): Promise<MemberCard> {
    try {
      const response = await api.post(`${this.prefix}/card/generate`, { member_id: memberId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkInFacility(payload: {
    member_id: number;
    qr_code: string;
  }): Promise<{ success: boolean; checkedInAt: string }> {
    try {
      const response = await api.post(`${this.prefix}/checkin`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCheckInHistory(memberId: number): Promise<any[]> {
    try {
      const response = await api.get(`${this.prefix}/checkin/history/${memberId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Booking Cancellation
  async getCancellationPolicy(bookingId: number): Promise<{
    booking_id: number;
    hours_before_cancellation: number;
    refund_percentage: number;
    penalty: number | null;
  }> {
    try {
      const response = await api.get(`${this.prefix}/cancellation-policy/${bookingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelBooking(payload: {
    member_id: number;
    booking_id: number;
    reason: string;
  }): Promise<{
    success: boolean;
    refundAmount: number;
    penalty: number;
    cancellationId: number;
  }> {
    try {
      const response = await api.post(`${this.prefix}/cancel-booking`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCancellations(memberId: number): Promise<BookingCancellation[]> {
    try {
      const response = await api.get(`${this.prefix}/cancellations/${memberId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const message = axiosError.response?.data?.message || axiosError.message;
      return new Error(message);
    }
    return error;
  }
}

export default new MemberApi();
