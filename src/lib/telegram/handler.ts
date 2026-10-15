import { createAdminClient } from '@/lib/supabase/admin';
import { getBotMe, sendTelegramMessage, downloadTelegramFile, sanitizeToken } from './bot';
import { handleBotCommand } from './commands';
import { formatExpenseReply, formatIncomeReply, formatReceiptReply } from './formatter';
import { parseNaturalLanguageTransaction } from '@/lib/ai/parser';
import { transcribeAudio } from '@/lib/ai/speech';
import { extractReceiptFromImage } from '@/lib/ai/vision';
import { generateFinancialAdvice } from '@/lib/ai/advisor';
import { Profile, Wallet, Category } from '@/lib/types';
import { getTataDanaStore } from '@/lib/store/tatadana-store';
import {
  isGreetingMessage,
  generateVariedGreeting,
  isFinancialAdviceInquiry,
  generateConversationalAdvice,
  generateFollowUpQuestion,
  getVariedExpenseClosingTip,
} from './dialog';

export interface TelegramUpdatePayload {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      first_name?: string;
      type: string;
    };
    date: number;
    text?: string;
    caption?: string;
    voice?: {
      file_id: string;
      duration: number;
      mime_type?: string;
      file_size?: number;
    };
    photo?: Array<{
      file_id: string;
      file_unique_id: string;
      width: number;
      height: number;
      file_size?: number;
    }>;
    contact?: {
      phone_number: string;
      first_name: string;
      user_id?: number;
    };
  };
}

/**
 * Normalizes Indonesian phone numbers:
 * "08123456789" -> "+628123456789"
 * "628123456789" -> "+628123456789"
 */
export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '+62' + cleaned.slice(1);
  } else if (cleaned.startsWith('62')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+62' + cleaned;
  }
  return cleaned;
}

/**
 * Central Telegram Webhook Handler
 * Processes messages, links accounts securely, validates authorizations, updates wallet balances & transactions
 */
