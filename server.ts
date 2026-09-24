import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { SystemState, QueueTicket, AuditLog, InternalUser } from './src/types/queue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_FILE = path.join(__dirname, 'queue-data.json');

// Password hashing helper for server
function hashPasswordServer(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function generateSaltServer(length = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

// Initial Seed Data
const initialSalt = generateSaltServer();

const initialUsers: InternalUser[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Administrator Utama',
    role: 'admin',
    salt: initialSalt,
    passwordHash: hashPasswordServer('admin123', initialSalt),
    active: true,
    mustChangePassword: false,
  },
  {
    id: 'usr-supervisor',
    username: 'supervisor',
    name: 'Drs. H. Bambang Subagyo (Supervisor)',
    role: 'supervisor',
    salt: initialSalt,
    passwordHash: hashPasswordServer('super123', initialSalt),
    active: true,
    mustChangePassword: false,
  },
  {
    id: 'usr-petugas1',
    username: 'petugas1',
    name: 'Siti Rahmawati, A.Md',
    role: 'petugas',
    salt: initialSalt,
    passwordHash: hashPasswordServer('petugas123', initialSalt),
    deskId: 1,
    active: true,
    mustChangePassword: false,
  },
  {
    id: 'usr-petugas2',
    username: 'petugas2',
    name: 'Budi Santoso, S.STP',
    role: 'petugas',
    salt: initialSalt,
    passwordHash: hashPasswordServer('petugas123', initialSalt),
    deskId: 2,
    active: true,
    mustChangePassword: false,
  },
  {
    id: 'usr-petugas3',
    username: 'petugas3',
    name: 'Dewi Lestari, S.Kom',
    role: 'petugas',
    salt: initialSalt,
    passwordHash: hashPasswordServer('petugas123', initialSalt),
    deskId: 3,
    active: true,
    mustChangePassword: false,
  },
  {
    id: 'usr-petugas4',
    username: 'petugas4',
    name: 'Ahmad Fauzi, S.H.',
    role: 'petugas',
    salt: initialSalt,
    passwordHash: hashPasswordServer('petugas123', initialSalt),
    deskId: 4,
    active: true,
    mustChangePassword: false,
  },
  {
    id: 'usr-petugas5',
    username: 'petugas5',
    name: 'Rina Indah, S.Sos',
    role: 'petugas',
    salt: initialSalt,
    passwordHash: hashPasswordServer('petugas123', initialSalt),
    deskId: 5,
    active: true,
    mustChangePassword: false,
  },
  {
    id: 'usr-petugas6',
    username: 'petugas6',
    name: 'Kartika Sari (Prioritas)',
    role: 'petugas',
    salt: initialSalt,
    passwordHash: hashPasswordServer('petugas123', initialSalt),
    deskId: 6,
    active: true,
    mustChangePassword: false,
  },
];

const initialServices = [
  {
    id: 'ktp',
    code: 'A' as const,
    name: 'Perekaman & Pencetakan KTP-el / KIA',
    description: 'Layanan pembuatan KTP elektronik baru, penggantian KTP rusak/hilang, serta Kartu Identitas Anak.',
    requirements: [
      'Fotokopi Kartu Keluarga (KK) terbaru',
      'Surat Keterangan Kehilangan dari Kepolisian (jika KTP hilang)',
      'Fisik KTP lama yang rusak (jika KTP rusak)',
      'Pas foto 3x4 berwarna (2 lembar) untuk permohonan KIA'
    ],
    estimatedMinutes: 10,
    dailyQuota: 100,
    isPriority: false,
    active: true,
  },
  {
    id: 'kk',
    code: 'B' as const,
    name: 'Kartu Keluarga & Pindah Datang/Keluar',
    description: 'Pembuatan KK baru, pemecahan KK, penambahan anggota keluarga, dan surat keterangan pindah (SKPWNI).',
    requirements: [
      'Surat Pengantar dari RT/RW setempat',
      'Kartu Keluarga (KK) asli lama',
      'Fotokopi Buku Nikah / Akta Perkawinan',
      'Surat Keterangan Pindah Datang (SKPWNI) dari daerah asal (khusus pendatang)'
    ],
    estimatedMinutes: 12,
    dailyQuota: 80,
    isPriority: false,
    active: true,
  },
  {
    id: 'akta',
    code: 'C' as const,
    name: 'Akta Kelahiran, Kematian & Perkawinan',
    description: 'Penerbitan akta kelahiran anak baru, akta kematian warga, serta pencatatan pernikahan non-muslim.',
    requirements: [
      'Surat Keterangan Lahir / Mati dari Dokter, Bidan, atau Kelurahan',
      'Fotokopi KTP-el kedua orang tua / almarhum',
      'Fotokopi KTP-el 2 (dua) orang saksi',
      'Fotokopi Buku Nikah Orang Tua / Akta Perkawinan'
    ],
    estimatedMinutes: 15,
    dailyQuota: 60,
    isPriority: false,
    active: true,
  },
  {
    id: 'legalisasi',
    code: 'D' as const,
    name: 'Legalisasi & Perubahan Elemen Data',
    description: 'Legalisasi dokumen kependudukan resmi dan pengajuan pembetulan/perubahan elemen data pada KK/KTP.',
    requirements: [
      'Dokumen Asli kependudukan yang akan dilegalisir',
      'Fotokopi dokumen (maksimal 5 lembar per permohonan)',
      'Dokumen pendukung perubahan data (Ijazah, Akta, Surat Keputusan)'
    ],
    estimatedMinutes: 8,
    dailyQuota: 120,
    isPriority: false,
    active: true,
  },
  {
    id: 'konsultasi',
    code: 'E' as const,
    name: 'Konsultasi & Permasalahan NIK Ganda / Tidak Aktif',
    description: 'Penanganan NIK tidak terdeteksi di BPJS/Bank/Layanan Publik serta konsolidasi data nasional.',
    requirements: [
      'Fotokopi KTP-el dan Kartu Keluarga',
      'Bukti kendala NIK (Screenshot dari aplikasi BPJS/Bank jika ada)'
    ],
    estimatedMinutes: 10,
    dailyQuota: 50,
    isPriority: false,
    active: true,
  },
  {
    id: 'prioritas',
    code: 'P' as const,
    name: 'Layanan Prioritas (Lansia, Disabilitas, Ibu Hamil)',
    description: 'Jalur cepat khusus warga berusia >60 tahun, penyandang disabilitas, ibu hamil, serta penyandang kebutuhan khusus.',
    requirements: [
      'Kartu Identitas Diri (KTP / KK / Kartu Disabilitas)',
      'Dokumen persyaratan sesuai jenis layanan yang dibutuhkan'
    ],
    estimatedMinutes: 8,
    dailyQuota: 50,
    isPriority: true,
    active: true,
  },
];

const initialDesks = [
  { id: 1, name: 'Loket 01 - KTP-el & KIA', officerName: 'Siti Rahmawati, A.Md', assignedServiceIds: ['ktp'], status: 'active' as const, currentTicketId: 'A-002' },
  { id: 2, name: 'Loket 02 - KK & Pindah', officerName: 'Budi Santoso, S.STP', assignedServiceIds: ['kk'], status: 'active' as const, currentTicketId: 'B-001' },
  { id: 3, name: 'Loket 03 - Akta Kependudukan', officerName: 'Dewi Lestari, S.Kom', assignedServiceIds: ['akta'], status: 'active' as const, currentTicketId: null },
  { id: 4, name: 'Loket 04 - Legalisasi Data', officerName: 'Ahmad Fauzi, S.H.', assignedServiceIds: ['legalisasi'], status: 'active' as const, currentTicketId: null },
  { id: 5, name: 'Loket 05 - Konsultasi & NIK', officerName: 'Rina Indah, S.Sos', assignedServiceIds: ['konsultasi'], status: 'active' as const, currentTicketId: null },
  { id: 6, name: 'Loket 06 - Khusus Prioritas', officerName: 'Kartika Sari', assignedServiceIds: ['prioritas', 'ktp', 'kk', 'akta'], status: 'active' as const, currentTicketId: 'P-001' },
];

const nowISO = new Date().toISOString();
const minsAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

const initialTickets: QueueTicket[] = [
  {
    id: 'A-001',
    serviceId: 'ktp',
    serviceName: 'Perekaman & Pencetakan KTP-el / KIA',
    serviceCode: 'A',
    number: 1,
    nik: '3271012405850001',
    name: 'Hendra Wijaya',
    phone: '081234567890',
    isPriority: false,
    status: 'completed',
    createdAt: minsAgo(45),
    calledAt: minsAgo(35),
    servedAt: minsAgo(35),
    completedAt: minsAgo(25),
    deskId: 1,
    deskName: 'Loket 01 - KTP-el & KIA',
    officerName: 'Siti Rahmawati, A.Md',
    notes: 'Perekaman biometrik selesai, KTP-el dicetak langsung.',
    rating: 5,
    ratingFeedback: 'Pelayanan sangat cepat dan ramah!',
    callCount: 1,
  },
  {
    id: 'A-002',
    serviceId: 'ktp',
    serviceName: 'Perekaman & Pencetakan KTP-el / KIA',
    serviceCode: 'A',
    number: 2,
    nik: '3271011809920003',
    name: 'Andi Pratama',
    phone: '081398765432',
    isPriority: false,
    status: 'serving',
    createdAt: minsAgo(30),
    calledAt: minsAgo(10),
    servedAt: minsAgo(10),
    deskId: 1,
    deskName: 'Loket 01 - KTP-el & KIA',
    officerName: 'Siti Rahmawati, A.Md',
    callCount: 1,
  },
  {
    id: 'A-003',
    serviceId: 'ktp',
    serviceName: 'Perekaman & Pencetakan KTP-el / KIA',
    serviceCode: 'A',
    number: 3,
    nik: '3271010512010002',
    name: 'Nanda Putri',
    phone: '085711223344',
    isPriority: false,
    status: 'waiting',
    createdAt: minsAgo(20),
    callCount: 0,
  },
  {
    id: 'A-004',
    serviceId: 'ktp',
    serviceName: 'Perekaman & Pencetakan KTP-el / KIA',
    serviceCode: 'A',
    number: 4,
    nik: '3271012903980005',
    name: 'Rizky Kurniawan',
    phone: '081299887766',
    isPriority: false,
    status: 'waiting',
    createdAt: minsAgo(10),
    callCount: 0,
  },
  {
    id: 'B-001',
    serviceId: 'kk',
    serviceName: 'Kartu Keluarga & Pindah Datang/Keluar',
    serviceCode: 'B',
    number: 1,
    nik: '3271011211750004',
    name: 'Suryadi Slamet',
    phone: '081809112233',
    isPriority: false,
    status: 'serving',
    createdAt: minsAgo(25),
    calledAt: minsAgo(8),
    servedAt: minsAgo(8),
    deskId: 2,
    deskName: 'Loket 02 - KK & Pindah',
    officerName: 'Budi Santoso, S.STP',
    callCount: 1,
  },
  {
    id: 'B-002',
    serviceId: 'kk',
    serviceName: 'Kartu Keluarga & Pindah Datang/Keluar',
    serviceCode: 'B',
    number: 2,
    nik: '3271011406880007',
    name: 'Maya Indriani',
    phone: '081908776655',
    isPriority: false,
    status: 'waiting',
    createdAt: minsAgo(15),
    callCount: 0,
  },
  {
    id: 'P-001',
    serviceId: 'prioritas',
    serviceName: 'Layanan Prioritas (Lansia, Disabilitas, Ibu Hamil)',
    serviceCode: 'P',
    number: 1,
    nik: '3271010107480001',
    name: 'Oey Tjin Hok (Lansia 78 Thn)',
    phone: '081122334455',
    isPriority: true,
    priorityReason: 'Lansia (>60 Thn)',
    status: 'serving',
    createdAt: minsAgo(12),
    calledAt: minsAgo(5),
    servedAt: minsAgo(5),
    deskId: 6,
    deskName: 'Loket 06 - Khusus Prioritas',
    officerName: 'Kartika Sari',
    callCount: 1,
  },
];

const initialSchedule = {
  openTime: '08:00',
  closeTime: '15:00',
  breakStartTime: '12:00',
  breakEndTime: '13:00',
  maxDailyOnlineQuota: 300,
  announcementText: 'Selamat datang di Dinas Kependudukan dan Pencatatan Sipil. Harap menyiapkan dokumen persyaratan lengkap sebelum menuju loket panggilan.',
  isPaused: false,
  agencyName: 'Dinas Kependudukan dan Pencatatan Sipil',
  agencyAddress: 'Jl. Pemuda No. 45, Kompleks Perkantoran Pemerintah Kota',
};

const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: minsAgo(120),
    username: 'admin',
    role: 'admin',
    action: 'INIT_SYSTEM',
    details: 'Sistem Antrian SiAntri Dukcapil diinisialisasi.',
    ip: '127.0.0.1',
  },
  {
    id: 'log-2',
    timestamp: minsAgo(35),
    username: 'petugas1',
    role: 'petugas',
    action: 'SERVE_TICKET',
    details: 'Memanggil & melayani tiket A-001 di Loket 01.',
    ip: '127.0.0.1',
  },
];

