import { useState, useCallback } from 'react';
import adminApi from '../api/admin-api';
import {
  Voucher,
  PushCampaign,
  RefundRequest,
  TransactionReport,
} from '../models/extended-models';

export const useAdminManagement = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [transactions, setTransactions] = useState<TransactionReport[]>([]);
  const [revenueStats, setRevenueStats] = useState<{
    total_revenue: number;
    total_transactions: number;
    avg_order_value: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voucher Methods
  const fetchVouchers = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const data = await adminApi.getVouchers(status);
      setVouchers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createVoucher = useCallback(async (payload: {
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_uses?: number;
    min_order_amount?: number;
    valid_from: string;
    valid_until: string;
    applicable_to: string;
  }) => {
    setLoading(true);
    try {
      const response = await adminApi.createVoucher(payload);
      await fetchVouchers();
      setError(null);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchVouchers]);

  const updateVoucher = useCallback(
    async (
      id: number,
      payload: {
        is_active?: boolean;
        valid_until?: string;
        max_uses?: number;
      }
    ) => {
      setLoading(true);
      try {
        const response = await adminApi.updateVoucher(id, payload);
        await fetchVouchers();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchVouchers]
  );

  const deleteVoucher = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        const response = await adminApi.deleteVoucher(id);
        await fetchVouchers();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchVouchers]
  );

  // Campaign Methods
  const fetchCampaigns = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const data = await adminApi.getCampaigns(status);
      setCampaigns(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCampaign = useCallback(
    async (payload: {
      title: string;
      message: string;
      target_audience: string;
      send_at?: string;
    }) => {
      setLoading(true);
      try {
        const response = await adminApi.createCampaign(payload);
        await fetchCampaigns();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCampaigns]
  );

  const sendCampaignNow = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        const response = await adminApi.sendCampaignNow(id);
        await fetchCampaigns();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCampaigns]
  );

  // Refund Methods
  const fetchRefunds = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const data = await adminApi.getRefundRequests(status);
      setRefunds(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveRefund = useCallback(
    async (
      id: number,
      payload: {
        approved_amount: number;
        refund_method: 'wallet' | 'bank_transfer';
        notes?: string;
      }
    ) => {
      setLoading(true);
      try {
        const response = await adminApi.approveRefund(id, payload);
        await fetchRefunds();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchRefunds]
  );

  const rejectRefund = useCallback(
    async (id: number, reason?: string) => {
      setLoading(true);
      try {
        const response = await adminApi.rejectRefund(id, reason);
        await fetchRefunds();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchRefunds]
  );

  // Report Methods
  const fetchTransactionReports = useCallback(
    async (params?: {
      fromDate?: string;
      toDate?: string;
      type?: string;
      per_page?: number;
    }) => {
      setLoading(true);
      try {
        const response = await adminApi.getTransactionReports(params);
        setTransactions(response.data);
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchRevenueStats = useCallback(
    async (params?: {
      fromDate?: string;
      toDate?: string;
    }) => {
      setLoading(true);
      try {
        const data = await adminApi.getRevenueStats(params);
        setRevenueStats(data);
        setError(null);
        return data;
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const exportTransactionReports = useCallback(
    async (params?: {
      fromDate?: string;
      toDate?: string;
    }) => {
      setLoading(true);
      try {
        const blob = await adminApi.exportTransactionReports(params);
        setError(null);
        return blob;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchTrainerPayroll = useCallback(
    async (params?: {
      fromDate?: string;
      toDate?: string;
      trainerId?: number;
    }) => {
      setLoading(true);
      try {
        const data = await adminApi.getTrainerPayroll(params);
        setError(null);
        return data;
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchMemberActivity = useCallback(
    async (params?: {
      fromDate?: string;
      toDate?: string;
    }) => {
      setLoading(true);
      try {
        const data = await adminApi.getMemberActivity(params);
        setError(null);
        return data;
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    vouchers,
    campaigns,
    refunds,
    transactions,
    revenueStats,
    loading,
    error,
    fetchVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    fetchCampaigns,
    createCampaign,
    sendCampaignNow,
    fetchRefunds,
    approveRefund,
    rejectRefund,
    fetchTransactionReports,
    fetchRevenueStats,
    exportTransactionReports,
    fetchTrainerPayroll,
    fetchMemberActivity,
  };
};
