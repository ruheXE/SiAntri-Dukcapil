import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  Users, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Star, 
  Sparkles, 
  UserPlus, 
  HeartHandshake, 
  Search,
  QrCode
} from 'lucide-react';
import { QueueService, QueueTicket } from '../../types/queue';
import PrintTicketModal from '../PrintTicketModal';
import hallImg from '../../assets/images/dukcapil_hall_1790251171943.jpg';

interface PublicViewProps {
  services: QueueService[];
  tickets: QueueTicket[];
  stats: {
    totalToday: number;
    waitingCount: number;
    servingCount: number;
    completedCount: number;
  };
  schedule: {
    announcementText: string;
    isPaused: boolean;
    agencyName: string;
    agencyAddress: string;
  };
  onRefresh: () => void;
}

export default function PublicView({
  services,
  tickets,
  stats,
  schedule,
  onRefresh,
}: PublicViewProps) {
  const [selectedService, setSelectedService] = useState<QueueService | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState<QueueService | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [priorityReason, setPriorityReason] = useState<'Lansia (>60 Thn)' | 'Penyandang Disabilitas' | 'Ibu Hamil / Menyusui' | 'Kebutuhan Khusus'>('Lansia (>60 Thn)');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<QueueTicket | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Rating Modal State
  const [ratingTicket, setRatingTicket] = useState<QueueTicket | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const handleTakeTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      setError('NIK harus berisi tepat 16 digit angka.');
      return;
    }

    if (!phone || phone.length < 10) {
      setError('Nomor Handphone tidak valid (minimal 10 digit).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/queue/take', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          nik,
          name,
          phone,
          address,
          isPriority,
          priorityReason: isPriority ? priorityReason : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal mengambil nomor antrian.');

      setActiveTicket(json.ticket);
      setShowFormModal(false);
      setShowPrintModal(true);
      onRefresh();

      // Clear Form
      setName('');
      setNik('');
      setPhone('');
      setAddress('');
      setIsPriority(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Announcement Banner with Image Background */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800/90 bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img 
            src={hallImg} 
            alt="Interior Disdukcapil" 
            className="w-full h-full object-cover opacity-25 filter blur-[1px] scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/70" />
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        </div>

        <div className="relative z-10 p-6 md:p-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LAYANAN DOKUMEN DIGITAL DUKCAPIL</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Ambil Nomor Antrian Pelayanan Disdukcapil
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
            Silakan pilih jenis layanan di bawah ini untuk mengambil nomor antrian secara digital. Transparan, akurat, dan tanpa penumpukan di lokasi.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('services-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm transition-all shadow-lg shadow-emerald-950/60 flex items-center gap-2"
            >
              <span>Pilih Jenis Layanan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Operational Stats Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md text-center divide-x divide-slate-800/80">
          <div className="p-3.5 sm:p-4">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">{stats.totalToday}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Total Antrian Hari Ini</div>
          </div>
          <div className="p-3.5 sm:p-4">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{stats.servingCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Sedang Dilayani</div>
          </div>
          <div className="p-3.5 sm:p-4">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{stats.waitingCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Menunggu Giliran</div>
          </div>
          <div className="p-3.5 sm:p-4">
            <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">{stats.completedCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Selesai Dilayani</div>
          </div>
        </div>
      </div>

      {/* Ticker Announcement */}
      {schedule.announcementText && (
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center gap-3 shadow-md">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold uppercase shrink-0 text-[10px] tracking-wider border border-emerald-500/30">
            PENGUMUMAN
          </span>
          <p className="truncate font-medium">{schedule.announcementText}</p>
        </div>
      )}

      {/* Active Ticket Banner if user already generated a ticket */}
      {activeTicket && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-mono font-black shrink-0 shadow-inner">
              {activeTicket.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">TIKET AKTIF ANDA</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase font-mono font-bold">
                  {activeTicket.status}
                </span>
              </div>
              <h4 className="font-bold text-white text-base mt-0.5">{activeTicket.serviceName}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Nama: <span className="text-slate-200 font-medium">{activeTicket.name}</span> · Status: <span className="text-emerald-400 font-semibold">{activeTicket.status === 'waiting' ? 'Menunggu dipanggil' : activeTicket.status}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowPrintModal(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <QrCode className="w-4 h-4" />
              <span>Lihat & Cetak Tiket</span>
            </button>
          </div>
        </div>
      )}

      {/* Services Grid Section */}
      <div id="services-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Kategori & Jenis Layanan Loket</h2>
            <p className="text-xs text-slate-400 mt-0.5">Pilih jenis pengurusan dokumen kependudukan yang Anda perlukan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((srv) => {
            const waitingCount = tickets.filter(t => t.serviceId === srv.id && t.status === 'waiting').length;

            return (
              <div
                key={srv.id}
                className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden group glass-card-hover ${
                  srv.isPriority
                    ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/40 hover:border-amber-400 shadow-lg shadow-amber-950/20'
                    : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {srv.isPriority && (
                  <span className="absolute top-3.5 right-3.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                    PRIORITAS KHUSUS
                  </span>
                )}

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-mono font-black shrink-0 ${
                      srv.isPriority
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {srv.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug group-hover:text-emerald-300 transition-colors">
                        {srv.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          ± {srv.estimatedMinutes} Menit
                        </span>
                        <span>·</span>
                        <span className="text-amber-400 font-bold">{waitingCount} Antrian</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => setShowRequirementsModal(srv)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 active:scale-[0.98] text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700/60"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lihat Syarat</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedService(srv);
                      setShowFormModal(true);
                      setError(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-950/50"
                  >
                    <span>Ambil Antrian</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Requirement Check Modal */}
      {showRequirementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg">
                  {showRequirementsModal.code}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{showRequirementsModal.name}</h3>
                  <p className="text-xs text-slate-400">Persyaratan Berkas Resmi</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequirementsModal(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-xs text-slate-300 font-medium">
                Pastikan Anda membawa seluruh dokumen fisik berikut (asli & fotokopi) saat dipanggil ke loket:
              </p>
              <ul className="space-y-2">
                {showRequirementsModal.requirements.map((req, idx) => (
                  <li key={idx} className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const s = showRequirementsModal;
                  setShowRequirementsModal(null);
                  setSelectedService(s);
                  setShowFormModal(true);
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/50"
              >
                Lanjutkan Ambil Antrian Layanan Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Taking Ticket Modal */}
      {showFormModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">FORMULIR TIKET DIGITAL</span>
                <h3 className="font-bold text-white text-lg">{selectedService.name}</h3>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleTakeTicket} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap Pemohon</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sesuai KTP / KK (contoh: Budi Santoso)"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">NIK (Nomor Induk Kependudukan - 16 Digit)</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="3271012304950001"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor WhatsApp / HP Aktif</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Singkat (Opsional)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Kelurahan / Kecamatan"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Priority Checkbox */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPriority}
                    onChange={(e) => setIsPriority(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <HeartHandshake className="w-4 h-4" />
                    Kategori Prioritas Khusus (Lansia / Disabilitas / Hamil)
                  </span>
                </label>

                {isPriority && (
                  <div className="pt-2 border-t border-amber-500/20">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Kriteria Prioritas:</label>
                    <select
                      value={priorityReason}
                      onChange={(e) => setPriorityReason(e.target.value as unknown as typeof priorityReason)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="Lansia (>60 Thn)">Lansia Usia di atas 60 Tahun</option>
                      <option value="Penyandang Disabilitas">Penyandang Disabilitas / Difabel</option>
                      <option value="Ibu Hamil / Menyusui">Ibu Hamil / Ibu Menyusui membawa Balita</option>
                      <option value="Kebutuhan Khusus">Kebutuhan Khusus Darurat</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/50 disabled:opacity-50"
              >
                {loading ? 'Daftar Antrian...' : 'Proses & Dapatkan Nomor Antrian'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Print Ticket Modal */}
      <PrintTicketModal
        ticket={activeTicket}
        onClose={() => setShowPrintModal(false)}
      />

    </div>
  );
}
