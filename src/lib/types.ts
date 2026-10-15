export type PlanType = 'starter' | 'pro';

export type UserApprovalStatus = 'pending' | 'approved' | 'rejected';

export type TransactionType = 'expense' | 'income' | 'transfer';

export type TransactionSource = 'web' | 'telegram_text' | 'telegram_photo' | 'telegram_voice';

export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
  phone_number?: string;
  phone_verified: boolean;
  approval_status?: UserApprovalStatus;
  approval_notes?: string;
  approved_at?: string;
  telegram_chat_id?: number | null;
  telegram_username?: string | null;
  telegram_bot_token?: string | null;
  telegram_bot_status: 'disconnected' | 'testing' | 'connected' | 'error';
  plan: PlanType;
  plan_expires_at?: string | null;
  default_currency: string;
  default_wallet_id?: string | null;
  is_admin: boolean;
  reminder_enabled: boolean;
  reminder_frequency: 1 | 2;
  reminder_time_1: string;
  reminder_time_2: string;
  monthly_transaction_count: number;
  monthly_transaction_period: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  color: string;
  icon: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  type: 'expense' | 'income';
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  amount: number;
  alert_80_sent: boolean;
  alert_100_sent: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  spent_amount?: number;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  item_name: string;
  price: number;
  quantity: number;
  category_id?: string | null;
  category?: Category;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id?: string | null;
  destination_wallet_id?: string | null;
  type: TransactionType;
  amount: number;
  description?: string | null;
  receipt_url?: string | null;
  has_receipt_items: boolean;
  source: TransactionSource;
  transaction_time: string;
  created_at: string;
  wallet?: Wallet;
  destination_wallet?: Wallet;
  category?: Category;
  items?: TransactionItem[];
}

export interface AIProviderConfig {
  id: string;
  provider: 'gemini' | 'openai' | 'deepseek' | 'custom';
  model_name: string;
  api_key_encrypted: string;
  priority: number;
  is_active: boolean;
  mode: 'single' | 'parallel_failover';
  created_at: string;
  updated_at: string;
}

export interface AILog {
  id: string;
  user_id?: string | null;
  provider: string;
  model: string;
  action_type: 'parse_text' | 'ocr_receipt' | 'speech_to_text' | 'advisor' | 'onboarding_recommendation';
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  status: 'success' | 'failed';
  error_message?: string | null;
  created_at: string;
}

export interface ExportHistoryItem {
  id: string;
  user_id: string;
  file_name: string;
  file_format: 'pdf' | 'xlsx';
  storage_path: string;
  period_start: string;
  period_end: string;
  filter_meta?: Record<string, any>;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  plan: PlanType;
  payment_method: string;
  status: 'pending' | 'approved' | 'rejected' | 'failed' | 'settlement';
  midtrans_transaction_id?: string | null;
  proof_image_url?: string | null;
  approved_by?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  target_user_id?: string | null;
  action: string;
  details?: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
}

export interface ParsedTransactionResult {
  jenis: 'expense' | 'income' | 'transfer';
  nominal: number;
  kategori: string;
  catatan: string;
  wallet_name?: string;
  items?: Array<{
    item_name: string;
    price: number;
    quantity: number;
    kategori?: string;
  }>;
}
