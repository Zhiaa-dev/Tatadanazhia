'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Receipt,
  Mic,
  BarChart3,
  Bot,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Wallet,
  Smartphone,
  Check,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatRupiah, formatTelegramDateTime } from '@/lib/date-utils';

export default function LandingPage() {
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'lifetime'>('lifetime');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Interactive Bot Preview Simulated State
  const [simulatedChat, setSimulatedChat] = useState<
    Array<{ sender: 'user' | 'bot'; text: string; time: string; items?: any[] }>
  >([
    {
      sender: 'user',
      text: 'beli bakso urat 25rb',
      time: '18:15',
    },
    {
      sender: 'bot',
      text: `📅 ${formatTelegramDateTime()}\n💸 Pengeluaran tercatat!\n├ Nominal : Rp25.000\n├ Kategori : 🍜 Makanan\n├ Dompet : 👛 Cash\n├ Catatan : beli bakso urat\n└ Saldo : Rp1.425.000\n\n📊 Budget Makanan bulan ini:\n██████░░░░ 62% — sisa Rp575.000`,
      time: '18:15',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendSimulated = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const timeNow = '18:20';

    const botReply = `📅 ${formatTelegramDateTime()}\n💸 Pengeluaran tercatat!\n├ Nominal : Rp35.000\n├ Kategori : 🍜 Makanan\n├ Dompet : 👛 Cash\n├ Catatan : ${userText}\n└ Saldo : Rp1.390.000\n\n📊 Budget Makanan bulan ini:\n███████░░░ 68% — sisa Rp540.000`;

    setSimulatedChat((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: timeNow },
      { sender: 'bot', text: botReply, time: timeNow },
    ]);
    setChatInput('');
  };

  const faqs = [
    {
      q: 'Bagaimana cara kerja pencatatan keuangan lewat Telegram?',
      a: 'Sangat mudah! Kamu cukup menghubungkan bot resmi TataDana di Telegram (@TataDanaBot). Setiap kali jajan, belanja, atau menerima gaji, cukup ketik di chat (contoh: "beli kopi 25rb" atau kirim voice note), dan AI kami akan mengekstrak nominal, kategori, serta memotong saldo dompetmu secara instan.',
    },
    {
      q: 'Apakah bisa menggunakan fitur foto struk di paket Starter?',
      a: 'Fitur ekstraksi foto struk belanja dengan AI OCR adalah fitur eksklusif paket Pro. Di paket Starter, kamu tetap bisa mencatat dengan nyaman via chat teks dan voice note.',
    },
    {
      q: 'Bagaimana keamanan data transaksi saya di TataDana?',
      a: 'Data keuanganmu tersimpan 100% aman di database PostgreSQL Supabase dengan enkripsi Row Level Security (RLS). Kami tidak pernah menjual data pribadimu ke pihak ketiga dan tidak memiliki akses ke rekening bankmu secara langsung.',
    },
    {
      q: 'Apakah satu bot Telegram bisa dipakai untuk banyak dompet?',
      a: 'Ya! TataDana mendukung fitur Multi-Wallet (Cash, Rekening Bank seperti BCA/Mandiri, hingga E-Wallet GoPay/OVO). Kamu bisa memilih 1 dompet sebagai default untuk Telegram, atau menyebutkan nama dompet di chat (contoh: "bensin 25rb pakai GoPay").',
    },
    {
      q: 'Apakah saya bisa mengekspor laporan ke format Excel dan PDF?',
      a: 'Bisa! Di dashboard TataDana tersedia halaman Laporan native dengan generator on-demand ke file PDF dan Excel (.xlsx) yang rapi, lengkap dengan rincian item nota dan metrik arus kas.',
    },
    {
      q: 'Bagaimana cara AI Financial Advisor membantu saya?',
      a: 'AI Advisor bekerja secara proaktif. Jika ada lonjakan pengeluaran mendadak di atas 50% dibanding minggu lalu atau pengeluaranmu sudah mendekati 80% dari gaji bulanan, bot akan memberikan insight dan saran solutif langsung di chat Telegrammu.',
    },
    {
      q: 'Metode pembayaran apa saja yang didukung untuk upgrade ke Pro?',
      a: 'Kami menerima pembayaran otomatis lewat Midtrans (QRIS, GoPay, ShopeePay, Virtual Account BCA/Mandiri/BRI/BNI) serta transfer bank manual yang dapat diverifikasi oleh admin.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* 1. NAVBAR (Sticky) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-brand transition-transform group-hover:scale-105">
              <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
            </div>
            <div className="text-2xl font-black tracking-tight text-slate-900">
              Tata<span className="text-orange-500">Dana</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#fitur" className="hover:text-orange-600 transition-colors">
              Fitur
            </a>
            <a href="#preview" className="hover:text-orange-600 transition-colors">
              Demo Bot
            </a>
            <a href="#pricing" className="hover:text-orange-600 transition-colors">
              Harga
            </a>
            <a href="#faq" className="hover:text-orange-600 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-bold text-slate-700">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Coba Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2 & 3 & 4. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-orange-400/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-6">
          {/* Pre-headline badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-bold animate-in fade-in duration-500">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>✨ Catat keuangan langsung dari Telegram</span>
          </div>

          {/* Headline (H1) with gradient */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Gaji habis sebelum akhir bulan? <br className="hidden sm:block" />
            Sudah saatnya kamu tahu{' '}
            <span className="orange-gradient-text">ke mana uangmu pergi.</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            TataDana mencatat setiap pengeluaranmu langsung dari chat Telegram atau foto struk — sisanya kami yang urus.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-brand">
                <span>Mulai Gratis Sekarang</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>

            <a href="#demo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                <span>Lihat cara kerjanya →</span>
              </Button>
            </a>
          </div>

          {/* 5. HERO SECTION VIDEO / DEMO PLACEHOLDER */}
          {/* TODO: Ganti dengan video tutorial demo asli saat beta tester siap */}
          <div className="mt-12 max-w-4xl mx-auto rounded-3xl bg-slate-900 p-2 md:p-3 shadow-premium border border-slate-800">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center text-center p-6 group">
              <div className="w-16 h-16 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-brand group-hover:scale-110 transition-transform cursor-pointer">
                <Play className="w-7 h-7 fill-white translate-x-0.5" />
              </div>
              <p className="text-white font-bold text-sm sm:text-base mt-4">
                Tonton Demo 60 Detik: Catat Keuangan Semudah Chat
              </p>
              <p className="text-slate-400 text-xs mt-1">
                // TODO: Placeholder Video Interaktif TataDana Telegram Bot Integration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7 & 8. PROBLEM AWARE BULLET POINTS & SOLUTION TRANSITION */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <Badge variant="orange">Mengapa Aplikasi Lain Selalu Gagal?</Badge>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Pernahkah kamu mengalami 3 hal ini?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold mb-5">
                🤦‍♂️
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                "Buka aplikasi keuangan? Nanti dulu deh..."
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aplikasi keuangan tradisional terlalu ribet: harus login, pilih kategori bertingkat, pilih akun. Akibatnya
                kamu malas mencatat setelah 3 hari.
              </p>
            </Card>

            <Card className="p-8 border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold mb-5">
                💸
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                "Kok uangnya habis ya? Padahal kayak tidak beli apa-apa"
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pengeluaran kecil seperti kopi, parkir, dan jajan minimarket bocor halus setiap hari tanpa tercatat, lalu
                tiba-tiba saldo ATM kosong.
              </p>
            </Card>

            <Card className="p-8 border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold mb-5">
                🎯
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                "Udah niat bikin budget, tapi seminggu lupa"
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Budget yang dibuat di awal bulan tidak pernah dipantau secara real-time. Tahu-tahu tanggal 20 sudah
                terpakai 120% tanpa ada yang mengingatkan.
              </p>
            </Card>
          </div>

          {/* Solution Transition */}
          <div className="mt-16 text-center max-w-3xl mx-auto p-8 rounded-3xl bg-white border border-orange-200/80 shadow-premium">
            <span className="text-xs uppercase font-extrabold tracking-wider text-orange-600 block mb-2">
              Solusi yang Masuk Akal
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Bagaimana kalau mencatat keuangan semudah kirim pesan ke teman?
            </h3>
            <p className="text-sm text-slate-600 mt-3 max-w-xl mx-auto leading-relaxed">
              Memperkenalkan <strong>TataDana</strong> — Aplikasi manajemen keuangan pribadi yang hidup di dalam aplikasi
              yang setiap hari sudah kamu buka: <strong>Telegram</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 9. INTERACTIVE DASHBOARD & TELEGRAM BOT PREVIEW */}
      <section id="demo" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <Badge variant="orange">Coba Langsung di Sini</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Interactive Bot Preview
            </h2>
            <p className="text-sm text-slate-600">
              Ketik contoh pengeluaranmu (misal: "beli kopi 18k" atau "bensin 25rb") dan lihat bagaimana bot membalas secara
              otomatis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Telegram Chat Simulation */}
            <div className="rounded-3xl bg-[#0f172a] text-white p-5 shadow-premium border border-slate-800 flex flex-col h-[520px]">
              {/* Chat Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white shadow-brand">
                  <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    TataDana Bot <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  </h4>
                  <span className="text-[11px] text-emerald-400">bot aktif • balas instan</span>
                </div>
              </div>

              {/* Chat Message Bubble History */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
                {simulatedChat.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs whitespace-pre-wrap leading-relaxed font-sans ${
                        msg.sender === 'user'
                          ? 'bg-orange-500 text-white rounded-tr-none font-semibold'
                          : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60 font-mono'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input Box */}
              <form onSubmit={handleSendSimulated} className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik misalnya: beli nasi padang 20rb..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 outline-none focus:border-orange-500"
                />
                <Button type="submit" size="sm" className="px-4">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Live Synchronized Dashboard Mini Preview */}
            <div className="space-y-4">
              <Card className="p-5 border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Sinkronisasi Otomatis ke Dashboard TataDana
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-slate-900">{formatRupiah(1390000)}</h4>
                    <span className="text-xs text-emerald-600 font-semibold">● Saldo Dompet Cash Terupdate</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    👛
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Budget Makanan Bulan Ini
                </span>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-800">Terpakai: Rp610.000 / Rp1.500.000</span>
                  <span className="text-orange-600">68%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: '68%' }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Alert otomatis dikirim ke Telegram begitu pemakaian menyentuh 80%.
                </p>
              </Card>

              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200/60 text-xs text-orange-950 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span>
                  <strong>Bukan prototype mockup:</strong> Seluruh parsing menggunakan engine multi-provider LLM (Gemini,
                  GPT, DeepSeek) dengan structured output.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FITUR SECTION (3 Alternating Layout Features) */}
      <section id="fitur" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 space-y-24">
          {/* Fitur 1: Catat via Telegram (Teks, VN, Foto Struk) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <Badge variant="orange">Fitur Utama #1</Badge>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                Catat Transaksi Semudah Chat Teman di Telegram
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tulis pesan santai, kirim voice note saat sedang menyetir, atau foto struk belanjaan di minimarket. AI
                TataDana langsung membedah item, nominal, dompet, dan kategori dalam hitungan detik.
              </p>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Paham bahasa gaul Indonesia: 15rb, 1.5jt, 500k, perak</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Transkripsi Voice Note cepat dengan AI Speech-to-Text</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>AI Vision OCR untuk nota belanja multi-item</span>
                </li>
              </ul>
            </div>

            <Card className="p-6 bg-white border-slate-200 shadow-premium">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                <Receipt className="w-6 h-6 text-purple-600" />
                <h4 className="font-bold text-slate-900 text-sm">Scan Struk Otomatis (Pro)</h4>
              </div>
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 text-xs text-purple-950 mb-3">
                🧾 Struk Indomaret: 3 Item belanjaan terdeteksi otomatis dan dipisahkan kategorinya.
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>1. Beras Pandan Wangi 5kg</span>
                  <span className="font-bold">Rp75.000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>2. Minyak Goreng Bimoli 2L</span>
                  <span className="font-bold">Rp34.000</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>3. Sabun Cuci Piring</span>
                  <span className="font-bold">Rp16.000</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Fitur 2: Laporan & Export Otomatis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Card className="p-6 bg-white border-slate-200 shadow-premium order-2 lg:order-1">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-orange-500" />
                  <h4 className="font-bold text-slate-900 text-sm">Dashboard & Laporan Native</h4>
                </div>
                <Badge variant="green" size="sm">
                  PDF & XLSX
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Laporan rapi siap cetak untuk evaluasi bulanan atau pengajuan administrasi finansial.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block font-bold">NET CASHFLOW</span>
                  <span className="text-base font-extrabold text-emerald-600">+Rp2.350.000</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block font-bold">TOTAL TRANSAKSI</span>
                  <span className="text-base font-extrabold text-slate-900">42 Transaksi</span>
                </div>
              </div>
            </Card>

            <div className="space-y-4 order-1 lg:order-2">
              <Badge variant="orange">Fitur Utama #2</Badge>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                Laporan & Export Otomatis di Dashboard TataDana
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tidak ada dependensi ke spreadsheet pihak ketiga yang lambat. Seluruh riwayat transaksi diproses langsung
                di database internal TataDana dengan Supabase Realtime, dan bisa diekspor kapan saja ke format PDF atau
                Excel (.xlsx).
              </p>
            </div>
          </div>

          {/* Fitur 3: AI Financial Advisor (Pro) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <Badge variant="orange">Fitur Utama #3</Badge>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                AI Financial Advisor: Asisten Pribadi yang Siaga 24/7
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Bukan cuma mencatat, TataDana menganalisis kebiasaan finansialmu. Bot akan otomatis memberi peringatan
                cerdas saat kamu terlalu sering jajan di luar atau budget kategori hampir menipis.
              </p>
            </div>

            <Card className="p-6 bg-slate-900 text-white rounded-3xl shadow-premium border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-3">
                <Bot className="w-4 h-4" />
                <span>AI Financial Advisor (Auto-Trigger)</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-mono leading-relaxed space-y-2">
                <p className="text-slate-300">
                  🤖 <strong>Financial Advisor</strong>
                  <br />
                  Hei Budi! Pengeluaran kopi & makananmu naik 52% dibanding minggu lalu. Total sudah mencapai Rp840.000.
                </p>
                <p className="text-orange-300">
                  💡 <strong>Saran:</strong> Coba masak sendiri selama 3 hari ke depan untuk menjaga arus kasmu tetap aman
                  hingga tanggal gajian!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 11. TESTIMONI (Masonry Grid Placeholder) */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <Badge variant="orange">Kisah Nyata</Badge>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Dicintai Pengguna yang Dulunya Malas Mencatat
            </h2>
            <p className="text-sm text-slate-500">
              // TODO: Ganti dengan testimoni dari beta tester asli setelah deployment
            </p>
          </div>

          {/* Masonry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-slate-200">
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "Dulu aplikasi keuangan saya hapus setelah 3 hari karena ribet. Pakai TataDana di Telegram, tinggal kirim
                chat kayak kirim WA. Sekarang udah 3 bulan konsisten mencatat!"
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">
                  AN
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Aditya Nugraha</h5>
                  <span className="text-[10px] text-slate-400">Software Engineer, Jakarta</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-slate-200">
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "Fitur foto struknya juara banget! Beli belanjaan bulanan di Indomaret tinggal difoto, semua item langsung
                masuk ke laporan. Hemat waktu 20 menit per belanja."
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">
                  DP
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Dian Paramita</h5>
                  <span className="text-[10px] text-slate-400">Freelance Designer, Bandung</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-slate-200">
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "Sebagai anak kos, gaji UMK sering habis tanggal 15. Reminder harian TataDana di jam 8 malam bikin saya sadar
                sebelum keblasan jajan."
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">
                  RW
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Rizky Wahyudi</h5>
                  <span className="text-[10px] text-slate-400">Karyawan Swasta, Surabaya</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 12. PRICING SECTION (Starter vs Pro) */}
      <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <Badge variant="orange">Paket & Investasi</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Pilih Paket Sesuai Kebutuhanmu
            </h2>
            <p className="text-sm text-slate-600">
              Mulai gratis dengan Starter, atau nikmati kebebasan tanpa batas dengan Pro Sekali Bayar.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Starter Plan */}
            <Card className="p-8 border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-slate-900">Starter</h3>
                  <Badge variant="gray">HEMAT</Badge>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-black text-slate-900">Rp49.000</span>
                  <span className="text-slate-500 text-xs font-semibold"> / bulan</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Catat transaksi via teks & Voice Note Telegram</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Dashboard web lengkap & ringkasan bulanan</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Maksimal 50 transaksi / bulan</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Maksimal 3 wallet & 5 kategori budget</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400">
                    <span className="w-4 h-4 text-slate-300 text-center font-bold">✕</span>
                    <span>Tidak ada input via foto struk (OCR)</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400">
                    <span className="w-4 h-4 text-slate-300 text-center font-bold">✕</span>
                    <span>Tidak ada export PDF/Excel</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link href="/register">
                  <Button variant="outline" className="w-full">
                    Pilih Starter
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Pro Plan (Highlighted Lifetime) */}
            <Card className="p-8 border-2 border-orange-500 shadow-premium relative flex flex-col justify-between bg-gradient-to-b from-orange-50/20 to-white">
              <div className="absolute -top-3.5 right-6">
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold text-[11px] px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                  PALING POPULER • SEKALI BAYAR
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-slate-900">TataDana Pro</h3>
                  <Badge variant="orange">LIFETIME</Badge>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-black text-orange-600">Rp99.000</span>
                  <span className="text-slate-500 text-xs font-semibold"> / sekali bayar seumur hidup</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-800 font-semibold">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>Semua fitur paket Starter</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>Unlimited transaksi, wallet & kategori tanpa batas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>Input via foto struk dengan AI Vision OCR</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>Laporan lengkap & Export Unlimited ke PDF/Excel</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>AI Financial Advisor aktif otomatis</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>Reminder custom & Prioritas support</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link href="/register?plan=pro">
                  <Button className="w-full text-base py-3 shadow-brand">
                    Dapatkan Pro Sekali Bayar
                  </Button>
                </Link>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Pembayaran otomatis via QRIS Midtrans & Transfer Bank
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 13. FAQ SECTION (Minimal 7 Pertanyaan Relevan) */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
            <Badge variant="orange">Pusat Bantuan</Badge>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Pertanyaan yang Sering Diajukan</h2>
            <p className="text-sm text-slate-500">Punya pertanyaan lain? Tim support kami selalu siap membantu.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200/80 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between text-sm font-bold text-slate-900 hover:text-orange-600 transition-colors bg-slate-50/50"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {isOpen && (
                    <div className="px-6 py-4 text-xs text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 14. FINAL CTA (Background Gradient Orange) */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Mulai kendalikan keuanganmu hari ini.
          </h2>
          <p className="text-orange-100 text-base max-w-xl mx-auto leading-relaxed">
            Bergabunglah dengan ribuan pengguna cerdas yang mencatat keuangan langsung dari chat Telegram mereka.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-base px-8 shadow-xl">
                <span>Daftar Gratis Sekarang</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 15. FOOTER (4 Kolom Sesuai Spesifikasi) */}
      <footer className="bg-slate-950 text-slate-400 py-16 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Kolom 1: Logo + Tagline + Sosmed */}
          <div className="space-y-4">
            <div className="text-xl font-black text-white flex items-center gap-1.5">
              Tata<span className="text-orange-500">Dana</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Catat keuangan semudah chat — langsung dari Telegram kamu.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="#" className="hover:text-white transition-colors">
                Instagram
              </a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">
                Twitter/X
              </a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">
                Telegram
              </a>
            </div>
          </div>

          {/* Kolom 2: Produk */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Produk</h5>
            <ul className="space-y-2">
              <li>
                <a href="#fitur" className="hover:text-white transition-colors">
                  Pencatatan Telegram
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-white transition-colors">
                  AI OCR Struk Belanja
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-white transition-colors">
                  AI Financial Advisor
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-white transition-colors">
                  Laporan & Export Excel/PDF
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Perusahaan */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Perusahaan</h5>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Tentang TataDana
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Blog Literasi Keuangan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Karir
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Legal & Kontak */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Legal & Bantuan</h5>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="hover:text-white transition-colors">
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition-colors">
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a href="mailto:support@tatadana.app" className="hover:text-white transition-colors">
                  support@tatadana.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-slate-900 text-center text-slate-500">
          © {new Date().getFullYear()} TataDana. Hak Cipta Dilindungi. Dibuat dengan dedikasi untuk literasi finansial Indonesia.
        </div>
      </footer>
    </div>
  );
}
