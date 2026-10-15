import { executeAICompletion } from './multi-provider';
import { ParsedTransactionResult } from '@/lib/types';

/**
 * Normalizes Indonesian nominal variations:
 * "15rb", "15ribu", "1.5jt", "1,5jt", "500k", "500.000", "20rb"
 */
export function normalizeIndonesianAmount(input: string | number): number {
  if (typeof input === 'number') return Math.abs(input);
  if (!input) return 0;

  let str = input.toString().trim().toLowerCase();

  // Remove "rp", "rp.", spaces
  str = str.replace(/rp\.?/g, '').trim();

  // Check for million: "1.5jt", "1,5jt", "2jt", "juta"
  const jtMatch = str.match(/^([\d.,]+)\s*(?:jt|juta)$/);
  if (jtMatch) {
    const numPart = parseFloat(jtMatch[1].replace(',', '.'));
    return Math.round(numPart * 1000000);
  }

  // Check for thousand: "15rb", "15ribu", "500k", "ribu"
  const rbMatch = str.match(/^([\d.,]+)\s*(?:rb|ribu|k)$/);
  if (rbMatch) {
    const numPart = parseFloat(rbMatch[1].replace(',', '.'));
    return Math.round(numPart * 1000);
  }

  // Standard numbers formatted with Indonesian dots or standard: "50.000" or "50000"
  const cleanNumber = str.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleanNumber);
  return isNaN(parsed) ? 0 : Math.round(parsed);
}

/**
 * Intelligent Indonesian Linguistic Parser (Rule-based & Heuristic fallback)
 * Handles: "Pengeluaran makan 25000 dari cash", "beli bakso 20rb", "gajian 5jt ke BCA", etc.
 */
export function parseNaturalLanguageFallback(
  text: string,
  categories: Array<{ name: string; type: string; emoji: string }> = [],
  wallets: Array<{ name: string }> = []
): ParsedTransactionResult {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. Detect Transaction Type
  let jenis: 'expense' | 'income' | 'transfer' = 'expense';
  if (
    lower.startsWith('pemasukan') ||
    lower.includes('gaji') ||
    lower.includes('gajian') ||
    lower.includes('dapat') ||
    lower.includes('terima') ||
    lower.includes('bonus') ||
    lower.includes('transfer masuk')
  ) {
    jenis = 'income';
  } else if (lower.startsWith('transfer') || lower.includes('pindah dana')) {
    jenis = 'transfer';
  } else {
    jenis = 'expense';
  }

  // 2. Extract Nominal
  let nominal = 0;
  const tokens = lower.split(/[\s,]+/);

  for (const token of tokens) {
    // Check if token represents amount (e.g. 25000, 25k, 25rb, 5jt, rp25000)
    const norm = normalizeIndonesianAmount(token);
    if (norm > 0) {
      nominal = norm;
      break;
    }
  }

  // If not matched by tokens, regex search for numbers
  if (nominal === 0) {
    const numMatch = lower.match(/(?:rp\.?\s*)?(\d+(?:[.,]\d+)?\s*(?:jt|juta|rb|ribu|k)?|\d{1,3}(?:\.\d{3})+|\d+)/i);
    if (numMatch && numMatch[1]) {
      nominal = normalizeIndonesianAmount(numMatch[1]);
    }
  }

  if (!nominal || nominal <= 0) {
    throw new Error(
      'Format transaksi tidak terbaca. Contoh format yang benar:\n• "beli bakso 15rb"\n• "Pengeluaran makan 25000 dari cash"\n• "gajian 5jt"'
    );
  }

  // 3. Extract Wallet Name
  let walletName: string | undefined = undefined;
  for (const w of wallets) {
    if (lower.includes(w.name.toLowerCase())) {
      walletName = w.name;
      break;
    }
  }

  if (!walletName) {
    const commonWallets = ['cash', 'tunai', 'bca', 'mandiri', 'bri', 'bni', 'gopay', 'ovo', 'dana', 'shopeepay', 'jago'];
    for (const cw of commonWallets) {
      if (lower.includes(cw)) {
        walletName = cw === 'cash' || cw === 'tunai' ? 'Cash' : cw.toUpperCase();
        break;
      }
    }
  }

  // 4. Extract Category
  let kategori = jenis === 'income' ? 'Gaji' : 'Makanan';
  for (const cat of categories) {
    if (lower.includes(cat.name.toLowerCase())) {
      kategori = cat.name;
      break;
    }
  }

  if (kategori === (jenis === 'income' ? 'Gaji' : 'Makanan')) {
    if (
      lower.includes('makan') ||
      lower.includes('bakso') ||
      lower.includes('kopi') ||
      lower.includes('nasi') ||
      lower.includes('bento') ||
      lower.includes('resto') ||
      lower.includes('ayam') ||
      lower.includes('burger')
    ) {
      kategori = 'Makanan';
    } else if (
      lower.includes('bensin') ||
      lower.includes('ojol') ||
      lower.includes('grab') ||
      lower.includes('gojek') ||
      lower.includes('parkir') ||
      lower.includes('tol') ||
      lower.includes('transport')
    ) {
      kategori = 'Transport';
    } else if (
      lower.includes('listrik') ||
      lower.includes('pln') ||
      lower.includes('wifi') ||
      lower.includes('pulsa') ||
      lower.includes('air') ||
      lower.includes('tagihan')
    ) {
      kategori = 'Tagihan';
    } else if (
      lower.includes('baju') ||
      lower.includes('sepatu') ||
      lower.includes('indomaret') ||
      lower.includes('alfamart') ||
      lower.includes('belanja') ||
      lower.includes('beli')
    ) {
      kategori = 'Belanja';
    }
  }

  // 5. Clean Note / Description
  let catatan = clean
    .replace(/^pengeluaran\s*/i, '')
    .replace(/^pemasukan\s*/i, '')
    .replace(/\b(?:dari|pakai|lewat|ke)\s+[a-z0-9_-]+/gi, '')
    .trim();

  if (!catatan || /^\d+$/.test(catatan)) {
    catatan = clean;
  }

  return {
    jenis,
    nominal,
    kategori,
    catatan,
    wallet_name: walletName,
  };
}

