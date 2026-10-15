/**
 * TataDana Admin Authentication, Multi-Wallet, & AI Financial Engine
 * Authorized Admin:
 * - Email: youknowzhia@gmail.com
 * - Username: admindana
 */

export const ADMIN_EMAIL = 'youknowzhia@gmail.com';
export const ADMIN_USERNAME = 'admindana';

export interface AdminProfile {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl: string;
  bio: string;
  lastLogin: string;
}

export const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  name: 'Zhia (Superadmin)',
  username: ADMIN_USERNAME,
  email: ADMIN_EMAIL,
  phone: '+6281234567890',
  role: 'SUPERADMIN',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  bio: 'Lead System Architect & Chief Financial Controller at TataDana SaaS.',
  lastLogin: new Date().toISOString(),
};

export interface AdminWallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'reserve';
  balance: number;
  accountNumber?: string;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export const DEFAULT_ADMIN_WALLETS: AdminWallet[] = [
  {
    id: 'wallet-kas',
    name: 'Kas Operasional Admin',
    type: 'cash',
    balance: 15000000,
    color: '#F97316',
    icon: 'Banknote',
    isDefault: true,
  },
  {
    id: 'wallet-bca',
    name: 'Rekening Bisnis BCA',
    type: 'bank',
    balance: 50000000,
    accountNumber: '8830-1928-11',
    color: '#3B82F6',
    icon: 'Building2',
  },
  {
    id: 'wallet-cadangan',
    name: 'Dana Cadangan & Server',
    type: 'reserve',
    balance: 20000000,
    color: '#8B5CF6',
    icon: 'ShieldCheck',
  },
];

export interface AdminTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  category: string;
  walletId: string;
  walletName: string;
  date: string;
  source: 'ai_bot' | 'manual';
}

export const DEFAULT_ADMIN_TRANSACTIONS: AdminTransaction[] = [
  {
    id: 'tx-init-1',
    description: 'Penerimaan Langganan Pro Lifetime Batch 1',
    amount: 14850000,
    type: 'income',
    category: 'Pendapatan Pro',
    walletId: 'wallet-bca',
    walletName: 'Rekening Bisnis BCA',
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    source: 'manual',
  },
  {
    id: 'tx-init-2',
    description: 'Pembayaran Cloud Infrastructure & Supabase',
    amount: 1250000,
    type: 'expense',
    category: 'Server & Infra',
    walletId: 'wallet-bca',
    walletName: 'Rekening Bisnis BCA',
    date: new Date(Date.now() - 3600000 * 12).toISOString(),
    source: 'manual',
  },
  {
    id: 'tx-init-3',
    description: 'Konsumsi API Gemini Flash & Whisper OpenAI',
    amount: 845000,
    type: 'expense',
    category: 'AI Token',
    walletId: 'wallet-kas',
    walletName: 'Kas Operasional Admin',
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    source: 'manual',
  },
];

const STORAGE_KEYS = {
  ADMIN_SESSION: 'tatadana_admin_session',
  ADMIN_PROFILE: 'tatadana_admin_profile',
  ADMIN_WALLETS: 'tatadana_admin_wallets',
  ADMIN_TRANSACTIONS: 'tatadana_admin_transactions',
};

// Format Rupiah Helper
export function formatRupiahAdmin(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const session = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) || sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
  if (!session) return false;
  try {
    const data = JSON.parse(session);
    const validEmail = data.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
    const validUsername = data.username?.toLowerCase().trim() === ADMIN_USERNAME.toLowerCase();
    return validEmail && validUsername && !!data.token;
  } catch {
    return false;
  }
}

export function getAdminProfile(): AdminProfile {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PROFILE;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_PROFILE);
    if (stored) {
      return { ...DEFAULT_ADMIN_PROFILE, ...JSON.parse(stored) };
    }
  } catch (err) {
    console.error('Failed to load admin profile:', err);
  }
  return DEFAULT_ADMIN_PROFILE;
}

export function saveAdminProfile(profile: Partial<AdminProfile>): AdminProfile {
  const current = getAdminProfile();
  const updated: AdminProfile = {
    ...current,
    ...profile,
    email: ADMIN_EMAIL, // ensure email remains the official admin email
    username: ADMIN_USERNAME, // ensure username remains the official admin username
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PROFILE, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('tatadana_admin_profile_updated', { detail: updated }));
  }
  return updated;
}

