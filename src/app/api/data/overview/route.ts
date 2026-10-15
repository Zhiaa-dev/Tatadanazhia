import { NextResponse } from 'next/server';
import { getTataDanaStore } from '@/lib/store/tatadana-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const store = getTataDanaStore();
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');
    const requestedEmail = searchParams.get('email');

    let profile;
    if (requestedUserId || requestedEmail) {
      profile = store.getProfileByIdOrEmail(requestedUserId || requestedEmail || undefined);
    } else {
      const all = store.getAllProfiles();
      profile = all[all.length - 1] || all[0];
    }

    const userId = profile?.id || 'usr_budi_01';

    let wallets = store.getWallets(userId);
    let transactions = store.getTransactions(userId);
    let categories = store.getCategories(userId);
    let budgets = store.getBudgets(userId);

    // If a brand new user doesn't have custom wallets/categories, seed them or fallback safely
    if (!wallets || wallets.length === 0) {
      wallets = store.getWallets('usr_budi_01');
    }
    if (!categories || categories.length === 0) {
      categories = store.getCategories('usr_budi_01');
    }
    if (!budgets || budgets.length === 0) {
      budgets = store.getBudgets('usr_budi_01');
    }

    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalBudgetSpent = budgets.reduce((sum, b) => sum + Number(b.spent_amount || 0), 0);
    const remainingBudget = Math.max(0, totalBudget - totalBudgetSpent);

    return NextResponse.json({
      ok: true,
      user_id: userId,
      user_name: profile?.full_name || 'Budi Santoso',
      totalBalance,
      totalIncome,
      totalExpense,
      totalBudget,
      totalBudgetSpent,
      remainingBudget,
      wallets,
      recentTransactions: transactions.slice(0, 10),
      budgets,
      categories,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
