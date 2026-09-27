import { User, Company, Job, Candidate, ActivityLog } from '../types';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    companyName: 'PT Solusi Teknologi Nusantara',
    industry: 'Fintech & Cloud Engineering',
    location: 'Jakarta Selatan',
    contactEmail: 'talent@solusiteknologi.co.id',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'comp-2',
    companyName: 'PT Mega Retail Global',
    industry: 'FMCG & Omni-channel Retail',
    location: 'Jakarta Barat',
    contactEmail: 'hrd@megaretail.com',
    createdAt: '2026-02-01T09:30:00.000Z',
  },
  {
    id: 'comp-3',
    companyName: 'PT Logistik Prima Indonesia',
    industry: 'Supply Chain & Cold Chain',
    location: 'Surabaya & Hub Cikarang',
    contactEmail: 'careers@logistikprima.co.id',
    createdAt: '2026-02-20T10:00:00.000Z',
  },
];

export const INITIAL_USERS: User[] = [
  {
    uid: 'usr-admin-1',
    email: 'adminlinchub@cmp.id',
    name: 'Admin Linchub',
    role: 'admin',
    companyId: null,
    title: 'Master ATS Administrator',
    password: 'LincTALENTPARTNERS12@',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    uid: 'usr-recruiter-1',
    email: 'dimas.pratama@linchub.id',
    name: 'Dimas Pratama',
    role: 'recruiter',
    companyId: null,
    title: 'Lead Talent Acquisition Partner',
    password: 'password123',
    createdAt: '2026-01-10T00:00:00.000Z',
  },
  {
    uid: 'usr-client-1',
    email: 'budi.wijaya@solusiteknologi.co.id',
    name: 'Budi Wijaya',
    role: 'client',
    companyId: 'comp-1',
    title: 'VP People & HR Director (PT Solusi Teknologi Nusantara)',
    createdAt: '2026-01-18T00:00:00.000Z',
  },
  {
    uid: 'usr-client-2',
    email: 'amanda.hartanto@megaretail.com',
    name: 'Amanda Hartanto',
    role: 'client',
    companyId: 'comp-2',
    title: 'Head of Talent Acquisition (PT Mega Retail Global)',
    createdAt: '2026-02-05T00:00:00.000Z',
  },
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    companyId: 'comp-1',
    position: 'Senior Backend Engineer (Golang/Cloud)',
    department: 'Engineering',
    jobDescription:
      'Bertanggung jawab membangun arsitektur microservices performa tinggi berlatensi rendah untuk sistem payment gateway, settlement otomatis, dan integrasi core banking. Membutuhkan pemahaman mendalam tentang Golang, gRPC, PostgreSQL, Kafka, dan Kubernetes.',
    requirements: [
      'Minimal 4 tahun pengalaman produksi dengan Golang',
      'Pengalaman mendesain distributed system dan high-throughput transactions',
      'Kemampuan tuning database SQL & NoSQL (PostgreSQL/Redis)',
      'Familiar dengan Docker, CI/CD, dan Kubernetes cloud deployment',
    ],
    jobStatus: 'Open',
    recruiterId: 'usr-recruiter-1',
    targetHires: 2,
    createdAt: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'job-2',
    companyId: 'comp-1',
    position: 'Product Marketing Lead (Fintech)',
    department: 'Marketing & Growth',
    jobDescription:
      'Memimpin strategi go-to-market untuk produk digital B2B dan API lending. Mengelola positioning, customer journey, sales enablement collateral, dan analisa data performa kampanye akuisisi merchant.',
    requirements: [
      '3-6 tahun pengalaman di Product Marketing B2B atau SaaS Fintech',
      'Kemampuan analytical thinking kuat dengan data driven decision making',
      'Rekam jejak sukses dalam peluncuran produk baru dan adopsi user',
    ],
    jobStatus: 'Open',
    recruiterId: 'usr-recruiter-1',
    targetHires: 1,
    createdAt: '2026-02-12T11:00:00.000Z',
  },
  {
    id: 'job-3',
    companyId: 'comp-2',
    position: 'Retail Area Operations Manager',
    department: 'Operations',
    jobDescription:
      'Mengawasi performa operasional, kepatuhan SOP, target omzet, serta manajemen inventori dan staf di 18 outlet supermarket modern wilayah Jabodetabek.',
    requirements: [
      'Minimal 5 tahun pengalaman di level manajerial ritel modern / supermarket',
      'Memiliki pemahaman P&L, shrink management, dan leadership tim lapangan',
      'Kemampuan negosiasi dan manajemen krisis operasional',
    ],
    jobStatus: 'Open',
    recruiterId: 'usr-recruiter-1',
    targetHires: 1,
    createdAt: '2026-02-18T14:00:00.000Z',
  },
  {
    id: 'job-4',
    companyId: 'comp-2',
    position: 'B2B Key Account Executive',
    department: 'Corporate Sales',
    jobDescription:
      'Mengembangkan jaringan kemitraan korporasi untuk program corporate voucher, gift card, dan direct supply B2B perusahaan multi-sektor.',
    requirements: [
      '2-4 tahun pengalaman di B2B sales/account management institusional',
      'Jaringan koneksi procurement perusahaan luas di wilayah Jabodetabek',
      'Keahlian presentasi dan deal closing terbukti',
    ],
    jobStatus: 'Open',
    recruiterId: 'usr-recruiter-1',
    targetHires: 2,
    createdAt: '2026-02-22T10:30:00.000Z',
  },
  {
    id: 'job-5',
    companyId: 'comp-3',
    position: 'Supply Chain Operations Analyst',
    department: 'Logistics',
    jobDescription:
      'Menganalisis utilisasi armada truk, lead time pengiriman antar-pulau, serta efisiensi rute distribusi rantai dingin nasional.',
    requirements: [
      'Gelar S1 Teknik Industri, Logistik, atau Manajemen Operasi',
      'Keahlian analisa data dengan SQL, Excel tingkat lanjut, & Tableau',
      'Memahami proses pergudangan dan TMS (Transportation Management System)',
    ],
    jobStatus: 'Open',
    recruiterId: 'usr-recruiter-1',
    targetHires: 1,
    createdAt: '2026-02-25T08:15:00.000Z',
  },
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cdd-101',
    fullName: 'Andi Saputra',
    email: 'andi.saputra.dev@gmail.com',
    phone: '+6281299887766',
    companyId: 'comp-1',
    jobId: 'job-1',
    position: 'Senior Backend Engineer (Golang/Cloud)',
    recruiterId: 'usr-recruiter-1',
    cvUrl: '#',
    cvFileName: 'CV_Andi_Saputra_Backend_Golang.pdf',
    cvText: `ANDI SAPUTRA
Senior Software Engineer (Backend / Distributed Systems)
Email: andi.saputra.dev@gmail.com | Phone: +6281299887766 | Jakarta

RINGKASAN:
Software Engineer dengan 5+ tahun spesialisasi pengembangan layanan backend berskala besar menggunakan Golang dan arsitektur microservices. Berpengalaman menangani throughput transaksi tinggi (>12,000 TPS) pada sistem payment gateway fintech.

PENGALAMAN KERJA:
1. Senior Backend Engineer - PT Fintek Pay Cepat (2022 - Sekarang)
- Membangun microservices pembayaran QRIS dan Virtual Account dengan Golang dan gRPC.
- Mengurangi latency endpoint transaksi dari 180ms menjadi 42ms melalui optimasi query PostgreSQL dan Redis distributed caching.
- Mengelola clustering Apache Kafka untuk asynchronous event delivery dengan zero-message-loss.

2. Backend Engineer - PT Digital Kreasi Tech (2019 - 2022)
- Mengembangkan RESTful API dengan Golang, Docker, dan MySQL.
- Menerapkan unit test dan integration test coverage hingga 85%.

PENDIDIKAN:
S1 Teknik Informatika - Institut Teknologi Bandung (ITB), IPK 3.72

KEAHLIAN TEKNIS:
Golang, Microservices, gRPC, REST, PostgreSQL, Redis, Apache Kafka, Docker, Kubernetes, CI/CD GitHub Actions.`,
    status: 'Interview HR',
    createdAt: '2026-09-20T09:20:00.000Z',
    updatedAt: '2026-09-24T14:10:00.000Z',
    preliminaryScore: 86,
    preliminaryStatus: 'Qualified',
    preliminaryNotes:
      'Pengalaman teknis Golang 5+ tahun sangat solid. Pengalaman transaksi payment gateway langsung relevan dengan arsitektur target Linchub untuk klien PT Solusi Teknologi Nusantara.',
    preliminaryAt: '2026-09-20T10:15:00.000Z',
    preliminaryBy: 'Dimas Pratama',
    aiSummary:
      'Kandidat memiliki spesialisasi backend Golang yang luar biasa kuat dengan rekam jejak terbukti mengoptimasi distributed system bertransaksi tinggi. Menguasai gRPC, Kafka, dan cloud containerization.',
    aiScore: 88,
    aiSkills: ['Golang', 'gRPC', 'PostgreSQL', 'Redis', 'Apache Kafka', 'Docker', 'Kubernetes'],
    aiExperience:
      '5+ tahun di ekosistem fintech payment gateway dengan pencapaian optimasi latensi dari 180ms ke 42ms.',
    aiEducation: 'S1 Teknik Informatika, Institut Teknologi Bandung (IPK 3.72)',
    aiStrengths: [
      'Pengalaman langsung menangani transaksi finansial berkapasitas 12,000+ TPS',
      'Pemahaman arsitektur clean architecture dan event-driven system',
      'Portofolio teknis dan latar belakang akademis unggul',
    ],
    aiConcerns: [
      'Notice period saat ini 1 bulan (30 hari)',
      'Ekspektasi gaji mendekati batas atas budget posisi',
    ],
    aiMatch: '91% Match - Kandidat ideal untuk arsitektur core fintech',
    aiRecommendation: 'Highly Recommended',
    aiAnalyzedAt: '2026-09-20T09:27:00.000Z',
    aiAnalysisVersion: 'v1.4-gemini',
  },
  {
    id: 'cdd-102',
    fullName: 'Citra Dewi',
    email: 'citra.dewi.mkt@outlook.com',
    phone: '+6281311223344',
    companyId: 'comp-1',
    jobId: 'job-2',
    position: 'Product Marketing Lead (Fintech)',
    recruiterId: 'usr-recruiter-1',
    cvUrl: '#',
    cvFileName: 'CV_Citra_Dewi_ProductMarketing.pdf',
    cvText: `CITRA DEWI
Product Marketing & GTM Lead
Email: citra.dewi.mkt@outlook.com | Phone: +6281311223344 | Jakarta

RINGKASAN:
6 tahun pengalaman dalam product marketing SaaS dan B2B fintech. Memimpin peluncuran 4 produk pembayaran B2B terkemuka yang menghasilkan pertumbuhan ARR lebih dari $2.4M. Mahir memadukan riset pengguna mendalam dengan eksekusi kampanye akuisisi merchant.

PENGALAMAN:
1. Product Marketing Manager - PayNexus Global (2022 - Sekarang)
- Merancang strategi GTM untuk produk Open Banking API & Virtual Account.
- Meningkatkan konversi onboarding merchant sebesar +34% dalam 9 bulan.
- Berkolaborasi erat dengan tim Product Management, Sales, dan Engineering.

2. Marketing Specialist - SaaS Hub Indonesia (2019 - 2022)
- Mengelola strategi konten B2B, whitepapers, dan webinar industri.

PENDIDIKAN:
S1 Manajemen Komunikasi & Bisnis - Universitas Indonesia, IPK 3.65

KEAHLIAN:
Go-To-Market Strategy, Merchant Onboarding Optimization, B2B Positioning, Value Proposition, Sales Enablement, Google Analytics, Amplitude.`,
    status: 'Offering',
    createdAt: '2026-09-18T11:00:00.000Z',
    updatedAt: '2026-09-25T16:00:00.000Z',
    preliminaryScore: 91,
    preliminaryStatus: 'Qualified',
    preliminaryNotes:
      'Latar belakang product marketing fintech B2B langka dan sangat matang. Komunikasi bahasa Inggris dan presentasi strategi luar biasa jelas.',
    preliminaryAt: '2026-09-18T13:30:00.000Z',
    preliminaryBy: 'Dimas Pratama',
    aiSummary:
      'Kandidat kelas atas dengan pengalaman GTM komprehensif di industri fintech B2B. Terbukti mampu menumbuhkan ARR dan mengoptimalkan siklus konversi merchant korporat.',
    aiScore: 92,
    aiSkills: [
      'GTM Strategy',
      'Product Positioning',
      'B2B SaaS Marketing',
      'Value Messaging',
      'Analytics (Amplitude)',
    ],
    aiExperience:
      '6 tahun pengalaman fokus B2B Fintech & SaaS dengan track record $2.4M ARR contribution.',
    aiEducation: 'S1 Manajemen Komunikasi & Bisnis, Universitas Indonesia (IPK 3.65)',
    aiStrengths: [
      'Portofolio peluncuran produk B2B API sukses di pasar Indonesia',
      'Kemampuan storytelling produk yang tajam dan data-driven',
      'Ulasan feedback user interview sangat antusias',
    ],
    aiConcerns: ['Memerlukan fleksibilitas kerja hybrid 2 hari WFH'],
    aiMatch: '94% Match - Keselarasan sempurna dengan target ekspansi klien',
    aiRecommendation: 'Highly Recommended',
    aiAnalyzedAt: '2026-09-18T11:15:00.000Z',
    aiAnalysisVersion: 'v1.4-gemini',
  },
  {
    id: 'cdd-103',
    fullName: 'Budi Santoso',
    email: 'budi.santoso.code@gmail.com',
    phone: '+6281700998811',
    companyId: 'comp-1',
    jobId: 'job-1',
    position: 'Senior Backend Engineer (Golang/Cloud)',
    recruiterId: 'usr-recruiter-1',
    cvUrl: '#',
    cvFileName: 'CV_BudiSantoso_Golang.pdf',
    cvText: `BUDI SANTOSO
Backend Developer (Golang & Node.js)
Email: budi.santoso.code@gmail.com | Phone: +6281700998811 | Depok

RINGKASAN:
Backend Engineer dengan 4 tahun pengalaman membangun sistem e-commerce dan integrasi payment. Menguasai Golang, MySQL, Docker, dan arsitektur RESTful.

PENGALAMAN:
- Backend Engineer - PT Toko Belanja Kita (2021 - Sekarang)
  Membangun service inventori dan checkout e-commerce menggunakan Golang.
- Junior Developer - Software House Kreasi (2020 - 2021)
  Mengembangkan endpoint API Node.js dan Express.

PENDIDIKAN:
S1 Teknik Informatika - Universitas Gunadarma (IPK 3.40)

KEAHLIAN:
Golang, MySQL, REST API, Docker, Git, Redis.`,
    status: 'Screening',
    createdAt: '2026-09-22T08:45:00.000Z',
    updatedAt: '2026-09-23T11:20:00.000Z',
    preliminaryScore: 78,
    preliminaryStatus: 'Qualified',
    preliminaryNotes:
      'Fondasi Golang bagus, memiliki pemahaman sistem REST API. Perlu digali lebih dalam terkait pengalaman penanganan distributed tracing dan Kafka.',
    preliminaryAt: '2026-09-22T09:30:00.000Z',
    preliminaryBy: 'Dimas Pratama',
    aiSummary:
      'Kandidat memiliki pengalaman 4 tahun dalam backend e-commerce menggunakan Golang. Cocok untuk penguatan tim teknik dasar, namun perlu evaluasi lanjutan terkait arsitektur distributed system tingkat lanjut.',
    aiScore: 78,
    aiSkills: ['Golang', 'MySQL', 'REST API', 'Docker', 'Redis'],
    aiExperience: '4 tahun di bidang e-commerce dan API development.',
    aiEducation: 'S1 Teknik Informatika, Universitas Gunadarma (IPK 3.40)',
    aiStrengths: [
      'Pengalaman kerja nyata dengan Golang lebih dari 3 tahun',
      'Kemampuan debugging dan maintenance sistem stabil',
    ],
    aiConcerns: [
      'Belum memiliki pengalaman mendalam dengan message broker Kafka dan Kubernetes',
    ],
    aiMatch: '78% Match - Memenuhi syarat dasar, butuh pendalaman arsitektur tingkat lanjut',
    aiRecommendation: 'Recommended',
    aiAnalyzedAt: '2026-09-22T08:52:00.000Z',
    aiAnalysisVersion: 'v1.4-gemini',
  },
  {
    id: 'cdd-104',
    fullName: 'Rizky Ramadhan',
    email: 'rizky.ramadhan.dev@gmail.com',
    phone: '+6285612344556',
    companyId: 'comp-1',
    jobId: 'job-1',
    position: 'Senior Backend Engineer (Golang/Cloud)',
    recruiterId: 'usr-recruiter-1',
    cvUrl: '#',
    cvFileName: 'CV_Rizky_Ramadhan.pdf',
    cvText: `RIZKY RAMADHAN
Software Engineer | Backend
Email: rizky.ramadhan.dev@gmail.com | Phone: +6285612344556

PENGALAMAN:
- Software Engineer - PT Solusi Digital Prima (2023 - Sekarang)
  Mengerjakan backend service dengan Python dan Golang.
- Intern Backend Developer - Startup Fin (2022)

PENDIDIKAN:
S1 Sistem Informasi - Universitas Brawijaya (IPK 3.50)

KEAHLIAN:
Golang, Python, FastAPI, PostgreSQL, Docker.`,
    status: 'Preliminary',
    createdAt: '2026-09-25T14:10:00.000Z',
    updatedAt: '2026-09-25T14:10:00.000Z',
    preliminaryScore: 74,
    preliminaryStatus: 'Need Review',
    preliminaryNotes:
      'Pengalaman total baru 2.5 tahun, sedikit di bawah target senior requirement 4 tahun. Namun kemampuan coding Golang tergolong rapi dan adaptif.',
    preliminaryAt: '2026-09-25T15:00:00.000Z',
    preliminaryBy: 'Dimas Pratama',
    aiSummary:
      'Kandidat bertalenta dengan potensi tinggi dan penguasaan Golang & Python modern. Namun durasi pengalaman profesional di level senior masih perlu pertimbangan matang.',
    aiScore: 74,
    aiSkills: ['Golang', 'Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    aiExperience: '2.5 tahun backend development di industri solusi digital.',
    aiEducation: 'S1 Sistem Informasi, Universitas Brawijaya',
    aiStrengths: ['Kemampuan adaptasi multi-language cepat (Golang + Python)'],
    aiConcerns: ['Tahun pengalaman masih di bawah kriteria Senior (min 4 tahun)'],
    aiMatch: '72% Match - Alternatif jika klien membuka mid-level engineer',
    aiRecommendation: 'Conditional',
    aiAnalyzedAt: '2026-09-25T14:20:00.000Z',
    aiAnalysisVersion: 'v1.4-gemini',
  },
  {
    id: 'cdd-105',
    fullName: 'Dimas Putra',
    email: 'dimas.putra.ops@yahoo.com',
    phone: '+6281288990011',
    companyId: 'comp-2',
    jobId: 'job-3',
    position: 'Retail Area Operations Manager',
    recruiterId: 'usr-recruiter-1',
    cvUrl: '#',
    cvFileName: 'CV_DimasPutra_RetailManager.pdf',
    cvText: `DIMAS PUTRA
Retail Area & Operations Manager
Email: dimas.putra.ops@yahoo.com | Phone: +6281288990011 | Tangerang

RINGKASAN:
Profesional operasional ritel dengan 7 tahun rekam jejak mengelola multi-unit gerai ritel modern di area Jabodetabek. Terbiasa memimpin lebih dari 120 staf outlet, mengendalikan shrink rate di bawah 0.4%, serta mendorong pencapaian KPI sales hingga 108% target tahunan.

PENGALAMAN KERJA:
1. Area Operations Manager - PT Ritel Makmur Bersama (2021 - Sekarang)
- Mengawasi operasional 14 gerai supermarket modern di wilayah Jakarta Barat & Tangerang.
- Mengimplementasikan SOP efisiensi inventori dan visual merchandising baru.
- Berhasil menekan operational cost sebesar 7.2% tanpa menurunkan standar layanan.

2. Store General Manager - Mega Store Karawaci (2018 - 2021)
- Memimpin manajemen harian gerai seluas 3.500 m2 dengan 65 personel.

PENDIDIKAN:
S1 Manajemen Bisnis - Universitas Prasetiya Mulya (IPK 3.55)

KEAHLIAN:
P&L Retail Management, Shrinkage Control, Inventory Audit, Staff Coaching, POS Systems, Vendor Negotiation.`,
    status: 'Interview User',
    createdAt: '2026-09-19T10:00:00.000Z',
    updatedAt: '2026-09-24T15:30:00.000Z',
    preliminaryScore: 88,
    preliminaryStatus: 'Qualified',
    preliminaryNotes:
      'Pengalaman mengelola 14 outlet ritel sangat pas untuk kebutuhan ekspansi PT Mega Retail Global. Track record shrinkage control terbukti nyata.',
    preliminaryAt: '2026-09-19T11:45:00.000Z',
    preliminaryBy: 'Dimas Pratama',
    aiSummary:
      'Kandidat manajerial ritel berpengalaman 7 tahun dengan penguasaan P&L ritel dan leadership lapangan yang matang. Terbukti mampu menekan cost dan memimpin ratusan staf outlet.',
    aiScore: 89,
    aiSkills: [
      'Retail P&L Management',
      'Store Audit & SOP',
      'Shrinkage Control',
      'Multi-unit Leadership',
      'Visual Merchandising',
    ],
    aiExperience: '7 tahun di industri ritel modern dengan pengawasan hingga 14 outlet.',
    aiEducation: 'S1 Manajemen Bisnis, Universitas Prasetiya Mulya (IPK 3.55)',
    aiStrengths: [
      'Rekam jejak kontrol shrinkage 0.4% dan pencapaian target 108%',
      'Pemahaman regulasi perizinan dan hubungan karyawan outlet ritel',
      'Gaya kepemimpinan tegas dan komunikatif',
    ],
    aiConcerns: ['Perlu mobilitas tinggi lintas area Jabodetabek'],
    aiMatch: '93% Match - Sangat selaras dengan requirement posisi',
    aiRecommendation: 'Highly Recommended',
    aiAnalyzedAt: '2026-09-19T10:18:00.000Z',
    aiAnalysisVersion: 'v1.4-gemini',
  },
  {
    id: 'cdd-106',
    fullName: 'Nabila Putri',
    email: 'nabila.putri.sales@gmail.com',
    phone: '+6281355443322',
    companyId: 'comp-2',
    jobId: 'job-4',
    position: 'B2B Key Account Executive',
    recruiterId: 'usr-recruiter-1',
    cvUrl: '#',
    cvFileName: 'CV_Nabila_Putri_B2BSales.pdf',
    cvText: `NABILA PUTRI
B2B Key Account & Corporate Sales Specialist
Email: nabila.putri.sales@gmail.com | Phone: +6281355443322 | Jakarta

RINGKASAN:
Account Executive berorientasi target dengan 4 tahun pengalaman di B2B corporate sales sektor hospitality dan ritel. Berhasil mengakuisisi 45+ akun korporasi baru dan melampaui kuota tahunan rata-rata 115%.

PENGALAMAN:
- Senior Account Executive - PT Hadiah Korporat Solusi (2022 - Sekarang)
  Menangani penjualan corporate voucher senilai Rp 8.5 Miliar per tahun.
- Corporate Sales Officer - PT Kado Ritel Nusantara (2020 - 2022)

PENDIDIKAN:
S1 Hubungan Internasional - Universitas Padjadjaran (IPK 3.60)

KEAHLIAN:
B2B Deal Structuring, Corporate Gifting, Pipeline CRM (Hubspot/Salesforce), Client Retention.`,
    status: 'Offering',
    createdAt: '2026-09-21T13:00:00.000Z',
    updatedAt: '2026-09-25T11:00:00.000Z',
    preliminaryScore: 90,
    preliminaryStatus: 'Qualified',
    preliminaryNotes:
      'Portofolio corporate voucher dan gift card B2B langsung match dengan bisnis unit baru PT Mega Retail Global. Sikap profesional dan relasi klien sangat luas.',
    preliminaryAt: '2026-09-21T14:30:00.000Z',
    preliminaryBy: 'Dimas Pratama',
    aiSummary:
      'Kandidat sales institusional yang memiliki koneksi korporat luas dan pencapaian target di atas rata-rata industri. Memahami proses procurement B2B.',
    aiScore: 90,
    aiSkills: ['B2B Sales', 'Key Account Management', 'CRM Systems', 'Contract Negotiation'],
    aiExperience: '4 tahun spesialisasi corporate sales dengan portofolio Rp 8.5M/tahun.',
    aiEducation: 'S1 Hubungan Internasional, Universitas Padjadjaran',
    aiStrengths: ['Memiliki database relasi purchasing korporasi aktif'],
    aiConcerns: ['Meminta komisi terstruktur dengan target berjenjang'],
    aiMatch: '92% Match - Siap langsung berkontribusi pada pendapatan kuartal ini',
    aiRecommendation: 'Highly Recommended',
    aiAnalyzedAt: '2026-09-21T13:20:00.000Z',
    aiAnalysisVersion: 'v1.4-gemini',
  },
  {
    id: 'cdd-107',
    fullName: 'Hendra Wijaya',
    email: 'hendra.wijaya.b2b@gmail.com',
    phone: '+6281877665544',
    companyId: 'comp-2',
    jobId: 'job-4',
    position: 'B2B Key Account Executive',
    recruiterId: 'usr-recruiter-1',
    cvUrl: '#',
    cvFileName: 'CV_Hendra_Wijaya.pdf',
    cvText: `HENDRA WIJAYA
B2B Sales Executive
Email: hendra.wijaya.b2b@gmail.com | Phone: +6281877665544

PENGALAMAN:
- Account Executive - PT Retail Mitra Utama (2021 - Sekarang)
- Sales Representative - PT Distribusi Prima (2019 - 2021)

PENDIDIKAN:
S1 Manajemen Pemasaran - Universitas Trisakti

KEAHLIAN:
Corporate Sales, Negotiation, CRM, Account Management.`,
    status: 'Hired',
    createdAt: '2026-09-10T09:00:00.000Z',
    updatedAt: '2026-09-23T10:00:00.000Z',
    preliminaryScore: 92,
    preliminaryStatus: 'Qualified',
    preliminaryNotes: 'Kandidat telah lolos seluruh tahapan dan menandatangani offering letter.',
    preliminaryAt: '2026-09-10T10:00:00.000Z',
    preliminaryBy: 'Dimas Pratama',
    aiSummary: 'Kandidat terbukti sangat solid dan telah resmi dipekerjakan.',
    aiScore: 94,
    aiSkills: ['Corporate Sales', 'Negotiation', 'CRM', 'Key Account'],
    aiExperience: '5 tahun pengalaman B2B FMCG & Retail.',
    aiEducation: 'S1 Manajemen Pemasaran, Universitas Trisakti',
    aiStrengths: ['Track record luar biasa di FMCG corporate sales'],
    aiConcerns: [],
    aiMatch: '95% Match',
    aiRecommendation: 'Highly Recommended',
    aiAnalyzedAt: '2026-09-10T09:20:00.000Z',
    aiAnalysisVersion: 'v1.4-gemini',
  },
  {
    id: 'cdd-108',
    fullName: 'Kevin Sanjaya',
    email: 'kevin.sanjaya.sc@gmail.com',
    phone: '+6281244556677',
    companyId: 'comp-3',
    jobId: 'job-5',
    position: 'Supply Chain Operations Analyst',
    recruiterId: 'usr-recruiter-1',
    cvUrl: '#',
    cvFileName: 'CV_KevinSanjaya_SupplyChain.pdf',
    cvText: `KEVIN SANJAYA
Supply Chain & Logistics Analyst
Email: kevin.sanjaya.sc@gmail.com | Phone: +6281244556677 | Surabaya

RINGKASAN:
Analyst rantai pasok dengan 3+ tahun pengalaman di perusahaan logistik multinasional. Berpengalaman dalam route optimization, utilisasi fleet, dan visualisasi data logistik dengan SQL & Tableau.

PENGALAMAN:
- Junior Supply Chain Analyst - Global Freight Logistics (2022 - Sekarang)
- Logistic Intern - Pelabuhan Logistik Nusantara (2021)

PENDIDIKAN:
S1 Teknik Industri - Institut Teknologi Sepuluh Nopember (ITS), IPK 3.68

KEAHLIAN:
Supply Chain Analytics, SQL, Tableau, Fleet Optimization, Cold Chain Logistics.`,
    status: 'Interview HR',
    createdAt: '2026-09-22T15:00:00.000Z',
    updatedAt: '2026-09-25T17:00:00.000Z',
    preliminaryScore: 84,
    preliminaryStatus: 'Qualified',
    preliminaryNotes:
      'Lulusan ITS Teknik Industri dengan kemampuan analisa data logistik yang sangat aplikatif untuk armada rantai dingin di Surabaya.',
    preliminaryAt: '2026-09-22T16:00:00.000Z',
    preliminaryBy: 'Dimas Pratama',
    aiSummary:
      'Kandidat memiliki latar belakang teknikal industri yang kuat, menguasai pengolahan data armada dan optimasi rute logistik.',
    aiScore: 84,
    aiSkills: ['SQL', 'Tableau', 'Fleet Optimization', 'Cold Chain', 'Supply Chain Modeling'],
    aiExperience: '3 tahun di logistik dan perencanaan rute transportasi.',
    aiEducation: 'S1 Teknik Industri, Institut Teknologi Sepuluh Nopember (ITS)',
    aiStrengths: ['Kemampuan SQL dan visualisasi analitik tinggi'],
    aiConcerns: ['Perlu adaptasi dengan sistem ERP internal perusahaan klien'],
    aiMatch: '87% Match',
    aiRecommendation: 'Recommended',
    aiAnalyzedAt: '2026-09-22T15:15:00.000Z',
    aiAnalysisVersion: 'v1.4-gemini',
  },
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    cddId: 'cdd-101',
    candidateName: 'Andi Saputra',
    action: 'Candidate Added',
    performedBy: 'Dimas Pratama',
    role: 'recruiter',
    timestamp: '2026-09-20T09:20:00.000Z',
    details: 'Kandidat ditambahkan ke posisi Senior Backend Engineer',
  },
  {
    id: 'log-2',
    cddId: 'cdd-101',
    candidateName: 'Andi Saputra',
    action: 'CV Uploaded',
    performedBy: 'Dimas Pratama',
    role: 'recruiter',
    timestamp: '2026-09-20T09:25:00.000Z',
    details: 'File CV_Andi_Saputra_Backend_Golang.pdf berhasil diunggah',
  },
  {
    id: 'log-3',
    cddId: 'cdd-101',
    candidateName: 'Andi Saputra',
    action: 'AI Analysis Completed',
    performedBy: 'Gemini AI Engine',
    role: 'system',
    timestamp: '2026-09-20T09:27:00.000Z',
    details: 'AI Score: 88/100 · Highly Recommended (Match 91%)',
  },
  {
    id: 'log-4',
    cddId: 'cdd-101',
    candidateName: 'Andi Saputra',
    action: 'Preliminary Completed',
    performedBy: 'Dimas Pratama',
    role: 'recruiter',
    timestamp: '2026-09-20T10:15:00.000Z',
    details: 'Score: 86/100 · Status: Qualified · Catatan: Pengalaman Golang 5+ tahun solid',
  },
  {
    id: 'log-5',
    cddId: 'cdd-101',
    candidateName: 'Andi Saputra',
    action: 'Status Changed',
    performedBy: 'Dimas Pratama',
    role: 'recruiter',
    timestamp: '2026-09-24T14:10:00.000Z',
    details: 'Dipindahkan dari Screening ke tahap Interview HR',
  },
  {
    id: 'log-6',
    cddId: 'cdd-102',
    candidateName: 'Citra Dewi',
    action: 'Candidate Added',
    performedBy: 'Dimas Pratama',
    role: 'recruiter',
    timestamp: '2026-09-18T11:00:00.000Z',
    details: 'Kandidat ditambahkan untuk posisi Product Marketing Lead',
  },
  {
    id: 'log-7',
    cddId: 'cdd-102',
    candidateName: 'Citra Dewi',
    action: 'Preliminary Completed',
    performedBy: 'Dimas Pratama',
    role: 'recruiter',
    timestamp: '2026-09-18T13:30:00.000Z',
    details: 'Score: 91/100 · Status: Qualified',
  },
  {
    id: 'log-8',
    cddId: 'cdd-102',
    candidateName: 'Citra Dewi',
    action: 'Status Changed',
    performedBy: 'Dimas Pratama',
    role: 'recruiter',
    timestamp: '2026-09-25T16:00:00.000Z',
    details: 'Kandidat mencapai tahap Offering setelah interview user memuaskan',
  },
  {
    id: 'log-9',
    cddId: 'cdd-105',
    candidateName: 'Dimas Putra',
    action: 'Status Changed',
    performedBy: 'Dimas Pratama',
    role: 'recruiter',
    timestamp: '2026-09-24T15:30:00.000Z',
    details: 'Kandidat dijadwalkan ke tahap Interview User dengan Direktur Operasional',
  },
  {
    id: 'log-10',
    cddId: 'cdd-107',
    candidateName: 'Hendra Wijaya',
    action: 'Candidate Hired',
    performedBy: 'Dimas Pratama',
    role: 'recruiter',
    timestamp: '2026-09-23T10:00:00.000Z',
    details: 'Kandidat resmi menandatangani kontrak offering dan dipekerjakan',
  },
];
