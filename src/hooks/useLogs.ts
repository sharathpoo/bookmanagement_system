import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { LogEntry, ApiResponse } from '../types';

export const useLogs = (autoRefresh = false, refreshInterval = 5000) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (limit?: number) => {
    try {
      setLoading(true);
      setError(null);
      const response: ApiResponse<LogEntry[]> = await apiService.getLogs(limit);
      setLogs(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLogs();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    refetch: () => fetchLogs()
  };
};