export async function processTelegramWebhookUpdate(
  payload: TelegramUpdatePayload,
  customToken?: string
): Promise<{
  success: boolean;
  reason?: string;
  message?: string;
  replyText?: string;
  transaction?: any;
  balance?: number;
}> {
  const store = getTataDanaStore();
  const token = customToken || process.env.TELEGRAM_BOT_TOKEN || 'tatadana_shared_bot';

  const updateId = payload.update_id;
  const message = payload.message;

  if (!message || !message.chat) {
    return { success: true, reason: 'non_message_update' };
  }

  const chatId = message.chat.id;
  const text = (message.text || message.caption || '').trim();

  // 1. IDEMPOTENCY CHECK (Mencegah transaksi dobel jika Telegram retry update_id yang sama)
  if (store.isUpdateProcessed(updateId)) {
    return {
      success: true,
      reason: 'already_processed',
      message: `Update ${updateId} sudah pernah diproses sebelumnya. Melewati untuk mencegah transaksi ganda.`,
    };
  }

  // Record update_id immediately in the store
  store.recordUpdate(updateId, chatId, text);

  try {
    // 2. IDENTIFY & AUTHORIZE USER VIA TELEGRAM CHAT ID
    let profile = store.getProfileByTelegramChatId(chatId);

    // If not found in store, attempt to check Supabase if accessible
    if (!profile) {
      try {
        const supabase = createAdminClient();
        const { data: sbProf } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_chat_id', chatId)
          .maybeSingle();

        if (sbProf) {
          profile = sbProf;
        }
      } catch (sbErr) {
        // Supabase offline, fallback to local store
      }
    }

    // 2.1 ACCOUNT LINKING FLOW (If user is not linked yet)
    if (!profile) {
      if (text.startsWith('/link') || message.contact) {
        let phoneInput = '';
        if (message.contact?.phone_number) {
          phoneInput = message.contact.phone_number;
        } else {
          phoneInput = text.replace('/link', '').trim();
        }

        const normalizedPhone = normalizePhoneNumber(phoneInput);

        // Find user by registered phone number
        let matchedProfile = store.getProfileByPhoneNumber(normalizedPhone);

        if (!matchedProfile) {
          try {
            const supabase = createAdminClient();
            const { data: sbMatched } = await supabase
              .from('profiles')
              .select('*')
              .eq('phone_number', normalizedPhone)
              .maybeSingle();

            if (sbMatched) matchedProfile = sbMatched;
          } catch (e) {}
        }

        if (matchedProfile) {
          // Link this Telegram chat ID securely to the verified user profile
          const updated = store.linkTelegramChat(matchedProfile.id, chatId, message.from.username);

          try {
            const supabase = createAdminClient();
            await supabase
              .from('profiles')
              .update({
                telegram_chat_id: chatId,
                telegram_username: message.from.username || null,
                telegram_bot_status: 'connected',
              })
              .eq('id', matchedProfile.id);
          } catch (e) {}

          const welcomeMsg = `🎉 *Berhasil Terhubung ke TataDana!*\n\nHalo *${matchedProfile.full_name}*, akun TataDana Anda sekarang telah terhubung aktif dengan chat Telegram ini.\n\n✨ *Mulai Mencatat Keuangan:*\nKetik transaksi Anda secara natural kapan saja, misalnya:\n• \`Pengeluaran makan 25000 dari cash\`\n• \`beli kopi 18rb\`\n• \`gajian 5jt ke BCA\`\n• \`/saldo\` untuk melihat saldo semua dompet`;

          await sendTelegramMessage(token, chatId, welcomeMsg);
          return {
            success: true,
            reason: 'account_linked',
            message: `Akun ${matchedProfile.full_name} berhasil ditautkan ke Telegram chat ID ${chatId}.`,
            replyText: welcomeMsg,
          };
        } else {
          const notFoundMsg = `❌ *Nomor HP ${normalizedPhone} Tidak Ditemukan*\n\nNomor ini belum terdaftar di aplikasi TataDana.\nSilakan pastikan Anda memasukkan nomor HP yang sama dengan yang didaftarkan di dashboard TataDana.\n\nFormat: \`/link 081234567890\``;
          await sendTelegramMessage(token, chatId, notFoundMsg);
          return {
            success: true,
            reason: 'link_phone_not_found',
            message: `Nomor HP ${normalizedPhone} tidak terdaftar.`,
            replyText: notFoundMsg,
          };
        }
      }

      // 2.2 UNAUTHORIZED USER REJECTION (Part 4 Security)
      const unauthorizedMsg = `🔒 *Akses Ditolak: Akun Telegram Belum Terhubung*\n\nDemi keamanan akun finansial Anda, pencatatan transaksi hanya dapat dilakukan oleh pengguna TataDana yang sah.\n\n👉 *Cara Menghubungkan Akun:*\nKetik:\n\`/link 081234567890\`\n*(Gunakan nomor HP yang terdaftar di akun TataDana Anda)*\n\nAtau buka menu *Pengaturan > Telegram Bot* di dashboard TataDana untuk menghubungkan secara instan.`;

      await sendTelegramMessage(token, chatId, unauthorizedMsg);
      return {
        success: true,
        reason: 'unlinked_user',
        message: 'Akses ditolak: Chat ID belum terhubung dengan akun TataDana manapun.',
        replyText: unauthorizedMsg,
      };
    }

    // 3. HANDLE BOT COMMANDS (/start, /saldo, /bantuan, /budget, /hari ini, etc.)
    if (text.startsWith('/')) {
      const commandReply = await handleBotCommand(text, profile, token);
      await sendTelegramMessage(token, chatId, commandReply);
      return {
        success: true,
        reason: 'command_handled',
        replyText: commandReply,
      };
    }

    // 4. PLAN RESTRICTIONS (Starter Max 50 txn/month)
    if (profile.plan === 'starter' && profile.monthly_transaction_count >= 50) {
      const limitMsg = `⚠️ *Batas Transaksi Bulanan Tercapai!*
Kamu telah mencapai limit 50 transaksi bulan ini untuk paket Starter.
Pencatatan transaksi berikutnya dihentikan sementara sampai awal bulan depan.

🚀 Upgrade ke TataDana Pro (Rp99.000 Sekali Bayar):
• Transaksi & dompet tanpa batas
• Scan struk belanja via foto
• AI Financial Advisor aktif otomatis`;

      await sendTelegramMessage(token, chatId, limitMsg);
      return { success: true, reason: 'starter_limit_reached', replyText: limitMsg };
    }

    // 5. FETCH USER WALLETS & CATEGORIES
    const activeWallets = store.getWallets(profile.id);
    const activeCategories = store.getCategories(profile.id);

    // Determine default wallet
    const defaultWallet =
      activeWallets.find((w) => w.id === profile.default_wallet_id) ||
      activeWallets.find((w) => w.is_default) ||
      activeWallets[0] || {
        id: 'w_cash',
        user_id: profile.id,
        name: 'Cash',
        balance: 1450000,
        color: '#F97316',
        icon: 'wallet',
        is_default: true,
        created_at: '',
        updated_at: '',
      };

    // 5.1 GREETING & CASUAL CONVERSATION (Variatif & Cerdas)
    if (!message.photo && !message.voice && isGreetingMessage(text)) {
      const greetingReply = generateVariedGreeting(profile, activeWallets);
      await sendTelegramMessage(token, chatId, greetingReply);
      return {
        success: true,
        reason: 'conversational_greeting',
        replyText: greetingReply,
      };
    }

    // 5.2 FINANCIAL ADVICE & REVIEW INQUIRY (Tips & Tanya Keuangan)
    if (!message.photo && !message.voice && isFinancialAdviceInquiry(text)) {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const budgets = store.getBudgets(profile.id, currentMonth);
      const adviceReply = generateConversationalAdvice(profile, activeWallets, budgets);
      await sendTelegramMessage(token, chatId, adviceReply);
      return {
        success: true,
        reason: 'financial_advice',
        replyText: adviceReply,
      };
    }

    // 5.3 INCOMPLETE TRANSACTION DETECTOR (Tanya Balik Variatif)
    // If user types an action/item without specifying an amount (e.g., "beli bakso", "isi bensin", "catat")
    if (!message.photo && !message.voice && !text.match(/\d+/)) {
      const followUp = generateFollowUpQuestion(text);
      if (followUp) {
        await sendTelegramMessage(token, chatId, followUp);
        return {
          success: true,
          reason: 'follow_up_question',
          replyText: followUp,
        };
      }
    }

    // 6. PHOTO RECEIPT OCR (Pro only)
    if (message.photo && message.photo.length > 0) {
      if (profile.plan !== 'pro') {
        const proMsg = `📸 *Fitur Foto Struk Khusus Paket Pro!*
Pencatatan dari foto nota / struk belanja dengan AI OCR hanya tersedia untuk pengguna *TataDana Pro*.
Silakan upgrade di dashboard TataDana!`;
        await sendTelegramMessage(token, chatId, proMsg);
        return { success: true, reason: 'pro_feature_locked', replyText: proMsg };
      }

      await sendTelegramMessage(token, chatId, `⏳ Sedang membaca dan menganalisis struk belanjamu dengan AI Vision...`);

      const largestPhoto = message.photo[message.photo.length - 1];
      const { buffer, mimeType } = await downloadTelegramFile(token, largestPhoto.file_id);
      const base64Image = buffer.toString('base64');

      const receiptData = await extractReceiptFromImage(base64Image, mimeType, profile.id);

      const matchedCat =
        activeCategories.find((c) => c.name.toLowerCase() === receiptData.kategori_utama.toLowerCase()) ||
        activeCategories[0];

      const newTx = store.addTransaction({
        user_id: profile.id,
        wallet_id: defaultWallet.id,
        category_id: matchedCat?.id || null,
        type: 'expense',
        amount: receiptData.total_amount,
        description: `Belanja di ${receiptData.merchant_name}`,
        has_receipt_items: receiptData.items.length > 0,
        source: 'telegram_photo',
        transaction_time: new Date().toISOString(),
      });

      const updatedWallet = store.getWallet(profile.id, defaultWallet.id);

      const replyMsg = formatReceiptReply({
        merchantName: receiptData.merchant_name,
        totalAmount: receiptData.total_amount,
        walletName: defaultWallet.name,
        newBalance: updatedWallet ? updatedWallet.balance : defaultWallet.balance - receiptData.total_amount,
        items: receiptData.items,
      });

      await sendTelegramMessage(token, chatId, replyMsg);
      return {
        success: true,
        reason: 'receipt_recorded',
        transaction: newTx,
        balance: updatedWallet?.balance,
        replyText: replyMsg,
      };
    }

    // 7. VOICE NOTE TRANSCRIPTION
    let transcriptText = '';
    let parsedInputText = text;

    if (message.voice) {
      await sendTelegramMessage(token, chatId, `🎙️ Sedang mendengarkan dan mentranskrip voice note kamu...`);
      const { buffer, mimeType } = await downloadTelegramFile(token, message.voice.file_id);
      const audioBase64 = buffer.toString('base64');

      transcriptText = await transcribeAudio(audioBase64, mimeType, message.voice.duration, profile.id);
      parsedInputText = transcriptText;
    }

    // 8. PARSE TRANSACTION WITH AI & INDONESIAN LINGUISTIC RULES
    const parsed = await parseNaturalLanguageTransaction(
      parsedInputText,
      activeCategories,
      activeWallets,
      profile.id
    );

    // Match Target Wallet: e.g. "dari cash" -> Cash, "dari bca" -> BCA
    const targetWallet =
      (parsed.wallet_name ? store.getWallet(profile.id, parsed.wallet_name) : undefined) ||
      defaultWallet;

    // Match Category: e.g. "makan" -> Makanan
    let matchedCat =
      activeCategories.find((c) => c.name.toLowerCase() === parsed.kategori.toLowerCase()) ||
      activeCategories.find((c) => c.name.toLowerCase().includes(parsed.kategori.toLowerCase())) ||
      activeCategories.find((c) => c.type === parsed.jenis) ||
      activeCategories[0];

    // 9. RECORD TRANSACTION & DEDUCT/ADD WALLET BALANCE IN STORE
    const newTx = store.addTransaction({
      user_id: profile.id,
      wallet_id: targetWallet.id,
      category_id: matchedCat?.id || null,
      type: parsed.jenis,
      amount: parsed.nominal,
      description: parsed.catatan || text,
      source: message.voice ? 'telegram_voice' : 'telegram_text',
      transaction_time: new Date().toISOString(),
      has_receipt_items: false,
    });

    // Also attempt asynchronous mirror to Supabase if connected
    try {
      const supabase = createAdminClient();
      await supabase.from('transactions').insert([
        {
          user_id: profile.id,
          wallet_id: targetWallet.id,
          category_id: matchedCat?.id || null,
          type: parsed.jenis,
          amount: parsed.nominal,
          description: parsed.catatan || text,
          source: message.voice ? 'telegram_voice' : 'telegram_text',
        },
      ]);
      const newBal = parsed.jenis === 'expense' ? targetWallet.balance - parsed.nominal : targetWallet.balance + parsed.nominal;
      await supabase.from('wallets').update({ balance: newBal }).eq('id', targetWallet.id);
    } catch (e) {
      // Local store has authoritative state
    }

    // 10. GET UPDATED WALLET BALANCE & BUDGET STATUS
    const updatedWallet = store.getWallet(profile.id, targetWallet.id);
    const newBalance = updatedWallet ? updatedWallet.balance : targetWallet.balance;

    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    const budgets = store.getBudgets(profile.id, currentMonth);
    const matchedBudget = budgets.find((b) => b.category_id === matchedCat?.id);

    const budgetTotal = matchedBudget ? matchedBudget.amount : 0;
    const budgetSpent = matchedBudget ? matchedBudget.spent_amount || 0 : 0;

    // 11. FORMAT STANDARDIZED BOT REPLY
    const closingTip = getVariedExpenseClosingTip(matchedCat?.name || parsed.kategori, targetWallet.name, newBalance);

    let replyMessage = '';
    if (parsed.jenis === 'expense') {
      replyMessage = formatExpenseReply({
        amount: parsed.nominal,
        categoryName: matchedCat?.name || parsed.kategori,
        categoryEmoji: matchedCat?.emoji || '💸',
        walletName: targetWallet.name,
        note: parsed.catatan || text,
        remainingBalance: newBalance,
        budgetTotal,
        budgetSpent,
        transcript: transcriptText || undefined,
        followUpPrompt: closingTip,
      });
    } else {
      replyMessage = formatIncomeReply({
        amount: parsed.nominal,
        walletName: targetWallet.name,
        newBalance: newBalance,
        categoryName: matchedCat?.name || 'Pemasukan',
        note: parsed.catatan || text,
        transcript: transcriptText || undefined,
      });
    }

    await sendTelegramMessage(token, chatId, replyMessage);

    // 12. PROACTIVE FINANCIAL ADVISOR CHECK (Pro only)
    if (profile.plan === 'pro' && parsed.jenis === 'expense' && budgetTotal > 0) {
      const pctSpent = Math.round((budgetSpent / budgetTotal) * 100);
      const isLargeTx = parsed.nominal >= budgetTotal * 0.2;

      if (pctSpent >= 80 || isLargeTx) {
        const advice = await generateFinancialAdvice(
          {
            userName: profile.full_name || 'Teman',
            triggerReason: isLargeTx ? 'large_transaction_budget' : 'spending_80_percent_income',
            categoryName: matchedCat?.name,
            amount: parsed.nominal,
            budgetAmount: budgetTotal,
            spentAmount: budgetSpent,
          },
          profile.id
        );

        await sendTelegramMessage(token, chatId, advice);
      }
    }

    return {
      success: true,
      reason: 'transaction_recorded',
      transaction: newTx,
      balance: newBalance,
      replyText: replyMessage,
    };
  } catch (err: any) {
    const safeError = sanitizeToken(err?.message || 'Maaf, terjadi kesalahan saat memproses transaksi.');
    await sendTelegramMessage(token, chatId, `⚠️ ${safeError}`);
    return {
      success: false,
      reason: 'error',
      message: safeError,
    };
  }
}
