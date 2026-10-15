import { Profile, Wallet, Category, Budget } from '@/lib/types';
import { formatRupiah } from '@/lib/date-utils';

/**
 * Telegram Conversational Dialog Engine
 * Provides rich, dynamic, varied responses, greetings, contextual follow-ups, and proactive coaching.
 */

// Time-of-day greeting helper in WIB
export function getTimeOfDayWIB(): 'Pagi' | 'Siang' | 'Sore' | 'Malam' {
  const hour = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false });
  const h = parseInt(hour, 10);
  if (h >= 4 && h < 11) return 'Pagi';
  if (h >= 11 && h < 15) return 'Siang';
  if (h >= 15 && h < 18) return 'Sore';
  return 'Malam';
}

/**
 * Check if the text is a conversational greeting or casual check-in
 */
export function isGreetingMessage(text: string): boolean {
  const lower = text.toLowerCase().trim();

  // If contains spending/action words, prioritize transaction/follow-up over pure greeting
  const spendingWords = ['makan', 'beli', 'bensin', 'jajan', 'bayar', 'transfer', 'ngopi', 'sarapan', 'pulsa', 'listrik', 'gaji', 'gajian'];
  if (spendingWords.some((w) => lower.includes(w))) {
    return false;
  }

  const greetingKeywords = [
    'halo',
    'hai',
    'hi',
    'pagi',
    'selamat pagi',
    'siang',
    'selamat siang',
    'sore',
    'selamat sore',
    'malam',
    'selamat malam',
    'assalamualaikum',
    'sampurasun',
    'bot',
    'halo bot',
    'hei',
    'ping',
    'tes',
    'test',
    'p',
    'tatadana',
  ];

  return greetingKeywords.some((g) => lower === g || lower.startsWith(g + ' ') || lower.endsWith(' ' + g));
}

/**
 * Generates dynamic, varied greetings
 */
export function generateVariedGreeting(profile: Profile, wallets: Wallet[]): string {
  const time = getTimeOfDayWIB();
  const name = profile.full_name?.split(' ')[0] || 'Kak';
  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

  const variations = [
    `👋 *Halo ${name}! Selamat ${time} ☀️*\n\nAda pengeluaran atau jajan baru yang mau dicatat hari ini?\nKetik aja langsung ya, misal:\n• \`kopi 18rb\`\n• \`makan siang 35rb dari Cash\`\n\nAtau ketik \`/saldo\` untuk cek sisa uangmu!`,
    `✨ *Semangat ${time}, Kak ${name}!* 💼\n\nDompet kamu saat ini terpantau total *${formatRupiah(totalBalance)}*.\nMau catat pengeluaran apa nih sekarang? Tinggal ketik santai atau kirim rekaman suara (voice note) ya!`,
    `☕ *Halo Kak ${name}!* Senang ketemu lagi di ${time} ini.\n\nKeuangan yang rapi berawal dari catatan kecil. Ada transaksi baru yang barusan terjadi?\nKetik langsung, misal: \`beli bensin 30rb\` atau kirim foto struk belanjamu!`,
    `🚀 *Hai ${name}! TataDana Bot siap mencatat.*\n\nLagi di mana nih? Mau catat makan, belanjaan, atau barusan ada uang masuk?\nSebutkan aja nominal dan kegiatannya, biar bot yang rapikan catatannya! 😊`,
  ];

  const randIndex = Math.floor(Math.random() * variations.length);
  return variations[randIndex];
}

/**
 * Checks if input is an inquiry for financial tips / health review
 */
export function isFinancialAdviceInquiry(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const adviceKeywords = [
    'tips hemat',
    'tips keuangan',
    'gimana cara hemat',
    'cara hemat',
    'lagi boros ga',
    'kondisi keuangan',
    'keuanganku gimana',
    'konsultasi',
    'rekomendasi hemat',
    'keuangan aman ga',
    'keuangan saya',
    'analisis keuangan',
  ];
  return adviceKeywords.some((k) => lower.includes(k));
}

/**
 * Generates proactive, real-data financial advice
 */
