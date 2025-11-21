import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/api';

// Generic data fetching hook
export const useFetch = (fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
};

// Query hooks
export const usePlayers = (groupId) => {
  return useFetch(() => api.getPlayers(groupId), [groupId]);
};

export const useLeaderboard = (groupId) => {
  return useFetch(() => api.getLeaderboard(groupId), [groupId]);
};

export const useRecentMatches = (groupId) => {
  return useFetch(() => api.getRecentMatches(groupId), [groupId]);
};

export const useGroups = () => {
  return useFetch(() => api.getGroups(), []);
};

export const useVoteStatus = (groupId) => {
  return useFetch(() => api.getVoteStatus(groupId), [groupId]);
};

// Mutation hook
export const useMutation = (mutationFn) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (variables) => {
    setIsPending(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
};

// Mutation hooks
export const useSubmitVote = () => {
  return useMutation(api.submitVote);
};

export const useAddPlayer = () => {
  return useMutation(api.addPlayer);
};

export const useEditPlayer = () => {
  return useMutation(api.editPlayer);
};

export const useDeletePlayer = () => {
  return useMutation(api.deletePlayer);
};

export const useBulkAddPlayers = () => {
  return useMutation(api.bulkAddPlayers);
};

export const useCreateMatch = () => {
  return useMutation(api.createMatch);
};

export const useUpdateAttendance = () => {
  return useMutation(api.updateAttendance);
};

export const useDeleteMatch = () => {
  return useMutation(api.deleteMatch);
};

export const useUpdateStats = () => {
  return useMutation(api.updateStats);
};

export const useStartVoting = () => {
  return useMutation(api.startVoting);
};

export const useCloseVoting = () => {
  return useMutation(api.closeVoting);
};

export const useEndMatch = () => {
  return useMutation(api.endMatch);
};
