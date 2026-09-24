import { useState, useEffect, useCallback } from 'react';
import { SystemState, QueueTicket, AuthSession } from '../types/queue';

export function useQueueStore() {
  const [data, setData] = useState<{
    services: SystemState['services'];
    desks: SystemState['desks'];
    stats: {
      totalToday: number;
      waitingCount: number;
      servingCount: number;
      completedCount: number;
      skippedCount: number;
      cancelledCount: number;
      slaBreachCount: number;
      avgWaitMinutes: number;
      avgServiceMinutes: number;
    };
    schedule: SystemState['schedule'];
    tickets: QueueTicket[];
    lastCallBroadcast?: SystemState['lastCallBroadcast'];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth Session State stored in LocalStorage
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem('siantri_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch('/api/queue/public');
      if (!res.ok) throw new Error('Gagal memuat data antrian');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    // Poll every 3 seconds for real-time queue updates
    const timer = setInterval(refreshData, 3000);
    return () => clearInterval(timer);
  }, [refreshData]);

  const saveSession = (newSession: AuthSession | null) => {
    setSession(newSession);
    if (newSession) {
      localStorage.setItem('siantri_session', JSON.stringify(newSession));
    } else {
      localStorage.removeItem('siantri_session');
    }
  };

  const logout = () => {
    saveSession(null);
  };

  return {
    data,
    loading,
    error,
    session,
    saveSession,
    logout,
    refreshData,
  };
}