let state: SystemState = {
  services: initialServices,
  desks: initialDesks,
  tickets: initialTickets,
  users: initialUsers,
  schedule: initialSchedule,
  auditLogs: initialAuditLogs,
};

// Persistence functions
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const loaded = JSON.parse(raw);
      state = { ...state, ...loaded };
      console.log('Successfully loaded state from file system');
    }
  } catch (err) {
    console.error('Failed to load state file:', err);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save state file:', err);
  }
}

loadData();

function addAudit(username: string, role: string, action: string, details: string, ip = '127.0.0.1') {
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    username,
    role,
    action,
    details,
    ip,
  };
  state.auditLogs.unshift(log);
  if (state.auditLogs.length > 200) state.auditLogs.pop();
  saveData();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API ROUTES

  // 1. PUBLIC QUEUE DASHBOARD STATE
  app.get('/api/queue/public', (req, res) => {
    // Calculate Stats
    const totalToday = state.tickets.length;
    const waitingCount = state.tickets.filter(t => t.status === 'waiting').length;
    const servingCount = state.tickets.filter(t => t.status === 'serving' || t.status === 'calling').length;
    const completedCount = state.tickets.filter(t => t.status === 'completed').length;
    const skippedCount = state.tickets.filter(t => t.status === 'skipped').length;
    const cancelledCount = state.tickets.filter(t => t.status === 'cancelled').length;

    // Calculate SLA breaches (Waiting > 15 mins)
    const nowMs = Date.now();
    const slaBreachCount = state.tickets.filter(t => {
      if (t.status !== 'waiting') return false;
      const createdMs = new Date(t.createdAt).getTime();
      return (nowMs - createdMs) > 15 * 60 * 1000;
    }).length;

    // Currently calling / serving per desk
    const activeDesks = state.desks.map(d => {
      const currentTicket = state.tickets.find(t => t.id === d.currentTicketId) || null;
      return {
        ...d,
        currentTicket,
      };
    });

    res.json({
      services: state.services.filter(s => s.active),
      desks: activeDesks,
      stats: {
        totalToday,
        waitingCount,
        servingCount,
        completedCount,
        skippedCount,
        cancelledCount,
        slaBreachCount,
        avgWaitMinutes: 12,
        avgServiceMinutes: 10,
      },
      schedule: state.schedule,
      tickets: state.tickets,
      lastCallBroadcast: state.lastCallBroadcast,
    });
  });

  // 2. PUBLIC TAKE TICKET (Online / Onsite Kiosk)
  app.post('/api/queue/take', (req, res) => {
    const { serviceId, nik, name, phone, address, isPriority, priorityReason } = req.body;

    if (!serviceId || !nik || !name || !phone) {
      return res.status(400).json({ error: 'Service, NIK, Nama, dan Nomor HP wajib diisi.' });
    }

    const service = state.services.find(s => s.id === serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Layanan tidak ditemukan.' });
    }

    // Determine Ticket Code & Number
    const code = service.code;
    const existingSameCode = state.tickets.filter(t => t.serviceCode === code);
    const nextNum = existingSameCode.length + 1;
    const ticketId = `${code}-${String(nextNum).padStart(3, '0')}`;

    const newTicket: QueueTicket = {
      id: ticketId,
      serviceId: service.id,
      serviceName: service.name,
      serviceCode: code,
      number: nextNum,
      nik,
      name,
      phone,
      address,
      isPriority: Boolean(isPriority || service.isPriority),
      priorityReason: priorityReason || (service.isPriority ? 'Kebutuhan Khusus' : undefined),
      status: 'waiting',
      createdAt: new Date().toISOString(),
      callCount: 0,
    };

    state.tickets.push(newTicket);
    saveData();

    res.json({ success: true, ticket: newTicket });
  });

  // 3. GET SINGLE TICKET STATUS
  app.get('/api/queue/ticket/:id', (req, res) => {
    const ticket = state.tickets.find(t => t.id === req.params.id || t.nik === req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Nomor antrian atau NIK tidak ditemukan.' });
    }

    // Calculate position
    const waitingList = state.tickets.filter(t => t.serviceCode === ticket.serviceCode && t.status === 'waiting');
    const position = waitingList.findIndex(t => t.id === ticket.id) + 1;
    const estMinutes = Math.max(0, position * (state.services.find(s => s.id === ticket.serviceId)?.estimatedMinutes || 10));

    res.json({ ticket, position, estMinutes });
  });

  // 4. CANCEL TICKET
  app.post('/api/queue/cancel', (req, res) => {
    const { ticketId } = req.body;
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return res.status(404).json({ error: 'Tiket tidak ditemukan.' });

    ticket.status = 'cancelled';
    saveData();
    res.json({ success: true, message: 'Antrian berhasil dibatalkan.' });
  });

  // 5. SUBMIT RATING
  app.post('/api/queue/rating', (req, res) => {
    const { ticketId, rating, feedback } = req.body;
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return res.status(404).json({ error: 'Tiket tidak ditemukan.' });

    ticket.rating = rating;
    ticket.ratingFeedback = feedback;
    saveData();
    res.json({ success: true, message: 'Terima kasih atas penilaian Anda!' });
  });

  // 6. INTERNAL USER LOGIN (PASSWORD BASED)
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan Password wajib diisi.' });
    }

    const user = state.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.active);
    if (!user) {
      addAudit('system', 'auth', 'LOGIN_FAILED', `Gagal login username tidak ditemukan: ${username}`);
      return res.status(401).json({ error: 'Username atau Password salah.' });
    }

    const hash = hashPasswordServer(password, user.salt);
    if (hash !== user.passwordHash) {
      addAudit(username, user.role, 'LOGIN_FAILED', `Gagal login password salah untuk: ${username}`);
      return res.status(401).json({ error: 'Username atau Password salah.' });
    }

    user.lastLogin = new Date().toISOString();
    saveData();

    addAudit(user.username, user.role, 'LOGIN_SUCCESS', `Berhasil login ke sistem.`);

    const token = `token-${user.id}-${Date.now()}`;
    res.json({
      success: true,
      session: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          deskId: user.deskId,
          mustChangePassword: user.mustChangePassword,
        },
      },
    });
  });

  // 7. CHANGE PASSWORD
  app.post('/api/auth/change-password', (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    const user = state.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });

    const oldHash = hashPasswordServer(oldPassword, user.salt);
    if (oldHash !== user.passwordHash) {
      return res.status(400).json({ error: 'Password lama salah.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
    }

    const newSalt = generateSaltServer();
    user.salt = newSalt;
    user.passwordHash = hashPasswordServer(newPassword, newSalt);
    user.mustChangePassword = false;
    saveData();

    addAudit(user.username, user.role, 'CHANGE_PASSWORD', `Mengubah password akun.`);
    res.json({ success: true, message: 'Password berhasil diperbarui.' });
  });

  // 8. PETUGAS LOKET ACTIONS
  app.post('/api/desk/call-next', (req, res) => {
    const { deskId } = req.body;
    const desk = state.desks.find(d => d.id === deskId);
    if (!desk) return res.status(404).json({ error: 'Loket tidak ditemukan.' });

    // Finish current ticket if serving
    if (desk.currentTicketId) {
      const current = state.tickets.find(t => t.id === desk.currentTicketId);
      if (current && (current.status === 'serving' || current.status === 'calling')) {
        current.status = 'completed';
        current.completedAt = new Date().toISOString();
      }
    }

    // Find next ticket assigned to this desk
    // Priority tickets first, then earliest waiting ticket
    let eligibleTickets = state.tickets.filter(t => 
      t.status === 'waiting' && desk.assignedServiceIds.includes(t.serviceId)
    );

    // Sort: Priority first, then by createdAt
    eligibleTickets.sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const nextTicket = eligibleTickets[0];
    if (!nextTicket) {
      desk.currentTicketId = null;
      saveData();
      return res.json({ success: true, ticket: null, message: 'Tidak ada antrian menunggu saat ini.' });
    }

    nextTicket.status = 'calling';
    nextTicket.calledAt = new Date().toISOString();
    nextTicket.deskId = desk.id;
    nextTicket.deskName = desk.name;
    nextTicket.officerName = desk.officerName;
    nextTicket.callCount = (nextTicket.callCount || 0) + 1;

    desk.currentTicketId = nextTicket.id;

    state.lastCallBroadcast = {
      ticketId: nextTicket.id,
      ticketNumber: nextTicket.id,
      deskName: desk.name,
      deskId: desk.id,
      timestamp: Date.now(),
    };

    saveData();
    res.json({ success: true, ticket: nextTicket, message: `Memanggil ${nextTicket.id}` });
  });

  app.post('/api/desk/recall', (req, res) => {
    const { deskId } = req.body;
    const desk = state.desks.find(d => d.id === deskId);
    if (!desk || !desk.currentTicketId) return res.status(400).json({ error: 'Tidak ada antrian aktif di loket.' });

    const ticket = state.tickets.find(t => t.id === desk.currentTicketId);
    if (!ticket) return res.status(404).json({ error: 'Tiket tidak ditemukan.' });

    ticket.status = 'calling';
    ticket.callCount += 1;

    state.lastCallBroadcast = {
      ticketId: ticket.id,
      ticketNumber: ticket.id,
      deskName: desk.name,
      deskId: desk.id,
      timestamp: Date.now(),
    };

    saveData();
    res.json({ success: true, ticket, message: `Memanggil ulang ${ticket.id}` });
  });

  app.post('/api/desk/serve', (req, res) => {
    const { deskId } = req.body;
    const desk = state.desks.find(d => d.id === deskId);
    if (!desk || !desk.currentTicketId) return res.status(400).json({ error: 'Tidak ada antrian aktif di loket.' });

    const ticket = state.tickets.find(t => t.id === desk.currentTicketId);
    if (!ticket) return res.status(404).json({ error: 'Tiket tidak ditemukan.' });

    ticket.status = 'serving';
    ticket.servedAt = new Date().toISOString();
    saveData();

    res.json({ success: true, ticket });
  });

  app.post('/api/desk/finish', (req, res) => {
    const { deskId, notes } = req.body;
    const desk = state.desks.find(d => d.id === deskId);
    if (!desk || !desk.currentTicketId) return res.status(400).json({ error: 'Tidak ada antrian aktif di loket.' });

    const ticket = state.tickets.find(t => t.id === desk.currentTicketId);
    if (!ticket) return res.status(404).json({ error: 'Tiket tidak ditemukan.' });

    ticket.status = 'completed';
    ticket.completedAt = new Date().toISOString();
    ticket.notes = notes || ticket.notes;

    desk.currentTicketId = null;
    saveData();

    res.json({ success: true, ticket, message: 'Layanan selesai.' });
  });

  app.post('/api/desk/hold', (req, res) => {
    const { deskId, reason } = req.body;
    const desk = state.desks.find(d => d.id === deskId);
    if (!desk || !desk.currentTicketId) return res.status(400).json({ error: 'Tidak ada antrian aktif.' });

    const ticket = state.tickets.find(t => t.id === desk.currentTicketId);
    if (!ticket) return res.status(404).json({ error: 'Tiket tidak ditemukan.' });

    ticket.status = 'held';
    ticket.notes = `Dihold: ${reason || 'Menunggu kelengkapan dokumen'}`;

    desk.currentTicketId = null;
    saveData();

    res.json({ success: true, message: 'Antrian ditunda (held).' });
  });

  app.post('/api/desk/skip', (req, res) => {
    const { deskId, reason } = req.body;
    const desk = state.desks.find(d => d.id === deskId);
    if (!desk || !desk.currentTicketId) return res.status(400).json({ error: 'Tidak ada antrian aktif.' });

    const ticket = state.tickets.find(t => t.id === desk.currentTicketId);
    if (!ticket) return res.status(404).json({ error: 'Tiket tidak ditemukan.' });

    ticket.status = 'skipped';
    ticket.notes = `Dilewati (Skip): ${reason || 'Pemohon tidak hadir di panggilan'}`;

    desk.currentTicketId = null;
    saveData();

    res.json({ success: true, message: 'Antrian dilewati.' });
  });

  app.post('/api/desk/status', (req, res) => {
    const { deskId, status, officerName } = req.body;
    const desk = state.desks.find(d => d.id === deskId);
    if (!desk) return res.status(404).json({ error: 'Loket tidak ditemukan.' });

    desk.status = status;
    if (officerName) desk.officerName = officerName;
    saveData();

    res.json({ success: true, desk });
  });

  // 9. ADMIN DATA & MANAGEMENT
  app.get('/api/admin/data', (req, res) => {
    res.json({
      users: state.users,
      services: state.services,
      desks: state.desks,
      schedule: state.schedule,
      auditLogs: state.auditLogs,
      tickets: state.tickets,
    });
  });

  app.post('/api/admin/users', (req, res) => {
    const { id, username, name, role, password, deskId, active, actionUser } = req.body;

    if (id) {
      // Edit User
      const user = state.users.find(u => u.id === id);
      if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });

      if (username) user.username = username;
      if (name) user.name = name;
      if (role) user.role = role;
      if (deskId !== undefined) user.deskId = deskId;
      if (active !== undefined) user.active = active;

      if (password && password.trim() !== '') {
        const salt = generateSaltServer();
        user.salt = salt;
        user.passwordHash = hashPasswordServer(password, salt);
      }

      saveData();
      addAudit(actionUser || 'admin', 'admin', 'UPDATE_USER', `Mengedit pengguna ${user.username}`);
      return res.json({ success: true, user });
    } else {
      // Create User
      if (!username || !password || !name) {
        return res.status(400).json({ error: 'Username, Name, dan Password wajib diisi.' });
      }

      if (state.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return res.status(400).json({ error: 'Username sudah digunakan.' });
      }

      const salt = generateSaltServer();
      const newUser: InternalUser = {
        id: `usr-${Date.now()}`,
        username,
        name,
        role: role || 'petugas',
        salt,
        passwordHash: hashPasswordServer(password, salt),
        deskId: deskId || undefined,
        active: active ?? true,
        mustChangePassword: true,
      };

      state.users.push(newUser);
      saveData();
      addAudit(actionUser || 'admin', 'admin', 'CREATE_USER', `Menambah pengguna baru: ${username}`);
      return res.json({ success: true, user: newUser });
    }
  });

  app.post('/api/admin/services', (req, res) => {
    const { id, name, description, requirements, estimatedMinutes, dailyQuota, isPriority, active, actionUser } = req.body;
    
    const service = state.services.find(s => s.id === id);
    if (!service) return res.status(404).json({ error: 'Layanan tidak ditemukan.' });

    if (name) service.name = name;
    if (description) service.description = description;
    if (requirements) service.requirements = requirements;
    if (estimatedMinutes) service.estimatedMinutes = Number(estimatedMinutes);
    if (dailyQuota) service.dailyQuota = Number(dailyQuota);
    if (isPriority !== undefined) service.isPriority = Boolean(isPriority);
    if (active !== undefined) service.active = Boolean(active);

    saveData();
    addAudit(actionUser || 'admin', 'admin', 'UPDATE_SERVICE', `Memperbarui layanan ${service.name}`);
    res.json({ success: true, service });
  });

  app.post('/api/admin/desks', (req, res) => {
    const { id, name, officerName, assignedServiceIds, status, actionUser } = req.body;
    const desk = state.desks.find(d => d.id === Number(id));
    if (!desk) return res.status(404).json({ error: 'Loket tidak ditemukan.' });

    if (name) desk.name = name;
    if (officerName) desk.officerName = officerName;
    if (assignedServiceIds) desk.assignedServiceIds = assignedServiceIds;
    if (status) desk.status = status;

    saveData();
    addAudit(actionUser || 'admin', 'admin', 'UPDATE_DESK', `Memperbarui konfigurasi ${desk.name}`);
    res.json({ success: true, desk });
  });

  app.post('/api/admin/schedule', (req, res) => {
    const { openTime, closeTime, breakStartTime, breakEndTime, maxDailyOnlineQuota, announcementText, isPaused, actionUser } = req.body;

    if (openTime) state.schedule.openTime = openTime;
    if (closeTime) state.schedule.closeTime = closeTime;
    if (breakStartTime) state.schedule.breakStartTime = breakStartTime;
    if (breakEndTime) state.schedule.breakEndTime = breakEndTime;
    if (maxDailyOnlineQuota) state.schedule.maxDailyOnlineQuota = Number(maxDailyOnlineQuota);
    if (announcementText !== undefined) state.schedule.announcementText = announcementText;
    if (isPaused !== undefined) state.schedule.isPaused = Boolean(isPaused);

    saveData();
    addAudit(actionUser || 'admin', 'admin', 'UPDATE_SCHEDULE', `Memperbarui jadwal operasional & running text TV.`);
    res.json({ success: true, schedule: state.schedule });
  });

  app.post('/api/admin/reset-day', (req, res) => {
    const { actionUser } = req.body;
    state.tickets = [];
    state.desks.forEach(d => { d.currentTicketId = null; });
    saveData();

    addAudit(actionUser || 'admin', 'admin', 'RESET_QUEUE_DAY', `Mereset data antrian untuk hari baru.`);
    res.json({ success: true, message: 'Data antrian hari ini telah di-reset.' });
  });

  // Export CSV
  app.get('/api/reports/export-csv', (req, res) => {
    let csv = 'ID Antrian,Nama Pemohon,NIK,No HP,Layanan,Loket,Petugas,Status,Waktu Buat,Waktu Dipanggil,Waktu Selesai,Rating\n';
    state.tickets.forEach(t => {
      csv += `"${t.id}","${t.name}","${t.nik}","${t.phone}","${t.serviceName}","${t.deskName || '-'}","${t.officerName || '-'}","${t.status}","${t.createdAt}","${t.calledAt || '-'}","${t.completedAt || '-'}","${t.rating || '-'}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="laporan-antrian-dukcapil.csv"');
    res.send(csv);
  });

  // Mount Vite middleware for SPA
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      if (req.originalUrl.startsWith('/api')) return;
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SiAntri Dukcapil Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