export function generateConversationalAdvice(profile: Profile, wallets: Wallet[], budgets: Budget[]): string {
  const name = profile.full_name?.split(' ')[0] || 'Kak';
  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent_amount || 0), 0);
  const pctSpent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  let adviceBody = '';
  if (pctSpent >= 80) {
    adviceBody = `⚠️ *Peringatan Budget:* Kuota pengeluaranmu bulan ini sudah terpakai *${pctSpent}%*!\n💡 *Tips Segera:* Tunda dulu belanja non-primer (lifestyle/hobi) dan fokus ke kebutuhan harian pokok sampai akhir bulan.`;
  } else if (pctSpent >= 50) {
    adviceBody = `🟡 *Evaluasi Pertengahan:* Budget terpakai *${pctSpent}%*. Masih di batas wajar, tapi tetap rem jajan harian ya agar tidak jebol di minggu terakhir!`;
  } else {
    adviceBody = `🟢 *Kondisi Prima:* Pengeluaran bulan ini baru *${pctSpent}%* dari total target. Arus kasmu sangat sehat!\n💡 *Tips Cerdas:* Sisihkan 20% dari saldo saat ini (${formatRupiah(totalBalance * 0.2)}) ke dompet tabungan atau dana darurat.`;
  }

  return `📊 *Review Keuangan TataDana untuk Kak ${name}*
━━━━━━━━━━━━━━━━━━━━━
👛 *Total Saldo Aktif:* ${formatRupiah(totalBalance)}
🎯 *Realisasi Budget:* ${pctSpent}% (${formatRupiah(totalSpent)} / ${formatRupiah(totalBudget)})

${adviceBody}

Mau lihat rincian per dompet? Ketik \`/saldo\`
Mau cek status target per kategori? Ketik \`/budget\``;
}

/**
 * Detects incomplete transactions without nominal and generates varied, specific follow-up questions
 */
