import { useState, useEffect } from 'react';
import { 
  Building2, 
  Tv, 
  UserCheck, 
  ShieldCheck, 
  SlidersHorizontal, 
  LogOut, 
  Clock, 
  QrCode
} from 'lucide-react';
import { AuthSession } from '../types/queue';

// Import generated image path for logo
import logoImg from '../assets/images/dukcapil_logo_1790251157061.jpg';

interface HeaderProps {
  currentView: 'public' | 'tv' | 'petugas' | 'supervisor' | 'admin' | 'check';
  setCurrentView: (view: 'public' | 'tv' | 'petugas' | 'supervisor' | 'admin' | 'check') => void;
  session: AuthSession | null;
  onOpenAuth: (targetView: 'petugas' | 'supervisor' | 'admin') => void;
  onLogout: () => void;
}

export default function Header({
  currentView,
  setCurrentView,
  session,
  onOpenAuth,
  onLogout,
}: HeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleModeClick = (view: 'public' | 'tv' | 'petugas' | 'supervisor' | 'admin' | 'check') => {
    if (view === 'public' || view === 'tv' || view === 'check') {
      setCurrentView(view);
      return;
    }

    // Check if session satisfies required role
    if (!session) {
      onOpenAuth(view);
      return;
    }

    if (view === 'admin' && session.user.role !== 'admin') {
      onOpenAuth('admin');
      return;
    }

    if (view === 'supervisor' && session.user.role !== 'supervisor' && session.user.role !== 'admin') {
      onOpenAuth('supervisor');
      return;
    }

    setCurrentView(view);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 text-slate-100 transition-all shadow-xl shadow-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          
          {/* Zone 1: Official Brand & Logo */}
          <div 
            onClick={() => setCurrentView('public')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 flex items-center justify-center shadow-md group-hover:border-emerald-500/60 group-hover:shadow-emerald-950/50 transition-all duration-200">
              <img 
                src={logoImg} 
                alt="Logo Disdukcapil" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Building2 className="w-6 h-6 text-emerald-400 absolute hidden border-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:text-emerald-400 transition-colors">
                  SiAntri Dukcapil
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  REPUBLIK INDONESIA
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-none">
                Sistem Antrian Loket Dinas Kependudukan & Pencatatan Sipil
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links / View Switcher */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 text-xs font-semibold shadow-inner">
            <button
              onClick={() => handleModeClick('public')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                currentView === 'public'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Portal Pemohon
            </button>

            <button
              onClick={() => handleModeClick('check')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                currentView === 'check'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              Cek Tiket
            </button>

            <button
              onClick={() => handleModeClick('tv')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                currentView === 'tv'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              TV Display
            </button>

            <button
              onClick={() => handleModeClick('petugas')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                currentView === 'petugas'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/60 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Loket Petugas
            </button>

            <button
              onClick={() => handleModeClick('supervisor')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                currentView === 'supervisor'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/60 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Supervisor SLA
            </button>

            <button
              onClick={() => handleModeClick('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                currentView === 'admin'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Panel Admin
            </button>
          </nav>

          {/* Zone 3: Actions, Clock & User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Operational Clock */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 shadow-inner">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold">{time.toLocaleTimeString('id-ID')}</span>
            </div>

            {/* Auth Session / Login Trigger */}
            {session ? (
              <div className="flex items-center gap-2 bg-slate-900/90 pl-3 pr-1.5 py-1.5 rounded-xl border border-slate-800 text-xs shadow-sm">
                <div className="text-right hidden sm:block">
                  <div className="font-semibold text-slate-200">{session.user.name}</div>
                  <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider font-bold">{session.user.role}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Logout Akun Staff"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('admin')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 active:scale-[0.98] transition-all"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Masuk Staff</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile View Switcher Row */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-1.5 border-t border-slate-800/80 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => handleModeClick('public')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-all ${
              currentView === 'public' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            Portal Pemohon
          </button>
          <button
            onClick={() => handleModeClick('check')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-all ${
              currentView === 'check' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            Cek Tiket
          </button>
          <button
            onClick={() => handleModeClick('tv')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-all ${
              currentView === 'tv' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            TV Display
          </button>
          <button
            onClick={() => handleModeClick('petugas')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-all ${
              currentView === 'petugas' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            Loket Petugas
          </button>
          <button
            onClick={() => handleModeClick('supervisor')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-all ${
              currentView === 'supervisor' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            Supervisor SLA
          </button>
          <button
            onClick={() => handleModeClick('admin')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-all ${
              currentView === 'admin' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            Panel Admin
          </button>
        </div>
      </div>
    </header>
  );
}
