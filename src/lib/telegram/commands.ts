import { createAdminClient } from '@/lib/supabase/admin';
import { formatRupiah, formatFullDate, formatTelegramDateTime } from '@/lib/date-utils';
import { createProgressBar } from './formatter';
import { Profile, Wallet, Category, Transaction, Budget } from '@/lib/types';
import { getTataDanaStore } from '@/lib/store/tatadana-store';

/**
 * Handle Telegram Bot Commands (Part 4.6)
 */
export async function handleBotCommand(
  command: string,
  profile: Profile,
  botToken: string
): Promise<string> {
  const store = getTataDanaStore();
  const cmd = command.toLowerCase().trim();

  // /start command
  if (cmd === '/start') {
    return `👋 Halo *${profile.full_name || 'Sahabat TataDana'}*!
Selamat datang di *TataDana Bot* — Catat keuangan semudah chat! 🚀

📱 *Status Akun:*
• Nama: ${profile.full_name}
• Paket: *${profile.plan.toUpperCase()}*
• Status: 🟢 Aktif Terhubung

💡 *Cara Mencatat Cepat:*
1. Ketik: \`Pengeluaran makan 25000 dari cash\`
2. Ketik: \`beli kopi 18rb\` atau \`gajian 5jt ke BCA\`
3. Kirim Voice Note: rekam suaramu (maks 60 detik)
4. Kirim Foto Struk (khusus Pro): foto nota belanjaanmu

📌 *Daftar Perintah:*
/saldo — Cek saldo semua dompet
/hari ini — Rekap transaksi hari ini
/minggu ini — Rekap 7 hari terakhir
/bulan ini — Rekap bulan ini & kategori
/budget — Status sisa budget bulan ini
/bantuan — Panduan lengkap

Yuk, coba ketik transaksi pertamamu sekarang! 😊`;
  }

  // /saldo command
  if (cmd === '/saldo') {
    let wallets = store.getWallets(profile.id);

    if (!wallets || wallets.length === 0) {
      // Check fallback wallets
      wallets = store.getWallets('usr_budi_01');
    }

    if (!wallets || wallets.length === 0) {
      return `👛 Kamu belum memiliki dompet aktif. Buka dashboard TataDana untuk menambahkan dompet.`;
    }

    const totalSaldo = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    let msg = `👛 *Daftar Saldo Dompet TataDana*\n\n`;

    wallets.forEach((w) => {
      const defaultTag = w.is_default ? ' *(Utama)*' : '';
      msg += `• *${w.name}*${defaultTag}: ${formatRupiah(Number(w.balance))}\n`;
    });

    msg += `\n━━━━━━━━━━━━━━━\n💰 *Total Saldo:* ${formatRupiah(totalSaldo)}`;
    return msg;
  }

  // /hari ini command
  if (cmd === '/hari ini' || cmd === '/hariini') {
    const todayStr = new Date().toISOString().slice(0, 10);
    const txs = store.getTransactions(profile.id).filter((t) => (t.transaction_time || '').startsWith(todayStr));

    if (!txs || txs.length === 0) {
      return `📅 *Rekap Hari Ini*\nBelum ada transaksi tercatat hari ini.\nYuk catat sekarang! Contoh: \`kopi 20rb\``;
    }

    let totalExpense = 0;
    let totalIncome = 0;
    let listStr = '';

    txs.forEach((t, i) => {
      if (t.type === 'expense') {
        totalExpense += Number(t.amount);
        listStr += `${i + 1}. 💸 ${formatRupiah(Number(t.amount))} — ${t.category?.name || 'Makanan'} (${t.description || '-'})\n`;
      } else if (t.type === 'income') {
        totalIncome += Number(t.amount);
        listStr += `${i + 1}. 💰 +${formatRupiah(Number(t.amount))} — ${t.description || 'Pemasukan'}\n`;
      }
    });

    return `📅 *Rekap Transaksi Hari Ini*
${formatTelegramDateTime()}

${listStr}━━━━━━━━━━━━━━━
💸 Total Pengeluaran: ${formatRupiah(totalExpense)}
💰 Total Pemasukan: ${formatRupiah(totalIncome)}
📊 Arus Kas Bersih: ${formatRupiah(totalIncome - totalExpense)}`;
  }

  // /minggu ini command
  if (cmd === '/minggu ini' || cmd === '/mingguini') {
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const txs = store.getTransactions(profile.id).filter((t) => new Date(t.transaction_time).getTime() >= sevenDaysAgo);

    let totalExpense = 0;
    let totalIncome = 0;
    txs.forEach((t) => {
      if (t.type === 'expense') totalExpense += Number(t.amount);
      if (t.type === 'income') totalIncome += Number(t.amount);
    });

    return `🗓️ *Rekap 7 Hari Terakhir*
Jumlah transaksi: ${txs.length} transaksi

💸 Total Pengeluaran: ${formatRupiah(totalExpense)}
💰 Total Pemasukan: ${formatRupiah(totalIncome)}
📈 Net Cashflow: ${formatRupiah(totalIncome - totalExpense)}

Buka dashboard TataDana untuk melihat grafik tren dan laporan rinci.`;
  }

  // /bulan ini command
  if (cmd === '/bulan ini' || cmd === '/bulanini') {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const txs = store.getTransactions(profile.id).filter((t) => (t.transaction_time || '').startsWith(currentMonth));

    let totalExpense = 0;
    let totalIncome = 0;
    const catMap: Record<string, { name: string; emoji: string; amount: number }> = {};

    txs.forEach((t) => {
      const amt = Number(t.amount);
      if (t.type === 'expense') {
        totalExpense += amt;
        const catName = t.category?.name || 'Makanan';
        const emoji = t.category?.emoji || '🍜';
        if (!catMap[catName]) catMap[catName] = { name: catName, emoji, amount: 0 };
        catMap[catName].amount += amt;
      } else if (t.type === 'income') {
        totalIncome += amt;
      }
    });

    let catBreakdown = '';
    const sortedCats = Object.values(catMap).sort((a, b) => b.amount - a.amount);
    sortedCats.forEach((c) => {
      const pct = totalExpense > 0 ? Math.round((c.amount / totalExpense) * 100) : 0;
      catBreakdown += `• ${c.emoji} ${c.name}: ${formatRupiah(c.amount)} (${pct}%)\n`;
    });

    return `📊 *Laporan Bulan Berjalan*

💸 Pengeluaran: ${formatRupiah(totalExpense)}
💰 Pemasukan: ${formatRupiah(totalIncome)}
📈 Arus Kas: ${formatRupiah(totalIncome - totalExpense)}

📂 *Pengeluaran per Kategori:*
${catBreakdown || 'Belum ada data pengeluaran bulan ini.'}`;
  }

  // /budget command
  if (cmd === '/budget') {
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    const budgets = store.getBudgets(profile.id, currentMonth);

    if (!budgets || budgets.length === 0) {
      return `🎯 Kamu belum mengatur budget bulanan. Silakan buat budget per kategori di menu *Budget* pada dashboard TataDana.`;
    }

    let msg = `🎯 *Status Budget Bulan Ini*\n${formatTelegramDateTime()}\n\n`;

    budgets.forEach((b) => {
      const cat = store.getCategory(profile.id, b.category_id) || { name: 'Kategori', emoji: '🏷️' };
      const budgetAmount = Number(b.amount);
      const spent = Number(b.spent_amount || 0);
      const pct = Math.min(100, Math.round((spent / budgetAmount) * 100));
      const sisa = Math.max(0, budgetAmount - spent);
      const bar = createProgressBar(pct);

      msg += `${cat.emoji} *${cat.name}*\n`;
      msg += `${bar} ${pct}%\n`;
      msg += `Terpakai: ${formatRupiah(spent)} / ${formatRupiah(budgetAmount)}\n`;
      msg += `Sisa: ${formatRupiah(sisa)}\n\n`;
    });

    return msg.trim();
  }

  // /tips command (Tips & Edukasi Finansial)
  if (cmd === '/tips' || cmd === '/edukasi' || cmd === '/hemat') {
    const tipsList = [
      `💡 *Aturan 50/30/20 untuk Finansial Sehat:*\n• 50% untuk Kebutuhan Pokok (makan, sewa, tagihan)\n• 30% untuk Keinginan / Lifestyle (hiburan, ngopi)\n• 20% untuk Tabungan & Investasi\n\nSudahkah kamu mengalokasikan gaji bulan ini sesuai aturan ini? Cek dengan \`/budget\`!`,
      `☕ *Waspada Latte Factor!*\nPengeluaran kecil seperti kopi kekinian Rp25.000 per hari terdengar sepele, tapi dalam 1 bulan mencapai Rp750.000 dan dalam 1 tahun menjadi Rp9.000.000!\n\nYuk kurangi frekuensinya dan alihkan ke dana darurat.`,
      `🛡️ *Bangun Dana Darurat Terlebih Dahulu:*\nIdealnya seorang pekerja memiliki dana darurat minimal 3–6x pengeluaran bulanan di dompet terpisah (seperti tabungan BCA khusus) sebelum mulai berinvestasi agresif.`,
      `🎯 *Trik Belanja Bijak (Aturan 24 Jam):*\nSaat ingin membeli barang non-primer online, tahan dan tunggu 24 jam. Jika setelah 24 jam kamu merasa tidak benar-benar membutuhkannya, selamat kamu berhasil menghemat uang!`,
    ];
    const randTip = tipsList[Math.floor(Math.random() * tipsList.length)];
    return randTip;
  }

  // /bantuan command
  if (cmd === '/bantuan') {
    return `ℹ️ *Panduan Lengkap TataDana Bot*
━━━━━━━━━━━━━━━━━
1. *Catat Pengeluaran:*
   • \`Pengeluaran makan 25000 dari cash\`
   • \`beli bento 30rb\`
   • \`bensin 25rb pakai GoPay\`

2. *Catat Pemasukan:*
   • \`gajian 5jt ke BCA\`
   • \`dapat transfer freelance 1.5jt\`

3. *Kirim Suara (Voice Note):*
   • Rekam VN Telegram (contoh: "tadi beli pulsa 50 ribu pakai GoPay")

4. *Kirim Foto Struk (Pro):*
   • Cukup kirim foto struk/nota belanjaanmu

5. *Perintah Tersedia:*
   /saldo — Cek saldo seluruh dompet
   /hari ini — Rekap pengeluaran hari ini
   /minggu ini — Rekap 7 hari terakhir
   /bulan ini — Ringkasan bulan berjalan
   /budget — Cek sisa budget kategori
   /tips — Dapatkan tips hemat & literasi finansial

Ada pertanyaan? Kamu juga bisa langsung tanya kondisi keuanganmu seperti: *"keuanganku gimana?"* atau *"tips hemat"*!`;
  }

  return `🤔 *Perintah tidak dikenal.* 
Kamu bisa ketik \`/bantuan\` untuk melihat daftar perintah, atau langsung ketik transaksimu secara santai seperti:\n• \`kopi 18rb\`\n• \`makan siang 30rb dari cash\`\n• \`gajian 5jt ke bca\``;
}
