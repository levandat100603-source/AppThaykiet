import { useState, useCallback } from 'react';
import memberApi from '../api/member-api';
import {
  WaitlistEntry,
  MembershipFreeze,
  MemberCard,
  BookingCancellation,
} from '../models/extended-models';

export const useMemberFeatures = (memberId: number) => {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [freezes, setFreezes] = useState<MembershipFreeze[]>([]);
  const [memberCard, setMemberCard] = useState<MemberCard | null>(null);
  const [cancellations, setCancellations] = useState<BookingCancellation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWaitlist = useCallback(async () => {
    setLoading(true);
    try {
      const data = await memberApi.getWaitlist(memberId);
      setWaitlist(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  const joinWaitlist = useCallback(
    async (payload: {
      item_type: 'class' | 'trainer';
      item_id: number;
    }) => {
      setLoading(true);
      try {
        const response = await memberApi.joinWaitlist({
          member_id: memberId,
          ...payload,
        });
        await fetchWaitlist();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [memberId, fetchWaitlist]
  );

  const leaveWaitlist = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        const response = await memberApi.leaveWaitlist(id);
        await fetchWaitlist();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchWaitlist]
  );

  const fetchFreezes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await memberApi.getFreezeRequests(memberId);
      setFreezes(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  const requestFreeze = useCallback(
    async (payload: {
      start_date: string;
      end_date: string;
      reason: string;
      notes?: string;
    }) => {
      setLoading(true);
      try {
        const response = await memberApi.requestFreeze({
          member_id: memberId,
          ...payload,
        });
        await fetchFreezes();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [memberId, fetchFreezes]
  );

  const cancelFreezeRequest = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        const response = await memberApi.cancelFreezeRequest(id);
        await fetchFreezes();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchFreezes]
  );

  const fetchMemberCard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await memberApi.getMemberCard(memberId);
      setMemberCard(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  const generateMemberCard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await memberApi.generateMemberCard(memberId);
      setMemberCard(data);
      setError(null);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  const checkInFacility = useCallback(
    async (qrCode: string) => {
      setLoading(true);
      try {
        const response = await memberApi.checkInFacility({
          member_id: memberId,
          qr_code: qrCode,
        });
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [memberId]
  );

  const fetchCancellations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await memberApi.getCancellations(memberId);
      setCancellations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  const cancelBooking = useCallback(
    async (payload: {
      booking_id: number;
      reason: string;
    }) => {
      setLoading(true);
      try {
        const response = await memberApi.cancelBooking({
          member_id: memberId,
          ...payload,
        });
        await fetchCancellations();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [memberId, fetchCancellations]
  );

  const getCancellationPolicy = useCallback(async (bookingId: number) => {
    setLoading(true);
    try {
      const response = await memberApi.getCancellationPolicy(bookingId);
      setError(null);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    waitlist,
    freezes,
    memberCard,
    cancellations,
    loading,
    error,
    fetchWaitlist,
    joinWaitlist,
    leaveWaitlist,
    fetchFreezes,
    requestFreeze,
    cancelFreezeRequest,
    fetchMemberCard,
    generateMemberCard,
    checkInFacility,
    fetchCancellations,
    cancelBooking,
    getCancellationPolicy,
  };
};
