import { AxiosError, isAxiosError } from 'axios';
import { api } from './client';
import {
  WorkingHour,
  TimeOff,
  SessionNote,
  WorkoutPlan,
  TrainerEarning,
} from '../models/extended-models';

class TrainerApi {
  private readonly prefix = '/trainer';

  // Working Hours
  async getWorkingHours(trainerId: number): Promise<WorkingHour[]> {
    try {
      const response = await api.get(`${this.prefix}/working-hours/${trainerId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async saveWorkingHours(
    trainerId: number,
    workingHours: Omit<WorkingHour, 'id'>[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`${this.prefix}/working-hours`, {
        trainer_id: trainerId,
        working_hours: workingHours,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Time Off
  async getTimeOff(trainerId: number): Promise<TimeOff[]> {
    try {
      const response = await api.get(`${this.prefix}/time-off/${trainerId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async requestTimeOff(payload: {
    trainer_id: number;
    start_date: string;
    end_date: string;
    reason: string;
    description?: string;
  }): Promise<TimeOff> {
    try {
      const response = await api.post(`${this.prefix}/time-off/request`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTimeOff(
    id: number,
    payload: {
      status: string;
      approved_by?: number;
      notes?: string;
    }
  ): Promise<TimeOff> {
    try {
      const response = await api.put(`${this.prefix}/time-off/${id}`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelTimeOff(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`${this.prefix}/time-off/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Session Notes
  async addSessionNote(payload: {
    trainer_id: number;
    booking_id: number;
    member_id: number;
    content: string;
    focus_areas?: string[];
    performance?: number;
    next_focus?: string;
  }): Promise<SessionNote> {
    try {
      const response = await api.post(`${this.prefix}/session-notes`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSessionNotes(trainerId: number, memberId?: number): Promise<SessionNote[]> {
    try {
      const params = memberId ? { member_id: memberId } : {};
      const response = await api.get(`${this.prefix}/session-notes/${trainerId}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSessionNote(
    id: number,
    payload: Partial<SessionNote>
  ): Promise<SessionNote> {
    try {
      const response = await api.put(`${this.prefix}/session-notes/${id}`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteSessionNote(id: number): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(`${this.prefix}/session-notes/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Workout Plans
  async createWorkoutPlan(payload: {
    trainer_id: number;
    member_id: number;
    title: string;
    content: string;
    duration?: number;
    difficulty?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<WorkoutPlan> {
    try {
      const response = await api.post(`${this.prefix}/workout-plans`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWorkoutPlans(trainerId: number, memberId?: number): Promise<WorkoutPlan[]> {
    try {
      const params = memberId ? { member_id: memberId } : {};
      const response = await api.get(`${this.prefix}/workout-plans/${trainerId}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateWorkoutPlan(id: number, payload: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    try {
      const response = await api.put(`${this.prefix}/workout-plans/${id}`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteWorkoutPlan(id: number): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(`${this.prefix}/workout-plans/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Earnings
  async getEarnings(trainerId: number): Promise<TrainerEarning> {
    try {
      const response = await api.get(`${this.prefix}/earnings/${trainerId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async requestWithdrawal(payload: {
    trainer_id: number;
    amount: number;
    method: 'bank_transfer' | 'wallet';
    bank_details?: Record<string, string>;
  }): Promise<{ success: boolean; requestId: number; message: string }> {
    try {
      const response = await api.post(`${this.prefix}/withdrawal-request`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWithdrawalRequests(trainerId: number): Promise<any[]> {
    try {
      const response = await api.get(`${this.prefix}/withdrawal-requests/${trainerId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTrainerSchedule(): Promise<any[]> {
    try {
      const response = await api.get('/bookings/trainer-schedule');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPendingBookings(): Promise<any[]> {
    try {
      const response = await api.get('/bookings/pending');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRejectedBookings(): Promise<any[]> {
    try {
      const response = await api.get('/bookings/rejected');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkInTrainerBooking(bookingId: number): Promise<{ success: boolean; message: string; payout: number }> {
    try {
      const response = await api.post('/bookings/checkin', { booking_id: bookingId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const responseData = axiosError.response?.data;
      const validationErrors = responseData?.errors
        ? Object.values(responseData.errors).flat().filter(Boolean)
        : [];
      const message = responseData?.message || validationErrors.join('\n') || axiosError.message;
      return new Error(message);
    }
    return error;
  }
}

export default new TrainerApi();
