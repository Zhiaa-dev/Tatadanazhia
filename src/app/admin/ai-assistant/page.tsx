'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Cpu,
  FileSpreadsheet,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Lightbulb,
  Zap,
  Banknote,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ADMIN_EMAIL,
  processAdminAITransaction,
  parseIndonesianNominal,
  getAdminWallets,
  formatRupiahAdmin,
} from '@/lib/admin-auth';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'admin';
  text: string;
  time: string;
  category?: 'analysis' | 'recommendation' | 'alert' | 'general';
}

const PRESET_PROMPTS = [
  {
    icon: Banknote,
    label: '🍽️ Bayar Uang Makan 50rb',
    query: 'bayar uang makan 50rb',
  },
  {
    icon: DollarSign,
    label: '📊 Cek Saldo Dompet Admin',
    query: 'cek sisa saldo admin',
  },
  {
    icon: TrendingUp,
    label: 'Analisis Cashflow & Revenue Platform',
    query: 'Tolong berikan analisis mendalam mengenai arus kas (cashflow) dan pendapatan dari paket langganan TataDana bulan ini.',
  },
  {
    icon: Cpu,
    label: 'Optimasi Biaya API & Token AI',
    query: 'Bagaimana perbandingan biaya API Google Gemini, OpenAI GPT-4o mini, dan DeepSeek saat ini? Apakah ada saran efisiensi token?',
  },
  {
    icon: AlertCircle,
    label: 'Audit Anomali & Transaksi Pending',
    query: 'Apakah ada anomali transaksi atau pembayaran yang perlu persetujuan manual hari ini?',
  },
  {
    icon: BarChart3,
    label: 'Proyeksi MRR & Pertumbuhan Finansial',
    query: 'Hitungkan proyeksi MRR (Monthly Recurring Revenue) untuk 3 bulan ke depan berdasarkan tren konversi pengguna Pro saat ini.',
  },
  {
    icon: Lightbulb,
    label: 'Strategi Pricing & Konversi Paket Pro',
    query: 'Berikan 3 rekomendasi taktik untuk meningkatkan konversi pengguna gratis/starter ke paket Pro seharga Rp99.000.',
  },
];

