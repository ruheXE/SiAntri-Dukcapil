import React, { useState } from 'react';
import { Search, QrCode, Clock, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { QueueTicket } from '../../types/queue';
import PrintTicketModal from '../PrintTicketModal';

export default function CheckStatusView() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    ticket: QueueTicket;
    position: number;
    estMinutes: number;
  } | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/queue/ticket/${encodeURIComponent(query.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Tiket atau NIK tidak ditemukan.');

      setResult(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Pencarian gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 pt-4">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
          <QrCode className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Cek Status & Estimasi Panggilan Tiket</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Masukkan Kode Nomor Antrian (misal: <span className="font-mono text-emerald-400 font-bold">A-002</span>) atau 16 Digit NIK Anda.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nomor Tiket (A-001) atau 16 Digit NIK..."
          className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-emerald-950/50 flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>Cari Tiket</span>
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 animate-fade-in">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">TIKET DISELEKSI</span>
              <h3 className="text-3xl font-black font-mono text-white">{result.ticket.id}</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
              result.ticket.status === 'serving' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : result.ticket.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {result.ticket.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Layanan:</span>
              <span className="font-bold text-white">{result.ticket.serviceName}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Nama Pemohon:</span>
              <span className="font-bold text-white">{result.ticket.name}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Posisi Urutan Sisa:</span>
              <span className="font-bold text-amber-400 font-mono">{result.position} Orang Sebelum Anda</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Perkiraan Waktu Dipanggil:</span>
              <span className="font-bold text-emerald-400 font-mono">± {result.estMinutes} Menit</span>
            </div>
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            <QrCode className="w-4 h-4" />
            <span>Tampilkan QR Code & Cetak Ulang Tiket</span>
          </button>
        </div>
      )}

      <PrintTicketModal
        ticket={result?.ticket || null}
        onClose={() => setShowPrintModal(false)}
        estMinutes={result?.estMinutes}
        position={result?.position}
      />

    </div>
  );
}
