import React, { useState } from 'react';
import { 
  Volume2, 
  CheckCircle2, 
  PauseCircle, 
  SkipForward, 
  Play, 
  ArrowRightLeft, 
  UserCheck, 
  Clock, 
  FileText, 
  AlertCircle,
  Building2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { QueueDesk, QueueTicket, QueueService } from '../../types/queue';
import { announceTicket } from '../../lib/audio';

interface PetugasViewProps {
  desks: QueueDesk[];
  tickets: QueueTicket[];
  services: QueueService[];
  onRefresh: () => void;
  currentUserDeskId?: number;
}

export default function PetugasView({
  desks,
  tickets,
  services,
  onRefresh,
  currentUserDeskId = 1,
}: PetugasViewProps) {
  const [activeDeskId, setActiveDeskId] = useState<number>(currentUserDeskId);
  const [notes, setNotes] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const currentDesk = desks.find(d => d.id === activeDeskId) || desks[0];
  const currentTicket = tickets.find(t => t.id === currentDesk?.currentTicketId) || null;

  // Filter tickets waiting for this desk's assigned services
  const waitingTickets = tickets.filter(t => 
    t.status === 'waiting' && currentDesk.assignedServiceIds.includes(t.serviceId)
  );

  // Filter held tickets
  const heldTickets = tickets.filter(t => 
    t.status === 'held' && currentDesk.assignedServiceIds.includes(t.serviceId)
  );

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/desk/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId: activeDeskId }),
      });
      const json = await res.json();
      onRefresh();

      if (json.ticket) {
        // Trigger Text-to-speech Indonesian Announcement!
        announceTicket(json.ticket.id, currentDesk.name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecall = async () => {
    if (!currentTicket) return;
    setActionLoading(true);
    try {
      await fetch('/api/desk/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId: activeDeskId }),
      });
      onRefresh();
      announceTicket(currentTicket.id, currentDesk.name);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleServe = async () => {
    if (!currentTicket) return;
    setActionLoading(true);
    try {
      await fetch('/api/desk/serve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId: activeDeskId }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!currentTicket) return;
    setActionLoading(true);
    try {
      await fetch('/api/desk/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId: activeDeskId, notes }),
      });
      setNotes('');
      setShowFinishModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleHold = async () => {
    if (!currentTicket) return;
    setActionLoading(true);
    try {
      await fetch('/api/desk/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId: activeDeskId, reason: holdReason }),
      });
      setHoldReason('');
      setShowHoldModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!currentTicket) return;
    setActionLoading(true);
    try {
      await fetch('/api/desk/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId: activeDeskId, reason: skipReason }),
      });
      setSkipReason('');
      setShowSkipModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (status: 'active' | 'paused' | 'closed') => {
    try {
      await fetch('/api/desk/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId: activeDeskId, status }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Desk Switcher */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">DASBOR OPERASIONAL PETUGAS</span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>{currentDesk.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
              currentDesk.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {currentDesk.status === 'active' ? 'LOKET BUKA' : 'LOKET ISTIRAHAT'}
            </span>
          </h2>
          <p className="text-xs text-slate-400">Petugas Aktif: <span className="text-slate-200 font-semibold">{currentDesk.officerName}</span></p>
        </div>

        {/* Desk Select Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs text-slate-400 shrink-0">Pilih Loket:</label>
          <select
            value={activeDeskId}
            onChange={(e) => setActiveDeskId(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
          >
            {desks.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Desk Status Buttons */}
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => handleToggleStatus(currentDesk.status === 'active' ? 'paused' : 'active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentDesk.status === 'active' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-emerald-600 text-white shadow-md'
              }`}
            >
              {currentDesk.status === 'active' ? 'Set Istirahat' : 'Buka Loket'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Serving Box vs Waiting List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Called Ticket Console (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                ANTRIAN SEDANG DILAYANI
              </span>
              {currentTicket && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                  currentTicket.status === 'calling' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {currentTicket.status === 'calling' ? 'MEMANGGIL...' : 'SEDANG DILAYANI'}
                </span>
              )}
            </div>

            {currentTicket ? (
              <div className="space-y-6">
                
                {/* Big Ticket ID display */}
                <div className="text-center py-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono">NOMOR ANTRIAN</span>
                  <div className="text-6xl font-black font-mono text-emerald-400 tracking-tight my-2">
                    {currentTicket.id}
                  </div>
                  <h3 className="text-sm font-bold text-white">{currentTicket.serviceName}</h3>
                  {currentTicket.isPriority && (
                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      PRIORITAS: {currentTicket.priorityReason || 'Khusus'}
                    </span>
                  )}
                </div>

                {/* Citizen Details */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nama Pemohon:</span>
                    <span className="font-bold text-white">{currentTicket.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">NIK:</span>
                    <span className="font-bold text-white font-mono">{currentTicket.nik}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nomor WhatsApp:</span>
                    <span className="font-semibold text-slate-200">{currentTicket.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Panggilan Ke:</span>
                    <span className="font-bold text-amber-400 font-mono">{currentTicket.callCount} Kali</span>
                  </div>
                </div>

                {/* Action Controls Toolbar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <button
                    onClick={handleRecall}
                    disabled={actionLoading}
                    className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-all flex flex-col items-center gap-1"
                  >
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>Panggil Ulang</span>
                  </button>

                  <button
                    onClick={handleServe}
                    disabled={actionLoading || currentTicket.status === 'serving'}
                    className="py-3 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex flex-col items-center gap-1 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    <span>Mulai Layani</span>
                  </button>

                  <button
                    onClick={() => setShowHoldModal(true)}
                    disabled={actionLoading}
                    className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold text-xs transition-all flex flex-col items-center gap-1"
                  >
                    <PauseCircle className="w-4 h-4 text-amber-400" />
                    <span>Hold / Tunda</span>
                  </button>

                  <button
                    onClick={() => setShowSkipModal(true)}
                    disabled={actionLoading}
                    className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-300 border border-slate-700 font-semibold text-xs transition-all flex flex-col items-center gap-1"
                  >
                    <SkipForward className="w-4 h-4 text-red-400" />
                    <span>Skip / Lewati</span>
                  </button>
                </div>

                {/* Big Finish Service Primary Button */}
                <button
                  onClick={() => setShowFinishModal(true)}
                  disabled={actionLoading}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Selesaikan Layanan Ini & Catat Hasil</span>
                </button>

              </div>
            ) : (
              /* Empty Loket State */
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Tidak Ada Antrian Dilayani</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Tekan tombol "Panggil Antrian Berikutnya" untuk memanggil pemohon yang telah menunggu.
                  </p>
                </div>

                <button
                  onClick={handleCallNext}
                  disabled={actionLoading || waitingTickets.length === 0}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Panggil Antrian Berikutnya ({waitingTickets.length} Menunggu)</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Waiting Queue List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Daftar Antrian Menunggu</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300">
                  {waitingTickets.length}
                </span>
              </h3>
            </div>

            {waitingTickets.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Belum ada antrian menunggu untuk layanan loket ini.
              </div>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {waitingTickets.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      t.isPriority
                        ? 'bg-amber-950/30 border-amber-500/30'
                        : 'bg-slate-800/80 border-slate-700/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-black font-mono text-emerald-400 w-12 shrink-0">
                        {t.id}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-2">
                          <span>{t.name}</span>
                          {t.isPriority && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono uppercase">
                              Prioritas
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {t.serviceName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {new Date(t.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-amber-400 font-semibold">Urutan #{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Finish Service Modal */}
      {showFinishModal && currentTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="font-bold text-white text-lg mb-2">Selesaikan Antrian {currentTicket.id}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Masukkan catatan verifikasi atau hasil layanan jika ada:
            </p>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Berkas lengkap, KTP-el dicetak dan diserahkan kepada pemohon."
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleFinish}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50"
              >
                Konfirmasi Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hold Modal */}
      {showHoldModal && currentTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="font-bold text-white text-lg mb-2">Hold / Tunda Antrian {currentTicket.id}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Sebutkan alasan penundaan (misal: fotokopi kurang / menunggu dokumen pendukung):
            </p>

            <input
              type="text"
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              placeholder="Alasan penundaan"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowHoldModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleHold}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Simpan Hold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Modal */}
      {showSkipModal && currentTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="font-bold text-white text-lg mb-2">Skip / Lewati Antrian {currentTicket.id}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Konfirmasi jika pemohon tidak merespon panggilan 3 kali:
            </p>

            <input
              type="text"
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="Alasan skip (misal: Tidak hadir saat dipanggil)"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowSkipModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleSkip}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Konfirmasi Skip
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
