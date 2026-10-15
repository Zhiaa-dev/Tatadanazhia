# TataDana — Fintech SaaS Manajemen Keuangan Terintegrasi Telegram

> **Tagline:** Catat keuangan semudah chat — langsung dari Telegram kamu.

TataDana adalah aplikasi manajemen keuangan pribadi fullstack Indonesia yang dirancang untuk mempermudah pencatatan keuangan harian tanpa hambatan aplikasi konvensional yang rumit. Terintegrasi penuh dengan Telegram Bot, AI Multi-Provider (Gemini, OpenAI, DeepSeek), Supabase PostgreSQL + Auth, dan Midtrans Payment Gateway.

---

## 🚀 Fitur Unggulan

### 1. Integrasi Telegram Bot (Inti Produk)
- **Natural Language Parsing**: Mengubah bahasa sehari-hari menjadi transaksi terstruktur `{jenis, nominal, kategori, catatan}` menggunakan LLM structured output.
- **Dukungan Format Slang Indonesia**: Menangani `15rb`, `15ribu`, `1.5jt`, `500k`, `200 perak`, dll.
- **Voice Note Input**: Rekam suara via Telegram mic (maks 60s), ditranskripsi via Speech-to-Text lalu dicatat otomatis.
- **AI OCR Struk Belanja (Paket Pro)**: Foto nota belanja diekstrak menjadi 1 transaksi utama dengan rincian item individual di dashboard.
- **AI Financial Advisor (Paket Pro)**: Analisis proaktif yang memberikan peringatan jika ada lonjakan pengeluaran kategori >50% atau pengeluaran >80% pemasukan bulanan.
- **Daily Reminder**: Pengingat harian (maks 2x sehari sesuai setting user) dikirim langsung ke chat Telegram.
- **Commands Lengkap**: `/saldo`, `/hari ini`, `/minggu ini`, `/bulan ini`, `/budget`, `/bantuan`, `/start`.

### 2. Dashboard Web App Native
- **Multi Wallet**: Dukungan multi-rekening (Cash, BCA, Mandiri, GoPay, OVO, dll) dengan pemilihan dompet default untuk Telegram.
- **Pencatatan Lengkap**: Pemasukan, Pengeluaran, dan Transfer antar dompet.
- **Target Budget Bulanan**: Dilengkapi progress bar visual dan indikator alert 80% & 100%.
- **Laporan Native (📊 Laporan)**:
  - Ringkasan Metrik: Total Pemasukan, Total Pengeluaran, Net Cashflow, Top 5 Kategori.
  - Tabel transaksi lengkap dengan sorting per kolom dan pencarian teks.
  - Generator on-demand untuk **Export PDF** dan **Export Excel (.xlsx)** disimpan di Supabase Storage dengan signed URLs.
  - Riwayat export tersimpan.
  - Transaksi foto struk dapat di-expand untuk melihat rincian belanjaan per item.

### 3. Superadmin Dashboard
- **Impersonation**: Masuk ke tampilan user tanpa login ulang untuk troubleshooting cepat, dilengkapi **Audit Log** wajib untuk privasi data finansial.
- **AI Multi-Provider Management**: Pengaturan API key terenkripsi dan mode failover otomatis (Gemini 1.5 Flash → OpenAI GPT-4o mini → DeepSeek Chat).
- **Payment Approvals**: Verifikasi otomatis webhook Midtrans dan persetujuan manual transfer bank.
- **AI Execution Logs**: Monitoring latency dan token usage.

---

## 🛠️ Tech Stack & Arsitektur

- **Frontend & Backend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Database & Auth**: Supabase (PostgreSQL dengan Row Level Security, Supabase Auth + Phone OTP).
- **Penyimpanan Laporan**: Supabase Storage (`exports` dan `receipts` buckets).
- **Timezone**: Seluruh timestamp, cron reminder, dan format reply menggunakan **WIB (`Asia/Jakarta`)**.
- **Payment Gateway**: Midtrans (QRIS, GoPay, Virtual Account) + Manual Bank Transfer Approval.

---

## 📂 Struktur Direktori

```
tatadana/
├── supabase/
│   └── migrations/
│       └── 20261014000000_tatadana_init.sql   # Skema PostgreSQL lengkap, RLS, functions, triggers
├── src/
│   ├── app/
│   │   ├── page.tsx                           # Landing page responsif modern orange-putih
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx                 # Split-layout login
│   │   │   ├── register/page.tsx              # Split-layout register + verifikasi HP
│   │   │   └── verify-otp/page.tsx            # OTP verification screen + Sandbox mode
│   │   ├── dashboard/
│   │   │   ├── page.tsx                       # Overview (4 stats cards, charts, recent txs)
│   │   │   ├── transactions/page.tsx          # Riwayat transaksi & rincian item struk
│   │   │   ├── reports/page.tsx               # Laporan native & generator PDF/Excel
│   │   │   ├── budget/page.tsx                # Budget per kategori dengan visual progress
│   │   │   ├── wallets/page.tsx               # Multi-wallet & set default Telegram
│   │   │   └── settings/page.tsx              # Telegram bot tester, reminders, kategori
│   │   ├── admin/
│   │   │   ├── page.tsx                       # Superadmin KPIs & quick actions
│   │   │   ├── ai-providers/page.tsx          # Multi-provider failover management
│   │   │   ├── users/page.tsx                 # User list & audit-logged impersonation
│   │   │   ├── ai-logs/page.tsx               # AI call latency & token cost debug
│   │   │   └── payments/page.tsx              # Persetujuan pembayaran Midtrans & manual
│   │   └── api/
│   │       ├── telegram/webhook/route.ts      # Idempotent Telegram webhook receiver
│   │       ├── telegram/test-connection/      # getMe & setWebhook test engine
│   │       ├── export/excel/route.ts          # Excel XLSX generator
│   │       ├── export/pdf/route.ts            # PDF report generator
│   │       ├── payments/approve/route.ts      # Admin approval & plan upgrade
│   │       └── auth/verify-phone/route.ts     # Phone OTP verification
│   ├── lib/
│   │   ├── ai/                                # Multi-provider, parser, vision, speech, advisor
│   │   ├── telegram/                          # Bot API client, formatter, commands, webhook handler
│   │   ├── export/                            # PDF & Excel business logic
│   │   ├── supabase/                          # Browser, server, dan admin service-role clients
│   │   └── date-utils.ts                      # WIB Asia/Jakarta timezone & Rupiah formatters
```

---

## ⚡ Setup & Instalasi Lokal

### 1. Clone & Install Dependencies
```bash
cd C:\Users\anisa\.gemini\antigravity\scratch\tatadana
npm install
```

### 2. Konfigurasi Environment Variables
Salin `.env.example` menjadi `.env.local` dan isi kredensial yang dibutuhkan:
```bash
cp .env.example .env.local
```

### 3. Jalankan Database Migrations di Supabase
Eksekusi file migration yang ada di folder:
`supabase/migrations/20261014000000_tatadana_init.sql`
melalui **Supabase SQL Editor** atau CLI Supabase.

### 4. Jalankan Aplikasi
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.
- **Landing Page**: `http://localhost:3000`
- **Dashboard User**: `http://localhost:3000/dashboard`
- **Superadmin Panel**: `http://localhost:3000/admin`
- **Settings Telegram Test**: `http://localhost:3000/dashboard/settings`
