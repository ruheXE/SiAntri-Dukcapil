import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, KeyRound, CheckCircle2, X } from 'lucide-react';
import { AuthSession } from '../types/queue';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: AuthSession) => void;
  targetRole?: 'admin' | 'supervisor' | 'petugas';
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  targetRole = 'admin',
}: AuthModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal login.');
      }

      onSuccess(json.session);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuick = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Login Internal Staff</h3>
            <p className="text-xs text-slate-400">
              Akses terproteksi password untuk Admin, Supervisor, dan Petugas Loket.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username (mis. admin)"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Memverifikasi...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk Sistem</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials Helper Box for Evaluation */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 mb-2">
            Pilihan Akun Uji Coba Fast Login:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuick('admin', 'admin123')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all"
            >
              <div className="text-[11px] font-bold text-purple-400">Admin</div>
              <div className="text-[10px] text-slate-400 font-mono">admin123</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuick('supervisor', 'super123')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all"
            >
              <div className="text-[11px] font-bold text-amber-400">Supervisor</div>
              <div className="text-[10px] text-slate-400 font-mono">super123</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuick('petugas1', 'petugas123')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all"
            >
              <div className="text-[11px] font-bold text-blue-400">Petugas 01</div>
              <div className="text-[10px] text-slate-400 font-mono">petugas123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
