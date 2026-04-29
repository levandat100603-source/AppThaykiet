import { useState, useCallback } from 'react';
import trainerApi from '../api/trainer-api';
import {
  WorkingHour,
  TimeOff,
  SessionNote,
  WorkoutPlan,
  TrainerEarning,
} from '../models/extended-models';

export const useTrainerManagement = (trainerId: number) => {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [trainerSchedule, setTrainerSchedule] = useState<any[]>([]);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [rejectedBookings, setRejectedBookings] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<TrainerEarning | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkingHours = useCallback(async () => {
    setLoading(true);
    try {
      const data = await trainerApi.getWorkingHours(trainerId);
      setWorkingHours(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [trainerId]);

  const saveWorkingHours = useCallback(
    async (hours: Omit<WorkingHour, 'id'>[]) => {
      setLoading(true);
      try {
        const response = await trainerApi.saveWorkingHours(trainerId, hours);
        await fetchWorkingHours();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [trainerId, fetchWorkingHours]
  );

  const fetchTimeOffs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await trainerApi.getTimeOff(trainerId);
      setTimeOffs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [trainerId]);

  const requestTimeOff = useCallback(
    async (payload: {
      start_date: string;
      end_date: string;
      reason: string;
      description?: string;
    }) => {
      setLoading(true);
      try {
        const response = await trainerApi.requestTimeOff({
          trainer_id: trainerId,
          ...payload,
        });
        await fetchTimeOffs();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [trainerId, fetchTimeOffs]
  );

  const updateTimeOff = useCallback(
    async (
      id: number,
      payload: {
        status: string;
        approved_by?: number;
        notes?: string;
      }
    ) => {
      setLoading(true);
      try {
        const response = await trainerApi.updateTimeOff(id, payload);
        await fetchTimeOffs();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTimeOffs]
  );

  const cancelTimeOff = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        const response = await trainerApi.cancelTimeOff(id);
        await fetchTimeOffs();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTimeOffs]
  );

  const fetchSessionNotes = useCallback(
    async (memberId?: number) => {
      setLoading(true);
      try {
        const data = await trainerApi.getSessionNotes(trainerId, memberId);
        setSessionNotes(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [trainerId]
  );

  const addSessionNote = useCallback(
    async (payload: {
      booking_id: number;
      member_id: number;
      content: string;
      focus_areas?: string[];
      performance?: number;
      next_focus?: string;
    }) => {
      setLoading(true);
      try {
        const response = await trainerApi.addSessionNote({
          trainer_id: trainerId,
          ...payload,
        });
        await fetchSessionNotes();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [trainerId, fetchSessionNotes]
  );

  const updateSessionNote = useCallback(
    async (id: number, payload: Partial<SessionNote>) => {
      setLoading(true);
      try {
        const response = await trainerApi.updateSessionNote(id, payload);
        await fetchSessionNotes();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchSessionNotes]
  );

  const deleteSessionNote = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        const response = await trainerApi.deleteSessionNote(id);
        await fetchSessionNotes();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchSessionNotes]
  );

  const fetchWorkoutPlans = useCallback(
    async (memberId?: number) => {
      setLoading(true);
      try {
        const data = await trainerApi.getWorkoutPlans(trainerId, memberId);
        setWorkoutPlans(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [trainerId]
  );

  const createWorkoutPlan = useCallback(
    async (payload: {
      member_id: number;
      title: string;
      content: string;
      duration?: number;
      difficulty?: string;
      start_date?: string;
      end_date?: string;
    }) => {
      setLoading(true);
      try {
        const response = await trainerApi.createWorkoutPlan({
          trainer_id: trainerId,
          ...payload,
        });
        await fetchWorkoutPlans();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [trainerId, fetchWorkoutPlans]
  );

  const updateWorkoutPlan = useCallback(
    async (id: number, payload: Partial<WorkoutPlan>) => {
      setLoading(true);
      try {
        const response = await trainerApi.updateWorkoutPlan(id, payload);
        await fetchWorkoutPlans();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchWorkoutPlans]
  );

  const deleteWorkoutPlan = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        const response = await trainerApi.deleteWorkoutPlan(id);
        await fetchWorkoutPlans();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchWorkoutPlans]
  );

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await trainerApi.getEarnings(trainerId);
      setEarnings(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [trainerId]);

  const requestWithdrawal = useCallback(
    async (payload: {
      amount: number;
      method: 'bank_transfer' | 'wallet';
      bank_details?: Record<string, string>;
    }) => {
      setLoading(true);
      try {
        const response = await trainerApi.requestWithdrawal({
          trainer_id: trainerId,
          ...payload,
        });
        await fetchEarnings();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [trainerId, fetchEarnings]
  );

  const fetchWithdrawalRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await trainerApi.getWithdrawalRequests(trainerId);
      setWithdrawalRequests(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [trainerId]);

  const fetchTrainerSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const data = await trainerApi.getTrainerSchedule();
      setTrainerSchedule(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await trainerApi.getPendingBookings();
      setPendingBookings(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRejectedBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await trainerApi.getRejectedBookings();
      setRejectedBookings(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkInTrainerBooking = useCallback(
    async (bookingId: number) => {
      setLoading(true);
      try {
        const response = await trainerApi.checkInTrainerBooking(bookingId);
        await fetchTrainerSchedule();
        await fetchPendingBookings();
        await fetchRejectedBookings();
        await fetchEarnings();
        setError(null);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchEarnings, fetchPendingBookings, fetchRejectedBookings, fetchTrainerSchedule]
  );

  return {
    workingHours,
    timeOffs,
    sessionNotes,
    workoutPlans,
    withdrawalRequests,
    trainerSchedule,
    pendingBookings,
    rejectedBookings,
    earnings,
    loading,
    error,
    fetchWorkingHours,
    saveWorkingHours,
    fetchTimeOffs,
    requestTimeOff,
    updateTimeOff,
    cancelTimeOff,
    fetchSessionNotes,
    addSessionNote,
    updateSessionNote,
    deleteSessionNote,
    fetchWorkoutPlans,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan,
    fetchEarnings,
    requestWithdrawal,
    fetchWithdrawalRequests,
    fetchTrainerSchedule,
    fetchPendingBookings,
    fetchRejectedBookings,
    checkInTrainerBooking,
  };
};