/**
 * Parses user natural language message into structured transaction data using AI with rule fallback
 */
export async function parseNaturalLanguageTransaction(
  text: string,
  categories: Array<{ name: string; type: string; emoji: string }> = [],
  wallets: Array<{ name: string }> = [],
  userId?: string
): Promise<ParsedTransactionResult> {
  const categoryListStr = categories.map(c => `${c.emoji} ${c.name} (${c.type})`).join(', ');
  const walletListStr = wallets.map(w => w.name).join(', ');

  const systemPrompt = `Anda adalah parser transaksi keuangan cerdas untuk aplikasi fintech Indonesia "TataDana".
Tugas Anda adalah membaca pesan chat pengguna (Bahasa Indonesia) dan mengekstrak transaksi keuangan ke dalam format JSON yang tepat.

ATURAN PARSING:
1. "jenis": harus salah satu dari ["expense", "income", "transfer"].
   - "beli", "bayar", "makan", "keluar", "ngopi", "belanja", "pengeluaran" -> "expense"
   - "gaji", "gajian", "dapat", "transfer masuk", "terima", "bonus", "pemasukan" -> "income"
   - "transfer dari Cash ke BCA", "pindah dana" -> "transfer"
2. "nominal": angka bulat (integer) Rupiah.
   Format Indonesia yang wajib ditangani:
   - "15rb" / "15ribu" = 15000
   - "1.5jt" / "1,5jt" = 1500000
   - "500k" = 500000
   - "50rb" = 50000
   - "2.5jt" = 2500000
3. "kategori": nama kategori yang paling cocok dari daftar kategori user: [${categoryListStr || 'Makanan, Transport, Tagihan, Belanja, Hiburan, Kesehatan, Gaji, Freelance'}].
   Jika tidak ada yang persis sama, pilih yang paling mendekati atau "Lainnya".
4. "catatan": rincian transaksi (misal: "beli bakso urat", "makan siang", "gaji bulanan PT ABC").
5. "wallet_name": nama dompet jika disebutkan oleh user [${walletListStr || 'Cash, BCA, Mandiri, GoPay, OVO'}], jika tidak ada biarkan null.

OUTPUT WAJIB JSON VALID TANPA MARKDOWN BACKTICKS:
{
  "isValid": true | false,
  "jenis": "expense" | "income" | "transfer",
  "nominal": 15000,
  "kategori": "Makanan",
  "catatan": "beli bakso",
  "wallet_name": "Cash",
  "errorMessage": "Pesan error jika isValid = false"
}`;

  try {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: text },
    ];

    const response = await executeAICompletion(messages, {
      response_format: 'json',
      action_type: 'parse_text',
      user_id: userId,
    });

    let cleanText = response.text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(cleanText);

    if (parsed.isValid && parsed.nominal && parsed.nominal > 0) {
      return {
        jenis: parsed.jenis || 'expense',
        nominal: normalizeIndonesianAmount(parsed.nominal),
        kategori: parsed.kategori || 'Lainnya',
        catatan: parsed.catatan || text,
        wallet_name: parsed.wallet_name,
      };
    }
  } catch (aiErr) {
    // If AI fails or throws, smoothly fall back to our linguistic rules
  }

  // Fallback to intelligent rule-based parsing
  return parseNaturalLanguageFallback(text, categories, wallets);
}
