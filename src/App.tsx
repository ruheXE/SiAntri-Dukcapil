/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQueueStore } from './lib/store';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import PublicView from './components/views/PublicView';
import PetugasView from './components/views/PetugasView';
import SupervisorView from './components/views/SupervisorView';
import AdminView from './components/views/AdminView';
import TvDisplayView from './components/views/TvDisplayView';
import CheckStatusView from './components/views/CheckStatusView';

export default function App() {
  const { data, loading, error, session, saveSession, logout, refreshData } = useQueueStore();
  const [currentView, setCurrentView] = useState<'public' | 'tv' | 'petugas' | 'supervisor' | 'admin' | 'check'>('public');
  
  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [targetRole, setTargetRole] = useState<'admin' | 'supervisor' | 'petugas'>('admin');

  const handleOpenAuth = (role: 'admin' | 'supervisor' | 'petugas') => {
    setTargetRole(role);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (newSession: typeof session) => {
    saveSession(newSession);
    if (newSession) {
      if (newSession.user.role === 'petugas') setCurrentView('petugas');
      else if (newSession.user.role === 'supervisor') setCurrentView('supervisor');
      else if (newSession.user.role === 'admin') setCurrentView('admin');
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-spin mb-4">
          ⚙️
        </div>
        <p className="text-sm font-semibold text-slate-300">Menghubungkan ke Server SiAntri Dukcapil...</p>
      </div>
    );
  }

  const services = data?.services || [];
  const desks = data?.desks || [];
  const tickets = data?.tickets || [];
  const stats = data?.stats || {
    totalToday: 0,
    waitingCount: 0,
    servingCount: 0,
    completedCount: 0,
    skippedCount: 0,
    cancelledCount: 0,
    slaBreachCount: 0,
    avgWaitMinutes: 0,
    avgServiceMinutes: 0,
  };
  const schedule = data?.schedule || {
    announcementText: '',
    isPaused: false,
    agencyName: 'Dinas Kependudukan dan Pencatatan Sipil',
    agencyAddress: 'Jl. Pemuda No. 45, Kompleks Perkantoran Pemerintah Kota',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
      
      {/* Hide Header on Fullscreen TV Display */}
      {currentView !== 'tv' && (
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          session={session}
          onOpenAuth={handleOpenAuth}
          onLogout={logout}
        />
      )}

      {/* Main Container View Router */}
      <main className={`flex-1 ${currentView === 'tv' ? 'p-0' : 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6'}`}>
        
        {currentView === 'public' && (
          <PublicView
            services={services}
            tickets={tickets}
            stats={stats}
            schedule={schedule}
            onRefresh={refreshData}
          />
        )}

        {currentView === 'check' && (
          <CheckStatusView />
        )}

        {currentView === 'tv' && (
          <TvDisplayView
            desks={desks}
            tickets={tickets}
            schedule={schedule}
            lastCallBroadcast={data?.lastCallBroadcast}
          />
        )}

        {currentView === 'petugas' && (
          <PetugasView
            desks={desks}
            tickets={tickets}
            services={services}
            onRefresh={refreshData}
            currentUserDeskId={session?.user.deskId || 1}
          />
        )}

        {currentView === 'supervisor' && (
          <SupervisorView
            desks={desks}
            tickets={tickets}
            services={services}
            stats={stats}
            onRefresh={refreshData}
          />
        )}

        {currentView === 'admin' && (
          <AdminView
            onRefresh={refreshData}
            actionUser={session?.user.username || 'admin'}
          />
        )}

      </main>

      {/* Footer (hidden on TV) */}
      {currentView !== 'tv' && (
        <footer className="border-t border-slate-800 bg-slate-900/60 py-6 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-400">SiAntri Dukcapil v1.0 — Sistem Antrian Loket Digital Terintegrasi</p>
          <p>Hak Cipta © 2026 Dinas Kependudukan dan Pencatatan Sipil. Republik Indonesia.</p>
        </footer>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        targetRole={targetRole}
      />

    </div>
  );
}
