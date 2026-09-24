import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, Download, X, Clock, MapPin, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { QueueTicket } from '../types/queue';

interface PrintTicketModalProps {
  ticket: QueueTicket | null;
  onClose: () => void;
  estMinutes?: number;
  position?: number;
}

export default function PrintTicketModal({
  ticket,
  onClose,
  estMinutes = 15,
  position = 1,
}: PrintTicketModalProps) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (ticket) {
      QRCode.toDataURL(ticket.id, { margin: 1, width: 180, color: { dark: '#0F172A', light: '#FFFFFF' } })
        .then(url => setQrUrl(url))
        .catch(err => console.error(err));
    }
  }, [ticket]);

  if (!ticket) return null;

  const maskNik = (nik: string) => {
    if (!nik || nik.length < 8) return nik;
    return `${nik.substring(0, 6)}******${nik.substring(nik.length - 4)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in print:bg-white print:p-0">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:bg-white print:text-slate-900">
        
        {/* Modal Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Thermal Ticket Card Structure */}
        <div id="thermal-ticket" className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-inner text-center font-sans space-y-4">
          
          {/* Header */}
          <div className="border-b border-dashed border-slate-300 pb-3">
            <div className="flex items-center justify-center gap-1.5 font-black text-xs text-slate-800 tracking-wider uppercase">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>DISDUKCAPIL ONLINE</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Sistem Antrian Digital Pelayanan Publik</p>
          </div>

          {/* Ticket Number Hero */}
          <div className="py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">NOMOR ANTRIAN ANDA</span>
            <div className="text-4xl md:text-5xl font-black font-mono text-slate-900 tracking-tight my-1">
              {ticket.id}
            </div>
            {ticket.isPriority && (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                Prioritas: {ticket.priorityReason || 'Khusus'}
              </span>
            )}
            <p className="text-xs font-semibold text-emerald-700 mt-2 line-clamp-1">
              {ticket.serviceName}
            </p>
          </div>

          {/* Details Table */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-left text-xs space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Nama Pemohon:</span>
              <span className="font-bold text-slate-800 truncate max-w-[150px]">{ticket.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">NIK Pemohon:</span>
              <span className="font-bold text-slate-800">{maskNik(ticket.nik)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimasi Tunggu:</span>
              <span className="font-bold text-emerald-600">± {estMinutes} Menit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sisa Antrian:</span>
              <span className="font-bold text-slate-800">{position} Orang</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal/Waktu:</span>
              <span className="text-[10px] text-slate-700">{new Date(ticket.createdAt).toLocaleTimeString('id-ID')} WIB</span>
            </div>
          </div>

          {/* QR Code */}
          {qrUrl && (
            <div className="flex flex-col items-center justify-center pt-1">
              <img src={qrUrl} alt="QR Tiket" className="w-32 h-32 border border-slate-200 p-1 rounded-lg" />
              <span className="text-[10px] text-slate-400 mt-1 font-mono">Scan untuk Cek Status</span>
            </div>
          )}

          {/* Footer Warning */}
          <div className="border-t border-dashed border-slate-300 pt-3 text-[10px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Harap Siapkan Berkas Persyaratan!</p>
            <p>Datanglah 10 menit sebelum estimasi panggilan. Panggilan akan diulang 3 kali di TV display hall.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Tiket Thermal</span>
          </button>
        </div>

      </div>
    </div>
  );
}