export function generateFollowUpQuestion(text: string): string | null {
  const lower = text.toLowerCase().trim();

  // 1. Food / Makanan
  if (
    lower.includes('bakso') ||
    lower.includes('makan') ||
    lower.includes('nasi') ||
    lower.includes('kopi') ||
    lower.includes('jajan') ||
    lower.includes('ayam') ||
    lower.includes('resto') ||
    lower.includes('mie') ||
    lower.includes('sate') ||
    lower.includes('burger')
  ) {
    const questions = [
      `🍜 *Wah kelihatannya enak nih!* Habis berapa rupiah tadi untuk makannya kak?\n👉 Balas angkanya aja ya, contoh: \`25rb\` atau \`35000 dari Cash\`.`,
      `😋 *Nyam nyam! Habis berapa totalnya kak?*\nDibayar pakai dompet apa nih (Cash, GoPay, atau BCA)?\nKetik nominalnya, misal: \`20rb dari Cash\`.`,
      `🍲 *Siap dicatat!* Berapa nominal makan/jajan barusan kak?\nCukup sebutkan angkanya aja ya (misal: \`30rb\`).`,
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  // 2. Transport / Bensin
  if (
    lower.includes('bensin') ||
    lower.includes('ojol') ||
    lower.includes('grab') ||
    lower.includes('gojek') ||
    lower.includes('parkir') ||
    lower.includes('tol') ||
    lower.includes('angkot') ||
    lower.includes('transport')
  ) {
    const questions = [
      `⛽ *Siap catat perjalananmu!* Tadi isi bensin atau ongkosnya habis berapa kak?\n👉 Ketik nominalnya ya, misal: \`50rb dari GoPay\` atau \`20rb\`.`,
      `🚗 *Perjalanan lancar kak?* Habis berapa rupiah ongkosnya?\nBalas nominalnya ya (contoh: \`25rb\`).`,
      `🛵 *Berapa biaya transport barusan kak?*\nDari dompet mana bayarnya? (Ketik misalnya: \`15000 cash\`)`,
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  // 3. Belanja / Shopping
  if (
    lower.includes('baju') ||
    lower.includes('sepatu') ||
    lower.includes('indomaret') ||
    lower.includes('alfamart') ||
    lower.includes('supermarket') ||
    lower.includes('shopee') ||
    lower.includes('tokopedia') ||
    lower.includes('belanja') ||
    lower.includes('beli')
  ) {
    const questions = [
      `🛍️ *Asik belanja nih!* Total belanjanya habis berapa rupiah kak?\n👉 Balas angkanya ya, misal: \`85rb\` atau kirim foto struknya langsung!`,
      `📦 *Belanja apa aja nih kak?* Berapa total nominalnya?\nKetik nominalnya ya, misal: \`120rb dari BCA\`.`,
      `🛒 *Siap dicatat belanjanya!* Berapa total biayanya kak?\nBalas dengan nominalnya ya (contoh: \`45rb\`).`,
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  // 4. Tagihan / Bills
  if (
    lower.includes('listrik') ||
    lower.includes('pln') ||
    lower.includes('pulsa') ||
    lower.includes('kuota') ||
    lower.includes('wifi') ||
    lower.includes('indihome') ||
    lower.includes('air') ||
    lower.includes('pdam') ||
    lower.includes('tagihan')
  ) {
    const questions = [
      `⚡ *Siap bayar tagihan!* Berapa nominal yang dibayarkan kak?\n👉 Ketik nominalnya ya, misal: \`100rb dari BCA\`.`,
      `📱 *Beli pulsa / kuota berapa nih kak?*\nDari dompet mana pembayarannya? (Contoh: \`50rb GoPay\`).`,
      `🏠 *Tagihan penting nih!* Habis berapa totalnya kak?\nSebutkan nominalnya ya, misal: \`150rb\`.`,
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  // 5. Income / Pemasukan
  if (
    lower.includes('gajian') ||
    lower.includes('gaji') ||
    lower.includes('bonus') ||
    lower.includes('freelance') ||
    lower.includes('transferan') ||
    lower.includes('dapat uang') ||
    lower.includes('cair')
  ) {
    const questions = [
      `🎉 *Alhamdulillah rezeki masuk!* Berapa nominal pemasukannya kak?\n👉 Ketik misalnya: \`gajian 5jt ke BCA\` atau cukup \`5jt\`.`,
      `💰 *Wah mantap ada dana masuk!* Berapa nominalnya dan masuk ke dompet mana (BCA/Cash/GoPay)?`,
      `💵 *Uang masuk tercatat!* Sebutkan nominalnya kak (contoh: \`1.5jt freelance\`).`,
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  // 6. Generic Vague ("catat", "keluar uang", "uang", "transaksi", "jajan")
  if (
    lower.length < 15 &&
    (lower.includes('catat') ||
      lower.includes('uang') ||
      lower.includes('keluar') ||
      lower.includes('duit') ||
      lower.includes('transaksi') ||
      lower.includes('jajan') ||
      lower.includes('bayar'))
  ) {
    const questions = [
      `📝 *Siap catat untukmu!* Berapa nominal dan untuk apa pengeluarannya kak?\n\n💡 *Contoh langsung:* \n• \`beli kopi 18rb\`\n• \`makan siang 25rb dari cash\`\n• \`bensin 30rb\``,
      `🤔 *Mau catat transaksi apa nih kak?*\nKetik aja seperti biasa ya, misalnya: \`makan 30rb\` atau kirim pesan suara!`,
      `👛 *Bantu aku catat ya!* Berapa nominalnya dan digunakan untuk apa?\nContoh: \`nasi padang 20rb\`.`,
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  return null;
}

/**
 * Returns a friendly, varied follow-up question or tip appended after recording an expense
 */
export function getVariedExpenseClosingTip(categoryName: string, walletName: string, remainingBalance: number): string {
  const tips = [
    `💡 *Mau sekalian catat uang parkir atau minumannya kak?*`,
    `🥤 *Ada camilan atau jajan tambahan yang mau dicatat sekalian?*`,
    `📸 *Ada struk belanja fisiknya? Kirim fotonya kapan saja untuk dicatat otomatis ya!*`,
    `👛 *Sisa saldo di ${walletName} sekarang ${formatRupiah(remainingBalance)}. Mau cek sisa budget? Ketik \`/budget\` ya!*`,
    `👏 *Keren, makin disiplin mencatat bikin dompet aman sampai akhir bulan!*`,
    `🎯 *Catatan aman tersimpan! Ada pengeluaran lain hari ini?*`,
  ];

  return tips[Math.floor(Math.random() * tips.length)];
}
