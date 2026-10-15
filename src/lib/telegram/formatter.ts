import { formatRupiah, formatTelegramDateTime } from '@/lib/date-utils';

/**
 * Creates visual progress bar using block characters: █ (filled) and ░ (empty)
 */
export function createProgressBar(percentage: number, length: number = 10): string {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const filledCount = Math.round((clamped / 100) * length);
  const emptyCount = length - filledCount;
  return '█'.repeat(filledCount) + '░'.repeat(emptyCount);
}

/**
 * Formats Bot reply for Expense (Part 4.4)
 */
export function formatExpenseReply(params: {
  amount: number;
  categoryName: string;
  categoryEmoji?: string;
  walletName: string;
  note: string;
  remainingBalance: number;
  budgetTotal?: number;
  budgetSpent?: number;
  transcript?: string; // If from Voice Note
  followUpPrompt?: string;
}): string {
  const dateTimeStr = formatTelegramDateTime();
  const emoji = params.categoryEmoji || '🏷️';
  let message = '';

  if (params.transcript) {
    message += `🎙️ Transkrip: "${params.transcript}"\n\n`;
  }

  message += `📅 ${dateTimeStr}
💸 Pengeluaran tercatat!
├ Nominal : ${formatRupiah(params.amount)}
├ Kategori : ${emoji} ${params.categoryName}
├ Dompet : 👛 ${params.walletName}
├ Catatan : ${params.note}
└ Saldo : ${formatRupiah(params.remainingBalance)}`;

  // If budget exists for this category
  if (params.budgetTotal && params.budgetTotal > 0) {
    const totalSpent = (params.budgetSpent || 0);
    const percentage = Math.round((totalSpent / params.budgetTotal) * 100);
    const remainingBudget = Math.max(0, params.budgetTotal - totalSpent);
    const progressBar = createProgressBar(percentage);

    message += `\n\n📊 Budget ${params.categoryName} bulan ini:
${progressBar} ${percentage}% — sisa ${formatRupiah(remainingBudget)}`;

    if (percentage >= 100) {
      message += `\n⚠️ Waduh, budget kategori ini sudah habis (100%)! Tahan pengeluaran dulu ya.`;
    } else if (percentage >= 80) {
      message += `\n⚠️ Perhatian! Budget kategori ini sudah terpakai ${percentage}%. Yuk lebih hemat!`;
    }
  }

  if (params.followUpPrompt) {
    message += `\n\n${params.followUpPrompt}`;
  }

  return message;
}

/**
 * Formats Bot reply for Income (Part 4.5)
 */
export function formatIncomeReply(params: {
  amount: number;
  walletName: string;
  newBalance: number;
  categoryName?: string;
  note?: string;
  transcript?: string; // If from Voice Note
  followUpPrompt?: string;
}): string {
  const dateTimeStr = formatTelegramDateTime();
  let message = '';

  if (params.transcript) {
    message += `🎙️ Transkrip: "${params.transcript}"\n\n`;
  }

  message += `📅 ${dateTimeStr}
💰 Pemasukan tercatat!
├ Nominal : ${formatRupiah(params.amount)}
├ Kategori : 💼 ${params.categoryName || 'Pemasukan'}
├ Dompet : 👛 ${params.walletName}
└ Saldo baru : ${formatRupiah(params.newBalance)}`;

  if (params.followUpPrompt) {
    message += `\n\n${params.followUpPrompt}`;
  } else {
    const incomeGreetings = [
      '💪 Semangat terus! Jangan lupa sisihkan untuk tabungan ya.',
      '✨ Alhamdulillah! Mau langsung dialokasikan ke budget tertentu?',
      '📈 Arus kas bertambah! Rekap saldo lengkap bisa dicek lewat /saldo.',
      '🌟 Rezeki lancar! Mau sisihkan sebagian untuk dana darurat?',
    ];
    const randGreeting = incomeGreetings[Math.floor(Math.random() * incomeGreetings.length)];
    message += `\n\n${randGreeting}`;
  }

  return message;
}

/**
 * Formats Bot reply for Multi-item Receipt OCR (Part 4.2)
 */
export function formatReceiptReply(params: {
  merchantName: string;
  totalAmount: number;
  walletName: string;
  newBalance: number;
  items: Array<{ item_name: string; price: number; quantity: number; kategori: string }>;
}): string {
  const dateTimeStr = formatTelegramDateTime();
  let message = `📅 ${dateTimeStr}
🧾 Struk Belanja Tercatat! (${params.merchantName})
├ Total : ${formatRupiah(params.totalAmount)}
├ Dompet : 👛 ${params.walletName}
└ Saldo : ${formatRupiah(params.newBalance)}

📦 Rincian Item:`;

  params.items.forEach((item, index) => {
    message += `\n${index + 1}. ${item.item_name} (${item.quantity}x) — ${formatRupiah(item.price)} [${item.kategori}]`;
  });

  message += `\n\n✨ Rincian lengkap otomatis tersimpan dan bisa dicek di dashboard laporan TataDana.`;
  return message;
}

/**
 * Formats Daily Reminder (Part 4.8)
 */
export function formatDailyReminder(): string {
  return `⏰ Reminder Keuangan!
Jangan lupa catat pengeluaran hari ini ya 📝
Pencatatan rutin = keuangan lebih terkontrol 💪
Ketik transaksimu sekarang!`;
}
