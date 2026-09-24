import React, { useState, useEffect } from 'react';
import { 
  Users, 
  SlidersHorizontal, 
  Building2, 
  FileText, 
  Clock, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Search,
  Lock
} from 'lucide-react';
import { InternalUser, QueueService, QueueDesk, ScheduleConfig, AuditLog } from '../../types/queue';

interface AdminViewProps {
  onRefresh: () => void;
  actionUser?: string;
}

export default function AdminView({ onRefresh, actionUser = 'admin' }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'desks' | 'services' | 'schedule' | 'audit'>('users');
  const [data, setData] = useState<{
    users: InternalUser[];
    services: QueueService[];
    desks: QueueDesk[];
    schedule: ScheduleConfig;
    auditLogs: AuditLog[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User Form Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [formUsername, setFormUsername] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'supervisor' | 'petugas'>('petugas');
  const [formPassword, setFormPassword] = useState('');
  const [formDeskId, setFormDeskId] = useState<number | undefined>(1);

  // Schedule Form State
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('15:00');
  const [announcementText, setAnnouncementText] = useState('');

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/data');
      if (!res.ok) throw new Error('Gagal memuat data admin');
      const json = await res.json();
      setData(json);
      if (json.schedule) {
        setOpenTime(json.schedule.openTime || '08:00');
        setCloseTime(json.schedule.closeTime || '15:00');
        setAnnouncementText(json.schedule.announcementText || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editUserId,
          username: formUsername,
          name: formName,
          role: formRole,
          password: formPassword,
          deskId: formRole === 'petugas' ? formDeskId : undefined,
          actionUser,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan user.');

      setMsg({ type: 'success', text: editUserId ? 'Pengguna berhasil diperbarui.' : 'Pengguna baru berhasil ditambahkan!' });
      setShowUserModal(false);
      fetchAdminData();
      onRefresh();

      // Clear Form
      setEditUserId(null);
      setFormUsername('');
      setFormName('');
      setFormPassword('');
    } catch (err: unknown) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Gagal menyimpan user' });
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openTime,
          closeTime,
          announcementText,
          actionUser,
        }),
      });

      if (!res.ok) throw new Error('Gagal menyimpan jadwal.');
      setMsg({ type: 'success', text: 'Konfigurasi jadwal & running text TV berhasil diperbarui!' });
      fetchAdminData();
      onRefresh();
    } catch (err: unknown) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Gagal' });
    }
  };

  const handleResetDay = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mereset seluruh antrian hari ini?')) return;
    try {
      await fetch('/api/admin/reset-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionUser }),
      });
      setMsg({ type: 'success', text: 'Antrian hari ini telah di-reset.' });
      fetchAdminData();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400">Memuat panel admin...</div>;
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider font-mono">
              PANEL ADMINISTRATOR UTAMA
            </span>
            <span className="text-xs text-slate-400">Terproteksi Password</span>
          </div>
          <h2 className="text-2xl font-black text-white">Pengaturan & Keamanan Sistem</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola pengguna internal, hak akses, loket, jenis layanan, jadwal operasional, dan audit trail.
          </p>
        </div>

        <button
          onClick={handleResetDay}
          className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-500 text-white font-bold text-xs transition-all flex items-center gap-2 border border-red-500/30"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Antrian Hari Ini</span>
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-semibold scrollbar-none">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola Pengguna ({data.users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('desks')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'desks' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Kelola Loket ({data.desks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'services' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Jenis Layanan ({data.services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'schedule' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Jadwal & Display TV</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'audit' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Log ({data.auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Manajemen Pengguna Internal</h3>
              <p className="text-xs text-slate-400">Tambah dan atur hak akses untuk Admin, Supervisor, dan Petugas</p>
            </div>
            <button
              onClick={() => {
                setEditUserId(null);
                setFormUsername('');
                setFormName('');
                setFormPassword('');
                setShowUserModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah User Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="p-3">Nama Lengkap</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Loket Tugas</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-white">{u.name}</td>
                    <td className="p-3 font-mono text-slate-300">{u.username}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : u.role === 'supervisor' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono">
                      {u.deskId ? `Loket 0${u.deskId}` : '-'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.active ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setEditUserId(u.id);
                          setFormUsername(u.username);
                          setFormName(u.name);
                          setFormRole(u.role);
                          setFormDeskId(u.deskId || 1);
                          setShowUserModal(true);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold"
                      >
                        Edit / Reset Pass
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DESKS MANAGEMENT */}
      {activeTab === 'desks' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base">Konfigurasi Loket Layanan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.desks.map((d) => (
              <div key={d.id} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{d.name}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-700">
                    ID #{d.id}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  <span>Petugas Terdaftar: </span>
                  <span className="font-semibold text-slate-200">{d.officerName}</span>
                </div>
                <div className="text-xs text-slate-400">
                  <span>Layanan Dilayani: </span>
                  <span className="font-mono text-emerald-400">{d.assignedServiceIds.join(', ').toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SERVICES MANAGEMENT */}
      {activeTab === 'services' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base">Kategori & Syarat Layanan</h3>
          <div className="space-y-3">
            {data.services.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono font-bold">
                      {s.code}
                    </span>
                    <h4 className="font-bold text-white text-sm">{s.name}</h4>
                  </div>
                  <span className="text-xs font-mono text-amber-400">Kuota Harian: {s.dailyQuota}</span>
                </div>
                <p className="text-xs text-slate-400">{s.description}</p>
                <div className="text-[11px] text-slate-300 font-mono">
                  Syarat: {s.requirements.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SCHEDULE & DISPLAY CONFIG */}
      {activeTab === 'schedule' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 max-w-2xl">
          <h3 className="font-bold text-white text-base">Pengaturan Jam Operasional & Running Text TV</h3>
          
          <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Jam Buka Layanan</label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Jam Tutup Layanan</label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Teks Pengumuman Running Text Display TV</label>
              <textarea
                rows={3}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md"
            >
              Simpan Pengaturan Display & Jam
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base">Audit Trail Aktivitas Sistem</h3>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] font-mono sticky top-0">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Aksi</th>
                  <th className="p-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                    <td className="p-3 font-bold text-white">{log.username}</td>
                    <td className="p-3 font-mono uppercase text-emerald-400">{log.role}</td>
                    <td className="p-3 font-mono text-amber-300">{log.action}</td>
                    <td className="p-3 text-slate-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="font-bold text-white text-lg mb-4">
              {editUserId ? 'Edit Pengguna Internal' : 'Tambah Pengguna Baru'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nama beserta gelar"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Username</label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="username"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Role Hak Akses</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as unknown as typeof formRole)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="petugas">Petugas Loket</option>
                  <option value="supervisor">Supervisor SLA</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {formRole === 'petugas' && (
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Loket Tugas Default</label>
                  <select
                    value={formDeskId}
                    onChange={(e) => setFormDeskId(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {data.desks.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  {editUserId ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Baru'}
                </label>
                <input
                  type="password"
                  required={!editUserId}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
