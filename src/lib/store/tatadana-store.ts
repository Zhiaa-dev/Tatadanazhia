import fs from 'fs';
import path from 'path';
import { Profile, Wallet, Category, Transaction, Budget } from '@/lib/types';

export interface TelegramUpdateRecord {
  update_id: number;
  processed_at: string;
  chat_id: number;
  text?: string;
  status: 'processed' | 'skipped' | 'failed';
}

export interface StoreData {
  profiles: Profile[];
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  telegramUpdates: TelegramUpdateRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'tatadana_store.json');

function getDefaultData(): StoreData {
  const defaultProfile: Profile = {
    id: 'usr_budi_01',
    full_name: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    phone_number: '+6281234567890',
    phone_verified: true,
    telegram_chat_id: null, // Initialized unlinked, will be linked via /link or Settings
    telegram_username: null,
    telegram_bot_status: 'disconnected',
    plan: 'pro',
    default_currency: 'IDR',
    default_wallet_id: 'w_cash',
    is_admin: true,
    reminder_enabled: true,
    reminder_frequency: 1,
    reminder_time_1: '12:00:00',
    reminder_time_2: '20:00:00',
    monthly_transaction_count: 4,
    monthly_transaction_period: new Date().toISOString().slice(0, 7) + '-01',
    onboarding_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: new Date().toISOString(),
  };

  const defaultWallets: Wallet[] = [
    {
      id: 'w_cash',
      user_id: 'usr_budi_01',
      name: 'Cash',
      balance: 1450000,
      color: '#F97316',
      icon: 'wallet',
      is_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'w_bca',
      user_id: 'usr_budi_01',
      name: 'BCA',
      balance: 8750000,
      color: '#3B82F6',
      icon: 'credit-card',
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'w_gopay',
      user_id: 'usr_budi_01',
      name: 'GoPay',
      balance: 320000,
      color: '#10B981',
      icon: 'smartphone',
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const defaultCategories: Category[] = [
    { id: 'cat_makanan', user_id: 'usr_budi_01', name: 'Makanan', emoji: '🍜', type: 'expense', color: '#F97316', is_default: true, created_at: '' },
    { id: 'cat_transport', user_id: 'usr_budi_01', name: 'Transport', emoji: '🚗', type: 'expense', color: '#3B82F6', is_default: true, created_at: '' },
    { id: 'cat_tagihan', user_id: 'usr_budi_01', name: 'Tagihan', emoji: '🏠', type: 'expense', color: '#EF4444', is_default: true, created_at: '' },
    { id: 'cat_belanja', user_id: 'usr_budi_01', name: 'Belanja', emoji: '👕', type: 'expense', color: '#8B5CF6', is_default: true, created_at: '' },
    { id: 'cat_gaji', user_id: 'usr_budi_01', name: 'Gaji', emoji: '💰', type: 'income', color: '#10B981', is_default: true, created_at: '' },
    { id: 'cat_freelance', user_id: 'usr_budi_01', name: 'Freelance', emoji: '💻', type: 'income', color: '#06B6D4', is_default: true, created_at: '' },
  ];

  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
  const defaultBudgets: Budget[] = [
    {
      id: 'b_makanan',
      user_id: 'usr_budi_01',
      category_id: 'cat_makanan',
      month: currentMonth,
      amount: 1500000,
      alert_80_sent: false,
      alert_100_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      spent_amount: 840000,
    },
    {
      id: 'b_belanja',
      user_id: 'usr_budi_01',
      category_id: 'cat_belanja',
      month: currentMonth,
      amount: 1000000,
      alert_80_sent: false,
      alert_100_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      spent_amount: 450000,
    },
    {
      id: 'b_tagihan',
      user_id: 'usr_budi_01',
      category_id: 'cat_tagihan',
      month: currentMonth,
      amount: 800000,
      alert_80_sent: false,
      alert_100_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      spent_amount: 550000,
    },
  ];

  const defaultTransactions: Transaction[] = [
    {
      id: 'tx_init_1',
      user_id: 'usr_budi_01',
      wallet_id: 'w_cash',
      category_id: 'cat_makanan',
      type: 'expense',
      amount: 25000,
      description: 'Nasi Goreng Spesial',
      source: 'web',
      transaction_time: new Date(Date.now() - 3600000 * 2).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      has_receipt_items: false,
    },
    {
      id: 'tx_init_2',
      user_id: 'usr_budi_01',
      wallet_id: 'w_bca',
      category_id: 'cat_gaji',
      type: 'income',
      amount: 8500000,
      description: 'Gaji Bulanan',
      source: 'web',
      transaction_time: new Date(Date.now() - 86400000 * 3).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      has_receipt_items: false,
    },
  ];

  return {
    profiles: [defaultProfile],
    wallets: defaultWallets,
    categories: defaultCategories,
    transactions: defaultTransactions,
    budgets: defaultBudgets,
    telegramUpdates: [],
  };
}

class TataDanaStore {
  private data: StoreData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): StoreData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const fileContent = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        return {
          ...getDefaultData(),
          ...parsed,
        };
      }
    } catch (e) {
      console.warn('Store load warning, initializing defaults:', e);
    }

    const defaultData = getDefaultData();
    this.persist(defaultData);
    return defaultData;
  }

  private persist(dataToSave?: StoreData) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist TataDana store:', e);
    }
  }

  private ensureFresh() {
    this.data = this.loadData();
  }

  // Idempotency check: has this update_id already been processed?
  public isUpdateProcessed(updateId: number): boolean {
    this.ensureFresh();
    return this.data.telegramUpdates.some((u) => u.update_id === updateId);
  }

  public recordUpdate(updateId: number, chatId: number, text?: string) {
    this.ensureFresh();
    if (!this.data.telegramUpdates.some((u) => u.update_id === updateId)) {
      this.data.telegramUpdates.push({
        update_id: updateId,
        chat_id: chatId,
        text,
        processed_at: new Date().toISOString(),
        status: 'processed',
      });
      this.persist();
    }
  }

  // Get all user profiles (for Admin & User Sync)
  public getAllProfiles(): Profile[] {
    this.ensureFresh();
    return this.data.profiles;
  }

  // Get user profile by ID or Email
  public getProfileByIdOrEmail(identifier?: string): Profile | undefined {
    this.ensureFresh();
    if (!identifier) return this.data.profiles[0];
    const clean = identifier.trim().toLowerCase();
    return (
      this.data.profiles.find((p) => p.id === identifier) ||
      this.data.profiles.find((p) => p.email && p.email.toLowerCase() === clean) ||
      this.data.profiles.find((p) => p.full_name && p.full_name.toLowerCase() === clean) ||
      this.data.profiles[0]
    );
  }

  // Get user profile strictly by email
  public getProfileByEmail(email: string): Profile | undefined {
    this.ensureFresh();
    const clean = email.trim().toLowerCase();
    return this.data.profiles.find((p) => p.email && p.email.toLowerCase() === clean);
  }

  // Register or Login User with automatic wallet & category provisioning
  public registerOrLoginUser(payload: {
    full_name?: string;
    email: string;
    phone_number?: string;
    plan?: PlanType;
    isLogin?: boolean;
    avatar_url?: string;
  }): Profile {
    this.ensureFresh();
    const cleanEmail = payload.email.trim().toLowerCase();
    let profile = this.data.profiles.find((p) => p.email && p.email.toLowerCase() === cleanEmail);

    if (profile) {
      // Existing user: Update name/phone/login timestamp
      if (payload.full_name && payload.full_name.trim()) {
        profile.full_name = payload.full_name.trim();
      }
      if (payload.phone_number && payload.phone_number.trim()) {
        profile.phone_number = payload.phone_number.trim();
      }
      if (payload.avatar_url) {
        profile.avatar_url = payload.avatar_url;
      }
      profile.last_login_at = new Date().toISOString();
      profile.updated_at = new Date().toISOString();
      this.persist();
      return profile;
    }

    // New user registration
    const newUserId = 'usr_' + Date.now();
    const resolvedName =
      payload.full_name?.trim() ||
      cleanEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const newProfile: Profile = {
      id: newUserId,
      full_name: resolvedName,
      email: cleanEmail,
      avatar_url: payload.avatar_url,
      phone_number: payload.phone_number?.trim() || '+62812' + Math.floor(10000000 + Math.random() * 90000000),
      phone_verified: true,
      telegram_chat_id: null,
      telegram_username: null,
      telegram_bot_status: 'disconnected',
      plan: payload.plan || 'starter',
      default_currency: 'IDR',
      default_wallet_id: `w_cash_${newUserId}`,
      is_admin: false,
      reminder_enabled: true,
      reminder_frequency: 1,
      reminder_time_1: '12:00:00',
      reminder_time_2: '20:00:00',
      monthly_transaction_count: 0,
      monthly_transaction_period: new Date().toISOString().slice(0, 7) + '-01',
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    };

    // Initialize default wallets for new user
    const userWallets: Wallet[] = [
      {
        id: `w_cash_${newUserId}`,
        user_id: newUserId,
        name: 'Cash',
        balance: 1500000,
        color: '#F97316',
        icon: 'wallet',
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: `w_bca_${newUserId}`,
        user_id: newUserId,
        name: 'BCA',
        balance: 5000000,
        color: '#3B82F6',
        icon: 'credit-card',
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: `w_gopay_${newUserId}`,
        user_id: newUserId,
        name: 'GoPay',
        balance: 350000,
        color: '#10B981',
        icon: 'smartphone',
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Initialize default categories for new user
    const userCategories: Category[] = [
      { id: `cat_mkn_${newUserId}`, user_id: newUserId, name: 'Makanan', emoji: '🍜', type: 'expense', color: '#F97316', is_default: true, created_at: '' },
      { id: `cat_trp_${newUserId}`, user_id: newUserId, name: 'Transport', emoji: '🚗', type: 'expense', color: '#3B82F6', is_default: true, created_at: '' },
      { id: `cat_tag_${newUserId}`, user_id: newUserId, name: 'Tagihan', emoji: '🏠', type: 'expense', color: '#EF4444', is_default: true, created_at: '' },
      { id: `cat_blj_${newUserId}`, user_id: newUserId, name: 'Belanja', emoji: '👕', type: 'expense', color: '#8B5CF6', is_default: true, created_at: '' },
      { id: `cat_gji_${newUserId}`, user_id: newUserId, name: 'Gaji', emoji: '💰', type: 'income', color: '#10B981', is_default: true, created_at: '' },
    ];

    this.data.profiles.push(newProfile);
    this.data.wallets.push(...userWallets);
    this.data.categories.push(...userCategories);
    this.persist();

    return newProfile;
  }

  // Delete profile by ID
  public deleteProfile(userId: string): boolean {
    this.ensureFresh();
    const idx = this.data.profiles.findIndex((p) => p.id === userId);
    if (idx === -1) return false;
    this.data.profiles.splice(idx, 1);
    this.data.wallets = this.data.wallets.filter((w) => w.user_id !== userId);
    this.data.categories = this.data.categories.filter((c) => c.user_id !== userId);
    this.data.transactions = this.data.transactions.filter((t) => t.user_id !== userId);
    this.data.budgets = this.data.budgets.filter((b) => b.user_id !== userId);
    this.persist();
    return true;
  }

  // Get user profile by User ID
  public getProfile(userId: string): Profile | undefined {
    this.ensureFresh();
    return this.data.profiles.find((p) => p.id === userId) || this.data.profiles[0];
  }

  // Get user profile by Telegram Chat ID (Strict Authorization)
  public getProfileByTelegramChatId(chatId: number): Profile | undefined {
    this.ensureFresh();
    return this.data.profiles.find((p) => p.telegram_chat_id === chatId);
  }

  // Get user profile by Phone Number (for /link command)
  public getProfileByPhoneNumber(phone: string): Profile | undefined {
    this.ensureFresh();
    const cleanPhone = phone.replace(/[\s-]/g, '');
    return this.data.profiles.find((p) => {
      const pPhone = (p.phone_number || '').replace(/[\s-]/g, '');
      return pPhone === cleanPhone || pPhone.endsWith(cleanPhone) || cleanPhone.endsWith(pPhone);
    });
  }

  // Link a Telegram Chat ID to a User Profile
  public linkTelegramChat(userId: string, chatId: number, username?: string): Profile | null {
    this.ensureFresh();
    const profile = this.data.profiles.find((p) => p.id === userId);
    if (!profile) return null;

    profile.telegram_chat_id = chatId;
    profile.telegram_username = username || profile.telegram_username || 'TataDanaUser';
    profile.telegram_bot_status = 'connected';
    profile.updated_at = new Date().toISOString();

    this.persist();
    return profile;
  }

  // Get user wallets
  public getWallets(userId: string): Wallet[] {
    this.ensureFresh();
    return this.data.wallets.filter((w) => w.user_id === userId);
  }

  // Get wallet by ID or name
  public getWallet(userId: string, walletNameOrId: string): Wallet | undefined {
    const userWallets = this.getWallets(userId);
    const search = walletNameOrId.toLowerCase().trim();
    return (
      userWallets.find((w) => w.id === walletNameOrId) ||
      userWallets.find((w) => w.name.toLowerCase() === search) ||
      userWallets.find((w) => w.name.toLowerCase().includes(search)) ||
      userWallets.find((w) => w.is_default) ||
      userWallets[0]
    );
  }

  // Update wallet balance
  public updateWalletBalance(walletId: string, newBalance: number): Wallet | null {
    const wallet = this.data.wallets.find((w) => w.id === walletId);
    if (!wallet) return null;

    wallet.balance = newBalance;
    wallet.updated_at = new Date().toISOString();
    this.persist();
    return wallet;
  }

  // Get user categories
  public getCategories(userId: string): Category[] {
    return this.data.categories.filter((c) => c.user_id === userId);
  }

  public getCategory(userId: string, name: string): Category | undefined {
    const userCats = this.getCategories(userId);
    const search = name.toLowerCase().trim();
    return (
      userCats.find((c) => c.name.toLowerCase() === search) ||
      userCats.find((c) => c.name.toLowerCase().includes(search))
    );
  }

  // Get budgets
  public getBudgets(userId: string, month?: string): Budget[] {
    const currentMonth = month || new Date().toISOString().slice(0, 7) + '-01';
    return this.data.budgets.filter((b) => b.user_id === userId && b.month === currentMonth);
  }

  // Record a transaction
  public addTransaction(tx: Omit<Transaction, 'id' | 'created_at'>): Transaction {
    this.ensureFresh();
    const newTx: Transaction = {
      ...tx,
      id: 'tx_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      created_at: new Date().toISOString(),
    };

    // Update wallet balance
    const wallet = this.data.wallets.find((w) => w.id === tx.wallet_id);
    if (wallet) {
      if (tx.type === 'expense') {
        wallet.balance = Number(wallet.balance) - tx.amount;
      } else if (tx.type === 'income') {
        wallet.balance = Number(wallet.balance) + tx.amount;
      }
      wallet.updated_at = new Date().toISOString();
    }

    // Update budget spent amount
    if (tx.type === 'expense' && tx.category_id) {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const budget = this.data.budgets.find(
        (b) => b.user_id === tx.user_id && b.category_id === tx.category_id && b.month === currentMonth
      );
      if (budget) {
        budget.spent_amount = (Number(budget.spent_amount) || 0) + tx.amount;
        budget.updated_at = new Date().toISOString();
      }
    }

    // Increment profile monthly_transaction_count
    const profile = this.data.profiles.find((p) => p.id === tx.user_id);
    if (profile) {
      profile.monthly_transaction_count = (profile.monthly_transaction_count || 0) + 1;
      profile.updated_at = new Date().toISOString();
    }

    this.data.transactions.unshift(newTx);
    this.persist();
    return newTx;
  }

  // Get transactions
  public getTransactions(userId?: string): Transaction[] {
    this.ensureFresh();
    const txs = userId ? this.data.transactions.filter((t) => t.user_id === userId) : this.data.transactions;
    return txs.map((t) => ({
      ...t,
      wallet: this.data.wallets.find((w) => w.id === t.wallet_id),
      category: this.data.categories.find((c) => c.id === t.category_id),
    }));
  }

  // Reset/seed for test execution
  public resetToDefault() {
    this.data = getDefaultData();
    this.persist();
  }
}

// Global Singleton Store Instance
declare global {
  var __tatadanaStoreInstance: TataDanaStore | undefined;
}

export function getTataDanaStore(): TataDanaStore {
  if (
    !global.__tatadanaStoreInstance ||
    typeof (global.__tatadanaStoreInstance as any).registerOrLoginUser !== 'function' ||
    typeof (global.__tatadanaStoreInstance as any).getAllProfiles !== 'function'
  ) {
    global.__tatadanaStoreInstance = new TataDanaStore();
  }
  return global.__tatadanaStoreInstance;
}