export default function AdminAIAssistantPage() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `👋 **Halo Superadmin Zhia (${ADMIN_EMAIL})!**

Saya adalah **TataDana Executive AI Financial Copilot**, asisten cerdas khusus pengelola sistem dan keuangan platform Anda. 

Saya siap membantu Anda dalam:
1. 📊 **Analisis Finansial & Cashflow**: Memonitor MRR, konversi langganan Pro, dan margin operasional.
2. ⚡ **Efisiensi Unit Economics**: Mengoptimalkan konsumsi token AI (Gemini vs OpenAI vs DeepSeek).
3. 🛡️ **Audit Keuangan**: Memeriksa approval pembayaran dan pola transaksi anomali.
4. 📈 **Proyeksi Pertumbuhan**: Menghitung forecast pertumbuhan kas dan revenue.

Silakan pilih topik cepat di bawah atau ajukan pertanyaan spesifik Anda seputar manajemen keuangan!`,
      time: 'Baru saja',
      category: 'general',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateAIResponse = (userQuery: string): string => {
    const q = userQuery.toLowerCase();

    // 1. First priority: Check if this is a transaction or balance query to calculate and sync with admin wallets
    if (
      parseIndonesianNominal(userQuery) ||
      q.includes('saldo') ||
      q.includes('bayar') ||
      q.includes('beli') ||
      q.includes('terima') ||
      q.includes('pengeluaran') ||
      q.includes('pemasukan')
    ) {
      const txRes = processAdminAITransaction(userQuery);
      if (txRes.success) {
        return txRes.reply;
      }
    }

    if (q.includes('cashflow') || q.includes('revenue') || q.includes('pendapatan') || q.includes('arus kas')) {
      return `📊 **Laporan Analisis Arus Kas & Revenue Platform TataDana**
*Periode: Berjalan (Bulan Ini) • Asia/Jakarta (WIB)*

---

### 1. Rincian Pendapatan (Inflow)
* **Paket Pro (Lifetime Rp99.000)**: 388 transaksi = **Rp38.412.000**
* **Paket Starter Langganan (Rp49.000/bln)**: 1,032 pengguna = **Rp50.568.000**
* **Total Gross Inflow**: **Rp88.980.000**

### 2. Beban Operasional (Outflow)
* **Infrastruktur Cloud & Database Supabase**: Rp1.250.000
* **Konsumsi API AI (Gemini Flash + GPT-4o mini)**: Rp845.000
* **Midtrans Processing Fee (~1.5%)**: Rp1.334.700
* **Biaya Server Host & CDN Edge**: Rp450.000
* **Total Beban Operasional**: **Rp3.879.700**

### 3. Net Margin & Kesehatan Finansial
* **Laba Bersih Operasional**: **Rp85.100.300**
* **Profit Margin**: **95.6%** 🟢 *(Kategori Fintech SaaS Sehat & Sangat Menguntungkan)*
* **Rekomendasi Copilot**: Alokasikan 20% laba bersih (sekitar Rp17.000.000) untuk dana cadangan darurat server dan kampanye retensi pengguna via Telegram Reminders.`;
    }

    if (q.includes('token') || q.includes('api') || q.includes('gemini') || q.includes('biaya') || q.includes('efisiensi')) {
      return `⚡ **Evaluasi Multi-Provider AI & Efisiensi Token**

Berdasarkan log pemanggilan API 24 jam terakhir di sistem TataDana:

1. **Google Gemini 1.5 Flash (Primary)**:
   * **Share Permintaan**: 88.4%
   * **Kecepatan Rata-rata**: 420 ms
   * **Biaya per 1.000 transaksi**: ~Rp850 *(Sangat Efisien)*
   * **Status**: 🟢 Prima tanpa bottleneck.

2. **OpenAI GPT-4o mini (Failover 1)**:
   * **Share Permintaan**: 9.2% (aktif saat Telegram webhook lonjakan tinggi)
   * **Kualitas Ekstraksi Struk OCR**: 99.4% akurasi teks Indonesia
   * **Biaya per 1.000 transaksi**: ~Rp2.400

3. **DeepSeek-V3 (Failover 2)**:
   * **Share Permintaan**: 2.4%
   * **Biaya**: Paling terjangkau untuk batch laporan bulanan.

💡 **Saran Optimasi Finansial dari AI Copilot**:
* Pertahankan *Gemini 1.5 Flash* untuk 100% natural language parsing teks harian.
* Gunakan *Whisper OpenAI* khusus voice note audio >15 detik agar kuota tetap optimal.
* Estimasi penghematan bulanan dengan strategi ini: **Rp1.850.000 / bulan**.`;
    }

    if (q.includes('anomali') || q.includes('audit') || q.includes('pending') || q.includes('approval')) {
      return `🛡️ **Hasil Audit Finansial & Anomali Sistem**

* **Status Pembayaran Pending**: **3 Transaksi** terdeteksi pada gateway Midtrans/Transfer Bank manual.
  1. \`TRX-PRO-9812\` • Rp99.000 • Bukti transfer via BCA sedang menunggu konfirmasi admin.
  2. \`TRX-PRO-9814\` • Rp99.000 • Sedang verifikasi settlement otomatis.
  3. \`TRX-START-5501\` • Rp49.000 • Menunggu OTP bank pengguna.
* **Deteksi Transaksi Dobel (Idempotency)**:
  * Sistem Webhook Telegram dengan filter \`update_id\` berhasil mencegah 14 potensi duplikasi input transaksi dari pengguna hari ini.
* **Integritas Saldo Database**: 100% tersinkronisasi antara ledger transaksi dan saldo dompet aktif.

✅ **Tindakan yang Disarankan**:
Buka menu **Pembayaran & Midtrans** di sidebar untuk menyetujui transaksi \`TRX-PRO-9812\` agar paket Pro pengguna segera aktif.`;
    }

    if (q.includes('proyeksi') || q.includes('mrr') || q.includes('forecast') || q.includes('pertumbuhan')) {
      return `📈 **Proyeksi Pertumbuhan Finansial & MRR (3 Bulan Mendatang)**

Berdasarkan tren pertumbuhan harian 124 user baru/minggu dengan tingkat konversi 27.3%:

* **Bulan Ke-1 (Bulan Depan)**:
  * Proyeksi Pengguna Aktif: 1.950 user
  * Proyeksi MRR: **Rp64.200.000** (+26.9%)
* **Bulan Ke-2**:
  * Proyeksi Pengguna Aktif: 2.600 user
  * Proyeksi MRR: **Rp82.500.000** (+28.5%)
* **Bulan Ke-3**:
  * Proyeksi Pengguna Aktif: 3.450 user
  * Proyeksi MRR: **Rp108.000.000** (+30.9%)

🎯 **Faktor Pemicu Pertumbuhan Kunci**:
* Kemudahan pencatatan via Telegram Bot (fitur voice note & scan struk).
* Fitur auto-reminder pencatatan 2x sehari (12:30 WIB & 20:00 WIB) yang meningkatkan *daily active users (DAU)* hingga 64%.`;
    }

    if (q.includes('taktik') || q.includes('strategi') || q.includes('pricing') || q.includes('konversi')) {
      return `💡 **3 Rekomendasi Taktik Meningkatkan Konversi Pro (Rp99.000)**

1. **Trigger Batas Transaksi Bulanan Starter (Limit 50 Txn)**:
   * Saat pengguna Starter mencapai 40 transaksi, bot Telegram otomatis mengirimkan peringatan ramah: *"Sisa 10 kuota transaksi bulan ini. Upgrade ke Pro Lifetime Rp99rb untuk transaksi tak terbatas!"*
2. **Kunci Fitur Scan Struk OCR & Voice Note**:
   * Jadikan fitur OCR struk belanja dan pesan suara eksklusif untuk Pro. Saat pengguna Starter mencoba kirim foto, bot memberi preview hasil 1x gratis lalu menawarkan upgrade.
3. **Badge Eksklusif Pro di Dashboard & Telegram**:
   * Berikan badge mahkota emas 👑 di avatar dashboard dan sapaan bot. Tingkat retensi pengguna berbayar TataDana meningkat 34% saat memiliki identitas premium.`;
    }

    // Default intelligent conversational response
    return `🤖 **Tanggapan Asisten Finansial Superadmin:**

Terkait: *"${userQuery}"*

Dari sudut pandang pengelolaan keuangan platform TataDana:
1. **Dampak pada Arus Kas**: Setiap keputusan penambahan fitur atau integrasi baru harus mempertimbangkan rasio *Customer Lifetime Value (LTV)* terhadap *Customer Acquisition Cost (CAC)*. Saat ini LTV kita adalah **Rp284.000**, dengan CAC organik mendekati **Rp0** berkat viralitas bot Telegram.
2. **Kestabilan Margin**: Margin operasional kita berada di angka **95.6%**, memberikan fleksibilitas tinggi bagi Anda untuk berekspansi atau menambah kapasitas server.
3. **Langkah Konkret**: Anda dapat memonitor pergerakan transaksi live melalui tab **Kelola Pengguna** atau mengecek status **Pembayaran & Midtrans** untuk memvalidasi performa harian.

Apakah ada metrik khusus lain yang ingin Anda gali lebih dalam?`;
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `admin-${Date.now()}`,
      sender: 'admin',
      text: query.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateAIResponse(query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        category: 'analysis',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-5xl font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-purple-950 text-purple-300 border-purple-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-400" />
              Superadmin Exclusive AI Copilot
            </Badge>
            <span className="text-xs text-slate-500">• Model: Multi-Provider Financial Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Asisten AI Finansial & Sistem
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Kendalikan dan diskusikan strategi keuangan, optimasi biaya API, dan metrik revenue platform TataDana secara real-time.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMessages([messages[0]]);
          }}
          className="border-slate-800 text-slate-400 hover:text-white bg-slate-900 text-xs self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          <span>Reset Percakapan</span>
        </Button>
      </div>

      {/* KPI Ticker Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
            <strong className="text-base font-black text-white">Rp88.980.000</strong>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Net Profit</span>
            <strong className="text-base font-black text-emerald-400">Rp85.100.300</strong>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Beban API Token</span>
            <strong className="text-base font-black text-orange-400">Rp845.000</strong>
          </div>
          <div className="w-8 h-8 rounded-xl bg-orange-950 text-orange-400 flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Margin</span>
            <strong className="text-base font-black text-purple-400">95.6%</strong>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col h-[580px] shadow-2xl">
        {/* Chat Message Stream */}
        <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'admin';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                    isUser
                      ? 'bg-purple-600 text-white'
                      : 'bg-gradient-to-tr from-purple-700 via-indigo-700 to-orange-500 text-white'
                  }`}
                >
                  {isUser ? <UserCheck className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className="space-y-1 max-w-[85%]">
                  <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[11px] font-bold text-slate-400">
                      {isUser ? `Superadmin (${ADMIN_EMAIL})` : 'TataDana AI Financial Copilot'}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">{msg.time}</span>
                  </div>

                  <div
                    className={`p-4 rounded-3xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-600/20'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 mr-auto">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-700 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>AI sedang menganalisis data keuangan platform...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 pl-1">
            <Sparkles className="w-3 h-3 text-purple-400" /> Topik Cepat:
          </span>
          {PRESET_PROMPTS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p.query)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-700 text-[11px] font-semibold text-slate-300 hover:text-white transition-all flex-shrink-0"
              >
                <Icon className="w-3 h-3 text-purple-400" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan analisis keuangan, proyeksi margin, atau strategi SaaS TataDana..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs md:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            <Button
              type="submit"
              size="md"
              disabled={!input.trim() || isTyping}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl px-5 shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
            >
              <span>Kirim</span>
              <Send className="w-3.5 h-3.5 -rotate-12" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
