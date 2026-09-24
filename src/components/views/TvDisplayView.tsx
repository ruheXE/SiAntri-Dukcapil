import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Building2, Clock, Tv, VolumeX } from 'lucide-react';
import { QueueDesk, QueueTicket, SystemState } from '../../types/queue';
import { announceTicket } from '../../lib/audio';
import logoImg from '../../assets/images/dukcapil_logo_1790251157061.jpg';

interface TvDisplayViewProps {
  desks: QueueDesk[];
  tickets: QueueTicket[];
  schedule: {
    announcementText: string;
    agencyName: string;
    agencyAddress: string;
  };
  lastCallBroadcast?: SystemState['lastCallBroadcast'];
}

export default function TvDisplayView({
  desks,
  tickets,
  schedule,
  lastCallBroadcast,
}: TvDisplayViewProps) {
  const [time, setTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(true);
  const lastBroadcastTs = useRef<number>(0);

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for real-time call broadcasts & trigger Indonesian Voice TTS!
  useEffect(() => {
    if (lastCallBroadcast && lastCallBroadcast.timestamp > lastBroadcastTs.current) {
      lastBroadcastTs.current = lastCallBroadcast.timestamp;
      if (audioEnabled) {
        announceTicket(lastCallBroadcast.ticketNumber, lastCallBroadcast.deskName);
      }
    }
  }, [lastCallBroadcast, audioEnabled]);

  // Find most recently called ticket
  const callingTickets = tickets.filter(t => t.status === 'calling');
  const mainCalledTicket = callingTickets[0] || tickets.find(t => t.status === 'serving') || null;
  const mainCalledDesk = desks.find(d => d.id === mainCalledTicket?.deskId) || null;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between p-4 md:p-8 space-y-6">
      
      {/* Top TV Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 flex items-center justify-between shadow-2xl">
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0 shadow-lg">
            <img 
              src={logoImg} 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-3xl font-black tracking-tight text-white">
                DISDUKCAPIL
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                MONITOR HALL UTAMA
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 font-medium">{schedule.agencyAddress}</p>
          </div>
        </div>

        {/* Clock & Audio Switch */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold ${
              audioEnabled 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}
            title="Toggle Suara Panggilan"
          >
            {audioEnabled ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
            <span className="hidden md:inline">{audioEnabled ? 'Suara Aktif' : 'Suara Mute'}</span>
          </button>

          <div className="text-right font-mono bg-slate-800/90 px-5 py-2.5 rounded-2xl border border-slate-700">
            <div className="text-xl md:text-2xl font-black text-emerald-400">
              {time.toLocaleTimeString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">
              {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Main Spotlight / Right 6 Loket Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Left: Huge Main Called Number Hero Spotlight (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between text-center relative overflow-hidden">
          
          <div className="space-y-2">
            <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold uppercase tracking-widest font-mono inline-block">
              PANGGILAN AKTIF SEKARANG
            </span>
            <p className="text-xs text-slate-400">Harap SEGERA menuju Loket Panggilan Anda</p>
          </div>

          {mainCalledTicket ? (
            <div className="my-auto py-6 space-y-4">
              <div className="text-7xl md:text-9xl font-black font-mono text-emerald-400 tracking-tighter drop-shadow-[0_0_35px_rgba(16,185,129,0.4)] animate-pulse">
                {mainCalledTicket.id}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200">
                <span className="text-xs font-mono uppercase text-emerald-400 block font-bold">SILAKAN MENUJU TO</span>
                <div className="text-2xl md:text-4xl font-black text-white uppercase mt-1">
                  {mainCalledDesk?.name || 'LOKET DITUNJU'}
                </div>
              </div>

              <p className="text-sm font-bold text-slate-200 truncate">
                {mainCalledTicket.name} · <span className="text-emerald-400">{mainCalledTicket.serviceName}</span>
              </p>
            </div>
          ) : (
            <div className="my-auto py-12 text-slate-500 space-y-2">
              <Tv className="w-16 h-16 mx-auto text-slate-700" />
              <div className="text-lg font-bold text-slate-400">Belum Ada Panggilan Aktif</div>
              <p className="text-xs max-w-xs mx-auto text-slate-600">Nomor antrian berikutnya akan ditampilkan di layar ini secara otomatis.</p>
            </div>
          )}

          <div className="text-xs text-slate-500 font-mono border-t border-slate-800 pt-3">
            Gunakan QR Tiket Anda untuk verifikasi di meja loket
          </div>
        </div>

        {/* Right: 6 Loket Grid Matrix (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-4">
          {desks.map((d) => {
            const currentTicket = tickets.find(t => t.id === d.currentTicketId);
            const isCallingThis = currentTicket?.status === 'calling';

            return (
              <div
                key={d.id}
                className={`p-4 md:p-5 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                  isCallingThis
                    ? 'bg-gradient-to-b from-amber-950/80 to-slate-900 border-amber-500 shadow-2xl scale-102 ring-2 ring-amber-500/50'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="font-extrabold text-xs md:text-sm text-white">{d.name}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${d.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500'}`} />
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono uppercase block">DILAYANI:</span>
                  {currentTicket ? (
                    <div className="my-2 text-center">
                      <div className="text-3xl md:text-4xl font-black font-mono text-emerald-400 tracking-tight">
                        {currentTicket.id}
                      </div>
                      <p className="text-xs text-slate-300 font-medium truncate mt-1">{currentTicket.name}</p>
                    </div>
                  ) : (
                    <div className="my-4 text-center text-xs font-mono font-bold text-slate-600">
                      LOKET KOSONG
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 font-mono border-t border-slate-800/80 pt-2 truncate">
                  Petugas: <span className="text-slate-200">{d.officerName}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Bottom Running Text Ticker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 overflow-hidden flex items-center gap-4">
        <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-xs uppercase shrink-0">
          INFORMASI
        </span>
        <div className="overflow-hidden whitespace-nowrap text-xs md:text-sm text-slate-300 font-medium flex-1">
          <div className="inline-block animate-marquee">
            {schedule.announcementText || 'Selamat datang di Dinas Kependudukan dan Pencatatan Sipil. Harap menyiapkan dokumen fisik asli & fotokopi.'}
          </div>
        </div>
      </div>

    </div>
  );
}
