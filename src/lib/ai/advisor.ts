import { executeAICompletion } from './multi-provider';

export interface AdvisorTriggerContext {
  userName: string;
  triggerReason: 'category_spike' | 'spending_80_percent_income' | 'large_transaction_budget';
  categoryName?: string;
  amount?: number;
  budgetAmount?: number;
  spentAmount?: number;
  incomeAmount?: number;
}

/**
 * Generates proactive, personalized financial advice using AI
 */
export async function generateFinancialAdvice(
  context: AdvisorTriggerContext,
  userId?: string
): Promise<string> {
  let situationDescription = '';

  if (context.triggerReason === 'category_spike') {
    situationDescription = `Pengeluaran user di kategori "${context.categoryName}" melonjak lebih dari 50% dibanding minggu lalu (saat ini sudah mencapai ${context.spentAmount}).`;
  } else if (context.triggerReason === 'spending_80_percent_income') {
    situationDescription = `Total pengeluaran bulan ini (${context.spentAmount}) sudah melampaui 80% dari total pemasukan bulan ini (${context.incomeAmount}).`;
  } else if (context.triggerReason === 'large_transaction_budget') {
    situationDescription = `Transaksi barusan sebesar ${context.amount} langsung menghabiskan lebih dari 20% dari total budget bulanan kategori "${context.categoryName}" (${context.budgetAmount}).`;
  }

  const prompt = `Anda adalah "AI Financial Advisor" di aplikasi TataDana Indonesia.
Berikan peringatan yang hangat, bersahabat, namun tegas dan sangat solutif kepada user bernama ${context.userName}.

Kondisi Keuangan Saat Ini:
${situationDescription}

ATURAN FORMAT OUTPUT:
Harus persis dalam format berikut:
🤖 Financial Advisor
Hei ${context.userName}! [analisa personal yang singkat, padat, dan ramah tentang kondisi keuangannya saat ini]
💡 Saran: [1 saran spesifik dan actionable untuk mengontrol pengeluaran sebelum akhir bulan]`;

  try {
    const response = await executeAICompletion(
      [{ role: 'user', content: prompt }],
      { action_type: 'advisor', user_id: userId }
    );
    return response.text.trim();
  } catch (err) {
    // Fallback template if AI fails
    return `🤖 Financial Advisor\nHei ${context.userName}! Kami melihat pengeluaranmu di kategori ${context.categoryName || 'ini'} sedang meningkat cukup pesat.\n💡 Saran: Coba rem pengeluaran non-primer selama 3-5 hari ke depan agar arus kasmu tetap aman sampai akhir bulan ya!`;
  }
}
