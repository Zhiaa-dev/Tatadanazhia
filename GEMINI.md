# TataDana Fintech Engineering Standards & Guidelines

## 1. App Identity & Design System
- **Product Name**: TataDana ("Catat keuangan semudah chat — langsung dari Telegram kamu")
- **Target Audience**: Karyawan swasta, mahasiswa, freelancer Indonesia.
- **Color Palette**:
  - Primary Orange: `#F97316` / `#EA580C` (CTA, badges, positive charts, active states)
  - Background: Clean white `#FFFFFF` / light slate `#F8FAFC`
  - Typography: Plus Jakarta Sans / Inter, geometric modern
- **Language**: 100% Bahasa Indonesia across all UI components, Telegram bot replies, and notifications.
- **Quality Standard**: Premium fintech finish. High responsiveness (375px mobile to 1280px+ desktop), skeleton loading states, informative empty states, smooth CSS micro-interactions, respecting `prefers-reduced-motion`.

## 2. Localization & Financial Conventions
- **Timezone**: All transaction timestamps, reminders, and bot messages MUST use **WIB (`Asia/Jakarta`, UTC+7)**.
- **Currency & Parsing**:
  - Display format: Indonesian Rupiah (e.g., `Rp15.000`, `Rp1.500.000`).
  - Natural parsing: Handle colloquial abbreviations (`15rb` = 15000, `1.5jt` = 1500000, `500k` = 500000, `20ribu` = 20000).

## 3. Architecture & Infrastructure
- **Fullstack Framework**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, Supabase SSR.
- **Database & Auth**: Supabase (PostgreSQL with RLS + Supabase Auth).
- **All Data in Supabase**: Transactions, Wallets, Categories, Budgets, and Export Histories are 100% stored in Supabase Postgres.
- **Migrations**: Every table schema and RLS policy must be tracked in `supabase/migrations/*.sql`.
- **Export Engine**: PDF (pdfmake / jspdf) and Excel (xlsx) generated on-demand, saved to Supabase Storage with expiring signed URLs.
- **Payment Gateway**: Midtrans (Snap / Core API) with webhook handler + manual admin approval fallback.

## 4. Telegram Bot Engine
- **Shared Bot Architecture**: Single shared bot token for all users. Users are linked via verified Indonesian mobile phone numbers or Telegram user IDs.
- **Webhook Endpoint**: `/api/telegram/webhook`
- **Idempotency**: Webhook verifies `update_id` against Supabase to avoid duplicate transactions on Telegram retries.
- **Multi-Provider AI Parser**: Structured output / function calling across Gemini, OpenAI, DeepSeek with seamless failover.
- **Receipt OCR (Pro)**: Vision extraction for itemized receipts, recorded as a master transaction with expandable child line items.
- **Voice Note Parsing**: Telegram voice/audio messages transcribed via Speech-to-Text and parsed into `{ jenis, nominal, kategori, catatan }`.