export function adminLogin(
  email: string,
  username: string,
  pass: string,
  rememberMe = true
): { ok: boolean; error?: string } {
  if (!email || !username) {
    return {
      ok: false,
      error: 'Harap masukkan alamat email dan nama pengguna admin secara lengkap.',
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim().toLowerCase();

  // Strict check: both email and username must match exactly
  const isEmailValid = cleanEmail === ADMIN_EMAIL.toLowerCase();
  const isUsernameValid = cleanUsername === ADMIN_USERNAME.toLowerCase();

  if (!isEmailValid || !isUsernameValid) {
    return {
      ok: false,
      error: `Akses Ditolak! Kredensial tidak valid. Hanya email ${ADMIN_EMAIL} dan nama pengguna "${ADMIN_USERNAME}" yang diizinkan masuk. Jawaban lain ditolak.`,
    };
  }

  // Password check (simple pass check for seamless testing)
  if (!pass || pass.length < 4) {
    return { ok: false, error: 'Kata sandi admin minimal 4 karakter.' };
  }

  const sessionData = {
    email: ADMIN_EMAIL,
    username: ADMIN_USERNAME,
    token: `admin_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    role: 'SUPERADMIN',
    loginTime: new Date().toISOString(),
  };

  const str = JSON.stringify(sessionData);
  if (typeof window !== 'undefined') {
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, str);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, str);
    }
    saveAdminProfile({ lastLogin: new Date().toISOString() });
  }

  return { ok: true };
}

export function adminLogout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    window.location.href = '/admin/login';
  }
}

// ----------------------------------------------------
// WALLETS & TRANSACTIONS MANAGEMENT
// ----------------------------------------------------

export function getAdminWallets(): AdminWallet[] {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_WALLETS;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_WALLETS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to load admin wallets:', err);
  }
  // Initialize default
  localStorage.setItem(STORAGE_KEYS.ADMIN_WALLETS, JSON.stringify(DEFAULT_ADMIN_WALLETS));
  return DEFAULT_ADMIN_WALLETS;
}

export function saveAdminWallets(wallets: AdminWallet[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ADMIN_WALLETS, JSON.stringify(wallets));
    window.dispatchEvent(new CustomEvent('tatadana_admin_wallets_updated', { detail: wallets }));
  }
}

export function getAdminTransactions(): AdminTransaction[] {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_TRANSACTIONS;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_TRANSACTIONS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to load admin transactions:', err);
  }
  localStorage.setItem(STORAGE_KEYS.ADMIN_TRANSACTIONS, JSON.stringify(DEFAULT_ADMIN_TRANSACTIONS));
  return DEFAULT_ADMIN_TRANSACTIONS;
}

export function saveAdminTransactions(txs: AdminTransaction[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ADMIN_TRANSACTIONS, JSON.stringify(txs));
    window.dispatchEvent(new CustomEvent('tatadana_admin_transactions_updated', { detail: txs }));
  }
}

// ----------------------------------------------------
// AI FINANCIAL CALCULATION & WALLET SYNC ENGINE
// ----------------------------------------------------

export function parseIndonesianNominal(text: string): number | null {
  const clean = text.toLowerCase();

  // Match expressions like "50rb", "50k", "50ribu", "1.5jt", "2,5 juta", "50000", "Rp 50.000"
  // 1. Million (jt / juta)
  const jtMatch = clean.match(/([\d]+(?:[.,]\d+)?)\s*(?:jt|juta)/);
  if (jtMatch) {
    const val = parseFloat(jtMatch[1].replace(',', '.'));
    return Math.round(val * 1000000);
  }

  // 2. Thousand (rb / k / ribu)
  const rbMatch = clean.match(/([\d]+(?:[.,]\d+)?)\s*(?:rb|k|ribu)/);
  if (rbMatch) {
    const val = parseFloat(rbMatch[1].replace(',', '.'));
    return Math.round(val * 1000);
  }

  // 3. Raw number with optional dots: "rp 50.000" or "50000"
  const rawMatch = clean.match(/(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+|\d+)/);
  if (rawMatch) {
    const rawDigits = rawMatch[1].replace(/\./g, '');
    const num = parseInt(rawDigits, 10);
    if (!isNaN(num) && num > 0) return num;
  }

  return null;
}

export function processAdminAITransaction(input: string): {
  success: boolean;
  reply: string;
  transaction?: AdminTransaction;
  updatedWallets?: AdminWallet[];
} {
  const text = input.trim();
  const lower = text.toLowerCase();

  // 1. Check if user is asking for balance check
  if (
    lower.includes('cek saldo') ||
    lower.includes('berapa saldo') ||
    lower.includes('sisa saldo') ||
    lower.includes('keuangan admin') ||
    lower.includes('lihat dompet') ||
    lower.includes('/saldo')
  ) {
    const wallets = getAdminWallets();
    const total = wallets.reduce((acc, w) => acc + w.balance, 0);

    let reply = `📊 **Status Saldo Dompet Admin TataDana Saat Ini:**\n\n`;
    wallets.forEach((w) => {
      reply += `• **${w.name}**: ${formatRupiahAdmin(w.balance)}\n`;
    });
    reply += `\n💰 **Total Keseluruhan Saldo Admin**: **${formatRupiahAdmin(total)}**`;

    return { success: true, reply };
  }

  // 2. Extract nominal
  const amount = parseIndonesianNominal(text);
  if (!amount) {
    return {
      success: false,
      reply: `⚠️ Saya mengerti Anda ingin mencatat keuangan, namun saya belum menemukan nominal rupiah yang valid pada perintah:\n*"${text}"*\n\n💡 *Contoh format yang didukung:*\n• *"bayar uang makan 50rb"*\n• *"beli token listrik 100k dari kas"*\n• *"terima pembayaran sponsor 2.5jt ke bca"*\n• *"cek saldo admin"*`,
    };
  }

  // 3. Determine transaction type (expense vs income)
  const isIncome =
    lower.includes('terima') ||
    lower.includes('dapat') ||
    lower.includes('pemasukan') ||
    lower.includes('masuk') ||
    lower.includes('pendapatan') ||
    lower.includes('gajian') ||
    lower.includes('topup') ||
    lower.includes('top up') ||
    lower.includes('tambah saldo');

  const type: 'income' | 'expense' = isIncome ? 'income' : 'expense';

  // 4. Identify wallet to deduct/add
  const wallets = getAdminWallets();
  let targetWallet = wallets.find((w) => {
    const n = w.name.toLowerCase();
    if (lower.includes('bca') && n.includes('bca')) return true;
    if (lower.includes('cadangan') && n.includes('cadangan')) return true;
    if (lower.includes('kas') && n.includes('kas')) return true;
    return false;
  });

  if (!targetWallet) {
    // Default to the designated default wallet or first wallet (Kas Operasional)
    targetWallet = wallets.find((w) => w.isDefault) || wallets[0];
  }

  // 5. Categorize
  let category = 'Operasional Admin';
  if (lower.includes('makan') || lower.includes('konsumsi') || lower.includes('minum') || lower.includes('kopi') || lower.includes('makan siang')) {
    category = 'Uang Makan & Konsumsi';
  } else if (lower.includes('server') || lower.includes('hosting') || lower.includes('domain') || lower.includes('vps') || lower.includes('infra')) {
    category = 'Server & Hosting';
  } else if (lower.includes('token') || lower.includes('api') || lower.includes('gemini') || lower.includes('openai') || lower.includes('ai')) {
    category = 'Biaya API AI';
  } else if (lower.includes('bensin') || lower.includes('transport') || lower.includes('gojek') || lower.includes('grab')) {
    category = 'Transportasi';
  } else if (lower.includes('langganan') || lower.includes('pro') || lower.includes('starter') || lower.includes('revenue')) {
    category = 'Pendapatan Langganan';
  } else if (lower.includes('gaji') || lower.includes('bonus') || lower.includes('honor')) {
    category = 'Gaji & Honor';
  }

  // Clean description
  let description = text;
  if (lower.startsWith('bayar ')) description = text.substring(6);
  else if (lower.startsWith('beli ')) description = text.substring(5);
  else if (lower.startsWith('terima ')) description = text.substring(7);
  description = description.charAt(0).toUpperCase() + description.slice(1);

  // 6. Update target wallet balance
  const oldBalance = targetWallet.balance;
  let newBalance = oldBalance;

  if (type === 'expense') {
    newBalance = oldBalance - amount;
  } else {
    newBalance = oldBalance + amount;
  }

  // Update wallets array
  const updatedWallets = wallets.map((w) => (w.id === targetWallet!.id ? { ...w, balance: newBalance } : w));
  saveAdminWallets(updatedWallets);

  // 7. Record transaction
  const newTx: AdminTransaction = {
    id: `tx-adm-${Date.now()}`,
    description,
    amount,
    type,
    category,
    walletId: targetWallet.id,
    walletName: targetWallet.name,
    date: new Date().toISOString(),
    source: 'ai_bot',
  };

  const currentTxs = getAdminTransactions();
  const updatedTxs = [newTx, ...currentTxs];
  saveAdminTransactions(updatedTxs);

  // 8. Calculate total admin balance
  const totalBalance = updatedWallets.reduce((acc, w) => acc + w.balance, 0);

  // 9. Format AI Response precisely as requested
  const actionEmoji = type === 'expense' ? '💸' : '💰';
  const actionText = type === 'expense' ? 'Pengeluaran Tercatat' : 'Pemasukan Tercatat';

  const reply = `✅ **${actionText} Berhasil!**

${actionEmoji} **Nominal**: **${formatRupiahAdmin(amount)}**
🏷️ **Kategori**: ${category}
💼 **Dompet**: ${targetWallet.name}
📝 **Keterangan**: "${description}"

---
📊 **Sisa Saldo ${targetWallet.name}**: **${formatRupiahAdmin(newBalance)}**
🏦 **Total Saldo Keseluruhan Admin**: **${formatRupiahAdmin(totalBalance)}**

*(Saldo dompet dan ringkasan beranda dashboard admin telah otomatis tersinkronisasi).*`;

  return {
    success: true,
    reply,
    transaction: newTx,
    updatedWallets,
  };
}
