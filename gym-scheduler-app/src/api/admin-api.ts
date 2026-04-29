import { AxiosError, isAxiosError } from 'axios';
import { api } from './client';
import {
  Voucher,
  PushCampaign,
  RefundRequest,
  TransactionReport,
} from '../models/extended-models';

class AdminApi {
  private readonly prefix = '/admin';

  // Voucher Management
  async getVouchers(status?: string): Promise<Voucher[]> {
    try {
      const params = status ? { status } : {};
      const response = await api.get(`${this.prefix}/vouchers`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createVoucher(payload: {
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_uses?: number;
    min_order_amount?: number;
    valid_from: string;
    valid_until: string;
    applicable_to: string;
  }): Promise<Voucher> {
    try {
      const response = await api.post(`${this.prefix}/vouchers`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateVoucher(
    id: number,
    payload: {
      is_active?: boolean;
      valid_until?: string;
      max_uses?: number;
    }
  ): Promise<Voucher> {
    try {
      const response = await api.put(`${this.prefix}/vouchers/${id}`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteVoucher(id: number): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(`${this.prefix}/vouchers/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async activateVoucher(id: number): Promise<Voucher> {
    try {
      const response = await api.post(`${this.prefix}/vouchers/${id}/activate`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deactivateVoucher(id: number): Promise<Voucher> {
    try {
      const response = await api.post(`${this.prefix}/vouchers/${id}/deactivate`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Push Campaign Management
  async getCampaigns(status?: string): Promise<PushCampaign[]> {
    try {
      const params = status ? { status } : {};
      const response = await api.get(`${this.prefix}/campaigns`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createCampaign(payload: {
    title: string;
    message: string;
    target_audience: string;
    send_at?: string;
  }): Promise<PushCampaign> {
    try {
      const response = await api.post(`${this.prefix}/campaigns`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCampaign(
    id: number,
    payload: {
      title?: string;
      message?: string;
      target_audience?: string;
    }
  ): Promise<PushCampaign> {
    try {
      const response = await api.put(`${this.prefix}/campaigns/${id}`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async scheduleCampaign(id: number, send_at: string): Promise<PushCampaign> {
    try {
      const response = await api.post(`${this.prefix}/campaigns/${id}/schedule`, { send_at });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendCampaignNow(id: number): Promise<{ success: boolean; sentCount: number }> {
    try {
      const response = await api.post(`${this.prefix}/campaigns/${id}/send`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteCampaign(id: number): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(`${this.prefix}/campaigns/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Refund Management
  async getRefundRequests(status?: string): Promise<RefundRequest[]> {
    try {
      const params = status ? { status } : {};
      const response = await api.get(`${this.prefix}/refunds`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async approveRefund(
    id: number,
    payload: {
      approved_amount: number;
      refund_method: 'wallet' | 'bank_transfer';
      notes?: string;
    }
  ): Promise<RefundRequest> {
    try {
      const response = await api.post(`${this.prefix}/refunds/${id}/approve`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rejectRefund(id: number, reason?: string): Promise<RefundRequest> {
    try {
      const response = await api.post(`${this.prefix}/refunds/${id}/reject`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateRefundRequest(
    id: number,
    payload: {
      status?: string;
      approved_amount?: number;
    }
  ): Promise<RefundRequest> {
    try {
      const response = await api.put(`${this.prefix}/refunds/${id}`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reports and Statistics
  async getTransactionReports(
    params?: {
      fromDate?: string;
      toDate?: string;
      type?: string;
      per_page?: number;
    }
  ): Promise<{ data: TransactionReport[]; total: number; per_page: number }> {
    try {
      const response = await api.get(`${this.prefix}/transactions`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportTransactionReports(
    params?: {
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.prefix}/transactions/export`, {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRevenueStats(params?: {
    fromDate?: string;
    toDate?: string;
  }): Promise<{
    total_revenue: number;
    total_transactions: number;
    avg_order_value: number;
  }> {
    try {
      const response = await api.get(`${this.prefix}/revenue-stats`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTrainerPayroll(params?: {
    fromDate?: string;
    toDate?: string;
    trainerId?: number;
  }): Promise<
    Array<{
      trainer_id: number;
      trainer_name: string;
      total_sessions: number;
      total_earnings: number;
      commission_rate: number;
      payable_amount: number;
    }>
  > {
    try {
      const response = await api.get(`${this.prefix}/payroll`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMemberActivity(params?: {
    fromDate?: string;
    toDate?: string;
  }): Promise<{
    active_members: number;
    inactive_members: number;
    new_members: number;
    cancelled_members: number;
    retention_rate: number;
  }> {
    try {
      const response = await api.get(`${this.prefix}/member-activity`, { params });
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

export default new AdminApi();
